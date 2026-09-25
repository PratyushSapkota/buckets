import { isRedisUnavailableError, withRedis } from "@/lib/redis";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";

type Identity = { email: string; name: string; googleUserId: string };

function whitelisted(identity: Identity) {
  const allowedEmails =
    process.env.GOOGLE_OAUTH_ALLOWED_EMAILS?.split(",").map((email) =>
      email.trim().toLowerCase(),
    ) ?? [];

  return allowedEmails.includes(identity.email.toLowerCase());
}

async function getIdentity(id_token: string): Promise<Identity | null> {
  const googleClient = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID);

  const ticket = await googleClient.verifyIdToken({
    idToken: id_token,
    audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email || !payload.name) {
    return null;
  }

  return {
    email: payload.email,
    name: payload.name,
    googleUserId: payload.sub,
  };
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing auth code" }, { status: 400 });
  }

  const { data: token } = await axios.post(
    "https://oauth2.googleapis.com/token",
    new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_OAUTH_CALLBACK_URL!,
      grant_type: "authorization_code",
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  const identity = await getIdentity(token.id_token);

  if (!identity) {
    return NextResponse.json(
      { error: "Could not get Google identity" },
      { status: 400 },
    );
  }

  if (!whitelisted(identity)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userKey = `user:${identity.googleUserId}`;
  const sessionId = crypto.randomUUID();

  try {
    const existingRefreshToken = await withRedis((redis) =>
      redis.get(userKey),
    );

    if (token.refresh_token) {
      await withRedis((redis) => redis.set(userKey, token.refresh_token));
    } else if (!existingRefreshToken) {
      return NextResponse.json(
        { error: "Missing refresh token" },
        { status: 400 },
      );
    }

    await withRedis((redis) =>
      redis.set(`session:${sessionId}`, identity.googleUserId, {
        expiration: { type: "EX", value: 60 * 60 * 24 * 30 },
      }),
    );
  } catch (error) {
    if (isRedisUnavailableError(error)) {
      return NextResponse.json(
        { error: "Sign-in is temporarily unavailable" },
        { status: 503, headers: { "Retry-After": "5" } },
      );
    }

    throw error;
  }

  const response = NextResponse.redirect(new URL("/", request.url));

  response.cookies.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

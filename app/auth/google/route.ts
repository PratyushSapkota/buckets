import {
  ensureRedisAvailable,
  isRedisUnavailableError,
} from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await ensureRedisAvailable();
  } catch (error) {
    if (isRedisUnavailableError(error)) {
      return NextResponse.json(
        { error: "Sign-in is temporarily unavailable" },
        { status: 503, headers: { "Retry-After": "5" } },
      );
    }

    throw error;
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_OAUTH_CALLBACK_URL!,
    response_type: "code",
    scope: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file",
    ].join(" "),
    prompt: "consent",
    access_type: "offline",
  });
  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
}

import { NextRequest, NextResponse } from "next/server";
import { authConfig, cookieOptions, STATE_COOKIE } from "@/auth/service";
import { loginError } from "@/auth/responses";
import { createHandshake, HANDSHAKE_TTL } from "@/redis/sessions";
export async function GET(request: NextRequest) {
  try {
    const config = authConfig();
    const { state, nonce } = await createHandshake();
    const params = new URLSearchParams({ client_id: config.clientId, redirect_uri: config.callback, response_type: "code", scope: "openid email profile", state, nonce });
    const response = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
    response.cookies.set(STATE_COOKIE, state, { ...cookieOptions(), maxAge: HANDSHAKE_TTL });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) { return loginError(request, error); }
}

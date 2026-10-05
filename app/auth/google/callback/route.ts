import { NextRequest, NextResponse } from "next/server";
import { AuthError, cookieOptions, SESSION_COOKIE, STATE_COOKIE, verifyIdentity } from "@/auth/service";
import { loginError } from "@/auth/responses";
import { consumeHandshake, createSession, deleteSession, SESSION_TTL } from "@/redis/sessions";
import { ensureWorksheet } from "@/spreadsheet/worksheet";
export async function GET(request: NextRequest) {
  try {
    const state = request.nextUrl.searchParams.get("state");
    if (!state || state !== request.cookies.get(STATE_COOKIE)?.value) throw new AuthError("state");
    const nonce = await consumeHandshake(state);
    if (!nonce) throw new AuthError("state");
    if (request.nextUrl.searchParams.has("error")) throw new AuthError("cancelled");
    const code = request.nextUrl.searchParams.get("code");
    if (!code) throw new AuthError("failed");
    const sub = await verifyIdentity(code, nonce);
    await ensureWorksheet(sub);
    await deleteSession(request.cookies.get(SESSION_COOKIE)?.value);
    const id = await createSession(sub);
    const response = NextResponse.redirect(new URL("/", request.url), 303);
    response.cookies.set(SESSION_COOKIE, id, { ...cookieOptions(), maxAge: SESSION_TTL });
    response.cookies.set(STATE_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) { return loginError(request, error); }
}

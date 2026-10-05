import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { RedisUnavailableError } from "@/redis/client";
import { AuthError, cookieOptions, STATE_COOKIE } from "./service";
import { SpreadsheetError } from "@/spreadsheet/client";
export function loginError(request: NextRequest, error: unknown) {
  const code = error instanceof RedisUnavailableError ? "unavailable" : error instanceof SpreadsheetError ? "worksheet" : error instanceof AuthError ? error.code : "failed";
  const response = NextResponse.redirect(new URL(`/login?error=${code}`, request.url), 303);
  response.cookies.set(STATE_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

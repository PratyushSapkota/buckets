import { NextRequest, NextResponse } from "next/server";
import { cookieOptions, SESSION_COOKIE, STATE_COOKIE } from "@/auth/service";
import { deleteSession } from "@/redis/sessions";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );
  }
  try {
    await deleteSession(request.cookies.get(SESSION_COOKIE)?.value);
    const response = NextResponse.redirect(new URL("/login", request.url), 303);
    for (const name of [SESSION_COOKIE, STATE_COOKIE])
      response.cookies.set(name, "", { ...cookieOptions(), maxAge: 0 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return new NextResponse(
      '<!doctype html><html lang="en"><meta charset="utf-8"><title>Logout unavailable</title><body><h1>Could not sign out</h1><p>Authentication storage is unavailable. Please retry.</p><form method="post" action="/logout"><button type="submit">Retry sign out</button></form><p><a href="/">Return home</a></p></body></html>',
      {
        status: 503,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
    );
  }
}

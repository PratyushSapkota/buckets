import { getRedis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get("session")?.value;

  if (sessionId) {
    const redis = await getRedis();
    await redis.del(`session:${sessionId}`);
  }

  const response = NextResponse.redirect(new URL("/", request.url), 303);

  response.cookies.delete("session");
  return response;
}

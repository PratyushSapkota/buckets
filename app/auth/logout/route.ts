import { isRedisUnavailableError, withRedis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get("session")?.value;

  if (sessionId) {
    try {
      await withRedis((redis) => redis.del(`session:${sessionId}`));
    } catch (error) {
      if (!isRedisUnavailableError(error)) {
        throw error;
      }

      console.error("Could not delete the Redis session during logout", error);
    }
  }

  const response = NextResponse.redirect(new URL("/", request.url), 303);

  response.cookies.delete("session");
  return response;
}

import { clearLocalChanges } from "@/feature/local/db";
import { getRedis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  await clearLocalChanges();
  const sessionId = request.cookies.get("session")?.value;
  const redis = await getRedis();

  if (sessionId) {
    try {
      await redis.del(`session:${sessionId}`);
    } catch (error) {
      console.error("Could not delete the Redis session during logout", error);
    }
  }

  const response = NextResponse.redirect(new URL("/", request.url), 303);

  response.cookies.delete("session");
  return response;
}

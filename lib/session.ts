import { cookies } from "next/headers";
import { getRedis } from "./redis";

export async function getCurrentUserId() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) {
    return null;
  }

  const redis = await getRedis();
  return await redis.get(`session:${sessionId}`);
}

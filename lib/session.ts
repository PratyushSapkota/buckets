import { cookies } from "next/headers";
import { withRedis } from "./redis";

export async function getCurrentUserId() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) return null;

  return withRedis((redis) => redis.get(`session:${sessionId}`));
}

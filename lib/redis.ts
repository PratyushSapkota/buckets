import "server-only";

import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL,
  commandOptions: {
    timeout: 3000,
  },
  disableOfflineQueue: true,
  socket: {
    connectTimeout: 3000,
    reconnectStrategy: false,
  },
});


export async function getRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
}

export async function isRedisAvailable() {
  try {
    if (!redis.isOpen) {
      await redis.connect();
    }

    await redis.ping();
    return true;
  } catch {
    return false;
  }
}

redis.on("error", (error) => {
  console.error("Redis error:", error);
});

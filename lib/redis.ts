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

redis.on("error", (error) => {
  console.error("Redis error:", error);
});

export class RedisUnavailableError extends Error {
  constructor(options?: ErrorOptions) {
    super("Redis is currently unavailable", options);
    this.name = "RedisUnavailableError";
  }
}

export function isRedisUnavailableError(
  error: unknown,
): error is RedisUnavailableError {
  return error instanceof RedisUnavailableError;
}

let connectionPromise: Promise<typeof redis> | null = null;

export async function getRedis() {
  if (redis.isReady) {
    return redis;
  }

  if (!connectionPromise) {
    // With reconnects disabled, a disconnected client should be closed. This
    // guard also recovers from any unexpected open-but-not-ready state.
    if (redis.isOpen) {
      redis.destroy();
    }

    connectionPromise = redis.connect().finally(() => {
      connectionPromise = null;
    });
  }

  try {
    return await connectionPromise;
  } catch (cause) {
    throw new RedisUnavailableError({ cause });
  }
}

export async function withRedis<T>(
  operation: (client: typeof redis) => Promise<T>,
): Promise<T> {
  try {
    const client = await getRedis();
    return await operation(client);
  } catch (cause) {
    if (isRedisUnavailableError(cause)) {
      throw cause;
    }

    throw new RedisUnavailableError({ cause });
  }
}

export async function ensureRedisAvailable() {
  await withRedis((client) => client.ping());
}

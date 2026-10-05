import "server-only";
import { createClient } from "redis";

export class RedisUnavailableError extends Error {
  constructor() { super("Authentication storage is unavailable. Please retry."); }
}
const createConnection = (url: string) => createClient({ url, socket: { connectTimeout: 5000, reconnectStrategy: false }, disableOfflineQueue: true });
type Client = ReturnType<typeof createConnection>;
const shared = globalThis as typeof globalThis & {
  bucketsRedis?: { client: Client; connecting?: Promise<unknown> };
};
export async function withRedis<T>(operation: (client: Client) => Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const url = process.env.REDIS_URL;
    if (!url || !/^rediss?:\/\//.test(url)) throw new RedisUnavailableError();
    if (!shared.bucketsRedis) {
      const client = createConnection(url);
      // Client errors can contain private connection details.
      client.on("error", () => {});
      shared.bucketsRedis = { client };
    }
    const store = shared.bucketsRedis;
    const work = async () => {
      if (!store.client.isReady) {
        store.connecting ??= store.client.connect().finally(() => { store.connecting = undefined; });
        await store.connecting;
      }
      return operation(store.client);
    };
    return await Promise.race([
      work(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          if (store.client.isOpen) store.client.destroy();
          reject(new RedisUnavailableError());
        }, 5000);
      }),
    ]);
  } catch { throw new RedisUnavailableError(); }
  finally { if (timer) clearTimeout(timer); }
}

import "server-only";
import { RedisUnavailableError, withRedis } from "@/redis/client";
import { spreadsheetClient, spreadsheetConfig, SpreadsheetError, validWorksheetId } from "./client";

// Only call with a Google sub whose identity and whitelist membership were verified.
export async function ensureWorksheet(sub: string): Promise<number> {
  try {
    if (!sub.trim()) throw new SpreadsheetError();
    const config = spreadsheetConfig();
    const cacheKey = `worksheet:${config.spreadsheetId}:${sub}`;
    const cached = await withRedis((client) => client.get(cacheKey));
    if (cached !== null && /^(0|[1-9]\d*)$/.test(cached)) {
      const id = Number(cached);
      if (validWorksheetId(id)) return id;
    }

    const sheets = spreadsheetClient(config);
    let id = await sheets.findWorksheet(sub);
    if (id === null) {
      try {
        id = await sheets.createWorksheet(sub);
      } catch {
        // Another login may have created it, or Google may have committed before a timeout.
        id = await sheets.findWorksheet(sub);
        if (id === null) throw new SpreadsheetError();
      }
    }
    await withRedis((client) => client.set(cacheKey, String(id)));
    return id;
  } catch (error) {
    if (error instanceof RedisUnavailableError) throw error;
    throw new SpreadsheetError();
  }
}

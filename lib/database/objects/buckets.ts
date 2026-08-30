import { buckets } from "@/drizzle/schema";
import { DbContext } from "../types";
import { eq } from "drizzle-orm";
export function createBucketsActions(context: DbContext) {
  return {
    async getAll() {
      return await context.drizzleClient
        .select()
        .from(buckets)
        .where(eq(buckets.userId, context.userId));
    },

    async createOne(name: string, currency: string, color: string) {
      await context.drizzleClient.insert(buckets).values({
        userId: context.userId,
        name,
        currency,
        color,
      });
    },
  };
}

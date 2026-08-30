import { accounts } from "@/drizzle/schema";
import { DbContext } from "../types";
import { eq, and } from "drizzle-orm";

export function createAccountsActions(context: DbContext) {
  return {
    async getAll() {
      return context.drizzleClient
        .select()
        .from(accounts)
        .where(eq(accounts.userId, context.userId));
    },
    async getFromBucket(bucketId: string) {
      return context.drizzleClient.select().from(accounts).where(and(
        eq(accounts.userId, context.userId),
        eq(accounts.bucketId, bucketId)
      ))
    },
    async createOne(bucketId: string, name: string) {
      await context.drizzleClient
        .insert(accounts)
        .values({ userId: context.userId, bucketId: bucketId, name: name });
    },
  };
}

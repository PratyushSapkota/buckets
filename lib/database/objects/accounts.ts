import { accounts } from "@/drizzle/schema";
import { DbContext } from "../types";
import { eq } from "drizzle-orm";

export function createAccountsActions(context: DbContext) {
  return {
    async getAll() {
      return context.drizzleClient
        .select()
        .from(accounts)
        .where(eq(accounts.userId, context.userId));
    },
  };
}

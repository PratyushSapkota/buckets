import { getUser } from "@/lib/auth/";
import { Unauthorized } from "./errors";
import { DbContext } from "./types";
import { drizzleClient } from "./client";
import { createAccountsActions } from "./objects/accounts";
import { createBucketsActions } from "./objects/buckets";
import { createCategoriesActions } from "./objects/categories";
import { createTransactionsActions } from "./objects/transactions";

export async function getDb() {
  const user = await getUser();

  if (!user) {
    throw new Unauthorized();
  }

  const context: DbContext = {
    userId: user.id,
    drizzleClient: drizzleClient,
  };

  return {
    accounts: createAccountsActions(context),
    buckets: createBucketsActions(context),
    categories: createCategoriesActions(context),
    transactions: createTransactionsActions(context),
  };
}

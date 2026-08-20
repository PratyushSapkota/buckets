import type { InferSelectModel } from "drizzle-orm";

import type {
  accounts,
  buckets,
  categories,
  transactions,
} from "@/drizzle/schema";
import { drizzleClient } from "./client";

export type Bucket = InferSelectModel<typeof buckets>;
export type Account = InferSelectModel<typeof accounts>;
export type Category = InferSelectModel<typeof categories>;
export type Transaction = InferSelectModel<typeof transactions>;

export type TransactionType = "credit" | "debit" | "transfer";

export type DbContext = {
  userId: string,
  drizzleClient: typeof drizzleClient
}

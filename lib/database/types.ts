import type { InferSelectModel } from "drizzle-orm";

import type {
  accounts,
  buckets,
  categories,
  transactions,
} from "@/drizzle/schema";

export type UserId = string;

export type Bucket = InferSelectModel<typeof buckets>;
export type Account = InferSelectModel<typeof accounts>;
export type Category = InferSelectModel<typeof categories>;
export type Transaction = InferSelectModel<typeof transactions>;

export type TransactionType = "credit" | "debit" | "transfer";

import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const transactionType = pgEnum("transaction_type", [
  "credit",
  "debit",
  "transfer",
]);

export const buckets = pgTable(
  "buckets",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    name: text("name").notNull(),
    currency: text("currency").notNull(),
    color: text("color"),
    closedAt: timestamp("closed_at", { withTimezone: true }),
  },
  (table) => [unique("buckets_id_user_id_unique").on(table.id, table.userId)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    bucketId: uuid("bucket_id").notNull(),
    name: text("name").notNull(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
  },
  (table) => [
    unique("accounts_id_user_id_unique").on(table.id, table.userId),
    foreignKey({
      columns: [table.bucketId, table.userId],
      foreignColumns: [buckets.id, buckets.userId],
      name: "accounts_bucket_owner_fk",
    }),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    name: text("name").notNull(),
    color: text("color"),
  },
  (table) => [unique("categories_id_user_id_unique").on(table.id, table.userId)],
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    description: text("description"),
    amount: integer("amount").notNull(),
    type: transactionType("type").notNull(),
    categoryId: uuid("category_id"),
    accountId: uuid("account_id").notNull(),
    transferAccountId: uuid("transfer_account_id"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }),
  },
  (table) => [
    check("transactions_amount_positive_check", sql`${table.amount} > 0`),
    check(
      "transactions_transfer_fields_check",
      sql`(
        (${table.type} = 'transfer' and ${table.transferAccountId} is not null and ${table.transferAccountId} <> ${table.accountId})
        or
        (${table.type} in ('credit', 'debit') and ${table.transferAccountId} is null)
      )`,
    ),
    foreignKey({
      columns: [table.categoryId, table.userId],
      foreignColumns: [categories.id, categories.userId],
      name: "transactions_category_owner_fk",
    }),
    foreignKey({
      columns: [table.accountId, table.userId],
      foreignColumns: [accounts.id, accounts.userId],
      name: "transactions_account_owner_fk",
    }),
    foreignKey({
      columns: [table.transferAccountId, table.userId],
      foreignColumns: [accounts.id, accounts.userId],
      name: "transactions_transfer_account_owner_fk",
    }),
  ],
);

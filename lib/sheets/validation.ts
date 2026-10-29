import "server-only";
import { z } from "zod";
import type { Account, Transaction } from "@/types/models";
import { LedgerError } from "../ledgerErrors";
import type { Creates } from "./row";

const id = z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/);
const label = z.string().trim().min(1).max(100);
const amount = z.number().int().min(-Number.MAX_SAFE_INTEGER).max(Number.MAX_SAFE_INTEGER).refine((value) => value !== 0, "Amount cannot be zero");
const base = {
  id,
  isoDate: z.iso.datetime({ offset: true }),
  amountMinor: amount,
  description: z.string().max(1000),
};
const transaction = z.discriminatedUnion("isTransfer", [
  z.strictObject({ ...base, isTransfer: z.literal(false), accountId: id, category: label }),
  z.strictObject({ ...base, amountMinor: z.number().int().positive().max(Number.MAX_SAFE_INTEGER), isTransfer: z.literal(true), accountFromId: id, accountToId: id, transferPartnerId: id, category: z.literal("inter-account-transfer") })
    .refine((value) => value.accountFromId !== value.accountToId, "Transfer accounts must differ")
    .refine((value) => value.id !== value.transferPartnerId, "Transfer IDs must differ"),
]);
const batch = z.array(z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("account/create"), account: z.strictObject({ id, name: label, bucket: label, color: z.string().regex(/^#[0-9a-fA-F]{6}$/), archived: z.literal(false) }) }),
  z.strictObject({ action: z.literal("transaction/create"), transaction }),
])).min(1).max(100);

export function parseChanges(input: unknown): Creates {
  const result = batch.safeParse(input);
  if (!result.success) {
    throw new LedgerError("VALIDATION", "Check your pending changes before syncing.", result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })));
  }
  const changes = result.data as Creates;
  const accountIds = new Set<string>();
  const transactionIds = new Set<string>();
  for (const change of changes) {
    const ids = change.action === "account/create" ? [change.account.id] : change.transaction.isTransfer ? [change.transaction.id, change.transaction.transferPartnerId] : [change.transaction.id];
    const seen = change.action === "account/create" ? accountIds : transactionIds;
    for (const value of ids) {
      if (seen.has(value)) throw new LedgerError("VALIDATION", "Duplicate IDs in pending changes.");
      seen.add(value);
    }
  }
  return changes;
}

export function validateReferences(changes: Creates, accounts: Account[], transactions: Transaction[]) {
  const available = new Map(accounts.map((account) => [account.id, account]));
  const existingIds = new Set(transactions.flatMap((transaction) => transaction.isTransfer ? [transaction.id, transaction.transferPartnerId] : [transaction.id]));
  for (const change of changes) {
    if (change.action !== "account/create") continue;
    if (available.has(change.account.id)) throw new LedgerError("CONFLICT", "An account ID already exists.");
    available.set(change.account.id, change.account);
  }
  for (const change of changes) {
    if (change.action !== "transaction/create") continue;
    const transaction = change.transaction;
    const ids = transaction.isTransfer ? [transaction.id, transaction.transferPartnerId] : [transaction.id];
    if (ids.some((id) => existingIds.has(id))) throw new LedgerError("CONFLICT", "A transaction ID already exists.");
    const references = transaction.isTransfer ? [transaction.accountFromId, transaction.accountToId] : [transaction.accountId];
    if (references.some((id) => !available.has(id) || available.get(id)!.archived)) {
      throw new LedgerError("VALIDATION", "Transactions must reference active accounts in your ledger.");
    }
  }
}

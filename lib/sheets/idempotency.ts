import "server-only";
import type { Account, Transaction } from "@/types/models";
import { LedgerError } from "../ledgerErrors";
import { transactionToRow, type Creates } from "./row";

function same<T extends object>(left: T, right: T): boolean {
  return (Object.keys(left) as (keyof T)[]).every((key) => left[key] === right[key]);
}

export function uncommittedCreates(changes: Creates, accounts: Account[], transactions: Transaction[]): Creates {
  const accountsById = new Map(accounts.map((account) => [account.id, account]));
  const rowsById = new Map(transactions.flatMap(transactionToRow).map((row) => [row.id, row]));
  return changes.filter((change) => {
    if (change.action === "account/create") {
      const existing = accountsById.get(change.account.id);
      if (!existing) return true;
      if (!same(change.account, existing)) throw new LedgerError("CONFLICT", "An account ID already exists with different data.");
      return false;
    }
    const rows = transactionToRow(change.transaction);
    const found = rows.filter((row) => rowsById.has(row.id));
    if (!found.length) return true;
    if (found.length !== rows.length || rows.some((row) => !same(row, rowsById.get(row.id)!))) {
      throw new LedgerError("CONFLICT", "A transaction ID already exists with different or incomplete data.");
    }
    return false;
  });
}

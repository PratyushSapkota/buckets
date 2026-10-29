import "server-only";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { getSheet } from "./client";
import { insertRows } from "./row";
import { SourceData } from "@/types/models";
import { getAccounts } from "./accounts";
import {
  getPivotRows,
  mapAccountBalances,
  mapCategoricalAmounts,
} from "./pivotValues";
import { getTransactions } from "./transactions";
import { parseChanges, validateReferences } from "./validation";
import { isAllowedEmail } from "../allowlist";
import { LedgerError } from "../ledgerErrors";
import { uncommittedCreates } from "./idempotency";

export async function getAuthenticatedEmail(): Promise<string> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new LedgerError("UNAUTHORIZED", "Please sign in before accessing your ledger.");
  }

  if (!session.user.email) {
    throw new LedgerError("UNAUTHORIZED", "Your session is missing an email. Please sign in again.");
  }

  if (!isAllowedEmail(session.user.email)) {
    throw new LedgerError("FORBIDDEN", "This account does not have access to the ledger.");
  }

  return session.user.email;
}

export async function syncChanges(input: unknown) {
  const email = await getAuthenticatedEmail();
  const changes = parseChanges(input);
  const sheet = await getSheet(email);
  const [accounts, transactions] = await Promise.all([getAccounts(sheet), getTransactions(sheet)]);
  const creates = uncommittedCreates(changes, accounts, transactions);
  validateReferences(creates, accounts, transactions);
  if (creates.length) {
    await insertRows(creates, sheet);
  }
}

export async function getSheetData(): Promise<SourceData> {
  const email = await getAuthenticatedEmail();
  const sheet = await getSheet(email);
  const pivotRows = await getPivotRows(sheet);
  const accounts = await getAccounts(sheet);
  const transactions = await getTransactions(sheet);
  return {
    accounts: mapAccountBalances(pivotRows, accounts),
    categoricalAmount: mapCategoricalAmounts(pivotRows, accounts),
    transaction: transactions
  };
}

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

export async function getAuthenticatedEmail(): Promise<string> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Auth required");
  }

  if (!session.user.email) {
    throw new Error("User email is missing");
  }

  return session.user.email;
}

export async function syncChanges(input: unknown) {
  const email = await getAuthenticatedEmail();
  const changes = parseChanges(input);
  const sheet = await getSheet(email);
  const [accounts, transactions] = await Promise.all([getAccounts(sheet), getTransactions(sheet)]);
  validateReferences(changes, accounts, transactions);
  await insertRows(changes, sheet);
  await sheet.saveUpdatedCells();
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

import "server-only";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { getSheet } from "./client";
import { Creates, insertRows } from "./row";
import { LocalChange, SourceData } from "@/types/models";
import { getAccounts } from "./accounts";
import {
  getPivotRows,
  mapAccountBalances,
  mapCategoricalAmounts,
} from "./pivotValues";
import { getTransactions } from "./transactions";

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

export async function syncChanges(changes: LocalChange[]) {
  const email = await getAuthenticatedEmail();
  const sheet = await getSheet(email);

  // might have to shuffle these around
  // 1. insert the creates
  // 2. update the updates
  // 3. delete transaction

  let creates: Creates = [];

  changes.forEach((change) => {
    switch (change.action) {
      case "account/create":
        creates.push(change);
        break;
      case "account/archive":
        break;
      case "transaction/create":
        creates.push(change);
        break;
      case "transaction/delete":
        break;
      case "transaction/update":
        break;
    }
  });

  await insertRows(creates, sheet);
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

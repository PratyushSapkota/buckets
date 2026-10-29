import { GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { SHEET_SCHEMA } from "./schema";
import {
  Account,
  AccountId,
  AccountWithBalance,
  CategoryAmount,
} from "@/types/models";

type PivotRow = [string, string, number];

export async function getPivotRows(
  sheet: GoogleSpreadsheetWorksheet,
): Promise<PivotRow[]> {
  const range = `${SHEET_SCHEMA.PIVOT.columnStart}2:${SHEET_SCHEMA.PIVOT.columnEnd}`;
  const rows = (await sheet.getCellsInRange(range)) as string[][];
  return rows as PivotRow[];
}

export function mapAccountBalances(
  rows: PivotRow[],
  accounts: Account[],
): AccountWithBalance[] {
  const balances = new Map(
    rows
      .filter(([id]) => id.endsWith(" Total") && id !== " Total")
      .map(
        ([id, , amount]) =>
          [id.slice(0, -" Total".length), Number(amount)] as const,
      ),
  );

  return accounts.map((account) => ({
    ...account,
    balanceMinor: balances.get(account.id) ?? 0,
  }));
}

export function mapCategoricalAmounts(
  rows: PivotRow[],
  accounts: Account[],
): CategoryAmount {
  const result = Object.fromEntries(
    accounts.map((account) => [account.id, []]),
  ) as CategoryAmount;

  const validIds = new Set<string>(accounts.map((a) => a.id));
  let currentId: AccountId | null = null;

  for (const [id, category, amount] of rows) {
    if (id.endsWith(" Total") || id === "Grand Total") {
      currentId = null;
      continue;
    }

    if (id) {
      currentId = validIds.has(id) ? (id as AccountId) : null;
    }

    if (!currentId || !category) continue;

    result[currentId].push({
      category,
      amountMinor: Number(amount),
    });
  }
  return result;
}

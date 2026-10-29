import { GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { SHEET_SCHEMA } from "./schema";
import { Account, AccountId } from "@/types/models";

export async function getAccounts(
  sheet: GoogleSpreadsheetWorksheet,
): Promise<Account[]> {
  const range = `${SHEET_SCHEMA.ACCOUNTS.columnStart}2:${SHEET_SCHEMA.ACCOUNTS.columnEnd}`;
  const rows = (await sheet.getCellsInRange(range)) as unknown[][];

  const schema = SHEET_SCHEMA.ACCOUNTS.columns;
  const keys = Object.keys(schema.shape);
  const ids = new Set<string>();

  return (rows ?? [])
    .filter((row) => row[0])
    .map((row) => {
      const data = Object.fromEntries(keys.map((key, i) => [key, row[i]]));

      const account = schema.parse({
        ...data,
        archived: data.archived === true || data.archived === "TRUE",
      });
      if (!account.id.trim() || ids.has(account.id)) throw new Error("Invalid or duplicate account ID in worksheet");
      ids.add(account.id);

      return {
        ...account,
        id: account.id as AccountId,
      };
    });
}

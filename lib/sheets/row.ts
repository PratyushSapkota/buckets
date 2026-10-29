import { LocalChange, Transaction } from "@/types/models";
import { AccountRow, TransactionRow, SHEET_SCHEMA } from "./schema";
import { type GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { commitSheetBatch } from "./client";

export function transactionToRow(transaction: Transaction): TransactionRow[] {
  if (transaction.isTransfer) {
    return [
      {
        id: transaction.id,
        transferPartner: transaction.transferPartnerId,
        account: transaction.accountFromId,
        amount: transaction.amountMinor * -1,
        category: transaction.category,
        date: transaction.isoDate,
        description: transaction.description,
      },
      {
        id: transaction.transferPartnerId,
        transferPartner: transaction.id,
        account: transaction.accountToId,
        amount: transaction.amountMinor,
        category: transaction.category,
        date: transaction.isoDate,
        description: transaction.description,
      },
    ];
  } else {
    return [
      {
        id: transaction.id,
        account: transaction.accountId,
        amount: transaction.amountMinor,
        category: transaction.category,
        date: transaction.isoDate,
        description: transaction.description,
        transferPartner: "",
      },
    ];
  }
}
export type Creates = Extract<LocalChange, { action: `${string}/create` }>[];
type CellValue = { stringValue: string } | { numberValue: number } | { boolValue: boolean };
export type SheetBatchRequest =
  | { insertRange: { range: { sheetId: number; startRowIndex: number; endRowIndex: number; startColumnIndex: number; endColumnIndex: number }; shiftDimension: "ROWS" } }
  | { updateCells: { start: { sheetId: number; rowIndex: number; columnIndex: number }; rows: { values: { userEnteredValue: CellValue }[] }[]; fields: "userEnteredValue" } };

function tableRequests(sheetId: number, columnStartIndex: number, rows: (string | number | boolean)[][]): SheetBatchRequest[] {
  if (!rows.length) return [];
  return [
    { insertRange: { range: { sheetId, startRowIndex: 1, endRowIndex: 1 + rows.length, startColumnIndex: columnStartIndex, endColumnIndex: columnStartIndex + rows[0].length }, shiftDimension: "ROWS" } },
    { updateCells: { start: { sheetId, rowIndex: 1, columnIndex: columnStartIndex }, rows: rows.map((row) => ({ values: row.map((value) => ({ userEnteredValue: typeof value === "string" ? { stringValue: value } : typeof value === "number" ? { numberValue: value } : { boolValue: value } })) })), fields: "userEnteredValue" } },
  ];
}

export async function insertRows(
  changes: Creates,
  sheet: GoogleSpreadsheetWorksheet,
) {
  const transactionRows: TransactionRow[] = [];
  const accountRows: AccountRow[] = [];

  changes.forEach((change) => {
    switch (change.action) {
      case "account/create":
        accountRows.push(change.account as AccountRow);
        break;
      case "transaction/create":
        transactionRows.push(...transactionToRow(change.transaction));
    }
  });

  const requests = [
    ...tableRequests(sheet.sheetId, SHEET_SCHEMA.ACCOUNTS.columnStartIndex, accountRows.map((row) => [row.id, row.name, row.color, row.bucket, row.archived])),
    ...tableRequests(sheet.sheetId, SHEET_SCHEMA.TRANSACTIONS.columnStartIndex, transactionRows.map((row) => [row.id, row.amount, row.account, row.category, row.date, row.description, row.transferPartner])),
  ];
  if (requests.length) await commitSheetBatch(requests);
}

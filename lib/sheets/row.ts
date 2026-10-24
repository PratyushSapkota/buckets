import { AccountRow, TransactionRow, SHEET_SCHEMA } from "./schema";
import { type GoogleSpreadsheetWorksheet } from "google-spreadsheet";

function transactionToRow(transaction: Transaction): TransactionRow[] {
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
export async function insertRows(
  changes: Creates,
  sheet: GoogleSpreadsheetWorksheet,
) {
  let transactionRows: TransactionRow[] = [];
  let accountRows: AccountRow[] = [];

  changes.forEach((change) => {
    switch (change.action) {
      case "account/create":
        accountRows.push(change.account as AccountRow);
        break;
      case "transaction/create":
        transactionRows.push(...transactionToRow(change.transaction));
    }
  });

  await insertAccountRows(accountRows, sheet);
  await insertTransactionRows(transactionRows, sheet);
  
}

async function insertAccountRows(
  accountRows: AccountRow[],
  sheet: GoogleSpreadsheetWorksheet,
) {
  const range = {
    startRowIndex: 1, // exclude header
    endRowIndex: 1 + accountRows.length,
    startColumnIndex: SHEET_SCHEMA.ACCOUNTS.columnStartIndex,
    endColumnIndex: SHEET_SCHEMA.ACCOUNTS.columnEndIndex,
  };
  await sheet.insertRange(range, "ROWS");
  await sheet.loadCells(range);

  const columns = Object.keys(
    SHEET_SCHEMA.ACCOUNTS.columns.shape,
  ) as (keyof AccountRow)[];

  accountRows.forEach((account, accountIndex) => {
    columns.forEach((column, columnOffset) => {
      sheet.getCell(
        accountIndex + 1,
        range.startColumnIndex + columnOffset,
      ).value = account[column];
    });
  });
}

async function insertTransactionRows(
  transactionRows: TransactionRow[],
  sheet: GoogleSpreadsheetWorksheet,
) {
  const range = {
    startRowIndex: 1, // exclude header
    endRowIndex: 1 + transactionRows.length,
    startColumnIndex: SHEET_SCHEMA.TRANSACTIONS.columnStartIndex,
    endColumnIndex: SHEET_SCHEMA.TRANSACTIONS.columnEndIndex,
  };
  await sheet.insertRange(range, "ROWS");
  await sheet.loadCells(range);

  const columns = Object.keys(
    SHEET_SCHEMA.TRANSACTIONS.columns.shape,
  ) as (keyof TransactionRow)[];

  transactionRows.forEach((transaction, transactionIndex) => {
    columns.forEach((column, columnOffset) => {
      sheet.getCell(
        transactionIndex + 1,
        range.startColumnIndex + columnOffset,
      ).value = transaction[column];
    });
  });
}

import "server-only";
import { z } from "zod";

function columnIndex(column: string): number {
  return (
    [...column.toUpperCase()].reduce(
      (index, char) => index * 26 + char.charCodeAt(0) - 64,
      0,
    ) - 1
  );
}


const TRANSACTIONS_COLUMN_START = "A";
const ACCOUNTS_COLUMN_START = "I";

const TRANSACTION_COLUMNS = z.object({
  id: z.string(),
  amount: z.number(),
  account: z.string(),
  category: z.string(),
  date: z.string(),
  description: z.string(),
  transferPartner: z.string(),
});

const ACCOUNT_COLUMNS = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  bucket: z.string(),
  archived: z.boolean(),
});

export const SHEET_SCHEMA = {
  TRANSACTIONS: {
    columnStart: TRANSACTIONS_COLUMN_START,
    columnStartIndex: columnIndex(TRANSACTIONS_COLUMN_START),
    columnEndIndex:
      columnIndex(TRANSACTIONS_COLUMN_START) +
      Object.keys(TRANSACTION_COLUMNS.shape).length,
    columns: TRANSACTION_COLUMNS,
  },
  ACCOUNTS: {
    columnStart: ACCOUNTS_COLUMN_START,
    columnStartIndex: columnIndex(ACCOUNTS_COLUMN_START),
    columnEndIndex:
      columnIndex(ACCOUNTS_COLUMN_START) +
      Object.keys(ACCOUNT_COLUMNS.shape).length,
    columns: ACCOUNT_COLUMNS,
  },
} as const;


export type TransactionRow = z.infer<typeof SHEET_SCHEMA.TRANSACTIONS.columns>;
export type AccountRow = z.infer<typeof SHEET_SCHEMA.ACCOUNTS.columns>;

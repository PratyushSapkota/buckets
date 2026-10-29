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

function toLetter(index: number): string {
  let result = "";
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    result = String.fromCharCode(65 + ((n - 1) % 26)) + result;
  }
  return result;
}

function createTable<T extends { shape: Record<string, unknown> }>(
  columnStart: string,
  columns: T,
) {
  const columnStartIndex = columnIndex(columnStart);
  const columnEndIndex = columnStartIndex + Object.keys(columns.shape).length;

  return {
    columnStart,
    columnEnd: toLetter(columnEndIndex - 1),
    columnStartIndex,
    columnEndIndex,
    columns,
  };
}

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
  TRANSACTIONS: createTable("A", TRANSACTION_COLUMNS),
  ACCOUNTS: createTable("I", ACCOUNT_COLUMNS),
  PIVOT: { columnStart: "O", columnEnd: "Q" },
} as const;

export type TransactionRow = z.infer<typeof SHEET_SCHEMA.TRANSACTIONS.columns>;
export type AccountRow = z.infer<typeof SHEET_SCHEMA.ACCOUNTS.columns>;

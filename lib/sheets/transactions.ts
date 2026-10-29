import "server-only";
import type { AccountId, Transaction, TransactionId } from "@/types/models";
import type { GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { SHEET_SCHEMA, type TransactionRow } from "./schema";

export async function getTransactions(
  sheet: GoogleSpreadsheetWorksheet,
): Promise<Transaction[]> {
  const range = `${SHEET_SCHEMA.TRANSACTIONS.columnStart}2:${SHEET_SCHEMA.TRANSACTIONS.columnEnd}`;

  const rows = ((await sheet.getCellsInRange(range, {
    valueRenderOption: "UNFORMATTED_VALUE",
  })) ?? []) as unknown[][];

  const rowsById = new Map<string, TransactionRow>();

  for (const [index, row] of rows.entries()) {
    if (row.every((cell) => cell === "" || cell == null)) continue;

    const [
      id,
      amount,
      account,
      category = "",
      date,
      description = "",
      transferPartner = "",
    ] = row;

    const parsed = SHEET_SCHEMA.TRANSACTIONS.columns.safeParse({
      id,
      amount,
      account,
      category,
      date,
      description,
      transferPartner,
    });

    if (!parsed.success) {
      throw new Error(
        `Invalid transaction in sheet row ${index + 2}: ${parsed.error.message}`,
      );
    }

    const transactionRow = parsed.data;

    if (
      !transactionRow.id.trim() ||
      !transactionRow.account.trim() ||
      !Number.isSafeInteger(transactionRow.amount) ||
      Number.isNaN(Date.parse(transactionRow.date))
    ) {
      throw new Error(`Invalid transaction in sheet row ${index + 2}`);
    }

    if (rowsById.has(transactionRow.id)) {
      throw new Error(`Duplicate transaction ID: ${transactionRow.id}`);
    }

    rowsById.set(transactionRow.id, transactionRow);
  }

  const transactions: Transaction[] = [];
  const processed = new Set<string>();

  for (const row of rowsById.values()) {
    if (processed.has(row.id)) continue;

    if (!row.transferPartner) {
      transactions.push({
        isTransfer: false,
        id: row.id as TransactionId,
        accountId: row.account as AccountId,
        amountMinor: row.amount,
        category: row.category,
        description: row.description,
        isoDate: row.date,
      });
      processed.add(row.id);
      continue;
    }

    const partner = rowsById.get(row.transferPartner);

    if (!partner) {
      throw new Error(
        `Missing transfer partner ${row.transferPartner} for transaction ${row.id}`,
      );
    }

    if (
      partner.id === row.id ||
      partner.transferPartner !== row.id ||
      row.amount === 0 ||
      row.amount !== -partner.amount ||
      row.account === partner.account ||
      row.category !== "inter-account-transfer" ||
      partner.category !== "inter-account-transfer" ||
      row.date !== partner.date ||
      row.description !== partner.description
    ) {
      throw new Error(`Invalid transfer pair: ${row.id}, ${partner.id}`);
    }

    // The writer stores the original transaction ID on the outgoing row.
    const outgoing = row.amount < 0 ? row : partner;
    const incoming = row.amount > 0 ? row : partner;

    transactions.push({
      isTransfer: true,
      id: outgoing.id as TransactionId,
      transferPartnerId: incoming.id as TransactionId,
      accountFromId: outgoing.account as AccountId,
      accountToId: incoming.account as AccountId,
      amountMinor: incoming.amount,
      category: "inter-account-transfer",
      description: outgoing.description,
      isoDate: outgoing.date,
    });

    processed.add(outgoing.id);
    processed.add(incoming.id);
  }
  return transactions;
}

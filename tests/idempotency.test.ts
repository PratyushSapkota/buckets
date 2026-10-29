import { expect, it } from "vitest";
import { uncommittedCreates } from "@/lib/sheets/idempotency";
import { parseChanges } from "@/lib/sheets/validation";
import { getTransactions } from "@/lib/sheets/transactions";
import { transactionToRow } from "@/lib/sheets/row";
import type { GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { account, transaction, transfer } from "./fixtures";

it("skips identical accounts and both rows of identical transfers", () => {
  const changes = parseChanges([{ action: "account/create", account }, { action: "transaction/create", transaction: transfer }]);
  expect(uncommittedCreates(changes, [account], [transfer])).toEqual([]);
  expect(() => uncommittedCreates(changes, [{ ...account, name: "different" }], [transfer])).toThrow(/different/);
});
it("rejects partial ID collisions and modified transfer rows", () => {
  const changes = parseChanges([{ action: "transaction/create", transaction: transfer }]);
  expect(() => uncommittedCreates(changes, [], [{ ...transaction, id: transfer.transferPartnerId }])).toThrow(/incomplete/);
  expect(() => uncommittedCreates(changes, [], [{ ...transfer, amountMinor: 200 }])).toThrow(/different/);
});
it("rejects incomplete or inconsistent persisted pairs before retry comparison", async () => {
  const cells = transactionToRow(transfer).map((row) => [row.id, row.amount, row.account, row.category, row.date, row.description, row.transferPartner]);
  const sheet = (values: unknown[][]) => ({ getCellsInRange: async () => values }) as unknown as GoogleSpreadsheetWorksheet;
  await expect(getTransactions(sheet(cells.slice(0, 1)))).rejects.toThrow(/Missing transfer partner/);
  await expect(getTransactions(sheet([cells[0], [...cells[1].slice(0, 1), 999, ...cells[1].slice(2)]]))).rejects.toThrow(/Invalid transfer pair/);
  expect(await getTransactions(sheet(cells))).toEqual([transfer]);
});

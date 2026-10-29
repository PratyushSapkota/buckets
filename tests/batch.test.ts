import { beforeEach, expect, it, vi } from "vitest";
import type { GoogleSpreadsheetWorksheet } from "google-spreadsheet";
const commit = vi.hoisted(() => vi.fn());
vi.mock("@/lib/sheets/client", () => ({ commitSheetBatch: commit }));
import { insertRows, type SheetBatchRequest } from "@/lib/sheets/row";
import { account, transfer } from "./fixtures";
const sheet = { sheetId: 42 } as GoogleSpreadsheetWorksheet;
beforeEach(() => { commit.mockReset(); });

it("writes account and transfer ranges with literal typed values in one request", async () => {
  await insertRows([{ action: "account/create", account }, { action: "transaction/create", transaction: { ...transfer, description: "=IMPORTXML(\"https://example.com\",\"/\")" } }], sheet);
  expect(commit).toHaveBeenCalledOnce();
  const requests: SheetBatchRequest[] = commit.mock.calls[0][0];
  const inserts = requests.filter((request) => "insertRange" in request);
  expect(inserts.map((request) => request.insertRange.range)).toEqual([
    { sheetId: 42, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 8, endColumnIndex: 13 },
    { sheetId: 42, startRowIndex: 1, endRowIndex: 3, startColumnIndex: 0, endColumnIndex: 7 },
  ]);
  const updates = requests.filter((request) => "updateCells" in request).map((request) => request.updateCells);
  expect(updates[0].rows[0].values[4].userEnteredValue).toEqual({ boolValue: false });
  expect(updates[1].rows.map((row) => row.values[1].userEnteredValue)).toEqual([{ numberValue: -100 }, { numberValue: 100 }]);
  expect(updates[1].rows[0].values[5].userEnteredValue).toEqual({ stringValue: "=IMPORTXML(\"https://example.com\",\"/\")" });
  expect(updates.every((update) => update.fields === "userEnteredValue")).toBe(true);
});
it("does not write empty batches or retry failed commits", async () => {
  await insertRows([], sheet);
  expect(commit).not.toHaveBeenCalled();
  commit.mockRejectedValueOnce(new Error("Google unavailable"));
  await expect(insertRows([{ action: "account/create", account }], sheet)).rejects.toThrow("Google unavailable");
  expect(commit).toHaveBeenCalledOnce();
});

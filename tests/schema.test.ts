import { expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { worksheetCreationRequests } from "@/spreadsheet/schema";

it("writes the documented headers to separate ranges with literal string values", () => {
  const requests = worksheetCreationRequests("google-sub", 0);
  expect(requests.slice(1, 5)).toEqual([
    [0, ["id", "name", "archived"]],
    [4, ["id", "name"]],
    [7, ["id", "name", "bucketId", "archived", "balance"]],
    [13, ["id", "date", "amount", "accountId", "categoryId"]],
  ].map(([columnIndex, headers]) => ({
    updateCells: {
      start: { sheetId: 0, rowIndex: 0, columnIndex },
      rows: [{ values: (headers as string[]).map((stringValue) => ({ userEnteredValue: { stringValue } })) }],
      fields: "userEnteredValue",
    },
  })));
});

it("initializes an expanding account-balance formula in L2 and leaves T empty", () => {
  const requests = worksheetCreationRequests("google-sub", 0);
  expect(requests[5]).toEqual({
    updateCells: {
      start: { sheetId: 0, rowIndex: 1, columnIndex: 11 },
      rows: [{ values: [{ userEnteredValue: {
        formulaValue: '=MAP(H2:H,LAMBDA(accountId,IF(accountId="","",SUMIF($Q$2:$Q,accountId,$P$2:$P))))',
      } }] }],
      fields: "userEnteredValue",
    },
  });
  expect(requests.filter((request) => request.updateCells?.start.columnIndex === 19)).toHaveLength(0);
});

it("defines the account/category SUM pivot over an unbounded transaction range", () => {
  const requests = worksheetCreationRequests("google-sub", 42);
  for (const [index, columnIndex, offsets, name] of [
    [6, 22, [3, 4], "amount"],
  ] as const) {
    const request = requests[index];
    if (!request.updateCells) throw new Error("Missing pivot request");
    expect(request.updateCells.start).toEqual({ sheetId: 42, rowIndex: 0, columnIndex });
    expect(request.updateCells.fields).toBe("pivotTable");
    const cell = request.updateCells.rows[0].values[0];
    if (!("pivotTable" in cell)) throw new Error("Missing pivot definition");
    expect(cell.pivotTable.source).toEqual({
      sheetId: 42, startRowIndex: 0, startColumnIndex: 13, endColumnIndex: 18,
    });
    expect(cell.pivotTable.rows.map((row) => row.sourceColumnOffset)).toEqual(offsets);
    expect(cell.pivotTable.values).toEqual([{ sourceColumnOffset: 2, summarizeFunction: "SUM", name }]);
    expect(cell.pivotTable.filterSpecs).toEqual([
      { columnOffsetIndex: 3, filterCriteria: { visibleByDefault: true, condition: { type: "NOT_BLANK" } } },
    ]);
    expect(cell.pivotTable.rows.every((row) => !row.showTotals && row.repeatHeadings)).toBe(true);
  }
});

import "server-only";

export const WORKSHEET_SCHEMA = {
  rowCount: 1000,
  columnCount: 25,
  entities: {
    buckets: { startColumn: 0, headers: ["id", "name", "archived"] },
    categories: { startColumn: 4, headers: ["id", "name"] },
    accounts: { startColumn: 7, headers: ["id", "name", "bucketId", "archived", "balance"] },
    transactions: { startColumn: 13, headers: ["id", "date", "amount", "accountId", "categoryId"] },
  },
  formulas: {
    accountBalance: {
      column: 11,
      value: '=MAP(H2:H,LAMBDA(accountId,IF(accountId="","",SUMIF($Q$2:$Q,accountId,$P$2:$P))))',
    },
  },
  pivots: { accountCategories: 22 },
} as const;

export function worksheetCreationRequests(sub: string, sheetId: number) {
  const transactions = WORKSHEET_SCHEMA.entities.transactions;
  const source = {
    sheetId,
    startRowIndex: 0,
    startColumnIndex: transactions.startColumn,
    endColumnIndex: transactions.startColumn + transactions.headers.length,
  };
  const pivotRequest = (columnIndex: number, offsets: number[], name: string) => ({
    updateCells: {
      start: { sheetId, rowIndex: 0, columnIndex },
      rows: [{
        values: [{
          pivotTable: {
            source,
            rows: offsets.map((sourceColumnOffset) => ({
              sourceColumnOffset,
              label: transactions.headers[sourceColumnOffset],
              showTotals: false,
              repeatHeadings: true,
              sortOrder: "ASCENDING",
            })),
            values: [{ sourceColumnOffset: 2, summarizeFunction: "SUM", name }],
            // Skip unused transaction rows, while retaining uncategorized transactions.
            filterSpecs: [{ columnOffsetIndex: 3, filterCriteria: { visibleByDefault: true, condition: { type: "NOT_BLANK" } } }],
            valueLayout: "HORIZONTAL",
          },
        }],
      }],
      fields: "pivotTable",
    },
  });

  return [
    {
      addSheet: {
        properties: {
          sheetId,
          title: sub,
          gridProperties: { rowCount: WORKSHEET_SCHEMA.rowCount, columnCount: WORKSHEET_SCHEMA.columnCount },
        },
      },
    },
    ...Object.values(WORKSHEET_SCHEMA.entities).map(({ startColumn, headers }) => ({
      updateCells: {
        start: { sheetId, rowIndex: 0, columnIndex: startColumn },
        rows: [{ values: headers.map((header) => ({ userEnteredValue: { stringValue: header } })) }],
        fields: "userEnteredValue",
      },
    })),
    {
      updateCells: {
        start: { sheetId, rowIndex: 1, columnIndex: WORKSHEET_SCHEMA.formulas.accountBalance.column },
        rows: [{ values: [{ userEnteredValue: { formulaValue: WORKSHEET_SCHEMA.formulas.accountBalance.value } }] }],
        fields: "userEnteredValue",
      },
    },
    pivotRequest(WORKSHEET_SCHEMA.pivots.accountCategories, [3, 4], "amount"),
  ];
}

export const SPREADSHEET_NAME = "buckets";

export const WORKSHEET_NAME = "data";

export const SHEET_SCHEMA = {
  buckets: {
    startColumnIndex: 0,
    endColumnIndex: 2,
    columns: ["id", "name"],
  },

  accounts: {
    startColumnIndex: 3,
    endColumnIndex: 6,
    columns: ["id", "name", "bucketId"],
  },

  categories: {
    startColumnIndex: 7,
    endColumnIndex: 9,
    columns: ["id", "name"],
  },

  transactions: {
    startColumnIndex: 10,
    endColumnIndex: 16,
    columns: ["id", "date", "amount", "accountId", "categoryId", "description"],
  },
} as const;

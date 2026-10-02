export const SPREADSHEET_NAME = "buckets";

export const WORKSHEET_NAME = "data";

export const SHEET_SCHEMA = {
  buckets: {
    startColumnIndex: 0,
    endColumnIndex: 3,
    columns: ["id", "name", "archived"],
  },

  accounts: {
    startColumnIndex: 3,
    endColumnIndex: 7,
    columns: ["id", "name", "bucketId", "archived"],
  },

  categories: {
    startColumnIndex: 7,
    endColumnIndex: 9,
    columns: ["id", "name"],
  },

  transactions: {
    startColumnIndex: 9,
    endColumnIndex: 15,
    columns: ["id", "date", "amount", "accountId", "categoryId", "description"],
  },
} as const;
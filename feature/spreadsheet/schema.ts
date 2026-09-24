export const SPREADSHEET_NAME = "buckets";

export const WORKSHEET_NAME = "data";

export const SHEET_SCHEMA = {
  buckets: {
    columns: ["id", "name"],
  },

  accounts: {
    columns: ["id", "name", "balance", "bucketId"],
  },

  categories: {
    columns: ["id", "name"],
  },

  transactions: {
    columns: ["id", "date", "amount", "accountId", "categoryId", "description"],
  },
} as const;

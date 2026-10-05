export const MODEL_SCHEMA = {
  buckets: {
    id: "" as string,
    name: "" as string,
    archived: false as boolean,
  },

  accounts: {
    id: "" as string,
    name: "" as string,
    bucketId: "" as string,
    archived: false as boolean,
  },

  categories: {
    id: "" as string,
    name: "" as string,
  },

  transactions: {
    id: "" as string,
    description: "" as string,
    amount: 0 as number,
    dateIsoString: "" as string,
    accountId: "" as string,
    categoryId: "" as string,
  },
} as const;

export type Bucket = {
  [K in keyof typeof MODEL_SCHEMA.buckets]: (typeof MODEL_SCHEMA.buckets)[K];
};

export type Account = {
  [K in keyof typeof MODEL_SCHEMA.accounts]: (typeof MODEL_SCHEMA.accounts)[K];
};

export type Category = {
  [K in keyof typeof MODEL_SCHEMA.categories]: (typeof MODEL_SCHEMA.categories)[K];
};

export type Transaction = {
  [K in keyof typeof MODEL_SCHEMA.transactions]: (typeof MODEL_SCHEMA.transactions)[K];
};
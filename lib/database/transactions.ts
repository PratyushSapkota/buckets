import type {
  Transaction,
  TransactionType,
  UserId,
} from "./types";

const notImplemented = (): never => {
  throw new Error("Not implemented");
};

export const createTransaction: (
  userId: UserId,
  input: {
    description?: string;
    amount: number;
    type: TransactionType;
    categoryId?: string;
    accountId: string;
    transferAccountId?: string;
    occurredAt?: Date;
  },
) => Promise<Transaction> = notImplemented;

export const getTransaction: (
  userId: UserId,
  transactionId: string,
) => Promise<Transaction | undefined> = notImplemented;

export const listTransactions: (
  userId: UserId,
  filters?: {
    accountId?: string;
    categoryId?: string;
    type?: TransactionType;
    occurredAfter?: Date;
    occurredBefore?: Date;
  },
) => Promise<Transaction[]> = notImplemented;

export const updateTransaction: (
  userId: UserId,
  transactionId: string,
  input: {
    description?: string;
    amount?: number;
    type?: TransactionType;
    categoryId?: string;
    accountId?: string;
    transferAccountId?: string;
    occurredAt?: Date;
  },
) => Promise<Transaction | undefined> = notImplemented;

export const deleteTransaction: (
  userId: UserId,
  transactionId: string,
) => Promise<boolean> = notImplemented;

export const getAccountBalance: (
  userId: UserId,
  accountId: string,
) => Promise<number> = notImplemented;

export const getBucketBalance: (
  userId: UserId,
  bucketId: string,
) => Promise<number> = notImplemented;

import type {
  Account,
  UserId,
} from "./types";

const notImplemented = (): never => {
  throw new Error("Not implemented");
};

export const createAccount: (
  userId: UserId,
  input: {
    bucketId: string;
    name: string;
  },
) => Promise<Account> = notImplemented;

export const getAccount: (
  userId: UserId,
  accountId: string,
) => Promise<Account | undefined> = notImplemented;

export const listAccounts: (
  userId: UserId,
  bucketId?: string,
) => Promise<Account[]> = notImplemented;

export const updateAccount: (
  userId: UserId,
  accountId: string,
  input: {
    name?: string;
  },
) => Promise<Account | undefined> = notImplemented;

export const closeAccount: (
  userId: UserId,
  accountId: string,
) => Promise<Account | undefined> = notImplemented;

export const reopenAccount: (
  userId: UserId,
  accountId: string,
) => Promise<Account | undefined> = notImplemented;

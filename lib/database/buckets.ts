import type {
  Bucket,
  UserId,
} from "./types";

const notImplemented = (): never => {
  throw new Error("Not implemented");
};

export const createBucket: (
  userId: UserId,
  input: {
    name: string;
    type: string;
    currency: string;
    color?: string;
  },
) => Promise<Bucket> = notImplemented;

export const getBucket: (
  userId: UserId,
  bucketId: string,
) => Promise<Bucket | undefined> = notImplemented;

export const listBuckets: (userId: UserId) => Promise<Bucket[]> = notImplemented;

export const updateBucket: (
  userId: UserId,
  bucketId: string,
  input: {
    name?: string;
    type?: string;
    currency?: string;
    color?: string;
  },
) => Promise<Bucket | undefined> = notImplemented;

export const closeBucket: (
  userId: UserId,
  bucketId: string,
) => Promise<Bucket | undefined> = notImplemented;

export const reopenBucket: (
  userId: UserId,
  bucketId: string,
) => Promise<Bucket | undefined> = notImplemented;

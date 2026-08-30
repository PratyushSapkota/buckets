import { getDb } from "@/lib/database";

export async function getAccounts(bucketId: string) {
  const db = await getDb();
  return db.accounts.getFromBucket(bucketId);
}

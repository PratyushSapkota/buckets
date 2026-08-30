"use server";

import { getDb } from "@/lib/database";

export async function getBuckets() {
  const db = await getDb();
  return await db.buckets.getAll();
}

export async function getBucketNames() {
  const buckets = await getBuckets();
  return Object.fromEntries(buckets.map(({ id, name }) => [id, name]));
}

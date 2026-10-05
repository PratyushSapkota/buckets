"use client";
import { getLocalDb } from "./db";
import { LocalChange_Create } from "./models";

export async function createBucketLocal(obj: LocalChange_Create) {
  const db = await getLocalDb();
  db.add("creates", {
    id: crypto.randomUUID(),
    obj,
  });
}

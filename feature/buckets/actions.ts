"use server";

import { getDb } from "@/lib/database";
import { revalidatePath } from "next/cache";

export async function createBucket(
  name: string,
  currency: string,
  color: string,
) {
  const db = await getDb();
  try {
    await db.buckets.createOne(name, currency, color);
    revalidatePath("/");
  } catch {
    throw new Error("Failed to create bucket");
  }
}

"use server";

import { getDb } from "@/lib/database";
import { revalidatePath } from "next/cache";

export async function createAccount(bucketId: string, name: string) {
  const db = await getDb();

  try {
    await db.accounts.createOne(bucketId, name);
    revalidatePath("/");
  } catch {
    throw new Error("Failed to create account");
  }
}

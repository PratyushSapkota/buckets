"use server";

import { syncChanges } from "@/lib/sheets";

export async function syncLedgerChanges(changes: LocalChange[]) {
  await syncChanges(changes);
}

"use server";

import { syncChanges } from "@/lib/sheets";
import { LocalChange } from "@/types/models";

export async function syncLedgerChanges(changes: LocalChange[]) {
  await syncChanges(changes);
}

"use server";

import { syncChanges } from "@/lib/sheets";
import { LedgerError, type SyncResult } from "@/lib/ledgerErrors";

export async function syncLedgerChanges(changes: unknown): Promise<SyncResult> {
  try {
    await syncChanges(changes);
    return { ok: true };
  } catch (error) {
    if (error instanceof LedgerError) {
      return { ok: false, code: error.code, message: error.message, issues: error.issues, retryAfterSeconds: error.retryAfterSeconds };
    }
    return { ok: false, code: "SYNC_FAILED", message: "Unable to sync. Your pending changes have been kept; please try again." };
  }
}

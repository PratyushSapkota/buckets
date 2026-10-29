"use client";

import { LocalChange, SourceData } from "@/types/models";
import { DBSchema, openDB, IDBPDatabase } from "idb";
import { computeLedger, validateTransactionAccount } from "../ledger";

export type StoredLocalChange = LocalChange & {
  sequence: number;
};

interface LocalDB extends DBSchema {
  changes: {
    key: number;
    value: LocalChange;
  };
}

let dbPromise: Promise<IDBPDatabase<LocalDB>> | undefined;

function getDb() {
  return (dbPromise ??= openDB<LocalDB>("localChanges", 1, {
    upgrade(db) {
      db.createObjectStore("changes", {
        autoIncrement: true,
      });
    },
  }));
}

export async function pushChange(localChange: LocalChange) {
  const db = await getDb();
  const sequence = await db.add("changes", localChange);
  return sequence;
}

export async function popChange(): Promise<LocalChange | undefined> {
  const db = await getDb();
  const tx = db.transaction("changes", "readwrite");

  const cursor = await tx.store.openCursor(null, "prev");

  if (!cursor) {
    await tx.done;
    return undefined;
  }

  const change = cursor.value;
  await cursor.delete();
  await tx.done;

  return change;
}

export async function clearChanges(): Promise<void> {
  const db = await getDb();
  await db.clear("changes");
}

export async function removeChanges(sequences: number[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction("changes", "readwrite");
  await Promise.all(sequences.map((sequence) => tx.store.delete(sequence)));
  await tx.done;
}

export async function getAllChanges(): Promise<StoredLocalChange[]> {
  const db = await getDb();
  const tx = db.transaction("changes", "readonly");
  const changes: StoredLocalChange[] = [];

  let cursor = await tx.store.openCursor();

  while (cursor) {
    changes.push({
      ...cursor.value,
      sequence: cursor.primaryKey,
    });

    cursor = await cursor.continue();
  }

  await tx.done;
  return changes;
}


export async function pushValidatedChange(
  change: LocalChange,
  sourceData: SourceData,
): Promise<number> {
  const db = await getDb();
  const tx = db.transaction("changes", "readwrite");

  try {
    // Read the current queue, including any completed undo.
    const changes = await tx.store.getAll();
    const ledger = computeLedger(changes, sourceData);

    if (change.action === "transaction/create") {
      validateTransactionAccount(change.transaction, ledger);
    }

    const sequence = await tx.store.add(change);
    await tx.done;

    return sequence;
  } catch (error) {
    // Abort if still active and consume the transaction rejection.
    try {
      tx.abort();
    } catch {}

    await tx.done.catch(() => {});
    throw error;
  }
}

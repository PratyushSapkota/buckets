"use client";

import { DBSchema, openDB, IDBPDatabase } from "idb";

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

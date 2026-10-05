"use client";
import { openDB } from "idb";

const DB_NAME = "localChanges";
const DB_VERSION = 1;

let dbPromise: ReturnType<typeof openDB> | undefined;

export function getLocalDb() {
  if (typeof indexedDB === "undefined") {
    throw new Error("Local database requires a browser");
  }

  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore("creates", { keyPath: "id" });
        db.createObjectStore("updates", { keyPath: "id" });
        db.createObjectStore("deletes", { keyPath: "id" });
      },
    }).catch((error) => {
      dbPromise = undefined;
      throw error;
    });
  }

  return dbPromise;
}

export async function getAllPendingChanges() {
  
}

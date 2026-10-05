"use client";

import { useEffect, useState } from "react";
import { getLocalDb } from "../db";
import type { LocalChange } from "../models";

type PendingChange = {
  id: string;
  obj: LocalChange;
};

export function PendingChanges() {
  const [changes, setChanges] = useState<PendingChange[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const db = await getLocalDb();
        const records = await Promise.all([
          db.getAll("creates"),
          db.getAll("updates"),
          db.getAll("deletes"),
        ]);

        if (!cancelled) setChanges(records.flat());
      } catch {
        if (!cancelled) setError("Could not load pending changes.");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p role="alert">{error}</p>;
  if (changes === null) return <p>Loading pending changes…</p>;
  if (changes.length === 0) return <p>No pending changes.</p>;

  return (
    <section>
      <h2>Pending changes ({changes.length})</h2>
      <ul>
        {changes.map(({ id, obj }) => (
          <li key={id}>
            <strong>
              {obj.operation} · {obj.entity}
            </strong>
            <pre>{JSON.stringify(obj, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </section>
  );
}

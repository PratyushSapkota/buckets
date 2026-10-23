"use client"
import { getAllChanges, pushChange } from "@/lib/localDb";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type AddChange = (change: LocalChange) => Promise<number>;
type LedgerContextValue = {
  localChanges: LocalChange[] | null;
  addChange: AddChange;
  refresh: () => void;
};

const LedgerContext = createContext<LedgerContextValue | null>(null);

export function LedgerProvider({
  sourceData,
  children,
}: {
  sourceData: any;
  children: ReactNode;
}) {
  const [revision, setRevision] = useState(0);
  const [localChanges, setLocalChanges] = useState<LocalChange[] | null>(null);

  useEffect(() => {
    let active = true;
    getAllChanges().then(
      (data) => {
        if (!active) return;

        setLocalChanges(data);
      },
      (error) => {
        if (!active) return;
        console.warn(error);
      },
    );
    return () => {
      active = false;
    };
  }, [revision]);

  const ledger = useMemo(() => {
    // TODO
    // recompute here
  }, [sourceData, localChanges]);

  function refresh() {
    setRevision((curr) => curr + 1);
  }

  async function addChange(change: LocalChange) {
    const sequence = await pushChange(change);

    return sequence;
  }

  return (
    <LedgerContext.Provider
      value={{
        addChange: addChange,
        localChanges: localChanges,
        refresh: refresh,
      }}
    >
      {children}
    </LedgerContext.Provider>
  );
}

export function useLedger() {
  const context = useContext(LedgerContext);

  if (context === null) {
    throw new Error("useLedger must be used inside LedgerProvider");
  }

  return context;
}

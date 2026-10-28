"use client";
import {
  getAllChanges,
  pushChange,
  popChange,
  type StoredLocalChange,
  clearChanges,
} from "@/lib/localDb";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { syncLedgerChanges } from "./actions";
import { Ledger, LocalChange, SourceData } from "@/types/models";
import { computeLedger } from "@/lib/ledger";

export type AddChange = (change: LocalChange) => Promise<number>;
type LedgerContextValue = {
  ledger: Ledger | null;
  localChanges: StoredLocalChange[] | null;
  addChange: AddChange;
  undoChange: () => void;
  refresh: () => void;
  syncChanges: () => void;
};

const LedgerContext = createContext<LedgerContextValue | null>(null);

export function LedgerProvider({
  sourceData,
  children,
}: {
  sourceData: SourceData;
  children: ReactNode;
}) {
  const [revision, setRevision] = useState(0);
  const [storedLocalChanges, setStoredLocalChanges] = useState<
    StoredLocalChange[] | null
  >(null);

  useEffect(() => {
    let active = true;
    getAllChanges().then(
      (data) => {
        if (!active) return;

        setStoredLocalChanges(data);
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
    if (storedLocalChanges === null) {
      return null;
    }
    return computeLedger(storedLocalChanges, sourceData);
  }, [sourceData, storedLocalChanges]);

  function refresh() {
    setRevision((curr) => curr + 1);
  }

  async function addChange(change: LocalChange) {
    const sequence = await pushChange(change);
    refresh();
    return sequence;
  }
  async function undoChange() {
    await popChange();
    refresh();
  }

  async function syncChanges() {
    if (storedLocalChanges == null) {
      console.log("EMPTY");
      return;
    }
    const localChanges: LocalChange[] = storedLocalChanges.map(
      ({ sequence, ...change }) => change,
    );
    await syncLedgerChanges(localChanges);
    await clearChanges();
    refresh();
  }

  return (
    <LedgerContext.Provider
      value={{
        ledger: ledger,
        addChange: addChange,
        localChanges: storedLocalChanges,
        refresh: refresh,
        undoChange: undoChange,
        syncChanges: syncChanges,
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

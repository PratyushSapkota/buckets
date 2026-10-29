"use client";
import {
  getAllChanges,
  popChange,
  type StoredLocalChange,
  removeChanges,
  pushValidatedChange,
} from "@/lib/localDb";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  useTransition,
} from "react";
import { syncLedgerChanges } from "./actions";
import { Ledger, LocalChange, SourceData } from "@/types/models";
import { computeLedger } from "@/lib/ledger";
import { useRouter } from "next/navigation";
import { Loader } from "@mantine/core";

export type AddChange = (change: LocalChange) => Promise<number>;
type LedgerContextValue = {
  ledger: Ledger | null;
  localChanges: StoredLocalChange[] | null;
  addChange: AddChange;
  undoChange: () => void;
  refresh: () => void;
  syncChanges: () => Promise<void>;
};

const LedgerContext = createContext<LedgerContextValue | null>(null);

export function LedgerProvider({
  sourceData,
  children,
}: {
  sourceData: SourceData;
  children: ReactNode;
}) {
  const router = useRouter();
  const inFlight = useRef(false);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const [syncError, setSyncError] = useState<string | null>(null);
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
    if (storedLocalChanges === null || syncing || refreshing) {
      return null;
    }
    return computeLedger(storedLocalChanges, sourceData);
  }, [sourceData, storedLocalChanges, syncing, refreshing]);

  function refresh() {
    setRevision((curr) => curr + 1);
  }

  async function addChange(change: LocalChange) {
    if (inFlight.current) throw new Error("Please wait for synchronization to finish.");
    const sequence = await pushValidatedChange(change, sourceData);
    refresh();
    return sequence;
  }
  async function undoChange() {
    if (inFlight.current) return;
    await popChange();
    refresh();
  }

  async function syncChanges() {
    if (inFlight.current || refreshing || !storedLocalChanges?.length) {
      return;
    }
    inFlight.current = true;
    setSyncing(true);
    setSyncError(null);
    const submitted = storedLocalChanges;
    try {
      const localChanges: LocalChange[] = submitted.map(({ sequence, ...change }) => {
        void sequence;
        return change;
      });
      const result = await syncLedgerChanges(localChanges);
      if (!result.ok) {
        const details = result.issues?.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
        throw new Error(details ? `${result.message} ${details}` : result.message);
      }
      await removeChanges(submitted.map((change) => change.sequence));
      setStoredLocalChanges(await getAllChanges());
      startRefresh(() => router.refresh());
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Unable to sync. Your pending changes have been kept.");
    } finally {
      inFlight.current = false;
      setSyncing(false);
    }
  }

  if (syncing || refreshing) {
    return (
      <div role="status" aria-live="polite" style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, background: "var(--mantine-color-body)", zIndex: 1000 }}>
        <Loader size={96} />
        <p>Syncing your changes…</p>
      </div>
    );
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
      {syncError && <p role="alert" style={{ position: "fixed", top: 0, left: 0, right: 0, padding: 16, background: "var(--mantine-color-body)", zIndex: 100 }}>{syncError}</p>}
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

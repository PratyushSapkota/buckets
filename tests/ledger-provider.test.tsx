// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
const mocks = vi.hoisted(() => ({ getAll: vi.fn(), sync: vi.fn(), remove: vi.fn(), refresh: vi.fn(), push: vi.fn(), pop: vi.fn() }));
vi.mock("@/lib/localDb", () => ({ getAllChanges: mocks.getAll, removeChanges: mocks.remove, pushValidatedChange: mocks.push, popChange: mocks.pop }));
vi.mock("@/app/components/ledger/actions", () => ({ syncLedgerChanges: mocks.sync }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("@mantine/core", () => ({ Loader: () => <span>Loading</span> }));
import { LedgerProvider, useLedger } from "@/app/components/ledger/LedgerProvider";
import type { SourceData } from "@/types/models";
import { account } from "./fixtures";
const source: SourceData = { accounts: [], categoricalAmount: {}, transaction: [] };
const pending = [{ action: "account/create", account, sequence: 7 }];
function Controls() {
  const ledger = useLedger();
  return <><button onClick={() => { void ledger.syncChanges(); void ledger.syncChanges(); }}>Sync</button><span>Private ledger</span><span>Pending: {ledger.localChanges?.length}</span></>;
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.getAll.mockResolvedValue(pending);
  mocks.sync.mockResolvedValue({ ok: true });
  mocks.remove.mockResolvedValue(undefined);
});
afterEach(cleanup);
it("shows only a loader while syncing and prevents duplicate submissions", async () => {
  let finish!: (value: { ok: true }) => void;
  mocks.sync.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
  render(<LedgerProvider sourceData={source}><Controls /></LedgerProvider>);
  await screen.findByText("Pending: 1");
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("status").textContent).toContain("Syncing your changes…");
  expect(screen.queryByRole("button")).toBeNull();
  expect(screen.queryByText("Private ledger")).toBeNull();
  expect(mocks.sync).toHaveBeenCalledExactlyOnceWith([{ action: "account/create", account }]);
  mocks.getAll.mockResolvedValue([]);
  await act(async () => finish({ ok: true }));
  await waitFor(() => expect(mocks.remove).toHaveBeenCalledWith([7]));
  expect(mocks.refresh).toHaveBeenCalledOnce();
});
it("restores controls and retains the queue when the server rejects changes", async () => {
  mocks.sync.mockResolvedValue({ ok: false, code: "VALIDATION", message: "Check changes", issues: [{ path: "0.account.name", message: "Required" }] });
  render(<LedgerProvider sourceData={source}><Controls /></LedgerProvider>);
  await screen.findByText("Pending: 1");
  fireEvent.click(screen.getByRole("button"));
  expect((await screen.findByRole("alert")).textContent).toContain("0.account.name: Required");
  expect(screen.getByRole("button")).toBeTruthy();
  expect(mocks.remove).not.toHaveBeenCalled();
  expect(mocks.refresh).not.toHaveBeenCalled();
});
it("retains the queue on network failure", async () => {
  mocks.sync.mockRejectedValue(new Error("Connection interrupted"));
  render(<LedgerProvider sourceData={source}><Controls /></LedgerProvider>);
  await screen.findByText("Pending: 1");
  fireEvent.click(screen.getByRole("button"));
  expect((await screen.findByRole("alert")).textContent).toContain("Connection interrupted");
  expect(mocks.remove).not.toHaveBeenCalled();
});

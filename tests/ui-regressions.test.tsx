// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MantineProvider } from "@mantine/core";
import type { Ledger } from "@/types/models";
const state = vi.hoisted(() => ({ ledger: null as Ledger | null }));
vi.mock("@/app/components/ledger/LedgerProvider", () => ({ useLedger: () => ({ ledger: state.ledger }) }));
import { AccountList } from "@/app/components/ledger/AccountList";
import { TransactionTable } from "@/app/components/ledger/TransactionTable";
import { account, transaction } from "./fixtures";

beforeEach(() => {
  state.ledger = null;
  Object.defineProperty(window, "matchMedia", { configurable: true, value: vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })) });
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
function loadedLedger(): Ledger {
  return { accounts: new Map([[account.id, { account, balanceMinor: 100, categoryAmounts: [], origin: "source" }]]), transactions: new Map([[transaction.id, { transaction, origin: "source" }]]) };
}
it("renders accounts after initial loading without changing hook order", () => {
  const view = render(<MantineProvider><AccountList /></MantineProvider>);
  expect(screen.getByText("Wait")).toBeTruthy();
  state.ledger = loadedLedger();
  view.rerender(<MantineProvider><AccountList /></MantineProvider>);
  expect(screen.getByText("Account Summary")).toBeTruthy();
  expect(screen.getByText("cash 1")).toBeTruthy();
});
it("exposes edit and delete only as disabled beta menu items", async () => {
  state.ledger = loadedLedger();
  render(<MantineProvider><TransactionTable /></MantineProvider>);
  await userEvent.click(screen.getByText(transaction.description));
  const items = await screen.findAllByRole("menuitem");
  expect(items.map((item) => item.textContent)).toEqual(["Delete (unavailable in beta)", "Edit (unavailable in beta)"]);
  for (const item of items) expect(item.hasAttribute("disabled") || item.getAttribute("aria-disabled") === "true").toBe(true);
});

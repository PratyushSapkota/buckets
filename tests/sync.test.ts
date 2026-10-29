import { beforeEach, describe, expect, it, vi } from "vitest";
import { account, transaction } from "./fixtures";

const mocks = vi.hoisted(() => ({
  session: vi.fn(), getSheet: vi.fn(), getAccounts: vi.fn(), getTransactions: vi.fn(), insertRows: vi.fn(), save: vi.fn(),
}));
vi.mock("next-auth", () => ({ getServerSession: mocks.session }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/sheets/client", () => ({ getSheet: mocks.getSheet }));
vi.mock("@/lib/sheets/accounts", () => ({ getAccounts: mocks.getAccounts }));
vi.mock("@/lib/sheets/transactions", () => ({ getTransactions: mocks.getTransactions }));
vi.mock("@/lib/sheets/row", () => ({ insertRows: mocks.insertRows }));
import { syncLedgerChanges } from "@/app/components/ledger/actions";

describe("sync server boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("GOOGLE_OAUTH_ALLOWED_EMAILS", "owner@example.com");
    mocks.session.mockResolvedValue({ user: { email: "owner@example.com" } });
    mocks.getSheet.mockResolvedValue({ saveUpdatedCells: mocks.save });
    mocks.getAccounts.mockResolvedValue([account]);
    mocks.getTransactions.mockResolvedValue([]);
  });
  it("rejects malformed input before Google access", async () => {
    expect(await syncLedgerChanges([{ action: "transaction/create", transaction: { ...transaction, amountMinor: 1.5 } }])).toMatchObject({ ok: false, code: "VALIDATION", issues: expect.any(Array) });
    expect(mocks.getSheet).not.toHaveBeenCalled();
    expect(mocks.insertRows).not.toHaveBeenCalled();
  });
  it.each([null, { user: {} }, { user: { email: "removed@example.com" } }])("denies unauthorized session %j before Google access", async (session) => {
    mocks.session.mockResolvedValue(session);
    expect(await syncLedgerChanges([{ action: "transaction/create", transaction }])).toMatchObject({ ok: false });
    expect(mocks.getSheet).not.toHaveBeenCalled();
  });
  it("rejects missing account references before writes", async () => {
    mocks.getAccounts.mockResolvedValue([]);
    expect(await syncLedgerChanges([{ action: "transaction/create", transaction }])).toMatchObject({ ok: false, code: "VALIDATION" });
    expect(mocks.insertRows).not.toHaveBeenCalled();
  });
  it("writes a valid batch", async () => {
    expect(await syncLedgerChanges([{ action: "transaction/create", transaction }])).toEqual({ ok: true });
    expect(mocks.insertRows).toHaveBeenCalledOnce();
  });
  it("does not expose upstream error details", async () => {
    mocks.insertRows.mockRejectedValueOnce(new Error("private credential details"));
    const result = await syncLedgerChanges([{ action: "transaction/create", transaction }]);
    expect(result).toMatchObject({ ok: false, code: "SYNC_FAILED" });
    expect(JSON.stringify(result)).not.toContain("credential");
  });
});

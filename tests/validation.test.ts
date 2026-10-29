import { describe, expect, it } from "vitest";
import { parseChanges, validateReferences } from "@/lib/sheets/validation";
import { account, secondAccount, transaction, transfer } from "./fixtures";

describe("server ledger validation", () => {
  it.each([null, {}, [], Array(101).fill({ action: "account/create", account }), [{ action: "transaction/create", transaction: { ...transaction, amountMinor: 1.5 } }], [{ action: "transaction/create", transaction: { ...transaction, amountMinor: 0 } }], [{ action: "transaction/create", transaction: { ...transaction, amountMinor: Number.MAX_SAFE_INTEGER + 1 } }], [{ action: "transaction/create", transaction: { ...transaction, isoDate: "yesterday" } }], [{ action: "transaction/create", transaction: { ...transaction, description: "x".repeat(1001) } }], [{ action: "account/create", account: { ...account, name: "x".repeat(101) } }], [{ action: "account/create", account: { ...account, extra: true } }]])("rejects malformed batch %j", (input) => {
    expect(() => parseChanges(input)).toThrow();
  });
  it("validates references including accounts created later in the batch", () => {
    const changes = parseChanges([{ action: "transaction/create", transaction }, { action: "account/create", account }]);
    expect(() => validateReferences(changes, [], [])).not.toThrow();
    expect(() => validateReferences(changes.slice(0, 1), [], [])).toThrow(/active accounts/);
    expect(() => validateReferences(changes.slice(0, 1), [{ ...account, archived: true }], [])).toThrow(/active accounts/);
  });
  it("rejects duplicate IDs and invalid transfers", () => {
    expect(() => parseChanges(Array(2).fill({ action: "transaction/create", transaction }))).toThrow(/Duplicate/);
    for (const invalid of [{ ...transfer, amountMinor: -1 }, { ...transfer, accountToId: transfer.accountFromId }, { ...transfer, transferPartnerId: transfer.id }]) {
      expect(() => parseChanges([{ action: "transaction/create", transaction: invalid }])).toThrow();
    }
    expect(() => validateReferences(parseChanges([{ action: "transaction/create", transaction: transfer }]), [account, secondAccount], [])).not.toThrow();
    expect(() => validateReferences(parseChanges([{ action: "transaction/create", transaction }]), [account], [transaction])).toThrow(/already exists/);
  });
});

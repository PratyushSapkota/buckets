"use client";

import {
  AccountId,
  Ledger,
  LedgerAccount,
  LocalChange,
  SourceData,
} from "@/types/models";

export function computeLedger(
  changes: LocalChange[],
  sourceData: SourceData,
): Ledger {
  const accounts = new Map<AccountId, LedgerAccount>();

  for (const { balanceMinor, ...account } of sourceData.accounts) {
    accounts.set(account.id, {
      account: account,
      balanceMinor: balanceMinor,
      categoryAmounts: (sourceData.categoricalAmount[account.id] ?? []).map(
        (entry) => ({ ...entry }),
      ),
      origin: "source",
    });
  }

  for (const change of changes) {
    switch (change.action) {
      case "account/create":
        const { account } = change;
        if (accounts.has(account.id)) throw new Error("Duplicate account id");

        accounts.set(account.id, {
          account: account,
          balanceMinor: 0,
          categoryAmounts: [],
          origin: "local",
        });
        break;
      case "account/archive":
        break;
      case "transaction/create":
        break;
      case "transaction/delete":
        break;
      case "transaction/update":
        break;
    }
  }

  return { accounts: accounts };
}

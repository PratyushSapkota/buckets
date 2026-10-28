"use client";

import {
  AccountId,
  Ledger,
  LedgerAccount,
  LocalChange,
  SourceData,
  Transaction,
} from "@/types/models";

export function computeLedger(
  changes: LocalChange[],
  sourceData: SourceData,
): Ledger {
  const accounts = new Map<AccountId, LedgerAccount>();

  function recomputeBalance(id: AccountId, delta: number) {
    const existing = accounts.get(id);
    if (!existing)
      throw new Error("i don't even know how you got this account id");
    accounts.set(id, {
      ...existing,
      balanceMinor: existing.balanceMinor + delta,
    });
  }

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
        const { transaction } = change;
        if (transaction.isTransfer) {
          recomputeBalance(transaction.accountFromId, -transaction.amountMinor);
          recomputeBalance(transaction.accountToId, transaction.amountMinor);
        } else {
          recomputeBalance(transaction.accountId, transaction.amountMinor);
        }
        break;
      case "transaction/delete":
        break;
      case "transaction/update":
        break;
    }
  }

  return { accounts: accounts };
}

export function validateTransactionAccount(
  transaction: Transaction,
  ledger: Ledger,
): void {
  const ids = transaction.isTransfer
    ? [transaction.accountFromId, transaction.accountToId]
    : [transaction.accountId];

  for (const id of ids) {
    const account = ledger.accounts.get(id);

    if (!account || account.account.archived) {
      throw new Error("Selected account is no longer available");
    }
  }

  if (transaction.isTransfer && ids[0] === ids[1]) {
    throw new Error("Transfer accounts must differ");
  }
}

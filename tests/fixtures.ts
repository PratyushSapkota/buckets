import type { Account, AccountId, NonTransferTransaction, TransactionId, TransferTransaction } from "@/types/models";

export const account: Account = { id: "account-a" as AccountId, name: "cash", bucket: "personal", color: "#ffffff", archived: false };
export const secondAccount: Account = { ...account, id: "account-b" as AccountId };
export const transaction: NonTransferTransaction = { id: "transaction-a" as TransactionId, isTransfer: false, accountId: account.id, isoDate: "2026-10-29T00:00:00.000Z", amountMinor: -100, description: "Lunch", category: "food" };
export const transfer: TransferTransaction = { id: "transfer-a" as TransactionId, transferPartnerId: "transfer-b" as TransactionId, isTransfer: true, accountFromId: account.id, accountToId: secondAccount.id, isoDate: transaction.isoDate, amountMinor: 100, description: "Move funds", category: "inter-account-transfer" };

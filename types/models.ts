type Brand<T, B extends string> = T & { readonly __brand: B };

export type AccountId = Brand<string, "AccountId">;
export type TransactionId = Brand<string, "TransactionId">;

export type Account = {
  id: AccountId;
  name: string;
  color: string;
  bucket: string;
  archived: boolean;
};
type BaseTransaction = {
  id: TransactionId;
  isoDate: string;
  amountMinor: number;
  description: string;
};

type TransferTransaction = BaseTransaction & {
  isTransfer: true;
  accountToId: AccountId;
  accountFromId: AccountId;
  transferPartnerId: TransactionId;
  category: "inter-account-transfer";
};

type NonTransferTransaction = BaseTransaction & {
  isTransfer: false;
  accountId: AccountId;
  category: string;
};

export type Transaction = TransferTransaction | NonTransferTransaction;

export type EditableFields<T> = Partial<
  Omit<T, "id" | "isTransfer" | "transferPartnerId">
>;

type TransactionPatch =
  | ({ isTransfer: true } & EditableFields<TransferTransaction>)
  | ({ isTransfer: false } & EditableFields<NonTransferTransaction>);

export type LocalChange =
  | { action: "account/create"; account: Account }
  | { action: "account/archive"; accountId: AccountId }
  | { action: "transaction/create"; transaction: Transaction }
  | { action: "transaction/delete"; transactionId: TransactionId }
  | {
      action: "transaction/update";
      transactionId: TransactionId;
      transactionPatch: TransactionPatch;
    };

export type AccountWithBalance = Account & { balanceMinor: number };

export type CategoryAmount = Record<
  AccountId,
  { category: string; amountMinor: number }[]
>;
export type SourceData = {
  accounts: AccountWithBalance[];
  categoricalAmount: CategoryAmount;
};

type CategoryTotal = Readonly<{
  category: string;
  amountMinor: number;
}>;

export type LedgerAccount = Readonly<{
  account: Readonly<Account>;
  origin: "source" | "local";
  balanceMinor: number;
  categoryAmounts: readonly CategoryTotal[];
}>;

export type Ledger = Readonly<{
  accounts: ReadonlyMap<AccountId, LedgerAccount>;
}>;

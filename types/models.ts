type Brand<T, B extends string> = T & { readonly __brand: B };

type AccountId = Brand<string, "AccountId">;
type TransactionId = Brand<string, "TransactionId">;

type Account = {
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
};

type NonTransferTransaction = BaseTransaction & {
  isTransfer: false;
  accountId: AccountId;
  category: string;
};

type Transaction = TransferTransaction | NonTransferTransaction;

type EditableFields<T> = Partial<
  Omit<T, "id" | "isTransfer" | "transferPartnerId">
>;

type TransactionPatch =
  | ({ isTransfer: true } & EditableFields<TransferTransaction>)
  | ({ isTransfer: false } & EditableFields<NonTransferTransaction>);

type LocalChange =
  | { action: "account/create"; account: Account }
  | { action: "account/archive"; accountId: AccountId }
  | { action: "transaction/create"; transaction: Transaction }
  | { action: "transaction/delete"; transactionId: TransactionId }
  | {
      action: "transaction/update";
      transactionId: TransactionId;
      transactionPatch: TransactionPatch;
    };

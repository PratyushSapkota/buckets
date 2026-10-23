import { AddChange } from "../ledger/LedgerProvider";

type BaseInput = {
  date: Date;
  amount: number; // positive, in major units
  description: string;
};

export type RegularInput = BaseInput & {
  accountId: AccountId;
  category: string;
};

export type TransferInput = BaseInput & {
  accountFromId: AccountId;
  accountToId: AccountId;
};

// ---------- pure builders (no side effects) ----------

function toMinorUnits(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new RangeError("Amount must be a positive number");
  }
  return Math.round(amount * 100);
}

function baseFields({ date, amount, description }: BaseInput) {
  if (Number.isNaN(date.getTime())) {
    throw new RangeError("Invalid date");
  }
  return {
    id: crypto.randomUUID() as TransactionId,
    isoDate: date.toISOString(),
    amountMinor: toMinorUnits(amount),
    description,
  };
}

const SIGN = { income: 1, expense: -1 } as const;

export function createRegularTransaction(
  type: keyof typeof SIGN,
  input: RegularInput,
): NonTransferTransaction {
  const base = baseFields(input);
  return {
    ...base,
    amountMinor: base.amountMinor * SIGN[type],
    isTransfer: false,
    accountId: input.accountId,
    category: input.category,
  };
}

export function createTransferTransaction(
  input: TransferInput,
): TransferTransaction {
  if (input.accountFromId === input.accountToId) {
    throw new Error("Transfer accounts must differ");
  }
  return {
    ...baseFields(input),
    isTransfer: true,
    accountFromId: input.accountFromId,
    accountToId: input.accountToId,
    transferPartnerId: crypto.randomUUID() as TransactionId, // see note 6
  };
}

// ---------- persistence ----------

const save = (addChange: AddChange, transaction: Transaction) =>
  addChange({ action: "transaction/create", transaction });

export const addIncome = (addChange: AddChange, input: RegularInput) =>
  save(addChange, createRegularTransaction("income", input));

export const addExpense = (addChange: AddChange, input: RegularInput) =>
  save(addChange, createRegularTransaction("expense", input));

export const addTransfer = (addChange: AddChange, input: TransferInput) =>
  save(addChange, createTransferTransaction(input));

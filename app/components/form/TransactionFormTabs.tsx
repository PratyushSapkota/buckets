"use client";
import * as chrono from "chrono-node";
import {
  Alert,
  Button,
  Grid,
  NumberInput,
  Tabs,
  TextInput,
} from "@mantine/core";
import { type SubmitEventHandler, useState } from "react";
import { addExpense, addIncome, addTransfer } from "./transactionActions";
import { useLedger } from "../ledger/LedgerProvider";
import { AccountId, Ledger, LedgerAccount, LocalChange } from "@/types/models";
import { AccountSelect } from "./AccountSelect";

type TransactionType = "income" | "expense" | "transfer";

type FormValues = {
  amount: number;
  rawDate: string;
  parsedDate: Date | null;
  description: string;
  account: string;
  category: string;
  accountFrom: string;
  accountTo: string;
};

export function TransactionFormTabs() {
  const { addChange, ledger } = useLedger();

  if (ledger == null) {
    return <div>loading</div>;
  }
  return (
    <Tabs defaultValue="expense" w="40ch" maw="100%">
      <Tabs.List>
        <Tabs.Tab value="income">Income</Tabs.Tab>
        <Tabs.Tab value="expense">Expense</Tabs.Tab>
        <Tabs.Tab value="transfer">Transfer</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="income">
        <TransactionForm
          addChange={addChange}
          transactionType="income"
          ledger={ledger}
        />
      </Tabs.Panel>
      <Tabs.Panel value="expense">
        <TransactionForm
          addChange={addChange}
          transactionType="expense"
          ledger={ledger}
        />
      </Tabs.Panel>
      <Tabs.Panel value="transfer">
        <TransactionForm
          addChange={addChange}
          transactionType="transfer"
          ledger={ledger}
        />
      </Tabs.Panel>
    </Tabs>
  );
}

function parseDate(raw: string): Date | null {
  try {
    return chrono.parseDate(raw);
  } catch {
    return null;
  }
}

function excludeOne(toExclude: AccountId, ledger: Ledger): LedgerAccount[] {
  return Array.from(ledger.accounts.values()).filter(
    ({ account }) => account.id !== toExclude,
  );
}

const defaultFormValues: FormValues = {
  amount: 0,
  rawDate: "today",
  parsedDate: parseDate("today"),
  description: "",
  account: "",
  category: "",
  accountFrom: "",
  accountTo: "",
};

function TransactionForm({
  transactionType,
  addChange,
  ledger,
}: {
  transactionType: TransactionType;
  addChange: (changes: LocalChange) => Promise<number>;
  ledger: Ledger;
}) {
  const [values, setValues] = useState<FormValues>(() => defaultFormValues);

  function setFieldValue<K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!values.parsedDate) {
      console.log("Cannot parse date");
      return;
    }

    const base = {
      date: values.parsedDate,
      amount: values.amount,
      description: values.description,
    };

    try {
      switch (transactionType) {
        case "income":
        case "expense": {
          const input = {
            ...base,
            accountId: values.account as AccountId, // cast once, here
            category: values.category,
          };
          await (transactionType === "income" ? addIncome : addExpense)(
            addChange,
            input,
          );
          break;
        }
        case "transfer":
          await addTransfer(addChange, {
            ...base,
            accountFromId: values.accountFrom as AccountId,
            accountToId: values.accountTo as AccountId,
          });
          break;
      }
      setValues(defaultFormValues);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Please contact support",
      );
      console.log(error)
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {submitError && (
        <Alert title="Unable to add transaction" role="alert" color="red">
          {submitError}
        </Alert>
      )}

      <Grid>
        <Grid.Col span={6}>
          <NumberInput
            label="Amount"
            value={values.amount}
            onChange={(value) => setFieldValue("amount", Number(value))}
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <TextInput
            label={`Date (${values.parsedDate?.toDateString() ?? ""})`}
            value={values.rawDate}
            onChange={(e) => {
              const rawDate = e.currentTarget.value;
              setValues((current) => ({
                ...current,
                rawDate,
                parsedDate: parseDate(rawDate),
              }));
            }}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <TextInput
            label="Description"
            value={values.description}
            onChange={(e) =>
              setFieldValue("description", e.currentTarget.value)
            }
          />
        </Grid.Col>

        {transactionType === "transfer" ? (
          <>
            <Grid.Col span={6}>
              <AccountSelect
                label="From"
                accounts={excludeOne(values.accountTo as AccountId, ledger)}
                selectedAccount={values.accountFrom}
                onChange={(value) => setFieldValue("accountFrom", value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <AccountSelect
                label="To"
                accounts={excludeOne(values.accountFrom as AccountId, ledger)}
                selectedAccount={values.accountTo}
                onChange={(value) => setFieldValue("accountTo", value)}
              />
            </Grid.Col>
          </>
        ) : (
          <>
            <Grid.Col span={6}>
              <AccountSelect
                label="Account"
                accounts={Array.from(ledger.accounts.values())}
                selectedAccount={values.account}
                onChange={(value) => setFieldValue("account", value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Category"
                value={values.category}
                onChange={(e) =>
                  setFieldValue("category", e.currentTarget.value)
                }
              />
            </Grid.Col>
          </>
        )}

        <Grid.Col span={12}>
          <Button type="submit">Submit {transactionType}</Button>
        </Grid.Col>
      </Grid>
    </form>
  );
}

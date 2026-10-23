"use client";
import { Button, Grid, NumberInput, Tabs, TextInput } from "@mantine/core";
import { type SubmitEventHandler, useState } from "react";

import * as chrono from "chrono-node";
import { addExpense, addIncome, addTransfer } from "./transactionActions";
import { useLedger } from "../ledger/LedgerProvider";

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

export function FormTabs() {
  const { addChange } = useLedger();

  return (
    <Tabs defaultValue="expense" w="40ch" maw="100%">
      <Tabs.List>
        <Tabs.Tab value="income">Income</Tabs.Tab>
        <Tabs.Tab value="expense">Expense</Tabs.Tab>
        <Tabs.Tab value="transfer">Transfer</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="income">
        <TransactionForm addChange={addChange} transactionType="income" />
      </Tabs.Panel>
      <Tabs.Panel value="expense">
        <TransactionForm addChange={addChange} transactionType="expense" />
      </Tabs.Panel>
      <Tabs.Panel value="transfer">
        <TransactionForm addChange={addChange} transactionType="transfer" />
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

function TransactionForm({
  transactionType,
  addChange,
}: {
  transactionType: TransactionType;
  addChange: (changes: LocalChange) => Promise<number>;
}) {
  const [values, setValues] = useState<FormValues>(() => ({
    amount: 0,
    rawDate: "today",
    parsedDate: parseDate("today"),
    description: "",
    account: "",
    category: "",
    accountFrom: "",
    accountTo: "",
  }));

  function setFieldValue<K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

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
  };

  return (
    <form onSubmit={handleSubmit}>
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
              <TextInput
                label="From"
                value={values.accountFrom}
                onChange={(e) =>
                  setFieldValue("accountFrom", e.currentTarget.value)
                }
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="To"
                value={values.accountTo}
                onChange={(e) =>
                  setFieldValue("accountTo", e.currentTarget.value)
                }
              />
            </Grid.Col>
          </>
        ) : (
          <>
            <Grid.Col span={6}>
              <TextInput
                label="Account"
                value={values.account}
                onChange={(e) =>
                  setFieldValue("account", e.currentTarget.value)
                }
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

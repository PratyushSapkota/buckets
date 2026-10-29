"use client";

import { Loader, Table, Menu } from "@mantine/core";
import type { AccountId } from "@/types/models";
import { formatBalance } from "@/utils/balance";
import { useLedger } from "./LedgerProvider";

export function TransactionTable() {
  const { ledger } = useLedger();
  if (ledger == null) return <Loader aria-label="Loading transactions" />;

  const accountName = (id: AccountId) =>
    ledger.accounts.get(id)?.account.name ?? `Unknown account (${id})`;

  const rows = Array.from(ledger.transactions.values()).map((entry) => {
    const transaction = entry.transaction;

    return (
      <Menu key={transaction.id}>
        <Menu.Target>
          <Table.Tr>
            <Table.Td>
              <time dateTime={transaction.isoDate}>
                {new Date(transaction.isoDate).toLocaleDateString()}
              </time>
            </Table.Td>
            <Table.Td>
              {formatBalance(transaction.amountMinor).toFixed(2)}
            </Table.Td>
            <Table.Td>
              {transaction.isTransfer
                ? `${accountName(transaction.accountFromId)} → ${accountName(transaction.accountToId)}`
                : accountName(transaction.accountId)}
            </Table.Td>
            <Table.Td>{transaction.category}</Table.Td>
            <Table.Td>{transaction.description}</Table.Td>
          </Table.Tr>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item>Delete</Menu.Item>
          <Menu.Item>Edit</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    );
  });

  return (
    <Table
      aria-label="Transactions"
      withRowBorders={false}
      striped
      highlightOnHover
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Date</Table.Th>
          <Table.Th>Amount</Table.Th>
          <Table.Th>Account</Table.Th>
          <Table.Th>Category</Table.Th>
          <Table.Th>Description</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.length > 0 ? (
          rows
        ) : (
          <Table.Tr>
            <Table.Td colSpan={5}>No transactions available.</Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
}

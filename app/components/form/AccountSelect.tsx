"use client";
import { LedgerAccount } from "@/types/models";
import { Select } from "@mantine/core";

type props = {
  accounts: readonly LedgerAccount[];
  selectedAccount: string;
  label: string;
  onChange: (value: string) => void;
};
export function AccountSelect({
  accounts,
  selectedAccount,
  onChange,
  label,
}: props) {
  const data = accounts.map((account) => ({
    value: account.account.id,
    label: account.account.name,
  }));
  return (
    <Select
      label={label}
      searchable
      data={data}
      value={selectedAccount || null}
      onChange={(value) => onChange(value ?? "")}
      nothingFoundMessage="No accounts found"
    />
  );
}

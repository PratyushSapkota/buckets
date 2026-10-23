"use client";
import { AddChange } from "../ledger/LedgerProvider";

function formatName(name: string): string {
  return name.trim().toLowerCase().replaceAll(" ", "-");
}

export async function addAccount(
  accountName: string,
  bucketName: string,
  color: string,
  addChange: AddChange,
) {
  const change: LocalChange = {
    action: "account/create",
    account: {
      id: crypto.randomUUID() as AccountId,
      name: formatName(accountName),
      bucket: formatName(bucketName),
      color: color,
      archived: false,
    },
  };

  await addChange(change);
}

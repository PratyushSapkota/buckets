"use client"
import { Stack, Text } from "@mantine/core";
import { AccountList } from "../components/ledger/AccountList";
import { ChangeQueue } from "../components/localChanges/ChangeQueue";

export function MobileView() {
  return <main>
    <Stack>
      <AccountList />
      <ChangeQueue />
    </Stack>
  </main>
}

"use client"
import { Box, Flex, Stack } from "@mantine/core";
import { AccountList } from "../components/ledger/AccountList";
import { UserControl } from "../components/UserControl";
import { TransactionTable } from "../components/ledger/TransactionTable";
import { TransactionFormTabs } from "../components/form/TransactionFormTabs";
import { ChangeQueue } from "../components/localChanges/ChangeQueue";

export function DesktopView() {
  return (
    <main>
      <Flex w={"100%"} h={"100dvh"}>
        <Stack justify="space-between" w={"20%"}>
          <AccountList />
          <UserControl  />
        </Stack>

        <Box w={"50%"}>
          <TransactionTable />
        </Box>

        <Box w={"30%"}>
          <TransactionFormTabs />
          <hr />
          <ChangeQueue />
        </Box>
      </Flex>
    </main>
  );
}

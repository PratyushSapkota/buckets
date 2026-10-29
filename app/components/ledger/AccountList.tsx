"use client";
import { Box, Button, Drawer, Flex, Stack, Title } from "@mantine/core";
import { useLedger } from "./LedgerProvider";
import { formatBalance } from "@/utils/balance";
import { LucidePlus } from "lucide-react";
import { useDisclosure } from "@mantine/hooks";
import { AccountForm } from "../form/AccountForm";

export function AccountList() {
  const { ledger } = useLedger();
  const [opened, { open, close }] = useDisclosure(false);
  if (ledger == null) return <div>Wait</div>;

  const accountsMap = ledger.accounts;
  return (
    <Box>
      <Flex>
        <Title size={26} order={1} fw={500}>
          Account Summary
        </Title>
        <Button variant="default" size="compact-sm" fullWidth={false} onClick={open}>
          <LucidePlus />
        </Button>
      </Flex>
      <Stack>
        {Array.from(accountsMap.values()).map((entry) => (
          <Box key={entry.account.id}>
            {entry.account.name} {formatBalance(entry.balanceMinor)}
          </Box>
        ))}
      </Stack>
      <Drawer title="Account Create" opened={opened} onClose={close}>
        <AccountForm drawerClose={close} />
      </Drawer>
    </Box>
  );
}

"use client";
import { Box, Stack, Text } from "@mantine/core";
import { useLedger } from "./LedgerProvider";
import { formatBalance } from "@/utils/balance";

export function AccountList() {
  const { ledger } = useLedger();
  if (ledger == null) return <div>Wait</div>;
  const accountsMap = ledger.accounts;
  return (
    <>
      <Text size="xl" fw={800}>
        Account Summary
      </Text>
      <Stack>
        {Array.from(accountsMap.values()).map((entry) => (
          <Box key={entry.account.id}>
            {entry.account.name} {formatBalance(entry.balanceMinor)}
          </Box>
        ))}
      </Stack>
    </>
  );
}

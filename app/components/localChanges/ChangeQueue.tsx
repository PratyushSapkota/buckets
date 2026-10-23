"use client";

import { getAllChanges } from "@/lib/localDb";
import { Box, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import { useLedger } from "../ledger/LedgerProvider";

export function ChangeQueue() {
  const { localChanges } = useLedger();

  return (
    <Stack>
      {localChanges?.map((localChange) => (
        <Box>{JSON.stringify(localChange)}</Box>
      ))}
    </Stack>
  );
}

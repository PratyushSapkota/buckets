"use client";

import { Box, Button, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import { useLedger } from "../ledger/LedgerProvider";

export function ChangeQueue() {
  const { localChanges, undoChange } = useLedger();

  return (
    <Stack className="w-40">
        <Button onClick={undoChange}>Undo Change</Button>
      {localChanges?.map((localChange) => (
        <Box>{JSON.stringify(localChange)}</Box>
      ))}
    </Stack>
  );
}

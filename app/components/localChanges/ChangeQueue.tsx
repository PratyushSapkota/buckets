"use client";

import { Button, Stack } from "@mantine/core";
import { useLedger } from "../ledger/LedgerProvider";
import { QueueElement } from "./QueueElement";

export function ChangeQueue() {
  const { localChanges, undoChange, syncChanges } = useLedger();

  return (
    <Stack align="flex-end" w="fit-content" maw="100%" gap="xs">
      <Button onClick={undoChange}>Undo Change</Button>
      <Button onClick={syncChanges}>Sync Changes</Button>
      {localChanges?.map((localChange) => (
        <QueueElement key={localChange.sequence} change={localChange} />
      ))}
    </Stack>
  );
}

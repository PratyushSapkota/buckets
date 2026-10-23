"use client";

import { Button, Stack } from "@mantine/core";
import { useLedger } from "../ledger/LedgerProvider";
import { QueueElement } from "./QueueElement";

export function ChangeQueue() {
  const { localChanges, undoChange } = useLedger();

  return (
    <Stack align="flex-end" w="fit-content" maw="100%" gap="xs">
      <Button onClick={undoChange}>Undo Change</Button>
      {localChanges?.map((localChange) => (
        <QueueElement key={localChange.sequence} change={localChange} />
      ))}
    </Stack>
  );
}

import { Box, Text, Flex } from "@mantine/core";
import {
  type LucideIcon,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
} from "lucide-react";

export function QueueElement({ change }: { change: LocalChange }) {
  type QueueElementValues = {
    heading: string;
    subHeading: string;
    leftValue: number | null;
    leftIcon: LucideIcon | null;
  };

  let elementValues: QueueElementValues;
  switch (change.action) {
    case "account/create":
      elementValues = {
        heading: "Create Account",
        subHeading: `${change.account.name} for ${change.account.bucket}`,
        leftIcon: null,
        leftValue: null,
      };
      break;
    case "account/archive":
      elementValues = {
        heading: `Archived Account`,
        subHeading: "",
        leftIcon: null,
        leftValue: null,
      };
      break;
    case "transaction/create":
      if (change.transaction.isTransfer) {
        elementValues = {
          heading: "Transfer money",
          subHeading: "",
          leftIcon: ArrowLeftRight,
          leftValue: change.transaction.amountMinor,
        };
      } else {
        const isExpense = change.transaction.amountMinor < 0;
        elementValues = {
          heading: isExpense ? "Add Expense" : "Add Income",
          subHeading: `from account ${change.transaction.accountId}`,
          leftIcon: isExpense ? ArrowUpRight : ArrowDownLeft,
          leftValue: change.transaction.amountMinor,
        };
      }
      break;
    case "transaction/delete":
      elementValues = {
        heading: "Delete Transaction",
        subHeading: "",
        leftIcon: null,
        leftValue: null,
      };
      break;
    case "transaction/update":
      elementValues = {
        heading: "Delete Transaction",
        subHeading: "",
        leftIcon: null,
        leftValue: null,
      };
      break;
  }

  return (
    <Box
      px="sm"
      py={8}
      h={62}
      w="100%"
      style={{
        border: "1px solid var(--mantine-color-default-border)",
        borderRadius: "var(--mantine-radius-sm)",
      }}
    >
      <Flex align="center" justify="space-between" h="100%" gap="xs">
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text fw={500} size="sm" truncate>
            {elementValues.heading}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {elementValues.subHeading}
          </Text>
        </Box>

        <Flex align="center" gap={6} style={{ flexShrink: 0 }}>
          {elementValues.leftIcon && (
            <elementValues.leftIcon size={16} strokeWidth={1.8} />
          )}

          {elementValues.leftValue !== null && (
            <Text size="sm" fw={500} ff="monospace">
              {Math.abs(elementValues.leftValue / 100).toFixed(2)}
            </Text>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}

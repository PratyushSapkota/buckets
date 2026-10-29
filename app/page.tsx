import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { TransactionFormTabs } from "./components/form/TransactionFormTabs";
import { ChangeQueue } from "./components/localChanges/ChangeQueue";
import { LedgerProvider } from "./components/ledger/LedgerProvider";
import { SourceData } from "@/types/models";
import { getSheetData } from "@/lib/sheets";
import { AccountList } from "./components/ledger/AccountList";
import { TransactionTable } from "./components/ledger/TransactionTable";
import { Box, Flex, Stack } from "@mantine/core";
import { UserControl } from "./components/UserControl";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }
  const user = session.user;
  const sourceData: SourceData = await getSheetData();

  return (
    <main>
      <Flex w={"100%"} h={"100dvh"}>
        <LedgerProvider sourceData={sourceData}>
          <Stack justify="space-between" w={"20%"}>
            <AccountList />
            <UserControl email={user.email ?? ""} image={user.image ?? ""} />
          </Stack>

          <Box w={"50%"}>
            <TransactionTable />
          </Box>
          <Box w={"30%"}>
            <TransactionFormTabs />
            <hr />
            <ChangeQueue />
          </Box>
        </LedgerProvider>
      </Flex>
    </main>
  );
}

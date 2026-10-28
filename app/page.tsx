import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AuthButton from "@/app/components/auth-button";
import { authOptions } from "@/lib/auth";
import { TransactionFormTabs } from "./components/form/TransactionFormTabs";
import { ChangeQueue } from "./components/localChanges/ChangeQueue";
import { LedgerProvider } from "./components/ledger/LedgerProvider";
import { AccountForm } from "./components/form/AccountForm";
import { SourceData } from "@/types/models";
import { getSheetData } from "@/lib/sheets";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const sourceData: SourceData = await getSheetData();

  return (
    <main className="m-2">
      <p>Signed in as {session.user?.email}</p>
      <AuthButton action="signOut" />

      <LedgerProvider sourceData={sourceData}>
        <TransactionFormTabs />
        <hr />
        <AccountForm />
        <hr />
        <ChangeQueue />
      </LedgerProvider>
    </main>
  );
}

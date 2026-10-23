import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AuthButton from "@/app/components/auth-button";
import { authOptions } from "@/lib/auth";
import { FormTabs } from "./components/form/FormTabs";
import { ChangeQueue } from "./components/localChanges/ChangeQueue";
import { LedgerProvider } from "./components/ledger/LedgerProvider";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="m-2">
      <p>Signed in as {session.user?.email}</p>
      <AuthButton action="signOut" />

      <LedgerProvider sourceData={null}>
        <FormTabs />
        <ChangeQueue />
      </LedgerProvider>

    </main>
  );
}

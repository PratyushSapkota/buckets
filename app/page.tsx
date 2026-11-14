import { requireUser } from "@/lib/auth";
import { LedgerProvider } from "./components/ledger/LedgerProvider";
import { SourceData } from "@/types/models";
import { getSheetData } from "@/lib/sheets";

import { ResponsiveView } from "./views/ResponsiveView";
import { AuthProvider } from "./components/AuthProvider";

export default async function Home() {
  const user = await requireUser();
  const sourceData: SourceData = await getSheetData();

  return (
    <AuthProvider user={user}>
      <LedgerProvider sourceData={sourceData}>
        <ResponsiveView />
      </LedgerProvider>
    </AuthProvider>
  );
}

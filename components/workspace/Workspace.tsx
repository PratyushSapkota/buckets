import { CreateBucket } from "@/feature/buckets/components/CreateBucket";
import { PendingChanges } from "@/feature/local/components/PendingChanges";
import { initializeSpreadsheet } from "@/feature/spreadsheet";

export async function Workspace({ userId }: { userId: string }) {
  const spreadSheetId = await initializeSpreadsheet(userId);
  return (
    <>
      <CreateBucket />
      <PendingChanges />  
    </>
  );
}

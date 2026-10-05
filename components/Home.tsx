import { getCurrentUserId } from "@/lib/session";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Workspace } from "./workspace/Workspace";
import { ensureSpreadsheet } from "@/feature/spreadsheet/ensure";
import { WorkspaceLoading } from "./workspace/WorkspaceLoading";
import { PendingChanges } from "@/feature/local/components/PendingChanges";

export default async function Home() {
  const userId = await getCurrentUserId();
  console.log(`userID: ${userId}`);
  if (!userId) {
    redirect("/login");
  }
  return (
    <main>
      <h1>Home</h1>
      <form action={"/auth/logout"} method="post">
        <button type="submit">Logout</button>
      </form>
      <Suspense fallback={<WorkspaceLoading />}>
        <Workspace userId={userId} />
      </Suspense>
    </main>
  );
}

import { CreateTransaction } from "@/feature/transactions/components/CreateTransaction";
import { Sidebar } from "./sidebar";

export function DesktopHome() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="">
        <CreateTransaction />
      </main>
    </div>
  );
}

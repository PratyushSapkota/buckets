import { CreateBucket } from "@/feature/buckets/components/CreateBucket";
import { CreateTransaction } from "@/feature/transactions/components/CreateTransaction";

export function MobileHome() {
  return (
    <main>
      Hello World
      <CreateBucket />

      <CreateTransaction />
    </main>
  );
}

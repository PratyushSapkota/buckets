import { getBucketNames, getBuckets } from "@/feature/buckets/queries";
import { AccountControl } from "./desktop/AccountControl";
import { BucketCard } from "@/feature/buckets/components/BucketCard";
import { CreateBucket } from "@/feature/buckets/components/CreateBucket";

export async function Sidebar() {
  const buckets = await getBuckets();
  return (
    <div className="flex flex-col w-1/5 border border-amber-800">
      <div id="main-logo" className="font-bold">
        Buckets
      </div>
      <div id="buckets-container">
        <span>Active buckets and accounts.</span>
        <CreateBucket />
        <div id="buckets-list">
          {buckets.map((bucket) => (
            <BucketCard key={bucket.id} bucket={bucket} />
          ))}
        </div>
      </div>
      <AccountControl />
    </div>
  );
}

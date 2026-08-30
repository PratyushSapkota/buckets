import { Bucket } from "@/lib/database/types";

import { CreateAccount } from "@/feature/accounts/components/CreateAccount";
import { SelectBucket } from "./SelectBucket";
import { getAccounts } from "@/feature/accounts/queries";

export async function BucketCard({ bucket }: { bucket: Bucket }) {
  const accounts = await getAccounts(bucket.id);
  return (
    <div>
      <span>{bucket.name}</span>
      <CreateAccount
        bucketSelect={
          <SelectBucket formItemName="bucketId" selected={bucket.id} />
        }
      />
      <div>{accounts.map((account) => account.name)}</div>
    </div>
  );
}

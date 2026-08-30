import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getBucketNames } from "../queries";

export async function SelectBucket({
  formItemName,
  selected,
}: {
  formItemName: string;
  selected?: string;
}) {
  const bucketNames = await getBucketNames();
  const bucketOptions = Object.entries(bucketNames).map(([value, label]) => ({
    label,
    value,
  }));

  return (
    <Select name={formItemName} items={bucketOptions} defaultValue={selected}>
      <SelectTrigger>
        <SelectValue placeholder="Select a bucket" />
      </SelectTrigger>
      <SelectContent>
        {bucketOptions.map(({ label, value }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

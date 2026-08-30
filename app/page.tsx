import { Sidebar } from "@/components/sidebar";
import { BucketCards } from "@/feature/buckets/components/BucketCards";
import { requireUser } from "@/lib/auth";
import Image from "next/image";

export default async function Home() {
  const user = await requireUser();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className=""></main>
    </div>
  );
}

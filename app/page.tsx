import { requireUser } from "@/lib/auth";
import Image from "next/image";

export default async function Home() {
  const user = await requireUser();
  return (
    <div>
      <main></main>
    </div>
  );
}

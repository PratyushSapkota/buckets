import { CreateBucket } from "@/feature/buckets/components/CreateBucket";
import { getCurrentUserId } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Home() {
  const userId = await getCurrentUserId();
  console.log(`userID: ${userId}`);
  if (!userId) {
    redirect("/login");
  }
  return (
    <main>
      <h1>Home</h1>
      <div>
        <CreateBucket />
      </div>
      <form action={"/auth/logout"} method="post">
        <button type="submit">Logout</button>
      </form>
    </main>
  );
}

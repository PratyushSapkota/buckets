import SpreadsheetStatus from "@/components/sheet/Status";
import { getCurrentUserId } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Home() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/login");
  }

  return (
    <main>
      <h1>Home</h1>

      <SpreadsheetStatus userId={userId} />

      <form action={"/auth/logout"} method="post">
        <button type="submit">Logout</button>
      </form>
    </main>
  );
}

import ServiceUnavailable from "@/components/ServiceUnavailable";
import SpreadsheetStatus from "@/components/sheet/Status";
import { initializeSpreadsheet } from "@/feature/spreadsheet";
import { isRedisUnavailableError } from "@/lib/redis";
import { getCurrentUserId } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Home() {
  let userId: string | null;

  try {
    userId = await getCurrentUserId();
  } catch (error) {
    if (isRedisUnavailableError(error)) {
      return <ServiceUnavailable service="Sign-in" />;
    }

    throw error;
  }

  if (!userId) {
    redirect("/login");
  }

  let spreadsheetId: string;

  try {
    spreadsheetId = await initializeSpreadsheet(userId);
  } catch (error) {
    if (isRedisUnavailableError(error)) {
      return <ServiceUnavailable service="Your account data" />;
    }

    throw error;
  }

  return (
    <main>
      <h1>Home</h1>

      <SpreadsheetStatus spreadsheetId={spreadsheetId} />

      <form action={"/auth/logout"} method="post">
        <button type="submit">Logout</button>
      </form>
    </main>
  );
}

import { Button, Text } from "@mantine/core";
import { redirect } from "next/navigation";
import { currentSession } from "@/auth/service";

export default async function Home() {
  let sub: string | null = null;
  let unavailable = false;
  try { sub = await currentSession(); } catch { unavailable = true; }
  if (!unavailable && !sub) redirect("/login");

  return (
    <main>
      {unavailable ? (
        <>
          <Text role="alert">Temporarily unavailable</Text>
          <Button component="a" href="/">Retry</Button>
        </>
      ) : (
        <form action="/logout" method="post">
          <Button type="submit">Sign out</Button>
        </form>
      )}
    </main>
  );
}

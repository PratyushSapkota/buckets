import { getCurrentUserId } from "@/lib/session";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Login() {
  const sessionId = await getCurrentUserId();

  if (sessionId) {
    redirect("/");
  }

  return (
    <main>
      <Link href={"/auth/google"}>Login with google</Link>
    </main>
  );
}

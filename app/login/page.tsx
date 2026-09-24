import { getCurrentUserId } from "@/lib/session";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Login() {
  const userId = await getCurrentUserId();

  if (userId) {
    redirect("/");
  }

  return (
    <main>
      <a href={"/auth/google"}>Login with google</a>
    </main>
  );
}

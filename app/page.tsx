import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AuthButton from "@/app/components/auth-button";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="auth-card">
      <p className="eyebrow">Buckets</p>
      <h1>Home</h1>
      <p>Signed in as {session.user?.email}</p>
      <AuthButton action="signOut" />
    </main>
  );
}

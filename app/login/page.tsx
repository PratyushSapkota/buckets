import { LoginForm } from "@/components/login-form";
import { getUser, signInWithEmailAndPassword } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Login() {
  if (await getUser()) {
    redirect("/");
  }
  return (
    <main>
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm onLogin={signInWithEmailAndPassword} />
        </div>
      </div>
    </main>
  );
}

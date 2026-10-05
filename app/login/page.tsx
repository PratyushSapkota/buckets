import type { Metadata } from "next";
import { Button, Text } from "@mantine/core";
import { redirect } from "next/navigation";
import { currentSession } from "@/auth/service";
export const metadata: Metadata = { title: "Sign in | Buckets" };
const messages: Record<string, string> = {
  configuration: "Sign-in is not configured.",
  denied: "Account not approved.",
  failed: "Sign-in failed. Try again.",
  state: "Sign-in expired or invalid. Try again.",
  cancelled: "Sign-in cancelled.",
  unavailable: "Authentication is temporarily unavailable.",
  worksheet: "Worksheet setup failed. Try again.",
};
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  let unavailable = false;
  let sub: string | null = null;
  try {
    sub = await currentSession();
  } catch {
    unavailable = true;
  }
  if (sub) redirect("/");
  const { error } = await searchParams;
  const message = unavailable
    ? messages.unavailable
    : typeof error === "string" && Object.hasOwn(messages, error)
      ? messages[error]
      : null;
  return (
    <main>
      {message && <Text role="alert">{message}</Text>}
      <Button component="a" href="/auth/google">
        Continue with Google
      </Button>
    </main>
  );
}

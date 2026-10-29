"use client";

import { useRef, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { Button } from "@mantine/core";
import { clearChanges } from "@/lib/localDb";

export default function AuthButton({
  action,
}: {
  action: "signIn" | "signOut";
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  async function handleClick() {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError(null);
    let cleaned = false;

    try {
      await clearChanges();
      cleaned = true;
      if (action === "signIn") {
        await signIn("google", { callbackUrl: "/" });
      } else {
        await signOut({ callbackUrl: "/login" });
      }
    } catch {
      setError(cleaned ? "Unable to complete sign-in or sign-out. Please try again." : "Unable to clear pending changes. Please try again before signing in or out.");
      setPending(false);
      inFlight.current = false;
    }
  }

  return (
    <>
      <Button type="button" onClick={handleClick} disabled={pending}>
        {pending
          ? "Please wait…"
          : action === "signIn"
            ? "Continue with Google"
            : "Sign out"}
      </Button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}

"use client";

import { useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@mantine/core";
import { clearChanges } from "@/lib/localDb";

export default function SignInButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  async function handleClick() {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError(null);

    try {
      await clearChanges();
      await signIn("google", { callbackUrl: "/" });
    } catch {
      setError(
        "Unable to clear pending changes. Please try again before signing in.",
      );
      setPending(false);
      inFlight.current = false;
    }
  }

  return (
    <>
      <Button type="button" onClick={handleClick} disabled={pending}>
        {pending ? "Please wait…" : "Continue with Google"}
      </Button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
"use client";

import { useState } from "react";
import { signIn, signOut } from "next-auth/react";

export default function AuthButton({ action }: { action: "signIn" | "signOut" }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function handleClick() {
    setPending(true);
    setError(false);

    try {
      if (action === "signIn") {
        await signIn("google", { callbackUrl: "/" });
      } else {
        await signOut({ callbackUrl: "/login" });
      }
    } catch {
      setError(true);
      setPending(false);
    }
  }

  return (
    <>
      <button type="button" onClick={handleClick} disabled={pending}>
        {pending
          ? "Please wait…"
          : action === "signIn"
            ? "Continue with Google"
            : "Sign out"}
      </button>
      {error && (
        <p className="auth-error" role="alert">
          Something went wrong. Please try again.
        </p>
      )}
    </>
  );
}

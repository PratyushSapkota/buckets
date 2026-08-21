"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createToastManager, Toaster } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

type LoginAction = (email: string, password: string) => Promise<unknown>;

type LoginFormProps = React.ComponentProps<"div"> & {
  onLogin: LoginAction;
};

export function LoginForm({ className, onLogin, ...props }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [passwordStep, setPasswordStep] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [loginToast] = useState(() => createToastManager());

  useEffect(() => {
    if (passwordStep) {
      passwordRef.current?.focus();
    }
  }, [passwordStep]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!passwordStep) {
      setPasswordStep(true);
      return;
    }

    setIsLoggingIn(true);

    const login = Promise.resolve()
      .then(() => onLogin(email, password))
      .finally(() => setIsLoggingIn(false));

    void loginToast
      .promise(login, {
        loading: "Signing in...",
        success: "Signed in successfully.",
        error: (error) =>
          error instanceof Error ? error.message : "Unable to sign in.",
      })
      .then(() => router.replace("/"))
      .catch(() => undefined);
  }

  return (
    <Toaster toastManager={loginToast} position="top-center">
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-xl font-bold">Welcome to Buckets.</h1>
              <FieldDescription>Whitelisted only.</FieldDescription>
            </div>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <div
              className={cn(
                "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out",
                passwordStep
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
              aria-hidden={!passwordStep}
            >
              <div className="min-h-0">
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    ref={passwordRef}
                    id="password"
                    type="password"
                    required={passwordStep}
                    disabled={!passwordStep}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </Field>
              </div>
            </div>
            <Field>
              <Button type="submit" disabled={isLoggingIn}>
                {passwordStep ? "Login" : "Continue"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </Toaster>
  );
}

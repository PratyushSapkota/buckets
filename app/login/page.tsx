import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AuthButton from "@/app/components/auth-button";
import { authOptions } from "@/lib/auth";

const errorMessages: Record<string, string> = {
  AccessDenied: "This Google account does not have access. Use an approved email address.",
  OAuthSignin: "Could not start Google sign-in. Please try again.",
  OAuthCallback: "Google sign-in was cancelled or could not be completed. Please try again.",
  OAuthAccountNotLinked: "Please use the Google account you originally signed in with.",
  Configuration: "Sign-in is not configured correctly. Please contact the administrator.",
};

export default async function Login({ searchParams }: PageProps<"/login">) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  const { error } = await searchParams;
  const errorCode = typeof error === "string" ? error : undefined;

  return (
    <main>
      <p>Buckets</p>
      <h1>Sign in</h1>
      {errorCode && (
        <p role="alert">
          {Object.hasOwn(errorMessages, errorCode)
            ? errorMessages[errorCode]
            : "Unable to sign in. Please try again."}
        </p>
      )}
      <AuthButton action="signIn" />
    </main>
  );
}

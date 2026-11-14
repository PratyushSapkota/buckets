import { getServerSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { isAllowedEmail } from "./allowlist";
import { getServerConfig } from "./config";
import { LedgerError } from "./ledgerErrors";
import { redirect } from "next/navigation";

const config = getServerConfig();

export const authOptions: NextAuthOptions = {
  secret: config.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: config.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: config.GOOGLE_OAUTH_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    signIn({ account, profile }) {
      if (
        account?.provider !== "google" ||
        !profile?.email ||
        !("email_verified" in profile) ||
        profile.email_verified !== true
      ) {
        return false;
      }

      return isAllowedEmail(profile.email);
    },
  },
};

export async function getUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new LedgerError(
      "UNAUTHORIZED",
      "Please sign in before accessing your ledger.",
    );
  }

  if (!session.user.email) {
    throw new LedgerError(
      "UNAUTHORIZED",
      "Your session is missing an email. Please sign in again.",
    );
  }

  if (!isAllowedEmail(session.user.email)) {
    throw new LedgerError(
      "FORBIDDEN",
      "This account does not have access to the ledger.",
    );
  }

  return session.user;
}

export async function requireUser() {
  try {
    return await getUser();
  } catch (error) {
    if (error instanceof LedgerError && error.code === "UNAUTHORIZED") {
      redirect("/login");
    }
    throw error;
  }
}

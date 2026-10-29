import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { isAllowedEmail } from "./allowlist";
import { getServerConfig } from "./config";

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

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
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

      const allowedEmails = (process.env.GOOGLE_OAUTH_ALLOWED_EMAILS ?? "")
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);

      return allowedEmails.includes(profile.email.trim().toLowerCase());
    },
  },
};

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buckets",
  description: "Sign in to Buckets with your Google account.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

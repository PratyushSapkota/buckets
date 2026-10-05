import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";
import "@mantine/core/styles.css";

export const metadata: Metadata = {
  title: "Buckets",
  description: "Your personal finance workspace",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head><ColorSchemeScript /></head>
      <body><MantineProvider>{children}</MantineProvider></body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OurSociete - Earn Real Income. Stay Completely Anonymous.",
  description: "Join a private, professional platform built for creators who value their privacy. No explicit content required.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

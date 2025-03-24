import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ToasterProvider } from "@/components/providers/toaster-provider";
import { Navbar } from "@/components/ui/navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WriteSharp - Sharpen Your Writing Skills",
  description:
    "WriteSharp helps you organize ideas, write better, and track your writing skill level—all in one app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <ToasterProvider />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}

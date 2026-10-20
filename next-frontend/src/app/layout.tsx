import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";
import { SessionProvider } from "@/lib/session";

export const metadata: Metadata = {
  title: "RetailPOS Cloud — Multi-tenant Retail Platform",
  description:
    "Super Admin platform panel, vendor retail management panel and Flutter POS backend for multi-tenant retail SaaS.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F7F8F9] text-[#212B36] antialiased">
        <SessionProvider initial={DEMO_ACCOUNTS[1]}>{children}</SessionProvider>
      </body>
    </html>
  );
}

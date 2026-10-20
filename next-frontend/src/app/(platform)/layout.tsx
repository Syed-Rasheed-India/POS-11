"use client";

import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { platformNav } from "@/lib/nav";
import { DEMO_ACCOUNTS, type DemoSession } from "@/lib/demo-accounts";
import { SessionProvider, useSession } from "@/lib/session";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const active: DemoSession = session.kind === "PLATFORM" ? session : DEMO_ACCOUNTS[0];

  const shell = (
    <AdminShell
      nav={platformNav}
      brand="RetailPOS Cloud"
      brandSub="Super Admin Panel"
      userName={active.name}
      userRole={active.role}
      userEmail={active.email}
      quickActions={[{ label: "New Vendor", href: "/super-admin/vendors/new", icon: "plus" }]}
    >
      <PanelBar />
      {children}
    </AdminShell>
  );

  // A visitor landing straight on a Super Admin URL is signed in as the
  // platform admin so every screen renders immediately (UI prototype).
  return session.kind === "PLATFORM" ? shell : (
    <SessionProvider initial={DEMO_ACCOUNTS[0]}>{shell}</SessionProvider>
  );
}

function PanelBar() {
  const { session } = useSession();
  return (
    <div className="no-print mb-2 flex flex-wrap items-center justify-between gap-2">
      <span className="text-[11px] font-semibold text-[#7A8086]">
        Signed in as {session.name} · {session.role}
      </span>
      <div className="flex items-center gap-3">
        <Link href="/" className="text-[11px] font-semibold text-[#0984E3] hover:underline">
          Switch to vendor panel →
        </Link>
        <Link href="/login" className="text-[11px] font-semibold text-[#7A8086] hover:text-[#FE9F43]">
          Sign out
        </Link>
      </div>
    </div>
  );
}

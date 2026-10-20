"use client";

import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { vendorNav } from "@/lib/nav";
import { DEMO_ACCOUNTS, type DemoSession } from "@/lib/demo-accounts";
import { SessionProvider, useSession, useTenant } from "@/lib/session";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const active: DemoSession = session.kind === "COMPANY" ? session : DEMO_ACCOUNTS[1];

  const shell = (
    <VendorShell active={active}>
      {children}
    </VendorShell>
  );

  return session.kind === "COMPANY" ? shell : (
    <SessionProvider initial={DEMO_ACCOUNTS[1]}>{shell}</SessionProvider>
  );
}

function VendorShell({ children, active }: { children: React.ReactNode; active: DemoSession }) {
  const { session } = useSession();
  const tenant = useTenant();

  return (
    <AdminShell
      nav={vendorNav}
      brand="RetailPOS Cloud"
      brandSub={tenant.company.name}
      userName={active.name}
      userRole={active.role}
      userEmail={active.email}
      quickActions={[
        { label: "POS", href: "/pos", icon: "cart" },
        { label: "New Product", href: "/products/new", icon: "plus" },
      ]}
    >
      <div className="no-print mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-[#7A8086]">
          Signed in as {session.name} · {session.role} · {tenant.company.name}
        </span>
        <div className="flex items-center gap-3">
          <Link href="/super-admin" className="text-[11px] font-semibold text-[#0984E3] hover:underline">
            Switch to Super Admin panel →
          </Link>
          <Link href="/login" className="text-[11px] font-semibold text-[#7A8086] hover:text-[#FE9F43]">
            Sign out
          </Link>
        </div>
      </div>
      {children}
    </AdminShell>
  );
}

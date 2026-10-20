"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { clsx } from "@/lib/format";
import { Icon, type IconName } from "./icons";

export type NavItem = { label: string; href: string; icon: IconName; badge?: string };
export type NavGroup = { label: string; items: NavItem[] };

export function AdminShell({
  nav,
  brand,
  brandSub,
  userName,
  userRole,
  userEmail,
  children,
  quickActions,
}: {
  nav: NavGroup[];
  brand: string;
  brandSub: string;
  userName: string;
  userRole: string;
  userEmail: string;
  children: React.ReactNode;
  quickActions?: { label: string; href: string; icon: IconName }[];
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<string[]>([]);

  const toggle = (label: string) =>
    setCollapsed((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-screen bg-[#F7F8F9]">
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col bg-black transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#8B5CF6] text-white">
            <Icon name="cart" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{brand}</p>
            <p className="truncate text-[11px] text-white/60">{brandSub}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
          {nav.map((group) => {
            const isCollapsed = collapsed.includes(group.label);
            return (
              <div key={group.label}>
                <button
                  type="button"
                  onClick={() => toggle(group.label)}
                  className="mb-1 flex w-full items-center justify-between px-2 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white/70"
                >
                  {group.label}
                  <Icon name="down" className={clsx("h-3 w-3 transition", isCollapsed && "-rotate-90")} />
                </button>
                {!isCollapsed ? (
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={clsx(
                              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition",
                              active
                                ? "bg-[#8B5CF6] text-white shadow-sm"
                                : "text-white/70 hover:bg-white/10 hover:text-white",
                            )}
                          >
                            <Icon name={item.icon} className="h-4 w-4 shrink-0" />
                            <span className="truncate">{item.label}</span>
                            {item.badge ? (
                              <span className="ml-auto rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] font-bold">
                                {item.badge}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-4 py-3">
          <p className="text-[10px] text-white/40">RetailPOS Cloud · v1.4.2</p>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      ) : null}

      <div className="lg:ml-[250px]">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#E6EAED] bg-white px-4 lg:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-[#646B72] hover:bg-[#F9FAFB] lg:hidden"
            aria-label="Open menu"
          >
            <Icon name="menu" className="h-5 w-5" />
          </button>

          <div className="hidden min-w-0 flex-1 md:block">
            <div className="relative max-w-sm">
              <Icon
                name="search"
                className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#A6AAAF]"
              />
              <input
                placeholder="Search products, invoices, customers…"
                className="w-full rounded-lg border border-[#E6EAED] bg-[#F9FAFB] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {quickActions?.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="hidden items-center gap-2 rounded-lg bg-[#8B5CF6] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#7c3aed] sm:inline-flex"
              >
                <Icon name={action.icon} className="h-4 w-4" />
                {action.label}
              </Link>
            ))}
            <div className="flex items-center gap-2.5 rounded-lg border border-[#E6EAED] px-2.5 py-1.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#8B5CF6] text-[11px] font-bold text-white">
                {userName
                  .split(" ")
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join("")}
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-xs font-bold text-[#212B36]">{userName}</p>
                <p className="text-[10px] text-[#7A8086]">{userRole}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] p-4 lg:p-6">{children}</main>

        <footer className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-2 px-4 pb-6 text-xs text-[#7A8086] lg:px-6">
          <p>© {new Date().getFullYear()} RetailPOS Cloud · Multi-tenant retail platform</p>
          <p>{userEmail}</p>
        </footer>
      </div>
    </div>
  );
}
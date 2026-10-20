"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { DEMO_ACCOUNTS, SessionProvider, useSession, type DemoSession } from "@/lib/session";

const DEMO_LIST = [
  {
    role: "Super Admin",
    email: "admin@retailpos.cloud",
    scope: "Platform · vendors, plans, billing, support",
  },
  {
    role: "Vendor owner — ABC Supermarket",
    email: "owner+cmp-001@abcsupermarket.qa",
    scope: "Full company access · 2 branches",
  },
  {
    role: "Vendor owner — Freshmart Electronics",
    email: "owner+cmp-003@freshmart.qa",
    scope: "Enterprise plan · multi warehouse",
  },
  {
    role: "Cashier — ABC Supermarket",
    email: "ravi@cmp-001.qa",
    scope: "POS terminal and sales only (RBAC)",
  },
];

export default function LoginPage() {
  return (
    <SessionProvider initial={DEMO_ACCOUNTS[1]}>
      <LoginInner />
    </SessionProvider>
  );
}

function LoginInner() {
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState("admin@retailpos.cloud");
  const [error, setError] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const account = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!account) {
      setError("Unknown demo account — pick one of the accounts below.");
      return;
    }
    signIn(account as DemoSession);
    router.push(account.kind === "PLATFORM" ? "/super-admin" : "/");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-[#092C4C] p-10 lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#FE9F43] text-white">
            <Icon name="cart" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-white">RetailPOS Cloud</p>
            <p className="text-[11px] text-white/60">Multi-tenant retail platform</p>
          </div>
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl font-bold leading-tight text-white">
            One platform for every retail shop you run.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            The Super Admin manages vendors, plans and revenue. Vendors run branches, warehouses,
            inventory, purchasing and the POS. Tenant data stays isolated at every layer.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/80">
            {[
              "SaaS subscriptions with feature flags",
              "RBAC for platform and tenant users",
              "Offline-first Flutter POS with sync queue",
              "Inventory ledger, COGS and profit reports",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-[#FE9F43]">
                  <Icon name="check" className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[11px] text-white/40">
          UI prototype · DreamsPOS inspired design system · no backend required
        </p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#FE9F43] text-white">
              <Icon name="cart" className="h-5 w-5" />
            </span>
            <p className="text-sm font-bold text-[#212B36]">RetailPOS Cloud</p>
          </div>

          <h2 className="text-2xl font-bold text-[#212B36]">Sign in</h2>
          <p className="mt-1 text-sm text-[#646B72]">
            Pick a demo account — any password works in this UI prototype.
          </p>

          {error ? (
            <p className="mt-4 rounded-lg border border-[#FBD5D5] bg-[#FDECEC] px-3 py-2 text-sm font-medium text-[#D63031]">
              {error}
            </p>
          ) : null}

          <form onSubmit={submit} className="mt-6 space-y-4 rounded-xl border border-[#E6EAED] bg-white p-6">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#646B72]">
                Email address
              </span>
              <input
                name="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-[#E6EAED] px-3 py-2.5 text-sm outline-none focus:border-[#FE9F43]"
                placeholder="you@company.com"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#646B72]">
                Password
              </span>
              <input
                name="password"
                type="password"
                required
                defaultValue="password"
                className="w-full rounded-lg border border-[#E6EAED] px-3 py-2.5 text-sm outline-none focus:border-[#FE9F43]"
                placeholder="••••••••"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-lg bg-[#FE9F43] py-2.5 text-sm font-bold text-white transition hover:bg-[#E58A2C]"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-[#E6EAED] bg-white p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#646B72]">Demo accounts</p>
            <ul className="space-y-3">
              {DEMO_LIST.map((account) => (
                <li key={account.email}>
                  <button
                    type="button"
                    onClick={() => setEmail(account.email)}
                    className="w-full rounded-lg border border-transparent px-2 py-1.5 text-left transition hover:border-[#FE9F43] hover:bg-[#FFF6EE]"
                  >
                    <p className="text-xs font-bold text-[#212B36]">{account.role}</p>
                    <p className="font-mono text-[11px] text-[#646B72]">{account.email}</p>
                    <p className="text-[11px] text-[#7A8086]">{account.scope}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useSyncExternalStore } from "react";
import {
  addons,
  companyAddons as seedAddons,
  companies,
  planById,
  subscriptionChanges as seedChanges,
  subscriptions as seedSubscriptions,
} from "./sa-data";

/* ------------------------------------------------------------------ *
 * Live Super Admin store (UI only).
 * Assigning a subscription or attaching an add-on updates every screen
 * that reads it — vendor detail, subscriptions, usage, invoices, KPIs.
 * ------------------------------------------------------------------ */

export type SubscriptionRow = {
  id: number;
  companyId: number;
  planId: number;
  cycle: "MONTHLY" | "YEARLY";
  start: Date;
  end: Date;
  status: "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED" | "EXPIRED";
  autoRenew: boolean;
  price: number;
  currencyId: number;
};

export type CompanyAddonRow = {
  id: number;
  companyId: number;
  addonId: number;
  qty: number;
  price: number;
  from: Date;
  to: Date;
  status: "ACTIVE" | "CANCELLED";
};

export type ChangeRow = {
  id: number;
  companyId: number;
  type: string;
  oldPlan: number;
  newPlan: number;
  reason: string;
  by: string;
  at: Date;
};

type State = {
  subscriptions: SubscriptionRow[];
  addons: CompanyAddonRow[];
  changes: ChangeRow[];
};

const initialState: State = {
  subscriptions: seedSubscriptions.map((sub) => ({ ...sub })) as SubscriptionRow[],
  addons: seedAddons.map((addon) => ({ ...addon, status: "ACTIVE" as const })),
  changes: seedChanges.map((change) => ({ ...change })),
};

let state: State = initialState;
const listeners = new Set<() => void>();

function setState(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

export function useSaStore(): State {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/* ----------------------------- selectors ------------------------------ */

export function subscriptionFor(companyId: number, rows: SubscriptionRow[] = state.subscriptions) {
  return rows.find((sub) => sub.companyId === companyId) ?? null;
}

export function addonsFor(companyId: number, rows: CompanyAddonRow[] = state.addons) {
  return rows.filter((addon) => addon.companyId === companyId && addon.status === "ACTIVE");
}

export function addonName(addonId: number) {
  return addons.find((a) => a.id === addonId)?.name ?? "Add-on";
}

export function planLimitsFor(companyId: number) {
  const sub = subscriptionFor(companyId);
  if (!sub) return [];
  const plan = planById(sub.planId);
  return plan ? plan.limits : [];
}

export function usageRowsFor(companyId: number) {
  const company = companies.find((c) => c.id === companyId);
  if (!company) return [];
  const actual: Record<string, number> = {
    MAX_USERS: company.users.length,
    MAX_BRANCHES: company.branches.length,
    MAX_WAREHOUSES: company.warehouses.length,
    MAX_TERMINALS: company.terminals.length,
    MAX_PRODUCTS: 420 + company.id * 130,
    MAX_PRICE_LISTS: 3,
    MAX_API_REQUESTS: 12000 + company.id * 8400,
  };
  return planLimitsFor(companyId).map((limit) => ({
    code: limit.code,
    value: actual[limit.code] ?? 0,
    limit: limit.unlimited ? Number.MAX_SAFE_INTEGER : limit.value,
    unlimited: limit.unlimited,
  }));
}

export function mrrFromStore(rows: SubscriptionRow[] = state.subscriptions, addonRows: CompanyAddonRow[] = state.addons) {
  const base = rows
    .filter((sub) => sub.status === "ACTIVE")
    .reduce((sum, sub) => sum + (sub.cycle === "MONTHLY" ? sub.price : Math.round(sub.price / 12)), 0);
  const extra = addonRows
    .filter((addon) => addon.status === "ACTIVE")
    .reduce((sum, addon) => sum + addon.qty * addon.price, 0);
  return base + extra;
}

/* ------------------------------ actions ------------------------------ */

export type AssignInput = {
  companyId: number;
  planId: number;
  cycle: "MONTHLY" | "YEARLY";
  startTrial: boolean;
  autoRenew: boolean;
  reason?: string;
  by?: string;
};

export function assignSubscription(input: AssignInput): { ok: boolean; message: string } {
  const company = companies.find((c) => c.id === input.companyId);
  const plan = planById(input.planId);
  if (!company || !plan) return { ok: false, message: "Select a vendor and a plan." };

  const existing = subscriptionFor(input.companyId);
  const price = input.cycle === "YEARLY" ? plan.yearly : plan.monthly;
  const trialDays = plan.trialDays;
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + (input.startTrial ? trialDays : input.cycle === "YEARLY" ? 365 : 30));

  const row: SubscriptionRow = {
    id: existing?.id ?? Math.max(0, ...state.subscriptions.map((s) => s.id)) + 1,
    companyId: input.companyId,
    planId: plan.id,
    cycle: input.cycle,
    start,
    end,
    status: input.startTrial ? "TRIAL" : "ACTIVE",
    autoRenew: input.autoRenew,
    price,
    currencyId: plan.currencyId,
  };

  const subscriptions = existing
    ? state.subscriptions.map((sub) => (sub.id === existing.id ? row : sub))
    : [...state.subscriptions, row];

  const change: ChangeRow = {
    id: Math.max(0, ...state.changes.map((c) => c.id)) + 1,
    companyId: input.companyId,
    type: existing ? (input.planId !== existing.planId ? "PLAN_CHANGE" : "CYCLE_CHANGE") : "CREATED",
    oldPlan: existing?.planId ?? input.planId,
    newPlan: input.planId,
    reason: input.reason || `${existing ? "Updated" : "Assigned"} ${plan.name} (${input.cycle.toLowerCase()}${input.startTrial ? ", trial" : ""})`,
    by: input.by ?? "Super Admin",
    at: new Date(),
  };

  setState({
    subscriptions,
    changes: [change, ...state.changes],
  });

  return {
    ok: true,
    message: `${company.name} is now on ${plan.name} · ${input.startTrial ? `${trialDays} day trial` : `${input.cycle.toLowerCase()} billing`} · renews ${end.toDateString()}.`,
  };
}

export function cancelSubscription(companyId: number, by = "Super Admin") {
  const sub = subscriptionFor(companyId);
  if (!sub) return;
  const plan = planById(sub.planId);
  setState({
    subscriptions: state.subscriptions.map((row) =>
      row.id === sub.id ? { ...row, status: "CANCELLED", autoRenew: false } : row,
    ),
    changes: [
      {
        id: Math.max(0, ...state.changes.map((c) => c.id)) + 1,
        companyId,
        type: "CANCELLED",
        oldPlan: sub.planId,
        newPlan: sub.planId,
        reason: `${plan?.name ?? "Plan"} cancelled by ${by}`,
        by,
        at: new Date(),
      },
      ...state.changes,
    ],
  });
}

export function reactivateSubscription(companyId: number, by = "Super Admin") {
  const sub = subscriptionFor(companyId);
  if (!sub) return;
  const end = new Date();
  end.setDate(end.getDate() + (sub.cycle === "YEARLY" ? 365 : 30));
  setState({
    subscriptions: state.subscriptions.map((row) =>
      row.id === sub.id ? { ...row, status: "ACTIVE", autoRenew: true, end } : row,
    ),
    changes: [
      {
        id: Math.max(0, ...state.changes.map((c) => c.id)) + 1,
        companyId,
        type: "REACTIVATED",
        oldPlan: sub.planId,
        newPlan: sub.planId,
        reason: `Subscription reactivated by ${by}`,
        by,
        at: new Date(),
      },
      ...state.changes,
    ],
  });
}

export type AttachAddonInput = {
  companyId: number;
  addonId: number;
  qty: number;
};

export function attachAddon(input: AttachAddonInput): { ok: boolean; message: string } {
  const company = companies.find((c) => c.id === input.companyId);
  const addon = addons.find((a) => a.id === input.addonId);
  if (!company || !addon) return { ok: false, message: "Select a vendor and an add-on." };
  const qty = Math.max(1, Math.trunc(input.qty) || 1);

  const existing = state.addons.find(
    (row) => row.companyId === input.companyId && row.addonId === input.addonId && row.status === "ACTIVE",
  );
  const to = new Date();
  to.setMonth(to.getMonth() + 1);

  const addonsNext = existing
    ? state.addons.map((row) =>
        row.id === existing.id ? { ...row, qty: row.qty + qty, from: new Date(), to } : row,
      )
    : [
        ...state.addons,
        {
          id: Math.max(0, ...state.addons.map((a) => a.id)) + 1,
          companyId: input.companyId,
          addonId: input.addonId,
          qty,
          price: addon.price,
          from: new Date(),
          to,
          status: "ACTIVE" as const,
        },
      ];

  setState({ addons: addonsNext });
  return {
    ok: true,
    message: `${qty} × ${addon.name} added to ${company.name} · ${addon.price} each per month.`,
  };
}

export function removeAddon(id: number) {
  setState({
    addons: state.addons.map((row) => (row.id === id ? { ...row, status: "CANCELLED" } : row)),
  });
}

export function resetStore() {
  setState({
    subscriptions: seedSubscriptions.map((sub) => ({ ...sub })) as SubscriptionRow[],
    addons: seedAddons.map((addon) => ({ ...addon, status: "ACTIVE" as const })),
    changes: seedChanges.map((change) => ({ ...change })),
  });
}

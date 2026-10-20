import { getTenant } from "./mock";

export type DemoSession =
  | { kind: "PLATFORM"; name: string; email: string; role: string; permissions: string[] }
  | {
      kind: "COMPANY";
      name: string;
      email: string;
      role: string;
      permissions: string[];
      companyId: number;
    };

/** Plain (server-safe) module — safe to import from server components. */
const ownerFor = (companyId: number): DemoSession => {
  const tenant = getTenant(companyId);
  const owner = tenant.users[0];
  return {
    kind: "COMPANY",
    name: owner.name,
    email: owner.email,
    role: "Company Admin",
    permissions: tenant.roles[0].permissions,
    companyId,
  };
};

export const DEMO_ACCOUNTS: DemoSession[] = [
  {
    kind: "PLATFORM",
    name: "Adrian Herman",
    email: "admin@retailpos.cloud",
    role: "Super Admin",
    permissions: [
      "vendors.view",
      "vendors.create",
      "vendors.edit",
      "vendors.suspend",
      "subscriptions.view",
      "subscriptions.manage",
      "payments.view",
      "reports.view",
      "support.manage",
      "settings.manage",
      "admins.manage",
      "audit.view",
    ],
  },
  ownerFor(1),
  ownerFor(2),
  ownerFor(3),
  {
    kind: "COMPANY",
    name: "Ravi Kumar",
    email: "ravi@cmp-001.qa",
    role: "Cashier",
    permissions: ["dashboard.view", "sales.view", "sales.create", "customers.manage"],
    companyId: 1,
  },
];

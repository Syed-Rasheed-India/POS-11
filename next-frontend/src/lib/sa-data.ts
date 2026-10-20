/* ------------------------------------------------------------------ *
 * SUPER ADMIN database reference data (UI only).
 * Mirrors the 68 table `saas_super_admin` schema — platform, vendors,
 * tax, subscriptions, billing, API, notifications, support, security,
 * company control, auth and master data. No ERP/retail tables here.
 * ------------------------------------------------------------------ */

const round2 = (n: number) => Math.round(n * 100) / 100;
const daysAgo = (days: number, hour = 12) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, (days * 29) % 59, 0, 0);
  return d;
};
const future = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

/* ------------------------------ master data ----------------------------- */

export const countries = [
  { id: 1, code: "QA", name: "Qatar", phone: "+974", taxSystem: "VAT", defaultRate: 5, active: true },
  { id: 2, code: "AE", name: "United Arab Emirates", phone: "+971", taxSystem: "VAT", defaultRate: 5, active: true },
  { id: 3, code: "SA", name: "Saudi Arabia", phone: "+966", taxSystem: "VAT", defaultRate: 15, active: true },
  { id: 4, code: "LK", name: "Sri Lanka", phone: "+94", taxSystem: "VAT", defaultRate: 18, active: true },
  { id: 5, code: "IN", name: "India", phone: "+91", taxSystem: "GST", defaultRate: 18, active: true },
  { id: 6, code: "EG", name: "Egypt", phone: "+20", taxSystem: "VAT", defaultRate: 14, active: true },
  { id: 7, code: "GB", name: "United Kingdom", phone: "+44", taxSystem: "VAT", defaultRate: 20, active: true },
  { id: 8, code: "US", name: "United States", phone: "+1", taxSystem: "Sales tax", defaultRate: 0, active: true },
];

export const currencies = [
  { id: 1, code: "QAR", name: "Qatari Riyal", symbol: "QR", decimals: 2, active: true },
  { id: 2, code: "USD", name: "US Dollar", symbol: "$", decimals: 2, active: true },
  { id: 3, code: "AED", name: "UAE Dirham", symbol: "AED", decimals: 2, active: true },
  { id: 4, code: "SAR", name: "Saudi Riyal", symbol: "SR", decimals: 2, active: true },
  { id: 5, code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs", decimals: 2, active: true },
  { id: 6, code: "EUR", name: "Euro", symbol: "€", decimals: 2, active: true },
];

export const countryById = (id: number) => countries.find((c) => c.id === id);
export const currencyById = (id: number) => currencies.find((c) => c.id === id);

/* ------------------------------ platform -------------------------------- */

export const platformSettings = [
  { key: "default_timezone", value: "Asia/Qatar", type: "string", description: "Applied to new tenants", public: true },
  { key: "default_language", value: "en", type: "string", description: "Portal language", public: true },
  { key: "default_country", value: "QA", type: "string", description: "Country pre-selected for sign-up", public: true },
  { key: "default_currency", value: "QAR", type: "string", description: "Billing currency fallback", public: false },
  { key: "company_registration_enabled", value: "true", type: "boolean", description: "Allow public vendor sign-up", public: false },
  { key: "trial_days_default", value: "14", type: "number", description: "Trial length when a plan has none", public: false },
  { key: "maintenance_mode", value: "false", type: "boolean", description: "Blocks vendor logins platform wide", public: false },
  { key: "support_email", value: "support@retailpos.cloud", type: "string", description: "Shown in vendor tickets", public: true },
  { key: "invoice_due_days", value: "7", type: "number", description: "Payment terms on subscription invoices", public: false },
  { key: "data_retention_default_days", value: "1825", type: "number", description: "5 years default retention", public: false },
];

export const platformConfigs = [
  { group: "database", key: "pool_size", value: { min: 5, max: 40 }, env: "production", encrypted: false },
  { group: "database", key: "read_replica", value: { host: "ro-1.db.internal", weight: 0.3 }, env: "production", encrypted: false },
  { group: "queue", key: "sync_worker_concurrency", value: { workers: 12, retries: 5 }, env: "production", encrypted: false },
  { group: "cache", key: "ttl_seconds", value: { products: 300, reports: 900 }, env: "production", encrypted: false },
  { group: "billing", key: "gateway_retry", value: { attempts: 5, backoff: "exponential" }, env: "production", encrypted: false },
  { group: "billing", key: "stripe_secret", value: { key: "sk_live_••••••••4f2a" }, env: "production", encrypted: true },
  { group: "mail", key: "smtp", value: { host: "smtp.sendgrid.net", port: 587 }, env: "production", encrypted: false },
  { group: "storage", key: "s3_bucket", value: { bucket: "retailpos-files", region: "me-central-1" }, env: "production", encrypted: false },
  { group: "security", key: "password_policy", value: { minLength: 10, requireSymbol: true, rotateDays: 180 }, env: "production", encrypted: false },
  { group: "security", key: "rate_limit", value: { perMinute: 600, perDay: 250000 }, env: "production", encrypted: false },
];

export const platformModules = [
  { id: 1, code: "RETAIL", name: "Retail", description: "POS, inventory, purchasing, pricing", version: "2.4.1", active: true, order: 1 },
  { id: 2, code: "RESTAURANT", name: "Restaurant", description: "Menu, tables, KOT, kitchen, recipes", version: "1.8.0", active: true, order: 2 },
  { id: 3, code: "POS", name: "POS Engine", description: "Offline terminals, shifts, payments, hardware", version: "3.1.2", active: true, order: 3 },
  { id: 4, code: "ACCOUNTING", name: "Accounting", description: "GL, AR, AP, banking, tax reports", version: "1.5.0", active: true, order: 4 },
  { id: 5, code: "ONLINE_ORDERING", name: "Online Ordering", description: "Web store, delivery aggregators", version: "1.2.0", active: true, order: 5 },
  { id: 6, code: "LOYALTY", name: "Loyalty", description: "Points, tiers, rewards", version: "1.1.4", active: true, order: 6 },
  { id: 7, code: "EVENT", name: "Event Management", description: "Tickets, RFID/QR, cashless wallets", version: "0.9.0", active: true, order: 7 },
  { id: 8, code: "HRM", name: "HRM & Payroll", description: "Employees, attendance, payroll", version: "0.4.0", active: false, order: 8 },
  { id: 9, code: "REPORTS", name: "Reporting", description: "Operational and financial reports", version: "2.0.3", active: true, order: 9 },
  { id: 10, code: "API", name: "API & Integrations", description: "Clients, webhooks, delivery bridges", version: "1.6.0", active: true, order: 10 },
];

export const platformFeatures = [
  { id: 1, moduleId: 1, code: "MULTI_BRANCH", name: "Multi branch", description: "Operate more than one outlet", active: true },
  { id: 2, moduleId: 1, code: "MULTI_WAREHOUSE", name: "Multi warehouse", description: "Split stock across stores", active: true },
  { id: 3, moduleId: 1, code: "CUSTOMER_CREDIT", name: "Customer credit", description: "Credit limits and statements", active: true },
  { id: 4, moduleId: 2, code: "KITCHEN_DISPLAY", name: "Kitchen display", description: "Live KDS screens", active: true },
  { id: 5, moduleId: 2, code: "RECIPES", name: "Recipe costing", description: "Ingredient level deduction", active: true },
  { id: 6, moduleId: 3, code: "OFFLINE_POS", name: "Offline POS", description: "Queue sales without network", active: true },
  { id: 7, moduleId: 3, code: "BARCODE_SCALE", name: "Barcode scale", description: "Weight and price embedded codes", active: true },
  { id: 8, moduleId: 4, code: "ADVANCED_GL", name: "Advanced GL", description: "Multi currency journals", active: true },
  { id: 9, moduleId: 5, code: "DELIVERY_BRIDGE", name: "Delivery bridge", description: "Talabat, Snoonu, Keeta", active: true },
  { id: 10, moduleId: 6, code: "LOYALTY_TIERS", name: "Loyalty tiers", description: "Automatic tier upgrades", active: true },
  { id: 11, moduleId: 7, code: "RFID_WRISTBAND", name: "RFID wristbands", description: "Cashless event access", active: true },
  { id: 12, moduleId: 8, code: "PAYROLL_RUN", name: "Payroll run", description: "Salary processing (roadmap)", active: false },
];

export const featureFlags = [
  { id: 1, featureId: 6, key: "offline_pos_rollout", enabled: true, rollout: 100, conditions: { plans: ["PROFESSIONAL", "ENTERPRISE"] } },
  { id: 2, featureId: 7, key: "barcode_scale_rollout", enabled: true, rollout: 60, conditions: { countries: ["QA", "AE"] } },
  { id: 3, featureId: 9, key: "delivery_bridge_beta", enabled: true, rollout: 25, conditions: { waitlist: true } },
  { id: 4, featureId: 11, key: "rfid_wristband_beta", enabled: true, rollout: 10, conditions: { tenants: ["CMP-003"] } },
  { id: 5, featureId: 12, key: "payroll_internal", enabled: false, rollout: 0, conditions: { internal: true } },
  { id: 6, featureId: 4, key: "kds_v2_experiment", enabled: true, rollout: 35, conditions: { appVersion: ">=1.5.0" } },
];

/* --------------------------- super admin users -------------------------- */

export const platformPermissions = [
  { id: 1, code: "company.view", name: "View vendors", module: "Vendors", action: "view" },
  { id: 2, code: "company.create", name: "Create vendor", module: "Vendors", action: "create" },
  { id: 3, code: "company.edit", name: "Edit vendor", module: "Vendors", action: "edit" },
  { id: 4, code: "company.suspend", name: "Suspend vendor", module: "Vendors", action: "suspend" },
  { id: 5, code: "company.delete", name: "Request vendor deletion", module: "Vendors", action: "delete" },
  { id: 6, code: "company.tax.edit", name: "Configure vendor tax", module: "Vendors", action: "edit" },
  { id: 7, code: "subscription.view", name: "View subscriptions", module: "Subscriptions", action: "view" },
  { id: 8, code: "subscription.create", name: "Assign subscription", module: "Subscriptions", action: "create" },
  { id: 9, code: "subscription.edit", name: "Change plan or cycle", module: "Subscriptions", action: "edit" },
  { id: 10, code: "plan.manage", name: "Manage plans and limits", module: "Subscriptions", action: "manage" },
  { id: 11, code: "billing.view", name: "View invoices and payments", module: "Billing", action: "view" },
  { id: 12, code: "billing.refund", name: "Issue refund", module: "Billing", action: "refund" },
  { id: 13, code: "gateway.manage", name: "Manage payment gateways", module: "Billing", action: "manage" },
  { id: 14, code: "user.create", name: "Create vendor user", module: "Users", action: "create" },
  { id: 15, code: "user.disable", name: "Disable vendor user", module: "Users", action: "disable" },
  { id: 16, code: "admin.manage", name: "Manage platform admins", module: "Platform", action: "manage" },
  { id: 17, code: "platform.settings", name: "Edit platform settings", module: "Platform", action: "manage" },
  { id: 18, code: "api.manage", name: "Manage API clients", module: "API", action: "manage" },
  { id: 19, code: "support.manage", name: "Handle support tickets", module: "Support", action: "manage" },
  { id: 20, code: "audit.view", name: "View audit and security logs", module: "Security", action: "view" },
  { id: 21, code: "backup.manage", name: "Run and restore backups", module: "Platform", action: "manage" },
];

export const platformRoles = [
  {
    id: 1,
    code: "SUPER_ADMIN",
    name: "Super Admin",
    description: "Unrestricted access to every module",
    system: true,
    active: true,
    permissions: platformPermissions.map((p) => p.code),
    admins: 2,
  },
  {
    id: 2,
    code: "FINANCE_ADMIN",
    name: "Finance Admin",
    description: "Plans, billing, refunds and revenue reports",
    system: true,
    active: true,
    permissions: ["company.view", "subscription.view", "subscription.edit", "plan.manage", "billing.view", "billing.refund", "gateway.manage"],
    admins: 1,
  },
  {
    id: 3,
    code: "SUPPORT_ADMIN",
    name: "Support Admin",
    description: "Vendor support and impersonation requests",
    system: true,
    active: true,
    permissions: ["company.view", "company.edit", "subscription.view", "support.manage"],
    admins: 1,
  },
  {
    id: 4,
    code: "SALES_ADMIN",
    name: "Sales Admin",
    description: "Onboards new vendors and runs trials",
    system: false,
    active: true,
    permissions: ["company.view", "company.create", "subscription.create", "subscription.view"],
    admins: 1,
  },
  {
    id: 5,
    code: "TECHNICAL_ADMIN",
    name: "Technical Admin",
    description: "API clients, devices, configs and backups",
    system: false,
    active: true,
    permissions: ["company.view", "api.manage", "platform.settings", "backup.manage"],
    admins: 1,
  },
];

export const platformAdmins = [
  { id: 1, username: "adrian.herman", email: "admin@retailpos.cloud", firstName: "Adrian", lastName: "Herman", phone: "+974 4400 1122", roleId: 1, status: "ACTIVE", lastLogin: daysAgo(0, 9), failed: 0, locked: null, mfa: true },
  { id: 2, username: "linda.cruz", email: "linda@retailpos.cloud", firstName: "Linda", lastName: "Cruz", phone: "+974 4400 2244", roleId: 1, status: "ACTIVE", lastLogin: daysAgo(1, 10), failed: 0, locked: null, mfa: true },
  { id: 3, username: "mark.ruiz", email: "finance@retailpos.cloud", firstName: "Mark", lastName: "Ruiz", phone: "+974 4400 5566", roleId: 2, status: "ACTIVE", lastLogin: daysAgo(1, 11), failed: 0, locked: null, mfa: false },
  { id: 4, username: "sara.nolan", email: "support@retailpos.cloud", firstName: "Sara", lastName: "Nolan", phone: "+974 4400 3344", roleId: 3, status: "ACTIVE", lastLogin: daysAgo(0, 14), failed: 1, locked: null, mfa: false },
  { id: 5, username: "yousef.ali", email: "sales@retailpos.cloud", firstName: "Yousef", lastName: "Ali", phone: "+974 4400 7788", roleId: 4, status: "ACTIVE", lastLogin: daysAgo(2, 16), failed: 0, locked: null, mfa: false },
  { id: 6, username: "ken.tanaka", email: "tech@retailpos.cloud", firstName: "Ken", lastName: "Tanaka", phone: "+974 4400 9900", roleId: 5, status: "ACTIVE", lastLogin: daysAgo(0, 8), failed: 0, locked: null, mfa: true },
  { id: 7, username: "priya.menon", email: "priya@retailpos.cloud", firstName: "Priya", lastName: "Menon", phone: "+974 4400 6611", roleId: 3, status: "LOCKED", lastLogin: daysAgo(6, 19), failed: 5, locked: daysAgo(0, 19), mfa: false },
  { id: 8, username: "omar.faris", email: "omar@retailpos.cloud", firstName: "Omar", lastName: "Faris", phone: "+974 4400 4422", roleId: 4, status: "INACTIVE", lastLogin: daysAgo(45, 12), failed: 0, locked: null, mfa: false },
];

export const adminSessions = [
  { id: 1, adminId: 1, ip: "197.220.14.8", device: "Chrome 131 · macOS", location: "Doha, QA", expires: future(5), active: true, last: daysAgo(0, 9) },
  { id: 2, adminId: 1, ip: "197.220.14.8", device: "RetailPOS Admin PWA", location: "Doha, QA", expires: future(2), active: true, last: daysAgo(0, 8) },
  { id: 3, adminId: 4, ip: "82.115.66.20", device: "Edge 130 · Windows", location: "Doha, QA", expires: future(1), active: true, last: daysAgo(0, 14) },
  { id: 4, adminId: 6, ip: "51.36.90.4", device: "Chrome 130 · Linux", location: "Frankfurt, DE", expires: future(3), active: true, last: daysAgo(0, 8) },
  { id: 5, adminId: 3, ip: "197.220.14.8", device: "Safari 18 · iPad", location: "Doha, QA", expires: daysAgo(2, 11), active: false, last: daysAgo(2, 11) },
];

export const loginLogs = [
  { id: 1, adminId: 1, username: "adrian.herman", status: "SUCCESS", ip: "197.220.14.8", agent: "Chrome 131 · macOS", at: daysAgo(0, 9) },
  { id: 2, adminId: 7, username: "priya.menon", status: "FAILED", ip: "41.130.22.7", agent: "Firefox 132 · Windows", at: daysAgo(0, 19), reason: "Invalid password (attempt 5 of 5)" },
  { id: 3, adminId: 7, username: "priya.menon", status: "LOCKED", ip: "41.130.22.7", agent: "Firefox 132 · Windows", at: daysAgo(0, 19), reason: "Account locked for 30 minutes" },
  { id: 4, adminId: 4, username: "sara.nolan", status: "SUCCESS", ip: "82.115.66.20", agent: "Edge 130 · Windows", at: daysAgo(0, 14) },
  { id: 5, adminId: 6, username: "ken.tanaka", status: "SUCCESS", ip: "51.36.90.4", agent: "Chrome 130 · Linux", at: daysAgo(0, 8) },
  { id: 6, adminId: 2, username: "linda.cruz", status: "SUCCESS", ip: "197.220.14.8", agent: "Chrome 131 · macOS", at: daysAgo(1, 10) },
  { id: 7, adminId: 5, username: "yousef.ali", status: "FAILED", ip: "197.220.14.9", agent: "Chrome 131 · macOS", at: daysAgo(1, 16), reason: "Invalid password (attempt 1 of 5)" },
  { id: 8, adminId: 3, username: "mark.ruiz", status: "SUCCESS", ip: "197.220.14.8", agent: "Safari 18 · iPad", at: daysAgo(2, 11) },
];

export const securityEvents = [
  { id: 1, type: "BRUTE_FORCE_DETECTED", severity: "HIGH", admin: "priya.menon", company: "—", ip: "41.130.22.7", description: "5 failed logins in 3 minutes — account locked", at: daysAgo(0, 19) },
  { id: 2, type: "PERMISSION_ESCALATION", severity: "CRITICAL", admin: "adrian.herman", company: "ABC Supermarket", ip: "197.220.14.8", description: "Feature override enabled outside plan for 90 days", at: daysAgo(1, 12) },
  { id: 3, type: "BULK_EXPORT", severity: "MEDIUM", admin: "mark.ruiz", company: "All", ip: "197.220.14.8", description: "Exported 5 tenant customer lists", at: daysAgo(2, 15) },
  { id: 4, type: "API_KEY_CREATED", severity: "LOW", admin: "ken.tanaka", company: "Freshmart Electronics", ip: "51.36.90.4", description: "New scoped key issued for POS bridge", at: daysAgo(2, 9) },
  { id: 5, type: "IMPERSONATION_STARTED", severity: "HIGH", admin: "sara.nolan", company: "XYZ Grocery", ip: "82.115.66.20", description: "Support impersonation for ticket TKT-0002", at: daysAgo(2, 13) },
  { id: 6, type: "GATEWAY_SECRET_ROTATED", severity: "MEDIUM", admin: "mark.ruiz", company: "—", ip: "197.220.14.8", description: "Stripe secret rotated", at: daysAgo(5, 10) },
];

export const accessTokens = [
  { id: 1, hash: "tok_7f3a…d0f", type: "API_KEY", owner: "COMPANY", ownerName: "ABC Supermarket · Flutter POS Doha Counter 1", scopes: ["products:read", "inventory:read", "sales:write"], expires: future(320), lastUsed: daysAgo(0, 21), revoked: false },
  { id: 2, hash: "tok_1b8e…e25", type: "API_KEY", owner: "COMPANY", ownerName: "ABC Supermarket · Flutter POS Al Rayyan", scopes: ["products:read", "sales:write"], expires: future(300), lastUsed: daysAgo(0, 18), revoked: false },
  { id: 3, hash: "tok_9c41…b63", type: "API_KEY", owner: "COMPANY", ownerName: "Freshmart Electronics · Villaggio", scopes: ["products:read", "inventory:read", "sales:write"], expires: future(240), lastUsed: daysAgo(1, 12), revoked: false },
  { id: 4, hash: "tok_55de…8be", type: "API_KEY", owner: "COMPANY", ownerName: "XYZ Grocery · Mobile POS", scopes: ["products:read", "sales:write"], expires: daysAgo(1, 20), lastUsed: daysAgo(1, 20), revoked: true },
  { id: 5, hash: "tok_aa10…c41", type: "PERSONAL", owner: "ADMIN", ownerName: "ken.tanaka · CI pipeline", scopes: ["reports:read"], expires: future(30), lastUsed: daysAgo(0, 3), revoked: false },
  { id: 6, hash: "tok_bc22…7e9", type: "PARTNER", owner: "COMPANY", ownerName: "Delivery bridge · Acme Logistics", scopes: ["orders:write", "menu:read"], expires: future(90), lastUsed: daysAgo(1, 6), revoked: false },
];

export const passwordResets = [
  { id: 1, userType: "COMPANY", user: "owner+cmp-002@xyzgrocery.qa", ip: "212.77.4.19", expires: future(1), used: null },
  { id: 2, userType: "COMPANY", user: "aisha@cmp-001.qa", ip: "197.220.14.8", expires: daysAgo(3, 10), used: daysAgo(3, 11) },
  { id: 3, userType: "ADMIN", user: "priya.menon@retailpos.cloud", ip: "41.130.22.7", expires: daysAgo(6, 20), used: null },
];

export const twoFactor = [
  { id: 1, userType: "ADMIN", user: "adrian.herman", method: "TOTP", enabled: true, verified: daysAgo(120, 9), recovery: 8 },
  { id: 2, userType: "ADMIN", user: "ken.tanaka", method: "TOTP", enabled: true, verified: daysAgo(60, 9), recovery: 6 },
  { id: 3, userType: "ADMIN", user: "linda.cruz", method: "TOTP", enabled: true, verified: daysAgo(30, 9), recovery: 9 },
  { id: 4, userType: "COMPANY", user: "owner+cmp-001@abcsupermarket.qa", method: "SMS", enabled: true, verified: daysAgo(15, 9), recovery: 4 },
  { id: 5, userType: "COMPANY", user: "owner+cmp-003@freshmart.qa", method: "TOTP", enabled: false, verified: null, recovery: 0 },
];

/* ------------------------------- vendors -------------------------------- */

type CompanySeed = {
  id: number;
  code: string;
  name: string;
  legal: string;
  taxNumber: string;
  countryId: number;
  currencyId: number;
  timezone: string;
  city: string;
  address: string;
  status: "ACTIVE" | "TRIAL" | "SUSPENDED" | "INACTIVE";
  planId: number;
  createdDays: number;
  owner: string;
  branches: { code: string; name: string; city: string }[];
  extraWarehouses: string[];
  users: { name: string; username: string; email: string; role: string; status: string }[];
  devices: { code: string; name: string; type: string; platform: string; app: string; status: string }[];
};

const COMPANY_SEEDS: CompanySeed[] = [
  {
    id: 1,
    code: "CMP-001",
    name: "ABC Supermarket",
    legal: "ABC Trading W.L.L",
    taxNumber: "TRN-100482913",
    countryId: 1,
    currencyId: 1,
    timezone: "Asia/Qatar",
    city: "Doha",
    address: "Building 24, Al Corniche Street, West Bay, Doha",
    status: "ACTIVE",
    planId: 2,
    createdDays: 210,
    owner: "Khalid Al-Mannai",
    branches: [
      { code: "DOHA", name: "Doha Branch", city: "Doha" },
      { code: "RAY", name: "Al Rayyan Branch", city: "Al Rayyan" },
    ],
    extraWarehouses: ["DOH-COLD", "RAY-MAIN"],
    users: [
      { name: "Khalid Al-Mannai", username: "khalid.mannai", email: "owner+cmp-001@abcsupermarket.qa", role: "COMPANY_OWNER", status: "ACTIVE" },
      { name: "Aisha Rahman", username: "aisha.rahman", email: "aisha@cmp-001.qa", role: "MANAGER", status: "ACTIVE" },
      { name: "Ravi Kumar", username: "ravi.kumar", email: "ravi@cmp-001.qa", role: "CASHIER", status: "ACTIVE" },
      { name: "Noor Saleh", username: "noor.saleh", email: "noor@cmp-001.qa", role: "CASHIER", status: "ACTIVE" },
      { name: "Bilal Haddad", username: "bilal.haddad", email: "bilal@cmp-001.qa", role: "ACCOUNTANT", status: "ACTIVE" },
    ],
    devices: [
      { code: "dev-cmp001-1001", name: "Doha Counter 1", type: "POS_TERMINAL", platform: "ANDROID", app: "1.4.2", status: "ONLINE" },
      { code: "dev-cmp001-1002", name: "Doha Counter 2", type: "POS_TERMINAL", platform: "ANDROID", app: "1.4.2", status: "ONLINE" },
      { code: "dev-cmp001-1003", name: "Doha Mobile POS", type: "HANDHELD", platform: "ANDROID", app: "1.3.8", status: "OFFLINE" },
      { code: "dev-cmp001-1004", name: "Al Rayyan Counter 1", type: "POS_TERMINAL", platform: "ANDROID", app: "1.4.1", status: "ONLINE" },
    ],
  },
  {
    id: 2,
    code: "CMP-002",
    name: "XYZ Grocery",
    legal: "XYZ Retail Co.",
    taxNumber: "TRN-100771204",
    countryId: 1,
    currencyId: 1,
    timezone: "Asia/Qatar",
    city: "Al Wakrah",
    address: "Shop 12, Al Wakrah Souq, Al Wakrah",
    status: "TRIAL",
    planId: 1,
    createdDays: 12,
    owner: "Nasser Al-Kuwari",
    branches: [{ code: "WAK", name: "Al Wakrah Central", city: "Al Wakrah" }],
    extraWarehouses: [],
    users: [
      { name: "Nasser Al-Kuwari", username: "nasser.kuwari", email: "owner+cmp-002@xyzgrocery.qa", role: "COMPANY_OWNER", status: "ACTIVE" },
      { name: "Huda Ibrahim", username: "huda.ibrahim", email: "huda@cmp-002.qa", role: "STORE_MANAGER", status: "ACTIVE" },
      { name: "Jassim Malik", username: "jassim.malik", email: "jassim@cmp-002.qa", role: "CASHIER", status: "ACTIVE" },
    ],
    devices: [
      { code: "dev-cmp002-1001", name: "Al Wakrah Counter 1", type: "POS_TERMINAL", platform: "ANDROID", app: "1.4.2", status: "ONLINE" },
      { code: "dev-cmp002-1002", name: "Al Wakrah Mobile", type: "HANDHELD", platform: "ANDROID", app: "1.4.0", status: "OFFLINE" },
    ],
  },
  {
    id: 3,
    code: "CMP-003",
    name: "Freshmart Electronics",
    legal: "Freshmart Electronics W.L.L",
    taxNumber: "TRN-100993410",
    countryId: 1,
    currencyId: 1,
    timezone: "Asia/Qatar",
    city: "Doha",
    address: "Villaggio Mall, Aspire Zone, Doha",
    status: "ACTIVE",
    planId: 3,
    createdDays: 340,
    owner: "Dana Farouk",
    branches: [
      { code: "VILL", name: "Villaggio Store", city: "Doha" },
      { code: "SADD", name: "Al Sadd Store", city: "Doha" },
    ],
    extraWarehouses: ["SAD-MAIN"],
    users: [
      { name: "Dana Farouk", username: "dana.farouk", email: "owner+cmp-003@freshmart.qa", role: "COMPANY_OWNER", status: "ACTIVE" },
      { name: "Tariq Nasser", username: "tariq.nasser", email: "tariq@cmp-003.qa", role: "MANAGER", status: "ACTIVE" },
      { name: "Maryam Shaikh", username: "maryam.shaikh", email: "maryam@cmp-003.qa", role: "ACCOUNTANT", status: "ACTIVE" },
      { name: "Hamad Dosari", username: "hamad.dosari", email: "hamad@cmp-003.qa", role: "CASHIER", status: "SUSPENDED" },
    ],
    devices: [
      { code: "dev-cmp003-1001", name: "Villaggio Counter 1", type: "POS_TERMINAL", platform: "IOS", app: "1.4.2", status: "ONLINE" },
      { code: "dev-cmp003-1002", name: "Villaggio Counter 2", type: "POS_TERMINAL", platform: "IOS", app: "1.4.2", status: "ONLINE" },
      { code: "dev-cmp003-1003", name: "Al Sadd Counter 1", type: "POS_TERMINAL", platform: "IOS", app: "1.4.0", status: "OFFLINE" },
    ],
  },
  {
    id: 4,
    code: "CMP-004",
    name: "Gulf Grill House",
    legal: "Gulf Grill House L.L.C",
    taxNumber: "TRN-100228845",
    countryId: 2,
    currencyId: 3,
    timezone: "Asia/Dubai",
    city: "Dubai",
    address: "Al Wasl Road, Jumeirah 1, Dubai",
    status: "ACTIVE",
    planId: 2,
    createdDays: 96,
    owner: "Rashid Al-Falasi",
    branches: [
      { code: "JUM", name: "Jumeirah Restaurant", city: "Dubai" },
      { code: "MAR", name: "Marina Branch", city: "Dubai" },
    ],
    extraWarehouses: ["MAR-COLD"],
    users: [
      { name: "Rashid Al-Falasi", username: "rashid.falasi", email: "owner+cmp-004@gulfgrill.ae", role: "COMPANY_OWNER", status: "ACTIVE" },
      { name: "Amira Hassan", username: "amira.hassan", email: "amira@cmp-004.ae", role: "MANAGER", status: "ACTIVE" },
      { name: "Leo Kelly", username: "leo.kelly", email: "leo@cmp-004.ae", role: "CASHIER", status: "ACTIVE" },
    ],
    devices: [
      { code: "dev-cmp004-1001", name: "Jumeirah Terminal 1", type: "POS_TERMINAL", platform: "ANDROID", app: "1.4.2", status: "ONLINE" },
      { code: "dev-cmp004-1002", name: "Marina Terminal 1", type: "POS_TERMINAL", platform: "ANDROID", app: "1.4.2", status: "ONLINE" },
      { code: "dev-cmp004-1003", name: "Kitchen Display", type: "KDS", platform: "ANDROID", app: "1.5.0", status: "ONLINE" },
    ],
  },
  {
    id: 5,
    code: "CMP-005",
    name: "Ceylon Mart",
    legal: "Ceylon Mart (Pvt) Ltd",
    taxNumber: "VAT-99401123",
    countryId: 4,
    currencyId: 5,
    timezone: "Asia/Colombo",
    city: "Colombo",
    address: "142 Galle Road, Colombo 03",
    status: "SUSPENDED",
    planId: 1,
    createdDays: 40,
    owner: "Nuwan Perera",
    branches: [{ code: "COL", name: "Colombo Store", city: "Colombo" }],
    extraWarehouses: [],
    users: [
      { name: "Nuwan Perera", username: "nuwan.perera", email: "owner+cmp-005@ceylonmart.lk", role: "COMPANY_OWNER", status: "ACTIVE" },
      { name: "Sanduni Fernando", username: "sanduni.fernando", email: "sanduni@cmp-005.lk", role: "CASHIER", status: "ACTIVE" },
    ],
    devices: [
      { code: "dev-cmp005-1001", name: "Colombo Counter 1", type: "POS_TERMINAL", platform: "ANDROID", app: "1.3.9", status: "OFFLINE" },
    ],
  },
];

export type Company = {
  id: number;
  code: string;
  name: string;
  legal: string;
  taxNumber: string;
  countryId: number;
  currencyId: number;
  timezone: string;
  city: string;
  address: string;
  status: string;
  planId: number;
  database: string;
  created: Date;
  owner: string;
  settings: { key: string; value: string }[];
  contacts: { type: string; name: string; email: string; phone: string; designation: string; primary: boolean }[];
  branches: { id: number; code: string; name: string; city: string; status: string }[];
  warehouses: { id: number; branchId: number; code: string; name: string; status: string }[];
  terminals: { id: number; branchId: number; code: string; name: string; deviceId: number; status: string }[];
  users: { id: number; name: string; username: string; email: string; role: string; status: string; lastLogin: Date }[];
  devices: { id: number; code: string; name: string; type: string; platform: string; app: string; status: string; lastSeen: Date }[];
  tax: {
    countryId: number;
    registration: string;
    system: string;
    rate: number;
    inclusive: boolean;
    enabled: boolean;
    effectiveFrom: Date;
    effectiveTo: Date | null;
    status: string;
  };
  statusHistory: { old: string; next: string; reason: string; by: string; at: Date }[];
  retention: { retentionDays: number; backupDays: number; auditDays: number; autoDelete: boolean };
  backups: { id: number; type: string; location: string; size: string; status: string; started: Date; completed: Date | null; checksum: string }[];
};

export const companies: Company[] = COMPANY_SEEDS.map((seed) => {
  const country = countries.find((c) => c.id === seed.countryId)!;
  const branches = seed.branches.map((branch, index) => ({
    id: seed.id * 100 + index + 1,
    code: branch.code,
    name: branch.name,
    city: branch.city,
    status: "ACTIVE",
  }));
  const warehouses = [
    {
      id: seed.id * 100 + 11,
      branchId: branches[0].id,
      code: `${seed.branches[0].code}-MAIN`,
      name: `${seed.branches[0].name.split(" ")[0]} Main Warehouse`,
      status: "ACTIVE",
    },
    ...seed.extraWarehouses.map((code, index) => ({
      id: seed.id * 100 + 12 + index,
      branchId: branches[Math.min(1, branches.length - 1)].id,
      code,
      name: code.includes("COLD") ? "Cold Storage" : `${seed.branches[1]?.name.split(" ")[0] ?? "Second"} Warehouse`,
      status: "ACTIVE",
    })),
  ];
  const terminals = seed.branches.map((branch, index) => ({
    id: seed.id * 100 + 21 + index,
    branchId: branches[index].id,
    code: `${seed.code}-T${index + 1}`,
    name: `${branch.name} Counter ${index + 1}`,
    deviceId: seed.devices[index] ? seed.id * 1000 + index + 1 : 0,
    status: index === 0 ? "ACTIVE" : "ACTIVE",
  }));
  const users = seed.users.map((user, index) => ({
    id: seed.id * 900 + index + 1,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
    lastLogin: daysAgo(index === 0 ? 0 : index, 9 + index),
  }));
  const devices = seed.devices.map((device, index) => ({
    id: seed.id * 1000 + index + 1,
    code: device.code,
    name: device.name,
    type: device.type,
    platform: device.platform,
    app: device.app,
    status: device.status,
    lastSeen: device.status === "ONLINE" ? daysAgo(0, 8 + index) : daysAgo(1 + index, 20),
  }));

  return {
    id: seed.id,
    code: seed.code,
    name: seed.name,
    legal: seed.legal,
    taxNumber: seed.taxNumber,
    countryId: seed.countryId,
    currencyId: seed.currencyId,
    timezone: seed.timezone,
    city: seed.city,
    address: seed.address,
    status: seed.status,
    planId: seed.planId,
    database: `tenant_${seed.code.toLowerCase().replace("-", "")}`,
    created: daysAgo(seed.createdDays, 10),
    owner: seed.owner,
    settings: [
      { key: "invoice_prefix", value: seed.code.replace("CMP-", "") },
      { key: "receipt_header", value: seed.name },
      { key: "decimal_places", value: "2" },
      { key: "allow_credit_sales", value: seed.id === 2 ? "false" : "true" },
      { key: "allow_negative_stock", value: "false" },
      { key: "loyalty_points_per_unit", value: "1" },
    ],
    contacts: [
      { type: "PRIMARY", name: seed.owner, email: `owner+${seed.code.toLowerCase()}@${seed.name.split(" ")[0].toLowerCase()}.com`, phone: "+974 " + (4000 + seed.id) + " 1122", designation: "Managing Director", primary: true },
      { type: "BILLING", name: "Finance Desk", email: `billing@${seed.code.toLowerCase()}.com`, phone: "+974 " + (4000 + seed.id) + " 3344", designation: "Finance Officer", primary: false },
      { type: "TECHNICAL", name: "IT Support", email: `it@${seed.code.toLowerCase()}.com`, phone: "+974 " + (4000 + seed.id) + " 5566", designation: "Systems Admin", primary: false },
    ],
    branches,
    warehouses,
    terminals,
    users,
    devices,
    tax: {
      countryId: seed.countryId,
      registration: seed.taxNumber,
      system: country.taxSystem,
      rate: country.defaultRate,
      inclusive: seed.countryId === 1 || seed.countryId === 2,
      enabled: true,
      effectiveFrom: daysAgo(seed.createdDays, 9),
      effectiveTo: null,
      status: "ACTIVE",
    },
    statusHistory: [
      { old: "—", next: "TRIAL", reason: "Tenant provisioned by platform", by: "Yousef Ali", at: daysAgo(seed.createdDays, 10) },
      ...(seed.status === "ACTIVE"
        ? [{ old: "TRIAL", next: "ACTIVE", reason: "Trial converted after payment", by: "Mark Ruiz", at: daysAgo(Math.max(1, seed.createdDays - 7), 11) }]
        : []),
      ...(seed.status === "SUSPENDED"
        ? [{ old: "ACTIVE", next: "SUSPENDED", reason: "Payment failed twice — card declined", by: "Mark Ruiz", at: daysAgo(6, 16) }]
        : []),
      ...(seed.status === "TRIAL"
        ? [{ old: "TRIAL", next: "TRIAL", reason: "Trial extended by 7 days (goodwill)", by: "Sara Nolan", at: daysAgo(4, 13) }]
        : []),
    ],
    retention: {
      retentionDays: seed.planId === 3 ? 3650 : 1825,
      backupDays: seed.planId === 3 ? 180 : 90,
      auditDays: 2555,
      autoDelete: seed.planId !== 3,
    },
    backups: Array.from({ length: 4 }).map((_, index) => ({
      id: seed.id * 500 + index + 1,
      type: index === 0 ? "FULL" : index === 3 ? "MANUAL" : "INCREMENTAL",
      location: `s3://retailpos-backups/${seed.code.toLowerCase()}/${daysAgo(index, 2).toISOString().slice(0, 10)}.dump`,
      size: `${(seed.planId * 0.6 + index * 0.2).toFixed(1)} GB`,
      status: index === 2 ? "RUNNING" : "COMPLETED",
      started: daysAgo(index, 2),
      completed: index === 2 ? null : daysAgo(index, 2),
      checksum: `sha256:${seed.code.toLowerCase()}${index}9f2a7c`,
    })),
  };
});

export const companyById = (id: number) => companies.find((c) => c.id === id);

export const usernameRules = companies.map((company) => ({
  companyId: company.id,
  min: 6,
  max: 30,
  numbers: true,
  special: false,
  unique: true,
  pattern: "^[a-z][a-z0-9._-]{5,29}$",
}));

export const featureOverrides = [
  { id: 1, companyId: 1, feature: "ONLINE_ORDERING", name: "Online ordering", planHas: false, enabled: true, reason: "Pilot partner — extended access", from: daysAgo(20, 9), to: future(70) },
  { id: 2, companyId: 2, feature: "MULTI_BRANCH", name: "Multi branch", planHas: false, enabled: true, reason: "Goodwill during migration from legacy POS", from: daysAgo(5, 9), to: future(25) },
  { id: 3, companyId: 3, feature: "RFID_WRISTBAND", name: "RFID wristbands (event)", planHas: false, enabled: true, reason: "Beta participant", from: daysAgo(12, 9), to: future(48) },
  { id: 4, companyId: 1, feature: "ADVANCED_GL", name: "Advanced GL", planHas: true, enabled: false, reason: "Disabled at vendor request", from: daysAgo(30, 9), to: future(300) },
];

export const deletionRequests = [
  { id: 1, companyId: 5, requestedBy: "Nuwan Perera", reason: "Closing the business", status: "APPROVED", scheduled: future(14), approvedBy: "Adrian Herman", at: daysAgo(3, 12) },
  { id: 2, companyId: 4, requestedBy: "Rashid Al-Falasi", reason: "Consolidating into another tenant", status: "PENDING", scheduled: null, approvedBy: null, at: daysAgo(1, 15) },
];

/* ---------------------------- subscriptions ----------------------------- */

export const plans = [
  {
    id: 1,
    code: "STARTER",
    name: "Starter",
    description: "Single shop retail with basic inventory",
    monthly: 29,
    yearly: 290,
    currencyId: 2,
    trialDays: 14,
    active: true,
    tenants: 2,
    limits: [
      { code: "MAX_USERS", value: 5, unlimited: false },
      { code: "MAX_BRANCHES", value: 1, unlimited: false },
      { code: "MAX_WAREHOUSES", value: 1, unlimited: false },
      { code: "MAX_PRODUCTS", value: 1000, unlimited: false },
      { code: "MAX_TERMINALS", value: 2, unlimited: false },
      { code: "MAX_PRICE_LISTS", value: 3, unlimited: false },
      { code: "MAX_STORAGE", value: 2048, unlimited: false },
      { code: "MAX_API_REQUESTS", value: 100000, unlimited: false },
    ],
    modules: [1, 3, 9],
    features: [1, 3, 6],
  },
  {
    id: 2,
    code: "PROFESSIONAL",
    name: "Professional",
    description: "Multi branch retail and restaurant with purchasing",
    monthly: 79,
    yearly: 790,
    currencyId: 2,
    trialDays: 14,
    active: true,
    tenants: 2,
    limits: [
      { code: "MAX_USERS", value: 25, unlimited: false },
      { code: "MAX_BRANCHES", value: 5, unlimited: false },
      { code: "MAX_WAREHOUSES", value: 10, unlimited: false },
      { code: "MAX_PRODUCTS", value: 20000, unlimited: false },
      { code: "MAX_TERMINALS", value: 15, unlimited: false },
      { code: "MAX_PRICE_LISTS", value: 50, unlimited: false },
      { code: "MAX_STORAGE", value: 20480, unlimited: false },
      { code: "MAX_API_REQUESTS", value: 1000000, unlimited: false },
    ],
    modules: [1, 2, 3, 4, 5, 6, 9, 10],
    features: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    id: 3,
    code: "ENTERPRISE",
    name: "Enterprise",
    description: "Unlimited outlets, offline sync, accounting and API",
    monthly: 199,
    yearly: 1990,
    currencyId: 2,
    trialDays: 30,
    active: true,
    tenants: 1,
    limits: [
      { code: "MAX_USERS", value: 200, unlimited: true },
      { code: "MAX_BRANCHES", value: 100, unlimited: false },
      { code: "MAX_WAREHOUSES", value: 200, unlimited: true },
      { code: "MAX_PRODUCTS", value: 100000, unlimited: true },
      { code: "MAX_TERMINALS", value: 300, unlimited: true },
      { code: "MAX_PRICE_LISTS", value: 500, unlimited: false },
      { code: "MAX_STORAGE", value: 102400, unlimited: true },
      { code: "MAX_API_REQUESTS", value: 0, unlimited: true },
    ],
    modules: [1, 2, 3, 4, 5, 6, 7, 9, 10],
    features: platformFeatures.map((f) => f.id),
  },
];

export const planById = (id: number) => plans.find((p) => p.id === id);

export const subscriptions = companies.map((company) => {
  const plan = planById(company.planId)!;
  const trial = company.status === "TRIAL";
  return {
    id: company.id,
    companyId: company.id,
    planId: plan.id,
    cycle: trial ? "MONTHLY" : "YEARLY",
    start: company.created,
    end: trial ? future(2) : future(155),
    status: trial ? "TRIAL" : company.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
    autoRenew: true,
    price: trial ? plan.monthly : plan.yearly,
    currencyId: plan.currencyId,
  };
});

export const usage = companies.flatMap((company) => [
  { companyId: company.id, code: "MAX_USERS", value: company.users.length, limit: planById(company.planId)!.limits.find((l) => l.code === "MAX_USERS")!.value },
  { companyId: company.id, code: "MAX_BRANCHES", value: company.branches.length, limit: planById(company.planId)!.limits.find((l) => l.code === "MAX_BRANCHES")!.value },
  { companyId: company.id, code: "MAX_WAREHOUSES", value: company.warehouses.length, limit: planById(company.planId)!.limits.find((l) => l.code === "MAX_WAREHOUSES")!.value },
  { companyId: company.id, code: "MAX_TERMINALS", value: company.terminals.length, limit: planById(company.planId)!.limits.find((l) => l.code === "MAX_TERMINALS")!.value },
  { companyId: company.id, code: "MAX_API_REQUESTS", value: 12000 + company.id * 8400, limit: planById(company.planId)!.limits.find((l) => l.code === "MAX_API_REQUESTS")!.value },
]);

export const usageLogs = [
  { companyId: 1, code: "MAX_USERS", from: 4, to: 5, source: "Vendor panel · user created", at: daysAgo(3, 14) },
  { companyId: 3, code: "MAX_TERMINALS", from: 2, to: 3, source: "Vendor panel · terminal added", at: daysAgo(5, 11) },
  { companyId: 4, code: "MAX_BRANCHES", from: 1, to: 2, source: "Super Admin · branch added", at: daysAgo(9, 10) },
  { companyId: 2, code: "MAX_USERS", from: 2, to: 3, source: "Vendor panel · user invited", at: daysAgo(2, 16) },
];

export const limitSnapshots = companies.map((company) => ({
  companyId: company.id,
  plan: planById(company.planId)!.name,
  from: company.created,
  to: null,
  limits: planById(company.planId)!.limits.map((l) => `${l.code}=${l.unlimited ? "unlimited" : l.value}`).join(" · "),
}));

export const addons = [
  { id: 1, code: "EXTRA_TERMINAL", name: "Extra POS terminal", description: "One additional terminal licence", price: 9, currencyId: 2, cycle: "MONTHLY", active: true, tenants: 3 },
  { id: 2, code: "EXTRA_BRANCH", name: "Extra branch", description: "One additional outlet", price: 19, currencyId: 2, cycle: "MONTHLY", active: true, tenants: 2 },
  { id: 3, code: "SMS_BUNDLE", name: "SMS bundle 5,000", description: "Transactional SMS credits", price: 45, currencyId: 2, cycle: "MONTHLY", active: true, tenants: 4 },
  { id: 4, code: "PRIORITY_SUPPORT", name: "Priority support", description: "4 hour first response SLA", price: 99, currencyId: 2, cycle: "MONTHLY", active: true, tenants: 2 },
  { id: 5, code: "DEDICATED_DB", name: "Dedicated database", description: "Isolated database instance", price: 249, currencyId: 2, cycle: "MONTHLY", active: true, tenants: 1 },
  { id: 6, code: "WHITE_LABEL", name: "White label receipts", description: "Custom branding on receipts", price: 59, currencyId: 2, cycle: "MONTHLY", active: false, tenants: 0 },
];

export const companyAddons = [
  { id: 1, companyId: 1, addonId: 1, qty: 2, price: 9, from: daysAgo(60, 9), to: future(305), status: "ACTIVE" },
  { id: 2, companyId: 1, addonId: 3, qty: 1, price: 45, from: daysAgo(30, 9), to: future(335), status: "ACTIVE" },
  { id: 3, companyId: 3, addonId: 5, qty: 1, price: 249, from: daysAgo(120, 9), to: future(245), status: "ACTIVE" },
  { id: 4, companyId: 3, addonId: 4, qty: 1, price: 99, from: daysAgo(45, 9), to: future(320), status: "ACTIVE" },
  { id: 5, companyId: 4, addonId: 2, qty: 1, price: 19, from: daysAgo(20, 9), to: future(345), status: "ACTIVE" },
];

export const trials = companies
  .filter((c) => c.status === "TRIAL")
  .map((company) => ({
    companyId: company.id,
    from: company.created,
    to: future(2),
    status: "ACTIVE",
    converted: null,
  }));

export const gracePeriods = [
  { companyId: 5, subscriptionId: 5, from: daysAgo(6, 9), to: future(4), reason: "Card declined — vendor given 10 days", approvedBy: "Mark Ruiz" },
];

export const subscriptionChanges = [
  { id: 1, companyId: 2, type: "UPGRADE_REQUESTED", oldPlan: 1, newPlan: 2, reason: "Vendor requested Professional for second branch", by: "Mark Ruiz", at: daysAgo(2, 11) },
  { id: 2, companyId: 1, type: "CYCLE_CHANGE", oldPlan: 2, newPlan: 2, reason: "Monthly → yearly (20% saving)", by: "Mark Ruiz", at: daysAgo(25, 12) },
  { id: 3, companyId: 3, type: "ADDON_ADDED", oldPlan: 3, newPlan: 3, reason: "Dedicated database addon", by: "Adrian Herman", at: daysAgo(120, 10) },
  { id: 4, companyId: 5, type: "SUSPENDED", oldPlan: 1, newPlan: 1, reason: "Two failed payment attempts", by: "Mark Ruiz", at: daysAgo(6, 16) },
];

/* ------------------------------- billing -------------------------------- */

export const paymentMethods = [
  { id: 1, code: "CARD", name: "Credit / debit card", type: "CARD", active: true },
  { id: 2, code: "BANK_TRANSFER", name: "Bank transfer", type: "BANK", active: true },
  { id: 3, code: "APPLE_PAY", name: "Apple Pay", type: "WALLET", active: true },
  { id: 4, code: "KNET", name: "KNET", type: "WALLET", active: true },
  { id: 5, code: "BENEFIT", name: "Benefit", type: "WALLET", active: true },
  { id: 6, code: "INVOICE_CREDIT", name: "Invoice credit", type: "CREDIT", active: false },
];

export const gateways = [
  { id: 1, code: "STRIPE", name: "Stripe", provider: "Stripe Inc.", active: true, tenants: 4, cards: ["Visa", "Mastercard", "Amex"], regions: "Global" },
  { id: 2, code: "TAP", name: "Tap Payments", provider: "Tap Payments KSA", active: true, tenants: 3, cards: ["KNET", "Benefit", "mada"], regions: "GCC" },
  { id: 3, code: "PAYPAL", name: "PayPal", provider: "PayPal", active: true, tenants: 1, cards: ["PayPal balance"], regions: "Global" },
  { id: 4, code: "CHECKOUT", name: "Checkout.com", provider: "Checkout.com", active: false, tenants: 0, cards: ["Cards", "Apple Pay"], regions: "EMEA" },
];

export const companyGateways = [
  { companyId: 1, gatewayId: 1, active: true, default: true, mode: "live", keyRef: "pk_live_••••4f2a" },
  { companyId: 1, gatewayId: 2, active: true, default: false, mode: "live", keyRef: "pk_live_••••9c31" },
  { companyId: 3, gatewayId: 1, active: true, default: true, mode: "live", keyRef: "pk_live_••••1b8e" },
  { companyId: 4, gatewayId: 2, active: true, default: true, mode: "live", keyRef: "pk_live_••••77de" },
  { companyId: 2, gatewayId: 3, active: false, default: false, mode: "sandbox", keyRef: "pk_test_••••aa10" },
];

let invoiceSeq = 1000;
export const invoices = companies.flatMap((company) => {
  const plan = planById(company.planId)!;
  const count = company.status === "TRIAL" ? 1 : company.id === 1 ? 4 : 3;
  return Array.from({ length: count }).map((_, index) => {
    const seq = ++invoiceSeq;
    const trialInvoice = company.status === "TRIAL" && index === 0;
    const subtotal = trialInvoice ? plan.monthly : plan.yearly;
    const date = daysAgo(company.status === "TRIAL" ? 0 : 30 * (index + 1), 11);
    const paid = trialInvoice ? 0 : subtotal;
    return {
      id: seq,
      uuid: `inv-${company.code.toLowerCase()}-${seq}`,
      companyId: company.id,
      subscriptionId: company.id,
      number: `PLT-${seq}`,
      date,
      due: future(7),
      subtotal,
      tax: round2(subtotal * 0),
      discount: company.status === "ACTIVE" && index > 0 ? round2(subtotal * 0.1) : 0,
      total: round2(subtotal - (company.status === "ACTIVE" && index > 0 ? subtotal * 0.1 : 0)),
      paid,
      balance: round2(subtotal - paid - (company.status === "ACTIVE" && index > 0 ? subtotal * 0.1 : 0)),
      currencyId: plan.currencyId,
      status: trialInvoice ? "DUE" : paid >= subtotal ? "PAID" : "PARTIAL",
      items: [
        { type: "SUBSCRIPTION", description: `${plan.name} plan · ${trialInvoice ? "monthly" : "yearly"}`, qty: 1, price: subtotal, total: subtotal },
        ...companyAddons
          .filter((a) => a.companyId === company.id)
          .map((addon) => {
            const addonDef = addons.find((a) => a.id === addon.addonId)!;
            return {
              type: "ADDON",
              description: `${addonDef.name} × ${addon.qty}`,
              qty: addon.qty,
              price: addon.price,
              total: round2(addon.qty * addon.price),
            };
          }),
      ],
    };
  });
});

export const payments = invoices
  .filter((invoice) => invoice.paid > 0)
  .map((invoice, index) => ({
    id: index + 1,
    companyId: invoice.companyId,
    invoiceId: invoice.id,
    methodId: index % 3 === 0 ? 2 : 1,
    reference: `ch_${invoice.uuid.slice(4, 14)}`,
    amount: invoice.paid,
    currencyId: invoice.currencyId,
    status: "SUCCESS",
    paidAt: invoice.date,
  }));

export const refunds = [
  { id: 1, paymentId: 2, companyId: 1, reference: "re_9f2a7c", amount: 79, reason: "Duplicate charge — resolved with vendor", status: "COMPLETED", at: daysAgo(20, 14) },
  { id: 2, paymentId: 5, companyId: 3, reference: "re_1b8e44", amount: 199, reason: "Downgrade mid cycle — prorated", status: "COMPLETED", at: daysAgo(45, 10) },
  { id: 3, paymentId: 9, companyId: 4, reference: "re_77de31", amount: 79, reason: "Service outage credit", status: "PENDING", at: daysAgo(3, 16) },
];

export const transactionLogs = invoices.slice(0, 10).map((invoice, index) => ({
  id: index + 1,
  companyId: invoice.companyId,
  invoiceId: invoice.id,
  gatewayId: index % 2 === 0 ? 1 : 2,
  type: index % 4 === 0 ? "REFUND" : "CHARGE",
  request: `req_${invoice.uuid.slice(4, 12)}`,
  gatewayRef: `pi_${invoice.uuid.slice(4, 14)}`,
  amount: invoice.total,
  status: "SUCCESS",
  requestData: { invoice: invoice.number, currency: currencyById(invoice.currencyId)?.code },
  responseData: { status: "succeeded", network: index % 2 === 0 ? "visa" : "mada" },
  at: invoice.date,
}));

export const webhookEvents = [
  { id: 1, gatewayId: 1, eventId: "evt_1Qa2b3", type: "payment_intent.succeeded", status: "PROCESSED", processed: daysAgo(0, 21), attempts: 1 },
  { id: 2, gatewayId: 1, eventId: "evt_1Qa2c9", type: "invoice.payment_failed", status: "PROCESSED", processed: daysAgo(6, 16), attempts: 1 },
  { id: 3, gatewayId: 2, eventId: "evt_2Rb7d1", type: "charge.captured", status: "PROCESSED", processed: daysAgo(1, 12), attempts: 1 },
  { id: 4, gatewayId: 1, eventId: "evt_1Qa3f0", type: "refund.created", status: "PENDING", processed: null, attempts: 2 },
  { id: 5, gatewayId: 2, eventId: "evt_2Rb8a4", type: "charge.captured", status: "FAILED", processed: daysAgo(2, 9), attempts: 5 },
];

/* --------------------------------- API ---------------------------------- */

export const apiClients = [
  { id: 1, name: "Flutter POS — Android", type: "MOBILE", clientId: "pos_android_7f3a", companyId: 1, scopes: ["products:read", "inventory:read", "sales:write", "customers:read"], status: "ACTIVE", expires: future(300), created: daysAgo(180, 9), calls: 1240000 },
  { id: 2, name: "Flutter POS — iOS", type: "MOBILE", clientId: "pos_ios_1b8e", companyId: 1, scopes: ["products:read", "sales:write"], status: "ACTIVE", expires: future(280), created: daysAgo(160, 9), calls: 342000 },
  { id: 3, name: "Vendor Web Portal", type: "WEB", clientId: "web_vendor_9c41", companyId: null, scopes: ["platform:*"], status: "ACTIVE", expires: future(120), created: daysAgo(300, 9), calls: 88000 },
  { id: 4, name: "Kitchen Display System", type: "KDS", clientId: "kds_77de", companyId: 4, scopes: ["orders:read", "orders:update"], status: "ACTIVE", expires: future(200), created: daysAgo(90, 9), calls: 412000 },
  { id: 5, name: "Delivery Bridge — Acme", type: "PARTNER", clientId: "partner_acme_55de", companyId: 3, scopes: ["orders:write", "menu:read"], status: "SANDBOX", expires: future(60), created: daysAgo(20, 9), calls: 5400 },
  { id: 6, name: "BI Warehouse Export", type: "INTERNAL", clientId: "bi_export_aa10", companyId: null, scopes: ["reports:read"], status: "ACTIVE", expires: future(90), created: daysAgo(45, 9), calls: 3100 },
];

export const apiUsage = [
  { companyId: 1, clientId: 1, endpoint: "GET /api/v1/products", method: "GET", status: 200, ms: 42, calls: 48200 },
  { companyId: 1, clientId: 1, endpoint: "POST /api/v1/sales", method: "POST", status: 201, ms: 128, calls: 18400 },
  { companyId: 3, clientId: 5, endpoint: "POST /api/v1/orders", method: "POST", status: 422, ms: 61, calls: 240 },
  { companyId: 4, clientId: 4, endpoint: "GET /api/v1/orders", method: "GET", status: 200, ms: 33, calls: 96500 },
  { companyId: 2, clientId: 2, endpoint: "POST /api/v1/sync", method: "POST", status: 409, ms: 88, calls: 310 },
];

export const apiLimits = subscriptions.map((sub) => {
  const plan = planById(sub.planId)!;
  return {
    subscriptionId: sub.id,
    companyId: sub.companyId,
    group: "default",
    perMinute: plan.code === "ENTERPRISE" ? 1200 : plan.code === "PROFESSIONAL" ? 600 : 120,
    perDay: plan.limits.find((l) => l.code === "MAX_API_REQUESTS")?.value ?? 100000,
  };
});

/* ---------------------------- notifications ----------------------------- */

export const platformNotifications = [
  { id: 1, title: "Trial ending in 2 days", message: "XYZ Grocery (CMP-002) trial expires on the 14th — no payment method on file.", type: "SUBSCRIPTION", priority: "HIGH", target: "COMPANY", targetId: 2, scheduled: daysAgo(0, 9), by: "System" },
  { id: 2, title: "Payment failed", message: "Ceylon Mart card declined twice — tenant suspended automatically.", type: "BILLING", priority: "URGENT", target: "COMPANY", targetId: 5, scheduled: daysAgo(6, 16), by: "System" },
  { id: 3, title: "New vendor registered", message: "Gulf Grill House completed onboarding on the Professional plan.", type: "VENDOR", priority: "MEDIUM", target: "ALL", targetId: null, scheduled: daysAgo(12, 10), by: "Yousef Ali" },
  { id: 4, title: "Backup storage at 80%", message: "Freshmart Electronics dedicated database is nearing its retention limit.", type: "SYSTEM", priority: "MEDIUM", target: "COMPANY", targetId: 3, scheduled: daysAgo(1, 8), by: "System" },
];

export const companyNotifications = companies.flatMap((company) => {
  const plan = planById(company.planId)!;
  const amount = company.status === "TRIAL" ? plan.monthly : plan.yearly;
  return [
  { id: company.id * 10 + 1, companyId: company.id, title: `Your ${plan.name} plan renews soon`, message: `Renewal on ${future(company.status === "TRIAL" ? 2 : 155).toDateString()} · ${currencyById(plan.currencyId)?.code} ${amount}`, type: "SUBSCRIPTION", priority: "MEDIUM", read: false, at: daysAgo(1, 9) },
  { id: company.id * 10 + 2, companyId: company.id, title: "New feature available", message: "Offline POS sync is now 2× faster on slow networks.", type: "PRODUCT", priority: "LOW", read: true, at: daysAgo(8, 9) },
  { id: company.id * 10 + 3, companyId: company.id, title: "API usage notice", message: "You used 62% of your daily API allowance.", type: "API", priority: "LOW", read: false, at: daysAgo(2, 9) },
  ];
});

export const notificationTemplates = [
  { id: 1, code: "TRIAL_ENDING", channel: "EMAIL", subject: "Your trial ends in {{days}} days", body: "Hi {{owner}}, your {{plan}} trial for {{company}} ends on {{date}}. Add a payment method to keep selling.", variables: ["days", "owner", "plan", "company", "date"], language: "en", active: true },
  { id: 2, code: "INVOICE_DUE", channel: "EMAIL", subject: "Invoice {{invoice}} due", body: "Invoice {{invoice}} for {{amount}} is due on {{due}}.", variables: ["invoice", "amount", "due"], language: "en", active: true },
  { id: 3, code: "PAYMENT_FAILED", channel: "SMS", subject: "", body: "Payment of {{amount}} failed for {{company}}. Update your card at {{link}}.", variables: ["amount", "company", "link"], language: "en", active: true },
  { id: 4, code: "TICKET_REPLIED", channel: "IN_APP", subject: "Support replied to {{ticket}}", body: "{{agent}} replied: {{preview}}", variables: ["ticket", "agent", "preview"], language: "en", active: true },
  { id: 5, code: "LIMIT_REACHED", channel: "EMAIL", subject: "{{limit}} limit reached", body: "You have reached the {{limit}} limit on the {{plan}} plan. Upgrade to continue.", variables: ["limit", "plan"], language: "en", active: true },
];

export const notificationRules = [
  { id: 1, event: "TRIAL_ENDING", templateId: 1, daysBefore: 7, channel: "EMAIL", active: true },
  { id: 2, event: "TRIAL_ENDING", templateId: 1, daysBefore: 2, channel: "SMS", active: true },
  { id: 3, event: "INVOICE_DUE", templateId: 2, daysBefore: 3, channel: "EMAIL", active: true },
  { id: 4, event: "PAYMENT_FAILED", templateId: 3, daysBefore: 0, channel: "SMS", active: true },
  { id: 5, event: "LIMIT_REACHED", templateId: 5, daysBefore: 0, channel: "IN_APP", active: true },
];

/* -------------------------------- support ------------------------------- */

export const tickets = [
  {
    id: 1,
    number: "TKT-0001",
    companyId: 1,
    subject: "Receipt printer not printing after app update",
    category: "HARDWARE",
    priority: "HIGH",
    status: "IN_PROGRESS",
    createdBy: "Khalid Al-Mannai",
    assignedTo: "Sara Nolan",
    created: daysAgo(3, 10),
    closed: null,
    messages: [
      { from: "VENDOR", author: "Khalid Al-Mannai", body: "Since updating to 1.4.2 the thermal printer prints a blank slip on Counter 1. The cash drawer still opens.", at: daysAgo(3, 10) },
      { from: "PLATFORM", author: "Sara Nolan", body: "Thanks — our hardware team is reproducing on the same printer model. Can you share the exact model and firmware?", at: daysAgo(2, 15) },
      { from: "VENDOR", author: "Khalid Al-Mannai", body: "It is a Sunmi V2 Pro, firmware 3.1.8. Attached the log file from the device.", at: daysAgo(1, 11), attachment: "device-log-1001.txt · 240 KB" },
    ],
  },
  {
    id: 2,
    number: "TKT-0002",
    companyId: 2,
    subject: "Trial expiring — need to upgrade and update card",
    category: "BILLING",
    priority: "MEDIUM",
    status: "OPEN",
    createdBy: "Nasser Al-Kuwari",
    assignedTo: "Mark Ruiz",
    created: daysAgo(2, 12),
    closed: null,
    messages: [
      { from: "VENDOR", author: "Nasser Al-Kuwari", body: "Our trial ends this week. Please upgrade us to Professional and send the invoice.", at: daysAgo(2, 12) },
    ],
  },
  {
    id: 3,
    number: "TKT-0003",
    companyId: 3,
    subject: "Offline sales not syncing on weak network",
    category: "SYNC",
    priority: "URGENT",
    status: "OPEN",
    createdBy: "Dana Farouk",
    assignedTo: "Sara Nolan",
    created: daysAgo(1, 9),
    closed: null,
    messages: [
      { from: "VENDOR", author: "Dana Farouk", body: "Two devices at Al Sadd show pending sync items for more than a day.", at: daysAgo(1, 9) },
      { from: "PLATFORM", author: "Sara Nolan", body: "Raised with the sync team — we can see 3 queued items for dev-cmp003-1003. Investigating the retry backoff.", at: daysAgo(0, 14) },
    ],
  },
  {
    id: 4,
    number: "TKT-0004",
    companyId: 1,
    subject: "Add Arabic to receipt header",
    category: "FEATURE",
    priority: "LOW",
    status: "RESOLVED",
    createdBy: "Aisha Rahman",
    assignedTo: "Adrian Herman",
    created: daysAgo(9, 11),
    closed: daysAgo(7, 16),
    messages: [
      { from: "VENDOR", author: "Aisha Rahman", body: "Can the receipt header support Arabic text? Customers ask for bilingual receipts.", at: daysAgo(9, 11) },
      { from: "PLATFORM", author: "Adrian Herman", body: "Shipped in 1.4.3 — bilingual receipt headers are supported. Closing this ticket.", at: daysAgo(7, 16) },
    ],
  },
  {
    id: 5,
    number: "TKT-0005",
    companyId: 4,
    subject: "Need extra branch licence for Marina outlet",
    category: "BILLING",
    priority: "MEDIUM",
    status: "CLOSED",
    createdBy: "Rashid Al-Falasi",
    assignedTo: "Mark Ruiz",
    created: daysAgo(14, 13),
    closed: daysAgo(11, 10),
    messages: [
      { from: "VENDOR", author: "Rashid Al-Falasi", body: "We opened a second restaurant — please add a branch and a terminal.", at: daysAgo(14, 13) },
      { from: "PLATFORM", author: "Mark Ruiz", body: "Added the Extra branch and Extra terminal addons. Invoice PLT-1004 issued.", at: daysAgo(13, 9) },
    ],
  },
  {
    id: 6,
    number: "TKT-0006",
    companyId: null,
    subject: "New vendor onboarding enquiry",
    category: "GENERAL",
    priority: "MEDIUM",
    status: "OPEN",
    createdBy: "Omar Shaikh",
    assignedTo: null,
    created: daysAgo(1, 14),
    closed: null,
    messages: [
      { from: "VENDOR", author: "Omar Shaikh", body: "I run three minimarts in Doha and would like a 30 day trial of the Enterprise plan.", at: daysAgo(1, 14) },
    ],
  },
];

export const ticketAttachments = [
  { id: 1, ticketId: 1, messageId: 3, name: "device-log-1001.txt", size: "240 KB", type: "text/plain", path: "tickets/1/device-log-1001.txt" },
  { id: 2, ticketId: 1, messageId: 3, name: "printer-photo.jpg", size: "1.8 MB", type: "image/jpeg", path: "tickets/1/printer-photo.jpg" },
  { id: 3, ticketId: 3, messageId: 2, name: "sync-queue-export.json", size: "88 KB", type: "application/json", path: "tickets/3/sync-queue-export.json" },
  { id: 4, ticketId: 5, messageId: 2, name: "invoice-PLT-1004.pdf", size: "120 KB", type: "application/pdf", path: "tickets/5/invoice-PLT-1004.pdf" },
];

/* ------------------------------ audit logs ------------------------------ */

export const auditLogs = [
  { id: 1, adminId: 1, admin: "Adrian Herman", companyId: 1, action: "company.feature_override", entity: "company_feature_overrides", entityId: 1, old: { enabled: false }, next: { enabled: true }, ip: "197.220.14.8", at: daysAgo(1, 12) },
  { id: 2, adminId: 3, admin: "Mark Ruiz", companyId: 2, action: "subscription.plan_change", entity: "company_subscriptions", entityId: 2, old: { plan: "STARTER" }, next: { plan: "PROFESSIONAL" }, ip: "197.220.14.8", at: daysAgo(2, 11) },
  { id: 3, adminId: 3, admin: "Mark Ruiz", companyId: 5, action: "company.suspend", entity: "companies", entityId: 5, old: { status: "ACTIVE" }, next: { status: "SUSPENDED" }, ip: "197.220.14.8", at: daysAgo(6, 16) },
  { id: 4, adminId: 5, admin: "Yousef Ali", companyId: 4, action: "company.create", entity: "companies", entityId: 4, old: null, next: { code: "CMP-004", plan: "PROFESSIONAL" }, ip: "197.220.14.9", at: daysAgo(96, 10) },
  { id: 5, adminId: 6, admin: "Ken Tanaka", companyId: 3, action: "api.key_create", entity: "platform_api_clients", entityId: 5, old: null, next: { scopes: ["orders:write"] }, ip: "51.36.90.4", at: daysAgo(20, 9) },
  { id: 6, adminId: 2, admin: "Linda Cruz", companyId: 1, action: "company.tax.update", entity: "company_tax_settings", entityId: 1, old: { rate: 5 }, next: { rate: 5, inclusive: true }, ip: "197.220.14.8", at: daysAgo(30, 12) },
  { id: 7, adminId: 3, admin: "Mark Ruiz", companyId: 1, action: "billing.refund", entity: "subscription_payment_refunds", entityId: 1, old: { amount: 0 }, next: { amount: 79 }, ip: "197.220.14.8", at: daysAgo(20, 14) },
  { id: 8, adminId: 4, admin: "Sara Nolan", companyId: 2, action: "support.impersonate", entity: "support_tickets", entityId: 2, old: null, next: { duration: "30m" }, ip: "82.115.66.20", at: daysAgo(2, 13) },
  { id: 9, adminId: 1, admin: "Adrian Herman", companyId: null, action: "platform.settings.update", entity: "platform_settings", entityId: null, old: { maintenance_mode: "true" }, next: { maintenance_mode: "false" }, ip: "197.220.14.8", at: daysAgo(5, 8) },
  { id: 10, adminId: 6, admin: "Ken Tanaka", companyId: 3, action: "backup.restore_test", entity: "company_backup_records", entityId: 11, old: null, next: { result: "passed" }, ip: "51.36.90.4", at: daysAgo(10, 7) },
];

/* -------------------------------- files --------------------------------- */

export const files = [
  { id: 1, companyId: 1, name: "abc-logo.svg", disk: "s3", path: "companies/1/branding/abc-logo.svg", mime: "image/svg+xml", size: "24 KB", by: "Khalid Al-Mannai", at: daysAgo(200, 10) },
  { id: 2, companyId: 1, name: "trade-licence.pdf", disk: "s3", path: "companies/1/documents/trade-licence.pdf", mime: "application/pdf", size: "1.2 MB", by: "Khalid Al-Mannai", at: daysAgo(200, 10) },
  { id: 3, companyId: 3, name: "vat-certificate.pdf", disk: "s3", path: "companies/3/documents/vat-certificate.pdf", mime: "application/pdf", size: "780 KB", by: "Dana Farouk", at: daysAgo(120, 9) },
  { id: 4, companyId: 4, name: "gulf-grill-menu.pdf", disk: "s3", path: "companies/4/documents/menu.pdf", mime: "application/pdf", size: "3.4 MB", by: "Rashid Al-Falasi", at: daysAgo(40, 12) },
  { id: 5, companyId: null, name: "platform-terms-v4.pdf", disk: "s3", path: "platform/terms/terms-v4.pdf", mime: "application/pdf", size: "420 KB", by: "Adrian Herman", at: daysAgo(60, 9) },
  { id: 6, companyId: 2, name: "bank-letter.pdf", disk: "s3", path: "companies/2/documents/bank-letter.pdf", mime: "application/pdf", size: "560 KB", by: "Nasser Al-Kuwari", at: daysAgo(10, 15) },
];

/* --------------------------- database reference ------------------------- */

export const TABLE_MAP = [
  {
    module: "01 Platform",
    tables: [
      { name: "platform_settings", purpose: "Global SaaS settings (timezone, language, registration)" },
      { name: "platform_configs", purpose: "Technical configuration, encrypted secrets per environment" },
      { name: "platform_modules", purpose: "Modules offered on the platform (RETAIL, RESTAURANT, POS …)" },
      { name: "platform_features", purpose: "Features inside each module" },
      { name: "feature_flags", purpose: "Rollout switches with percentage and conditions" },
    ],
  },
  {
    module: "02 Super admin users",
    tables: [
      { name: "platform_admins", purpose: "Your platform staff accounts" },
      { name: "platform_admin_roles", purpose: "Super admin role definitions" },
      { name: "platform_permissions", purpose: "Permission catalogue (company.suspend, billing.refund …)" },
      { name: "platform_role_permissions", purpose: "Role → permission mapping" },
      { name: "platform_admin_user_roles", purpose: "Admin → role mapping" },
      { name: "platform_admin_sessions", purpose: "Live admin sessions with IP and device" },
      { name: "platform_admin_login_logs", purpose: "Successful and failed sign-ins" },
    ],
  },
  {
    module: "03 Vendor / shop management",
    tables: [
      { name: "companies", purpose: "Every vendor/shop on the platform (country + currency live here)" },
      { name: "company_settings", purpose: "Per vendor configuration (invoice prefix, decimals …)" },
      { name: "company_contacts", purpose: "Primary, billing and technical contacts" },
      { name: "company_addresses", purpose: "Registered and branch addresses" },
      { name: "company_status_history", purpose: "Why and when a vendor changed status" },
      { name: "company_users", purpose: "Vendor staff accounts (owner, manager, cashier …)" },
      { name: "username_rules", purpose: "Username policy per vendor" },
      { name: "company_branches", purpose: "Outlets belonging to a vendor" },
      { name: "company_warehouses", purpose: "Stores inside each branch" },
      { name: "company_devices", purpose: "Registered phones, tablets and KDS screens" },
      { name: "company_terminals", purpose: "POS terminals bound to a device and branch" },
    ],
  },
  {
    module: "04 Company tax",
    tables: [
      { name: "company_tax_settings", purpose: "Tax registration, system, rate and inclusive flag per vendor and country" },
    ],
  },
  {
    module: "05 Subscriptions",
    tables: [
      { name: "subscription_plans", purpose: "Plans with monthly and yearly pricing" },
      { name: "subscription_plan_limits", purpose: "Limit codes and values per plan" },
      { name: "subscription_plan_modules", purpose: "Modules included in a plan" },
      { name: "subscription_plan_features", purpose: "Features included in a plan" },
      { name: "company_subscriptions", purpose: "The active subscription of a vendor" },
      { name: "subscription_limit_snapshots", purpose: "Historical limits at a point in time" },
      { name: "subscription_usage", purpose: "Current usage against each limit" },
      { name: "subscription_usage_logs", purpose: "Every usage change with its source" },
      { name: "subscription_addons", purpose: "Sellable add-ons catalogue" },
      { name: "company_subscription_addons", purpose: "Add-ons attached to a subscription" },
      { name: "subscription_trials", purpose: "Trial windows and conversion" },
      { name: "subscription_grace_periods", purpose: "Approved payment grace windows" },
      { name: "subscription_changes", purpose: "Upgrades, downgrades and suspensions" },
    ],
  },
  {
    module: "06 Billing",
    tables: [
      { name: "subscription_invoices", purpose: "Invoices raised to vendors" },
      { name: "subscription_invoice_items", purpose: "Invoice lines (plan, add-ons, credits)" },
      { name: "subscription_payments", purpose: "Payments received against invoices" },
      { name: "payment_methods", purpose: "Card, bank, wallet, credit methods" },
      { name: "payment_gateways", purpose: "Gateway definitions (Stripe, Tap …)" },
      { name: "company_payment_gateways", purpose: "Encrypted gateway configuration per vendor" },
      { name: "subscription_payment_refunds", purpose: "Refunds issued to vendors" },
      { name: "payment_transaction_logs", purpose: "Raw gateway requests and responses" },
      { name: "payment_webhook_events", purpose: "Inbound gateway webhooks and processing state" },
    ],
  },
  {
    module: "07 API",
    tables: [
      { name: "platform_api_clients", purpose: "API clients with scopes and expiry" },
      { name: "api_usage_logs", purpose: "Per request endpoint, status and latency" },
      { name: "subscription_api_limits", purpose: "Rate limits per subscription" },
    ],
  },
  {
    module: "08 Notifications",
    tables: [
      { name: "platform_notifications", purpose: "Announcements and alerts to tenants" },
      { name: "company_notifications", purpose: "Inbox per vendor" },
      { name: "notification_templates", purpose: "Reusable templates with variables" },
      { name: "subscription_notification_rules", purpose: "When a template is sent (days before event)" },
    ],
  },
  {
    module: "09 Support",
    tables: [
      { name: "support_tickets", purpose: "Vendor tickets with priority and assignee" },
      { name: "support_ticket_messages", purpose: "Conversation including internal notes" },
      { name: "support_ticket_attachments", purpose: "Files attached to a message" },
    ],
  },
  {
    module: "10 Security & audit",
    tables: [
      { name: "platform_security_events", purpose: "Brute force, escalation, impersonation events" },
      { name: "platform_audit_logs", purpose: "Every privileged change with old and new values" },
    ],
  },
  {
    module: "11 Company control",
    tables: [
      { name: "company_feature_overrides", purpose: "Super admin can switch a feature on or off per vendor" },
      { name: "company_data_retention_policies", purpose: "Retention windows for data, backups and audit" },
      { name: "company_deletion_requests", purpose: "Approved tenant deletion workflow" },
      { name: "company_backup_records", purpose: "Backup runs, size, checksum and status" },
    ],
  },
  {
    module: "12 Authentication",
    tables: [
      { name: "access_tokens", purpose: "Hashed API and personal tokens with scopes" },
      { name: "password_reset_tokens", purpose: "Single use password reset links" },
      { name: "two_factor_auth", purpose: "TOTP / SMS second factor and recovery codes" },
    ],
  },
  {
    module: "13 Master data",
    tables: [
      { name: "countries", purpose: "Countries with phone code and default tax system" },
      { name: "currencies", purpose: "Currencies with symbol and decimals" },
      { name: "platform_files", purpose: "Uploaded documents and branding assets" },
    ],
  },
];

export const TABLE_COUNT = TABLE_MAP.reduce((sum, group) => sum + group.tables.length, 0);

/* ------------------------------ analytics ------------------------------- */

export function saMetrics() {
  const active = companies.filter((c) => c.status === "ACTIVE");
  const trial = companies.filter((c) => c.status === "TRIAL");
  const mrr = active.reduce((sum, c) => {
    const sub = subscriptions.find((s) => s.companyId === c.id)!;
    return sum + (sub.cycle === "MONTHLY" ? sub.price : round2(sub.price / 12));
  }, 0);
  const addonMrr = companyAddons
    .filter((a) => a.status === "ACTIVE")
    .reduce((sum, a) => sum + a.qty * a.price, 0);
  const collected = payments.reduce((sum, p) => sum + p.amount, 0);
  const outstanding = invoices.reduce((sum, i) => sum + i.balance, 0);
  const devices = companies.flatMap((c) => c.devices);
  const online = devices.filter((d) => d.status === "ONLINE").length;
  const openTickets = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
  return {
    total: companies.length,
    active: active.length,
    trial: trial.length,
    suspended: companies.filter((c) => c.status === "SUSPENDED").length,
    mrr: round2(mrr),
    addonMrr,
    arr: round2((mrr + addonMrr) * 12),
    collected,
    outstanding,
    devices: devices.length,
    online,
    offline: devices.length - online,
    openTickets,
    users: companies.reduce((sum, c) => sum + c.users.length, 0),
    branches: companies.reduce((sum, c) => sum + c.branches.length, 0),
    warehouses: companies.reduce((sum, c) => sum + c.warehouses.length, 0),
    terminals: companies.reduce((sum, c) => sum + c.terminals.length, 0),
    apiCalls: apiClients.reduce((sum, c) => sum + c.calls, 0),
    overrides: featureOverrides.filter((o) => o.enabled).length,
  };
}

export function mrrByMonth() {
  const buckets = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    buckets.set(
      new Intl.DateTimeFormat("en-GB", { month: "short" }).format(d),
      0,
    );
  }
  payments.forEach((payment) => {
    const key = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(payment.paidAt);
    if (buckets.has(key)) buckets.set(key, round2((buckets.get(key) ?? 0) + payment.amount));
  });
  return [...buckets.entries()].map(([label, value]) => ({ label, value }));
}

export function tenantsByPlan() {
  return plans.map((plan) => ({
    label: plan.name,
    value: companies.filter((c) => c.planId === plan.id).length,
    color: plan.id === 1 ? "#FE9F43" : plan.id === 2 ? "#092C4C" : "#0984E3",
  }));
}

export function tenantsByCountry() {
  return countries
    .map((country) => ({
      label: country.name,
      value: companies.filter((c) => c.countryId === country.id).length,
      rate: country.defaultRate,
    }))
    .filter((row) => row.value > 0);
}

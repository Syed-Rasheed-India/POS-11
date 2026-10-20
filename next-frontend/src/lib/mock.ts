/* ------------------------------------------------------------------ *
 * UI-only demo dataset (no database, no network).
 * Deterministic generator so every screen always shows the same data.
 * ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const money = (n: number) => n.toFixed(2);
const daysAgo = (days: number, hour = 12) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, Math.floor((days * 37) % 59), 0, 0);
  return d;
};
const futureDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

/* ------------------------------ types ----------------------------- */

export type Company = {
  id: number;
  code: string;
  name: string;
  legalName: string;
  email: string;
  phone: string;
  website: string;
  country: string;
  city: string;
  address: string;
  currency: string;
  timezone: string;
  status: "ACTIVE" | "TRIAL" | "SUSPENDED" | "INACTIVE";
  planId: number;
  createdAt: Date;
};

export type Plan = {
  id: number;
  name: string;
  code: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  trialDays: number;
  maxUsers: number;
  maxBranches: number;
  maxWarehouses: number;
  maxTerminals: number;
  maxProducts: number;
  storageLimitMb: number;
  featured?: boolean;
};

export type Feature = { id: number; key: string; name: string; module: string; description: string };
export type PlanFeature = { planId: number; featureKey: string; enabled: boolean };

export type Branch = { id: number; code: string; name: string; city: string; address: string; phone: string; status: string };
export type Warehouse = { id: number; branchId: number; code: string; name: string; type: string };
export type Terminal = { id: number; branchId: number; warehouseId: number; code: string; name: string; deviceId: string; status: string; lastSyncAt: Date; lastSaleAt: Date | null };
export type Device = { id: number; deviceId: string; name: string; platform: string; appVersion: string; hardware: string; branchId: number; status: "ONLINE" | "OFFLINE"; lastSyncAt: Date };
export type User = { id: number; name: string; username: string; email: string; phone: string; role: string; status: "ACTIVE" | "INACTIVE"; branches: number[]; lastLoginAt: Date };
export type Role = { id: number; name: string; description: string; permissions: string[]; system: boolean };
export type Category = { id: number; name: string; code: string };
export type Brand = { id: number; name: string; code: string };
export type Uom = { id: number; name: string; code: string; symbol: string; decimals: boolean };
export type Product = {
  id: number;
  sku: string;
  name: string;
  shortName: string;
  description: string;
  categoryId: number;
  brandId: number;
  uomId: number;
  price: number;
  cost: number;
  tax: number;
  reorderLevel: number;
  weighted: boolean;
  expiry: boolean;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  stock: number;
  barcode: string;
  updatedAt: Date;
};
export type Barcode = { id: number; productId: number; barcode: string; type: string; primary: boolean };
export type PriceList = { id: number; name: string; code: string; currency: string; items: number; default: boolean };
export type Promotion = { id: number; name: string; code: string; type: string; value: number; startDate: Date; endDate: Date; status: string; description: string };
export type Customer = { id: number; code: string; name: string; type: string; phone: string; email: string; taxNumber: string; address: string; groupId: number; creditLimit: number; terms: number; points: number; status: string };
export type CustomerGroup = { id: number; name: string; description: string; discount: number; credit: boolean; creditLimit: number; priceList: string };
export type Supplier = { id: number; code: string; name: string; contact: string; phone: string; email: string; taxNumber: string; address: string; terms: number; creditLimit: number; status: string };
export type SaleLine = { productId: number; name: string; qty: number; price: number; cost: number; discount: number; tax: number };
export type Sale = {
  id: number;
  uuid: string;
  invoiceNo: string;
  date: Date;
  branchId: number;
  warehouseId: number;
  terminalId: number;
  cashierId: number;
  customerId: number | null;
  items: SaleLine[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  cost: number;
  paid: number;
  balance: number;
  payments: { code: string; amount: number }[];
  status: "COMPLETED" | "CANCELLED" | "RETURNED" | "HELD";
  paymentStatus: "PAID" | "PARTIAL" | "UNPAID" | "REFUNDED";
  source: "POS" | "MOBILE" | "ONLINE" | "ADMIN";
};
export type PurchaseOrder = { id: number; ref: string; supplierId: number; warehouseId: number; date: Date; expected: Date; status: string; subtotal: number; tax: number; total: number; lines: { productId: number; qty: number; received: number; cost: number }[]; notes: string };
export type Grn = { id: number; no: string; supplierId: number; warehouseId: number; date: Date; status: string; total: number };
export type PurchaseInvoice = { id: number; no: string; supplierId: number; date: Date; dueDate: Date; amount: number; paid: number; status: string };
export type Adjustment = { id: number; ref: string; warehouseId: number; reason: string; date: Date; status: string; lines: { productId: number; system: number; counted: number; diff: number }[]; user: string };
export type Transfer = { id: number; ref: string; from: number; to: number; date: Date; status: string; note: string; lines: { productId: number; qty: number }[] };
export type LedgerEntry = { id: number; type: string; direction: "IN" | "OUT"; productId: number; warehouseId: number; qty: number; ref: string; date: Date };
export type Shift = { id: number; no: string; terminalId: number; cashierId: number; openedAt: Date; closedAt: Date | null; openingCash: number; expectedCash: number; countedCash: number; cashSales: number; cardSales: number; totalSales: number; transactions: number; status: "OPEN" | "CLOSED" };
export type HeldSale = { id: number; ref: string; createdAt: Date; items: number; total: number };
export type SalesReturn = { id: number; no: string; saleId: number; invoice: string; date: Date; reason: string; total: number; refunded: number; status: string };
export type Notification = { id: number; type: string; title: string; message: string; date: Date; read: boolean };
export type Ticket = { id: number; no: string; companyId: number | null; subject: string; category: string; priority: string; status: string; requester: string; email: string; assignee: string | null; createdAt: Date; messages: { author: string; from: "VENDOR" | "PLATFORM"; body: string; date: Date }[] };
export type AuditEntry = { id: number; companyId: number | null; actor: string; actorType: "PLATFORM" | "COMPANY"; module: string; action: string; description: string; date: Date };
export type PlatformPayment = { id: number; companyId: number; invoiceNo: string; ref: string; amount: number; currency: string; method: string; date: Date; status: "PAID" | "PENDING" | "FAILED" | "REFUNDED" };
export type ApiToken = { id: number; companyId: number; name: string; token: string; abilities: string[]; lastUsedAt: Date };
export type PlatformAdmin = { id: number; name: string; email: string; phone: string; title: string; role: string; status: string; lastLoginAt: Date };

export type Tenant = {
  company: Company;
  settings: Record<string, string>;
  subscription: {
    planId: number;
    status: "TRIAL" | "ACTIVE" | "EXPIRED" | "SUSPENDED" | "CANCELLED";
    cycle: "MONTHLY" | "YEARLY";
    amount: number;
    startDate: Date;
    endDate: Date;
    autoRenew: boolean;
  };
  branches: Branch[];
  warehouses: Warehouse[];
  terminals: Terminal[];
  devices: Device[];
  users: User[];
  roles: Role[];
  categories: Category[];
  brands: Brand[];
  uoms: Uom[];
  products: Product[];
  barcodes: Barcode[];
  priceLists: PriceList[];
  promotions: Promotion[];
  customers: Customer[];
  customerGroups: CustomerGroup[];
  suppliers: Supplier[];
  sales: Sale[];
  purchaseOrders: PurchaseOrder[];
  grns: Grn[];
  purchaseInvoices: PurchaseInvoice[];
  adjustments: Adjustment[];
  transfers: Transfer[];
  ledger: LedgerEntry[];
  shifts: Shift[];
  heldSales: HeldSale[];
  returns: SalesReturn[];
  notifications: Notification[];
};

/* ---------------------------- catalogue --------------------------- */

const UOMS: Omit<Uom, "id">[] = [
  { name: "Piece", code: "PCS", symbol: "pc", decimals: false },
  { name: "Kilogram", code: "KG", symbol: "kg", decimals: true },
  { name: "Litre", code: "LTR", symbol: "L", decimals: true },
  { name: "Box", code: "BOX", symbol: "box", decimals: false },
  { name: "Pack", code: "PACK", symbol: "pk", decimals: false },
  { name: "Bottle", code: "BTL", symbol: "btl", decimals: false },
  { name: "Bag", code: "BAG", symbol: "bag", decimals: false },
  { name: "Tray", code: "TRAY", symbol: "tray", decimals: false },
];

type Spec = { name: string; category: string; brand: string; uom: string; price: number; cost: number; tax?: number; weighted?: boolean };

const GROCERY: Spec[] = [
  { name: "Fresh Full Cream Milk 1L", category: "Dairy", brand: "Almarai", uom: "PCS", price: 5.5, cost: 3.6 },
  { name: "White Bread 600g", category: "Bakery", brand: "Bakers", uom: "PCS", price: 4.0, cost: 2.4 },
  { name: "Basmati Rice 5kg", category: "Food Cupboard", brand: "Tilda", uom: "BAG", price: 32.0, cost: 23.5, tax: 5 },
  { name: "Extra Virgin Olive Oil 1L", category: "Food Cupboard", brand: "Filo", uom: "BTL", price: 28.5, cost: 19.9, tax: 5 },
  { name: "Orange Juice 1.5L", category: "Beverages", brand: "Sunquick", uom: "BTL", price: 12.75, cost: 8.6 },
  { name: "Mineral Water 1.5L Pack of 12", category: "Beverages", brand: "Safa", uom: "PACK", price: 18.0, cost: 12.4 },
  { name: "Potato Chips 150g", category: "Snacks", brand: "Lays", uom: "PCS", price: 6.5, cost: 4.1 },
  { name: "Milk Chocolate Bar 80g", category: "Snacks", brand: "Galaxy", uom: "PCS", price: 7.0, cost: 4.75 },
  { name: "Eggs Tray of 30", category: "Dairy", brand: "Al Rawabi", uom: "TRAY", price: 21.0, cost: 16.2 },
  { name: "Chicken Breast", category: "Butchery", brand: "Al Maha", uom: "KG", price: 27.5, cost: 21.0, weighted: true },
  { name: "Banana", category: "Fresh Produce", brand: "Local Farm", uom: "KG", price: 6.75, cost: 3.9, weighted: true },
  { name: "Dishwash Liquid 1L", category: "Household", brand: "Fairy", uom: "BTL", price: 11.25, cost: 7.3 },
  { name: "Shampoo 400ml", category: "Personal Care", brand: "Head & Shoulders", uom: "BTL", price: 24.0, cost: 16.2 },
  { name: "Black Tea Bags 100s", category: "Beverages", brand: "Lipton", uom: "BOX", price: 17.5, cost: 11.9, tax: 5 },
  { name: "Frozen Green Peas 900g", category: "Frozen", brand: "Al Kabeer", uom: "PACK", price: 9.75, cost: 6.4 },
  { name: "Laundry Powder 3kg", category: "Household", brand: "Ariel", uom: "BAG", price: 39.0, cost: 28.6, tax: 5 },
  { name: "Tomato Paste 400g", category: "Food Cupboard", brand: "Filo", uom: "PCS", price: 5.25, cost: 3.4 },
  { name: "Cheddar Cheese 200g", category: "Dairy", brand: "Kiri", uom: "PCS", price: 13.5, cost: 9.8 },
];

const ELECTRONICS: Spec[] = [
  { name: "Smartphone X12 128GB", category: "Mobiles", brand: "Nova", uom: "PCS", price: 1899, cost: 1520 },
  { name: "Wireless Earbuds Pro", category: "Audio", brand: "Nova", uom: "PCS", price: 349, cost: 245 },
  { name: 'Laptop Air 14" i5 16GB', category: "Laptops", brand: "Zeta", uom: "PCS", price: 3299, cost: 2780 },
  { name: '55" 4K Smart TV', category: "Television", brand: "Vision", uom: "PCS", price: 2199, cost: 1840 },
  { name: "USB-C Cable 1m", category: "Accessories", brand: "Anker", uom: "PCS", price: 39, cost: 18 },
  { name: "Power Bank 20000mAh", category: "Accessories", brand: "Anker", uom: "PCS", price: 149, cost: 96 },
  { name: "Bluetooth Speaker Go 3", category: "Audio", brand: "JBL", uom: "PCS", price: 279, cost: 198 },
  { name: "Microwave Oven 23L", category: "Home Appliances", brand: "Sharp", uom: "PCS", price: 429, cost: 330 },
  { name: "Smart Watch S3", category: "Wearables", brand: "Nova", uom: "PCS", price: 599, cost: 430 },
  { name: "External SSD 1TB", category: "Storage", brand: "Kingston", uom: "PCS", price: 459, cost: 340 },
  { name: "Gaming Mouse RGB", category: "Accessories", brand: "Logik", uom: "PCS", price: 129, cost: 74 },
  { name: "Air Fryer 4.5L", category: "Home Appliances", brand: "Sharp", uom: "PCS", price: 549, cost: 402 },
];

const FIRST = ["Aisha", "Mohammed", "Fatima", "Yusuf", "Layla", "Omar", "Sara", "Hamad", "Noor", "Zainab", "Tariq", "Huda", "Khalid", "Maryam", "Bilal", "Dana", "Rashid", "Amira", "Jassim", "Hessa"];
const LAST = ["Al-Mannai", "Rahman", "Haddad", "Al-Sulaiti", "Nasser", "Al-Kuwari", "Farouk", "Shaikh", "Al-Dosari", "Malik", "Hassan", "Ibrahim"];
const SUPPLIER_NAMES = ["Gulf Food Distribution", "Al Maha Poultry Co.", "Household Traders L.L.C", "Beverage World", "Global Electronics Trading", "Doha Fresh Produce", "Nada Cosmetics Supply"];

/* ------------------------- permission catalogue ------------------- */

export const PERMISSIONS: { key: string; module: string; name: string }[] = [
  { key: "dashboard.view", module: "Dashboard", name: "View dashboard" },
  { key: "products.view", module: "Products", name: "View products" },
  { key: "products.create", module: "Products", name: "Create product" },
  { key: "products.edit", module: "Products", name: "Edit product" },
  { key: "products.delete", module: "Products", name: "Delete product" },
  { key: "inventory.view", module: "Inventory", name: "View stock" },
  { key: "inventory.adjust", module: "Inventory", name: "Adjust stock" },
  { key: "inventory.transfer", module: "Inventory", name: "Transfer stock" },
  { key: "sales.view", module: "Sales", name: "View sales" },
  { key: "sales.create", module: "Sales", name: "Create sale" },
  { key: "sales.return", module: "Sales", name: "Post sales return" },
  { key: "purchases.view", module: "Purchasing", name: "View purchases" },
  { key: "purchases.create", module: "Purchasing", name: "Create purchase" },
  { key: "customers.manage", module: "Customers", name: "Manage customers" },
  { key: "suppliers.manage", module: "Suppliers", name: "Manage suppliers" },
  { key: "promotions.manage", module: "Promotions", name: "Manage promotions" },
  { key: "reports.view", module: "Reports", name: "View reports" },
  { key: "users.manage", module: "Users", name: "Manage users" },
  { key: "roles.manage", module: "Users", name: "Manage roles" },
  { key: "branches.manage", module: "Organisation", name: "Manage branches" },
  { key: "settings.manage", module: "Settings", name: "Manage settings" },
];

export const ALL_PERMISSION_KEYS = PERMISSIONS.map((p) => p.key);

export const ROLE_PRESETS: { name: string; description: string; permissions: string[] }[] = [
  {
    name: "Company Admin",
    description: "Full control over the company, billing and settings",
    permissions: ALL_PERMISSION_KEYS,
  },
  {
    name: "Manager",
    description: "Runs day to day operations of the shops",
    permissions: [
      "dashboard.view", "products.view", "products.create", "products.edit", "inventory.view",
      "inventory.adjust", "inventory.transfer", "sales.view", "sales.create", "sales.return",
      "purchases.view", "purchases.create", "customers.manage", "suppliers.manage",
      "promotions.manage", "reports.view",
    ],
  },
  {
    name: "Cashier",
    description: "Operates the POS terminal and handles customers",
    permissions: ["dashboard.view", "sales.view", "sales.create", "customers.manage"],
  },
  {
    name: "Inventory Manager",
    description: "Owns stock, purchases and suppliers",
    permissions: [
      "dashboard.view", "products.view", "products.create", "products.edit", "inventory.view",
      "inventory.adjust", "inventory.transfer", "purchases.view", "purchases.create",
      "suppliers.manage", "reports.view",
    ],
  },
];

export const PLATFORM_PERMISSIONS: { key: string; module: string; name: string }[] = [
  { key: "vendors.view", module: "Vendors", name: "View vendors" },
  { key: "vendors.create", module: "Vendors", name: "Create vendor" },
  { key: "vendors.edit", module: "Vendors", name: "Edit vendor" },
  { key: "vendors.suspend", module: "Vendors", name: "Suspend vendor" },
  { key: "subscriptions.view", module: "Subscriptions", name: "View subscriptions" },
  { key: "subscriptions.manage", module: "Subscriptions", name: "Manage subscriptions" },
  { key: "payments.view", module: "Payments", name: "View payments" },
  { key: "reports.view", module: "Reports", name: "View platform reports" },
  { key: "support.manage", module: "Support", name: "Manage support" },
  { key: "settings.manage", module: "Settings", name: "Manage platform settings" },
  { key: "admins.manage", module: "Admins", name: "Manage admins" },
  { key: "audit.view", module: "Audit", name: "View audit logs" },
];

/* ------------------------------ plans ----------------------------- */

export const plans: Plan[] = [
  {
    id: 1,
    name: "Starter",
    code: "STARTER",
    description: "Single shop POS with basic inventory",
    monthlyPrice: 29,
    yearlyPrice: 290,
    currency: "USD",
    trialDays: 14,
    maxUsers: 5,
    maxBranches: 1,
    maxWarehouses: 1,
    maxTerminals: 2,
    maxProducts: 1000,
    storageLimitMb: 2048,
  },
  {
    id: 2,
    name: "Professional",
    code: "PROFESSIONAL",
    description: "Multi branch retail with purchasing and reports",
    monthlyPrice: 79,
    yearlyPrice: 790,
    currency: "USD",
    trialDays: 14,
    maxUsers: 25,
    maxBranches: 5,
    maxWarehouses: 10,
    maxTerminals: 15,
    maxProducts: 20000,
    storageLimitMb: 20480,
    featured: true,
  },
  {
    id: 3,
    name: "Enterprise",
    code: "ENTERPRISE",
    description: "Unlimited outlets, offline sync and accounting bridge",
    monthlyPrice: 199,
    yearlyPrice: 1990,
    currency: "USD",
    trialDays: 30,
    maxUsers: 200,
    maxBranches: 100,
    maxWarehouses: 200,
    maxTerminals: 300,
    maxProducts: 100000,
    storageLimitMb: 102400,
  },
];

export const features: Feature[] = [
  { id: 1, key: "retail_pos", name: "Retail POS", module: "Sales", description: "Touch friendly checkout with barcode scanning" },
  { id: 2, key: "offline_pos", name: "Offline POS", module: "Sales", description: "Queue sales while offline and sync later" },
  { id: 3, key: "inventory", name: "Inventory", module: "Inventory", description: "Stock balances, adjustments and transfers" },
  { id: 4, key: "multi_branch", name: "Multi Branch", module: "Organisation", description: "Operate more than one retail outlet" },
  { id: 5, key: "multi_warehouse", name: "Multi Warehouse", module: "Inventory", description: "Split stock across warehouses" },
  { id: 6, key: "purchasing", name: "Purchasing", module: "Purchasing", description: "Purchase orders, GRN and supplier bills" },
  { id: 7, key: "customer_credit", name: "Customer Credit", module: "Customers", description: "Credit limits and account statements" },
  { id: 8, key: "promotions", name: "Promotions", module: "Promotions", description: "Discounts, bundles and campaigns" },
  { id: 9, key: "barcode_scale", name: "Barcode Scale", module: "Hardware", description: "Weight and price embedded barcodes" },
  { id: 10, key: "advanced_reports", name: "Advanced Reports", module: "Reports", description: "Profit, COGS and cashier analytics" },
  { id: 11, key: "loyalty", name: "Loyalty", module: "Customers", description: "Points and customer rewards" },
  { id: 12, key: "accounting", name: "Accounting Bridge", module: "Finance", description: "Export journals to an accounting system" },
];

const PLAN_FEATURE_MATRIX: Record<string, string[]> = {
  STARTER: ["retail_pos", "inventory", "promotions", "loyalty"],
  PROFESSIONAL: [
    "retail_pos", "inventory", "multi_branch", "multi_warehouse", "purchasing",
    "customer_credit", "promotions", "advanced_reports", "loyalty", "barcode_scale",
  ],
  ENTERPRISE: features.map((f) => f.key),
};

export const planFeatures: PlanFeature[] = plans.flatMap((plan) =>
  features.map((feature) => ({
    planId: plan.id,
    featureKey: feature.key,
    enabled: PLAN_FEATURE_MATRIX[plan.code]?.includes(feature.key) ?? false,
  })),
);

export const platformSettings = [
  { key: "platform_name", value: "RetailPOS Cloud", type: "string", description: "Public platform name" },
  { key: "default_currency", value: "USD", type: "string", description: "Currency used for new tenants" },
  { key: "default_timezone", value: "Asia/Qatar", type: "string", description: "Fallback timezone" },
  { key: "maintenance_mode", value: "false", type: "boolean", description: "Blocks vendor logins" },
  { key: "registration_enabled", value: "true", type: "boolean", description: "Public sign-up" },
  { key: "default_trial_days", value: "14", type: "number", description: "Trial length" },
  { key: "support_email", value: "support@retailpos.cloud", type: "string", description: "Support inbox" },
];

export const platformAdmins: PlatformAdmin[] = [
  { id: 1, name: "Adrian Herman", email: "admin@retailpos.cloud", phone: "+974 4400 1122", title: "System Admin", role: "Super Admin", status: "ACTIVE", lastLoginAt: daysAgo(0, 9) },
  { id: 2, name: "Sara Nolan", email: "support@retailpos.cloud", phone: "+974 4400 3344", title: "Support Admin", role: "Support Admin", status: "ACTIVE", lastLoginAt: daysAgo(1, 14) },
  { id: 3, name: "Mark Ruiz", email: "finance@retailpos.cloud", phone: "+974 4400 5566", title: "Finance Admin", role: "Finance Admin", status: "ACTIVE", lastLoginAt: daysAgo(2, 11) },
];

export const platformRoles = [
  { id: 1, name: "Super Admin", description: "Unrestricted platform access", system: true, permissions: PLATFORM_PERMISSIONS.map((p) => p.key) },
  {
    id: 2,
    name: "Support Admin",
    description: "Vendor support only",
    system: true,
    permissions: ["vendors.view", "subscriptions.view", "payments.view", "support.manage"],
  },
  {
    id: 3,
    name: "Finance Admin",
    description: "Billing and revenue",
    system: true,
    permissions: ["vendors.view", "subscriptions.view", "subscriptions.manage", "payments.view", "reports.view"],
  },
];

/* ---------------------------- tenants ----------------------------- */

type TenantSeed = {
  id: number;
  code: string;
  name: string;
  legal: string;
  city: string;
  address: string;
  planId: number;
  status: Company["status"];
  currency: string;
  prefix: string;
  owner: string;
  catalog: Spec[];
  branches: { code: string; name: string; city: string; address: string }[];
  extraWarehouses: string[];
  joinedDays: number;
};

const TENANT_SEEDS: TenantSeed[] = [
  {
    id: 1,
    code: "CMP-001",
    name: "ABC Supermarket",
    legal: "ABC Trading W.L.L",
    city: "Doha",
    address: "Building 24, Al Corniche Street, West Bay, Doha",
    planId: 2,
    status: "ACTIVE",
    currency: "QAR",
    prefix: "ABC",
    owner: "Khalid Al-Mannai",
    catalog: GROCERY,
    joinedDays: 210,
    branches: [
      { code: "DOHA", name: "Doha Branch", city: "Doha", address: "Al Corniche Street, West Bay" },
      { code: "RAY", name: "Al Rayyan Branch", city: "Al Rayyan", address: "Al Rayyan Mall, Salwa Road" },
    ],
    extraWarehouses: ["DOH-COLD", "RAY-MAIN"],
  },
  {
    id: 2,
    code: "CMP-002",
    name: "XYZ Grocery",
    legal: "XYZ Retail Co.",
    city: "Al Wakrah",
    address: "Shop 12, Al Wakrah Souq, Al Wakrah",
    planId: 1,
    status: "TRIAL",
    currency: "QAR",
    prefix: "XYZ",
    owner: "Nasser Al-Kuwari",
    catalog: GROCERY.slice(0, 11),
    joinedDays: 12,
    branches: [{ code: "WAK", name: "Al Wakrah Central", city: "Al Wakrah", address: "Al Wakrah Souq Road" }],
    extraWarehouses: [],
  },
  {
    id: 3,
    code: "CMP-003",
    name: "Freshmart Electronics",
    legal: "Freshmart Electronics W.L.L",
    city: "Doha",
    address: "Villaggio Mall, Aspire Zone, Doha",
    planId: 3,
    status: "ACTIVE",
    currency: "QAR",
    prefix: "FM",
    owner: "Dana Farouk",
    catalog: ELECTRONICS,
    joinedDays: 340,
    branches: [
      { code: "VILL", name: "Villaggio Store", city: "Doha", address: "Villaggio Mall, Aspire Zone" },
      { code: "SADD", name: "Al Sadd Store", city: "Doha", address: "Al Sadd Street, Al Sadd" },
    ],
    extraWarehouses: ["SAD-MAIN"],
  },
];

let productIdSeq = 1000;
let saleIdSeq = 5000;
let ledgerIdSeq = 9000;

function buildTenant(seed: TenantSeed): Tenant {
  const rnd = mulberry32(seed.id * 7919);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
  const between = (min: number, max: number) => min + Math.floor(rnd() * (max - min + 1));
  const company: Company = {
    id: seed.id,
    code: seed.code,
    name: seed.name,
    legalName: seed.legal,
    email: `ops@${seed.name.split(" ")[0].toLowerCase()}.qa`,
    phone: `+974 ${between(3000, 7999)} ${between(1000, 9999)}`,
    website: `https://${seed.name.split(" ")[0].toLowerCase()}.qa`,
    country: "Qatar",
    city: seed.city,
    address: seed.address,
    currency: seed.currency,
    timezone: "Asia/Qatar",
    status: seed.status,
    planId: seed.planId,
    createdAt: daysAgo(seed.joinedDays, 10),
  };

  const plan = plans.find((p) => p.id === seed.planId)!;
  const trial = seed.status === "TRIAL";

  const branches: Branch[] = seed.branches.map((b, i) => ({
    id: seed.id * 100 + i + 1,
    code: b.code,
    name: b.name,
    city: b.city,
    address: b.address,
    phone: company.phone,
    status: "ACTIVE",
  }));

  const warehouses: Warehouse[] = [
    {
      id: seed.id * 100 + 11,
      branchId: branches[0].id,
      code: `${seed.branches[0].code}-MAIN`,
      name: `${seed.branches[0].name.split(" ")[0]} Main Warehouse`,
      type: "MAIN",
    },
    ...seed.extraWarehouses.map((code, i) => ({
      id: seed.id * 100 + 12 + i,
      branchId: branches[Math.min(1, branches.length - 1)].id,
      code,
      name: code.includes("COLD") ? "Cold Storage" : `${seed.branches[1]?.name.split(" ")[0] ?? "Second"} Warehouse`,
      type: code.includes("COLD") ? "COLD" : "MAIN",
    })),
  ];

  const uoms: Uom[] = UOMS.map((u, i) => ({ ...u, id: seed.id * 200 + i + 1 }));
  const uomByCode = new Map(uoms.map((u) => [u.code, u]));

  const categories: Category[] = Array.from(new Set(seed.catalog.map((c) => c.category))).map((name, i) => ({
    id: seed.id * 300 + i + 1,
    name,
    code: name.slice(0, 3).toUpperCase(),
  }));
  const brands: Brand[] = Array.from(new Set(seed.catalog.map((c) => c.brand))).map((name, i) => ({
    id: seed.id * 400 + i + 1,
    name,
    code: name.slice(0, 3).toUpperCase(),
  }));
  const catByName = new Map(categories.map((c) => [c.name, c]));
  const brandByName = new Map(brands.map((b) => [b.name, b]));

  const products: Product[] = seed.catalog.map((spec, i) => {
    const id = ++productIdSeq;
    return {
      id,
      sku: `${seed.prefix}-SKU-${String(i + 1).padStart(4, "0")}`,
      name: spec.name,
      shortName: spec.name.slice(0, 24),
      description: `${spec.brand} ${spec.name} — sold per ${spec.uom.toLowerCase()}`,
      categoryId: catByName.get(spec.category)!.id,
      brandId: brandByName.get(spec.brand)!.id,
      uomId: uomByCode.get(spec.uom)!.id,
      price: spec.price,
      cost: spec.cost,
      tax: spec.tax ?? 0,
      reorderLevel: between(10, 40),
      weighted: spec.weighted ?? false,
      expiry: ["Dairy", "Bakery", "Butchery", "Fresh Produce"].includes(spec.category),
      status: "ACTIVE",
      stock: between(40, 320),
      barcode: `6${String(seed.id).padStart(3, "0")}${String(i + 1).padStart(4, "0")}${between(1000, 9999)}`.slice(0, 13),
      updatedAt: daysAgo(between(1, 40), 11),
    };
  });

  const barcodes: Barcode[] = products.map((p) => ({
    id: p.id + 50000,
    productId: p.id,
    barcode: p.barcode,
    type: p.weighted ? "WEIGHT" : "NORMAL",
    primary: true,
  }));

  const priceLists: PriceList[] = [
    { id: seed.id * 600 + 1, name: "Retail Price", code: "RETAIL", currency: seed.currency, items: products.length, default: true },
    { id: seed.id * 600 + 2, name: "Wholesale Price", code: "WHOLESALE", currency: seed.currency, items: products.length, default: false },
    { id: seed.id * 600 + 3, name: "VIP Price", code: "VIP", currency: seed.currency, items: products.length, default: false },
  ];

  const promotions: Promotion[] = [
    {
      id: seed.id * 700 + 1,
      name: "Weekend Snack Fest",
      code: "WEEKEND10",
      type: "PERCENT",
      value: 10,
      startDate: daysAgo(20, 9),
      endDate: futureDays(20),
      status: "ACTIVE",
      description: "10% off selected snack lines every weekend",
    },
    {
      id: seed.id * 700 + 2,
      name: "Buy 2 Get 1 Free — Beverages",
      code: "B2G1BEV",
      type: "BUY_X_GET_Y",
      value: 0,
      startDate: daysAgo(10, 9),
      endDate: futureDays(30),
      status: "ACTIVE",
      description: "Third beverage free on qualifying lines",
    },
    {
      id: seed.id * 700 + 3,
      name: `${seed.currency} 5 off over 100`,
      code: "SAVE5",
      type: "FIXED",
      value: 5,
      startDate: daysAgo(3, 9),
      endDate: futureDays(60),
      status: "ACTIVE",
      description: "Fixed discount on large baskets",
    },
  ];

  const customerGroups: CustomerGroup[] = [
    { id: seed.id * 800 + 1, name: "Retail", description: "Walk in customers", discount: 0, credit: false, creditLimit: 0, priceList: "Retail Price" },
    { id: seed.id * 800 + 2, name: "Wholesale", description: "Bulk resellers", discount: 5, credit: true, creditLimit: 25000, priceList: "Wholesale Price" },
    { id: seed.id * 800 + 3, name: "VIP", description: "Loyal high spenders", discount: 3, credit: true, creditLimit: 10000, priceList: "VIP Price" },
    { id: seed.id * 800 + 4, name: "Corporate", description: "Company accounts", discount: 4, credit: true, creditLimit: 50000, priceList: "Wholesale Price" },
  ];

  const customers: Customer[] = Array.from({ length: 14 }).map((_, i) => {
    const name = `${FIRST[(i * 3 + seed.id) % FIRST.length]} ${LAST[(i * 5 + seed.id) % LAST.length]}`;
    const group = pick(["Retail", "Retail", "Wholesale", "VIP", "Corporate"]);
    return {
      id: seed.id * 900 + i + 1,
      code: `CU-${String(i + 1).padStart(4, "0")}`,
      name,
      type: group === "Retail" ? "RETAIL" : group === "Wholesale" ? "WHOLESALE" : group === "VIP" ? "VIP" : "CORPORATE",
      phone: `+974 ${between(3000, 7999)} ${between(1000, 9999)}`,
      email: `${name.split(" ")[0].toLowerCase()}${i}@mail.com`,
      taxNumber: between(0, 3) === 0 ? `TN-${between(100000, 999999)}` : "",
      address: `Zone ${between(10, 90)}, Street ${between(100, 999)}, ${seed.city}`,
      groupId: customerGroups.find((g) => g.name === group)!.id,
      creditLimit: group === "Retail" ? 0 : between(2000, 30000),
      terms: group === "Retail" ? 0 : 30,
      points: between(0, 2500),
      status: "ACTIVE",
    };
  });

  const suppliers: Supplier[] = Array.from({ length: 5 }).map((_, i) => ({
    id: seed.id * 950 + i + 1,
    code: `SU-${String(i + 1).padStart(3, "0")}`,
    name: SUPPLIER_NAMES[(i + seed.id) % SUPPLIER_NAMES.length],
    contact: `${pick(FIRST)} ${pick(LAST)}`,
    phone: `+974 ${between(3000, 7999)} ${between(1000, 9999)}`,
    email: `purchase${i}@supplier${seed.id}.com`,
    taxNumber: `TN-${between(100000, 999999)}`,
    address: `Industrial Area, Street ${between(1, 40)}, Doha`,
    terms: pick([15, 30, 45]),
    creditLimit: between(50000, 200000),
    status: "ACTIVE",
  }));

  const terminals: Terminal[] = branches.map((branch, i) => {
    const warehouse = warehouses.find((w) => w.branchId === branch.id) ?? warehouses[0];
    return {
      id: seed.id * 970 + i + 1,
      branchId: branch.id,
      warehouseId: warehouse.id,
      code: `${seed.prefix}-T${i + 1}`,
      name: `${branch.name} Counter ${i + 1}`,
      deviceId: `dev-${seed.code.toLowerCase()}-${between(1000, 9999)}`,
      status: "ACTIVE",
      lastSyncAt: daysAgo(0, between(1, 22)),
      lastSaleAt: daysAgo(0, between(1, 22)),
    };
  });

  const devices: Device[] = [
    { id: seed.id * 980 + 1, deviceId: `dev-${seed.code.toLowerCase()}-1001`, name: `${branches[0].name} — Counter 1`, platform: "ANDROID", appVersion: `1.${between(2, 6)}.${between(0, 9)}`, hardware: "RECEIPT_PRINTER|SCANNER|DRAWER", branchId: branches[0].id, status: "ONLINE", lastSyncAt: daysAgo(0, between(1, 20)) },
    { id: seed.id * 980 + 2, deviceId: `dev-${seed.code.toLowerCase()}-1002`, name: `${branches[0].name} — Counter 2`, platform: "ANDROID", appVersion: "1.4.2", hardware: "SCANNER|DRAWER", branchId: branches[0].id, status: "ONLINE", lastSyncAt: daysAgo(0, between(1, 20)) },
    { id: seed.id * 980 + 3, deviceId: `dev-${seed.code.toLowerCase()}-1003`, name: `${branches[0].name} — Mobile POS`, platform: "ANDROID", appVersion: "1.3.8", hardware: "SCANNER", branchId: branches[0].id, status: "OFFLINE", lastSyncAt: daysAgo(1, 20) },
    { id: seed.id * 980 + 4, deviceId: `dev-${seed.code.toLowerCase()}-1004`, name: "Backoffice Tablet", platform: "IOS", appVersion: "1.4.2", hardware: "LABEL_PRINTER", branchId: branches[0].id, status: "ONLINE", lastSyncAt: daysAgo(0, between(1, 23)) },
  ];

  const users: User[] = [
    { id: seed.id * 990 + 1, name: seed.owner, username: "owner", email: `owner+${seed.code.toLowerCase()}@${seed.name.split(" ")[0].toLowerCase()}.qa`, phone: company.phone, role: "Company Admin", status: "ACTIVE", branches: branches.map((b) => b.id), lastLoginAt: daysAgo(0, 8) },
    { id: seed.id * 990 + 2, name: "Aisha Rahman", username: "aisha", email: `aisha@${seed.code.toLowerCase()}.qa`, phone: `+974 5511 2233`, role: "Manager", status: "ACTIVE", branches: branches.map((b) => b.id), lastLoginAt: daysAgo(0, 9) },
    { id: seed.id * 990 + 3, name: "Ravi Kumar", username: "ravi", email: `ravi@${seed.code.toLowerCase()}.qa`, phone: `+974 5522 3344`, role: "Cashier", status: "ACTIVE", branches: [branches[0].id], lastLoginAt: daysAgo(0, 8) },
    { id: seed.id * 990 + 4, name: "Noor Saleh", username: "noor", email: `noor@${seed.code.toLowerCase()}.qa`, phone: `+974 5533 4455`, role: "Cashier", status: "ACTIVE", branches: branches.map((b) => b.id), lastLoginAt: daysAgo(1, 18) },
    { id: seed.id * 990 + 5, name: "Bilal Haddad", username: "bilal", email: `bilal@${seed.code.toLowerCase()}.qa`, phone: `+974 5544 5566`, role: "Inventory Manager", status: "ACTIVE", branches: [branches[0].id], lastLoginAt: daysAgo(0, 11) },
  ];

  const roles: Role[] = ROLE_PRESETS.map((preset, i) => ({
    id: seed.id * 995 + i + 1,
    name: preset.name,
    description: preset.description,
    permissions: preset.permissions,
    system: preset.name === "Company Admin",
  }));

  /* sales for the last 45 days */
  const sales: Sale[] = [];
  const ledger: LedgerEntry[] = [];
  let invoice = 1;
  for (let day = 44; day >= 0; day--) {
    const count = day === 0 ? between(2, 5) : between(3, 9);
    for (let s = 0; s < count; s++) {
      const lineCount = between(1, 5);
      const items: SaleLine[] = Array.from({ length: lineCount }).map(() => {
        const product = pick(products);
        const qty = product.weighted ? round2(between(5, 30) / 10) : between(1, 4);
        return {
          productId: product.id,
          name: product.name,
          qty,
          price: product.price,
          cost: product.cost,
          discount: rnd() > 0.85 ? round2(product.price * qty * 0.05) : 0,
          tax: product.tax,
        };
      });
      const subtotal = round2(items.reduce((sum, i) => sum + i.price * i.qty, 0));
      const discount = round2(items.reduce((sum, i) => sum + i.discount, 0));
      const tax = round2(
        items.reduce((sum, i) => sum + ((i.price * i.qty - i.discount) * i.tax) / 100, 0),
      );
      const total = round2(subtotal - discount + tax);
      const cost = round2(items.reduce((sum, i) => sum + i.cost * i.qty, 0));
      const roll = rnd();
      const cancelled = roll > 0.965;
      const customerId = rnd() > 0.55 ? pick(customers).id : null;
      const onCredit = !cancelled && customerId !== null && rnd() > 0.9;
      const branchIndex = between(0, branches.length - 1);
      const terminal = terminals[branchIndex];
      const payments = cancelled
        ? []
        : onCredit
          ? [{ code: "CREDIT", amount: 0 }]
          : rnd() > 0.55
            ? [{ code: "CASH", amount: total }]
            : [
                { code: "CASH", amount: round2(total * 0.4) },
                { code: "CARD", amount: round2(total * 0.6) },
              ];
      const paid = onCredit ? 0 : total;
      const sale: Sale = {
        id: ++saleIdSeq,
        uuid: `${seed.code.toLowerCase()}-${invoice}-sale`,
        invoiceNo: `${seed.prefix}-INV-${String(invoice++).padStart(6, "0")}`,
        date: daysAgo(day, between(9, 22)),
        branchId: terminal.branchId,
        warehouseId: terminal.warehouseId,
        terminalId: terminal.id,
        cashierId: pick(users.slice(2, 4)).id,
        customerId,
        items,
        subtotal,
        discount,
        tax,
        total,
        cost,
        paid,
        balance: round2(total - paid),
        payments,
        status: cancelled ? "CANCELLED" : "COMPLETED",
        paymentStatus: cancelled ? "REFUNDED" : onCredit ? "UNPAID" : "PAID",
        source: rnd() > 0.85 ? "MOBILE" : "POS",
      };
      sales.push(sale);
      if (!cancelled) {
        items.forEach((line, idx) => {
          ledger.push({
            id: ++ledgerIdSeq,
            type: "SALE",
            direction: "OUT",
            productId: line.productId,
            warehouseId: sale.warehouseId,
            qty: line.qty,
            ref: sale.invoiceNo,
            date: sale.date,
          });
          void idx;
        });
      }
    }
  }

  /* purchase orders */
  const purchaseOrders: PurchaseOrder[] = [0, 1].map((p) => {
    const lines = seed.catalog.slice(p * 4, p * 4 + 5).map((spec) => {
      const product = products[seed.catalog.indexOf(spec)];
      const qty = between(20, 60);
      return { productId: product.id, qty, received: p === 0 ? qty : 0, cost: spec.cost };
    });
    const subtotal = round2(lines.reduce((sum, l) => sum + l.qty * l.cost, 0));
    const tax = round2(lines.reduce((sum, l) => sum + l.qty * l.cost * ((seed.catalog.find((c) => c.name === products[0].name)?.tax ?? 0) / 100), 0));
    return {
      id: seed.id * 1100 + p + 1,
      ref: `PO-${seed.prefix}-${String(p + 1).padStart(4, "0")}`,
      supplierId: suppliers[p % suppliers.length].id,
      warehouseId: warehouses[0].id,
      date: daysAgo(between(5, 20), 10),
      expected: futureDays(3),
      status: p === 0 ? "RECEIVED" : "SENT",
      subtotal,
      tax,
      total: round2(subtotal + tax),
      lines,
      notes: "Auto generated purchase order",
    };
  });

  const grns: Grn[] = purchaseOrders
    .filter((po) => po.status === "RECEIVED")
    .map((po, i) => ({
      id: seed.id * 1200 + i + 1,
      no: `GRN-${seed.prefix}-${String(i + 1).padStart(4, "0")}`,
      supplierId: po.supplierId,
      warehouseId: po.warehouseId,
      date: daysAgo(between(2, 6), 11),
      status: "RECEIVED",
      total: po.total,
    }));

  const purchaseInvoices: PurchaseInvoice[] = [
    ...grns.map((grn, i) => ({
      id: seed.id * 1300 + i + 1,
      no: `SUP-${grn.no}`,
      supplierId: grn.supplierId,
      date: daysAgo(between(1, 5), 12),
      dueDate: futureDays(30),
      amount: grn.total,
      paid: grn.total,
      status: "PAID",
    })),
    {
      id: seed.id * 1300 + 9,
      no: `SUP-INV-${seed.prefix}-${between(1000, 9999)}`,
      supplierId: suppliers[2].id,
      date: daysAgo(9, 12),
      dueDate: daysAgo(-21, 12),
      amount: round2(between(4000, 18000)),
      paid: 0,
      status: "OVERDUE",
    },
  ];

  /* adjustments, transfers, ledger extras */
  const adjustments: Adjustment[] = [
    {
      id: seed.id * 1400 + 1,
      ref: `ADJ-${seed.prefix}-0001`,
      warehouseId: warehouses[0].id,
      reason: "Physical count variance",
      date: daysAgo(6, 18),
      status: "APPROVED",
      user: "Bilal Haddad",
      lines: products.slice(0, 3).map((p) => {
        const system = between(60, 200);
        const counted = Math.max(0, system - between(1, 6));
        return { productId: p.id, system, counted, diff: counted - system };
      }),
    },
    {
      id: seed.id * 1400 + 2,
      ref: `ADJ-${seed.prefix}-0002`,
      warehouseId: warehouses[0].id,
      reason: "Damaged in storage",
      date: daysAgo(14, 16),
      status: "APPROVED",
      user: "Aisha Rahman",
      lines: products.slice(3, 5).map((p) => {
        const system = between(30, 90);
        const counted = Math.max(0, system - between(1, 3));
        return { productId: p.id, system, counted, diff: counted - system };
      }),
    },
  ];

  const transfers: Transfer[] = branches.length > 1
    ? [
        {
          id: seed.id * 1500 + 1,
          ref: `TRF-${seed.prefix}-0001`,
          from: warehouses[0].id,
          to: warehouses[warehouses.length - 1].id,
          date: daysAgo(4, 13),
          status: "RECEIVED",
          note: "Weekly replenishment",
          lines: products.slice(0, 4).map((p) => ({ productId: p.id, qty: between(5, 20) })),
        },
        {
          id: seed.id * 1500 + 2,
          ref: `TRF-${seed.prefix}-0002`,
          from: warehouses[0].id,
          to: warehouses[warehouses.length - 1].id,
          date: daysAgo(11, 15),
          status: "RECEIVED",
          note: "Promo stock movement",
          lines: products.slice(4, 7).map((p) => ({ productId: p.id, qty: between(3, 12) })),
        },
      ]
    : [];

  adjustments.forEach((adj) =>
    adj.lines.forEach((line) =>
      ledger.push({
        id: ++ledgerIdSeq,
        type: "ADJUSTMENT",
        direction: line.diff >= 0 ? "IN" : "OUT",
        productId: line.productId,
        warehouseId: adj.warehouseId,
        qty: Math.abs(line.diff),
        ref: adj.ref,
        date: adj.date,
      }),
    ),
  );
  purchaseOrders
    .filter((po) => po.status === "RECEIVED")
    .forEach((po) =>
      po.lines.forEach((line) =>
        ledger.push({
          id: ++ledgerIdSeq,
          type: "PURCHASE",
          direction: "IN",
          productId: line.productId,
          warehouseId: po.warehouseId,
          qty: line.received,
          ref: po.ref,
          date: po.date,
        }),
      ),
    );
  products.forEach((product, i) =>
    ledger.push({
      id: ++ledgerIdSeq,
      type: "OPENING",
      direction: "IN",
      productId: product.id,
      warehouseId: warehouses[0].id,
      qty: between(80, 420),
      ref: `${seed.prefix}-OPEN-${i + 1}`,
      date: daysAgo(60, 8),
    }),
  );

  const shifts: Shift[] = [];
  const openShift: Shift = {
    id: seed.id * 1600,
    no: `${seed.prefix}-SHIFT-TODAY`,
    terminalId: terminals[0].id,
    cashierId: users[2].id,
    openedAt: daysAgo(0, 8),
    closedAt: null,
    openingCash: 500,
    expectedCash: 0,
    countedCash: 0,
    cashSales: round2(sales.filter((s) => s.date.toDateString() === new Date().toDateString() && s.payments.some((p) => p.code === "CASH")).reduce((sum, s) => sum + s.total, 0)),
    cardSales: round2(sales.filter((s) => s.date.toDateString() === new Date().toDateString() && s.payments.some((p) => p.code === "CARD")).reduce((sum, s) => sum + s.total, 0)),
    totalSales: round2(sales.filter((s) => s.date.toDateString() === new Date().toDateString() && s.status === "COMPLETED").reduce((sum, s) => sum + s.total, 0)),
    transactions: sales.filter((s) => s.date.toDateString() === new Date().toDateString()).length,
    status: "OPEN",
  };
  shifts.push(openShift);
  for (let d = 6; d >= 1; d--) {
    const totalSales = between(1400, 6400);
    shifts.push({
      id: seed.id * 1600 + (7 - d),
      no: `${seed.prefix}-SHIFT-${String(d).padStart(2, "0")}`,
      terminalId: terminals[0].id,
      cashierId: pick(users.slice(2, 4)).id,
      openedAt: daysAgo(d, 8),
      closedAt: daysAgo(d, 22),
      openingCash: 500,
      expectedCash: totalSales,
      countedCash: totalSales + between(-5, 5),
      cashSales: Math.round(totalSales * 0.62),
      cardSales: Math.round(totalSales * 0.38),
      totalSales,
      transactions: between(20, 70),
      status: "CLOSED",
    });
  }

  const completedSales = sales.filter((s) => s.status === "COMPLETED");
  const returns: SalesReturn[] = Array.from({ length: 4 }).map((_, r) => {
    const sale = completedSales[between(0, Math.min(30, completedSales.length - 1))];
    const line = sale.items[0];
    const isWeighted = products.find((p) => p.id === line.productId)?.weighted ?? false;
    const qty = isWeighted ? round2(line.qty / 2) : Math.max(1, Math.floor(line.qty / 2));
    const total = round2(qty * line.price);
    return {
      id: seed.id * 1700 + r + 1,
      no: `RET-${seed.prefix}-${String(r + 1).padStart(4, "0")}`,
      saleId: sale.id,
      invoice: sale.invoiceNo,
      date: daysAgo(between(1, 15), 15),
      reason: pick(["Damaged item", "Wrong size", "Customer changed mind", "Expired product"]),
      total,
      refunded: total,
      status: "REFUNDED",
    };
  });

  const heldSales: HeldSale[] = [
    { id: seed.id * 1800 + 1, ref: `HOLD-${seed.prefix}-01`, createdAt: daysAgo(0, 14), items: between(2, 4), total: round2(between(40, 260)) },
    { id: seed.id * 1800 + 2, ref: `HOLD-${seed.prefix}-02`, createdAt: daysAgo(1, 17), items: between(1, 3), total: round2(between(20, 180)) },
  ];

  const notifications: Notification[] = [
    { id: seed.id * 1900 + 1, type: "LOW_STOCK", title: "Low stock alert", message: `${products[0].name} dropped below the reorder level at ${branches[0].name}.`, date: daysAgo(0, 10), read: false },
    { id: seed.id * 1900 + 2, type: "SHIFT", title: "Shift closed", message: `Shift ${seed.prefix}-SHIFT-02 was closed with a cash variance of ${money(between(0, 20))}.`, date: daysAgo(1, 22), read: true },
    { id: seed.id * 1900 + 3, type: "SUBSCRIPTION", title: "Subscription", message: `Your ${plan.name} plan renews in ${between(3, 20)} days.`, date: daysAgo(2, 9), read: true },
    { id: seed.id * 1900 + 4, type: "SYNC", title: "Offline device synced", message: `${devices[2].name} pushed 4 offline sales to the server.`, date: daysAgo(1, 20), read: false },
  ];

  return {
    company,
    settings: {
      invoice_prefix: seed.prefix,
      receipt_header: `${seed.name}\n${seed.address}`,
      receipt_footer: "Thank you for shopping with us!\nReturns accepted within 7 days with receipt.",
      decimal_places: "2",
      allow_negative_stock: "false",
      allow_credit_sales: "true",
      default_tax: "0",
      loyalty_points_per_currency: "1",
    },
    subscription: {
      planId: seed.planId,
      status: trial ? "TRIAL" : "ACTIVE",
      cycle: "YEARLY",
      amount: trial ? plan.monthlyPrice : plan.yearlyPrice,
      startDate: daysAgo(trial ? 12 : seed.joinedDays, 9),
      endDate: trial ? futureDays(2) : futureDays(155),
      autoRenew: true,
    },
    branches,
    warehouses,
    terminals,
    devices,
    users,
    roles,
    categories,
    brands,
    uoms,
    products,
    barcodes,
    priceLists,
    promotions,
    customers,
    customerGroups,
    suppliers,
    sales: sales.reverse(),
    purchaseOrders,
    grns,
    purchaseInvoices,
    adjustments,
    transfers,
    ledger: ledger.sort((a, b) => b.date.getTime() - a.date.getTime()),
    shifts,
    heldSales,
    returns,
    notifications,
  };
}

export const tenants: Tenant[] = TENANT_SEEDS.map(buildTenant);

export const companies: Company[] = tenants.map((t) => t.company);

export const platformPayments: PlatformPayment[] = tenants.flatMap((tenant, index) => {
  const plan = plans.find((p) => p.id === tenant.subscription.planId)!;
  const count = tenant.subscription.status === "TRIAL" ? 0 : index === 0 ? 6 : index === 1 ? 3 : 5;
  const rows: PlatformPayment[] = Array.from({ length: count }).map((_, i) => ({
    id: tenant.company.id * 10 + i + 1,
    companyId: tenant.company.id,
    invoiceNo: `PLT-INV-${1000 + tenant.company.id * 10 + i}`,
    ref: `ch_${tenant.company.code.toLowerCase()}${i}x9f2`,
    amount: plan.yearlyPrice,
    currency: plan.currency,
    method: i % 2 === 0 ? "CARD" : "BANK_TRANSFER",
    date: daysAgo(between2(tenant.company.id * 37 + i * 23), 11),
    status: "PAID",
  }));
  if (tenant.subscription.status === "TRIAL") {
    rows.push({
      id: tenant.company.id * 10 + 99,
      companyId: tenant.company.id,
      invoiceNo: `PLT-INV-${1900 + tenant.company.id}`,
      ref: `ch_trial${tenant.company.id}a1`,
      amount: plan.monthlyPrice,
      currency: plan.currency,
      method: "CARD",
      date: futureDays(2),
      status: "PENDING",
      notes: undefined as never,
    } as PlatformPayment);
  }
  return rows;
});

function between2(seed: number) {
  const rnd = mulberry32(seed * 13);
  return Math.floor(rnd() * 260) + 5;
}

export const tickets: Ticket[] = [
  {
    id: 1,
    no: "TKT-0001",
    companyId: 1,
    subject: "Receipt printer not printing after update",
    category: "HARDWARE",
    priority: "HIGH",
    status: "IN_PROGRESS",
    requester: "Khalid Al-Mannai",
    email: "owner+cmp-001@abcsupermarket.qa",
    assignee: "Sara Nolan",
    createdAt: daysAgo(3, 10),
    messages: [
      { author: "Khalid Al-Mannai", from: "VENDOR", body: "Since updating to 1.4.2 the thermal printer prints a blank slip on Counter 1. Cash drawer still opens.", date: daysAgo(3, 10) },
      { author: "Sara Nolan", from: "PLATFORM", body: "Thanks for the details, our hardware team is reproducing this on the same printer model. Can you share the exact model?", date: daysAgo(2, 15) },
    ],
  },
  {
    id: 2,
    no: "TKT-0002",
    companyId: 2,
    subject: "Trial expiring — need card update",
    category: "BILLING",
    priority: "MEDIUM",
    status: "OPEN",
    requester: "Nasser Al-Kuwari",
    email: "owner+cmp-002@xyzgrocery.qa",
    assignee: "Mark Ruiz",
    createdAt: daysAgo(2, 12),
    messages: [
      { author: "Nasser Al-Kuwari", from: "VENDOR", body: "Our trial ends this week, please upgrade us to Professional and send the invoice.", date: daysAgo(2, 12) },
    ],
  },
  {
    id: 3,
    no: "TKT-0003",
    companyId: 3,
    subject: "Offline sales not syncing on weak network",
    category: "SYNC",
    priority: "URGENT",
    status: "OPEN",
    requester: "Dana Farouk",
    email: "owner+cmp-003@freshmart.qa",
    assignee: "Sara Nolan",
    createdAt: daysAgo(1, 9),
    messages: [
      { author: "Dana Farouk", from: "VENDOR", body: "Two devices show pending sync items for more than a day at the Al Sadd store.", date: daysAgo(1, 9) },
    ],
  },
  {
    id: 4,
    no: "TKT-0004",
    companyId: 1,
    subject: "Add Arabic to receipt header",
    category: "FEATURE",
    priority: "LOW",
    status: "RESOLVED",
    requester: "Aisha Rahman",
    email: "aisha@cmp-001.qa",
    assignee: "Adrian Herman",
    createdAt: daysAgo(9, 11),
    messages: [
      { author: "Aisha Rahman", from: "VENDOR", body: "Can the receipt header support Arabic text? Our customers ask for bilingual receipts.", date: daysAgo(9, 11) },
      { author: "Adrian Herman", from: "PLATFORM", body: "Shipped in release 1.4.3 — bilingual receipt headers are now supported.", date: daysAgo(7, 16) },
    ],
  },
  {
    id: 5,
    no: "TKT-0005",
    companyId: null,
    subject: "New vendor onboarding request",
    category: "GENERAL",
    priority: "MEDIUM",
    status: "OPEN",
    requester: "Omar Shaikh",
    email: "omar@prospect.qa",
    assignee: null,
    createdAt: daysAgo(1, 14),
    messages: [
      { author: "Omar Shaikh", from: "VENDOR", body: "I run three minimarts in Doha and would like to try the platform for 30 days.", date: daysAgo(1, 14) },
    ],
  },
];

export const auditLogs: AuditEntry[] = [
  { id: 1, companyId: null, actor: "Adrian Herman", actorType: "PLATFORM", module: "Vendors", action: "SUSPEND", description: "Vendor suspended after payment failure", date: daysAgo(1, 11) },
  { id: 2, companyId: null, actor: "Mark Ruiz", actorType: "PLATFORM", module: "Subscriptions", action: "UPGRADE", description: "XYZ Grocery upgraded to Professional", date: daysAgo(2, 10) },
  { id: 3, companyId: null, actor: "Sara Nolan", actorType: "PLATFORM", module: "Support", action: "REPLY", description: "Replied to hardware ticket TKT-0001", date: daysAgo(2, 15) },
  { id: 4, companyId: 1, actor: "Khalid Al-Mannai", actorType: "COMPANY", module: "Products", action: "UPDATE", description: "Selling price updated for Fresh Full Cream Milk 1L", date: daysAgo(1, 12) },
  { id: 5, companyId: 1, actor: "Aisha Rahman", actorType: "COMPANY", module: "Sales", action: "CANCEL", description: "Sale ABC-INV-000231 cancelled at Doha Counter 1", date: daysAgo(1, 20) },
  { id: 6, companyId: 1, actor: "Bilal Haddad", actorType: "COMPANY", module: "Inventory", action: "ADJUST", description: "Stock adjustment ADJ-ABC-0001 approved", date: daysAgo(6, 18) },
  { id: 7, companyId: 3, actor: "Dana Farouk", actorType: "COMPANY", module: "Users", action: "PERMISSION_CHANGE", description: "Permissions updated for role Cashier", date: daysAgo(3, 9) },
  { id: 8, companyId: 2, actor: "Nasser Al-Kuwari", actorType: "COMPANY", module: "Purchasing", action: "RECEIVE", description: "GRN-XYZ-0001 received against PO-XYZ-0001", date: daysAgo(4, 13) },
  { id: 9, companyId: null, actor: "Adrian Herman", actorType: "PLATFORM", module: "Settings", action: "UPDATE", description: "Maintenance mode toggled off", date: daysAgo(5, 8) },
  { id: 10, companyId: 3, actor: "Ravi Kumar", actorType: "COMPANY", module: "Sales", action: "CREATE", description: "Sale FM-INV-000412 completed from mobile POS", date: daysAgo(0, 21) },
];

export const apiTokens: ApiToken[] = [
  { id: 1, companyId: 1, name: "Flutter POS — Doha Counter 1", token: "dpos_live_7f3a9c2b41e64d0f", abilities: ["products:read", "inventory:read", "sales:write", "customers:read"], lastUsedAt: daysAgo(0, 21) },
  { id: 2, companyId: 1, name: "Flutter POS — Al Rayyan Counter", token: "dpos_live_1b8e44c09ad73e25", abilities: ["products:read", "sales:write"], lastUsedAt: daysAgo(0, 18) },
  { id: 3, companyId: 3, name: "Flutter POS — Villaggio Store", token: "dpos_live_9c41f7ae2208bb63", abilities: ["products:read", "inventory:read", "sales:write"], lastUsedAt: daysAgo(1, 12) },
  { id: 4, companyId: 2, name: "Flutter POS — Al Wakrah Mobile", token: "dpos_live_55de3a1c7f9048be", abilities: ["products:read", "sales:write"], lastUsedAt: daysAgo(1, 20) },
];

export const syncQueue = [
  { id: 1, companyId: 1, device: `dev-cmp-001-1003`, entity: "SALE", uuid: "offline-sale-0001", status: "PENDING", attempts: 0, createdAt: daysAgo(0, 21) },
  { id: 2, companyId: 1, device: `dev-cmp-001-1002`, entity: "CUSTOMER", uuid: "offline-cust-0009", status: "FAILED", attempts: 2, createdAt: daysAgo(1, 19), error: "Duplicate customer code" },
  { id: 3, companyId: 3, device: `dev-cmp-003-1003`, entity: "SALE", uuid: "offline-sale-0044", status: "PENDING", attempts: 1, createdAt: daysAgo(1, 22) },
  { id: 4, companyId: 2, device: `dev-cmp-002-1002`, entity: "PRODUCT", uuid: "offline-prod-0012", status: "SYNCED", attempts: 0, createdAt: daysAgo(2, 10) },
];

/* ----------------------------- selectors -------------------------- */

export function getTenant(companyId: number): Tenant {
  return tenants.find((t) => t.company.id === companyId) ?? tenants[0];
}

export function getPlan(planId: number): Plan {
  return plans.find((p) => p.id === planId) ?? plans[0];
}

export function featuresForPlan(planId: number) {
  return features.map((feature) => ({
    ...feature,
    enabled: planFeatures.some((pf) => pf.planId === planId && pf.featureKey === feature.key && pf.enabled),
  }));
}

export function subscriptionForCompany(companyId: number) {
  return getTenant(companyId).subscription;
}

export function paymentMethodsFor(companyId: number) {
  return [
    { code: "CASH", name: "Cash", type: "CASH" },
    { code: "CARD", name: "Card", type: "CARD" },
    { code: "BANK", name: "Bank Transfer", type: "BANK" },
    { code: "CREDIT", name: "Customer Credit", type: "CREDIT" },
  ];
}

/* --------------------------- analytics ---------------------------- */

export function salesInRange(tenant: Tenant, days: number) {
  const since = Date.now() - days * 86400000;
  return tenant.sales.filter((s) => s.date.getTime() >= since && s.status === "COMPLETED");
}

export function dailySalesSeries(tenant: Tenant, days = 14) {
  const out: { label: string; value: number; count: number; profit: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const daySales = tenant.sales.filter(
      (s) => s.status === "COMPLETED" && s.date.toDateString() === d.toDateString(),
    );
    out.push({
      label: new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(d),
      value: round2(daySales.reduce((sum, s) => sum + s.total, 0)),
      count: daySales.length,
      profit: round2(daySales.reduce((sum, s) => sum + (s.total - s.cost), 0)),
    });
  }
  return out;
}

export function totalsFor(tenant: Tenant, days: number) {
  const rows = salesInRange(tenant, days);
  const revenue = round2(rows.reduce((sum, s) => sum + s.total, 0));
  const cost = round2(rows.reduce((sum, s) => sum + s.cost, 0));
  return {
    revenue,
    cost,
    profit: round2(revenue - cost),
    tax: round2(rows.reduce((sum, s) => sum + s.tax, 0)),
    discount: round2(rows.reduce((sum, s) => sum + s.discount, 0)),
    count: rows.length,
    margin: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0,
  };
}

export function topProducts(tenant: Tenant, limit = 6, days = 30) {
  const rows = salesInRange(tenant, days);
  const map = new Map<number, { name: string; qty: number; revenue: number; profit: number }>();
  rows.forEach((sale) =>
    sale.items.forEach((line) => {
      const entry = map.get(line.productId) ?? { name: line.name, qty: 0, revenue: 0, profit: 0 };
      entry.qty += line.qty;
      const lineTotal = line.price * line.qty - line.discount;
      entry.revenue += lineTotal;
      entry.profit += lineTotal - line.cost * line.qty;
      map.set(line.productId, entry);
    }),
  );
  return [...map.entries()]
    .map(([productId, entry]) => ({ productId, ...entry, revenue: round2(entry.revenue), profit: round2(entry.profit) }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function paymentMix(tenant: Tenant, days = 30) {
  const since = Date.now() - days * 86400000;
  const map = new Map<string, number>();
  tenant.sales
    .filter((s) => s.status === "COMPLETED" && s.date.getTime() >= since)
    .forEach((sale) =>
      sale.payments.forEach((payment) =>
        map.set(payment.code, round2((map.get(payment.code) ?? 0) + payment.amount)),
      ),
    );
  return [...map.entries()].map(([method, total]) => ({ method, total }));
}

export function categorySales(tenant: Tenant, days = 30) {
  const rows = salesInRange(tenant, days);
  const map = new Map<string, number>();
  rows.forEach((sale) =>
    sale.items.forEach((line) => {
      const product = tenant.products.find((p) => p.id === line.productId);
      const category = tenant.categories.find((c) => c.id === product?.categoryId)?.name ?? "Uncategorised";
      map.set(category, round2((map.get(category) ?? 0) + line.price * line.qty - line.discount));
    }),
  );
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

export function cashierPerformance(tenant: Tenant, days = 30) {
  const rows = salesInRange(tenant, days);
  const map = new Map<string, { value: number; count: number }>();
  rows.forEach((sale) => {
    const cashier = tenant.users.find((u) => u.id === sale.cashierId)?.name ?? "Unknown";
    const entry = map.get(cashier) ?? { value: 0, count: 0 };
    entry.value += sale.total;
    entry.count += 1;
    map.set(cashier, entry);
  });
  return [...map.entries()]
    .map(([label, entry]) => ({ label, value: round2(entry.value), count: entry.count }))
    .sort((a, b) => b.value - a.value);
}

export function stockValue(tenant: Tenant) {
  return round2(tenant.products.reduce((sum, p) => sum + p.stock * p.cost, 0));
}

export function lowStock(tenant: Tenant) {
  return tenant.products.filter((p) => p.stock <= p.reorderLevel);
}

export function platformMonthlyRevenue() {
  const buckets = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    buckets.set(new Intl.DateTimeFormat("en-GB", { month: "short" }).format(d), 0);
  }
  platformPayments
    .filter((p) => p.status === "PAID")
    .forEach((payment) => {
      const key = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(payment.date);
      if (buckets.has(key)) buckets.set(key, round2((buckets.get(key) ?? 0) + payment.amount));
    });
  return [...buckets.entries()].map(([label, value]) => ({ label, value }));
}

export function platformMrr() {
  return round2(
    companies
      .filter((c) => c.status === "ACTIVE")
      .reduce((sum, c) => sum + subscriptionForCompany(c.id).amount, 0),
  );
}

export function platformGmv() {
  return round2(tenants.reduce((sum, t) => sum + totalsFor(t, 3650).revenue, 0));
}

export function platformInvoiceCount() {
  return tenants.reduce((sum, t) => sum + t.sales.length, 0);
}

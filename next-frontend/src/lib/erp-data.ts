/* ------------------------------------------------------------------ *
 * ERP Core + Modular ERP reference data (UI only).
 * Models the target architecture: SaaS platform → ERP core → modules.
 * ------------------------------------------------------------------ */

export type ErpModule = {
  key: string;
  name: string;
  category: "CORE" | "RETAIL" | "RESTAURANT" | "FINANCE" | "HR" | "CRM" | "COMMERCE" | "OPS" | "PLATFORM";
  phase: 1 | 2 | 3 | 4 | 5;
  status: "LIVE" | "BETA" | "ROADMAP";
  description: string;
  dependencies: string[];
  tables: number;
  screens: string[];
};

export const ERP_MODULES: ErpModule[] = [
  /* ---------------- CORE ---------------- */
  {
    key: "core_tenant",
    name: "Tenant & Organisation",
    category: "CORE",
    phase: 1,
    status: "LIVE",
    description: "Company, divisions, branches, departments, cost centres",
    dependencies: [],
    tables: 14,
    screens: ["Companies", "Branches", "Divisions", "Departments", "Cost centres"],
  },
  {
    key: "core_warehouse",
    name: "Warehouse & Locations",
    category: "CORE",
    phase: 1,
    status: "LIVE",
    description: "Warehouses, zones, racks, shelves, bins, virtual/transit stores",
    dependencies: ["core_tenant"],
    tables: 9,
    screens: ["Warehouses", "Zones & racks", "Bins", "Transfers"],
  },
  {
    key: "core_security",
    name: "Users, Roles & RBAC",
    category: "CORE",
    phase: 1,
    status: "LIVE",
    description: "Users, employees, roles, permissions, company/branch/warehouse access",
    dependencies: ["core_tenant"],
    tables: 12,
    screens: ["Users", "Roles", "Permissions", "Access matrix"],
  },
  {
    key: "core_master",
    name: "Master Data",
    category: "CORE",
    phase: 1,
    status: "LIVE",
    description: "Countries, currencies, exchange rates, tax codes, UOM, documents",
    dependencies: ["core_tenant"],
    tables: 18,
    screens: ["Currencies", "Tax codes", "UOM & conversions", "Document types"],
  },
  {
    key: "core_product",
    name: "Product Master",
    category: "CORE",
    phase: 1,
    status: "LIVE",
    description: "Products, variants, attributes, images, barcodes, product UOM",
    dependencies: ["core_master"],
    tables: 16,
    screens: ["Products", "Variants", "Barcodes", "Product UOM"],
  },
  {
    key: "core_pricing",
    name: "Pricing & Costing Engine",
    category: "CORE",
    phase: 2,
    status: "LIVE",
    description: "Price lists, warehouse/branch prices, customer prices, AVG/FIFO/standard cost",
    dependencies: ["core_product", "core_warehouse"],
    tables: 15,
    screens: ["Price lists", "Warehouse prices", "Costing method", "Promotions"],
  },
  {
    key: "core_inventory",
    name: "Inventory Engine",
    category: "CORE",
    phase: 2,
    status: "LIVE",
    description: "Balances, ledger, cost layers, reservations, adjustments, counts",
    dependencies: ["core_product", "core_warehouse"],
    tables: 17,
    screens: ["Stock", "Ledger", "Adjustments", "Counts", "Valuation"],
  },
  {
    key: "core_partner",
    name: "Customers & Suppliers",
    category: "CORE",
    phase: 2,
    status: "LIVE",
    description: "Customer/supplier master, groups, addresses, contacts, credit",
    dependencies: ["core_tenant"],
    tables: 16,
    screens: ["Customers", "Suppliers", "Groups", "Statements"],
  },
  {
    key: "core_documents",
    name: "Document & Number Series",
    category: "CORE",
    phase: 1,
    status: "LIVE",
    description: "Document types, series, sequences, per branch numbering",
    dependencies: ["core_tenant"],
    tables: 7,
    screens: ["Number series", "Document types"],
  },
  {
    key: "core_workflow",
    name: "Workflow & Approvals",
    category: "CORE",
    phase: 1,
    status: "LIVE",
    description: "Generic approval engine reused by purchase, refund, adjustment, expense",
    dependencies: ["core_security"],
    tables: 8,
    screens: ["Workflows", "Approval queue"],
  },
  {
    key: "core_audit",
    name: "Audit & Security",
    category: "CORE",
    phase: 1,
    status: "LIVE",
    description: "Audit log, security events, login logs, data change history",
    dependencies: ["core_security"],
    tables: 9,
    screens: ["Audit log", "Login history"],
  },

  /* ---------------- RETAIL ---------------- */
  {
    key: "retail_pos",
    name: "Retail POS",
    category: "RETAIL",
    phase: 2,
    status: "LIVE",
    description: "Terminals, shifts, sales, mixed payments, holds, returns, refunds",
    dependencies: ["core_inventory", "core_pricing", "core_documents"],
    tables: 22,
    screens: ["POS", "Sales", "Shifts", "Returns"],
  },
  {
    key: "retail_purchasing",
    name: "Purchasing",
    category: "RETAIL",
    phase: 2,
    status: "LIVE",
    description: "Requisition → quotation → PO → GRN → invoice → return",
    dependencies: ["core_inventory", "core_partner", "core_workflow"],
    tables: 19,
    screens: ["Purchase orders", "GRN", "Supplier bills"],
  },
  {
    key: "retail_promotions",
    name: "Promotions & Loyalty",
    category: "RETAIL",
    phase: 2,
    status: "LIVE",
    description: "Percent, fixed, bundle, buy-X-get-Y, loyalty points and rewards",
    dependencies: ["core_pricing"],
    tables: 14,
    screens: ["Promotions", "Loyalty", "Rewards"],
  },

  /* ---------------- RESTAURANT ---------------- */
  {
    key: "restaurant_core",
    name: "Restaurant Operations",
    category: "RESTAURANT",
    phase: 4,
    status: "BETA",
    description: "Menus, modifiers, combos, sections, tables, orders, KOT, kitchen stations",
    dependencies: ["core_product", "core_inventory", "core_pricing"],
    tables: 24,
    screens: ["Menu", "Tables", "Orders", "KOT", "Kitchen display"],
  },
  {
    key: "restaurant_recipes",
    name: "Recipes & Production",
    category: "RESTAURANT",
    phase: 4,
    status: "BETA",
    description: "Recipe per menu item, ingredient deduction, yield and waste",
    dependencies: ["restaurant_core", "core_inventory"],
    tables: 11,
    screens: ["Recipes", "Ingredient cost", "Waste log"],
  },

  /* ---------------- FINANCE ---------------- */
  {
    key: "fin_chart",
    name: "Chart of Accounts & GL",
    category: "FINANCE",
    phase: 3,
    status: "LIVE",
    description: "Account types, COA, fiscal years, periods, journal entries",
    dependencies: ["core_documents"],
    tables: 14,
    screens: ["Chart of accounts", "Journal", "Trial balance"],
  },
  {
    key: "fin_ar",
    name: "Accounts Receivable",
    category: "FINANCE",
    phase: 3,
    status: "LIVE",
    description: "Customer invoices, receipts, allocations, credit notes, statements",
    dependencies: ["fin_chart", "core_partner"],
    tables: 13,
    screens: ["AR ageing", "Receipts", "Statements"],
  },
  {
    key: "fin_ap",
    name: "Accounts Payable",
    category: "FINANCE",
    phase: 3,
    status: "LIVE",
    description: "Supplier bills, payments, allocations, debit notes",
    dependencies: ["fin_chart", "core_partner"],
    tables: 12,
    screens: ["AP ageing", "Payments", "Bills"],
  },
  {
    key: "fin_banking",
    name: "Banking & Reconciliation",
    category: "FINANCE",
    phase: 3,
    status: "BETA",
    description: "Bank accounts, transactions, statement import, reconciliation",
    dependencies: ["fin_chart"],
    tables: 10,
    screens: ["Bank accounts", "Reconciliation"],
  },
  {
    key: "fin_tax",
    name: "Tax Engine",
    category: "FINANCE",
    phase: 3,
    status: "LIVE",
    description: "Tax codes, rates, groups, rules, exemptions per country",
    dependencies: ["core_master"],
    tables: 11,
    screens: ["Tax codes", "Tax reports"],
  },
  {
    key: "fin_assets",
    name: "Fixed Assets",
    category: "FINANCE",
    phase: 5,
    status: "ROADMAP",
    description: "Asset register, depreciation, disposal, transfers",
    dependencies: ["fin_chart"],
    tables: 12,
    screens: ["Assets", "Depreciation"],
  },

  /* ---------------- HR ---------------- */
  {
    key: "hrm_core",
    name: "HRM",
    category: "HR",
    phase: 5,
    status: "ROADMAP",
    description: "Employees, contracts, attendance, leaves, designations",
    dependencies: ["core_security"],
    tables: 18,
    screens: ["Employees", "Attendance", "Leaves"],
  },
  {
    key: "hrm_payroll",
    name: "Payroll",
    category: "HR",
    phase: 5,
    status: "ROADMAP",
    description: "Salary structures, components, payroll runs, payslips",
    dependencies: ["hrm_core", "fin_chart"],
    tables: 14,
    screens: ["Payroll", "Payslips"],
  },

  /* ---------------- CRM / COMMERCE ---------------- */
  {
    key: "crm_core",
    name: "CRM",
    category: "CRM",
    phase: 5,
    status: "ROADMAP",
    description: "Leads, opportunities, activities, campaigns, tasks",
    dependencies: ["core_partner"],
    tables: 15,
    screens: ["Leads", "Pipeline", "Campaigns"],
  },
  {
    key: "commerce_ecom",
    name: "E-commerce",
    category: "COMMERCE",
    phase: 5,
    status: "ROADMAP",
    description: "Online stores, catalogue sync, carts, orders, shipping",
    dependencies: ["core_product", "core_inventory", "core_pricing"],
    tables: 17,
    screens: ["Stores", "Orders", "Shipping"],
  },
  {
    key: "events_core",
    name: "Event Management",
    category: "COMMERCE",
    phase: 5,
    status: "BETA",
    description: "Events, zones, tickets, RFID/QR wristbands, wallets, entries",
    dependencies: ["core_partner", "core_inventory", "core_pricing"],
    tables: 20,
    screens: ["Events", "Tickets", "Wallets", "Entries"],
  },

  /* ---------------- OPS ---------------- */
  {
    key: "ops_manufacturing",
    name: "Manufacturing",
    category: "OPS",
    phase: 5,
    status: "ROADMAP",
    description: "BOM, work centres, production orders, material issues",
    dependencies: ["core_inventory", "core_product"],
    tables: 19,
    screens: ["BOM", "Production", "Work centres"],
  },
  {
    key: "ops_service",
    name: "Service Management",
    category: "OPS",
    phase: 5,
    status: "ROADMAP",
    description: "Service requests, tickets, assignments, visits, contracts",
    dependencies: ["core_partner"],
    tables: 13,
    screens: ["Tickets", "Visits"],
  },
  {
    key: "ops_fleet",
    name: "Fleet Management",
    category: "OPS",
    phase: 5,
    status: "ROADMAP",
    description: "Vehicles, assignments, fuel, maintenance, documents",
    dependencies: ["core_tenant"],
    tables: 12,
    screens: ["Vehicles", "Fuel", "Maintenance"],
  },
  {
    key: "ops_projects",
    name: "Projects",
    category: "OPS",
    phase: 5,
    status: "ROADMAP",
    description: "Projects, tasks, timesheets, expenses",
    dependencies: ["core_security"],
    tables: 11,
    screens: ["Projects", "Tasks"],
  },

  /* ---------------- PLATFORM ---------------- */
  {
    key: "platform_saas",
    name: "SaaS Platform",
    category: "PLATFORM",
    phase: 1,
    status: "LIVE",
    description: "Vendors, plans, features, billing, platform settings",
    dependencies: [],
    tables: 21,
    screens: ["Vendors", "Plans", "Payments"],
  },
  {
    key: "platform_sync",
    name: "Offline Sync",
    category: "PLATFORM",
    phase: 2,
    status: "LIVE",
    description: "Devices, sync queue, conflicts, batches, idempotency by uuid",
    dependencies: ["retail_pos"],
    tables: 8,
    screens: ["Devices", "Sync queue"],
  },
  {
    key: "platform_api",
    name: "API & Integrations",
    category: "PLATFORM",
    phase: 2,
    status: "LIVE",
    description: "API clients, scopes, keys, webhooks, delivery logs",
    dependencies: ["core_security"],
    tables: 11,
    screens: ["API clients", "Webhooks", "Integrations"],
  },
  {
    key: "platform_reporting",
    name: "Reporting & BI",
    category: "PLATFORM",
    phase: 3,
    status: "BETA",
    description: "Operational reports, materialised daily aggregates, exports",
    dependencies: ["core_inventory", "fin_chart"],
    tables: 9,
    screens: ["Sales", "Profit", "Inventory", "GL"],
  },
];

export const MODULE_STATUS_TONE: Record<string, string> = {
  LIVE: "green",
  BETA: "orange",
  ROADMAP: "gray",
};

/** Modules each demo company has switched on (plan gating simulated). */
export const COMPANY_MODULE_KEYS: Record<number, string[]> = {
  1: [
    "core_tenant", "core_warehouse", "core_security", "core_master", "core_product",
    "core_pricing", "core_inventory", "core_partner", "core_documents", "core_workflow",
    "core_audit", "retail_pos", "retail_purchasing", "retail_promotions",
    "fin_chart", "fin_ar", "fin_ap", "fin_tax", "fin_banking",
    "platform_saas", "platform_sync", "platform_api", "platform_reporting",
  ],
  2: [
    "core_tenant", "core_warehouse", "core_security", "core_master", "core_product",
    "core_pricing", "core_inventory", "core_partner", "core_documents", "core_workflow",
    "core_audit", "retail_pos", "retail_promotions", "fin_chart", "fin_ar", "fin_ap",
    "platform_saas", "platform_sync",
  ],
  3: [
    "core_tenant", "core_warehouse", "core_security", "core_master", "core_product",
    "core_pricing", "core_inventory", "core_partner", "core_documents", "core_workflow",
    "core_audit", "retail_pos", "retail_purchasing", "retail_promotions",
    "fin_chart", "fin_ar", "fin_ap", "fin_tax", "fin_banking",
    "events_core", "platform_saas", "platform_sync", "platform_api", "platform_reporting",
  ],
};

export function modulesForCompany(companyId: number) {
  const enabled = COMPANY_MODULE_KEYS[companyId] ?? COMPANY_MODULE_KEYS[1];
  return ERP_MODULES.map((module) => ({
    ...module,
    enabled: enabled.includes(module.key),
    blocked: !enabled.includes(module.key) && module.dependencies.some((dep) => !enabled.includes(dep)),
  }));
}

/* --------------------------- product types --------------------------- */

export const PRODUCT_TYPES = [
  { key: "STOCK_ITEM", name: "Stock item", used: "Retail, inventory, purchasing" },
  { key: "NON_STOCK", name: "Non stock item", used: "Services billed without stock" },
  { key: "SERVICE", name: "Service", used: "Service module, repairs, fees" },
  { key: "RAW_MATERIAL", name: "Raw material", used: "Manufacturing, restaurant recipes" },
  { key: "FINISHED_GOOD", name: "Finished good", used: "Production output" },
  { key: "SEMI_FINISHED", name: "Semi finished", used: "Intermediate production" },
  { key: "CONSUMABLE", name: "Consumable", used: "Internal use, packaging" },
  { key: "ASSET", name: "Asset", used: "Fixed asset register" },
  { key: "EXPENSE_ITEM", name: "Expense item", used: "Direct expense purchases" },
  { key: "BUNDLE", name: "Bundle", used: "Multiple SKUs sold as one" },
  { key: "COMBO", name: "Combo", used: "Restaurant meal deals" },
  { key: "MODIFIER", name: "Modifier", used: "Extra cheese, size, add-ons" },
];

export const COSTING_METHODS = [
  {
    key: "AVG",
    name: "Weighted average",
    detail: "Default. Recalculates average cost on every receipt.",
    best: "Grocery, electronics, retail",
  },
  {
    key: "FIFO",
    name: "FIFO layers",
    detail: "Cost layers per receipt, oldest layer consumed first.",
    best: "Batch/expiry sensitive goods",
  },
  {
    key: "STANDARD",
    name: "Standard cost",
    detail: "Planned cost with variance posted to the P&L.",
    best: "Manufacturing, restaurants",
  },
  {
    key: "LANDED",
    name: "Landed cost",
    detail: "Adds freight, duty and handling to the receipt cost.",
    best: "Imported goods",
  },
];

/* --------------------- warehouse locations -------------------------- */

export type LocationRow = {
  zone: string;
  rack: string;
  shelf: string;
  bin: string;
  product: string;
  qty: number;
  type: string;
};

export function warehouseLocations(companyId: number): LocationRow[] {
  const seed = companyId * 13;
  const zones = ["Zone A — Fast moving", "Zone B — Bulk", "Zone C — Cold chain", "Zone D — Damaged / quarantine"];
  const products = ["Basmati Rice 5kg", "Fresh Full Cream Milk 1L", "Mineral Water 1.5L Pack of 12", "Chicken Breast", "Laundry Powder 3kg"];
  const rows: LocationRow[] = [];
  for (let i = 0; i < 14; i++) {
    const zone = zones[i % zones.length];
    const rack = `Rack ${String.fromCharCode(65 + (i % 3))}${1 + (i % 4)}`;
    const shelf = `Shelf ${1 + (i % 3)}`;
    const bin = `${String.fromCharCode(65 + (i % 4))}-${(seed + i * 7) % 90 + 10}`;
    rows.push({
      zone,
      rack,
      shelf,
      bin,
      product: products[(i + seed) % products.length],
      qty: ((seed + i * 31) % 240) + 5,
      type: i % 7 === 0 ? "QUARANTINE" : i % 5 === 0 ? "PICKING" : "STORAGE",
    });
  }
  return rows;
}

export const WAREHOUSE_TYPES = [
  { key: "MAIN", name: "Main warehouse", note: "Default store for a branch" },
  { key: "COLD", name: "Cold storage", note: "Chilled / frozen lines" },
  { key: "BACKROOM", name: "Backroom", note: "Overflow near the shop floor" },
  { key: "TRANSIT", name: "Transit", note: "In-transit stock between branches" },
  { key: "VIRTUAL", name: "Virtual", note: "Drop-ship or supplier owned stock" },
  { key: "DAMAGED", name: "Damaged / quarantine", note: "Write-off staging" },
  { key: "CONSIGNMENT", name: "Consignment", note: "Supplier owned until sold" },
];

/* ------------------------ document number series --------------------- */

export type NumberSeriesRow = {
  document: string;
  prefix: string;
  branch: string;
  next: number;
  padding: number;
  reset: string;
};

export function numberSeries(companyId: number, branches: string[]): NumberSeriesRow[] {
  const docs = [
    { document: "Sales invoice", prefix: "INV", reset: "Yearly" },
    { document: "Sales return", prefix: "RET", reset: "Yearly" },
    { document: "Sales quotation", prefix: "QT", reset: "Yearly" },
    { document: "Purchase order", prefix: "PO", reset: "Yearly" },
    { document: "Goods receipt", prefix: "GRN", reset: "Monthly" },
    { document: "Supplier bill", prefix: "BILL", reset: "Yearly" },
    { document: "Stock adjustment", prefix: "ADJ", reset: "Monthly" },
    { document: "Stock transfer", prefix: "TRF", reset: "Monthly" },
    { document: "Journal entry", prefix: "JV", reset: "Yearly" },
    { document: "Receipt (AR)", prefix: "RCT", reset: "Yearly" },
    { document: "Payment (AP)", prefix: "PAY", reset: "Yearly" },
    { document: "KOT", prefix: "KOT", reset: "Daily" },
  ];
  const out: NumberSeriesRow[] = [];
  docs.forEach((doc, index) => {
    branches.slice(0, 2).forEach((branch, branchIndex) => {
      out.push({
        document: doc.document,
        prefix: `${branch.slice(0, 3).toUpperCase()}-${doc.prefix}`,
        branch,
        next: 1000 + ((companyId + index) * 37) % 900 + branchIndex,
        padding: 6,
        reset: doc.reset,
      });
    });
  });
  return out;
}

/* ----------------------------- accounting ---------------------------- */

export const CHART_OF_ACCOUNTS = [
  { code: "1000", name: "Cash on hand", type: "ASSET", balance: 128400 },
  { code: "1100", name: "Bank — QNB current", type: "ASSET", balance: 862300 },
  { code: "1200", name: "Accounts receivable", type: "ASSET", balance: 214750 },
  { code: "1300", name: "Inventory", type: "ASSET", balance: 486200 },
  { code: "1400", name: "Fixed assets", type: "ASSET", balance: 320000 },
  { code: "2000", name: "Accounts payable", type: "LIABILITY", balance: 189600 },
  { code: "2100", name: "VAT payable", type: "LIABILITY", balance: 64250 },
  { code: "2200", name: "Customer credit / deposits", type: "LIABILITY", balance: 41200 },
  { code: "3000", name: "Share capital", type: "EQUITY", balance: 1000000 },
  { code: "3100", name: "Retained earnings", type: "EQUITY", balance: 561100 },
  { code: "4000", name: "Retail sales", type: "REVENUE", balance: 1482600 },
  { code: "4100", name: "Restaurant sales", type: "REVENUE", balance: 214500 },
  { code: "4200", name: "Service income", type: "REVENUE", balance: 38600 },
  { code: "5000", name: "Cost of goods sold", type: "EXPENSE", balance: 902400 },
  { code: "5100", name: "Salaries and wages", type: "EXPENSE", balance: 268000 },
  { code: "5200", name: "Rent and utilities", type: "EXPENSE", balance: 142000 },
  { code: "5300", name: "Marketing", type: "EXPENSE", balance: 48000 },
];

export const MODULE_ACCOUNT_MAPPING = [
  {
    module: "Retail sale",
    event: "Invoice completed",
    debit: "Cash / Bank / AR",
    credit: "Retail sales + VAT payable",
    extra: "COGS debit · Inventory credit",
  },
  {
    module: "Sales return",
    event: "Refund posted",
    debit: "Sales returns",
    credit: "Cash / AR",
    extra: "Inventory debit · COGS credit",
  },
  {
    module: "Purchase receipt (GRN)",
    event: "Goods received",
    debit: "Inventory + VAT receivable",
    credit: "GRN clearing",
    extra: "Landed cost allocation",
  },
  {
    module: "Supplier bill",
    event: "Invoice approved",
    debit: "Accounts payable",
    credit: "GRN clearing",
    extra: "Approval workflow gate",
  },
  {
    module: "Restaurant sale",
    event: "Order closed",
    debit: "Cash / Card / AR",
    credit: "Restaurant sales + service charge",
    extra: "Recipe COGS from ingredient deduction",
  },
  {
    module: "Stock adjustment",
    event: "Adjustment approved",
    debit: "Shrinkage expense",
    credit: "Inventory",
    extra: "Manager approval required",
  },
  {
    module: "Payroll (future)",
    event: "Payroll run",
    debit: "Salary expense",
    credit: "Salaries payable",
    extra: "Cost centre split",
  },
  {
    module: "Event wallet",
    event: "Wallet recharge",
    debit: "Cash / Card",
    credit: "Deferred revenue",
    extra: "Revenue recognised on consumption",
  },
];

export type JournalRow = {
  entry: string;
  date: Date;
  source: string;
  reference: string;
  account: string;
  debit: number;
  credit: number;
  narration: string;
};

export function journalEntries(companyId: number): JournalRow[] {
  const base = new Date();
  const mk = (days: number) => {
    const d = new Date(base);
    d.setDate(d.getDate() - days);
    return d;
  };
  return [
    { entry: `JV-${companyId}-000481`, date: mk(0), source: "Retail POS", reference: `INV-000412`, account: "4000 Retail sales", debit: 0, credit: 12450, narration: "Daily POS sales posting" },
    { entry: `JV-${companyId}-000481`, date: mk(0), source: "Retail POS", reference: `INV-000412`, account: "2100 VAT payable", debit: 0, credit: 622, narration: "Output VAT on POS sales" },
    { entry: `JV-${companyId}-000481`, date: mk(0), source: "Retail POS", reference: `INV-000412`, account: "1000 Cash on hand", debit: 7480, credit: 0, narration: "Cash tendered" },
    { entry: `JV-${companyId}-000481`, date: mk(0), source: "Retail POS", reference: `INV-000412`, account: "1100 Bank — QNB", debit: 5592, credit: 0, narration: "Card settlement batch" },
    { entry: `JV-${companyId}-000481`, date: mk(0), source: "Retail POS", reference: `INV-000412`, account: "5000 COGS", debit: 8120, credit: 0, narration: "Cost of goods sold" },
    { entry: `JV-${companyId}-000481`, date: mk(0), source: "Retail POS", reference: `INV-000412`, account: "1300 Inventory", debit: 0, credit: 8120, narration: "Inventory relief" },
    { entry: `JV-${companyId}-000480`, date: mk(1), source: "Purchasing", reference: "GRN-000118", account: "1300 Inventory", debit: 38400, credit: 0, narration: "Goods received from supplier" },
    { entry: `JV-${companyId}-000480`, date: mk(1), source: "Purchasing", reference: "GRN-000118", account: "2100 VAT receivable", debit: 1920, credit: 0, narration: "Input VAT on receipt" },
    { entry: `JV-${companyId}-000480`, date: mk(1), source: "Purchasing", reference: "GRN-000118", account: "2000 GRN clearing", debit: 0, credit: 40320, narration: "Goods received not invoiced" },
    { entry: `JV-${companyId}-000479`, date: mk(2), source: "Inventory", reference: "ADJ-000092", account: "5400 Shrinkage", debit: 640, credit: 0, narration: "Count variance — Zone B" },
    { entry: `JV-${companyId}-000479`, date: mk(2), source: "Inventory", reference: "ADJ-000092", account: "1300 Inventory", debit: 0, credit: 640, narration: "Inventory write-down" },
    { entry: `JV-${companyId}-000478`, date: mk(3), source: "AR", reference: "RCT-000231", account: "1100 Bank — QNB", debit: 18600, credit: 0, narration: "Corporate customer receipt" },
    { entry: `JV-${companyId}-000478`, date: mk(3), source: "AR", reference: "RCT-000231", account: "1200 AR", debit: 0, credit: 18600, narration: "Customer settlement" },
  ];
}

/* ----------------------------- approvals ----------------------------- */

export const APPROVAL_WORKFLOWS = [
  { key: "PO_ABOVE_LIMIT", name: "Purchase order above limit", trigger: "PO total > 10,000", steps: ["Branch manager", "Finance manager"], module: "Purchasing" },
  { key: "REFUND_ABOVE_LIMIT", name: "Refund above limit", trigger: "Refund > 500", steps: ["Supervisor", "Company admin"], module: "Retail POS" },
  { key: "STOCK_ADJUSTMENT", name: "Stock adjustment", trigger: "Any adjustment posting", steps: ["Inventory manager"], module: "Inventory" },
  { key: "CREDIT_SALE", name: "Credit sale over limit", trigger: "Credit > customer limit", steps: ["Finance manager"], module: "Retail POS" },
  { key: "PRICE_CHANGE", name: "Selling price change", trigger: "Price changed > 5%", steps: ["Company admin"], module: "Pricing" },
  { key: "EXPENSE_CLAIM", name: "Expense claim", trigger: "Expense submitted", steps: ["Line manager", "Finance manager"], module: "Finance" },
];

export const APPROVAL_REQUESTS = [
  { ref: "APR-00091", type: "Purchase order above limit", subject: "PO-ABC-0004 · Gulf Food Distribution", amount: 24800, step: "Finance manager", raisedBy: "Bilal Haddad", age: "2 hours", status: "PENDING" },
  { ref: "APR-00090", type: "Refund above limit", subject: "RET-ABC-0003 · 55\" Smart TV return", amount: 2199, step: "Company admin", raisedBy: "Aisha Rahman", age: "5 hours", status: "PENDING" },
  { ref: "APR-00089", type: "Selling price change", subject: "Basmati Rice 5kg · +8%", amount: 0, step: "Company admin", raisedBy: "Ravi Kumar", age: "1 day", status: "PENDING" },
  { ref: "APR-00088", type: "Stock adjustment", subject: "ADJ-ABC-0002 · Zone B count", amount: 640, step: "Inventory manager", raisedBy: "Bilal Haddad", age: "2 days", status: "APPROVED" },
  { ref: "APR-00087", type: "Credit sale over limit", subject: "CU-0007 corporate order", amount: 15200, step: "Finance manager", raisedBy: "Noor Saleh", age: "3 days", status: "REJECTED" },
];

/* ---------------------------- restaurant ----------------------------- */

export const RESTAURANT_MENU = [
  { item: "Chicken Burger", category: "Mains", price: 32, cost: 11.4, station: "Grill", type: "COMBO" },
  { item: "Beef Burger", category: "Mains", price: 38, cost: 14.2, station: "Grill", type: "COMBO" },
  { item: "Margherita Pizza", category: "Mains", price: 45, cost: 13.8, station: "Oven", type: "COMBO" },
  { item: "Caesar Salad", category: "Starters", price: 28, cost: 8.6, station: "Cold", type: "STOCK_ITEM" },
  { item: "French Fries", category: "Sides", price: 14, cost: 3.2, station: "Fryer", type: "STOCK_ITEM" },
  { item: "Fresh Orange Juice", category: "Drinks", price: 16, cost: 4.5, station: "Bar", type: "STOCK_ITEM" },
  { item: "Extra Cheese", category: "Modifiers", price: 6, cost: 1.8, station: "Grill", type: "MODIFIER" },
  { item: "Meal Deal — Burger + Fries + Drink", category: "Combos", price: 52, cost: 17.6, station: "Mixed", type: "BUNDLE" },
];

export const RESTAURANT_TABLES = [
  { table: "T01", section: "Indoor", seats: 4, status: "OCCUPIED", server: "Noor Saleh", since: "18 min", total: 186 },
  { table: "T02", section: "Indoor", seats: 2, status: "AVAILABLE", server: "—", since: "—", total: 0 },
  { table: "T03", section: "Indoor", seats: 6, status: "BILL_REQUESTED", server: "Ravi Kumar", since: "52 min", total: 412 },
  { table: "T04", section: "Terrace", seats: 4, status: "OCCUPIED", server: "Noor Saleh", since: "9 min", total: 74 },
  { table: "T05", section: "Terrace", seats: 8, status: "RESERVED", server: "—", since: "19:30", total: 0 },
  { table: "T06", section: "Family", seats: 6, status: "AVAILABLE", server: "—", since: "—", total: 0 },
];

export const RESTAURANT_KOTS = [
  { kot: "KOT-00412", table: "T01", station: "Grill", items: "2× Chicken Burger (extra cheese)", status: "PREPARING", age: "6 min" },
  { kot: "KOT-00411", table: "T03", station: "Oven", items: "1× Margherita Pizza", status: "READY", age: "2 min" },
  { kot: "KOT-00410", table: "T04", station: "Fryer", items: "2× French Fries", status: "PREPARING", age: "4 min" },
  { kot: "KOT-00409", table: "T01", station: "Cold", items: "1× Caesar Salad", status: "SERVED", age: "12 min" },
];

export const RECIPES = [
  {
    menu: "Chicken Burger",
    yield: "1 burger",
    ingredients: [
      { item: "Chicken Breast", qty: "150 g", cost: 4.13 },
      { item: "Burger Bun", qty: "1 pc", cost: 0.9 },
      { item: "Cheddar Cheese", qty: "30 g", cost: 2.03 },
      { item: "Lettuce", qty: "20 g", cost: 0.42 },
      { item: "Sauce", qty: "15 g", cost: 0.55 },
    ],
  },
  {
    menu: "Margherita Pizza",
    yield: "1 pizza",
    ingredients: [
      { item: "Pizza Dough", qty: "220 g", cost: 1.6 },
      { item: "Tomato Paste", qty: "80 g", cost: 1.05 },
      { item: "Mozzarella", qty: "120 g", cost: 4.9 },
      { item: "Basil", qty: "5 g", cost: 0.35 },
    ],
  },
];

/* ------------------------------ loyalty ------------------------------ */

export const LOYALTY_PROGRAM = {
  name: "Fresh Rewards",
  rule: "1 point per currency unit spent",
  tiers: [
    { tier: "Bronze", spend: "0+", benefit: "1× points" },
    { tier: "Silver", spend: "2,000+", benefit: "1.25× points" },
    { tier: "Gold", spend: "10,000+", benefit: "1.5× points + free delivery" },
    { tier: "Platinum", spend: "25,000+", benefit: "2× points + early access" },
  ],
  scope: "Company wide — points earned in retail and restaurant are pooled",
  redeem: "100 points = 1 currency unit off any invoice",
};

export const LOYALTY_MEMBERS = [
  { customer: "Layla Al-Sulaiti", points: 4820, tier: "Gold", lifetime: 12400, lastVisit: "Today" },
  { customer: "Mohammed Nasser", points: 3110, tier: "Silver", lifetime: 8900, lastVisit: "Yesterday" },
  { customer: "Zainab Malik", points: 2640, tier: "Silver", lifetime: 7200, lastVisit: "2 days" },
  { customer: "Omar Al-Kuwari", points: 1480, tier: "Bronze", lifetime: 3100, lastVisit: "3 days" },
  { customer: "Huda Ibrahim", points: 960, tier: "Bronze", lifetime: 2100, lastVisit: "1 week" },
];

/* ------------------------------- events ------------------------------ */

export const EVENTS = [
  {
    name: "Doha Food Festival",
    venue: "Doha Exhibition Centre",
    date: "12–15 Mar 2026",
    zones: 6,
    ticketsSold: 4820,
    capacity: 6000,
    wallets: 3910,
    walletBalance: 268400,
    entries: 9640,
    status: "ON_SALE",
  },
  {
    name: "Tech Summit Qatar",
    venue: "Sherato Grand Ballroom",
    date: "02 Apr 2026",
    zones: 3,
    ticketsSold: 1180,
    capacity: 1500,
    wallets: 940,
    walletBalance: 74200,
    entries: 0,
    status: "ON_SALE",
  },
  {
    name: "Family Carnival",
    venue: "Aspire Park",
    date: "18 Jan 2026",
    zones: 8,
    ticketsSold: 7400,
    capacity: 7500,
    wallets: 6100,
    walletBalance: 0,
    entries: 14820,
    status: "COMPLETED",
  },
];

/* --------------------------- integrations ---------------------------- */

export const INTEGRATIONS = [
  { name: "Talabat", category: "Delivery", status: "AVAILABLE", detail: "Menu and order sync, automatic stock deduction" },
  { name: "Snoonu", category: "Delivery", status: "AVAILABLE", detail: "Menu push, order webhook, courier status" },
  { name: "Keeta", category: "Delivery", status: "ROADMAP", detail: "Planned Q3" },
  { name: "Stripe", category: "Payments", status: "CONNECTED", detail: "Card present and online, daily settlement file" },
  { name: "Tap Payments", category: "Payments", status: "CONNECTED", detail: "KNET, Apple Pay, benefit" },
  { name: "WhatsApp Business", category: "Messaging", status: "CONNECTED", detail: "Receipts, order updates, reminders" },
  { name: "SMS gateway", category: "Messaging", status: "AVAILABLE", detail: "OTP, invoice links" },
  { name: "WooCommerce", category: "E-commerce", status: "ROADMAP", detail: "Catalogue and stock sync" },
  { name: "QuickBooks / Xero", category: "Accounting", status: "ROADMAP", detail: "Journal export bridge" },
  { name: "Zoho Books", category: "Accounting", status: "AVAILABLE", detail: "COA mapping and journal push" },
];

export const API_CLIENTS = [
  { name: "Flutter POS — Android", scopes: ["products:read", "inventory:read", "sales:write"], calls: "1.2M / month", status: "ACTIVE" },
  { name: "Flutter POS — iOS", scopes: ["products:read", "sales:write"], calls: "340K / month", status: "ACTIVE" },
  { name: "Next.js Super Admin", scopes: ["platform:*"], calls: "88K / month", status: "ACTIVE" },
  { name: "Customer app", scopes: ["orders:read", "loyalty:read"], calls: "212K / month", status: "ACTIVE" },
  { name: "Delivery aggregator bridge", scopes: ["orders:write", "menu:read"], calls: "54K / month", status: "SANDBOX" },
  { name: "BI / warehouse export", scopes: ["reports:read"], calls: "3K / month", status: "ACTIVE" },
];

export const WEBHOOKS = [
  { event: "sale.completed", target: "https://erp.company.qa/hooks/pos", deliveries: "12,480", failures: 3, status: "ACTIVE" },
  { event: "stock.low", target: "https://erp.company.qa/hooks/inventory", deliveries: "412", failures: 0, status: "ACTIVE" },
  { event: "invoice.paid", target: "https://finance.company.qa/hooks/ar", deliveries: "1,204", failures: 12, status: "DEGRADED" },
  { event: "order.received", target: "https://kitchen.company.qa/hooks/kds", deliveries: "8,910", failures: 0, status: "ACTIVE" },
];

/* --------------------------- build phases ---------------------------- */

export const BUILD_PHASES = [
  {
    phase: 1,
    name: "Foundation",
    scope: "SaaS, tenant, organisation, security/RBAC, master data, documents, workflow, audit",
    modules: ["platform_saas", "core_tenant", "core_warehouse", "core_security", "core_master", "core_documents", "core_workflow", "core_audit"],
  },
  {
    phase: 2,
    name: "Retail",
    scope: "Products, pricing, inventory, customers, suppliers, purchasing, POS, offline sync, hardware",
    modules: ["core_product", "core_pricing", "core_inventory", "core_partner", "retail_pos", "retail_purchasing", "retail_promotions", "platform_sync", "platform_api"],
  },
  {
    phase: 3,
    name: "Accounting",
    scope: "Chart of accounts, GL, AR, AP, banking, tax, costing, financial reports",
    modules: ["fin_chart", "fin_ar", "fin_ap", "fin_banking", "fin_tax", "platform_reporting"],
  },
  {
    phase: 4,
    name: "Restaurant",
    scope: "Menu, modifiers, combos, tables, orders, KOT, kitchen stations, recipes",
    modules: ["restaurant_core", "restaurant_recipes"],
  },
  {
    phase: 5,
    name: "Extended ERP",
    scope: "HRM, payroll, CRM, loyalty, e-commerce, events, manufacturing, service, fleet, projects, assets",
    modules: ["hrm_core", "hrm_payroll", "crm_core", "commerce_ecom", "events_core", "ops_manufacturing", "ops_service", "ops_fleet", "ops_projects", "fin_assets"],
  },
];

export const ERP_DOMAINS = [
  "SaaS / Super Admin", "Tenant / Company", "Organization", "Authentication", "RBAC",
  "Subscription", "Localization", "Tax", "Currency", "UOM", "Product Master", "Product Pricing",
  "Customer", "Supplier", "Inventory", "Purchasing", "Sales", "Retail POS", "Restaurant",
  "Manufacturing", "Accounting", "Banking", "Accounts Receivable", "Accounts Payable",
  "Fixed Assets", "HRM", "Payroll", "CRM", "Loyalty", "E-commerce", "Event Management",
  "Project Management", "Service Management", "Fleet", "Notifications", "Integrations",
  "API", "Offline Sync", "Hardware", "Reporting", "Audit / Security", "Files", "Workflow / Approvals",
];

export const ARCHITECTURE_LAYERS = [
  {
    layer: "Presentation",
    items: ["Super Admin (Next.js)", "Vendor panel (Next.js)", "Flutter POS (offline SQLite)", "Customer app", "Kitchen display"],
  },
  {
    layer: "API",
    items: ["REST /api/v1", "Bearer tokens + scopes", "Webhooks", "Rate limits", "Idempotency keys"],
  },
  {
    layer: "ERP Core",
    items: ["Tenant → Branch → Warehouse → Location", "Users & RBAC", "Product / UOM / Barcode", "Pricing & costing", "Inventory ledger", "Customers & suppliers", "Document series", "Workflow engine", "Audit"],
  },
  {
    layer: "Modules",
    items: ["Retail", "Restaurant", "Accounting", "HRM / Payroll", "CRM / Loyalty", "Events", "E-commerce", "Manufacturing", "Service / Fleet"],
  },
  {
    layer: "Shared services",
    items: ["Tax engine", "Currency & FX", "Notification engine", "File storage", "Integration bus", "Reporting aggregates"],
  },
  {
    layer: "Data",
    items: ["PostgreSQL", "Redis cache", "Queue workers", "Object storage", "Read replicas / BI"],
  },
];

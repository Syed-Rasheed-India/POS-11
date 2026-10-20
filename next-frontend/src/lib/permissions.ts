/** RBAC catalogues used by the Super Admin and Vendor panels. */

export type PermissionDef = { key: string; module: string; name: string; description: string };

export const COMPANY_PERMISSIONS: PermissionDef[] = [
  { key: "dashboard.view", module: "Dashboard", name: "View dashboard", description: "See the shop overview widgets" },
  { key: "products.view", module: "Products", name: "View products", description: "Browse the product catalogue" },
  { key: "products.create", module: "Products", name: "Create product", description: "Add new products, UOM and barcodes" },
  { key: "products.edit", module: "Products", name: "Edit product", description: "Change product data and prices" },
  { key: "products.delete", module: "Products", name: "Delete product", description: "Archive or remove products" },
  { key: "inventory.view", module: "Inventory", name: "View stock", description: "See stock balances and movements" },
  { key: "inventory.adjust", module: "Inventory", name: "Adjust stock", description: "Post stock adjustments / counts" },
  { key: "inventory.transfer", module: "Inventory", name: "Transfer stock", description: "Move stock between warehouses" },
  { key: "sales.view", module: "Sales", name: "View sales", description: "Read invoices and sale history" },
  { key: "sales.create", module: "Sales", name: "Create sale", description: "Operate the POS terminal" },
  { key: "sales.return", module: "Sales", name: "Post sales return", description: "Refund or exchange items" },
  { key: "purchases.view", module: "Purchasing", name: "View purchases", description: "Read purchase orders and GRN" },
  { key: "purchases.create", module: "Purchasing", name: "Create purchase", description: "Raise POs and receive goods" },
  { key: "customers.manage", module: "Customers", name: "Manage customers", description: "Customers, groups and credit limits" },
  { key: "suppliers.manage", module: "Suppliers", name: "Manage suppliers", description: "Supplier master and payables" },
  { key: "promotions.manage", module: "Promotions", name: "Manage promotions", description: "Discounts and campaigns" },
  { key: "reports.view", module: "Reports", name: "View reports", description: "Sales, stock and profit reports" },
  { key: "users.manage", module: "Users", name: "Manage users", description: "Create staff and assign branches" },
  { key: "roles.manage", module: "Users", name: "Manage roles", description: "Edit roles and permissions" },
  { key: "branches.manage", module: "Organisation", name: "Manage branches", description: "Branches, warehouses and terminals" },
  { key: "settings.manage", module: "Settings", name: "Manage settings", description: "Company and receipt settings" },
];

export const ALL_COMPANY_PERMISSION_KEYS = COMPANY_PERMISSIONS.map((p) => p.key);

/** Role presets applied when a new company is provisioned. */
export const COMPANY_ROLE_PRESETS: {
  name: string;
  description: string;
  permissions: string[];
}[] = [
  {
    name: "Company Admin",
    description: "Full control over the company, billing and settings",
    permissions: ALL_COMPANY_PERMISSION_KEYS,
  },
  {
    name: "Manager",
    description: "Runs day to day operations of the shops",
    permissions: [
      "dashboard.view",
      "products.view",
      "products.create",
      "products.edit",
      "inventory.view",
      "inventory.adjust",
      "inventory.transfer",
      "sales.view",
      "sales.create",
      "sales.return",
      "purchases.view",
      "purchases.create",
      "customers.manage",
      "suppliers.manage",
      "promotions.manage",
      "reports.view",
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
      "dashboard.view",
      "products.view",
      "products.create",
      "products.edit",
      "inventory.view",
      "inventory.adjust",
      "inventory.transfer",
      "purchases.view",
      "purchases.create",
      "suppliers.manage",
      "reports.view",
    ],
  },
];

export const PLATFORM_PERMISSIONS: PermissionDef[] = [
  { key: "vendors.view", module: "Vendors", name: "View vendors", description: "List companies on the platform" },
  { key: "vendors.create", module: "Vendors", name: "Create vendor", description: "Provision new companies" },
  { key: "vendors.edit", module: "Vendors", name: "Edit vendor", description: "Update company profile" },
  { key: "vendors.suspend", module: "Vendors", name: "Suspend vendor", description: "Block platform access" },
  { key: "subscriptions.view", module: "Subscriptions", name: "View subscriptions", description: "Plans and tenant subscriptions" },
  { key: "subscriptions.manage", module: "Subscriptions", name: "Manage subscriptions", description: "Change plans, renew or cancel" },
  { key: "payments.view", module: "Payments", name: "View payments", description: "Platform revenue and invoices" },
  { key: "reports.view", module: "Reports", name: "View platform reports", description: "MRR, churn, usage" },
  { key: "support.manage", module: "Support", name: "Manage support", description: "Answer vendor tickets" },
  { key: "settings.manage", module: "Settings", name: "Manage platform settings", description: "Global configuration" },
  { key: "admins.manage", module: "Admins", name: "Manage admins", description: "Platform users and roles" },
  { key: "audit.view", module: "Audit", name: "View audit logs", description: "Security trail" },
];

export const ALL_PLATFORM_PERMISSION_KEYS = PLATFORM_PERMISSIONS.map((p) => p.key);

export const PLATFORM_ROLE_PRESETS: {
  name: string;
  description: string;
  permissions: string[];
}[] = [
  { name: "Super Admin", description: "Unrestricted platform access", permissions: ALL_PLATFORM_PERMISSION_KEYS },
  {
    name: "Support Admin",
    description: "Vendor support only",
    permissions: ["vendors.view", "subscriptions.view", "payments.view", "support.manage"],
  },
  {
    name: "Finance Admin",
    description: "Billing and revenue",
    permissions: ["vendors.view", "subscriptions.view", "subscriptions.manage", "payments.view", "reports.view"],
  },
];

/** Feature flags attached to subscription plans. */
export const FEATURE_CATALOG: { featureKey: string; name: string; module: string; description: string }[] = [
  { featureKey: "retail_pos", name: "Retail POS", module: "Sales", description: "Touch friendly checkout with barcode scanning" },
  { featureKey: "offline_pos", name: "Offline POS", module: "Sales", description: "Queue sales while offline and sync later" },
  { featureKey: "inventory", name: "Inventory", module: "Inventory", description: "Stock balances, adjustments and transfers" },
  { featureKey: "multi_branch", name: "Multi Branch", module: "Organisation", description: "Operate more than one retail outlet" },
  { featureKey: "multi_warehouse", name: "Multi Warehouse", module: "Inventory", description: "Split stock across warehouses" },
  { featureKey: "purchasing", name: "Purchasing", module: "Purchasing", description: "Purchase orders, GRN and supplier bills" },
  { featureKey: "customer_credit", name: "Customer Credit", module: "Customers", description: "Credit limits and account statements" },
  { featureKey: "promotions", name: "Promotions", module: "Promotions", description: "Discounts, bundles and campaigns" },
  { featureKey: "barcode_scale", name: "Barcode Scale", module: "Hardware", description: "Weight and price embedded barcodes" },
  { featureKey: "advanced_reports", name: "Advanced Reports", module: "Reports", description: "Profit, COGS and cashier analytics" },
  { featureKey: "loyalty", name: "Loyalty", module: "Customers", description: "Points and customer rewards" },
  { featureKey: "accounting", name: "Accounting Bridge", module: "Finance", description: "Export journals to an accounting system" },
];

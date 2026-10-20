import type { NavGroup } from "@/components/shell";

export const vendorNav: NavGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/", icon: "grid" },
      { label: "POS Terminal", href: "/pos", icon: "cart" },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Sales Invoices", href: "/sales", icon: "receipt" },
      { label: "Sales Returns", href: "/sales-returns", icon: "back" },
      { label: "Held Bills", href: "/held-sales", icon: "clock" },
      { label: "Shifts & Z Report", href: "/shifts", icon: "printer" },
    ],
  },
  {
    label: "Products",
    items: [
      { label: "Products", href: "/products", icon: "box" },
      { label: "Categories", href: "/categories", icon: "list" },
      { label: "Brands", href: "/brands", icon: "tag" },
      { label: "Units (UOM)", href: "/uoms", icon: "scale" },
      { label: "Barcodes", href: "/barcodes", icon: "barcode" },
      { label: "Price Lists", href: "/price-lists", icon: "dollar" },
      { label: "Promotions", href: "/promotions", icon: "gift" },
    ],
  },
  {
    label: "ERP Core",
    items: [
      { label: "Modules", href: "/modules", icon: "layers" },
      { label: "Warehouse Locations", href: "/locations", icon: "warehouse" },
      { label: "Number Series", href: "/number-series", icon: "list" },
      { label: "Approvals", href: "/approvals", icon: "shield" },
      { label: "Data Model Map", href: "/data-map", icon: "database" },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Accounting", href: "/accounting", icon: "file" },
    ],
  },
  {
    label: "Modules",
    items: [
      { label: "Manage Stock", href: "/stock", icon: "layers" },
      { label: "Stock Ledger", href: "/stock-ledger", icon: "activity" },
      { label: "Adjustments", href: "/adjustments", icon: "edit" },
      { label: "Transfers", href: "/transfers", icon: "truck" },
      { label: "Stock Valuation", href: "/stock-valuation", icon: "chart" },
    ],
  },
  {
    label: "Purchasing",
    items: [
      { label: "Suppliers", href: "/suppliers", icon: "building" },
      { label: "Purchase Orders", href: "/purchase-orders", icon: "file" },
      { label: "Goods Receipt", href: "/goods-receipts", icon: "inbox" },
      { label: "Purchase Invoices", href: "/purchase-invoices", icon: "card" },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Customers", href: "/customers", icon: "users" },
      { label: "Customer Groups", href: "/customer-groups", icon: "star" },
    ],
  },
  {
    label: "Reports",
    items: [
      { label: "Sales Report", href: "/reports/sales", icon: "chart" },
      { label: "Profit & Loss", href: "/reports/profit", icon: "up" },
      { label: "Product Report", href: "/reports/products", icon: "award" },
      { label: "Z Report", href: "/reports/z-report", icon: "printer" },
    ],
  },

  {
    label: "Users & security",
    items: [
      { label: "Users", href: "/users", icon: "user" },
      { label: "Roles & Permissions", href: "/roles", icon: "shield" },
    ],
  },
  {
    label: "Organisation",
    items: [
      { label: "Branches", href: "/branches", icon: "pin" },
      { label: "Warehouses", href: "/warehouses", icon: "warehouse" },
      { label: "POS Terminals", href: "/terminals", icon: "phone" },
    ],
  },
  {
    label: "Extensions",
    items: [
      { label: "Restaurant", href: "/restaurant", icon: "cart" },
      { label: "Recipes", href: "/recipes", icon: "box" },
      { label: "Loyalty", href: "/loyalty", icon: "award" },
      { label: "Events", href: "/events", icon: "star" },
      { label: "Integrations", href: "/integrations", icon: "server" },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Company Settings", href: "/settings", icon: "settings" },
      { label: "Subscription", href: "/subscription", icon: "award" },
      { label: "API & Devices", href: "/devices", icon: "server" },
      { label: "Support", href: "/support", icon: "inbox" },
      { label: "Notifications", href: "/notifications", icon: "bell" },
    ],
  },
];

export const platformNav: NavGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Overview", href: "/super-admin", icon: "grid" },
      { label: "Reports", href: "/super-admin/reports", icon: "chart" },
    ],
  },
  {
    label: "Vendors",
    items: [
      { label: "All vendors", href: "/super-admin/vendors", icon: "building" },
      { label: "Add vendor", href: "/super-admin/vendors/new", icon: "plus" },
      { label: "Feature overrides", href: "/super-admin/overrides", icon: "shield" },
      { label: "Retention & deletion", href: "/super-admin/retention", icon: "clock" },
      { label: "Backups", href: "/super-admin/backups", icon: "server" },
    ],
  },
  {
    label: "Subscriptions",
    items: [
      { label: "Subscriptions", href: "/super-admin/subscriptions", icon: "refresh" },
      { label: "Plans & limits", href: "/super-admin/plans", icon: "award" },
      { label: "Add-ons", href: "/super-admin/addons", icon: "gift" },
      { label: "Usage & limits", href: "/super-admin/usage", icon: "activity" },
    ],
  },
  {
    label: "Billing",
    items: [
      { label: "Invoices", href: "/super-admin/invoices", icon: "file" },
      { label: "Payments", href: "/super-admin/payments", icon: "card" },
      { label: "Gateways", href: "/super-admin/gateways", icon: "server" },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Settings", href: "/super-admin/settings", icon: "settings" },
      { label: "Technical config", href: "/super-admin/configs", icon: "database" },
      { label: "Modules & features", href: "/super-admin/modules", icon: "layers" },
      { label: "Countries & tax", href: "/super-admin/countries", icon: "globe" },
      { label: "Files", href: "/super-admin/files", icon: "inbox" },
    ],
  },
  {
    label: "Team & security",
    items: [
      { label: "Platform admins", href: "/super-admin/admins", icon: "user" },
      { label: "Roles & permissions", href: "/super-admin/roles", icon: "shield" },
      { label: "Security & audit", href: "/super-admin/audit", icon: "activity" },
    ],
  },
  {
    label: "Support & comms",
    items: [
      { label: "Tickets", href: "/super-admin/tickets", icon: "inbox" },
      { label: "Notifications", href: "/super-admin/notifications", icon: "bell" },
    ],
  },
  {
    label: "Developer",
    items: [
      { label: "API clients", href: "/super-admin/api", icon: "key" },
      { label: "ECR Providers", href: "/super-admin/ecr", icon: "terminal" },
      { label: "Database map", href: "/super-admin/database", icon: "database" },
    ],
  },
];

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Card, KeyValue, ProgressBar, SectionTitle, StatCard, Tabs } from "@/components/ui";
import { Checkbox, Field, NumberInput, SelectInput, TextInput, Textarea, btnPrimary, btnSoft } from "@/components/ui";
import { PermissionMatrix, type PermissionGroup } from "@/components/permissions";
import { AreaChart, BarSeries, Donut, HorizontalBars } from "@/components/charts";
import { FormPanel, Grid, Money, Qty, StatusBadge, TableCard, ViewHeader, SearchBox } from "../parts";
import { useSession, useTenant } from "@/lib/session";
import {
  PERMISSIONS,
  ROLE_PRESETS,
  apiTokens,
  cashierPerformance,
  categorySales,
  dailySalesSeries,
  lowStock,
  paymentMix,
  paymentMethodsFor,
  plans,
  stockValue,
  topProducts,
  totalsFor,
} from "@/lib/mock";
import { dateShort, dateTime, money, num, timeAgo, toNum } from "@/lib/format";

/* ------------------------------- customers ------------------------------ */

export function CustomersView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const [query, setQuery] = useState("");
  const [extra, setExtra] = useState<typeof tenant.customers>([]);
  const rows = [...extra, ...tenant.customers].filter((customer) =>
    query
      ? `${customer.name} ${customer.code} ${customer.phone}`.toLowerCase().includes(query.toLowerCase())
      : true,
  );
  return (
    <div>
      <ViewHeader
        title="Customers"
        subtitle={`${rows.length} customers · ${currency} ${num(rows.reduce((sum, c) => sum + c.creditLimit, 0))} credit available`}
        crumbs={[{ label: "Customers" }]}
        actions={
          <Link href="/customers/new" className={btnPrimary}>
            + Add customer
          </Link>
        }
      />
      <Card
        title="Customer list"
        actions={<div className="w-56"><SearchBox value={query} onChange={setQuery} placeholder="Search customer" /></div>}
      >
        <TableCard
          title=""
          rowHref={(row) => `/customers/${row.id}`}
          columns={[
            {
              key: "name",
              label: "Customer",
              render: (row) => (
                <div>
                  <p className="font-semibold">{row.name}</p>
                  <p className="text-[11px] text-[#7A8086]">
                    {row.code} · {row.phone}
                  </p>
                </div>
              ),
            },
            { key: "type", label: "Type", render: (row) => <Badge tone="blue">{row.type}</Badge> },
            {
              key: "group",
              label: "Group",
              render: (row) => tenant.customerGroups.find((g) => g.id === row.groupId)?.name ?? "—",
            },
            {
              key: "creditLimit",
              label: "Credit limit",
              align: "right",
              render: (row) => <Money value={row.creditLimit} currency={currency} />,
            },
            { key: "points", label: "Loyalty", align: "right", render: (row) => num(row.points) },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={rows}
        />
      </Card>
    </div>
  );
}

export function CustomerDetailView({ id, tab }: { id: number; tab: string }) {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const customer = tenant.customers.find((c) => c.id === id);
  if (!customer) return <Card title="Customer not found">Unknown customer.</Card>;
  const purchases = tenant.sales.filter((sale) => sale.customerId === customer.id);
  const totalSpend = purchases.reduce((sum, sale) => sum + sale.total, 0);
  const outstanding = purchases
    .filter((sale) => sale.paymentStatus !== "PAID")
    .reduce((sum, sale) => sum + sale.balance, 0);

  return (
    <div>
      <ViewHeader
        title={customer.name}
        subtitle={`${customer.code} · ${customer.email}`}
        crumbs={[{ label: "Customers", href: "/customers" }, { label: customer.name }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Lifetime spend" value={`${currency} ${num(totalSpend)}`} icon="dollar" tone="green" />
        <StatCard label="Purchases" value={num(purchases.length)} icon="cart" tone="orange" />
        <StatCard label="Outstanding" value={`${currency} ${num(outstanding)}`} icon="alert" tone="red" />
        <StatCard label="Loyalty points" value={num(customer.points)} icon="award" tone="purple" />
      </div>
      <Tabs
        baseHref={`/customers/${id}`}
        active={tab}
        tabs={[
          { key: "overview", label: "Profile" },
          { key: "statement", label: "Statement" },
        ]}
      />
      {tab === "statement" ? (
        <TableCard
          title="Account statement"
          rowHref={(row) => `/sales/${row.id}`}
          columns={[
            { key: "invoiceNo", label: "Invoice" },
            { key: "saleDate", label: "Date", render: (row) => dateShort(row.date) },
            {
              key: "total",
              label: "Total",
              align: "right",
              render: (row) => <Money value={row.total} currency={currency} strong />,
            },
            {
              key: "balance",
              label: "Balance",
              align: "right",
              render: (row) => <Money value={row.balance} currency={currency} />,
            },
            { key: "paymentStatus", label: "Payment", render: (row) => <StatusBadge value={row.paymentStatus} /> },
          ]}
          rows={purchases.slice(0, 60)}
        />
      ) : (
        <Grid>
          <Card title="Customer profile">
            <KeyValue
              items={[
                { label: "Code", value: customer.code },
                { label: "Type", value: <Badge tone="blue">{customer.type}</Badge> },
                {
                  label: "Group",
                  value: tenant.customerGroups.find((g) => g.id === customer.groupId)?.name ?? "—",
                },
                { label: "Phone", value: customer.phone },
                { label: "Email", value: customer.email },
                { label: "Tax number", value: customer.taxNumber || "—" },
                { label: "Payment terms", value: `${customer.terms} days` },
                { label: "Credit limit", value: `${currency} ${num(customer.creditLimit, 2)}` },
              ]}
            />
          </Card>
          <Card title="Address & loyalty">
            <p className="text-sm text-[#646B72]">{customer.address}</p>
            <div className="mt-4">
              <SectionTitle hint="1 point per currency unit">Loyalty</SectionTitle>
              <p className="text-2xl font-bold text-[#212B36]">{num(customer.points)} points</p>
              <ProgressBar value={Math.min(100, (customer.points / 2500) * 100)} tone="purple" />
            </div>
          </Card>
        </Grid>
      )}
    </div>
  );
}

export function CustomerFormView() {
  const tenant = useTenant();
  const [extra, setExtra] = useState<typeof tenant.customers>([]);
  return (
    <div>
      <ViewHeader title="Add customer" crumbs={[{ label: "Customers", href: "/customers" }, { label: "Add" }]} />
      <Grid>
        <FormPanel
          title="Customer details"
          submitLabel="Create customer"
          cancelHref="/customers"
          onSubmit={(values) => {
            const name = String(values.name);
            if (!name) return;
            setExtra((prev) => [
              {
                id: Math.max(...tenant.customers.map((c) => c.id)) + prev.length + 1,
                code: `CU-${String(tenant.customers.length + prev.length + 1).padStart(4, "0")}`,
                name,
                type: String(values.customerType || "RETAIL"),
                phone: String(values.phone ?? ""),
                email: String(values.email ?? ""),
                taxNumber: String(values.taxNumber ?? ""),
                address: String(values.address ?? ""),
                groupId: Number(values.customerGroupId) || tenant.customerGroups[0].id,
                creditLimit: toNum(String(values.creditLimit)),
                terms: Math.trunc(toNum(String(values.paymentTermsDays))),
                points: 0,
                status: "ACTIVE",
              },
              ...prev,
            ]);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <TextInput name="name" required placeholder="Aisha Rahman" />
            </Field>
            <Field label="Phone">
              <TextInput name="phone" placeholder="+974 …" />
            </Field>
            <Field label="Email">
              <TextInput name="email" type="email" placeholder="customer@mail.com" />
            </Field>
            <Field label="Tax number">
              <TextInput name="taxNumber" />
            </Field>
            <Field label="Customer type">
              <SelectInput
                name="customerType"
                defaultValue="RETAIL"
                options={[
                  { value: "RETAIL", label: "Retail" },
                  { value: "WHOLESALE", label: "Wholesale" },
                  { value: "CORPORATE", label: "Corporate" },
                  { value: "VIP", label: "VIP" },
                ]}
              />
            </Field>
            <Field label="Group">
              <SelectInput
                name="customerGroupId"
                options={tenant.customerGroups.map((g) => ({ value: g.id, label: g.name }))}
                placeholder="No group"
              />
            </Field>
            <Field label="Credit limit">
              <NumberInput name="creditLimit" defaultValue={0} />
            </Field>
            <Field label="Payment terms (days)">
              <NumberInput name="paymentTermsDays" defaultValue={0} />
            </Field>
          </div>
          <Field label="Address">
            <Textarea name="address" />
          </Field>
        </FormPanel>
        <Card title="Credit sales">
          <p className="text-sm text-[#646B72]">
            Customers with a credit limit can be invoiced without immediate payment. The balance is
            tracked on the customer statement and appears in the customer due report.
          </p>
        </Card>
      </Grid>
      {extra.length > 0 ? (
        <div className="mt-4">
          <TableCard
            title="Added in this session"
            columns={[
              { key: "name", label: "Customer" },
              { key: "code", label: "Code" },
              { key: "type", label: "Type" },
            ]}
            rows={extra}
          />
        </div>
      ) : null}
    </div>
  );
}

export function CustomerGroupsView() {
  const tenant = useTenant();
  return (
    <div>
      <ViewHeader title="Customer groups" crumbs={[{ label: "Customers" }, { label: "Groups" }]} />
      <Grid>
        <TableCard
          title="Groups"
          columns={[
            { key: "name", label: "Group" },
            { key: "description", label: "Description" },
            { key: "priceList", label: "Price list" },
            { key: "discount", label: "Discount", align: "right", render: (row) => `${num(row.discount)}%` },
            {
              key: "members",
              label: "Members",
              align: "right",
              render: (row) => num(tenant.customers.filter((c) => c.groupId === row.id).length),
            },
            {
              key: "credit",
              label: "Credit",
              render: (row) => (row.credit ? <Badge tone="green">Allowed</Badge> : <Badge tone="gray">No</Badge>),
            },
          ]}
          rows={tenant.customerGroups}
        />
        <Card title="Group behaviour">
          <ul className="space-y-3 text-sm text-[#646B72]">
            <li>• Each group can point at its own price list.</li>
            <li>• Credit groups enforce a limit at checkout.</li>
            <li>• Group discounts are applied automatically on POS lines.</li>
            <li>• Corporate accounts receive monthly statements.</li>
          </ul>
        </Card>
      </Grid>
    </div>
  );
}

/* ------------------------------ suppliers form --------------------------- */

export function SupplierFormView() {
  const tenant = useTenant();
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <ViewHeader title="Add supplier" crumbs={[{ label: "Purchasing", href: "/suppliers" }, { label: "Add" }]} />
      <FormPanel
        title="Supplier details"
        submitLabel="Create supplier"
        cancelHref="/suppliers"
        onSubmit={(values) => {
          const name = String(values.name);
          if (!name) return;
          tenant.suppliers.unshift({
            id: Math.max(...tenant.suppliers.map((s) => s.id)) + 1,
            code: `SU-${String(tenant.suppliers.length + 1).padStart(3, "0")}`,
            name,
            contact: String(values.contactPerson ?? ""),
            phone: String(values.phone ?? ""),
            email: String(values.email ?? ""),
            taxNumber: String(values.taxNumber ?? ""),
            address: String(values.address ?? ""),
            terms: Math.trunc(toNum(String(values.paymentTermsDays))) || 30,
            creditLimit: toNum(String(values.creditLimit)),
            status: "ACTIVE",
          });
          setSaved(true);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Supplier name">
            <TextInput name="name" required placeholder="Gulf Food Distribution" />
          </Field>
          <Field label="Contact person">
            <TextInput name="contactPerson" />
          </Field>
          <Field label="Phone">
            <TextInput name="phone" />
          </Field>
          <Field label="Email">
            <TextInput name="email" type="email" />
          </Field>
          <Field label="Tax number">
            <TextInput name="taxNumber" />
          </Field>
          <Field label="Payment terms (days)">
            <NumberInput name="paymentTermsDays" defaultValue={30} />
          </Field>
          <Field label="Credit limit">
            <NumberInput name="creditLimit" defaultValue={0} />
          </Field>
        </div>
        <Field label="Address">
          <Textarea name="address" />
        </Field>
        {saved ? (
          <p className="rounded-lg bg-[#EAF8F1] px-3 py-2 text-sm font-semibold text-[#2C7A57]">
            Supplier added to the supplier list.
          </p>
        ) : null}
      </FormPanel>
    </div>
  );
}

/* -------------------------------- users --------------------------------- */

export function UsersView() {
  const tenant = useTenant();
  const { can } = useSession();
  return (
    <div>
      <ViewHeader
        title="Users"
        subtitle={`${tenant.users.length} staff accounts`}
        crumbs={[{ label: "Users & security" }, { label: "Users" }]}
        actions={
          <Link href="/roles" className={btnSoft}>
            Manage roles
          </Link>
        }
      />
      <TableCard
        title="Staff"
        columns={[
          {
            key: "name",
            label: "User",
            render: (row) => (
              <div>
                <p className="font-semibold">{row.name}</p>
                <p className="text-[11px] text-[#7A8086]">
                  {row.email} · @{row.username}
                </p>
              </div>
            ),
          },
          { key: "role", label: "Role", render: (row) => <Badge tone="purple">{row.role}</Badge> },
          {
            key: "branches",
            label: "Branches",
            render: (row) =>
              row.branches
                .map((id) => tenant.branches.find((b) => b.id === id)?.name)
                .filter(Boolean)
                .join(", ") || "All",
          },
          { key: "lastLoginAt", label: "Last login", render: (row) => timeAgo(row.lastLoginAt) },
          { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          {
            key: "access",
            label: "Panel access",
            render: (row) => (
              <span className="text-xs text-[#646B72]">
                {row.role === "Company Admin"
                  ? "All modules"
                  : row.role === "Manager"
                    ? "Operations + reports"
                    : row.role === "Cashier"
                      ? "POS + sales"
                      : "Inventory + purchasing"}
              </span>
            ),
          },
        ]}
        rows={tenant.users}
        footer={
          can("users.manage") ? (
            <p className="text-xs text-[#7A8086]">
              Passwords, PIN codes and branch access are managed by the company admin. New staff
              inherit the permissions of the role you assign.
            </p>
          ) : null
        }
      />
    </div>
  );
}

export function RolesView() {
  const tenant = useTenant();
  const groups = useMemo<PermissionGroup[]>(
    () =>
      Object.values(
        PERMISSIONS.reduce<Record<string, PermissionGroup>>((acc, permission) => {
          acc[permission.module] ??= { module: permission.module, permissions: [] };
          acc[permission.module].permissions.push({ key: permission.key, name: permission.name });
          return acc;
        }, {}),
      ),
    [],
  );
  const [selected, setSelected] = useState<Record<number, string[]>>(
    Object.fromEntries(tenant.roles.map((role) => [role.id, role.permissions])),
  );

  return (
    <div>
      <ViewHeader
        title="Roles & permissions"
        subtitle="RBAC is enforced on every screen and API call"
        crumbs={[{ label: "Users & security" }, { label: "Roles" }]}
      />
      <div className="grid gap-4 xl:grid-cols-2">
        {tenant.roles.map((role) => (
          <Card
            key={role.id}
            title={role.name}
            subtitle={`${role.description} · ${tenant.users.filter((u) => u.role === role.name).length} users`}
            actions={role.system ? <Badge tone="orange">System</Badge> : <Badge tone="blue">Custom</Badge>}
          >
            <PermissionMatrix
              groups={groups}
              selected={selected[role.id] ?? []}
              onChange={(keys) => setSelected((prev) => ({ ...prev, [role.id]: keys }))}
            />
            <button type="button" className={`${btnPrimary} mt-4`}>
              Save permissions
            </button>
          </Card>
        ))}
        <Card title="Role presets" icon="shield">
          <ul className="space-y-3">
            {ROLE_PRESETS.map((preset) => (
              <li key={preset.name} className="rounded-lg bg-[#F9FAFB] px-3 py-2.5">
                <p className="text-sm font-bold text-[#212B36]">{preset.name}</p>
                <p className="text-xs text-[#646B72]">{preset.description}</p>
                <p className="mt-1 text-[11px] font-semibold text-[#FE9F43]">
                  {preset.permissions.length} permissions
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ----------------------------- organisation ----------------------------- */

export function BranchesView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const [extra, setExtra] = useState<typeof tenant.branches>([]);
  const rows = [...extra, ...tenant.branches];
  return (
    <div>
      <ViewHeader
        title="Branches"
        subtitle={`${rows.length} retail outlets`}
        crumbs={[{ label: "Organisation" }, { label: "Branches" }]}
      />
      <Grid>
        <TableCard
          title="Branch list"
          columns={[
            {
              key: "name",
              label: "Branch",
              render: (row) => (
                <div>
                  <p className="font-semibold">{row.name}</p>
                  <p className="text-[11px] text-[#7A8086]">
                    {row.code} · {row.city}
                  </p>
                </div>
              ),
            },
            {
              key: "warehouses",
              label: "Warehouses",
              align: "right",
              render: (row) => num(tenant.warehouses.filter((w) => w.branchId === row.id).length),
            },
            {
              key: "terminals",
              label: "Terminals",
              align: "right",
              render: (row) => num(tenant.terminals.filter((t) => t.branchId === row.id).length),
            },
            {
              key: "invoices",
              label: "Invoices",
              align: "right",
              render: (row) => num(tenant.sales.filter((s) => s.branchId === row.id).length),
            },
            {
              key: "revenue",
              label: "Revenue",
              align: "right",
              render: (row) => (
                <Money
                  value={tenant.sales
                    .filter((s) => s.branchId === row.id && s.status === "COMPLETED")
                    .reduce((sum, s) => sum + s.total, 0)}
                  currency={currency}
                  strong
                />
              ),
            },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={rows}
        />
        <FormPanel
          title="Add branch"
          submitLabel="Create branch"
          onSubmit={(values) => {
            const name = String(values.branchName);
            if (!name) return;
            const code = String(values.branchCode || "").toUpperCase();
            const id = Math.max(...tenant.branches.map((b) => b.id)) + extra.length + 1;
            setExtra((prev) => [
              ...prev,
              {
                id,
                code: code || `BR-${id}`,
                name,
                city: String(values.city ?? ""),
                address: String(values.address ?? ""),
                phone: String(values.phone ?? ""),
                status: "ACTIVE",
              },
            ]);
            tenant.warehouses.push({
              id: 100000 + id,
              branchId: id,
              code: `${code || "BR"}-MAIN`,
              name: `${name} Main Warehouse`,
              type: "MAIN",
            });
          }}
        >
          <Field label="Branch name">
            <TextInput name="branchName" required placeholder="Al Wakrah Branch" />
          </Field>
          <Field label="Code">
            <TextInput name="branchCode" placeholder="WAK" />
          </Field>
          <Field label="City">
            <TextInput name="city" placeholder="Al Wakrah" />
          </Field>
          <Field label="Phone">
            <TextInput name="phone" />
          </Field>
          <Field label="Address">
            <Textarea name="address" />
          </Field>
        </FormPanel>
      </Grid>
    </div>
  );
}

export function WarehousesView() {
  const tenant = useTenant();
  return (
    <div>
      <ViewHeader title="Warehouses" crumbs={[{ label: "Organisation" }, { label: "Warehouses" }]} />
      <Grid>
        <TableCard
          title="Warehouse list"
          columns={[
            {
              key: "name",
              label: "Warehouse",
              render: (row) => (
                <div>
                  <p className="font-semibold">{row.name}</p>
                  <p className="text-[11px] text-[#7A8086]">{row.code}</p>
                </div>
              ),
            },
            {
              key: "branch",
              label: "Branch",
              render: (row) => tenant.branches.find((b) => b.id === row.branchId)?.name ?? "—",
            },
            { key: "type", label: "Type", render: (row) => <Badge tone="blue">{row.type}</Badge> },
            {
              key: "value",
              label: "Stock value",
              align: "right",
              render: (row) => (
                <Money
                  value={tenant.products.reduce((sum, p) => sum + p.stock * p.cost, 0) / tenant.warehouses.length}
                  currency={tenant.company.currency}
                />
              ),
            },
            { key: "status", label: "Status", render: (row) => <StatusBadge value="ACTIVE" /> },
          ]}
          rows={tenant.warehouses}
        />
        <Card title="Warehouse types">
          <ul className="space-y-3 text-sm text-[#646B72]">
            <li>• <b>MAIN</b> — primary stock room for a branch.</li>
            <li>• <b>COLD</b> — chilled storage for dairy, butchery and frozen lines.</li>
            <li>• <b>BACKROOM</b> — overflow used by transfers.</li>
          </ul>
        </Card>
      </Grid>
    </div>
  );
}

export function TerminalsView() {
  const tenant = useTenant();
  return (
    <div>
      <ViewHeader
        title="POS terminals"
        crumbs={[{ label: "Organisation" }, { label: "Terminals" }]}
        actions={
          <Link href="/pos" className={btnPrimary}>
            Open POS
          </Link>
        }
      />
      <Grid>
        <TableCard
          title="Terminal list"
          columns={[
            {
              key: "name",
              label: "Terminal",
              render: (row) => (
                <div>
                  <p className="font-semibold">{row.name}</p>
                  <p className="text-[11px] text-[#7A8086]">{row.code}</p>
                </div>
              ),
            },
            {
              key: "branch",
              label: "Branch",
              render: (row) => tenant.branches.find((b) => b.id === row.branchId)?.name ?? "—",
            },
            {
              key: "warehouse",
              label: "Warehouse",
              render: (row) => tenant.warehouses.find((w) => w.id === row.warehouseId)?.name ?? "—",
            },
            { key: "deviceId", label: "Device" },
            { key: "lastSyncAt", label: "Last sync", render: (row) => timeAgo(row.lastSyncAt) },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={tenant.terminals}
        />
        <Card title="Hardware profile" icon="printer">
          <ul className="space-y-3 text-sm text-[#646B72]">
            <li>• Receipt printer — thermal 80mm, ESC/POS over Bluetooth or LAN.</li>
            <li>• Barcode scanner — HID keyboard wedge, supports GS1 and weight barcodes.</li>
            <li>• Cash drawer — triggered by the printer kick-out port.</li>
            <li>• Customer display — shows the running total and loyalty points.</li>
            <li>• Weight scale — serial/RS-232 for weighed produce lines.</li>
          </ul>
        </Card>
      </Grid>
      <div className="mt-4">
        <Card title="Registered devices" icon="phone">
          <TableCard
            title=""
            columns={[
              {
                key: "name",
                label: "Device",
                render: (row) => (
                  <div>
                    <p className="font-semibold">{row.name}</p>
                    <p className="font-mono text-[11px] text-[#7A8086]">{row.deviceId}</p>
                  </div>
                ),
              },
              { key: "platform", label: "Platform" },
              { key: "appVersion", label: "App" },
              { key: "hardware", label: "Hardware" },
              { key: "lastSyncAt", label: "Last seen", render: (row) => timeAgo(row.lastSyncAt) },
              { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
            ]}
            rows={tenant.devices}
          />
        </Card>
      </div>
    </div>
  );
}

/* ---------------------- settings / subscription ------------------------- */

export function SettingsView() {
  const tenant = useTenant();
  const [settings, setSettings] = useState(tenant.settings);
  const keys = Object.keys(settings);
  return (
    <div>
      <ViewHeader
        title="Company settings"
        subtitle="Receipts, stock rules and defaults for every terminal"
        crumbs={[{ label: "Settings" }]}
      />
      <Grid>
        <FormPanel
          title="Configuration"
          submitLabel="Save settings"
          onSubmit={(values) =>
            setSettings((prev) => {
              const next = { ...prev };
              keys.forEach((key) => {
                const value = values[`setting_${key}`];
                if (typeof value === "string") next[key] = value;
                if (typeof value === "boolean") next[key] = value ? "true" : "false";
              });
              return next;
            })
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Invoice prefix">
              <TextInput name="setting_invoice_prefix" defaultValue={settings.invoice_prefix} />
            </Field>
            <Field label="Decimal places">
              <TextInput name="setting_decimal_places" defaultValue={settings.decimal_places} />
            </Field>
            <Field label="Default tax (%)">
              <TextInput name="setting_default_tax" defaultValue={settings.default_tax} />
            </Field>
            <Field label="Loyalty points per currency">
              <TextInput
                name="setting_loyalty_points_per_currency"
                defaultValue={settings.loyalty_points_per_currency}
              />
            </Field>
            <Field label="Receipt header">
              <Textarea name="setting_receipt_header" defaultValue={settings.receipt_header} />
            </Field>
            <Field label="Receipt footer">
              <Textarea name="setting_receipt_footer" defaultValue={settings.receipt_footer} />
            </Field>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            <Checkbox
              name="setting_allow_credit_sales"
              label="Allow credit sales"
              defaultChecked={settings.allow_credit_sales === "true"}
            />
            <Checkbox
              name="setting_allow_negative_stock"
              label="Allow negative stock"
              defaultChecked={settings.allow_negative_stock === "true"}
            />
          </div>
        </FormPanel>
        <Card title="Company">
          <KeyValue
            items={[
              { label: "Company name", value: tenant.company.name },
              { label: "Legal name", value: tenant.company.legalName },
              { label: "Company code", value: tenant.company.code },
              { label: "Email", value: tenant.company.email },
              { label: "Phone", value: tenant.company.phone },
              { label: "Currency", value: tenant.company.currency },
              { label: "Timezone", value: tenant.company.timezone },
              { label: "Country / city", value: `${tenant.company.country} · ${tenant.company.city}` },
              { label: "Tax number", value: "TN-482910" },
              { label: "Status", value: <StatusBadge value={tenant.company.status} /> },
            ]}
          />
        </Card>
      </Grid>
      <div className="mt-4">
        <Card title="Receipt preview" icon="receipt">
          <div className="mx-auto max-w-xs rounded-lg border border-dashed border-[#D3D5D7] bg-white p-4 font-mono text-[11px] text-[#212B36]">
            <p className="whitespace-pre-line text-center font-bold">{settings.receipt_header}</p>
            <p className="my-2 border-t border-dashed border-[#D3D5D7]" />
            <div className="flex justify-between">
              <span>Milk 1L</span>
              <span>5.50</span>
            </div>
            <div className="flex justify-between">
              <span>Bread 600g</span>
              <span>4.00</span>
            </div>
            <p className="my-2 border-t border-dashed border-[#D3D5D7]" />
            <div className="flex justify-between font-bold">
              <span>TOTAL</span>
              <span>9.50</span>
            </div>
            <p className="mt-2 text-center">VAT 0% · CASH</p>
            <p className="my-2 border-t border-dashed border-[#D3D5D7]" />
            <p className="whitespace-pre-line text-center">{settings.receipt_footer}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function SubscriptionView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const plan = plans.find((p) => p.id === tenant.subscription.planId)!;
  const counters = [
    { label: "Products", used: tenant.products.length, limit: plan.maxProducts },
    { label: "Users", used: tenant.users.length, limit: plan.maxUsers },
    { label: "Branches", used: tenant.branches.length, limit: plan.maxBranches },
    { label: "Warehouses", used: tenant.warehouses.length, limit: plan.maxWarehouses },
    { label: "POS terminals", used: tenant.terminals.length, limit: plan.maxTerminals },
  ];
  return (
    <div>
      <ViewHeader
        title="Subscription & billing"
        subtitle={`Current plan: ${plan.name}`}
        crumbs={[{ label: "Subscription" }]}
        actions={
          <Link href="/support" className={btnSoft}>
            Contact platform support
          </Link>
        }
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Plan" value={plan.name} icon="award" tone="orange" />
        <StatCard label="Status" value={tenant.subscription.status} icon="check" tone="green" />
        <StatCard
          label="Amount"
          value={money(tenant.subscription.amount, tenant.company.currency)}
          icon="dollar"
          tone="blue"
        />
        <StatCard label="Renews on" value={dateShort(tenant.subscription.endDate)} icon="calendar" tone="purple" />
      </div>
      <Grid>
        <Card title="Plan usage">
          <div className="space-y-4">
            {counters.map((counter) => (
              <div key={counter.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-[#212B36]">{counter.label}</span>
                  <span className="text-[#646B72]">
                    {counter.used} / {counter.limit}
                  </span>
                </div>
                <ProgressBar value={(counter.used / counter.limit) * 100} />
              </div>
            ))}
          </div>
        </Card>
        <Card title="Plan details">
          <KeyValue
            items={[
              { label: "Plan code", value: plan.code },
              { label: "Billing cycle", value: tenant.subscription.cycle },
              { label: "Monthly price", value: money(plan.monthlyPrice, plan.currency) },
              { label: "Yearly price", value: money(plan.yearlyPrice, plan.currency) },
              { label: "Trial length", value: `${plan.trialDays} days` },
              { label: "Storage", value: `${plan.storageLimitMb} MB` },
              { label: "Auto renew", value: tenant.subscription.autoRenew ? "Yes" : "No" },
              { label: "Started", value: dateShort(tenant.subscription.startDate) },
            ]}
          />
          <p className="mt-4 rounded-lg bg-[#FFF6EE] px-3 py-2 text-xs text-[#B4661A]">
            Upgrade requests are handled by the platform team — raise a ticket from the support page.
          </p>
        </Card>
      </Grid>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {plans.map((option) => (
          <Card
            key={option.id}
            title={option.name}
            subtitle={option.code}
            actions={option.id === plan.id ? <Badge tone="green">Current</Badge> : null}
          >
            <p className="text-3xl font-bold text-[#212B36]">
              {money(option.monthlyPrice, option.currency)}
              <span className="text-sm font-medium text-[#7A8086]">/mo</span>
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-[#646B72]">
              <li>• {option.maxUsers} users</li>
              <li>• {option.maxBranches} branches · {option.maxWarehouses} warehouses</li>
              <li>• {option.maxTerminals} terminals</li>
              <li>• {option.maxProducts} products</li>
            </ul>
            <Link
              href="/support"
              className={`${option.id === plan.id ? btnSoft : btnPrimary} mt-4 w-full justify-center`}
            >
              {option.id === plan.id ? "Current plan" : `Request ${option.name}`}
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function DevicesView() {
  const tenant = useTenant();
  const tokens = apiTokens.filter((token) => token.companyId === tenant.company.id);
  return (
    <div>
      <ViewHeader
        title="API & devices"
        subtitle="Flutter POS devices and their access tokens"
        crumbs={[{ label: "Settings" }, { label: "API & devices" }]}
      />
      <Grid>
        <TableCard
          title="Devices"
          columns={[
            {
              key: "name",
              label: "Device",
              render: (row) => (
                <div>
                  <p className="font-semibold">{row.name}</p>
                  <p className="font-mono text-[11px] text-[#7A8086]">{row.deviceId}</p>
                </div>
              ),
            },
            { key: "platform", label: "Platform" },
            { key: "appVersion", label: "App" },
            {
              key: "branch",
              label: "Branch",
              render: (row) => tenant.branches.find((b) => b.id === row.branchId)?.name ?? "—",
            },
            { key: "lastSyncAt", label: "Last sync", render: (row) => timeAgo(row.lastSyncAt) },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={tenant.devices}
        />
        <Card title="Access tokens" icon="key">
          {tokens.length === 0 ? (
            <p className="text-sm text-[#7A8086]">No API tokens issued yet.</p>
          ) : (
            <div className="space-y-3">
              {tokens.map((token) => (
                <div key={token.id} className="rounded-lg border border-[#E6EAED] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{token.name}</p>
                    <StatusBadge value="ACTIVE" />
                  </div>
                  <p className="mt-1 break-all rounded-md bg-[#F9FAFB] px-2 py-1 font-mono text-[11px] text-[#646B72]">
                    Bearer {token.token}
                  </p>
                  <p className="mt-1 text-[11px] text-[#7A8086]">
                    Abilities: {token.abilities.join(", ")} · last used {timeAgo(token.lastUsedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </Grid>
      <div className="mt-4">
        <Card title="Sync endpoint" icon="server">
          <KeyValue
            columns={3}
            items={[
              { label: "Catalogue sync", value: "GET /api/v1/products" },
              { label: "Sales sync", value: "POST /api/v1/sales" },
              { label: "Heartbeat", value: "POST /api/v1/products" },
              { label: "Auth", value: "Bearer token" },
              { label: "Idempotency", value: "uuid + invoice no" },
              { label: "Conflict policy", value: "server wins" },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}

const daysAgoIso = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

export function SupportView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const [tickets, setTickets] = useState(
    tenant.company.id === 1
      ? [
          {
            id: 1,
            no: "TKT-0001",
            subject: "Receipt printer not printing after update",
            category: "HARDWARE",
            priority: "HIGH",
            status: "IN_PROGRESS",
            createdAt: daysAgoIso(3),
          },
          {
            id: 2,
            no: "TKT-0004",
            subject: "Add Arabic to receipt header",
            category: "FEATURE",
            priority: "LOW",
            status: "RESOLVED",
            createdAt: daysAgoIso(9),
          },
        ]
      : [
          {
            id: 3,
            no: "TKT-0002",
            subject: "Trial expiring — need card update",
            category: "BILLING",
            priority: "MEDIUM",
            status: "OPEN",
            createdAt: daysAgoIso(2),
          },
        ],
  );
  return (
    <div>
      <ViewHeader
        title="Platform support"
        subtitle="Talk to the team that runs the platform"
        crumbs={[{ label: "Support" }]}
      />
      <Grid>
        <TableCard
          title="Your tickets"
          columns={[
            { key: "no", label: "Ticket" },
            { key: "subject", label: "Subject" },
            { key: "category", label: "Category" },
            { key: "priority", label: "Priority", render: (row) => <StatusBadge value={row.priority} /> },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
            { key: "createdAt", label: "Opened", render: (row) => dateShort(row.createdAt) },
          ]}
          rows={tickets}
        />
        <FormPanel
          title="Open a ticket"
          submitLabel="Submit ticket"
          onSubmit={(values) => {
            const subject = String(values.subject);
            if (!subject) return;
            setTickets((prev) => [
              {
                id: prev.length + 10,
                no: `TKT-${String(prev.length + 10).padStart(4, "0")}`,
                subject,
                category: String(values.category || "GENERAL"),
                priority: String(values.priority || "MEDIUM"),
                status: "OPEN",
                createdAt: new Date(),
              },
              ...prev,
            ]);
          }}
        >
          <Field label="Subject">
            <TextInput name="subject" required placeholder="Receipt printer not printing" />
          </Field>
          <Field label="Category">
            <SelectInput
              name="category"
              defaultValue="GENERAL"
              options={[
                { value: "GENERAL", label: "General" },
                { value: "BILLING", label: "Billing" },
                { value: "HARDWARE", label: "Hardware" },
                { value: "SYNC", label: "Sync / offline" },
                { value: "FEATURE", label: "Feature request" },
              ]}
            />
          </Field>
          <Field label="Priority">
            <SelectInput
              name="priority"
              defaultValue="MEDIUM"
              options={[
                { value: "LOW", label: "Low" },
                { value: "MEDIUM", label: "Medium" },
                { value: "HIGH", label: "High" },
                { value: "URGENT", label: "Urgent" },
              ]}
            />
          </Field>
          <Field label="Message">
            <Textarea name="body" required placeholder="Describe the issue, device and app version" />
          </Field>
          <p className="text-[11px] text-[#7A8086]">
            Tickets are routed to the platform support queue with your company and app version
            attached · {tenant.company.name}
          </p>
        </FormPanel>
      </Grid>
      <div className="mt-4">
        <Card title="Payment methods available at your terminals" icon="card">
          <div className="grid gap-3 sm:grid-cols-4">
            {paymentMethodsFor(tenant.company.id).map((method) => (
              <div key={method.code} className="rounded-lg bg-[#F9FAFB] p-3 text-center">
                <p className="text-sm font-bold text-[#212B36]">{method.name}</p>
                <p className="text-[11px] text-[#7A8086]">{method.type}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[#7A8086]">
            Mixed payments (cash + card) and customer credit are supported on every terminal
            · currency {currency}
          </p>
        </Card>
      </div>
    </div>
  );
}

export function NotificationsView() {
  const tenant = useTenant();
  return (
    <div>
      <ViewHeader title="Notifications" crumbs={[{ label: "Settings" }, { label: "Notifications" }]} />
      <Card title="Recent activity">
        <ul className="space-y-3">
          {tenant.notifications.map((notification) => (
            <li key={notification.id} className="flex items-start justify-between gap-3 rounded-lg bg-[#F9FAFB] px-3 py-2.5">
              <div>
                <p className="text-sm font-semibold text-[#212B36]">{notification.title}</p>
                <p className="text-xs text-[#646B72]">{notification.message}</p>
              </div>
              <div className="shrink-0 text-right">
                <Badge tone="orange">{notification.type.replace("_", " ")}</Badge>
                <p className="mt-1 text-[11px] text-[#7A8086]">{timeAgo(notification.date)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* -------------------------------- reports -------------------------------- */

export function SalesReportView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const daily = dailySalesSeries(tenant, 30);
  const totals = totalsFor(tenant, 30);
  const mix = paymentMix(tenant, 30);
  const cats = categorySales(tenant, 30);
  const cashiers = cashierPerformance(tenant, 30);
  const recent = tenant.sales.slice(0, 8);
  const colors = ["#FE9F43", "#092C4C", "#0984E3", "#6C5CE7", "#009688"];

  return (
    <div>
      <ViewHeader
        title="Sales report"
        subtitle="Revenue, payment mix and cashier performance for the last 30 days"
        crumbs={[{ label: "Reports" }, { label: "Sales" }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={`${currency} ${num(totals.revenue)}`} icon="dollar" tone="green" />
        <StatCard label="Gross profit" value={`${currency} ${num(totals.profit)}`} icon="up" tone="purple" />
        <StatCard label="Margin" value={`${num(totals.margin, 1)}%`} icon="percent" tone="orange" />
        <StatCard label="Invoices" value={num(totals.count)} icon="receipt" tone="blue" />
      </div>
      <Grid>
        <Card title="Daily revenue" icon="chart">
          <AreaChart data={daily.map((d) => ({ label: d.label, value: d.value }))} />
        </Card>
        <Card title="Payment mix" icon="card">
          <Donut
            slices={mix.map((m, i) => ({ label: m.method, value: m.total, color: colors[i % colors.length] }))}
            centerValue={`${currency} ${num(mix.reduce((sum, m) => sum + m.total, 0))}`}
            centerLabel="Collected"
          />
        </Card>
      </Grid>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Sales by category" icon="pie">
          <HorizontalBars data={cats} color="#FE9F43" formatValue={(v) => `${currency} ${num(v)}`} />
        </Card>
        <Card title="Cashier performance" icon="users">
          <HorizontalBars
            data={cashiers.slice(0, 6).map((c) => ({ label: c.label, value: c.value }))}
            color="#092C4C"
            formatValue={(v) => `${currency} ${num(v)}`}
          />
        </Card>
      </div>
      <div className="mt-4">
        <Card title="Latest invoices">
          <TableCard
            title=""
            rowHref={(row) => `/sales/${row.id}`}
            columns={[
              { key: "invoiceNo", label: "Invoice" },
              { key: "date", label: "Date", render: (row) => dateShort(row.date) },
              {
                key: "customer",
                label: "Customer",
                render: (row) =>
                  row.customerId ? tenant.customers.find((c) => c.id === row.customerId)?.name ?? "Walk-in" : "Walk-in",
              },
              {
                key: "total",
                label: "Total",
                align: "right",
                render: (row) => <Money value={row.total} currency={currency} strong />,
              },
              { key: "paymentStatus", label: "Payment", render: (row) => <StatusBadge value={row.paymentStatus} /> },
            ]}
            rows={recent}
          />
        </Card>
      </div>
    </div>
  );
}

export function ProfitReportView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const daily = dailySalesSeries(tenant, 30);
  const totals = totalsFor(tenant, 30);
  const top = topProducts(tenant, 8, 30);
  return (
    <div>
      <ViewHeader
        title="Profit & loss"
        subtitle="Revenue less cost of goods sold"
        crumbs={[{ label: "Reports" }, { label: "Profit" }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={`${currency} ${num(totals.revenue)}`} icon="dollar" tone="green" />
        <StatCard label="COGS" value={`${currency} ${num(totals.cost)}`} icon="box" tone="orange" />
        <StatCard label="Gross profit" value={`${currency} ${num(totals.profit)}`} icon="up" tone="purple" />
        <StatCard label="Margin" value={`${num(totals.margin, 1)}%`} icon="percent" tone="blue" />
      </div>
      <Grid>
        <Card title="Profit trend" icon="chart">
          <AreaChart data={daily.map((d) => ({ label: d.label, value: d.profit }))} color="#6C5CE7" />
        </Card>
        <Card title="Most profitable products" icon="award">
          <HorizontalBars
            data={top.map((p) => ({ label: p.name, value: p.profit }))}
            color="#3EB780"
            formatValue={(v) => `${currency} ${num(v)}`}
          />
        </Card>
      </Grid>
      <div className="mt-4">
        <Card title="Product profitability">
          <TableCard
            title=""
            rowHref={(row) => `/products/${row.productId}`}
            columns={[
              { key: "name", label: "Product", render: (row) => <span className="font-semibold">{row.name}</span> },
              { key: "qty", label: "Units sold", align: "right", render: (row) => num(row.qty) },
              {
                key: "revenue",
                label: "Revenue",
                align: "right",
                render: (row) => <Money value={row.revenue} currency={currency} strong />,
              },
              {
                key: "profit",
                label: "Profit",
                align: "right",
                render: (row) => <Money value={row.profit} currency={currency} />,
              },
              {
                key: "margin",
                label: "Margin",
                align: "right",
                render: (row) => `${num(row.revenue ? (row.profit / row.revenue) * 100 : 0, 1)}%`,
              },
            ]}
            rows={top}
          />
        </Card>
      </div>
    </div>
  );
}

export function ProductReportView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const top = topProducts(tenant, 20, 30);
  const low = lowStock(tenant);
  return (
    <div>
      <ViewHeader
        title="Product report"
        subtitle="Best sellers and stock alerts"
        crumbs={[{ label: "Reports" }, { label: "Products" }]}
      />
      <Grid>
        <Card title="Top sellers" icon="award">
          <BarSeries
            data={top.slice(0, 8).map((p) => ({ label: p.name.slice(0, 12), value: p.qty }))}
            color="#FE9F43"
            formatValue={(v) => `${num(v)} units`}
          />
        </Card>
        <Card title="Revenue leaderboard" icon="chart">
          <HorizontalBars
            data={top.map((p) => ({ label: p.name, value: p.revenue }))}
            color="#092C4C"
            formatValue={(v) => `${currency} ${num(v)}`}
          />
        </Card>
      </Grid>
      <div className="mt-4">
        <TableCard
          title="Product performance"
          rowHref={(row) => `/products/${row.productId}`}
          columns={[
            { key: "name", label: "Product", render: (row) => <span className="font-semibold">{row.name}</span> },
            { key: "qty", label: "Units sold", align: "right", render: (row) => num(row.qty) },
            {
              key: "revenue",
              label: "Revenue",
              align: "right",
              render: (row) => <Money value={row.revenue} currency={currency} strong />,
            },
            {
              key: "profit",
              label: "Profit",
              align: "right",
              render: (row) => <Money value={row.profit} currency={currency} />,
            },
          ]}
          rows={top}
        />
      </div>
      <div className="mt-4">
        <TableCard
          title="Stock alerts"
          rowHref={(row) => `/products/${row.id}`}
          columns={[
            { key: "name", label: "Product" },
            { key: "sku", label: "SKU" },
            { key: "reorderLevel", label: "Reorder level", align: "right", render: (row) => num(row.reorderLevel) },
            { key: "stock", label: "On hand", align: "right", render: (row) => num(row.stock) },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={low}
          emptyTitle="No low stock products"
        />
      </div>
    </div>
  );
}

export function ZReportView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const shifts = tenant.shifts.slice(0, 14);
  const totals = totalsFor(tenant, 1);
  const mix = paymentMix(tenant, 1);
  const colors = ["#FE9F43", "#092C4C", "#0984E3", "#6C5CE7"];
  return (
    <div>
      <ViewHeader
        title="Z report"
        subtitle="End of day summary per shift"
        crumbs={[{ label: "Reports" }, { label: "Z report" }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's sales" value={`${currency} ${num(totals.revenue)}`} icon="dollar" tone="green" />
        <StatCard label="Invoices today" value={num(totals.count)} icon="receipt" tone="orange" />
        <StatCard label="Gross profit" value={`${currency} ${num(totals.profit)}`} icon="up" tone="purple" />
        <StatCard label="Tax collected" value={`${currency} ${num(totals.tax)}`} icon="percent" tone="blue" />
      </div>
      <Grid>
        <Card title="Payment breakdown (today)">
          <Donut
            slices={mix.map((m, i) => ({ label: m.method, value: m.total, color: colors[i % colors.length] }))}
            centerValue={`${currency} ${num(mix.reduce((sum, m) => sum + m.total, 0))}`}
            centerLabel="Collected today"
          />
        </Card>
        <Card title="Recent shifts">
          <TableCard
            title=""
            columns={[
              { key: "no", label: "Shift" },
              { key: "openedAt", label: "Opened", render: (row) => dateShort(row.openedAt) },
              {
                key: "totalSales",
                label: "Sales",
                align: "right",
                render: (row) => <Money value={row.totalSales} currency={currency} strong />,
              },
              {
                key: "variance",
                label: "Cash variance",
                align: "right",
                render: (row) => (
                  <Money value={row.countedCash - (row.openingCash + row.cashSales)} currency={currency} />
                ),
              },
              { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
            ]}
            rows={shifts}
          />
        </Card>
      </Grid>
      <div className="mt-4">
        <Card title="Stock snapshot" icon="box">
          <KeyValue
            columns={3}
            items={[
              { label: "Stock value", value: `${currency} ${num(stockValue(tenant))}` },
              { label: "Products", value: num(tenant.products.length) },
              { label: "Below reorder", value: num(lowStock(tenant).length) },
              { label: "Warehouses", value: num(tenant.warehouses.length) },
              { label: "Ledger entries", value: num(tenant.ledger.length) },
              { label: "Suppliers", value: num(tenant.suppliers.length) },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}

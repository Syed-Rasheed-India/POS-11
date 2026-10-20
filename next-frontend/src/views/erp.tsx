"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Card, KeyValue, ProgressBar, SectionTitle, StatCard, Tabs } from "@/components/ui";
import { Checkbox, Field, NumberInput, SelectInput, TextInput, Textarea, btnPrimary, btnSoft } from "@/components/ui";
import { HorizontalBars } from "@/components/charts";
import { Grid, FormPanel, Money, Qty, StatusBadge, TableCard, ViewHeader } from "./parts";
import { useSession, useTenant } from "@/lib/session";
import {
  APPROVAL_REQUESTS,
  APPROVAL_WORKFLOWS,
  CHART_OF_ACCOUNTS,
  COSTING_METHODS,
  ERP_MODULES,
  EVENTS,
  INTEGRATIONS,
  LOYALTY_MEMBERS,
  LOYALTY_PROGRAM,
  MODULE_ACCOUNT_MAPPING,
  MODULE_STATUS_TONE,
  PRODUCT_TYPES,
  RECIPES,
  RESTAURANT_KOTS,
  RESTAURANT_MENU,
  RESTAURANT_TABLES,
  WAREHOUSE_TYPES,
  journalEntries,
  modulesForCompany,
  numberSeries,
  warehouseLocations,
} from "@/lib/erp-data";
import { dateShort, num, timeAgo, toNum } from "@/lib/format";

/* ------------------------------- modules ------------------------------- */

export function ModulesView() {
  const tenant = useTenant();
  const { can } = useSession();
  const [extraEnabled, setExtraEnabled] = useState<string[]>([]);
  const modules = modulesForCompany(tenant.company.id).map((module) =>
    extraEnabled.includes(module.key) ? { ...module, enabled: true, blocked: false } : module,
  );
  const enabled = modules.filter((m) => m.enabled);
  const grouped = ["CORE", "RETAIL", "RESTAURANT", "FINANCE", "HR", "CRM", "COMMERCE", "OPS", "PLATFORM"].map(
    (category) => ({
      category,
      items: modules.filter((m) => m.category === category),
    }),
  );

  return (
    <div>
      <ViewHeader
        title="Modules"
        subtitle={`${enabled.length} of ${ERP_MODULES.length} ERP modules active for ${tenant.company.name}`}
        crumbs={[{ label: "ERP Core" }, { label: "Modules" }]}
        actions={
          <Link href="/super-admin/blueprint" className={btnSoft}>
            View ERP blueprint
          </Link>
        }
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active modules" value={num(enabled.length)} icon="layers" tone="green" />
        <StatCard
          label="Core tables"
          value={num(enabled.reduce((sum, m) => sum + m.tables, 0))}
          icon="database"
          tone="blue"
        />
        <StatCard
          label="In beta"
          value={num(enabled.filter((m) => m.status === "BETA").length)}
          icon="activity"
          tone="orange"
        />
        <StatCard
          label="Roadmap"
          value={num(ERP_MODULES.length - enabled.length)}
          sub="available on higher plans"
          icon="clock"
          tone="gray"
        />
      </div>

      {grouped.map((group) =>
        group.items.length === 0 ? null : (
          <div key={group.category} className="mb-4">
            <SectionTitle hint={`${group.items.filter((i) => i.enabled).length}/${group.items.length} active`}>
              {group.category}
            </SectionTitle>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.items.map((module) => (
                <Card
                  key={module.key}
                  title={module.name}
                  subtitle={`Phase ${module.phase} · ${module.tables} tables`}
                  actions={<StatusBadge value={module.enabled ? module.status : "ROADMAP"} />}
                >
                  <p className="text-sm text-[#646B72]">{module.description}</p>
                  {module.dependencies.length > 0 ? (
                    <p className="mt-2 text-[11px] text-[#7A8086]">
                      Depends on:{" "}
                      {module.dependencies
                        .map((dep) => ERP_MODULES.find((m) => m.key === dep)?.name ?? dep)
                        .join(", ")}
                    </p>
                  ) : (
                    <p className="mt-2 text-[11px] text-[#7A8086]">No dependencies — foundation module</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {module.screens.slice(0, 4).map((screen) => (
                      <span
                        key={screen}
                        className="rounded-full bg-[#F1F3F5] px-2 py-0.5 text-[10px] font-semibold text-[#646B72]"
                      >
                        {screen}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[#E6EAED] pt-3">
                    <span
                      className={
                        module.enabled
                          ? "text-xs font-bold text-[#3EB780]"
                          : "text-xs font-bold text-[#7A8086]"
                      }
                    >
                      {module.enabled ? "Enabled" : "Not enabled"}
                    </span>
                    {can("settings.manage") ? (
                      <button
                        type="button"
                        onClick={() =>
                          setExtraEnabled((prev) =>
                            prev.includes(module.key)
                              ? prev.filter((k) => k !== module.key)
                              : [...prev, module.key],
                          )
                        }
                        className="text-xs font-bold text-[#FE9F43]"
                      >
                        {module.enabled ? "Disable" : "Enable"}
                      </button>
                    ) : null}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ),
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Product types available to every module" icon="box">
          <TableCard
            title=""
            columns={[
              { key: "name", label: "Type" },
              { key: "key", label: "Code", render: (row) => <span className="font-mono text-[11px]">{row.key}</span> },
              { key: "used", label: "Used by" },
            ]}
            rows={PRODUCT_TYPES}
          />
        </Card>
        <Card title="Costing methods" icon="dollar">
          <div className="space-y-3">
            {COSTING_METHODS.map((method) => (
              <div key={method.key} className="rounded-lg bg-[#F9FAFB] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[#212B36]">{method.name}</p>
                  <Badge tone={method.key === "AVG" ? "green" : "gray"}>{method.key}</Badge>
                </div>
                <p className="mt-1 text-xs text-[#646B72]">{method.detail}</p>
                <p className="mt-1 text-[11px] text-[#7A8086]">Best for: {method.best}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------- warehouse map ---------------------------- */

export function LocationsView() {
  const tenant = useTenant();
  const rows = warehouseLocations(tenant.company.id);
  const zones = [...new Set(rows.map((r) => r.zone))];
  const totalQty = rows.reduce((sum, r) => sum + r.qty, 0);

  return (
    <div>
      <ViewHeader
        title="Warehouse locations"
        subtitle="Zone → rack → shelf → bin, independent of the branch that owns the store"
        crumbs={[{ label: "ERP Core" }, { label: "Locations" }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Warehouses" value={num(tenant.warehouses.length)} icon="warehouse" tone="blue" />
        <StatCard label="Zones" value={num(zones.length)} icon="layers" tone="orange" />
        <StatCard label="Bins in use" value={num(rows.length)} icon="barcode" tone="purple" />
        <StatCard label="Units mapped" value={num(totalQty)} icon="box" tone="green" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Warehouse types supported" icon="warehouse">
          <ul className="space-y-2.5">
            {WAREHOUSE_TYPES.map((type) => (
              <li key={type.key} className="rounded-lg bg-[#F9FAFB] px-3 py-2">
                <p className="text-sm font-bold text-[#212B36]">{type.name}</p>
                <p className="text-[11px] text-[#646B72]">{type.note}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Stock per zone" icon="chart" className="lg:col-span-2">
          <HorizontalBars
            data={zones.map((zone) => ({
              label: zone,
              value: rows.filter((r) => r.zone === zone).reduce((sum, r) => sum + r.qty, 0),
            }))}
            color="#092C4C"
            formatValue={(v) => `${num(v)} units`}
          />
        </Card>
      </div>

      <div className="mt-4">
        <TableCard
          title="Location map"
          columns={[
            { key: "zone", label: "Zone" },
            { key: "rack", label: "Rack" },
            { key: "shelf", label: "Shelf" },
            { key: "bin", label: "Bin", render: (row) => <span className="font-mono text-xs">{row.bin}</span> },
            { key: "product", label: "Product" },
            { key: "qty", label: "Qty", align: "right", render: (row) => <Qty value={row.qty} /> },
            { key: "type", label: "Bin type", render: (row) => <Badge tone={row.type === "QUARANTINE" ? "red" : "blue"}>{row.type}</Badge> },
          ]}
          rows={rows}
        />
      </div>
    </div>
  );
}

/* --------------------------- number series ---------------------------- */

export function NumberSeriesView() {
  const tenant = useTenant();
  const rows = numberSeries(tenant.company.id, tenant.branches.map((b) => b.name));
  return (
    <div>
      <ViewHeader
        title="Document number series"
        subtitle="Every module draws numbers from one engine — prefixes can differ per branch"
        crumbs={[{ label: "ERP Core" }, { label: "Number series" }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Document types" value={num(new Set(rows.map((r) => r.document)).size)} icon="file" tone="orange" />
        <StatCard label="Series" value={num(rows.length)} icon="list" tone="blue" />
        <StatCard label="Branches" value={num(tenant.branches.length)} icon="pin" tone="purple" />
      </div>
      <TableCard
        title="Series"
        columns={[
          { key: "document", label: "Document" },
          { key: "branch", label: "Branch" },
          { key: "prefix", label: "Prefix", render: (row) => <span className="font-mono text-xs">{row.prefix}</span> },
          { key: "next", label: "Next number", align: "right", render: (row) => num(row.next) },
          { key: "padding", label: "Padding", align: "right", render: (row) => row.padding },
          { key: "reset", label: "Reset" },
        ]}
        rows={rows}
        footer={
          <p className="text-xs text-[#7A8086]">
            Example: {rows[0]?.prefix}-{String(rows[0]?.next ?? 0).padStart(6, "0")} — a new branch gets its own
            sequence so invoices stay traceable per outlet.
          </p>
        }
      />
    </div>
  );
}

/* ----------------------------- accounting ----------------------------- */

export function AccountingView({ tab }: { tab: string }) {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const journal = journalEntries(tenant.company.id);
  const totals = (type: string) =>
    CHART_OF_ACCOUNTS.filter((a) => a.type === type).reduce((sum, a) => sum + a.balance, 0);
  const revenue = totals("REVENUE");
  const expenses = totals("EXPENSE");
  const assets = totals("ASSET");

  return (
    <div>
      <ViewHeader
        title="Accounting"
        subtitle="Central ERP service — every module posts here"
        crumbs={[{ label: "Finance" }, { label: "Accounting" }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue (YTD)" value={`${currency} ${num(revenue)}`} icon="dollar" tone="green" />
        <StatCard label="Expenses (YTD)" value={`${currency} ${num(expenses)}`} icon="card" tone="orange" />
        <StatCard label="Net result" value={`${currency} ${num(revenue - expenses)}`} icon="up" tone="purple" />
        <StatCard label="Total assets" value={`${currency} ${num(assets)}`} icon="building" tone="blue" />
      </div>
      <Tabs
        baseHref="/accounting"
        active={tab}
        tabs={[
          { key: "chart", label: "Chart of accounts" },
          { key: "journal", label: "Journal" },
          { key: "mapping", label: "Module mapping" },
        ]}
      />

      {tab === "journal" ? (
        <TableCard
          title="Journal entries"
          subtitle="Generated from POS, purchasing, inventory and AR/AP events"
          columns={[
            { key: "entry", label: "Entry" },
            { key: "date", label: "Date", render: (row) => dateShort(row.date) },
            { key: "source", label: "Source module", render: (row) => <Badge tone="blue">{row.source}</Badge> },
            { key: "reference", label: "Reference" },
            { key: "account", label: "Account" },
            {
              key: "debit",
              label: "Debit",
              align: "right",
              render: (row) => (row.debit ? <Money value={row.debit} currency={currency} strong /> : "—"),
            },
            {
              key: "credit",
              label: "Credit",
              align: "right",
              render: (row) => (row.credit ? <Money value={row.credit} currency={currency} strong /> : "—"),
            },
            { key: "narration", label: "Narration", render: (row) => row.narration },
          ]}
          rows={journal}
          footer={
            <p className="text-xs text-[#7A8086]">
              Every posting is balanced and linked to its source document — drill from an invoice to the GL and back.
            </p>
          }
        />
      ) : tab === "mapping" ? (
        <TableCard
          title="Module → account mapping"
          subtitle="Configure once; every future module posts through the same rules"
          columns={[
            { key: "module", label: "Module", render: (row) => <span className="font-semibold">{row.module}</span> },
            { key: "event", label: "Trigger" },
            { key: "debit", label: "Debit" },
            { key: "credit", label: "Credit" },
            { key: "extra", label: "Additional effect" },
          ]}
          rows={MODULE_ACCOUNT_MAPPING}
        />
      ) : (
        <Grid>
          <Card title="Chart of accounts">
            <TableCard
              title=""
              columns={[
                { key: "code", label: "Code", render: (row) => <span className="font-mono text-xs">{row.code}</span> },
                { key: "name", label: "Account" },
                { key: "type", label: "Type", render: (row) => <Badge tone={row.type === "REVENUE" ? "green" : row.type === "EXPENSE" ? "orange" : "blue"}>{row.type}</Badge> },
                {
                  key: "balance",
                  label: "Balance",
                  align: "right",
                  render: (row) => <Money value={row.balance} currency={currency} strong />,
                },
              ]}
              rows={CHART_OF_ACCOUNTS}
            />
          </Card>
          <Card title="Balance summary" icon="chart">
            <HorizontalBars
              data={[
                { label: "Assets", value: assets },
                { label: "Liabilities", value: totals("LIABILITY") },
                { label: "Equity", value: totals("EQUITY") },
                { label: "Revenue", value: revenue },
                { label: "Expenses", value: expenses },
              ]}
              color="#FE9F43"
              formatValue={(v) => `${currency} ${num(v)}`}
            />
            <div className="mt-4 border-t border-[#E6EAED] pt-4">
              <KeyValue
                items={[
                  { label: "Costing method", value: "Weighted average (AVG)" },
                  { label: "Fiscal year", value: "01 Jan – 31 Dec" },
                  { label: "Base currency", value: tenant.company.currency },
                  { label: "Tax authority", value: "Qatar GTAAR" },
                ]}
              />
            </div>
          </Card>
        </Grid>
      )}
    </div>
  );
}

/* ------------------------------ approvals ------------------------------ */

export function ApprovalsView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const [decided, setDecided] = useState<Record<string, string>>({});
  const pending = APPROVAL_REQUESTS.filter((r) => r.status === "PENDING" && !decided[r.ref]);

  return (
    <div>
      <ViewHeader
        title="Approval engine"
        subtitle="One generic workflow service reused by every module"
        crumbs={[{ label: "ERP Core" }, { label: "Approvals" }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending" value={num(pending.length)} icon="clock" tone="orange" />
        <StatCard label="Workflows" value={num(APPROVAL_WORKFLOWS.length)} icon="shield" tone="blue" />
        <StatCard
          label="Value awaiting approval"
          value={`${currency} ${num(pending.reduce((sum, r) => sum + r.amount, 0))}`}
          icon="dollar"
          tone="purple"
        />
      </div>
      <Grid>
        <Card title="Approval queue">
          <TableCard
            title=""
            columns={[
              { key: "ref", label: "Reference" },
              {
                key: "subject",
                label: "Subject",
                render: (row) => <span className="font-semibold">{row.subject}</span>,
              },
              { key: "type", label: "Workflow" },
              {
                key: "amount",
                label: "Amount",
                align: "right",
                render: (row) => (row.amount ? <Money value={row.amount} currency={currency} strong /> : "—"),
              },
              { key: "step", label: "Current step" },
              { key: "raisedBy", label: "Raised by" },
              { key: "age", label: "Age" },
              {
                key: "status",
                label: "Status",
                render: (row) => <StatusBadge value={decided[row.ref] ?? row.status} />,
              },
              {
                key: "actions",
                label: "",
                align: "right",
                render: (row) =>
                  decided[row.ref] ? (
                    <span className="text-[11px] text-[#7A8086]">Closed</span>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setDecided((prev) => ({ ...prev, [row.ref]: "APPROVED" }))}
                        className="text-xs font-bold text-[#3EB780]"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setDecided((prev) => ({ ...prev, [row.ref]: "REJECTED" }))}
                        className="text-xs font-bold text-[#D63031]"
                      >
                        Reject
                      </button>
                    </div>
                  ),
              },
            ]}
            rows={APPROVAL_REQUESTS}
          />
        </Card>
        <Card title="Configured workflows" icon="shield">
          <ul className="space-y-3">
            {APPROVAL_WORKFLOWS.map((workflow) => (
              <li key={workflow.key} className="rounded-lg bg-[#F9FAFB] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[#212B36]">{workflow.name}</p>
                  <Badge tone="purple">{workflow.module}</Badge>
                </div>
                <p className="mt-1 text-xs text-[#646B72]">Trigger: {workflow.trigger}</p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-[#7A8086]">
                  {workflow.steps.map((step, index) => (
                    <span key={step} className="flex items-center gap-2">
                      <span className="rounded-full bg-white px-2 py-0.5 font-semibold text-[#212B36] shadow-sm">
                        {index + 1}. {step}
                      </span>
                      {index < workflow.steps.length - 1 ? <span>→</span> : null}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </Grid>
    </div>
  );
}

/* ----------------------------- restaurant ----------------------------- */

export function RestaurantView({ tab }: { tab: string }) {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const occupied = RESTAURANT_TABLES.filter((t) => t.status === "OCCUPIED").length;
  return (
    <div>
      <ViewHeader
        title="Restaurant"
        subtitle="Shares products, inventory, customers and accounting with retail"
        crumbs={[{ label: "Modules" }, { label: "Restaurant" }]}
        actions={
          <Link href="/recipes" className={btnSoft}>
            Recipes
          </Link>
        }
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Menu items" value={num(RESTAURANT_MENU.length)} icon="list" tone="orange" />
        <StatCard label="Open tables" value={num(occupied)} sub={`${RESTAURANT_TABLES.length} total`} icon="users" tone="blue" />
        <StatCard label="Open KOTs" value={num(RESTAURANT_KOTS.filter((k) => k.status !== "SERVED").length)} icon="printer" tone="purple" />
        <StatCard
          label="Running total"
          value={`${currency} ${num(RESTAURANT_TABLES.reduce((sum, t) => sum + t.total, 0))}`}
          icon="dollar"
          tone="green"
        />
      </div>
      <Tabs
        baseHref="/restaurant"
        active={tab}
        tabs={[
          { key: "floor", label: "Floor & tables" },
          { key: "menu", label: "Menu" },
          { key: "kot", label: "Kitchen (KOT)" },
          { key: "recipes", label: "Recipe costing" },
        ]}
      />

      {tab === "menu" ? (
        <TableCard
          title="Menu"
          columns={[
            { key: "item", label: "Menu item", render: (row) => <span className="font-semibold">{row.item}</span> },
            { key: "category", label: "Category" },
            { key: "station", label: "Kitchen station" },
            { key: "type", label: "Product type", render: (row) => <Badge tone="purple">{row.type}</Badge> },
            {
              key: "price",
              label: "Price",
              align: "right",
              render: (row) => <Money value={row.price} currency={currency} strong />,
            },
            {
              key: "cost",
              label: "Cost",
              align: "right",
              render: (row) => <Money value={row.cost} currency={currency} />,
            },
            {
              key: "margin",
              label: "Margin",
              align: "right",
              render: (row) => `${num(((row.price - row.cost) / row.price) * 100, 1)}%`,
            },
          ]}
          rows={RESTAURANT_MENU}
        />
      ) : tab === "kot" ? (
        <TableCard
          title="Kitchen order tickets"
          columns={[
            { key: "kot", label: "KOT" },
            { key: "table", label: "Table" },
            { key: "station", label: "Station" },
            { key: "items", label: "Items" },
            { key: "age", label: "Age" },
            {
              key: "status",
              label: "Status",
              render: (row) => <StatusBadge value={row.status} />,
            },
          ]}
          rows={RESTAURANT_KOTS}
        />
      ) : tab === "recipes" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {RECIPES.map((recipe) => {
            const total = recipe.ingredients.reduce((sum, i) => sum + i.cost, 0);
            const menu = RESTAURANT_MENU.find((m) => m.item === recipe.menu);
            return (
              <Card key={recipe.menu} title={recipe.menu} subtitle={`Yield: ${recipe.yield}`}>
                <TableCard
                  title=""
                  columns={[
                    { key: "item", label: "Ingredient" },
                    { key: "qty", label: "Qty", align: "right" },
                    {
                      key: "cost",
                      label: "Cost",
                      align: "right",
                      render: (row) => <Money value={row.cost} currency={currency} />,
                    },
                  ]}
                  rows={recipe.ingredients}
                />
                <div className="mt-4 space-y-1.5 border-t border-[#E6EAED] pt-4 text-sm">
                  <div className="flex justify-between text-[#646B72]">
                    <span>Recipe cost</span>
                    <span className="font-bold text-[#212B36]">{currency} {num(total, 2)}</span>
                  </div>
                  <div className="flex justify-between text-[#646B72]">
                    <span>Selling price</span>
                    <span className="font-bold text-[#212B36]">{currency} {num(menu?.price ?? 0, 2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-[#E6EAED] pt-2 font-bold">
                    <span>Gross margin</span>
                    <span className="text-[#3EB780]">
                      {num(((menu?.price ?? 0) - total) / Math.max(1, menu?.price ?? 1) * 100, 1)}%
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <TableCard
          title="Floor plan"
          columns={[
            { key: "table", label: "Table", render: (row) => <span className="font-semibold">{row.table}</span> },
            { key: "section", label: "Section" },
            { key: "seats", label: "Seats", align: "right" },
            { key: "server", label: "Server" },
            { key: "since", label: "Seated" },
            {
              key: "total",
              label: "Running total",
              align: "right",
              render: (row) => (row.total ? <Money value={row.total} currency={currency} strong /> : "—"),
            },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={RESTAURANT_TABLES}
          footer={
            <p className="text-xs text-[#7A8086]">
              Selling a menu item deducts recipe ingredients from the shared inventory ledger and posts
              restaurant revenue and COGS to accounting.
            </p>
          }
        />
      )}
    </div>
  );
}

export function RecipesView() {
  return <RestaurantView tab="recipes" />;
}

/* ------------------------------- loyalty ------------------------------- */

export function LoyaltyView() {
  const tenant = useTenant();
  return (
    <div>
      <ViewHeader
        title="Loyalty"
        subtitle={LOYALTY_PROGRAM.name}
        crumbs={[{ label: "Modules" }, { label: "Loyalty" }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Members" value={num(tenant.customers.length)} icon="users" tone="blue" />
        <StatCard
          label="Points issued"
          value={num(LOYALTY_MEMBERS.reduce((sum, m) => sum + m.points, 0))}
          icon="star"
          tone="orange"
        />
        <StatCard label="Tiers" value={num(LOYALTY_PROGRAM.tiers.length)} icon="award" tone="purple" />
        <StatCard label="Scope" value="Company" icon="globe" tone="green" />
      </div>
      <Grid>
        <Card title="Program rules" icon="star">
          <KeyValue
            items={[
              { label: "Earn rule", value: LOYALTY_PROGRAM.rule },
              { label: "Redemption", value: LOYALTY_PROGRAM.redeem },
              { label: "Scope", value: LOYALTY_PROGRAM.scope },
            ]}
          />
          <div className="mt-4">
            <SectionTitle hint="Automatic tier upgrade">Tiers</SectionTitle>
            <ul className="space-y-2">
              {LOYALTY_PROGRAM.tiers.map((tier) => (
                <li key={tier.tier} className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-3 py-2 text-sm">
                  <span className="font-semibold">{tier.tier}</span>
                  <span className="text-[#646B72]">Spend {tier.spend}</span>
                  <span className="text-xs font-bold text-[#FE9F43]">{tier.benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
        <Card title="Top members" icon="award">
          <TableCard
            title=""
            columns={[
              { key: "customer", label: "Member" },
              { key: "tier", label: "Tier", render: (row) => <Badge tone="purple">{row.tier}</Badge> },
              { key: "points", label: "Points", align: "right", render: (row) => num(row.points) },
              { key: "lifetime", label: "Lifetime spend", align: "right", render: (row) => num(row.lifetime) },
              { key: "lastVisit", label: "Last visit" },
            ]}
            rows={LOYALTY_MEMBERS}
          />
        </Card>
      </Grid>
    </div>
  );
}

/* -------------------------------- events ------------------------------- */

export function EventsView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  return (
    <div>
      <ViewHeader
        title="Events"
        subtitle="Tickets, RFID/QR wristbands, cashless wallets — posting back to inventory and accounting"
        crumbs={[{ label: "Modules" }, { label: "Events" }]}
      />
      <div className="grid gap-4 md:grid-cols-3">
        {EVENTS.map((event) => (
          <Card key={event.name} title={event.name} subtitle={`${event.venue} · ${event.date}`} actions={<StatusBadge value={event.status} />}>
            <div className="space-y-3 text-sm">
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-[#646B72]">Tickets</span>
                  <span>
                    {num(event.ticketsSold)} / {num(event.capacity)}
                  </span>
                </div>
                <ProgressBar value={(event.ticketsSold / event.capacity) * 100} />
              </div>
              <KeyValue
                items={[
                  { label: "Zones", value: num(event.zones) },
                  { label: "Wallets issued", value: num(event.wallets) },
                  { label: "Wallet balance", value: `${currency} ${num(event.walletBalance)}` },
                  { label: "Entries scanned", value: num(event.entries) },
                ]}
              />
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-4">
        <Card title="Cashless flow" icon="activity">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {["Register", "Issue RFID / QR", "Recharge wallet", "Scan entry", "Spend on F&B / merch", "Inventory + GL"].map(
              (step, index) => (
                <div key={step} className="rounded-lg bg-[#F9FAFB] p-3 text-center">
                  <p className="text-[11px] font-bold text-[#FE9F43]">STEP {index + 1}</p>
                  <p className="mt-1 text-xs font-semibold text-[#212B36]">{step}</p>
                </div>
              ),
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------- integrations ---------------------------- */

export function IntegrationsView() {
  const tenant = useTenant();
  const [enabled, setEnabled] = useState<string[]>(["Stripe", "Tap Payments", "WhatsApp Business"]);
  const connected = INTEGRATIONS.filter((i) => enabled.includes(i.name));
  return (
    <div>
      <ViewHeader
        title="Integrations"
        subtitle="Plug-ins register once and use the same tenant, inventory and accounting core"
        crumbs={[{ label: "Platform" }, { label: "Integrations" }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Connected" value={num(connected.length)} icon="check" tone="green" />
        <StatCard label="Available" value={num(INTEGRATIONS.filter((i) => i.status === "AVAILABLE").length)} icon="inbox" tone="blue" />
        <StatCard label="Company" value={tenant.company.name} icon="building" tone="purple" />
      </div>
      <Grid>
        <TableCard
          title="Integration catalogue"
          columns={[
            { key: "name", label: "Integration", render: (row) => <span className="font-semibold">{row.name}</span> },
            { key: "category", label: "Category" },
            { key: "detail", label: "Capability" },
            {
              key: "status",
              label: "State",
              render: (row) => (
                <StatusBadge value={enabled.includes(row.name) ? "CONNECTED" : row.status} />
              ),
            },
            {
              key: "actions",
              label: "",
              align: "right",
              render: (row) => (
                <button
                  type="button"
                  onClick={() =>
                    setEnabled((prev) =>
                      prev.includes(row.name) ? prev.filter((n) => n !== row.name) : [...prev, row.name],
                    )
                  }
                  className="text-xs font-bold text-[#FE9F43]"
                >
                  {enabled.includes(row.name) ? "Disconnect" : "Connect"}
                </button>
              ),
            },
          ]}
          rows={INTEGRATIONS}
        />
        <Card title="How integrations are wired" icon="server">
          <ul className="space-y-3 text-sm text-[#646B72]">
            <li>• Each integration is a tenant-scoped client with its own credentials.</li>
            <li>• Orders and catalogue sync go through the same product and inventory services.</li>
            <li>• Financial events land in the GL through module → account mapping.</li>
            <li>• Webhooks are signed, retried with backoff and logged per delivery.</li>
          </ul>
          <div className="mt-4 border-t border-[#E6EAED] pt-4">
            <KeyValue
              items={[
                { label: "Auth", value: "OAuth2 / API key per integration" },
                { label: "Retries", value: "5 attempts, exponential backoff" },
                { label: "Signing", value: "HMAC SHA-256" },
                { label: "Logs", value: "90 days retained" },
              ]}
            />
          </div>
        </Card>
      </Grid>
    </div>
  );
}

/* ---------------------------- ERP data map ---------------------------- */

export function ErpDataMapView() {
  const tenant = useTenant();
  const stockValue = tenant.products.reduce((sum, p) => sum + p.stock * p.cost, 0);
  return (
    <div>
      <ViewHeader
        title="Data model map"
        subtitle="The relationship chain every module depends on"
        crumbs={[{ label: "ERP Core" }, { label: "Data map" }]}
      />
      <Card title="Critical path" icon="database">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          {[
            "Platform",
            "Company",
            "Branch",
            "Warehouse",
            "Location / Bin",
            "Product",
            "Product UOM",
            "Barcode",
            "Price list",
            "Cost layer",
            "Inventory balance",
            "Purchase / GRN",
            "Sale / Invoice",
            "Payment",
            "Journal entry",
          ].map((step, index, all) => (
            <span key={step} className="flex items-center gap-2">
              <span className="rounded-lg bg-[#092C4C] px-2.5 py-1.5 text-white">{step}</span>
              {index < all.length - 1 ? <span className="text-[#FE9F43]">→</span> : null}
            </span>
          ))}
        </div>
      </Card>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Hierarchy" icon="layers">
          <KeyValue
            items={[
              { label: "Companies", value: num(1) },
              { label: "Branches", value: num(tenant.branches.length) },
              { label: "Warehouses", value: num(tenant.warehouses.length) },
              { label: "Terminals", value: num(tenant.terminals.length) },
              { label: "Products", value: num(tenant.products.length) },
              { label: "Users", value: num(tenant.users.length) },
            ]}
          />
        </Card>
        <Card title="Stock & value" icon="box">
          <KeyValue
            items={[
              { label: "Stock value", value: `${tenant.company.currency} ${num(stockValue)}` },
              { label: "Ledger entries", value: num(tenant.ledger.length) },
              { label: "Suppliers", value: num(tenant.suppliers.length) },
              { label: "Customers", value: num(tenant.customers.length) },
            ]}
          />
        </Card>
        <Card title="Isolation rule" icon="shield">
          <p className="text-sm text-[#646B72]">
            Every tenant owned table carries <span className="font-mono text-xs">company_id</span>. Branch and
            warehouse access is resolved from the authenticated user, so a request from Company A can never
            read Company B — enforced in the service layer, not only in the UI.
          </p>
          <div className="mt-4">
            <ProgressBar value={100} tone="green" />
            <p className="mt-2 text-[11px] text-[#7A8086]">Tenant scoping applied to 100% of queries</p>
          </div>
        </Card>
      </div>
      <div className="mt-4">
        <Card title="Multi-warehouse pricing example" icon="dollar">
          <TableCard
            title=""
            columns={[
              { key: "warehouse", label: "Warehouse" },
              { key: "list", label: "Price list" },
              {
                key: "rice",
                label: "Rice 1 bag",
                align: "right",
                render: (row) => <Money value={row.rice} currency={tenant.company.currency} strong />,
              },
              { key: "stock", label: "Stock", align: "right", render: (row) => num(row.stock) },
            ]}
            rows={[
              { id: 1, warehouse: "Doha Main", list: "Retail", rice: 75, stock: 500 },
              { id: 2, warehouse: "Al Rayyan", list: "Retail", rice: 77, stock: 200 },
              { id: 3, warehouse: "Central DC", list: "Wholesale", rice: 70, stock: 1000 },
              { id: 4, warehouse: "Cold storage", list: "VIP", rice: 72, stock: 120 },
            ]}
          />
          <p className="mt-3 text-xs text-[#7A8086]">
            The pricing engine resolves the final price from warehouse → branch → customer group → promotion.
            The POS app never contains this business logic.
          </p>
        </Card>
      </div>
    </div>
  );
}

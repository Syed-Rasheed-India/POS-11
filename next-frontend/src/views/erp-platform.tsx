"use client";

import Link from "next/link";
import { Badge, Card, KeyValue, ProgressBar, SectionTitle, StatCard, Tabs } from "@/components/ui";
import { Field, SelectInput, TextInput, Textarea, btnPrimary, btnSoft } from "@/components/ui";
import { HorizontalBars } from "@/components/charts";
import { Grid, FormPanel, Money, StatusBadge, TableCard, ViewHeader } from "./parts";
import {
  API_CLIENTS,
  ARCHITECTURE_LAYERS,
  BUILD_PHASES,
  ERP_DOMAINS,
  ERP_MODULES,
  INTEGRATIONS,
  MODULE_STATUS_TONE,
  WEBHOOKS,
  modulesForCompany,
} from "@/lib/erp-data";
import { companies, plans, platformMrr, tenants } from "@/lib/mock";
import { compactMoney, money, num, toNum } from "@/lib/format";

/* ------------------------- ERP module registry ------------------------- */

export function PlatformModulesView() {
  const byCategory = ["CORE", "RETAIL", "RESTAURANT", "FINANCE", "HR", "CRM", "COMMERCE", "OPS", "PLATFORM"].map(
    (category) => ({
      category,
      items: ERP_MODULES.filter((m) => m.category === category),
    }),
  );
  const live = ERP_MODULES.filter((m) => m.status === "LIVE").length;
  const beta = ERP_MODULES.filter((m) => m.status === "BETA").length;
  const tables = ERP_MODULES.reduce((sum, m) => sum + m.tables, 0);

  return (
    <div>
      <ViewHeader
        title="ERP module registry"
        subtitle={`${ERP_MODULES.length} modules · ${tables} core tables · the platform installs them per tenant`}
        crumbs={[{ label: "Super Admin" }, { label: "Modules" }]}
        actions={
          <Link href="/super-admin/blueprint" className={btnSoft}>
            Architecture blueprint
          </Link>
        }
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Modules" value={num(ERP_MODULES.length)} icon="layers" tone="blue" />
        <StatCard label="Live" value={num(live)} icon="check" tone="green" />
        <StatCard label="Beta" value={num(beta)} sub={`${ERP_MODULES.length - live - beta} roadmap`} icon="activity" tone="orange" />
        <StatCard label="Core tables" value={num(tables)} icon="database" tone="purple" />
      </div>

      <Card title="Delivery phases" icon="chart">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {BUILD_PHASES.map((phase) => {
            const delivered = phase.modules.filter(
              (key) => ERP_MODULES.find((m) => m.key === key)?.status === "LIVE",
            ).length;
            return (
              <div key={phase.phase} className="rounded-xl border border-[#E6EAED] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#FE9F43]">
                    Phase {phase.phase}
                  </p>
                  <span className="text-[11px] font-bold text-[#646B72]">
                    {delivered}/{phase.modules.length}
                  </span>
                </div>
                <p className="mt-1 text-sm font-bold text-[#212B36]">{phase.name}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-[#646B72]">{phase.scope}</p>
                <div className="mt-3">
                  <ProgressBar value={(delivered / phase.modules.length) * 100} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-4">
        <TableCard
          title="Module registry"
          columns={[
            {
              key: "name",
              label: "Module",
              render: (row) => (
                <div>
                  <p className="font-semibold">{row.name}</p>
                  <p className="font-mono text-[11px] text-[#7A8086]">{row.key}</p>
                </div>
              ),
            },
            { key: "category", label: "Domain", render: (row) => <Badge tone="blue">{row.category}</Badge> },
            { key: "phase", label: "Phase", align: "center", render: (row) => `P${row.phase}` },
            {
              key: "dependencies",
              label: "Depends on",
              render: (row) =>
                row.dependencies.length === 0 ? (
                  <span className="text-xs text-[#7A8086]">— foundation</span>
                ) : (
                  <span className="text-xs text-[#646B72]">
                    {row.dependencies
                      .map((dep) => ERP_MODULES.find((m) => m.key === dep)?.name ?? dep)
                      .join(", ")}
                  </span>
                ),
            },
            { key: "tables", label: "Tables", align: "right" },
            {
              key: "tenants",
              label: "Tenants using",
              align: "right",
              render: (row) =>
                num(companies.filter((c) => modulesForCompany(c.id).some((m) => m.key === row.key && m.enabled)).length),
            },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={MODULE_STATUS_TONE[row.status] ? row.status : row.status} /> },
          ]}
          rows={ERP_MODULES}
          footer={
            <p className="text-xs text-[#7A8086]">
              Modules are feature flagged per plan and per company. A module cannot be enabled until its
              dependencies are installed, which prevents half configured tenants.
            </p>
          }
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Domain coverage" icon="pie">
          <HorizontalBars
            data={byCategory.map((group) => ({ label: group.category, value: group.items.length }))}
            color="#FE9F43"
            formatValue={(v) => `${v} modules`}
          />
        </Card>
        <Card title="Tenant module mix" icon="building" className="lg:col-span-2">
          <TableCard
            title=""
            columns={[
              { key: "name", label: "Vendor" },
              { key: "plan", label: "Plan", render: (row) => <Badge tone="purple">{row.plan}</Badge> },
              {
                key: "modules",
                label: "Modules",
                align: "right",
                render: (row) => num(modulesForCompany(row.id).filter((m) => m.enabled).length),
              },
              {
                key: "restaurant",
                label: "Restaurant",
                render: (row) => (
                  <StatusBadge
                    value={
                      modulesForCompany(row.id).some((m) => m.key === "restaurant_core" && m.enabled)
                        ? "BETA"
                        : "ROADMAP"
                    }
                  />
                ),
              },
              {
                key: "accounting",
                label: "Accounting",
                render: (row) => (
                  <StatusBadge
                    value={
                      modulesForCompany(row.id).some((m) => m.key === "fin_chart" && m.enabled)
                        ? "LIVE"
                        : "ROADMAP"
                    }
                  />
                ),
              },
              { key: "status", label: "Tenant", render: (row) => <StatusBadge value={row.status} /> },
            ]}
            rows={companies.map((company) => ({
              id: company.id,
              name: company.name,
              plan: plans.find((p) => p.id === company.planId)?.name ?? "—",
              status: company.status,
            }))}
            rowHref={(row) => `/super-admin/vendors/${row.id}`}
          />
        </Card>
      </div>
    </div>
  );
}

/* ----------------------------- blueprint ------------------------------ */

export function BlueprintView({ tab }: { tab: string }) {
  const tables = ERP_MODULES.reduce((sum, m) => sum + m.tables, 0);
  return (
    <div>
      <ViewHeader
        title="ERP architecture blueprint"
        subtitle="ERP core built once — retail, restaurant, accounting and future modules plug into it"
        crumbs={[{ label: "Super Admin" }, { label: "Blueprint" }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Domains mapped" value={num(ERP_DOMAINS.length)} icon="layers" tone="blue" />
        <StatCard label="Modules" value={num(ERP_MODULES.length)} icon="box" tone="orange" />
        <StatCard label="Core tables" value={num(tables)} icon="database" tone="purple" />
        <StatCard label="Tenants" value={num(companies.length)} icon="building" tone="green" />
      </div>

      <Tabs
        baseHref="/super-admin/blueprint"
        active={tab}
        tabs={[
          { key: "layers", label: "Architecture layers" },
          { key: "hierarchy", label: "Tenant hierarchy" },
          { key: "domains", label: "Domain checklist" },
          { key: "principles", label: "Design rules" },
        ]}
      />

      {tab === "hierarchy" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card title="Tenant → branch → warehouse" icon="layers" className="lg:col-span-2">
            <pre className="overflow-x-auto rounded-lg bg-[#F9FAFB] p-4 font-mono text-[11px] leading-relaxed text-[#212B36]">
{`SUPER ADMIN  (SaaS platform)
 │
 ├── Company A ── ABC Supermarket  [Professional]
 │     ├── Division: Retail
 │     │     ├── Branch: Doha
 │     │     │     ├── Warehouse: Doha Main        (MAIN)
 │     │     │     │     ├── Zone A → Rack A1 → Bin A-12
 │     │     │     │     └── Zone C → Rack C2 → Bin C-08  (COLD)
 │     │     │     ├── Warehouse: Cold Storage      (COLD)
 │     │     │     └── POS terminals: T1, T2
 │     │     └── Branch: Al Rayyan
 │     │           ├── Warehouse: Al Rayyan Main
 │     │           └── POS terminal: T3
 │     └── Users: owner, manager, 2 cashiers, inventory
 │
 ├── Company B ── XYZ Grocery  [Starter · trial]
 │     └── Branch: Al Wakrah → Warehouse: Al Wakrah Main
 │
 └── Company C ── Freshmart Electronics  [Enterprise]
       ├── Branch: Villaggio → Warehouse: Villaggio Main
       ├── Branch: Al Sadd   → Warehouse: Al Sadd Main
       └── Modules: retail + accounting + events`}
            </pre>
          </Card>
          <Card title="Warehouse independence" icon="warehouse">
            <p className="text-sm text-[#646B72]">
              A warehouse references a company, an optional branch and an optional warehouse group. That
              allows central DCs, transit, virtual, consignment and damaged stores without schema changes.
            </p>
            <div className="mt-4">
              <KeyValue
                items={[
                  { label: "Branch scoped", value: "Warehouse → branch" },
                  { label: "Central", value: "Warehouse → company only" },
                  { label: "Transit", value: "No branch, flagged in transit" },
                  { label: "Locations", value: "Zone → rack → shelf → bin" },
                ]}
              />
            </div>
          </Card>
        </div>
      ) : tab === "domains" ? (
        <Card title="Domain checklist" subtitle="The target ERP surface area — core first, modules after">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ERP_DOMAINS.map((domain, index) => {
              const covered = ERP_MODULES.some((module) =>
                module.screens.some((screen) => domain.toLowerCase().includes(screen.toLowerCase().slice(0, 4))),
              );
              return (
                <div
                  key={domain}
                  className="flex items-center justify-between gap-2 rounded-lg bg-[#F9FAFB] px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#A6AAAF]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {domain}
                  </span>
                  <StatusBadge value={covered ? "LIVE" : "ROADMAP"} />
                </div>
              );
            })}
          </div>
        </Card>
      ) : tab === "principles" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            {
              title: "One core, many modules",
              body: "Retail, restaurant, accounting and future modules share products, inventory, partners and the GL. No module owns its own product or stock table.",
            },
            {
              title: "Tenant isolation in the service layer",
              body: "Every tenant owned table carries company_id. Branch and warehouse scope comes from the authenticated user, never from the request payload.",
            },
            {
              title: "Inventory ledger is the source of truth",
              body: "Balances are derived from postings: purchase, sale, transfer, adjustment, count, recipe consumption. Nothing mutates stock directly.",
            },
            {
              title: "Pricing and costing are services",
              body: "Warehouse, branch, customer group and promotional prices resolve server side. AVG, FIFO, standard and landed costing are configuration, not code forks.",
            },
            {
              title: "Documents and numbering are central",
              body: "One document engine issues invoice, PO, GRN, KOT and journal numbers, with per branch series and reset rules.",
            },
            {
              title: "Workflow engine, not hardcoded approvals",
              body: "Purchase limits, refunds, adjustments, price changes and expenses all reuse the same multi step approval service.",
            },
            {
              title: "Offline first POS",
              body: "Every transaction carries uuid + device_id. The sync queue is idempotent, conflicts resolve server side.",
            },
            {
              title: "Accounting as a bridge",
              body: "Module → account mapping turns operational events into balanced journal entries without duplicating logic per module.",
            },
          ].map((rule) => (
            <Card key={rule.title} title={rule.title}>
              <p className="text-sm text-[#646B72]">{rule.body}</p>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {ARCHITECTURE_LAYERS.map((layer, index) => (
            <Card
              key={layer.layer}
              title={layer.layer}
              subtitle={`Layer ${index + 1} of ${ARCHITECTURE_LAYERS.length}`}
              icon={index === 0 ? "phone" : index === 1 ? "server" : index === 2 ? "database" : "layers"}
            >
              <div className="flex flex-wrap gap-2">
                {layer.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-[#E6EAED] bg-[#F9FAFB] px-3 py-2 text-xs font-semibold text-[#212B36]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------- integrations / API ------------------------ */

export function PlatformIntegrationsView({ tab }: { tab: string }) {
  const connected = INTEGRATIONS.filter((i) => i.status === "CONNECTED");
  return (
    <div>
      <ViewHeader
        title="Integrations & webhooks"
        subtitle="Platform level plumbing shared by every tenant"
        crumbs={[{ label: "Super Admin" }, { label: "Integrations" }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Integrations" value={num(INTEGRATIONS.length)} icon="inbox" tone="blue" />
        <StatCard label="Connected" value={num(connected.length)} icon="check" tone="green" />
        <StatCard label="Webhooks" value={num(WEBHOOKS.length)} icon="activity" tone="orange" />
        <StatCard
          label="Failures (24h)"
          value={num(WEBHOOKS.reduce((sum, w) => sum + w.failures, 0))}
          icon="alert"
          tone="red"
        />
      </div>
      <Tabs
        baseHref="/super-admin/integrations"
        active={tab}
        tabs={[
          { key: "catalogue", label: "Catalogue" },
          { key: "webhooks", label: "Webhooks" },
          { key: "policy", label: "Policy" },
        ]}
      />
      {tab === "webhooks" ? (
        <TableCard
          title="Webhook endpoints"
          columns={[
            { key: "event", label: "Event", render: (row) => <span className="font-mono text-xs">{row.event}</span> },
            { key: "target", label: "Target URL", render: (row) => <span className="font-mono text-[11px]">{row.target}</span> },
            { key: "deliveries", label: "Deliveries", align: "right" },
            { key: "failures", label: "Failures", align: "right", render: (row) => num(row.failures) },
            { key: "status", label: "Health", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={WEBHOOKS}
        />
      ) : tab === "policy" ? (
        <Grid>
          <Card title="Integration contract" icon="shield">
            <KeyValue
              items={[
                { label: "Auth", value: "OAuth2 client credentials or scoped API key" },
                { label: "Signing", value: "HMAC SHA-256 on raw body" },
                { label: "Retries", value: "5 attempts with exponential backoff" },
                { label: "Ordering", value: "Idempotency key required on writes" },
                { label: "Rate limit", value: "600 req/min per client" },
                { label: "Log retention", value: "90 days" },
              ]}
            />
          </Card>
          <Card title="Failure handling" icon="alert">
            <ul className="space-y-2 text-sm text-[#646B72]">
              <li>• Failed deliveries are re-queued and visible per tenant.</li>
              <li>• Endpoints auto-pause after 50 consecutive failures.</li>
              <li>• Replay is manual from the delivery log.</li>
              <li>• Accounting and inventory events never fail silently — they raise a platform alert.</li>
            </ul>
          </Card>
        </Grid>
      ) : (
        <TableCard
          title="Integration catalogue"
          columns={[
            { key: "name", label: "Integration", render: (row) => <span className="font-semibold">{row.name}</span> },
            { key: "category", label: "Category" },
            { key: "detail", label: "Capability" },
            { key: "status", label: "State", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={INTEGRATIONS}
        />
      )}
    </div>
  );
}

export function ApiClientsView() {
  const totalCalls = API_CLIENTS.reduce((sum, c) => sum + toNum(String(c.calls).split("/")[0].replace(/[^\d.]/g, "")) * (String(c.calls).includes("M") ? 1000 : 1), 0);
  return (
    <div>
      <ViewHeader
        title="API clients & usage"
        subtitle="One API for the POS app, admin portal, customer app and partners"
        crumbs={[{ label: "Super Admin" }, { label: "API" }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Clients" value={num(API_CLIENTS.length)} icon="key" tone="blue" />
        <StatCard label="Calls / month" value={compactMoney(totalCalls * 1000)} icon="activity" tone="green" />
        <StatCard label="MRR" value={money(platformMrr())} icon="dollar" tone="orange" />
        <StatCard label="POS devices" value={num(tenants.reduce((sum, t) => sum + t.devices.length, 0))} icon="phone" tone="purple" />
      </div>
      <Grid>
        <TableCard
          title="Registered clients"
          columns={[
            { key: "name", label: "Client", render: (row) => <span className="font-semibold">{row.name}</span> },
            {
              key: "scopes",
              label: "Scopes",
              render: (row) => (
                <div className="flex flex-wrap gap-1">
                  {row.scopes.map((scope) => (
                    <span
                      key={scope}
                      className="rounded-full bg-[#F1F3F5] px-2 py-0.5 font-mono text-[10px] text-[#646B72]"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              ),
            },
            { key: "calls", label: "Volume", align: "right" },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={API_CLIENTS}
        />
        <div className="space-y-4">
          <Card title="Core endpoints" icon="server">
            <ul className="space-y-2 font-mono text-[11px] text-[#646B72]">
              {[
                "POST /api/v1/auth/login",
                "GET  /api/v1/products?updated_since=",
                "GET  /api/v1/inventory/balances",
                "POST /api/v1/sales            (idempotent)",
                "POST /api/v1/sync/batch",
                "GET  /api/v1/customers",
                "GET  /api/v1/reports/daily",
                "POST /api/v1/devices/heartbeat",
              ].map((endpoint) => (
                <li key={endpoint} className="rounded-md bg-[#F9FAFB] px-2.5 py-1.5">
                  {endpoint}
                </li>
              ))}
            </ul>
          </Card>
          <FormPanel title="Issue API key" submitLabel="Generate key">
            <Field label="Client name">
              <TextInput name="name" placeholder="Partner integration — Acme" />
            </Field>
            <Field label="Scopes">
              <TextInput name="scopes" defaultValue="products:read, sales:write" />
            </Field>
            <Field label="Company">
              <SelectInput
                name="companyId"
                options={companies.map((c) => ({ value: c.id, label: c.name }))}
                placeholder="All tenants"
              />
            </Field>
            <Field label="Notes">
              <Textarea name="notes" />
            </Field>
            <button type="submit" className={btnPrimary}>
              Generate key
            </button>
          </FormPanel>
        </div>
      </Grid>
    </div>
  );
}

/* --------------------------- company modules -------------------------- */

export function CompanyModulesView({ companyId }: { companyId: number }) {
  const company = companies.find((c) => c.id === companyId);
  const modules = modulesForCompany(companyId);
  const enabled = modules.filter((m) => m.enabled);
  return (
    <div>
      <ViewHeader
        title={`Modules — ${company?.name ?? ""}`}
        subtitle={`${enabled.length} active · ${modules.length - enabled.length} available`}
        crumbs={[
          { label: "Super Admin", href: "/super-admin" },
          { label: "Vendors", href: "/super-admin/vendors" },
          { label: company?.name ?? "" },
          { label: "Modules" },
        ]}
        actions={
          <Link href={`/super-admin/vendors/${companyId}`} className={btnSoft}>
            Back to tenant
          </Link>
        }
      />
      <Card title="Installed modules">
        <TableCard
          title=""
          columns={[
            { key: "name", label: "Module" },
            { key: "category", label: "Domain", render: (row) => <Badge tone="blue">{row.category}</Badge> },
            { key: "phase", label: "Phase", align: "center", render: (row) => `P${row.phase}` },
            { key: "tables", label: "Tables", align: "right" },
            {
              key: "deps",
              label: "Dependencies",
              render: (row) =>
                row.dependencies.length === 0
                  ? "—"
                  : row.dependencies.map((dep) => ERP_MODULES.find((m) => m.key === dep)?.name ?? dep).join(", "),
            },
            {
              key: "status",
              label: "State",
              render: (row) => <StatusBadge value={row.enabled ? row.status : "ROADMAP"} />,
            },
          ]}
          rows={modules}
        />
      </Card>
      <div className="mt-4">
        <Card title="Dependency graph" icon="layers">
          <pre className="overflow-x-auto rounded-lg bg-[#F9FAFB] p-4 font-mono text-[11px] leading-relaxed text-[#212B36]">
{`core_tenant ──┬── core_warehouse ──── core_inventory ────┬── retail_pos ──── platform_sync
              │                    │                      │
              ├── core_security ──── core_workflow        ├── retail_purchasing
              │                                           │
              ├── core_master ───── core_product ── core_pricing
              │                             │
              │                             └── restaurant_core ── restaurant_recipes
              │
              └── core_documents ─── fin_chart ──┬── fin_ar ──── fin_banking
                                                ├── fin_ap
                                                └── fin_tax`}
          </pre>
        </Card>
      </div>
    </div>
  );
}

export function ErpPhaseRoadmapView() {
  return (
    <div>
      <ViewHeader
        title="Delivery roadmap"
        subtitle="What is built now versus what the architecture already supports"
        crumbs={[{ label: "Super Admin" }, { label: "Roadmap" }]}
      />
      <div className="grid gap-4 lg:grid-cols-5">
        {BUILD_PHASES.map((phase) => (
          <Card key={phase.phase} title={`Phase ${phase.phase}`} subtitle={phase.name}>
            <ul className="space-y-2">
              {phase.modules.map((key) => {
                const entry = ERP_MODULES.find((m) => m.key === key)!;
                return (
                  <li key={key} className="rounded-lg bg-[#F9FAFB] px-2.5 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-[#212B36]">{entry.name}</p>
                      <StatusBadge value={entry.status} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>
      <div className="mt-4">
        <Card title="Scope discipline" icon="shield">
          <SectionTitle hint="Core correctness beats table count">
            Build the core correctly once
          </SectionTitle>
          <p className="max-w-3xl text-sm text-[#646B72]">
            Company → branch → warehouse → location → product → product UOM → barcode → price → cost →
            inventory → purchase → sale → payment → accounting → users/roles → subscription → audit. Once
            those relationships are right, restaurant, HRM, loyalty, events and manufacturing attach without
            rebuilding the foundation.
          </p>
        </Card>
      </div>
    </div>
  );
}

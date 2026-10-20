"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Card, KeyValue, ProgressBar, SectionTitle, StatCard, Tabs } from "@/components/ui";
import { Checkbox, Field, NumberInput, SelectInput, TextInput, Textarea, btnPrimary, btnSoft } from "@/components/ui";
import { PermissionMatrix, type PermissionGroup } from "@/components/permissions";
import { AreaChart, BarSeries, Donut, HorizontalBars } from "@/components/charts";
import { Grid, FormPanel, Money, StatusBadge, TableCard, ViewHeader, SearchBox } from "./parts";
import { useSession } from "@/lib/session";
import type { Plan } from "@/lib/mock";
import {
  PLATFORM_PERMISSIONS,
  apiTokens,
  auditLogs,
  companies,
  features,
  platformAdmins,
  platformMonthlyRevenue,
  platformMrr,
  platformPayments,
  platformRoles,
  platformSettings,
  plans,
  subscriptionForCompany,
  syncQueue,
  tenants,
  tickets,
  totalsFor,
} from "@/lib/mock";
import { compactMoney, dateShort, dateTime, money, num, timeAgo, toNum } from "@/lib/format";

/* ------------------------------- dashboard ------------------------------- */

export function PlatformDashboard() {
  const { session } = useSession();
  const mrr = platformMrr();
  const arr = mrr * 12;
  const paid = platformPayments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);
  const trial = companies.filter((c) => c.status === "TRIAL").length;
  const active = companies.filter((c) => c.status === "ACTIVE").length;
  const openTickets = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
  const devices = tenants.flatMap((t) => t.devices);
  const online = devices.filter((d) => d.status === "ONLINE").length;
  const gmv = tenants.reduce((sum, t) => sum + totalsFor(t, 3650).revenue, 0);
  const invoiceCount = tenants.reduce((sum, t) => sum + t.sales.length, 0);
  const revenue = platformMonthlyRevenue();
  const planDistribution = plans.map((plan) => ({
    label: plan.name,
    value: companies.filter((c) => c.planId === plan.id).length,
    color: ["#FE9F43", "#092C4C", "#0984E3"][plan.id - 1] ?? "#6C5CE7",
  }));

  return (
    <div>
      <ViewHeader
        title="Platform overview"
        subtitle={`${companies.length} tenants · signed in as ${session.name}`}
        crumbs={[{ label: "Super Admin" }, { label: "Overview" }]}
        actions={
          <div className="flex gap-2">
            <Link href="/super-admin/vendors/new" className={btnPrimary}>
              + New vendor
            </Link>
            <Link href="/super-admin/reports" className={btnSoft}>
              Revenue reports
            </Link>
          </div>
        }
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total vendors" value={num(companies.length)} icon="building" tone="blue" />
        <StatCard label="Active" value={num(active)} sub={`${trial} on trial`} icon="check" tone="green" />
        <StatCard label="MRR" value={money(mrr)} icon="dollar" tone="orange" />
        <StatCard label="ARR" value={money(arr)} icon="chart" tone="purple" />
      </div>
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Lifetime payments" value={compactMoney(paid)} icon="card" tone="green" />
        <StatCard label="Open tickets" value={num(openTickets)} icon="inbox" tone="red" />
        <StatCard label="Online devices" value={`${online}/${devices.length}`} icon="phone" tone="teal" />
        <StatCard
          label="POS volume (GMV)"
          value={compactMoney(gmv)}
          sub={`${num(invoiceCount)} invoices`}
          icon="cart"
          tone="blue"
        />
      </div>

      <Grid>
        <Card title="Subscription revenue" icon="chart" subtitle="Payments collected per month">
          <AreaChart data={revenue} />
        </Card>
        <Card title="Plan distribution" icon="pie">
          <Donut
            slices={planDistribution}
            centerValue={num(companies.length)}
            centerLabel="tenants"
          />
        </Card>
      </Grid>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Newest vendors" icon="building">
          <ul className="space-y-3">
            {[...companies]
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((company) => (
                <li key={company.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/super-admin/vendors/${company.id}`}
                      className="block truncate text-sm font-semibold text-[#212B36] hover:text-[#FE9F43]"
                    >
                      {company.name}
                    </Link>
                    <p className="text-[11px] text-[#7A8086]">
                      {company.code} · {company.city}
                    </p>
                  </div>
                  <StatusBadge value={company.status} />
                </li>
              ))}
          </ul>
        </Card>
        <Card title="Subscription status" icon="award">
          <HorizontalBars
            data={[
              { label: "Active", value: companies.filter((c) => subscriptionForCompany(c.id).status === "ACTIVE").length },
              { label: "Trial", value: companies.filter((c) => subscriptionForCompany(c.id).status === "TRIAL").length },
              { label: "Expired", value: companies.filter((c) => subscriptionForCompany(c.id).status === "EXPIRED").length },
              { label: "Suspended", value: companies.filter((c) => subscriptionForCompany(c.id).status === "SUSPENDED").length },
            ]}
            color="#092C4C"
          />
        </Card>
        <Card title="Support queue" icon="inbox">
          <TableCard
            title=""
            rowHref={(row) => `/super-admin/tickets/${row.id}`}
            columns={[
              { key: "no", label: "Ticket" },
              { key: "subject", label: "Subject" },
              { key: "priority", label: "Priority", render: (row) => <StatusBadge value={row.priority} /> },
              { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
            ]}
            rows={tickets.slice(0, 6)}
          />
        </Card>
      </div>
    </div>
  );
}

/* -------------------------------- vendors -------------------------------- */

export function VendorsView({ query: initialQuery, status: initialStatus }: { query: string; status: string }) {
  const [extra, setExtra] = useState<typeof companies>([]);
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);
  const rows = [...extra, ...companies]
    .filter((company) => (status === "ALL" ? true : company.status === status))
    .filter((company) =>
      query
        ? `${company.name} ${company.code} ${company.email} ${company.city}`.toLowerCase().includes(query.toLowerCase())
        : true,
    );

  return (
    <div>
      <ViewHeader
        title="Vendors"
        subtitle={`${companies.length} retail companies on the platform`}
        crumbs={[{ label: "Super Admin" }, { label: "Vendors" }]}
        actions={
          <Link href="/super-admin/vendors/new" className={btnPrimary}>
            + New vendor
          </Link>
        }
      />
      <Card title="Filters">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Search" className="min-w-[240px]">
            <SearchBox value={query} onChange={setQuery} placeholder="Company, code or city" />
          </Field>
          <Field label="Status" className="min-w-[160px]">
            <SelectInput
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              options={[
                { value: "ALL", label: "All statuses" },
                { value: "ACTIVE", label: "Active" },
                { value: "TRIAL", label: "Trial" },
                { value: "SUSPENDED", label: "Suspended" },
                { value: "INACTIVE", label: "Inactive" },
              ]}
            />
          </Field>
          <button type="button" className={btnPrimary}>
            Apply
          </button>
        </div>
      </Card>
      <div className="mt-4">
        <TableCard
          title="Tenant list"
          rowHref={(row) => `/super-admin/vendors/${row.id}`}
          columns={[
            {
              key: "name",
              label: "Company",
              render: (row) => (
                <div>
                  <p className="font-semibold">{row.name}</p>
                  <p className="text-[11px] text-[#7A8086]">
                    {row.code} · {row.email}
                  </p>
                </div>
              ),
            },
            {
              key: "plan",
              label: "Plan",
              render: (row) => (
                <Badge tone="purple">{plans.find((p) => p.id === row.planId)?.name ?? "—"}</Badge>
              ),
            },
            { key: "city", label: "Location", render: (row) => `${row.city} · ${row.country}` },
            { key: "currency", label: "Currency" },
            { key: "createdAt", label: "Joined", render: (row) => dateShort(row.createdAt) },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={rows}
        />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((company) => {
          const tenant = tenants.find((t) => t.company.id === company.id)!;
          const totals = totalsFor(tenant, 3650);
          return (
            <Card key={company.id} title={company.name} subtitle={company.code}>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#646B72]">POS revenue</span>
                  <span className="font-bold">{money(totals.revenue, company.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#646B72]">Users</span>
                  <span className="font-bold">{tenant.users.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#646B72]">Branches</span>
                  <span className="font-bold">{tenant.branches.length}</span>
                </div>
                <div className="pt-2">
                  <Link href={`/super-admin/vendors/${company.id}`} className="text-xs font-bold text-[#FE9F43]">
                    Open tenant →
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function VendorDetailView({ id, tab }: { id: number; tab: string }) {
  const tenant = tenants.find((t) => t.company.id === id);
  if (!tenant) return <Card title="Vendor not found">Unknown tenant.</Card>;
  const company = tenant.company;
  const plan = plans.find((p) => p.id === tenant.subscription.planId)!;
  const payments = platformPayments.filter((p) => p.companyId === company.id);
  const paid = payments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.amount, 0);
  const totals = totalsFor(tenant, 3650);
  const settings = tenant.settings;

  return (
    <div>
      <ViewHeader
        title={company.name}
        subtitle={`${company.code} · ${company.email} · joined ${dateShort(company.createdAt)}`}
        crumbs={[
          { label: "Super Admin", href: "/super-admin" },
          { label: "Vendors", href: "/super-admin/vendors" },
          { label: company.name },
        ]}
        actions={
          <Link href="/super-admin/subscriptions" className={btnPrimary}>
            Manage subscription
          </Link>
        }
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Status" value={company.status} icon="shield" tone="blue" />
        <StatCard label="Plan" value={plan.name} icon="award" tone="orange" />
        <StatCard label="Lifetime paid" value={money(paid)} icon="card" tone="green" />
        <StatCard label="POS revenue" value={compactMoney(totals.revenue)} icon="cart" tone="purple" />
      </div>

      <Tabs
        baseHref={`/super-admin/vendors/${id}`}
        active={tab}
        tabs={[
          { key: "overview", label: "Overview" },
          { key: "organisation", label: "Organisation" },
          { key: "billing", label: "Billing" },
          { key: "settings", label: "Settings" },
        ]}
      />

      {tab === "organisation" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card title={`Users (${tenant.users.length})`}>
            <ul className="space-y-2 text-sm">
              {tenant.users.map((user) => (
                <li key={user.id} className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-3 py-2">
                  <span className="font-medium">{user.name}</span>
                  <StatusBadge value={user.status} />
                </li>
              ))}
            </ul>
          </Card>
          <Card title={`Branches (${tenant.branches.length})`}>
            <ul className="space-y-2 text-sm">
              {tenant.branches.map((branch) => (
                <li key={branch.id} className="rounded-lg bg-[#F9FAFB] px-3 py-2">
                  <p className="font-medium">{branch.name}</p>
                  <p className="text-[11px] text-[#7A8086]">
                    {branch.code} · {branch.city}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
          <Card title={`Warehouses (${tenant.warehouses.length})`}>
            <ul className="space-y-2 text-sm">
              {tenant.warehouses.map((warehouse) => (
                <li key={warehouse.id} className="rounded-lg bg-[#F9FAFB] px-3 py-2">
                  <p className="font-medium">{warehouse.name}</p>
                  <p className="text-[11px] text-[#7A8086]">{warehouse.type}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      ) : tab === "billing" ? (
        <Grid>
          <Card title="Subscription">
            <KeyValue
              items={[
                { label: "Plan", value: plan.name },
                { label: "Status", value: <StatusBadge value={tenant.subscription.status} /> },
                { label: "Billing cycle", value: tenant.subscription.cycle },
                { label: "Amount", value: money(tenant.subscription.amount, company.currency) },
                { label: "Started", value: dateShort(tenant.subscription.startDate) },
                { label: "Renews", value: dateShort(tenant.subscription.endDate) },
              ]}
            />
            <div className="mt-4 border-t border-[#E6EAED] pt-4">
              <SectionTitle hint="Platform only">Change plan</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {plans.map((option) => (
                  <Link
                    key={option.id}
                    href="/super-admin/subscriptions"
                    className={`rounded-lg px-3 py-2 text-xs font-bold ${
                      option.id === plan.id
                        ? "bg-[#092C4C] text-white"
                        : "border border-[#E6EAED] text-[#646B72] hover:bg-[#F9FAFB]"
                    }`}
                  >
                    {option.name} · {money(option.monthlyPrice, option.currency)}/mo
                  </Link>
                ))}
              </div>
            </div>
          </Card>
          <Card title="Payment history">
            <TableCard
              title=""
              columns={[
                { key: "invoiceNo", label: "Invoice" },
                { key: "date", label: "Date", render: (row) => dateShort(row.date) },
                {
                  key: "amount",
                  label: "Amount",
                  align: "right",
                  render: (row) => <Money value={row.amount} currency={row.currency} strong />,
                },
                { key: "method", label: "Method" },
                { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
              ]}
              rows={payments}
              emptyTitle="No invoices yet"
              emptyHint="The trial is free — the first invoice is raised on conversion."
            />
          </Card>
        </Grid>
      ) : tab === "settings" ? (
        <Card title="Company settings">
          <KeyValue items={Object.entries(settings).map(([key, value]) => ({ label: key, value }))} />
        </Card>
      ) : (
        <Grid>
          <Card title="Company profile">
            <KeyValue
              items={[
                { label: "Company name", value: company.name },
                { label: "Legal name", value: company.legalName },
                { label: "Company code", value: company.code },
                { label: "Email", value: company.email },
                { label: "Phone", value: company.phone },
                { label: "Website", value: company.website },
                { label: "Country", value: company.country },
                { label: "City", value: company.city },
                { label: "Currency", value: company.currency },
                { label: "Timezone", value: company.timezone },
                { label: "Products", value: num(tenant.products.length) },
                { label: "Invoices", value: num(tenant.sales.length) },
              ]}
            />
            <p className="mt-4 rounded-lg bg-[#F9FAFB] p-3 text-sm text-[#646B72]">{company.address}</p>
          </Card>
          <Card title="Usage summary">
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span>Users</span>
                  <span>
                    {tenant.users.length} / {plan.maxUsers}
                  </span>
                </div>
                <ProgressBar value={(tenant.users.length / plan.maxUsers) * 100} />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span>Branches</span>
                  <span>
                    {tenant.branches.length} / {plan.maxBranches}
                  </span>
                </div>
                <ProgressBar value={(tenant.branches.length / plan.maxBranches) * 100} tone="blue" />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span>Products</span>
                  <span>
                    {tenant.products.length} / {plan.maxProducts}
                  </span>
                </div>
                <ProgressBar value={(tenant.products.length / plan.maxProducts) * 100} tone="green" />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span>POS terminals</span>
                  <span>
                    {tenant.terminals.length} / {plan.maxTerminals}
                  </span>
                </div>
                <ProgressBar value={(tenant.terminals.length / plan.maxTerminals) * 100} tone="purple" />
              </div>
            </div>
          </Card>
        </Grid>
      )}
    </div>
  );
}

export function VendorFormView() {
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <ViewHeader
        title="Provision a vendor"
        subtitle="Creates the tenant, a branch, a warehouse and the owner login"
        crumbs={[
          { label: "Super Admin", href: "/super-admin" },
          { label: "Vendors", href: "/super-admin/vendors" },
          { label: "New" },
        ]}
      />
      <FormPanel
        title="Vendor details"
        submitLabel="Create vendor"
        cancelHref="/super-admin/vendors"
        wide
        onSubmit={() => setSaved(true)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name">
            <TextInput name="companyName" required placeholder="Al Sadd Mart" />
          </Field>
          <Field label="Legal name">
            <TextInput name="legalName" placeholder="Al Sadd Mart W.L.L" />
          </Field>
          <Field label="Company code">
            <TextInput name="companyCode" placeholder="CMP-004" />
          </Field>
          <Field label="Invoice prefix">
            <TextInput name="invoicePrefix" placeholder="ASM" />
          </Field>
          <Field label="Email">
            <TextInput name="email" type="email" required />
          </Field>
          <Field label="Phone">
            <TextInput name="phone" />
          </Field>
          <Field label="Owner name">
            <TextInput name="ownerName" placeholder="Khalid Al-Mannai" />
          </Field>
          <Field label="Owner password">
            <TextInput name="password" type="password" defaultValue="password" />
          </Field>
          <Field label="Country">
            <TextInput name="country" defaultValue="Qatar" />
          </Field>
          <Field label="City">
            <TextInput name="city" placeholder="Doha" />
          </Field>
          <Field label="Currency">
            <SelectInput
              name="currency"
              defaultValue="QAR"
              options={[
                { value: "QAR", label: "QAR — Qatari Riyal" },
                { value: "USD", label: "USD — US Dollar" },
                { value: "AED", label: "AED — UAE Dirham" },
                { value: "SAR", label: "SAR — Saudi Riyal" },
              ]}
            />
          </Field>
          <Field label="Trial plan">
            <SelectInput
              name="planId"
              options={plans.map((p) => ({ value: p.id, label: `${p.name} (${p.trialDays} day trial)` }))}
              placeholder="Select plan"
            />
          </Field>
        </div>
        <Field label="Address">
          <Textarea name="address" />
        </Field>
        {saved ? (
          <p className="rounded-lg bg-[#EAF8F1] px-3 py-2 text-sm font-semibold text-[#2C7A57]">
            Vendor provisioned: company, main branch, warehouse, owner login and {plans[0].trialDays} day
            trial subscription created.
          </p>
        ) : null}
      </FormPanel>
    </div>
  );
}

/* ------------------------- subscriptions & plans ------------------------- */

export function SubscriptionsView() {
  const subs = companies.map((company) => ({
    id: company.id,
    companyId: company.id,
    company,
    ...subscriptionForCompany(company.id),
  }));
  const statusCounts = ["ACTIVE", "TRIAL", "EXPIRED", "SUSPENDED", "CANCELLED"].map((status) => ({
    label: status,
    value: subs.filter((s) => s.status === status).length,
  }));
  const monthlyValue = subs
    .filter((s) => s.status === "ACTIVE")
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div>
      <ViewHeader
        title="Subscriptions"
        subtitle={`${subs.length} tenant subscriptions`}
        crumbs={[{ label: "Super Admin" }, { label: "Subscriptions" }]}
        actions={
          <Link href="/super-admin/plans" className={btnSoft}>
            Manage plans
          </Link>
        }
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active" value={num(subs.filter((s) => s.status === "ACTIVE").length)} icon="check" tone="green" />
        <StatCard label="Trials" value={num(subs.filter((s) => s.status === "TRIAL").length)} icon="clock" tone="orange" />
        <StatCard label="Expired" value={num(subs.filter((s) => s.status === "EXPIRED").length)} icon="alert" tone="red" />
        <StatCard label="Monthly value" value={money(monthlyValue)} icon="dollar" tone="blue" />
      </div>
      <Grid>
        <TableCard
          title="Subscription list"
          rowHref={(row) => `/super-admin/vendors/${row.companyId}?tab=billing`}
          columns={[
            {
              key: "company",
              label: "Vendor",
              render: (row) => (
                <div>
                  <p className="font-semibold">{row.company.name}</p>
                  <p className="text-[11px] text-[#7A8086]">{row.company.code}</p>
                </div>
              ),
            },
            {
              key: "plan",
              label: "Plan",
              render: (row) => (
                <Badge tone="purple">{plans.find((p) => p.id === row.planId)?.name ?? "—"}</Badge>
              ),
            },
            { key: "cycle", label: "Cycle" },
            {
              key: "amount",
              label: "Amount",
              align: "right",
              render: (row) => <Money value={row.amount} currency={row.company.currency} strong />,
            },
            { key: "startDate", label: "Started", render: (row) => dateShort(row.startDate) },
            { key: "endDate", label: "Renews", render: (row) => dateShort(row.endDate) },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={subs}
        />
        <Card title="Status breakdown">
          <HorizontalBars data={statusCounts} color="#092C4C" />
          <div className="mt-4 border-t border-[#E6EAED] pt-4">
            <SectionTitle hint="Per plan">Tenants</SectionTitle>
            <HorizontalBars
              data={plans.map((p) => ({ label: p.name, value: companies.filter((c) => c.planId === p.id).length }))}
              color="#FE9F43"
            />
          </div>
        </Card>
      </Grid>
    </div>
  );
}

export function PlansView() {
  const [extra, setExtra] = useState<Plan[]>([]);
  const allPlans = useMemo<Plan[]>(
    () => [
      ...extra,
      ...plans,
    ],
    [extra],
  );

  return (
    <div>
      <ViewHeader
        title="Subscription plans"
        subtitle="Pricing, limits and feature flags"
        crumbs={[{ label: "Super Admin" }, { label: "Plans" }]}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {allPlans.map((plan) => (
          <Card
            key={plan.id}
            title={plan.name}
            subtitle={plan.code}
            actions={plan.featured ? <Badge tone="orange">Popular</Badge> : null}
          >
            <p className="text-3xl font-bold text-[#212B36]">
              {money(plan.monthlyPrice, plan.currency)}
              <span className="text-sm font-medium text-[#7A8086]">/mo</span>
            </p>
            <p className="mt-1 text-xs text-[#7A8086]">
              {money(plan.yearlyPrice, plan.currency)} billed yearly · {plan.trialDays} day trial
            </p>
            <div className="mt-4 space-y-1.5 text-sm text-[#646B72]">
              <p>• {plan.maxUsers} users</p>
              <p>
                • {plan.maxBranches} branches · {plan.maxWarehouses} warehouses
              </p>
              <p>• {plan.maxTerminals} POS terminals</p>
              <p>• {plan.maxProducts} products</p>
              <p>• {plan.storageLimitMb} MB storage</p>
              <p>• {companies.filter((c) => c.planId === plan.id).length} tenants subscribed</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {features
                .filter((feature) => planFeatureEnabled(plan.id, feature.key))
                .map((feature) => (
                  <Badge key={feature.key} tone="green">
                    {feature.name}
                  </Badge>
                ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4">
        <Card title="Feature matrix" icon="sliders" subtitle="Toggle capabilities per plan">
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="bg-[#F9FAFB]">
                  <th className="border-b border-[#E6EAED] px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#646B72]">
                    Feature
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.id}
                      className="border-b border-[#E6EAED] px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-[#646B72]"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature) => (
                  <tr key={feature.id} className="border-b border-[#F1F3F5] last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-medium text-[#212B36]">{feature.name}</p>
                      <p className="text-[11px] text-[#7A8086]">{feature.key}</p>
                    </td>
                    {plans.map((plan) => {
                      const enabled = planFeatureEnabled(plan.id, feature.key);
                      return (
                        <td key={plan.id} className="px-4 py-3 text-center">
                          <span
                            className={`inline-grid h-5 w-5 place-items-center rounded-md text-xs font-bold ${
                              enabled ? "bg-[#3EB780] text-white" : "border border-[#D3D5D7] bg-white"
                            }`}
                          >
                            {enabled ? "✓" : ""}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <FormPanel
          title="Create plan"
          submitLabel="Create plan"
          wide
          onSubmit={(values) => {
            const name = String(values.name);
            const code = String(values.code).toUpperCase();
            if (!name || !code) return;
            const selected = features
              .filter((feature) => values[`feature_${feature.key}`] === true)
              .map((feature) => feature.key);
            const id = 100 + extra.length;
            setExtra((prev) => [
              {
                id,
                name,
                code,
                description: String(values.description ?? ""),
                monthlyPrice: toNum(String(values.monthlyPrice)),
                yearlyPrice: toNum(String(values.yearlyPrice)),
                currency: "USD",
                trialDays: Math.trunc(toNum(String(values.trialDays))) || 14,
                maxUsers: Math.trunc(toNum(String(values.maxUsers))) || 5,
                maxBranches: Math.trunc(toNum(String(values.maxBranches))) || 1,
                maxWarehouses: Math.trunc(toNum(String(values.maxWarehouses))) || 1,
                maxTerminals: Math.trunc(toNum(String(values.maxTerminals))) || 2,
                maxProducts: Math.trunc(toNum(String(values.maxProducts))) || 1000,
                storageLimitMb: 5120,
              },
              ...prev,
            ]);
            void selected;
          }}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Name">
              <TextInput name="name" required placeholder="Growth" />
            </Field>
            <Field label="Code">
              <TextInput name="code" required placeholder="GROWTH" />
            </Field>
            <Field label="Monthly price">
              <NumberInput name="monthlyPrice" defaultValue={49} />
            </Field>
            <Field label="Yearly price">
              <NumberInput name="yearlyPrice" defaultValue={490} />
            </Field>
            <Field label="Trial days">
              <NumberInput name="trialDays" defaultValue={14} />
            </Field>
            <Field label="Max users">
              <NumberInput name="maxUsers" defaultValue={10} />
            </Field>
            <Field label="Max branches">
              <NumberInput name="maxBranches" defaultValue={2} />
            </Field>
            <Field label="Max terminals">
              <NumberInput name="maxTerminals" defaultValue={5} />
            </Field>
            <Field label="Max products">
              <NumberInput name="maxProducts" defaultValue={5000} />
            </Field>
          </div>
          <Field label="Description">
            <Textarea name="description" />
          </Field>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#646B72]">Features</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {features.map((feature) => (
                <Checkbox key={feature.id} name={`feature_${feature.key}`} label={feature.name} />
              ))}
            </div>
          </div>
        </FormPanel>
      </div>
    </div>
  );
}

function planFeatureEnabled(planId: number, featureKey: string) {
  const tenant = tenants.find((t) => t.subscription.planId === planId);
  const matrix: Record<number, string[]> = {
    1: ["retail_pos", "inventory", "promotions", "loyalty"],
    2: [
      "retail_pos", "inventory", "multi_branch", "multi_warehouse", "purchasing",
      "customer_credit", "promotions", "advanced_reports", "loyalty", "barcode_scale",
    ],
    3: features.map((f) => f.key),
  };
  void tenant;
  return (matrix[planId] ?? []).includes(featureKey);
}

export function FeaturesView() {
  return (
    <div>
      <ViewHeader title="Platform features" crumbs={[{ label: "Super Admin" }, { label: "Features" }]} />
      <TableCard
        title="Feature catalogue"
        columns={[
          { key: "name", label: "Feature" },
          {
            key: "key",
            label: "Key",
            render: (row) => <span className="font-mono text-xs">{row.key}</span>,
          },
          { key: "module", label: "Module" },
          { key: "description", label: "Description" },
          {
            key: "plans",
            label: "Included in",
            render: (row) =>
              plans
                .filter((plan) => planFeatureEnabled(plan.id, row.key))
                .map((plan) => plan.name)
                .join(", ") || "—",
          },
        ]}
        rows={features}
        footer={<p className="text-xs text-[#7A8086]">{plans.length} plans consume this catalogue.</p>}
      />
    </div>
  );
}

/* ------------------------- payments & reports --------------------------- */

export function PaymentsView() {
  const paid = platformPayments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.amount, 0);
  const pending = platformPayments.filter((p) => p.status === "PENDING").reduce((sum, p) => sum + p.amount, 0);
  const byMethod = ["CARD", "BANK_TRANSFER"].map((method) => ({
    label: method.replace("_", " "),
    value: platformPayments
      .filter((p) => p.method === method && p.status === "PAID")
      .reduce((sum, p) => sum + p.amount, 0),
  }));
  return (
    <div>
      <ViewHeader
        title="Platform payments"
        subtitle="Subscription revenue collected from vendors"
        crumbs={[{ label: "Super Admin" }, { label: "Payments" }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Collected" value={compactMoney(paid)} icon="card" tone="green" />
        <StatCard label="Pending" value={compactMoney(pending)} icon="clock" tone="orange" />
        <StatCard label="Invoices" value={num(platformPayments.length)} icon="file" tone="blue" />
        <StatCard
          label="Avg invoice"
          value={money(platformPayments.length ? paid / platformPayments.length : 0)}
          icon="dollar"
          tone="purple"
        />
      </div>
      <Grid>
        <TableCard
          title="Payment ledger"
          rowHref={(row) => `/super-admin/vendors/${row.companyId}?tab=billing`}
          columns={[
            { key: "invoiceNo", label: "Invoice" },
            {
              key: "company",
              label: "Vendor",
              render: (row) => companies.find((c) => c.id === row.companyId)?.name ?? "—",
            },
            { key: "date", label: "Date", render: (row) => dateShort(row.date) },
            { key: "method", label: "Method", render: (row) => row.method.replace("_", " ") },
            {
              key: "amount",
              label: "Amount",
              align: "right",
              render: (row) => <Money value={row.amount} currency={row.currency} strong />,
            },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={platformPayments}
        />
        <Card title="Revenue by method">
          <HorizontalBars data={byMethod} color="#FE9F43" formatValue={(v) => money(v)} />
          <div className="mt-4 border-t border-[#E6EAED] pt-4">
            <SectionTitle hint="Monthly">Recurring revenue</SectionTitle>
            <p className="text-2xl font-bold text-[#212B36]">{money(platformMrr())}</p>
            <p className="text-xs text-[#7A8086]">Annualised {money(platformMrr() * 12)}</p>
          </div>
        </Card>
      </Grid>
    </div>
  );
}

export function PlatformReportsView() {
  const subs = companies.map((company) => subscriptionForCompany(company.id));
  const devices = tenants.flatMap((t) => t.devices);
  const invoiceCount = tenants.reduce((sum, t) => sum + t.sales.length, 0);
  const gmv = tenants.reduce((sum, t) => sum + totalsFor(t, 3650).revenue, 0);
  const signups = (() => {
    const buckets = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      buckets.set(new Intl.DateTimeFormat("en-GB", { month: "short" }).format(d), 0);
    }
    companies.forEach((company) => {
      const key = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(company.createdAt);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    });
    return [...buckets.entries()].map(([label, value]) => ({ label, value }));
  })();

  return (
    <div>
      <ViewHeader
        title="Platform reports"
        subtitle="Revenue, growth and adoption analytics"
        crumbs={[{ label: "Super Admin" }, { label: "Reports" }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="MRR"
          value={money(subs.filter((s) => s.status === "ACTIVE").reduce((sum, s) => sum + s.amount, 0))}
          icon="dollar"
          tone="green"
        />
        <StatCard label="Tenants" value={num(companies.length)} icon="building" tone="blue" />
        <StatCard label="Support tickets" value={num(tickets.length)} icon="inbox" tone="orange" />
        <StatCard label="Devices" value={num(devices.length)} icon="phone" tone="purple" />
      </div>
      <Grid>
        <Card title="Revenue trend" icon="chart">
          <AreaChart data={platformMonthlyRevenue()} />
        </Card>
        <Card title="MRR by plan" icon="pie">
          <HorizontalBars
            data={plans.map((plan) => ({
              label: plan.name,
              value: companies
                .filter((c) => c.planId === plan.id && subscriptionForCompany(c.id).status === "ACTIVE")
                .reduce((sum, c) => sum + subscriptionForCompany(c.id).amount, 0),
            }))}
            color="#092C4C"
            formatValue={(v) => money(v)}
          />
        </Card>
      </Grid>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Vendor signups" icon="users">
          <BarSeries data={signups} color="#FE9F43" />
        </Card>
        <Card title="Platform GMV" icon="cart" subtitle="Sales processed by all tenants">
          <KeyValue
            items={[
              { label: "Invoices", value: num(invoiceCount) },
              { label: "Gross value", value: money(gmv) },
              { label: "Avg invoice", value: money(invoiceCount ? gmv / invoiceCount : 0) },
              {
                label: "Largest tenant",
                value:
                  [...tenants].sort((a, b) => totalsFor(b, 3650).revenue - totalsFor(a, 3650).revenue)[0]
                    ?.company.name ?? "—",
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------- support -------------------------------- */

export function TicketsView({ status }: { status: string }) {
  const [rows, setRows] = useState(tickets);
  const filtered = status === "ALL" ? rows : rows.filter((ticket) => ticket.status === status);
  return (
    <div>
      <ViewHeader
        title="Support tickets"
        subtitle={`${rows.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length} open`}
        crumbs={[{ label: "Super Admin" }, { label: "Support" }]}
      />
      <Card title="Filter by status">
        <div className="flex flex-wrap gap-2">
          {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() =>
                setRows((prev) => (option === "ALL" ? tickets : tickets.filter((t) => t.status === option)))
              }
              className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase ${
                status === option ? "bg-[#092C4C] text-white" : "bg-[#F1F3F5] text-[#646B72]"
              }`}
            >
              {option.replace("_", " ")}
            </button>
          ))}
        </div>
      </Card>
      <div className="mt-4">
        <TableCard
          title="Ticket queue"
          rowHref={(row) => `/super-admin/tickets/${row.id}`}
          columns={[
            { key: "no", label: "Ticket" },
            { key: "subject", label: "Subject", render: (row) => <span className="font-semibold">{row.subject}</span> },
            {
              key: "company",
              label: "Vendor",
              render: (row) =>
                row.companyId ? (companies.find((c) => c.id === row.companyId)?.name ?? "—") : "Prospect",
            },
            { key: "category", label: "Category" },
            { key: "priority", label: "Priority", render: (row) => <StatusBadge value={row.priority} /> },
            { key: "assignee", label: "Assignee", render: (row) => row.assignee ?? "Unassigned" },
            { key: "createdAt", label: "Opened", render: (row) => dateShort(row.createdAt) },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={filtered}
        />
      </div>
    </div>
  );
}

export function TicketDetailView({ id }: { id: number }) {
  const { session } = useSession();
  const [ticket, setTicket] = useState(tickets.find((t) => t.id === id));
  const [reply, setReply] = useState("");
  if (!ticket) return <Card title="Ticket not found">Unknown ticket.</Card>;
  const company = ticket.companyId ? companies.find((c) => c.id === ticket.companyId) : null;

  return (
    <div>
      <ViewHeader
        title={ticket.subject}
        subtitle={`${ticket.no} · ${company?.name ?? "Prospect"} · ${ticket.requester}`}
        crumbs={[
          { label: "Super Admin", href: "/super-admin" },
          { label: "Support", href: "/super-admin/tickets" },
          { label: ticket.no },
        ]}
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              className={btnPrimary}
              onClick={() => setTicket((prev) => (prev ? { ...prev, status: "RESOLVED" } : prev))}
            >
              Mark resolved
            </button>
            <button
              type="button"
              className={btnSoft}
              onClick={() => setTicket((prev) => (prev ? { ...prev, status: "CLOSED" } : prev))}
            >
              Close ticket
            </button>
          </div>
        }
      />
      <Grid>
        <Card title="Conversation">
          <ul className="space-y-4">
            {ticket.messages.map((message, index) => (
              <li
                key={index}
                className={`rounded-xl p-4 ${message.from === "PLATFORM" ? "bg-[#FFF6EE]" : "bg-[#F9FAFB]"}`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[#212B36]">{message.author}</p>
                  <span className="text-[11px] text-[#7A8086]">{dateTime(message.date)}</span>
                </div>
                <p className="whitespace-pre-line text-sm text-[#646B72]">{message.body}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-[#E6EAED] pt-4">
            <Field label="Reply">
              <Textarea
                name="body"
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Write your reply to the vendor…"
              />
            </Field>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                className={btnPrimary}
                onClick={() => {
                  if (!reply.trim()) return;
                  setTicket((prev) =>
                    prev
                      ? {
                          ...prev,
                          status: "IN_PROGRESS",
                          messages: [
                            ...prev.messages,
                            { author: session.name, from: "PLATFORM", body: reply, date: new Date() },
                          ],
                        }
                      : prev,
                  );
                  setReply("");
                }}
              >
                Send reply
              </button>
              <span className="text-[11px] text-[#7A8086]">Signed as {session.name}</span>
            </div>
          </div>
        </Card>
        <div className="space-y-4">
          <Card title="Ticket details">
            <KeyValue
              items={[
                { label: "Ticket no", value: ticket.no },
                { label: "Category", value: ticket.category },
                { label: "Priority", value: <StatusBadge value={ticket.priority} /> },
                { label: "Status", value: <StatusBadge value={ticket.status} /> },
                { label: "Requester", value: ticket.requester },
                { label: "Email", value: ticket.email },
                { label: "Assignee", value: ticket.assignee ?? "Unassigned" },
                { label: "Opened", value: dateShort(ticket.createdAt) },
              ]}
            />
          </Card>
          {company ? (
            <Card title="Vendor">
              <KeyValue
                items={[
                  { label: "Company", value: company.name },
                  { label: "Plan", value: plans.find((p) => p.id === company.planId)?.name ?? "—" },
                  { label: "Status", value: <StatusBadge value={company.status} /> },
                  { label: "Branches", value: num(tenants.find((t) => t.company.id === company.id)?.branches.length ?? 0) },
                ]}
              />
              <Link href={`/super-admin/vendors/${company.id}`} className="mt-3 inline-block text-xs font-bold text-[#FE9F43]">
                Open tenant →
              </Link>
            </Card>
          ) : null}
        </div>
      </Grid>
    </div>
  );
}

/* ---------------------- platform settings & admin ----------------------- */

export function PlatformSettingsView() {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(platformSettings.map((setting) => [setting.key, setting.value])),
  );
  return (
    <div>
      <ViewHeader
        title="System settings"
        subtitle="Global configuration for every tenant"
        crumbs={[{ label: "Super Admin" }, { label: "Settings" }]}
      />
      <FormPanel
        title="Platform configuration"
        submitLabel="Save settings"
        wide
        onSubmit={(submitted) => {
          setValues((prev) => {
            const next = { ...prev };
            platformSettings.forEach((setting) => {
              const value = submitted[`setting_${setting.key}`];
              if (typeof value === "string") next[setting.key] = value;
            });
            return next;
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {platformSettings.map((setting) => (
            <Field
              key={setting.key}
              label={setting.key.replace(/_/g, " ")}
              hint={setting.description}
            >
              {setting.type === "boolean" ? (
                <SelectInput
                  name={`setting_${setting.key}`}
                  defaultValue={values[setting.key]}
                  options={[
                    { value: "true", label: "Enabled" },
                    { value: "false", label: "Disabled" },
                  ]}
                />
              ) : setting.type === "number" ? (
                <NumberInput name={`setting_${setting.key}`} defaultValue={values[setting.key]} />
              ) : (
                <TextInput name={`setting_${setting.key}`} defaultValue={values[setting.key]} />
              )}
            </Field>
          ))}
        </div>
      </FormPanel>
      <div className="mt-4">
        <Card title="Current values" icon="database">
          <KeyValue
            items={[
              { label: "Platform name", value: values.platform_name },
              { label: "Default currency", value: values.default_currency },
              { label: "Default timezone", value: values.default_timezone },
              {
                label: "Maintenance mode",
                value: (
                  <StatusBadge value={values.maintenance_mode === "true" ? "SUSPENDED" : "ACTIVE"} />
                ),
              },
              { label: "Registration", value: values.registration_enabled === "true" ? "Open" : "Closed" },
              { label: "Support inbox", value: values.support_email },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}

export function AdminsView() {
  return (
    <div>
      <ViewHeader
        title="Platform admins"
        subtitle={`${platformAdmins.length} staff with platform access`}
        crumbs={[{ label: "Super Admin" }, { label: "Admin users" }]}
      />
      <Grid>
        <TableCard
          title="Admin accounts"
          columns={[
            {
              key: "name",
              label: "Admin",
              render: (row) => (
                <div>
                  <p className="font-semibold">{row.name}</p>
                  <p className="text-[11px] text-[#7A8086]">{row.email}</p>
                </div>
              ),
            },
            { key: "title", label: "Title" },
            { key: "role", label: "Role", render: (row) => <Badge tone="purple">{row.role}</Badge> },
            { key: "lastLoginAt", label: "Last login", render: (row) => timeAgo(row.lastLoginAt) },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={platformAdmins}
        />
        <FormPanel title="Add platform admin" submitLabel="Create admin">
          <Field label="Name">
            <TextInput name="name" required />
          </Field>
          <Field label="Email">
            <TextInput name="email" type="email" required />
          </Field>
          <Field label="Phone">
            <TextInput name="phone" />
          </Field>
          <Field label="Job title">
            <TextInput name="jobTitle" placeholder="Support Admin" />
          </Field>
          <Field label="Role">
            <SelectInput
              name="roleId"
              options={platformRoles.map((r) => ({ value: r.id, label: r.name }))}
              placeholder="Select role"
            />
          </Field>
          <Field label="Password">
            <TextInput name="password" type="password" defaultValue="password" />
          </Field>
        </FormPanel>
      </Grid>
    </div>
  );
}

export function PlatformRolesView() {
  const groups = useMemo<PermissionGroup[]>(
    () =>
      Object.values(
        PLATFORM_PERMISSIONS.reduce<Record<string, PermissionGroup>>((acc, permission) => {
          acc[permission.module] ??= { module: permission.module, permissions: [] };
          acc[permission.module].permissions.push({ key: permission.key, name: permission.name });
          return acc;
        }, {}),
      ),
    [],
  );
  return (
    <div>
      <ViewHeader
        title="Platform roles & permissions"
        crumbs={[{ label: "Super Admin" }, { label: "Roles" }]}
      />
      <div className="grid gap-4 xl:grid-cols-2">
        {platformRoles.map((role) => (
          <Card
            key={role.id}
            title={role.name}
            subtitle={role.description}
            actions={role.system ? <Badge tone="orange">System</Badge> : null}
          >
            <PermissionMatrix groups={groups} selected={role.permissions} />
            <button type="button" className={`${btnPrimary} mt-4`}>
              Save permissions
            </button>
          </Card>
        ))}
        <FormPanel title="Create platform role" submitLabel="Create role">
          <Field label="Role name">
            <TextInput name="name" required placeholder="Technical Admin" />
          </Field>
          <Field label="Description">
            <TextInput name="description" />
          </Field>
          <PermissionMatrix groups={groups} selected={[]} />
        </FormPanel>
      </div>
    </div>
  );
}

export function AuditView() {
  const moduleCounts = Object.entries(
    auditLogs.reduce<Record<string, number>>((acc, row) => {
      acc[row.module] = (acc[row.module] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([label, value]) => ({ label, value }));
  return (
    <div>
      <ViewHeader
        title="Audit log"
        subtitle="Every privileged action across the platform"
        crumbs={[{ label: "Super Admin" }, { label: "Audit" }]}
      />
      <Grid>
        <TableCard
          title="Recent activity"
          columns={[
            {
              key: "actor",
              label: "Actor",
              render: (row) => (
                <div>
                  <p className="font-semibold">{row.actor}</p>
                  <p className="text-[11px] text-[#7A8086]">
                    {row.actorType} ·{" "}
                    {row.companyId ? (companies.find((c) => c.id === row.companyId)?.name ?? "—") : "Platform"}
                  </p>
                </div>
              ),
            },
            { key: "module", label: "Module" },
            { key: "action", label: "Action", render: (row) => <Badge tone="blue">{row.action}</Badge> },
            { key: "description", label: "Description" },
            { key: "date", label: "When", render: (row) => dateTime(row.date) },
          ]}
          rows={auditLogs}
        />
        <Card title="Activity by module">
          <HorizontalBars data={moduleCounts} color="#092C4C" />
        </Card>
      </Grid>
    </div>
  );
}

export function PlatformDevicesView() {
  const devices = tenants.flatMap((t) =>
    t.devices.map((device) => ({ ...device, companyId: t.company.id })),
  );
  return (
    <div>
      <ViewHeader
        title="API & devices"
        subtitle="Flutter POS fleet status across all tenants"
        crumbs={[{ label: "Super Admin" }, { label: "API & devices" }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Online"
          value={num(devices.filter((d) => d.status === "ONLINE").length)}
          icon="phone"
          tone="green"
        />
        <StatCard
          label="Offline"
          value={num(devices.filter((d) => d.status === "OFFLINE").length)}
          icon="alert"
          tone="red"
        />
        <StatCard label="Tokens" value={num(apiTokens.length)} icon="key" tone="orange" />
      </div>
      <Grid>
        <TableCard
          title="Device fleet"
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
            {
              key: "company",
              label: "Vendor",
              render: (row) => companies.find((c) => c.id === row.companyId)?.name ?? "—",
            },
            { key: "platform", label: "Platform" },
            { key: "appVersion", label: "App" },
            { key: "lastSyncAt", label: "Last sync", render: (row) => timeAgo(row.lastSyncAt) },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={devices}
        />
        <Card title="API tokens" icon="key">
          <div className="space-y-3">
            {apiTokens.map((token) => (
              <div key={token.id} className="rounded-lg border border-[#E6EAED] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{token.name}</p>
                  <StatusBadge value="ACTIVE" />
                </div>
                <p className="mt-1 break-all rounded-md bg-[#F9FAFB] px-2 py-1 font-mono text-[11px] text-[#646B72]">
                  Bearer {token.token}
                </p>
                <p className="mt-1 text-[11px] text-[#7A8086]">
                  {companies.find((c) => c.id === token.companyId)?.name ?? "—"} · {token.abilities.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </Grid>
    </div>
  );
}

export function HealthView() {
  const devices = tenants.flatMap((t) => t.devices);
  const pending = syncQueue.filter((q) => q.status === "PENDING").length;
  const failed = syncQueue.filter((q) => q.status === "FAILED").length;
  const productCount = tenants.reduce((sum, t) => sum + t.products.length, 0);
  const userCount = tenants.reduce((sum, t) => sum + t.users.length, 0);
  const invoiceCount = tenants.reduce((sum, t) => sum + t.sales.length, 0);
  const ledgerCount = tenants.reduce((sum, t) => sum + t.ledger.length, 0);
  return (
    <div>
      <ViewHeader
        title="System health"
        subtitle="Sync queue, adoption and support load"
        crumbs={[{ label: "Super Admin" }, { label: "System health" }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tenants" value={num(companies.length)} icon="building" tone="blue" />
        <StatCard label="Users" value={num(userCount)} icon="users" tone="green" />
        <StatCard label="Products" value={num(productCount)} icon="box" tone="orange" />
        <StatCard label="Invoices" value={num(invoiceCount)} icon="receipt" tone="purple" />
      </div>
      <Grid>
        <Card title="Offline sync queue" icon="refresh">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-3 py-2">
              <span className="text-sm">Pending items</span>
              <span className="font-bold text-[#FE9F43]">{pending}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-3 py-2">
              <span className="text-sm">Failed items</span>
              <span className="font-bold text-[#D63031]">{failed}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-3 py-2">
              <span className="text-sm">Ledger entries</span>
              <span className="font-bold text-[#212B36]">{num(ledgerCount)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-3 py-2">
              <span className="text-sm">Support tickets</span>
              <span className="font-bold text-[#212B36]">{num(tickets.length)}</span>
            </div>
          </div>
          <div className="mt-4 border-t border-[#E6EAED] pt-4">
            <TableCard
              title=""
              columns={[
                { key: "entity", label: "Entity" },
                { key: "device", label: "Device" },
                { key: "attempts", label: "Attempts", align: "right" },
                { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
              ]}
              rows={syncQueue}
            />
          </div>
        </Card>
        <Card title="Service status" icon="server">
          <div className="space-y-3">
            {[
              { label: "API layer", tone: "bg-[#3EB780]", value: "Healthy" },
              { label: "Sync workers", tone: pending > 0 ? "bg-[#FE9F43]" : "bg-[#3EB780]", value: pending > 0 ? "Draining" : "Idle" },
              { label: "Push notifications", tone: "bg-[#3EB780]", value: "Healthy" },
              { label: "Backups", tone: "bg-[#3EB780]", value: "Nightly 02:00" },
              { label: "Device fleet", tone: "bg-[#3EB780]", value: `${devices.filter((d) => d.status === "ONLINE").length} online` },
            ].map((service) => (
              <div key={service.label} className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-3 py-2">
                <span className="flex items-center gap-2 text-sm">
                  <span className={`h-2 w-2 rounded-full ${service.tone}`} />
                  {service.label}
                </span>
                <span className="text-xs font-bold text-[#646B72]">{service.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </Grid>
    </div>
  );
}

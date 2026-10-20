"use client";

import Link from "next/link";
import { Badge, Card, StatCard } from "@/components/ui";
import { DataTable, btnPrimary } from "@/components/ui";
import { AreaChart, BarSeries, Donut, HorizontalBars } from "@/components/charts";
import { StatusBadge } from "@/views/parts";
import { useTenant } from "@/lib/session";
import {
  cashierPerformance,
  categorySales,
  dailySalesSeries,
  lowStock,
  paymentMix,
  stockValue,
  topProducts,
  totalsFor,
} from "@/lib/mock";
import { money, num, timeAgo, toNum } from "@/lib/format";

export default function VendorDashboard() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const today = totalsFor(tenant, 1);
  const month = totalsFor(tenant, 30);
  const daily = dailySalesSeries(tenant, 14);
  const top = topProducts(tenant, 5, 30);
  const low = lowStock(tenant).slice(0, 5);
  const recent = tenant.sales.slice(0, 6);
  const mix = paymentMix(tenant, 30);
  const cats = categorySales(tenant, 30);
  const cashiers = cashierPerformance(tenant, 30);
  const colors = ["#FE9F43", "#092C4C", "#0984E3", "#6C5CE7", "#009688"];
  const weekAgo = daily.length > 7 ? daily[daily.length - 8].value : daily[0]?.value ?? 0;
  const delta = weekAgo > 0 ? ((daily[daily.length - 1].value - weekAgo) / weekAgo) * 100 : 0;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav className="mb-1.5 text-xs text-[#7A8086]">Dashboard</nav>
          <h1 className="text-xl font-bold text-[#212B36]">{tenant.company.name} dashboard</h1>
          <p className="mt-1 text-sm text-[#646B72]">
            Live snapshot of sales, stock and cash across {tenant.branches.length} branches
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/pos" className={btnPrimary}>
            Open POS
          </Link>
          <Link
            href="/reports/sales"
            className="inline-flex items-center gap-2 rounded-lg border border-[#E6EAED] bg-white px-3.5 py-2 text-sm font-semibold"
          >
            Sales report
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's revenue"
          value={money(today.revenue, currency)}
          sub={`${num(today.count)} invoices`}
          icon="dollar"
          tone="green"
          delta={{ value: `${num(delta, 1)}%`, positive: delta >= 0 }}
        />
        <StatCard
          label="Revenue (30d)"
          value={money(month.revenue, currency)}
          sub={`${num(month.count)} invoices`}
          icon="chart"
          tone="orange"
        />
        <StatCard
          label="Gross profit (30d)"
          value={money(month.profit, currency)}
          sub={`${num(month.margin, 1)}% margin`}
          icon="up"
          tone="purple"
        />
        <StatCard
          label="Stock value"
          value={money(stockValue(tenant), currency)}
          sub={`${tenant.products.length} products`}
          icon="box"
          tone="blue"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Sales trend (14 days)" icon="chart" className="lg:col-span-2">
          <AreaChart data={daily.map((d) => ({ label: d.label, value: d.value }))} height={220} />
        </Card>
        <Card title="Payment mix (30d)" icon="card">
          <Donut
            slices={mix.map((m, i) => ({ label: m.method, value: m.total, color: colors[i % colors.length] }))}
            centerValue={money(mix.reduce((sum, m) => sum + m.total, 0), currency)}
            centerLabel="Collected"
          />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Top selling products" icon="award">
          <ul className="space-y-3">
            {top.map((product) => (
              <li key={product.productId} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/products/${product.productId}`}
                    className="block truncate text-sm font-medium text-[#212B36] hover:text-[#FE9F43]"
                  >
                    {product.name}
                  </Link>
                  <p className="text-[11px] text-[#7A8086]">{num(product.qty)} units sold</p>
                </div>
                <span className="shrink-0 text-sm font-bold">{money(product.revenue, currency)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Low stock" icon="alert">
          {low.length === 0 ? (
            <p className="text-sm text-[#7A8086]">Every product is above its reorder level.</p>
          ) : (
            <ul className="space-y-3">
              {low.map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-3">
                  <Link
                    href={`/products/${product.id}`}
                    className="min-w-0 truncate text-sm font-medium text-[#212B36] hover:text-[#FE9F43]"
                  >
                    {product.name}
                  </Link>
                  <span className="shrink-0 rounded-full bg-[#FDECEC] px-2 py-0.5 text-[11px] font-bold text-[#D63031]">
                    {num(product.stock)} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Category statistics" icon="pie">
          <HorizontalBars data={cats} color="#FE9F43" formatValue={(v) => money(v, currency)} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Recent transactions" icon="receipt" className="lg:col-span-2">
          <DataTable
            columns={[
              {
                key: "invoiceNo",
                label: "Invoice",
                render: (row) => (
                  <div>
                    <p className="font-semibold">{row.invoiceNo}</p>
                    <p className="text-[11px] text-[#7A8086]">{timeAgo(row.date)}</p>
                  </div>
                ),
              },
              {
                key: "customer",
                label: "Customer",
                render: (row) =>
                  row.customerId
                    ? (tenant.customers.find((c) => c.id === row.customerId)?.name ?? "Walk-in")
                    : "Walk-in",
              },
              {
                key: "total",
                label: "Total",
                align: "right",
                render: (row) => <span className="font-bold">{money(row.total, currency)}</span>,
              },
              {
                key: "paymentStatus",
                label: "Payment",
                render: (row) => <StatusBadge value={row.paymentStatus} />,
              },
              { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
            ]}
            rows={recent}
            rowHref={(row) => `/sales/${row.id}`}
          />
        </Card>

        <div className="space-y-4">
          <Card title="Cashier performance" icon="users">
            <HorizontalBars
              data={cashiers.slice(0, 5).map((c) => ({ label: c.label, value: c.value }))}
              color="#092C4C"
              formatValue={(v) => money(v, currency)}
            />
          </Card>
          <Card title="Organisation" icon="building">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-[#F9FAFB] p-3">
                <p className="text-xl font-bold">{tenant.branches.length}</p>
                <p className="text-[11px] text-[#7A8086]">Branches</p>
              </div>
              <div className="rounded-lg bg-[#F9FAFB] p-3">
                <p className="text-xl font-bold">{tenant.warehouses.length}</p>
                <p className="text-[11px] text-[#7A8086]">Warehouses</p>
              </div>
              <div className="rounded-lg bg-[#F9FAFB] p-3">
                <p className="text-xl font-bold">{tenant.customers.length}</p>
                <p className="text-[11px] text-[#7A8086]">Customers</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Daily invoice volume" icon="chart">
          <BarSeries
            data={daily.slice(-7).map((d) => ({ label: d.label, value: d.count }))}
            color="#092C4C"
            formatValue={(v) => `${num(v)} sales`}
          />
        </Card>
        <Card title="Notifications" icon="bell">
          <ul className="space-y-3">
            {tenant.notifications.map((notification) => (
              <li key={notification.id} className="rounded-lg bg-[#F9FAFB] px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#212B36]">{notification.title}</p>
                  <Badge tone="orange">{notification.type.replace("_", " ")}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-[#646B72]">{notification.message}</p>
                <p className="mt-0.5 text-[11px] text-[#7A8086]">{timeAgo(notification.date)}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4">
        <Card title="Today at a glance" icon="clock">
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { label: "Invoices", value: num(today.count) },
              { label: "Revenue", value: money(today.revenue, currency) },
              { label: "Gross profit", value: money(today.profit, currency) },
              { label: "Tax collected", value: money(today.tax, currency) },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-[#F9FAFB] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7A8086]">
                  {item.label}
                </p>
                <p className="mt-1 text-lg font-bold text-[#212B36]">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[#7A8086]">
            Outstanding credit across all customers:{" "}
            {money(
              tenant.sales
                .filter((sale) => sale.paymentStatus !== "PAID")
                .reduce((sum, sale) => sum + toNum(sale.balance), 0),
              currency,
            )}
          </p>
        </Card>
      </div>
    </div>
  );
}

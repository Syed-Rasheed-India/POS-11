"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Card, KeyValue, SectionTitle, StatCard, Tabs } from "@/components/ui";
import { Field, NumberInput, SelectInput, TextInput, Textarea, btnPrimary } from "@/components/ui";
import { Grid, FormPanel, Money, Qty, StatusBadge, TableCard, ViewHeader } from "../parts";
import { useTenant } from "@/lib/session";
import { stockValue } from "@/lib/mock";
import { dateShort, dateTime, num, toNum } from "@/lib/format";

/* -------------------------------- stock -------------------------------- */

export function StockView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const rows = tenant.products;
  const totalValue = stockValue(tenant);
  const low = rows.filter((p) => p.stock <= p.reorderLevel);

  return (
    <div>
      <ViewHeader
        title="Manage stock"
        subtitle={`${tenant.warehouses.length} warehouses · ${rows.length} products`}
        crumbs={[{ label: "Inventory" }, { label: "Stock" }]}
        actions={
          <div className="flex gap-2">
            <Link href="/adjustments/new" className={btnPrimary}>
              + Adjustment
            </Link>
            <Link
              href="/transfers/new"
              className="inline-flex items-center gap-2 rounded-lg border border-[#FBD5D5] bg-white px-3 py-1.5 text-sm font-semibold text-[#D63031] hover:bg-[#FEF2F2]"
            >
              + Transfer
            </Link>
          </div>
        }
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Stock value (cost)" value={`${currency} ${num(totalValue)}`} icon="dollar" tone="blue" />
        <StatCard label="Products" value={num(rows.length)} icon="box" tone="orange" />
        <StatCard label="Below reorder" value={num(low.length)} icon="alert" tone="red" />
        <StatCard label="Warehouses" value={num(tenant.warehouses.length)} icon="warehouse" tone="purple" />
      </div>
      <TableCard
        title="Stock balances"
        rowHref={(row) => `/products/${row.id}`}
        columns={[
          {
            key: "name",
            label: "Product",
            render: (row) => (
              <div>
                <p className="font-semibold">{row.name}</p>
                <p className="text-[11px] text-[#7A8086]">{row.sku}</p>
              </div>
            ),
          },
          {
            key: "category",
            label: "Category",
            render: (row) => tenant.categories.find((c) => c.id === row.categoryId)?.name ?? "—",
          },
          {
            key: "stock",
            label: "On hand",
            align: "right",
            render: (row) => (
              <span className={row.stock <= row.reorderLevel ? "font-bold text-[#D63031]" : "font-medium"}>
                {num(row.stock, row.stock % 1 === 0 ? 0 : 2)}
              </span>
            ),
          },
          { key: "reorder", label: "Reorder level", align: "right", render: (row) => num(row.reorderLevel) },
          {
            key: "value",
            label: "Value",
            align: "right",
            render: (row) => <Money value={row.stock * row.cost} currency={currency} strong />,
          },
          {
            key: "status",
            label: "Flag",
            render: (row) =>
              row.stock <= row.reorderLevel ? <StatusBadge value="LOW" /> : <StatusBadge value="ACTIVE" />,
          },
        ]}
        rows={rows}
      />
      {low.length > 0 ? (
        <div className="mt-4">
          <Card title="Low stock alerts" icon="alert">
            <ul className="space-y-2">
              {low.slice(0, 8).map((row) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between rounded-lg bg-[#FEF6F6] px-3 py-2"
                >
                  <span className="text-sm font-medium">{row.name}</span>
                  <span className="text-xs font-bold text-[#D63031]">
                    {num(row.stock)} left · reorder at {num(row.reorderLevel)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

export function LedgerView() {
  const tenant = useTenant();
  return (
    <div>
      <ViewHeader
        title="Stock ledger"
        subtitle="Every movement that touched your inventory"
        crumbs={[{ label: "Inventory" }, { label: "Ledger" }]}
      />
      <TableCard
        title="Inventory transactions"
        columns={[
          {
            key: "type",
            label: "Type",
            render: (row) => <Badge tone="blue">{row.type.replace(/_/g, " ")}</Badge>,
          },
          {
            key: "product",
            label: "Product",
            render: (row) => tenant.products.find((p) => p.id === row.productId)?.name ?? "—",
          },
          {
            key: "warehouse",
            label: "Warehouse",
            render: (row) => tenant.warehouses.find((w) => w.id === row.warehouseId)?.name ?? "—",
          },
          { key: "ref", label: "Reference" },
          {
            key: "qty",
            label: "Qty",
            align: "right",
            render: (row) => (
              <span className={row.direction === "IN" ? "font-bold text-[#3EB780]" : "font-bold text-[#D63031]"}>
                {row.direction === "IN" ? "+" : "−"}
                {num(row.qty, 2)}
              </span>
            ),
          },
          { key: "date", label: "When", render: (row) => dateTime(row.date) },
        ]}
        rows={tenant.ledger.slice(0, 120)}
      />
    </div>
  );
}

/* ----------------------------- adjustments ----------------------------- */

export function AdjustmentsView() {
  const tenant = useTenant();
  return (
    <div>
      <ViewHeader
        title="Stock adjustments"
        crumbs={[{ label: "Inventory" }, { label: "Adjustments" }]}
        actions={
          <Link href="/adjustments/new" className={btnPrimary}>
            + New adjustment
          </Link>
        }
      />
      <TableCard
        title="Adjustment documents"
        columns={[
          { key: "ref", label: "Reference" },
          {
            key: "warehouse",
            label: "Warehouse",
            render: (row) => tenant.warehouses.find((w) => w.id === row.warehouseId)?.name ?? "—",
          },
          { key: "reason", label: "Reason" },
          { key: "date", label: "Date", render: (row) => dateShort(row.date) },
          { key: "user", label: "Posted by" },
          { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          {
            key: "lines",
            label: "Lines",
            align: "right",
            render: (row) => num(row.lines.length),
          },
        ]}
        rows={tenant.adjustments}
        emptyTitle="No adjustments yet"
      />
    </div>
  );
}

export function AdjustmentFormView() {
  const tenant = useTenant();
  const [rows, setRows] = useStateRows(tenant.products.slice(0, 4).map((p) => p.id));
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <ViewHeader
        title="New stock adjustment"
        subtitle="Post a physical count variance against a warehouse"
        crumbs={[{ label: "Inventory", href: "/adjustments" }, { label: "New" }]}
      />
      <Grid>
        <Card title="Adjustment">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Warehouse">
                <SelectInput
                  defaultValue={tenant.warehouses[0].id}
                  options={tenant.warehouses.map((w) => ({ value: w.id, label: w.name }))}
                />
              </Field>
              <Field label="Reason">
                <TextInput defaultValue="Physical count variance" />
              </Field>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="bg-[#F9FAFB] text-left">
                    <th className="border-b border-[#E6EAED] px-3 py-2 text-[11px] font-bold uppercase text-[#646B72]">
                      Product
                    </th>
                    <th className="border-b border-[#E6EAED] px-3 py-2 text-[11px] font-bold uppercase text-[#646B72]">
                      System qty
                    </th>
                    <th className="border-b border-[#E6EAED] px-3 py-2 text-[11px] font-bold uppercase text-[#646B72]">
                      Counted qty
                    </th>
                    <th className="border-b border-[#E6EAED] px-3 py-2 text-right text-[11px] font-bold uppercase text-[#646B72]">
                      Difference
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const product = tenant.products.find((p) => p.id === row.productId);
                    const diff = toNum(row.counted) - (product?.stock ?? 0);
                    return (
                      <tr key={row.productId} className="border-b border-[#F1F3F5]">
                        <td className="px-3 py-2">
                          <select
                            value={row.productId}
                            onChange={(event) =>
                              setRows((prev) =>
                                prev.map((r, i) =>
                                  i === row.index ? { ...r, productId: Number(event.target.value), counted: "" } : r,
                                ),
                              )
                            }
                            className="w-full rounded-lg border border-[#E6EAED] px-2 py-1.5 text-sm"
                          >
                            {tenant.products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">{num(product?.stock ?? 0, 2)}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="any"
                            value={row.counted}
                            onChange={(event) =>
                              setRows((prev) =>
                                prev.map((r, i) => (i === row.index ? { ...r, counted: event.target.value } : r)),
                              )
                            }
                            className="w-28 rounded-lg border border-[#E6EAED] px-2 py-1.5 text-sm"
                          />
                        </td>
                        <td
                          className={`px-3 py-2 text-right font-bold ${
                            diff < 0 ? "text-[#D63031]" : "text-[#3EB780]"
                          }`}
                        >
                          {diff > 0 ? "+" : ""}
                          {num(diff, 2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={btnPrimary}
                onClick={() => {
                  tenant.adjustments.unshift({
                    id: Math.max(...tenant.adjustments.map((a) => a.id)) + 1,
                    ref: `ADJ-${tenant.settings.invoice_prefix}-${String(tenant.adjustments.length + 1).padStart(4, "0")}`,
                    warehouseId: tenant.warehouses[0].id,
                    reason: "Physical count variance",
                    date: new Date(),
                    status: "APPROVED",
                    user: tenant.users[0].name,
                    lines: rows.map((row) => {
                      const product = tenant.products.find((p) => p.id === row.productId);
                      const system = product?.stock ?? 0;
                      const counted = toNum(row.counted);
                      return { productId: row.productId, system, counted, diff: counted - system };
                    }),
                  });
                  setSaved(true);
                }}
              >
                Post adjustment
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#D3D5D7] px-3 py-2 text-sm font-semibold text-[#646B72]"
                onClick={() =>
                  setRows((prev) => [
                    ...prev,
                    { index: prev.length, productId: tenant.products[prev.length % tenant.products.length].id, counted: "" },
                  ])
                }
              >
                + Add line
              </button>
              {saved ? (
                <span className="rounded-lg bg-[#EAF8F1] px-2.5 py-1 text-xs font-bold text-[#2C7A57]">
                  Adjustment posted in this demo session
                </span>
              ) : null}
            </div>
          </div>
        </Card>
        <Card title="How adjustments work">
          <ul className="space-y-2 text-sm text-[#646B72]">
            <li>• Enter the quantity you counted for each product.</li>
            <li>• The system compares it to the current balance and posts the difference.</li>
            <li>• Positive differences stock in, negative differences stock out.</li>
            <li>• Every line is written to the inventory ledger for auditing.</li>
          </ul>
        </Card>
      </Grid>
    </div>
  );
}

function useStateRows(productIds: number[]) {
  const [rows, setRows] = useState(
    productIds.map((productId, index) => ({ index, productId, counted: "" })),
  );
  return [rows, setRows] as const;
}

/* ------------------------------- transfers ------------------------------ */

export function TransfersView() {
  const tenant = useTenant();
  return (
    <div>
      <ViewHeader
        title="Stock transfers"
        crumbs={[{ label: "Inventory" }, { label: "Transfers" }]}
        actions={
          <Link href="/transfers/new" className={btnPrimary}>
            + New transfer
          </Link>
        }
      />
      <TableCard
        title="Transfer documents"
        columns={[
          { key: "ref", label: "Reference" },
          {
            key: "from",
            label: "From",
            render: (row) => tenant.warehouses.find((w) => w.id === row.from)?.name ?? "—",
          },
          {
            key: "to",
            label: "To",
            render: (row) => tenant.warehouses.find((w) => w.id === row.to)?.name ?? "—",
          },
          { key: "date", label: "Date", render: (row) => dateShort(row.date) },
          { key: "note", label: "Note" },
          { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          { key: "lines", label: "Lines", align: "right", render: (row) => num(row.lines.length) },
        ]}
        rows={tenant.transfers}
        emptyTitle="No transfers yet"
      />
    </div>
  );
}

export function TransferFormView() {
  const tenant = useTenant();
  const [rows, setRows] = useState(
    tenant.products.slice(0, 3).map((product, index) => ({ index, productId: product.id, qty: 5 })),
  );
  const [from, setFrom] = useState(tenant.warehouses[0].id);
  const [to, setTo] = useState(tenant.warehouses[tenant.warehouses.length - 1].id);
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <ViewHeader
        title="New stock transfer"
        crumbs={[{ label: "Inventory", href: "/transfers" }, { label: "New" }]}
      />
      <Grid>
        <Card title="Transfer">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="From warehouse">
                <SelectInput
                  value={from}
                  onChange={(event) => setFrom(Number(event.target.value))}
                  options={tenant.warehouses.map((w) => ({ value: w.id, label: w.name }))}
                />
              </Field>
              <Field label="To warehouse">
                <SelectInput
                  value={to}
                  onChange={(event) => setTo(Number(event.target.value))}
                  options={tenant.warehouses.map((w) => ({ value: w.id, label: w.name }))}
                />
              </Field>
              <Field label="Note">
                <TextInput defaultValue="Weekly replenishment" />
              </Field>
            </div>
            {from === to ? (
              <p className="rounded-lg bg-[#FDECEC] px-3 py-2 text-sm font-semibold text-[#D63031]">
                Source and destination warehouses must be different.
              </p>
            ) : null}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="bg-[#F9FAFB] text-left">
                    <th className="border-b border-[#E6EAED] px-3 py-2 text-[11px] font-bold uppercase text-[#646B72]">
                      Product
                    </th>
                    <th className="border-b border-[#E6EAED] px-3 py-2 text-[11px] font-bold uppercase text-[#646B72]">
                      Available
                    </th>
                    <th className="border-b border-[#E6EAED] px-3 py-2 text-[11px] font-bold uppercase text-[#646B72]">
                      Transfer qty
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const product = tenant.products.find((p) => p.id === row.productId);
                    return (
                      <tr key={row.index} className="border-b border-[#F1F3F5]">
                        <td className="px-3 py-2">
                          <select
                            value={row.productId}
                            onChange={(event) =>
                              setRows((prev) =>
                                prev.map((r, i) =>
                                  i === row.index ? { ...r, productId: Number(event.target.value) } : r,
                                ),
                              )
                            }
                            className="w-full rounded-lg border border-[#E6EAED] px-2 py-1.5 text-sm"
                          >
                            {tenant.products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">{num(product?.stock ?? 0, 2)}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="any"
                            value={row.qty}
                            onChange={(event) =>
                              setRows((prev) =>
                                prev.map((r, i) => (i === row.index ? { ...r, qty: Number(event.target.value) } : r)),
                              )
                            }
                            className="w-28 rounded-lg border border-[#E6EAED] px-2 py-1.5 text-sm"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={btnPrimary}
                disabled={from === to}
                onClick={() => {
                  tenant.transfers.unshift({
                    id: Math.max(...tenant.transfers.map((t) => t.id), 0) + 1,
                    ref: `TRF-${tenant.settings.invoice_prefix}-${String(tenant.transfers.length + 1).padStart(4, "0")}`,
                    from,
                    to,
                    date: new Date(),
                    status: "RECEIVED",
                    note: "Weekly replenishment",
                    lines: rows.map((row) => ({ productId: row.productId, qty: row.qty })),
                  });
                  setSaved(true);
                }}
              >
                Post transfer
              </button>
              {saved ? (
                <span className="rounded-lg bg-[#EAF8F1] px-2.5 py-1 text-xs font-bold text-[#2C7A57]">
                  Transfer posted — stock moved between warehouses
                </span>
              ) : null}
            </div>
          </div>
        </Card>
        <Card title="Transfer rules">
          <ul className="space-y-2 text-sm text-[#646B72]">
            <li>• Stock leaves the source warehouse and lands in the destination.</li>
            <li>• Two ledger entries are written: TRANSFER_OUT and TRANSFER_IN.</li>
            <li>• Transfers across branches move ownership of the stock.</li>
          </ul>
        </Card>
      </Grid>
    </div>
  );
}

/* ------------------------------ valuation ------------------------------ */

export function ValuationView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const rows = tenant.products.map((product) => ({
    id: product.id,
    productId: product.id,
    name: product.name,
    warehouseId: tenant.warehouses[0].id,
    warehouse: tenant.warehouses[0].name,
    qty: product.stock,
    avgCost: product.cost,
    value: product.stock * product.cost,
  }));
  const byWarehouse = new Map<string, number>();
  rows.forEach((row) => byWarehouse.set(row.warehouse, (byWarehouse.get(row.warehouse) ?? 0) + row.value));
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <div>
      <ViewHeader
        title="Stock valuation"
        subtitle={`Total cost value ${currency} ${num(total)}`}
        crumbs={[{ label: "Inventory" }, { label: "Valuation" }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total value" value={`${currency} ${num(total)}`} icon="dollar" tone="green" />
        <StatCard label="Stock lines" value={num(rows.length)} icon="layers" tone="blue" />
        <StatCard label="Warehouses" value={num(byWarehouse.size)} icon="warehouse" tone="orange" />
      </div>
      <Card title="Value by warehouse">
        <div className="space-y-3">
          {[...byWarehouse.entries()].map(([warehouse, value]) => (
            <div key={warehouse} className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-3 py-2">
              <span className="text-sm font-medium">{warehouse}</span>
              <span className="text-sm font-bold">
                {currency} {num(value, 2)}
              </span>
            </div>
          ))}
        </div>
      </Card>
      <div className="mt-4">
        <TableCard
          title="Valuation detail"
          rowHref={(row) => `/products/${row.productId}`}
          columns={[
            { key: "name", label: "Product" },
            { key: "warehouse", label: "Warehouse" },
            { key: "qty", label: "Qty", align: "right", render: (row) => <Qty value={row.qty} /> },
            {
              key: "avgCost",
              label: "Avg cost",
              align: "right",
              render: (row) => <Money value={row.avgCost} currency={currency} />,
            },
            {
              key: "value",
              label: "Value",
              align: "right",
              render: (row) => <Money value={row.value} currency={currency} strong />,
            },
          ]}
          rows={rows.slice(0, 120)}
        />
      </div>
    </div>
  );
}

/* ------------------------------- suppliers ------------------------------ */

export function SuppliersView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  return (
    <div>
      <ViewHeader
        title="Suppliers"
        subtitle={`${tenant.suppliers.length} suppliers`}
        crumbs={[{ label: "Purchasing" }, { label: "Suppliers" }]}
      />
      <TableCard
        title="Supplier list"
        rowHref={(row) => `/suppliers/${row.id}`}
        columns={[
          {
            key: "name",
            label: "Supplier",
            render: (row) => (
              <div>
                <p className="font-semibold">{row.name}</p>
                <p className="text-[11px] text-[#7A8086]">{row.code}</p>
              </div>
            ),
          },
          { key: "contact", label: "Contact" },
          { key: "phone", label: "Phone" },
          { key: "terms", label: "Terms", render: (row) => `${row.terms} days` },
          {
            key: "creditLimit",
            label: "Credit limit",
            align: "right",
            render: (row) => <Money value={row.creditLimit} currency={currency} />,
          },
          { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]}
        rows={tenant.suppliers}
      />
    </div>
  );
}

export function SupplierDetailView({ id, tab }: { id: number; tab: string }) {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const supplier = tenant.suppliers.find((s) => s.id === id);
  if (!supplier) return <Card title="Supplier not found">Unknown supplier.</Card>;
  const orders = tenant.purchaseOrders.filter((po) => po.supplierId === supplier.id);
  const invoices = tenant.purchaseInvoices.filter((i) => i.supplierId === supplier.id);
  return (
    <div>
      <ViewHeader
        title={supplier.name}
        subtitle={`${supplier.code} · ${supplier.email}`}
        crumbs={[{ label: "Purchasing", href: "/suppliers" }, { label: supplier.name }]}
      />
      <Tabs
        baseHref={`/suppliers/${id}`}
        active={tab}
        tabs={[
          { key: "overview", label: "Overview" },
          { key: "orders", label: "Purchase orders" },
          { key: "invoices", label: "Invoices" },
        ]}
      />
      {tab === "orders" ? (
        <TableCard
          title="Purchase orders"
          rowHref={(row) => `/purchase-orders/${row.id}`}
          columns={[
            { key: "ref", label: "Reference" },
            { key: "date", label: "Date", render: (row) => dateShort(row.date) },
            {
              key: "total",
              label: "Total",
              align: "right",
              render: (row) => <Money value={row.total} currency={currency} strong />,
            },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={orders}
        />
      ) : tab === "invoices" ? (
        <TableCard
          title="Supplier invoices"
          columns={[
            { key: "no", label: "Invoice" },
            { key: "date", label: "Date", render: (row) => dateShort(row.date) },
            {
              key: "amount",
              label: "Amount",
              align: "right",
              render: (row) => <Money value={row.amount} currency={currency} strong />,
            },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={invoices}
        />
      ) : (
        <Grid>
          <Card title="Supplier profile">
            <KeyValue
              items={[
                { label: "Code", value: supplier.code },
                { label: "Contact person", value: supplier.contact },
                { label: "Phone", value: supplier.phone },
                { label: "Email", value: supplier.email },
                { label: "Tax number", value: supplier.taxNumber },
                { label: "Payment terms", value: `${supplier.terms} days` },
                { label: "Credit limit", value: `${currency} ${num(supplier.creditLimit, 2)}` },
                { label: "Status", value: <StatusBadge value={supplier.status} /> },
              ]}
            />
          </Card>
          <Card title="Address">
            <p className="text-sm text-[#646B72]">{supplier.address}</p>
            <div className="mt-4">
              <SectionTitle hint="Payables">Outstanding</SectionTitle>
              <p className="text-2xl font-bold text-[#212B36]">
                {currency}{" "}
                {num(invoices.reduce((sum, i) => sum + (i.amount - i.paid), 0), 2)}
              </p>
              <p className="text-xs text-[#7A8086]">Across {invoices.length} supplier bills</p>
            </div>
          </Card>
        </Grid>
      )}
    </div>
  );
}

/* ---------------------------- purchase orders --------------------------- */

export function PurchaseOrdersView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const open = tenant.purchaseOrders.filter((po) => po.status === "SENT" || po.status === "PARTIAL");
  return (
    <div>
      <ViewHeader
        title="Purchase orders"
        crumbs={[{ label: "Purchasing" }, { label: "Purchase orders" }]}
        actions={
          <Link href="/purchase-orders/new" className={btnPrimary}>
            + New purchase order
          </Link>
        }
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Purchase orders" value={num(tenant.purchaseOrders.length)} icon="file" tone="orange" />
        <StatCard label="Awaiting delivery" value={num(open.length)} icon="truck" tone="blue" />
        <StatCard
          label="Committed spend"
          value={`${currency} ${num(tenant.purchaseOrders.reduce((sum, po) => sum + po.total, 0))}`}
          icon="dollar"
          tone="green"
        />
      </div>
      <TableCard
        title="Purchase order list"
        rowHref={(row) => `/purchase-orders/${row.id}`}
        columns={[
          {
            key: "ref",
            label: "Reference",
            render: (row) => (
              <div>
                <p className="font-semibold">{row.ref}</p>
                <p className="text-[11px] text-[#7A8086]">{dateShort(row.date)}</p>
              </div>
            ),
          },
          {
            key: "supplier",
            label: "Supplier",
            render: (row) => tenant.suppliers.find((s) => s.id === row.supplierId)?.name ?? "—",
          },
          {
            key: "warehouse",
            label: "Warehouse",
            render: (row) => tenant.warehouses.find((w) => w.id === row.warehouseId)?.name ?? "—",
          },
          {
            key: "total",
            label: "Total",
            align: "right",
            render: (row) => <Money value={row.total} currency={currency} strong />,
          },
          { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]}
        rows={tenant.purchaseOrders}
        emptyTitle="No purchase orders"
      />
    </div>
  );
}

function expectedDateDefault() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export function PurchaseOrderFormView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const [rows, setRows] = useState(
    tenant.products.slice(0, 3).map((product, index) => ({
      index,
      productId: product.id,
      qty: 20,
      cost: product.cost,
      tax: product.tax,
    })),
  );
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <ViewHeader
        title="New purchase order"
        crumbs={[{ label: "Purchasing", href: "/purchase-orders" }, { label: "New" }]}
      />
      <Card title="Purchase order">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Supplier">
              <SelectInput
                defaultValue={tenant.suppliers[0].id}
                options={tenant.suppliers.map((s) => ({ value: s.id, label: s.name }))}
              />
            </Field>
            <Field label="Warehouse">
              <SelectInput
                defaultValue={tenant.warehouses[0].id}
                options={tenant.warehouses.map((w) => ({ value: w.id, label: w.name }))}
              />
            </Field>
            <Field label="Expected date">
              <TextInput type="date" defaultValue={expectedDateDefault()} />
            </Field>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="bg-[#F9FAFB] text-left">
                  {["Product", "Quantity", "Unit cost", "Tax %", "Line total"].map((head) => (
                    <th
                      key={head}
                      className="border-b border-[#E6EAED] px-3 py-2 text-[11px] font-bold uppercase text-[#646B72]"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.index} className="border-b border-[#F1F3F5]">
                    <td className="px-3 py-2">
                      <select
                        value={row.productId}
                        onChange={(event) => {
                          const product = tenant.products.find((p) => p.id === Number(event.target.value));
                          setRows((prev) =>
                            prev.map((r, i) =>
                              i === row.index
                                ? { ...r, productId: Number(event.target.value), cost: product?.cost ?? r.cost }
                                : r,
                            ),
                          );
                        }}
                        className="w-full rounded-lg border border-[#E6EAED] px-2 py-1.5 text-sm"
                      >
                        {tenant.products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={row.qty}
                        onChange={(event) =>
                          setRows((prev) =>
                            prev.map((r, i) => (i === row.index ? { ...r, qty: Number(event.target.value) } : r)),
                          )
                        }
                        className="w-24 rounded-lg border border-[#E6EAED] px-2 py-1.5 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="any"
                        value={row.cost}
                        onChange={(event) =>
                          setRows((prev) =>
                            prev.map((r, i) => (i === row.index ? { ...r, cost: Number(event.target.value) } : r)),
                          )
                        }
                        className="w-24 rounded-lg border border-[#E6EAED] px-2 py-1.5 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={row.tax}
                        onChange={(event) =>
                          setRows((prev) =>
                            prev.map((r, i) => (i === row.index ? { ...r, tax: Number(event.target.value) } : r)),
                          )
                        }
                        className="w-20 rounded-lg border border-[#E6EAED] px-2 py-1.5 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">
                      {currency} {num(row.qty * row.cost * (1 + row.tax / 100), 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={btnPrimary}
              onClick={() => {
                const lines = rows.map((row) => ({
                  productId: row.productId,
                  qty: row.qty,
                  received: 0,
                  cost: row.cost,
                }));
                const subtotal = lines.reduce((sum, l) => sum + l.qty * l.cost, 0);
                const tax = lines.reduce((sum, l) => sum + l.qty * l.cost * (rows.find((r) => r.productId === l.productId)?.tax ?? 0) / 100, 0);
                tenant.purchaseOrders.unshift({
                  id: Math.max(...tenant.purchaseOrders.map((po) => po.id)) + 1,
                  ref: `PO-${tenant.settings.invoice_prefix}-${String(tenant.purchaseOrders.length + 1).padStart(4, "0")}`,
                  supplierId: tenant.suppliers[0].id,
                  warehouseId: tenant.warehouses[0].id,
                  date: new Date(),
                  expected: new Date(Date.now() + 7 * 86400000),
                  status: "SENT",
                  subtotal,
                  tax,
                  total: subtotal + tax,
                  lines,
                  notes: "Raised from the vendor panel",
                });
                setSaved(true);
              }}
            >
              Raise purchase order
            </button>
            {saved ? (
              <span className="rounded-lg bg-[#EAF8F1] px-2.5 py-1 text-xs font-bold text-[#2C7A57]">
                Purchase order created and sent to the supplier
              </span>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}

export function PurchaseOrderDetailView({ id }: { id: number }) {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const po = tenant.purchaseOrders.find((p) => p.id === id);
  if (!po) return <Card title="Purchase order not found">Unknown purchase order.</Card>;
  const grns = tenant.grns.filter((g) => tenant.purchaseOrders.find((p) => p.id === id)?.status === "RECEIVED");
  const invoices = tenant.purchaseInvoices.filter((i) => i.supplierId === po.supplierId);
  return (
    <div>
      <ViewHeader
        title={po.ref}
        subtitle={`${tenant.suppliers.find((s) => s.id === po.supplierId)?.name ?? ""} · ${dateShort(po.date)}`}
        crumbs={[{ label: "Purchasing", href: "/purchase-orders" }, { label: po.ref }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Grand total" value={`${currency} ${num(po.total, 2)}`} icon="dollar" tone="orange" />
        <StatCard label="Lines" value={num(po.lines.length)} icon="layers" tone="blue" />
        <StatCard
          label="Received"
          value={num(po.lines.filter((l) => l.received >= l.qty).length)}
          icon="check"
          tone="green"
        />
        <StatCard label="Status" value={po.status} icon="truck" tone="purple" />
      </div>
      <Grid>
        <Card title="Order lines">
          <TableCard
            title=""
            columns={[
              {
                key: "productId",
                label: "Product",
                render: (line) => tenant.products.find((p) => p.id === line.productId)?.name ?? "—",
              },
              { key: "qty", label: "Ordered", align: "right", render: (line) => <Qty value={line.qty} /> },
              { key: "received", label: "Received", align: "right", render: (line) => <Qty value={line.received} /> },
              {
                key: "cost",
                label: "Unit cost",
                align: "right",
                render: (line) => <Money value={line.cost} currency={currency} />,
              },
              {
                key: "lineTotal",
                label: "Line total",
                align: "right",
                render: (line) => <Money value={line.qty * line.cost} currency={currency} strong />,
              },
            ]}
            rows={po.lines}
          />
          <div className="mt-4 space-y-1.5 border-t border-[#E6EAED] pt-4 text-sm">
            <div className="flex justify-between text-[#646B72]">
              <span>Subtotal</span>
              <span>
                {currency} {num(po.subtotal, 2)}
              </span>
            </div>
            <div className="flex justify-between text-[#646B72]">
              <span>Tax</span>
              <span>
                {currency} {num(po.tax, 2)}
              </span>
            </div>
            <div className="flex justify-between border-t border-dashed border-[#E6EAED] pt-2 text-base font-bold">
              <span>Grand total</span>
              <span className="text-[#FE9F43]">
                {currency} {num(po.total, 2)}
              </span>
            </div>
          </div>
        </Card>
        <div className="space-y-4">
          <Card title="Order details">
            <KeyValue
              items={[
                { label: "Reference", value: po.ref },
                { label: "Order date", value: dateShort(po.date) },
                { label: "Expected", value: dateShort(po.expected) },
                {
                  label: "Supplier",
                  value: tenant.suppliers.find((s) => s.id === po.supplierId)?.name ?? "—",
                },
                {
                  label: "Warehouse",
                  value: tenant.warehouses.find((w) => w.id === po.warehouseId)?.name ?? "—",
                },
                { label: "Status", value: <StatusBadge value={po.status} /> },
              ]}
            />
            {po.notes ? <p className="mt-3 text-sm text-[#646B72]">{po.notes}</p> : null}
          </Card>
          <Card title="Goods receipts">
            {grns.length === 0 ? (
              <p className="text-sm text-[#7A8086]">Nothing received yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {grns.map((grn) => (
                  <li key={grn.id} className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-3 py-2">
                    <span className="font-medium">{grn.no}</span>
                    <span className="text-xs text-[#7A8086]">{dateShort(grn.date)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          {invoices.length > 0 ? (
            <Card title="Supplier invoices">
              <ul className="space-y-2 text-sm">
                {invoices.slice(0, 4).map((invoice) => (
                  <li key={invoice.id} className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-3 py-2">
                    <span className="font-medium">{invoice.no}</span>
                    <StatusBadge value={invoice.status} />
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </Grid>
    </div>
  );
}

export function GoodsReceiptsView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  return (
    <div>
      <ViewHeader title="Goods receipts" crumbs={[{ label: "Purchasing" }, { label: "GRN" }]} />
      <TableCard
        title="Received documents"
        columns={[
          { key: "no", label: "GRN no" },
          {
            key: "supplier",
            label: "Supplier",
            render: (row) => tenant.suppliers.find((s) => s.id === row.supplierId)?.name ?? "—",
          },
          {
            key: "warehouse",
            label: "Warehouse",
            render: (row) => tenant.warehouses.find((w) => w.id === row.warehouseId)?.name ?? "—",
          },
          { key: "date", label: "Date", render: (row) => dateShort(row.date) },
          {
            key: "total",
            label: "Value",
            align: "right",
            render: (row) => <Money value={row.total} currency={currency} strong />,
          },
          { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]}
        rows={tenant.grns}
      />
    </div>
  );
}

export function PurchaseInvoicesView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const outstanding = tenant.purchaseInvoices.reduce((sum, i) => sum + (i.amount - i.paid), 0);
  return (
    <div>
      <ViewHeader
        title="Purchase invoices"
        subtitle={`Outstanding ${currency} ${num(outstanding, 2)}`}
        crumbs={[{ label: "Purchasing" }, { label: "Invoices" }]}
      />
      <TableCard
        title="Supplier bills"
        columns={[
          { key: "no", label: "Invoice" },
          {
            key: "supplier",
            label: "Supplier",
            render: (row) => tenant.suppliers.find((s) => s.id === row.supplierId)?.name ?? "—",
          },
          { key: "date", label: "Date", render: (row) => dateShort(row.date) },
          {
            key: "amount",
            label: "Amount",
            align: "right",
            render: (row) => <Money value={row.amount} currency={currency} strong />,
          },
          {
            key: "balance",
            label: "Balance",
            align: "right",
            render: (row) => <Money value={row.amount - row.paid} currency={currency} />,
          },
          { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]}
        rows={tenant.purchaseInvoices}
      />
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Card, KeyValue, StatCard, Tabs } from "@/components/ui";
import { Field, NumberInput, SelectInput, TextInput, btnPrimary, btnSoft } from "@/components/ui";
import { PosTerminal, type PosContext, type PosProduct } from "@/components/pos";
import { Grid, FormPanel, Money, Qty, StatusBadge, TableCard, ViewHeader, SearchBox } from "../parts";
import { useTenant } from "@/lib/session";
import { paymentMethodsFor, totalsFor } from "@/lib/mock";
import { dateShort, dateTime, num, timeAgo, toNum } from "@/lib/format";

/* --------------------------------- POS --------------------------------- */

export function PosView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const terminal = tenant.terminals[0];
  const branch = tenant.branches.find((b) => b.id === terminal?.branchId) ?? tenant.branches[0];
  const warehouse = tenant.warehouses.find((w) => w.id === terminal?.warehouseId) ?? tenant.warehouses[0];
  const shift = tenant.shifts.find((s) => s.status === "OPEN");

  const context: PosContext = {
    branchId: branch.id,
    branchName: branch.name,
    warehouseId: warehouse.id,
    terminalId: terminal?.id ?? null,
    terminalName: terminal?.name ?? "Web terminal",
    shiftId: shift?.id ?? null,
    cashierName: tenant.users[0].name,
  };

  const products: PosProduct[] = tenant.products.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    uomId: product.id,
    price: product.price,
    cost: product.cost,
    stock: product.stock,
    category: tenant.categories.find((c) => c.id === product.categoryId)?.name ?? null,
    weighted: product.weighted,
    barcode: product.barcode,
  }));

  const [log, setLog] = useState<{ invoice: string; total: number; items: number; time: string }[]>([]);

  return (
    <div>
      <ViewHeader
        title="POS Terminal"
        subtitle={`${context.terminalName} · ${context.branchName} · cashier ${context.cashierName}`}
        crumbs={[{ label: "POS" }]}
        actions={
          <Link href="/sales" className={btnSoft}>
            View invoices
          </Link>
        }
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Products" value={num(products.length)} icon="box" tone="orange" />
        <StatCard label="Terminals" value={num(tenant.terminals.length)} icon="phone" tone="blue" />
        <StatCard
          label="Shift"
          value={shift ? "Open" : "Closed"}
          sub={shift ? `opened ${timeAgo(shift.openedAt)}` : "no open shift"}
          icon="clock"
          tone={shift ? "green" : "gray"}
        />
        <StatCard label="Payment methods" value={num(paymentMethodsFor(tenant.company.id).length)} icon="card" tone="purple" />
      </div>
      <PosTerminal
        products={products}
        context={context}
        customers={tenant.customers.slice(0, 12).map((c) => ({ id: c.id, name: c.name }))}
        paymentMethods={paymentMethodsFor(tenant.company.id).map((m) => ({ code: m.code, name: m.name }))}
        currency={currency}
        onCharge={(payload) =>
          setLog((prev) =>
            [
              {
                invoice: `LOCAL-${String(prev.length + 1).padStart(3, "0")}`,
                total: payload.total,
                items: payload.items,
                time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
              },
              ...prev,
            ].slice(0, 6),
          )
        }
      />
      {log.length > 0 ? (
        <div className="mt-4">
          <Card title="Completed on this terminal" icon="check">
            <TableCard
              title=""
              columns={[
                { key: "invoice", label: "Local reference" },
                { key: "time", label: "Time" },
                { key: "items", label: "Items", align: "right" },
                {
                  key: "total",
                  label: "Total",
                  align: "right",
                  render: (row) => <Money value={row.total} currency={currency} strong />,
                },
              ]}
              rows={log}
            />
          </Card>
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------- sales -------------------------------- */

export function SalesView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");

  const rows = useMemo(
    () =>
      tenant.sales.filter((sale) => {
        const customer = sale.customerId
          ? (tenant.customers.find((c) => c.id === sale.customerId)?.name ?? "")
          : "";
        const matchesQuery = query
          ? `${sale.invoiceNo} ${customer}`.toLowerCase().includes(query.toLowerCase())
          : true;
        const matchesStatus =
          status === "ALL"
            ? true
            : status === "COMPLETED"
              ? sale.status === "COMPLETED"
              : status === "CANCELLED"
                ? sale.status === "CANCELLED"
                : sale.paymentStatus === status;
        return matchesQuery && matchesStatus;
      }),
    [tenant, query, status],
  );

  const revenue = tenant.sales
    .filter((s) => s.status === "COMPLETED")
    .reduce((sum, s) => sum + s.total, 0);
  const unpaid = tenant.sales
    .filter((s) => s.paymentStatus !== "PAID")
    .reduce((sum, s) => sum + s.balance, 0);

  return (
    <div>
      <ViewHeader
        title="Sales"
        subtitle={`${tenant.sales.length} invoices on record`}
        crumbs={[{ label: "Sales" }]}
        actions={
          <Link href="/pos" className={btnPrimary}>
            New sale
          </Link>
        }
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Lifetime revenue" value={`${currency} ${num(revenue)}`} icon="dollar" tone="green" />
        <StatCard label="Invoices" value={num(tenant.sales.length)} icon="receipt" tone="orange" />
        <StatCard label="Outstanding credit" value={`${currency} ${num(unpaid)}`} icon="alert" tone="red" />
        <StatCard
          label="Cancelled"
          value={num(tenant.sales.filter((s) => s.status === "CANCELLED").length)}
          icon="back"
          tone="gray"
        />
      </div>
      <Card
        title="Sales invoices"
        subtitle={`Showing ${rows.length} of ${tenant.sales.length}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-56">
              <SearchBox value={query} onChange={setQuery} placeholder="Invoice or customer" />
            </div>
            <SelectInput
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-40"
              options={[
                { value: "ALL", label: "All statuses" },
                { value: "COMPLETED", label: "Completed" },
                { value: "CANCELLED", label: "Cancelled" },
                { value: "PAID", label: "Paid" },
                { value: "UNPAID", label: "Unpaid" },
                { value: "PARTIAL", label: "Partial" },
              ]}
            />
          </div>
        }
      >
        <TableCard
          title=""
          rowHref={(row) => `/sales/${row.id}`}
          columns={[
            {
              key: "invoiceNo",
              label: "Invoice",
              render: (row) => (
                <div>
                  <p className="font-semibold">{row.invoiceNo}</p>
                  <p className="text-[11px] text-[#7A8086]">{dateShort(row.date)}</p>
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
              key: "branch",
              label: "Branch",
              render: (row) => tenant.branches.find((b) => b.id === row.branchId)?.name ?? "—",
            },
            {
              key: "cashier",
              label: "Cashier",
              render: (row) => tenant.users.find((u) => u.id === row.cashierId)?.name ?? "—",
            },
            { key: "items", label: "Items", align: "right", render: (row) => num(row.items.length) },
            {
              key: "total",
              label: "Total",
              align: "right",
              render: (row) => <Money value={row.total} currency={currency} strong />,
            },
            { key: "paymentStatus", label: "Payment", render: (row) => <StatusBadge value={row.paymentStatus} /> },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
            { key: "source", label: "Source", render: (row) => <Badge tone="blue">{row.source}</Badge> },
          ]}
          rows={rows.slice(0, 150)}
        />
      </Card>
    </div>
  );
}

export function SaleDetailView({ id }: { id: number }) {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const sale = tenant.sales.find((s) => s.id === id);
  if (!sale) return <Card title="Invoice not found">This invoice does not belong to your company.</Card>;
  const profit = sale.total - sale.cost;
  const branch = tenant.branches.find((b) => b.id === sale.branchId);
  const warehouse = tenant.warehouses.find((w) => w.id === sale.warehouseId);
  const cashier = tenant.users.find((u) => u.id === sale.cashierId);
  const customer = sale.customerId ? tenant.customers.find((c) => c.id === sale.customerId) : null;
  const relatedReturn = tenant.returns.find((r) => r.saleId === sale.id);

  return (
    <div>
      <ViewHeader
        title={`Invoice ${sale.invoiceNo}`}
        subtitle={`${dateTime(sale.date)} · ${branch?.name ?? ""}`}
        crumbs={[{ label: "Sales", href: "/sales" }, { label: sale.invoiceNo }]}
        actions={
          <Link href="/pos" className={btnPrimary}>
            New sale
          </Link>
        }
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Grand total" value={`${currency} ${num(sale.total, 2)}`} icon="dollar" tone="orange" />
        <StatCard label="Paid" value={`${currency} ${num(sale.paid, 2)}`} icon="check" tone="green" />
        <StatCard
          label="Balance"
          value={`${currency} ${num(sale.balance, 2)}`}
          icon="alert"
          tone={sale.balance > 0 ? "red" : "gray"}
        />
        <StatCard label="Gross profit" value={`${currency} ${num(profit, 2)}`} icon="up" tone="purple" />
      </div>
      <Grid>
        <Card title="Invoice items">
          <TableCard
            title=""
            columns={[
              { key: "name", label: "Product" },
              { key: "qty", label: "Qty", align: "right", render: (item) => <Qty value={item.qty} /> },
              {
                key: "price",
                label: "Unit price",
                align: "right",
                render: (item) => <Money value={item.price} currency={currency} />,
              },
              {
                key: "discount",
                label: "Discount",
                align: "right",
                render: (item) => <Money value={item.discount} currency={currency} />,
              },
              {
                key: "lineTotal",
                label: "Line total",
                align: "right",
                render: (item) => (
                  <Money value={item.price * item.qty - item.discount} currency={currency} strong />
                ),
              },
            ]}
            rows={sale.items}
          />
          <div className="mt-4 space-y-1.5 border-t border-[#E6EAED] pt-4 text-sm">
            <div className="flex justify-between text-[#646B72]">
              <span>Subtotal</span>
              <span>
                {currency} {num(sale.subtotal, 2)}
              </span>
            </div>
            <div className="flex justify-between text-[#646B72]">
              <span>Discount</span>
              <span>
                −{currency} {num(sale.discount, 2)}
              </span>
            </div>
            <div className="flex justify-between text-[#646B72]">
              <span>Tax</span>
              <span>
                {currency} {num(sale.tax, 2)}
              </span>
            </div>
            <div className="flex justify-between border-t border-dashed border-[#E6EAED] pt-2 text-base font-bold text-[#212B36]">
              <span>Grand total</span>
              <span className="text-[#FE9F43]">
                {currency} {num(sale.total, 2)}
              </span>
            </div>
          </div>
        </Card>
        <div className="space-y-4">
          <Card title="Invoice meta">
            <KeyValue
              items={[
                { label: "Invoice no", value: sale.invoiceNo },
                { label: "Date", value: dateTime(sale.date) },
                { label: "Branch", value: branch?.name ?? "—" },
                { label: "Warehouse", value: warehouse?.name ?? "—" },
                { label: "Cashier", value: cashier?.name ?? "—" },
                { label: "Customer", value: customer?.name ?? "Walk-in" },
                { label: "Source", value: <Badge tone="blue">{sale.source}</Badge> },
                { label: "Payment status", value: <StatusBadge value={sale.paymentStatus} /> },
                { label: "Sale status", value: <StatusBadge value={sale.status} /> },
                { label: "Cost of goods", value: `${currency} ${num(sale.cost, 2)}` },
              ]}
            />
          </Card>
          <Card title="Payments">
            {sale.payments.length === 0 ? (
              <p className="text-sm text-[#7A8086]">No payments recorded.</p>
            ) : (
              <ul className="space-y-2">
                {sale.payments.map((payment, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-3 py-2"
                  >
                    <span className="text-sm font-medium">{payment.code}</span>
                    <span className="text-sm font-bold">
                      {currency} {num(payment.amount, 2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          {relatedReturn ? (
            <Card title="Return">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{relatedReturn.no}</span>
                <StatusBadge value={relatedReturn.status} />
              </div>
            </Card>
          ) : null}
        </div>
      </Grid>
    </div>
  );
}

export function ReturnsView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const total = tenant.returns.reduce((sum, r) => sum + r.total, 0);
  return (
    <div>
      <ViewHeader
        title="Sales returns"
        subtitle={`${tenant.returns.length} returns · ${currency} ${num(total, 2)} refunded`}
        crumbs={[{ label: "Sales" }, { label: "Returns" }]}
      />
      <TableCard
        title="Return documents"
        columns={[
          { key: "no", label: "Return no" },
          { key: "invoice", label: "Invoice" },
          { key: "date", label: "Date", render: (row) => dateShort(row.date) },
          { key: "reason", label: "Reason" },
          {
            key: "total",
            label: "Refunded",
            align: "right",
            render: (row) => <Money value={row.total} currency={currency} strong />,
          },
          { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]}
        rows={tenant.returns}
      />
    </div>
  );
}

export function HeldSalesView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  return (
    <div>
      <ViewHeader title="Held bills" crumbs={[{ label: "Sales" }, { label: "Held bills" }]} />
      <TableCard
        title="Parked sales"
        columns={[
          { key: "ref", label: "Reference" },
          { key: "createdAt", label: "Created", render: (row) => dateTime(row.createdAt) },
          { key: "items", label: "Items", align: "right" },
          {
            key: "total",
            label: "Estimated total",
            align: "right",
            render: (row) => <Money value={row.total} currency={currency} strong />,
          },
        ]}
        rows={tenant.heldSales}
        emptyTitle="No held bills"
        emptyHint="Park a sale from the POS terminal to resume it later."
      />
    </div>
  );
}

export function ShiftsView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const open = tenant.shifts.find((s) => s.status === "OPEN");
  const [counted, setCounted] = useState<Record<number, string>>({});

  return (
    <div>
      <ViewHeader
        title="Shifts & Z report"
        subtitle="Cash drawer reconciliation per terminal"
        crumbs={[{ label: "Sales" }, { label: "Shifts" }]}
      />
      {open ? (
        <div className="mb-4">
          <FormPanel
            title={`Close shift ${open.no}`}
            hint="Count the drawer and post the closing balance"
            cancelHref="/shifts"
            onSubmit={(values) => setCounted((prev) => ({ ...prev, [open.id]: String(values.countedCash) }))}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Opening cash">
                <NumberInput defaultValue={open.openingCash} disabled />
              </Field>
              <Field label="Cash sales">
                <NumberInput defaultValue={open.cashSales} disabled />
              </Field>
              <Field label="Counted cash">
                <NumberInput
                  name="countedCash"
                  defaultValue={open.openingCash + open.cashSales}
                  onChange={(event) =>
                    setCounted((prev) => ({ ...prev, [open.id]: event.target.value }))
                  }
                />
              </Field>
            </div>
            <button type="submit" className={btnPrimary}>
              Close shift
            </button>
            {counted[open.id] ? (
              <p className="rounded-lg bg-[#EAF8F1] px-3 py-2 text-sm font-semibold text-[#2C7A57]">
                Shift {open.no} closed with {currency} {num(toNum(counted[open.id]), 2)} counted.
              </p>
            ) : null}
          </FormPanel>
        </div>
      ) : null}
      <TableCard
        title="Shift history"
        columns={[
          { key: "no", label: "Shift" },
          {
            key: "terminal",
            label: "Terminal",
            render: (row) => tenant.terminals.find((t) => t.id === row.terminalId)?.name ?? "—",
          },
          {
            key: "cashier",
            label: "Cashier",
            render: (row) => tenant.users.find((u) => u.id === row.cashierId)?.name ?? "—",
          },
          { key: "openedAt", label: "Opened", render: (row) => dateTime(row.openedAt) },
          {
            key: "totalSales",
            label: "Sales",
            align: "right",
            render: (row) => <Money value={row.totalSales} currency={currency} strong />,
          },
          {
            key: "cashSales",
            label: "Cash",
            align: "right",
            render: (row) => <Money value={row.cashSales} currency={currency} />,
          },
          {
            key: "countedCash",
            label: "Counted",
            align: "right",
            render: (row) => <Money value={row.countedCash} currency={currency} />,
          },
          {
            key: "variance",
            label: "Variance",
            align: "right",
            render: (row) => (
              <Money value={row.countedCash - (row.openingCash + row.cashSales)} currency={currency} />
            ),
          },
          { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]}
        rows={tenant.shifts}
      />
    </div>
  );
}

export function useSalesKpis() {
  const tenant = useTenant();
  return totalsFor(tenant, 30);
}

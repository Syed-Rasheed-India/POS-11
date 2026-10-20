"use client";

import { useMemo, useState } from "react";
import { Icon } from "./icons";

export type PosProduct = {
  id: number;
  name: string;
  sku: string;
  uomId: number;
  price: number;
  cost: number;
  stock: number;
  category: string | null;
  weighted: boolean;
  barcode: string | null;
};

export type PosContext = {
  branchId: number;
  branchName: string;
  warehouseId: number;
  terminalId: number | null;
  terminalName: string;
  shiftId: number | null;
  cashierName: string;
};

type CartLine = PosProduct & { qty: number; discount: number };

export function PosTerminal({
  products,
  context,
  customers,
  paymentMethods,
  currency,
  onCharge,
}: {
  products: PosProduct[];
  context: PosContext;
  customers: { id: number; name: string }[];
  paymentMethods: { code: string; name: string }[];
  currency: string;
  onCharge: (payload: { total: number; items: number; payments: { code: string; amount: number }[] }) => void;
}) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [customerId, setCustomerId] = useState<string>("");
  const [split, setSplit] = useState<{ code: string; amount: string }[]>([
    { code: "CASH", amount: "" },
  ]);
  const [receipt, setReceipt] = useState<{ invoice: string; total: number; change: number; items: number } | null>(null);

  const categories = useMemo(
    () => ["ALL", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))],
    [products],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => (category === "ALL" ? true : p.category === category))
      .filter((p) => (q ? `${p.name} ${p.sku} ${p.barcode ?? ""}`.toLowerCase().includes(q) : true))
      .slice(0, 60);
  }, [products, query, category]);

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const discount = lines.reduce((sum, l) => sum + l.discount, 0);
  const total = subtotal - discount;

  const addLine = (product: PosProduct) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.uomId === product.uomId);
      if (existing) {
        return prev.map((l) => (l.uomId === product.uomId ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { ...product, qty: 1, discount: 0 }];
    });
  };

  const setQty = (uomId: number, qty: number) =>
    setLines((prev) =>
      prev
        .map((l) => (l.uomId === uomId ? { ...l, qty: Math.max(0, qty) } : l))
        .filter((l) => l.qty > 0),
    );

  const setDiscount = (uomId: number, value: number) =>
    setLines((prev) => prev.map((l) => (l.uomId === uomId ? { ...l, discount: value } : l)));

  const quickPay = (code: string) => setSplit([{ code, amount: total.toFixed(2) }]);

  const splitTotal = split.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

  const charge = () => {
    if (lines.length === 0) return;
    const payments = split
      .filter((s) => (Number(s.amount) || 0) > 0)
      .map((s) => ({ code: s.code, amount: Number(s.amount) }));
    if (payments.length === 0) payments.push({ code: "CREDIT", amount: 0 });
    onCharge({ total, items: lines.length, payments });
    setReceipt({
      invoice: `${context.terminalName.split(" ")[0].toUpperCase()}-INV-${String(Math.floor(Math.random() * 900000) + 100000)}`,
      total,
      change: Math.max(0, splitTotal - total),
      items: lines.length,
    });
    setLines([]);
    setSplit([{ code: "CASH", amount: "" }]);
    setCustomerId("");
  };

  const fmt = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(value);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
      {/* Catalogue */}
      <div className="space-y-4">
        <div className="rounded-xl border border-[#E6EAED] bg-white p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Icon name="search" className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#A6AAAF]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Scan barcode or search product…"
                className="w-full rounded-lg border border-[#E6EAED] bg-[#F9FAFB] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#FE9F43]"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-[#E6EAED] px-3 py-2 text-sm"
            >
              {categories.map((c) => (
                <option key={String(c)} value={String(c)}>
                  {c === "ALL" ? "All categories" : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <button
              key={`${product.id}-${product.uomId}`}
              type="button"
              onClick={() => addLine(product)}
              className="rounded-xl border border-[#E6EAED] bg-white p-3 text-left transition hover:border-[#FE9F43] hover:shadow-sm"
            >
              <p className="line-clamp-2 min-h-[2.5rem] text-[13px] font-semibold text-[#212B36]">
                {product.name}
              </p>
              <p className="mt-1 text-sm font-bold text-[#FE9F43]">{fmt(product.price)}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[#7A8086]">
                {product.category ?? "General"} · stock {product.stock}
              </p>
            </button>
          ))}
        </div>
      </div>

      {receipt ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#EAF8F1] text-[#3EB780]">
              <Icon name="check" className="h-6 w-6" />
            </span>
            <h3 className="mt-3 text-lg font-bold text-[#212B36]">Sale completed</h3>
            <p className="mt-1 text-sm text-[#646B72]">
              {receipt.invoice} · {receipt.items} item(s)
            </p>
            <p className="mt-3 text-2xl font-bold text-[#FE9F43]">{fmt(receipt.total)}</p>
            {receipt.change > 0 ? (
              <p className="text-xs text-[#7A8086]">Change due {fmt(receipt.change)}</p>
            ) : null}
            <p className="mt-4 rounded-lg bg-[#F9FAFB] p-3 text-xs text-[#646B72]">
              Receipt sent to the printer · stock deducted at {context.terminalName}
            </p>
            <button
              type="button"
              onClick={() => setReceipt(null)}
              className="mt-4 w-full rounded-lg bg-[#092C4C] py-2.5 text-sm font-bold text-white"
            >
              New sale
            </button>
          </div>
        </div>
      ) : null}

      {/* Cart */}
      <div className="space-y-4">
        <div className="rounded-xl border border-[#E6EAED] bg-white">
          <div className="flex items-center justify-between border-b border-[#E6EAED] px-4 py-3">
            <div>
              <p className="text-sm font-bold text-[#212B36]">Current sale</p>
              <p className="text-[11px] text-[#7A8086]">
                {context.terminalName} · {context.cashierName}
              </p>
            </div>
            <span className="rounded-full bg-[#EAF8F1] px-2.5 py-1 text-[10px] font-bold uppercase text-[#2C7A57]">
              {context.shiftId ? "Shift open" : "No shift"}
            </span>
          </div>

          <div className="max-h-[320px] divide-y divide-[#F1F3F5] overflow-y-auto">
            {lines.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-[#7A8086]">
                Tap a product to add it to the sale.
              </p>
            ) : (
              lines.map((line) => (
                <div key={line.uomId} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-semibold text-[#212B36]">{line.name}</p>
                    <p className="shrink-0 text-sm font-bold text-[#212B36]">
                      {fmt(line.price * line.qty - line.discount)}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-[#E6EAED]">
                      <button
                        type="button"
                        className="px-2 py-1 text-sm text-[#646B72]"
                        onClick={() => setQty(line.uomId, line.qty - 1)}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={line.qty}
                        step={line.weighted ? 0.1 : 1}
                        onChange={(e) => setQty(line.uomId, Number(e.target.value))}
                        className="w-14 border-x border-[#E6EAED] py-1 text-center text-sm outline-none"
                      />
                      <button
                        type="button"
                        className="px-2 py-1 text-sm text-[#646B72]"
                        onClick={() => setQty(line.uomId, line.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                    <input
                      type="number"
                      value={line.discount}
                      onChange={(e) => setDiscount(line.uomId, Number(e.target.value))}
                      className="w-20 rounded-lg border border-[#E6EAED] px-2 py-1 text-xs"
                      placeholder="Discount"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2 border-t border-[#E6EAED] px-4 py-3 text-sm">
            <div className="flex justify-between text-[#646B72]">
              <span>Subtotal</span>
              <span className="font-medium text-[#212B36]">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#646B72]">
              <span>Discount</span>
              <span className="font-medium text-[#D63031]">−{fmt(discount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-dashed border-[#E6EAED] pt-2">
              <span className="text-sm font-bold text-[#212B36]">Total</span>
              <span className="text-xl font-bold text-[#FE9F43]">{fmt(total)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#E6EAED] bg-white p-4">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#646B72]">
            Customer
          </label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full rounded-lg border border-[#E6EAED] px-3 py-2 text-sm"
          >
            <option value="">Walk-in customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-[#646B72]">
            Payment
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            {paymentMethods.map((method) => (
              <button
                key={method.code}
                type="button"
                onClick={() => quickPay(method.code)}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                  split.length === 1 && split[0].code === method.code
                    ? "border-[#FE9F43] bg-[#FFF6EE] text-[#B4661A]"
                    : "border-[#E6EAED] text-[#646B72] hover:bg-[#F9FAFB]"
                }`}
              >
                {method.name}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {split.map((row, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={row.code}
                  onChange={(e) =>
                    setSplit((prev) =>
                      prev.map((s, i) => (i === index ? { ...s, code: e.target.value } : s)),
                    )
                  }
                  className="flex-1 rounded-lg border border-[#E6EAED] px-2 py-1.5 text-sm"
                >
                  {paymentMethods.map((method) => (
                    <option key={method.code} value={method.code}>
                      {method.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={row.amount}
                  onChange={(e) =>
                    setSplit((prev) =>
                      prev.map((s, i) => (i === index ? { ...s, amount: e.target.value } : s)),
                    )
                  }
                  className="w-28 rounded-lg border border-[#E6EAED] px-2 py-1.5 text-sm"
                  placeholder="0.00"
                />
                {split.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setSplit((prev) => prev.filter((_, i) => i !== index))}
                    className="text-xs text-[#D63031]"
                  >
                    ✕
                  </button>
                ) : null}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setSplit((prev) => [...prev, { code: "CARD", amount: "" }])}
              className="text-xs font-semibold text-[#0984E3]"
            >
              + Add split payment
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-[#7A8086]">
            <span>Tendered</span>
            <span className={splitTotal + 0.01 >= total ? "text-[#3EB780]" : "text-[#D63031]"}>
              {fmt(splitTotal)}
            </span>
          </div>

          <button
            type="button"
            onClick={charge}
            disabled={lines.length === 0}
            className="mt-4 w-full rounded-lg bg-[#FE9F43] py-3 text-sm font-bold text-white transition hover:bg-[#E58A2C] disabled:opacity-50"
          >
            {`Charge ${fmt(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

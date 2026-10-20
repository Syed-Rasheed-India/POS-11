"use client";

import { useState } from "react";

export type LineProduct = {
  id: number;
  name: string;
  uomId: number;
  cost: number;
  taxRate?: number;
};

type Row = {
  productId: number;
  productUomId: number;
  quantity: number;
  unitCost: number;
  taxRate: number;
};

/**
 * Multi line editor used by stock adjustments, transfers and purchase orders.
 * Serialises the rows into a hidden JSON field consumed by the server action.
 */
export function LinesForm({
  name = "lines",
  products,
  mode = "qty",
  defaultCost = 0,
}: {
  name?: string;
  products: LineProduct[];
  mode?: "qty" | "cost";
  defaultCost?: number;
}) {
  const [rows, setRows] = useState<Row[]>([]);

  const update = (index: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const addRow = () => {
    const first = products[0];
    if (!first) return;
    setRows((prev) => [
      ...prev,
      {
        productId: first.id,
        productUomId: first.uomId,
        quantity: 1,
        unitCost: first.cost || defaultCost,
        taxRate: first.taxRate ?? 0,
      },
    ]);
  };

  const validRows = rows.filter((row) => row.quantity > 0 && row.productId > 0);
  const serialised = JSON.stringify(
    validRows.map((row) => ({
      productId: row.productId,
      productUomId: row.productUomId,
      quantity: Number(row.quantity),
      unitCost: Number(row.unitCost),
      taxRate: Number(row.taxRate),
    })),
  );

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={serialised} readOnly />
      {rows.map((row, index) => (
        <div key={index} className="flex flex-wrap items-center gap-2 rounded-lg border border-[#E6EAED] bg-[#F9FAFB] p-2">
          <select
            value={row.productId}
            onChange={(e) => {
              const product = products.find((p) => p.id === Number(e.target.value));
              update(index, {
                productId: Number(e.target.value),
                productUomId: product?.uomId ?? row.productUomId,
                unitCost: product?.cost ?? row.unitCost,
                taxRate: product?.taxRate ?? row.taxRate,
              });
            }}
            className="min-w-[180px] flex-1 rounded-lg border border-[#E6EAED] px-2 py-1.5 text-sm"
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="any"
            value={row.quantity}
            onChange={(e) => update(index, { quantity: Number(e.target.value) })}
            className="w-24 rounded-lg border border-[#E6EAED] px-2 py-1.5 text-sm"
            placeholder="Qty"
          />
          {mode === "cost" ? (
            <>
              <input
                type="number"
                step="any"
                value={row.unitCost}
                onChange={(e) => update(index, { unitCost: Number(e.target.value) })}
                className="w-24 rounded-lg border border-[#E6EAED] px-2 py-1.5 text-sm"
                placeholder="Cost"
              />
              <input
                type="number"
                step="any"
                value={row.taxRate}
                onChange={(e) => update(index, { taxRate: Number(e.target.value) })}
                className="w-20 rounded-lg border border-[#E6EAED] px-2 py-1.5 text-sm"
                placeholder="Tax %"
              />
            </>
          ) : null}
          <button
            type="button"
            onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
            className="rounded-lg px-2 py-1 text-sm text-[#D63031] hover:bg-[#FDECEC]"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="rounded-lg border border-dashed border-[#D3D5D7] px-3 py-2 text-sm font-semibold text-[#646B72] hover:border-[#FE9F43] hover:text-[#FE9F43]"
      >
        + Add line
      </button>
      <p className="text-[11px] text-[#7A8086]">{validRows.length} line(s) ready</p>
    </div>
  );
}

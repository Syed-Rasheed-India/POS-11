"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Card, KeyValue, SectionTitle, StatCard, Tabs } from "@/components/ui";
import { Checkbox, Field, NumberInput, SelectInput, TextInput, Textarea, btnPrimary } from "@/components/ui";
import { Grid, FormPanel, Money, Qty, StatusBadge, TableCard, ViewHeader, SearchBox } from "../parts";
import { useTenant } from "@/lib/session";
import { stockValue } from "@/lib/mock";
import { dateShort, num, toNum } from "@/lib/format";

/* ------------------------------- products ------------------------------- */

export function ProductsView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const [query, setQuery] = useState("");
  const [extra, setExtra] = useState<typeof tenant.products>([]);

  const rows = [...extra, ...tenant.products].filter((row) =>
    query
      ? `${row.name} ${row.sku} ${row.barcode} ${row.categoryId}`.toLowerCase().includes(query.toLowerCase())
      : true,
  );
  const value = stockValue(tenant) + extra.reduce((sum, p) => sum + p.stock * p.cost, 0);
  const low = rows.filter((row) => row.stock <= row.reorderLevel).length;

  return (
    <div>
      <ViewHeader
        title="Products"
        subtitle={`${tenant.products.length + extra.length} products in the catalogue`}
        crumbs={[{ label: "Products" }]}
        actions={
          <Link href="/products/new" className={btnPrimary}>
            + Add Product
          </Link>
        }
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total products" value={num(rows.length)} icon="box" tone="orange" />
        <StatCard
          label="Active"
          value={num(rows.filter((r) => r.status === "ACTIVE").length)}
          icon="check"
          tone="green"
        />
        <StatCard label="Below reorder level" value={num(low)} icon="alert" tone="red" />
        <StatCard label="Stock value (cost)" value={`${currency} ${num(value)}`} icon="dollar" tone="blue" />
      </div>
      <Card title="Catalogue" subtitle="Tap a product for barcodes, stock and sales history">
        <div className="mb-4 max-w-sm">
          <SearchBox value={query} onChange={setQuery} placeholder="Search name, SKU or barcode" />
        </div>
        <TableCard
          title=""
          rowHref={(row) => `/products/${row.id}`}
          columns={[
            {
              key: "name",
              label: "Product",
              render: (row) => (
                <div>
                  <p className="font-semibold">{row.name}</p>
                  <p className="text-[11px] text-[#7A8086]">
                    {row.sku} · {row.barcode}
                  </p>
                </div>
              ),
            },
            {
              key: "category",
              label: "Category",
              render: (row) => tenant.categories.find((c) => c.id === row.categoryId)?.name ?? "—",
            },
            {
              key: "brand",
              label: "Brand",
              render: (row) => tenant.brands.find((b) => b.id === row.brandId)?.name ?? "—",
            },
            {
              key: "uom",
              label: "Unit",
              render: (row) => tenant.uoms.find((u) => u.id === row.uomId)?.code ?? "—",
            },
            {
              key: "price",
              label: "Selling price",
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
              key: "stock",
              label: "On hand",
              align: "right",
              render: (row) => (
                <span className={row.stock <= row.reorderLevel ? "font-bold text-[#D63031]" : "font-medium"}>
                  {num(row.stock, row.stock % 1 === 0 ? 0 : 2)}
                </span>
              ),
            },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={rows}
        />
      </Card>
    </div>
  );
}

export function ProductFormView() {
  const tenant = useTenant();
  const [message, setMessage] = useState("");

  return (
    <div>
      <ViewHeader
        title="Create product"
        subtitle="Products are scoped to your company and visible to every branch"
        crumbs={[{ label: "Products", href: "/products" }, { label: "Create" }]}
      />
      <Grid>
        <FormPanel
          title="Product details"
          hint="SKU, category, brand and unit of measure"
          submitLabel="Create product"
          cancelHref="/products"
          onSubmit={(values) => {
            const product = {
              id: Math.max(...tenant.products.map((p) => p.id)) + 1,
              sku: String(values.sku || `SKU-${Date.now().toString().slice(-6)}`),
              name: String(values.name),
              shortName: String(values.name).slice(0, 24),
              description: String(values.description ?? ""),
              categoryId: Number(values.categoryId) || tenant.categories[0].id,
              brandId: Number(values.brandId) || tenant.brands[0].id,
              uomId: Number(values.uomId) || tenant.uoms[0].id,
              price: toNum(String(values.price)),
              cost: toNum(String(values.cost)),
              tax: toNum(String(values.tax)),
              reorderLevel: toNum(String(values.reorderLevel)) || 10,
              weighted: Boolean(values.isWeighted),
              expiry: false,
              status: "ACTIVE" as const,
              stock: 0,
              barcode: String(values.barcode ?? ""),
              updatedAt: new Date(),
            };
            tenant.products.unshift(product);
            setMessage(`Product "${product.name}" added to the catalogue.`);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product name">
              <TextInput name="name" required placeholder="Fresh Full Cream Milk 1L" />
            </Field>
            <Field label="SKU">
              <TextInput name="sku" placeholder="AUTO" />
            </Field>
            <Field label="Short name">
              <TextInput name="shortName" placeholder="Milk 1L" />
            </Field>
            <Field label="Barcode">
              <TextInput name="barcode" placeholder="6281234567890" />
            </Field>
            <Field label="Category">
              <SelectInput
                name="categoryId"
                options={tenant.categories.map((c) => ({ value: c.id, label: c.name }))}
                placeholder="Select category"
              />
            </Field>
            <Field label="Brand">
              <SelectInput
                name="brandId"
                options={tenant.brands.map((b) => ({ value: b.id, label: b.name }))}
                placeholder="Select brand"
              />
            </Field>
            <Field label="Base unit">
              <SelectInput
                name="uomId"
                required
                options={tenant.uoms.map((u) => ({ value: u.id, label: `${u.name} (${u.code})` }))}
                placeholder="Select unit"
              />
            </Field>
            <Field label="Tax rate (%)">
              <NumberInput name="tax" defaultValue={0} />
            </Field>
            <Field label="Selling price">
              <NumberInput name="price" defaultValue={0} required />
            </Field>
            <Field label="Cost price">
              <NumberInput name="cost" defaultValue={0} />
            </Field>
            <Field label="Reorder level">
              <NumberInput name="reorderLevel" defaultValue={10} />
            </Field>
          </div>
          <Checkbox name="isWeighted" label="Sold by weight (scale / kg)" />
          <Field label="Description">
            <Textarea name="description" placeholder="Optional product description" />
          </Field>
          {message ? (
            <p className="rounded-lg bg-[#EAF8F1] px-3 py-2 text-sm font-semibold text-[#2C7A57]">{message}</p>
          ) : null}
        </FormPanel>
        <Card title="How the POS uses this product">
          <ul className="space-y-3 text-sm text-[#646B72]">
            <li>• A base unit of measure row is created with your selling and cost price.</li>
            <li>• The product is added to your default retail price list so terminals can sell it.</li>
            <li>• Weighted products allow decimal quantities for scales and price barcodes.</li>
            <li>• Stock is tracked per warehouse, so each branch reports its own balance.</li>
          </ul>
        </Card>
      </Grid>
    </div>
  );
}

export function ProductDetailView({ id, tab }: { id: number; tab: string }) {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const product = tenant.products.find((p) => p.id === id);
  if (!product) return <Card title="Product not found">This product does not belong to your company.</Card>;

  const warehouseName = (warehouseId: number) =>
    tenant.warehouses.find((w) => w.id === warehouseId)?.name ?? "—";
  const movements = tenant.ledger.filter((entry) => entry.productId === product.id).slice(0, 15);
  const sales = tenant.sales
    .flatMap((sale) => sale.items.filter((item) => item.productId === product.id).map((item) => ({ sale, item })))
    .slice(0, 12);
  const soldQty = sales.reduce((sum, row) => sum + row.item.qty, 0);
  const margin =
    product.price > 0 ? ((product.price - product.cost) / product.price) * 100 : 0;

  return (
    <div>
      <ViewHeader
        title={product.name}
        subtitle={`${product.sku} · updated ${dateShort(product.updatedAt)}`}
        crumbs={[{ label: "Products", href: "/products" }, { label: product.name }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="On hand" value={num(product.stock)} icon="box" tone="blue" />
        <StatCard
          label="Selling price"
          value={`${currency} ${num(product.price, 2)}`}
          icon="dollar"
          tone="orange"
        />
        <StatCard label="Cost" value={`${currency} ${num(product.cost, 2)}`} icon="dollar" tone="purple" />
        <StatCard label="Units sold (recent)" value={num(soldQty)} icon="cart" tone="green" />
      </div>
      <Tabs
        baseHref={`/products/${product.id}`}
        active={tab}
        tabs={[
          { key: "overview", label: "Overview" },
          { key: "stock", label: "Stock movements" },
          { key: "barcodes", label: "Barcodes" },
          { key: "sales", label: "Sales history" },
        ]}
      />

      {tab === "stock" ? (
        <TableCard
          title="Inventory ledger for this product"
          columns={[
            { key: "type", label: "Type", render: (row) => <Badge tone="blue">{row.type.replace(/_/g, " ")}</Badge> },
            { key: "product", label: "Warehouse", render: (row) => warehouseName(row.warehouseId) },
            { key: "ref", label: "Reference", render: (row) => row.ref },
            {
              key: "qty",
              label: "Quantity",
              align: "right",
              render: (row) => (
                <span className={row.direction === "IN" ? "font-bold text-[#3EB780]" : "font-bold text-[#D63031]"}>
                  {row.direction === "IN" ? "+" : "−"}
                  {num(row.qty, 2)}
                </span>
              ),
            },
            { key: "date", label: "When", render: (row) => dateShort(row.date) },
          ]}
          rows={movements}
        />
      ) : tab === "barcodes" ? (
        <TableCard
          title="Barcodes"
          columns={[
            {
              key: "barcode",
              label: "Barcode",
              render: (row) => <span className="rounded-md bg-[#F9FAFB] px-2 py-1 font-mono text-xs">{row.barcode}</span>,
            },
            { key: "type", label: "Type", render: (row) => <Badge tone="blue">{row.type}</Badge> },
            { key: "primary", label: "Primary", render: (row) => (row.primary ? "Yes" : "No") },
          ]}
          rows={tenant.barcodes.filter((b) => b.productId === product.id)}
          emptyTitle="No barcodes"
        />
      ) : tab === "sales" ? (
        <TableCard
          title="Recent sales"
          columns={[
            { key: "invoiceNo", label: "Invoice", render: (row) => row.sale.invoiceNo },
            { key: "saleDate", label: "Date", render: (row) => dateShort(row.sale.date) },
            { key: "quantity", label: "Qty", align: "right", render: (row) => <Qty value={row.item.qty} /> },
            {
              key: "lineTotal",
              label: "Line total",
              align: "right",
              render: (row) => (
                <Money
                  value={row.item.price * row.item.qty - row.item.discount}
                  currency={currency}
                  strong
                />
              ),
            },
          ]}
          rows={sales}
          rowHref={(row) => `/sales/${row.sale.id}`}
        />
      ) : (
        <Grid>
          <Card title="Product information">
            <KeyValue
              items={[
                { label: "SKU", value: product.sku },
                { label: "Short name", value: product.shortName },
                {
                  label: "Category",
                  value: tenant.categories.find((c) => c.id === product.categoryId)?.name ?? "—",
                },
                { label: "Brand", value: tenant.brands.find((b) => b.id === product.brandId)?.name ?? "—" },
                {
                  label: "Base unit",
                  value: tenant.uoms.find((u) => u.id === product.uomId)?.name ?? "—",
                },
                { label: "Tax rate", value: `${num(product.tax, 2)}%` },
                { label: "Sold by weight", value: product.weighted ? "Yes" : "No" },
                { label: "Expiry tracked", value: product.expiry ? "Yes" : "No" },
                { label: "Reorder level", value: num(product.reorderLevel) },
                { label: "Status", value: <StatusBadge value={product.status} /> },
              ]}
            />
            {product.description ? (
              <p className="mt-4 rounded-lg bg-[#F9FAFB] p-3 text-sm text-[#646B72]">{product.description}</p>
            ) : null}
          </Card>
          <Card title="Pricing & margin">
            <KeyValue
              items={[
                { label: "Selling price", value: `${currency} ${num(product.price, 2)}` },
                { label: "Cost price", value: `${currency} ${num(product.cost, 2)}` },
                { label: "Gross margin", value: `${num(margin, 1)}%` },
                { label: "Stock value", value: `${currency} ${num(product.stock * product.cost, 2)}` },
              ]}
            />
            <div className="mt-4">
              <SectionTitle hint="Retail / wholesale / VIP">Price lists</SectionTitle>
              <ul className="space-y-2">
                {tenant.priceLists.map((list) => (
                  <li key={list.id} className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-3 py-2 text-sm">
                    <span className="font-medium">{list.name}</span>
                    <span className="font-bold">
                      {currency}{" "}
                      {num(
                        product.price *
                          (list.code === "WHOLESALE" ? 0.92 : list.code === "VIP" ? 0.97 : 1),
                        2,
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </Grid>
      )}
    </div>
  );
}

/* --------------------------- master data --------------------------- */

export function CategoriesView() {
  const tenant = useTenant();
  const [extra, setExtra] = useState<{ id: number; name: string; code: string }[]>([]);
  const rows = [...extra, ...tenant.categories];
  return (
    <div>
      <ViewHeader
        title="Categories"
        subtitle="Group products so reports and price lists stay organised"
        crumbs={[{ label: "Products" }, { label: "Categories" }]}
      />
      <Grid>
        <TableCard
          title="Category list"
          columns={[
            { key: "name", label: "Category" },
            { key: "code", label: "Code" },
            {
              key: "products",
              label: "Products",
              align: "right",
              render: (row) => num(tenant.products.filter((p) => p.categoryId === row.id).length),
            },
          ]}
          rows={rows}
        />
        <FormPanel
          title="Add category"
          onSubmit={(values) => {
            const name = String(values.name);
            if (!name) return;
            setExtra((prev) => [
              { id: Math.max(...rows.map((r) => r.id)) + 1, name, code: String(values.code || name.slice(0, 3).toUpperCase()) },
              ...prev,
            ]);
          }}
        >
          <Field label="Name">
            <TextInput name="name" required placeholder="Beverages" />
          </Field>
          <Field label="Code">
            <TextInput name="code" placeholder="BEV" />
          </Field>
        </FormPanel>
      </Grid>
    </div>
  );
}

export function BrandsView() {
  const tenant = useTenant();
  const [extra, setExtra] = useState<{ id: number; name: string; code: string }[]>([]);
  const rows = [...extra, ...tenant.brands];
  return (
    <div>
      <ViewHeader title="Brands" crumbs={[{ label: "Products" }, { label: "Brands" }]} />
      <Grid>
        <TableCard
          title="Brand list"
          columns={[
            { key: "name", label: "Brand" },
            { key: "code", label: "Code" },
            {
              key: "products",
              label: "Products",
              align: "right",
              render: (row) => num(tenant.products.filter((p) => p.brandId === row.id).length),
            },
          ]}
          rows={rows}
        />
        <FormPanel
          title="Add brand"
          onSubmit={(values) => {
            const name = String(values.name);
            if (!name) return;
            setExtra((prev) => [
              { id: Math.max(...rows.map((r) => r.id)) + 1, name, code: String(values.code || name.slice(0, 3).toUpperCase()) },
              ...prev,
            ]);
          }}
        >
          <Field label="Name">
            <TextInput name="name" required placeholder="Almarai" />
          </Field>
          <Field label="Code">
            <TextInput name="code" placeholder="ALM" />
          </Field>
        </FormPanel>
      </Grid>
    </div>
  );
}

export function UomsView() {
  const tenant = useTenant();
  const usage = useMemo(() => {
    const map = new Map<number, number>();
    tenant.products.forEach((p) => map.set(p.uomId, (map.get(p.uomId) ?? 0) + 1));
    return map;
  }, [tenant]);
  return (
    <div>
      <ViewHeader
        title="Units of measure"
        subtitle="Base units, conversions and POS selling units"
        crumbs={[{ label: "Products" }, { label: "Units" }]}
      />
      <TableCard
        title="Units"
        columns={[
          { key: "name", label: "Unit" },
          { key: "code", label: "Code" },
          { key: "symbol", label: "Symbol" },
          { key: "decimals", label: "Decimals", render: (row) => (row.decimals ? "Allowed" : "Whole only") },
          { key: "products", label: "Used by", align: "right", render: (row) => num(usage.get(row.id) ?? 0) },
        ]}
        rows={tenant.uoms}
        footer={
          <p className="text-xs text-[#7A8086]">
            Conversion examples: 1 CARTON = 10 BOX · 1 BAG = 25 KG. Conversions are applied when
            selling in a non base unit.
          </p>
        }
      />
    </div>
  );
}

export function BarcodesView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  const [query, setQuery] = useState("");
  const rows = tenant.products
    .map((product) => ({
      id: product.id,
      productId: product.id,
      barcode: product.barcode,
      type: product.weighted ? "WEIGHT" : "NORMAL",
      primary: true,
      name: product.name,
      sku: product.sku,
      price: product.price,
    }))
    .filter((row) =>
      query ? row.barcode.includes(query) || row.name.toLowerCase().includes(query.toLowerCase()) : true,
    );
  return (
    <div>
      <ViewHeader
        title="Barcodes"
        subtitle={`${tenant.products.length} scannable codes`}
        crumbs={[{ label: "Products" }, { label: "Barcodes" }]}
      />
      <Card title="Barcode list" actions={<div className="w-64"><SearchBox value={query} onChange={setQuery} placeholder="Scan or type a barcode" /></div>}>
        <TableCard
          title=""
          columns={[
            {
              key: "barcode",
              label: "Barcode",
              render: (row) => (
                <span className="rounded-md bg-[#F9FAFB] px-2 py-1 font-mono text-xs">{row.barcode}</span>
              ),
            },
            { key: "name", label: "Product" },
            { key: "sku", label: "SKU" },
            { key: "type", label: "Type", render: (row) => <Badge tone="blue">{row.type}</Badge> },
            { key: "primary", label: "Primary", render: (row) => (row.primary ? "Yes" : "No") },
            {
              key: "price",
              label: "Price",
              align: "right",
              render: (row) => <Money value={row.price} currency={currency} strong />,
            },
          ]}
          rows={rows}
          rowHref={(row) => `/products/${row.productId}`}
        />
      </Card>
    </div>
  );
}

export function PriceListsView() {
  const tenant = useTenant();
  return (
    <div>
      <ViewHeader
        title="Price lists"
        subtitle="Retail, wholesale, VIP and branch specific pricing"
        crumbs={[{ label: "Products" }, { label: "Price lists" }]}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {tenant.priceLists.map((list) => (
          <Card key={list.id} title={list.name} subtitle={list.code} actions={list.default ? <Badge tone="green">Default</Badge> : null}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#646B72]">Currency</span>
                <span className="font-bold">{list.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#646B72]">Items</span>
                <span className="font-bold">{list.items}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#646B72]">Discount vs retail</span>
                <span className="font-bold">
                  {list.code === "WHOLESALE" ? "8%" : list.code === "VIP" ? "3%" : "0%"}
                </span>
              </div>
            </div>
            <div className="mt-4 border-t border-[#E6EAED] pt-4">
              <SectionTitle hint="Sample">Lowest priced items</SectionTitle>
              <ul className="space-y-1.5 text-xs text-[#646B72]">
                {tenant.products.slice(0, 4).map((product) => (
                  <li key={product.id} className="flex justify-between gap-2">
                    <span className="truncate">{product.name}</span>
                    <span className="shrink-0 font-semibold text-[#212B36]">
                      {list.currency}{" "}
                      {num(
                        product.price * (list.code === "WHOLESALE" ? 0.92 : list.code === "VIP" ? 0.97 : 1),
                        2,
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function PromotionsView() {
  const tenant = useTenant();
  const currency = tenant.company.currency;
  return (
    <div>
      <ViewHeader
        title="Promotions"
        subtitle="Percentage, fixed, bundle and buy-X-get-Y campaigns"
        crumbs={[{ label: "Promotions" }]}
      />
      <TableCard
        title="Active campaigns"
        columns={[
          { key: "name", label: "Promotion" },
          { key: "code", label: "Code" },
          {
            key: "type",
            label: "Type",
            render: (row) => <Badge tone="purple">{row.type.replace(/_/g, " ")}</Badge>,
          },
          {
            key: "value",
            label: "Value",
            align: "right",
            render: (row) =>
              row.type === "PERCENT" ? `${num(row.value)}%` : `${currency} ${num(row.value, 2)}`,
          },
          { key: "window", label: "Window", render: (row) => `${dateShort(row.startDate)} → ${dateShort(row.endDate)}` },
          { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          { key: "description", label: "Description", render: (row) => row.description },
        ]}
        rows={tenant.promotions}
      />
    </div>
  );
}

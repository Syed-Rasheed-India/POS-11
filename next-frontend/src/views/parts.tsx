"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, DataTable, PageHeader, type Column } from "@/components/ui";
import { btnPrimary, btnSoft } from "@/components/ui";
import { clsx, money as moneyFmt, toNum } from "@/lib/format";

/** Card wrapped form with a local submit handler (UI demo — no backend). */
export function FormPanel({
  title,
  hint,
  onSubmit,
  children,
  submitLabel = "Save",
  cancelHref,
  wide,
}: {
  title: string;
  hint?: string;
  onSubmit?: (values: Record<string, string | boolean>) => void;
  children: React.ReactNode;
  submitLabel?: string;
  cancelHref?: string;
  wide?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  return (
    <Card title={title} subtitle={hint} className={wide ? "lg:col-span-2" : undefined}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const values: Record<string, string | boolean> = {};
          new FormData(form).forEach((value, key) => {
            const element = form.elements.namedItem(key);
            const isCheckbox = element instanceof HTMLInputElement && element.type === "checkbox";
            values[key] = isCheckbox ? (element as HTMLInputElement).checked : String(value);
          });
          onSubmit?.(values);
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2600);
        }}
      >
        {children}
        <div className="flex flex-wrap items-center gap-3 border-t border-[#E6EAED] pt-4">
          <button type="submit" className={btnPrimary}>
            {submitLabel}
          </button>
          {cancelHref ? (
            <Link href={cancelHref} className={btnSoft}>
              Cancel
            </Link>
          ) : null}
          {saved ? (
            <span className="rounded-lg bg-[#EAF8F1] px-2.5 py-1 text-xs font-bold text-[#2C7A57]">
              Saved in this demo session
            </span>
          ) : null}
        </div>
      </form>
    </Card>
  );
}

export function ViewHeader({
  title,
  subtitle,
  crumbs = [],
  actions,
}: {
  title: string;
  subtitle?: string;
  crumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}) {
  return <PageHeader title={title} subtitle={subtitle} crumbs={crumbs} actions={actions} />;
}

export function TableCard<T>({
  title,
  subtitle,
  columns,
  rows,
  rowHref,
  emptyTitle,
  emptyHint,
  actions,
  footer,
}: {
  title: string;
  subtitle?: string;
  columns: Column<T>[];
  rows: T[];
  rowHref?: (row: T) => string;
  emptyTitle?: string;
  emptyHint?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card title={title} subtitle={subtitle} actions={actions}>
      <DataTable columns={columns} rows={rows} rowHref={rowHref} emptyTitle={emptyTitle} emptyHint={emptyHint} />
      {footer ? <div className="mt-4 border-t border-[#E6EAED] pt-4">{footer}</div> : null}
    </Card>
  );
}

const statusTones: Record<string, string> = {
  COMPLETED: "bg-[#EAF8F1] text-[#2C7A57]",
  PAID: "bg-[#EAF8F1] text-[#2C7A57]",
  ACTIVE: "bg-[#EAF8F1] text-[#2C7A57]",
  ONLINE: "bg-[#EAF8F1] text-[#2C7A57]",
  RECEIVED: "bg-[#EAF8F1] text-[#2C7A57]",
  APPROVED: "bg-[#EAF8F1] text-[#2C7A57]",
  REFUNDED: "bg-[#EAF8F1] text-[#2C7A57]",
  RESOLVED: "bg-[#EAF8F1] text-[#2C7A57]",
  CLOSED: "bg-[#EAF8F1] text-[#2C7A57]",
  SYNCED: "bg-[#EAF8F1] text-[#2C7A57]",
  PENDING: "bg-[#FFF6EE] text-[#B4661A]",
  "IN PROGRESS": "bg-[#FFF6EE] text-[#B4661A]",
  TRIAL: "bg-[#FFF6EE] text-[#B4661A]",
  SENT: "bg-[#FFF6EE] text-[#B4661A]",
  SCHEDULED: "bg-[#EAF2FE] text-[#0B62B8]",
  PARTIAL: "bg-[#EAF2FE] text-[#0B62B8]",
  HELD: "bg-[#EAF2FE] text-[#0B62B8]",
  "IN TRANSIT": "bg-[#EAF2FE] text-[#0B62B8]",
  OPEN: "bg-[#EAF2FE] text-[#0B62B8]",
  CANCELLED: "bg-[#FDECEC] text-[#D63031]",
  INACTIVE: "bg-[#FDECEC] text-[#D63031]",
  BLOCKED: "bg-[#FDECEC] text-[#D63031]",
  OFFLINE: "bg-[#FDECEC] text-[#D63031]",
  UNPAID: "bg-[#FDECEC] text-[#D63031]",
  FAILED: "bg-[#FDECEC] text-[#D63031]",
  EXPIRED: "bg-[#FDECEC] text-[#D63031]",
  SUSPENDED: "bg-[#FDECEC] text-[#D63031]",
  REJECTED: "bg-[#FDECEC] text-[#D63031]",
  OVERDUE: "bg-[#FDECEC] text-[#D63031]",
  URGENT: "bg-[#FDECEC] text-[#D63031]",
  HIGH: "bg-[#FFF6EE] text-[#B4661A]",
  MEDIUM: "bg-[#EAF2FE] text-[#0B62B8]",
  LOW: "bg-[#F1F3F5] text-[#646B72]",
  DRAFT: "bg-[#F1F3F5] text-[#646B72]",
  RETURNED: "bg-[#F1EEFE] text-[#5B45C7]",
  MAINTENANCE: "bg-[#FFF6EE] text-[#B4661A]",
};

export function StatusBadge({ value }: { value: string }) {
  const key = value.toUpperCase();
  const tone = statusTones[key] ?? statusTones[key.replace(/_/g, " ")] ?? "bg-[#F1F3F5] text-[#646B72]";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
        tone,
      )}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
}

export function Money({
  value,
  currency = "USD",
  strong,
}: {
  value: string | number | null | undefined;
  currency?: string;
  strong?: boolean;
}) {
  return (
    <span className={strong ? "font-bold text-[#212B36]" : "font-medium"}>
      {moneyFmt(value, currency)}
    </span>
  );
}

export function Qty({ value, unit }: { value: string | number | null | undefined; unit?: string }) {
  return (
    <span className="font-medium text-[#212B36]">
      {new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(toNum(value))}
      {unit ? <span className="ml-1 text-[11px] text-[#7A8086]">{unit}</span> : null}
    </span>
  );
}

export function Grid({ children, cols = 2 }: { children: React.ReactNode; cols?: 1 | 2 | 3 }) {
  return (
    <div
      className={
        cols === 1
          ? "grid grid-cols-1 gap-4"
          : cols === 3
            ? "grid grid-cols-1 gap-4 lg:grid-cols-3"
            : "grid grid-cols-1 gap-4 lg:grid-cols-2"
      }
    >
      {children}
    </div>
  );
}

/** Local search box that filters a list of rows in place. */
export function SearchBox({
  value,
  onChange,
  placeholder = "Search…",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#E6EAED] px-3 py-2 text-sm outline-none focus:border-[#FE9F43]"
      />
    </div>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import { clsx } from "@/lib/format";
import { Icon, type IconName } from "./icons";

/* Shared DreamsPOS-inspired design tokens */
export const T = {
  primary: "#bc60d3",
  primaryDark: "#e990d6",
  navy: "rgba(0, 0, 0, 0.8)",
  ink: "#c57bd8",
  muted: "#646B72",
  line: "#E6EAED",
  bg: "#F7F8F9",
} as const;

export const btnPrimary =
  "inline-flex items-center gap-2 rounded-lg bg-[#FE9F43] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E58A2C] disabled:opacity-60";
export const btnSoft =
  "inline-flex items-center gap-2 rounded-lg border border-[#bc60d3] bg-white px-3.5 py-2 text-sm font-semibold text-[#212B36] transition hover:bg-[#F9FAFB]";
export const btnGhost =
  "inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#646B72] transition hover:bg-[#F9FAFB] hover:text-[#212B36]";
export const btnDanger =
  "inline-flex items-center gap-2 rounded-lg border border-[#FBD5D5] bg-white px-3 py-1.5 text-sm font-semibold text-[#D63031] transition hover:bg-[#FEF2F2]";
export const inputClass =
  "w-full rounded-lg border border-[#E6EAED] bg-white px-3 py-2 text-sm text-[#212B36] placeholder-[#A6AAAF] outline-none transition focus:border-[#FE9F43]";
export const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#646B72]";

export function PageHeader({
  title,
  subtitle,
  crumbs = [],
  actions,
}: {
  title: string;
  subtitle?: string;
  crumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <nav className="mb-1.5 flex flex-wrap items-center gap-1.5 text-xs text-[#7A8086]">
          {crumbs.map((c, i) => (
            <span key={`${c.label}-${i}`} className="flex items-center gap-1.5">
              {c.href ? (
                <Link href={c.href} className="hover:text-[#FE9F43]">
                  {c.label}
                </Link>
              ) : (
                <span className="text-[#212B36]">{c.label}</span>
              )}
              {i < crumbs.length - 1 ? <Icon name="right" className="h-3 w-3" /> : null}
            </span>
          ))}
        </nav>
        <h1 className="text-xl font-bold text-[#212B36]">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-[#646B72]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({
  title,
  subtitle,
  icon,
  actions,
  children,
  className,
  bodyClassName = "p-5",
}: {
  title?: string;
  subtitle?: string;
  icon?: IconName;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={clsx(
        "overflow-hidden rounded-xl border border-[#E6EAED] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]",
        className,
      )}
    >
      {title ? (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6EAED] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            {icon ? (
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#FFF6EE] text-[#FE9F43]">
                <Icon name={icon} />
              </span>
            ) : null}
            <div>
              <h2 className="text-sm font-bold text-[#212B36]">{title}</h2>
              {subtitle ? <p className="text-xs text-[#646B72]">{subtitle}</p> : null}
            </div>
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

const toneStyles: Record<string, string> = {
  orange: "bg-[#FFF6EE] text-[#FE9F43]",
  green: "bg-[#EAF8F1] text-[#3EB780]",
  blue: "bg-[#EAF2FE] text-[#0984E3]",
  red: "bg-[#FDECEC] text-[#D63031]",
  purple: "bg-[#F1EEFE] text-[#6C5CE7]",
  teal: "bg-[#E6F7F5] text-[#009688]",
};

export function StatCard({
  label,
  value,
  sub,
  icon = "chart",
  tone = "orange",
  delta,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: IconName;
  tone?: keyof typeof toneStyles;
  delta?: { value: string; positive: boolean };
}) {
  return (
    <div className="rounded-xl border border-[#E6EAED] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#646B72]">{label}</p>
          <p className="mt-2 text-2xl font-bold leading-none text-[#212B36]">{value}</p>
        </div>
        <span className={clsx("grid h-10 w-10 place-items-center rounded-xl", toneStyles[tone])}>
          <Icon name={icon} className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        {delta ? (
          <span
            className={clsx(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold",
              delta.positive ? "bg-[#EAF8F1] text-[#3EB780]" : "bg-[#FDECEC] text-[#D63031]",
            )}
          >
            <Icon name={delta.positive ? "up" : "down2"} className="h-3 w-3" />
            {delta.value}
          </span>
        ) : null}
        {sub ? <span className="text-[#7A8086]">{sub}</span> : null}
      </div>
    </div>
  );
}

const badgeTones: Record<string, string> = {
  green: "bg-[#EAF8F1] text-[#2C7A57]",
  red: "bg-[#FDECEC] text-[#D63031]",
  orange: "bg-[#FFF6EE] text-[#B4661A]",
  blue: "bg-[#EAF2FE] text-[#0B62B8]",
  purple: "bg-[#F1EEFE] text-[#5B45C7]",
  gray: "bg-[#F1F3F5] text-[#646B72]",
  teal: "bg-[#E6F7F5] text-[#00796B]",
};

export function Badge({
  children,
  tone = "gray",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof badgeTones;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export type Column<T> = {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  width?: string;
  render?: (row: T) => ReactNode;
};

export function DataTable<T>({
  columns,
  rows,
  rowHref,
  emptyTitle = "Nothing here yet",
  emptyHint,
}: {
  columns: Column<T>[];
  rows: T[];
  rowHref?: (row: T) => string;
  emptyTitle?: string;
  emptyHint?: string;
}) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} hint={emptyHint} />;
  }
  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="bg-[#F9FAFB] text-left">
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={clsx(
                  "whitespace-nowrap border-b border-[#E6EAED] px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#646B72]",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const href = rowHref?.(row);
            return (
              <tr
                key={rowIndex}
                className="border-b border-[#F1F3F5] transition last:border-0 hover:bg-[#FDFCFA]"
              >
                {columns.map((col) => {
                  const content: ReactNode = col.render
                    ? col.render(row)
                    : ((row as Record<string, ReactNode>)[col.key] ?? null);
                  return (
                    <td
                      key={col.key}
                      className={clsx(
                        "px-5 py-3 align-middle text-[#212B36]",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                      )}
                    >
                      {href ? (
                        <Link href={href} className="block hover:text-[#FE9F43]">
                          {content}
                        </Link>
                      ) : (
                        content
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  icon = "inbox",
  action,
}: {
  title: string;
  hint?: string;
  icon?: IconName;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-5 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-[#F9FAFB] text-[#A6AAAF]">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <p className="text-sm font-semibold text-[#212B36]">{title}</p>
      {hint ? <p className="max-w-sm text-xs text-[#7A8086]">{hint}</p> : null}
      {action}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={clsx("block", className)}>
      <span className={labelClass}>{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-[#7A8086]">{hint}</span> : null}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(inputClass, props.className)} />;
}

export function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="number" step="any" {...props} className={clsx(inputClass, props.className)} />;
}

export function SelectInput({
  options,
  placeholder,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: { value: string | number; label: string }[];
  placeholder?: string;
}) {
  return (
    <select {...props} className={clsx(inputClass, "appearance-none pr-8", className)}>
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={clsx(inputClass, props.className)} />;
}

export function Checkbox({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={clsx("flex items-center gap-2 text-sm text-[#212B36]", className)}>
      <input
        type="checkbox"
        {...props}
        className="h-4 w-4 rounded border-[#D3D5D7] text-[#FE9F43]"
      />
      {label}
    </label>
  );
}

export function ProgressBar({ value, tone = "orange" }: { value: number; tone?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  const bg =
    tone === "green"
      ? "bg-[#3EB780]"
      : tone === "red"
        ? "bg-[#D63031]"
        : tone === "blue"
          ? "bg-[#0984E3]"
          : "bg-[#FE9F43]";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F1F3F5]">
      <div className={clsx("h-full rounded-full", bg)} style={{ width: `${clamped}%` }} />
    </div>
  );
}

export function KeyValue({
  items,
  columns = 2,
}: {
  items: { label: string; value: ReactNode }[];
  columns?: 1 | 2 | 3;
}) {
  return (
    <dl
      className={clsx(
        "grid gap-x-6 gap-y-4",
        columns === 1 ? "grid-cols-1" : columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="border-b border-dashed border-[#E6EAED] pb-2">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#7A8086]">
            {item.label}
          </dt>
          <dd className="mt-1 text-sm font-medium text-[#212B36]">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Tabs({
  tabs,
  active,
  baseHref,
}: {
  tabs: { key: string; label: string }[];
  active: string;
  baseHref: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-1 rounded-xl border border-[#E6EAED] bg-white p-1.5">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={`${baseHref}?tab=${tab.key}`}
            className={clsx(
              "rounded-lg px-3.5 py-2 text-sm font-semibold transition",
              isActive ? "bg-[#092C4C] text-white" : "text-[#646B72] hover:bg-[#F9FAFB]",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

export function Avatar({
  name,
  size = "h-9 w-9",
  tone = "bg-[#092C4C] text-white",
}: {
  name: string;
  size?: string;
  tone?: string;
}) {
  const letters = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span className={clsx("grid shrink-0 place-items-center rounded-full text-xs font-bold", size, tone)}>
      {letters}
    </span>
  );
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h3 className="text-sm font-bold text-[#212B36]">{children}</h3>
      {hint ? <span className="text-xs text-[#7A8086]">{hint}</span> : null}
    </div>
  );
}

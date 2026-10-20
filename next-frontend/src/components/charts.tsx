import { money, num } from "@/lib/format";

/* Lightweight dependency-free charts (pure SVG) for the dashboards. */

export function BarSeries({
  data,
  height = 180,
  color = "#FE9F43",
  formatValue = (v: number) => num(v),
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="group flex flex-1 flex-col items-center justify-end gap-2">
          <span className="text-[10px] font-bold text-[#646B72] opacity-0 transition group-hover:opacity-100">
            {formatValue(d.value)}
          </span>
          <div
            className="w-full max-w-[46px] rounded-t-md transition hover:brightness-110"
            style={{ height: `${Math.max(3, (d.value / max) * (height - 34))}px`, background: color }}
            title={`${d.label}: ${formatValue(d.value)}`}
          />
          <span className="truncate text-[10px] font-medium text-[#7A8086]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function AreaChart({
  data,
  height = 200,
  color = "#FE9F43",
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}) {
  if (data.length === 0) return null;
  const width = 600;
  const max = Math.max(1, ...data.map((d) => d.value));
  const min = Math.min(0, ...data.map((d) => d.value));
  const range = max - min || 1;
  const stepX = width / Math.max(1, data.length - 1);
  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = height - 16 - ((d.value - min) / range) * (height - 30);
    return [x, y] as const;
  });
  const line = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${width},${height - 6} L0,${height - 6} Z`;
  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1="0"
            x2={width}
            y1={(height - 16) * g}
            y2={(height - 16) * g}
            stroke="#E6EAED"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}
        <path d={area} fill="url(#areaFill)" />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="#fff" stroke={color} strokeWidth="2">
            <title>{`${data[i].label}: ${money(data[i].value)}`}</title>
          </circle>
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] font-medium text-[#7A8086]">
        <span>{data[0]?.label}</span>
        <span>{data[Math.floor(data.length / 2)]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

export function Donut({
  slices,
  size = 168,
  centerLabel,
  centerValue,
}: {
  slices: { label: string; value: number; color: string }[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  const total0 = slices.reduce((sum, s) => sum + s.value, 0) || 1;
  let running = 0;
  const arcs: { slice: (typeof slices)[number]; dash: number; offset: number }[] = [];
  slices.forEach((slice) => {
    const dash = (slice.value / total0) * circumference;
    arcs.push({ slice, dash, offset: running });
    running += dash;
  });
  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F1F3F5" strokeWidth="16" />
        {arcs.map(({ slice, dash, offset }) => (
          <circle
            key={slice.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={slice.color}
            strokeWidth="16"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
          >
            <title>{`${slice.label}: ${num(slice.value)}`}</title>
          </circle>
        ))}
      </svg>
      <div className="min-w-[180px] flex-1 space-y-2">
        {centerValue ? (
          <div className="mb-3">
            <p className="text-xl font-bold text-[#212B36]">{centerValue}</p>
            {centerLabel ? <p className="text-xs text-[#646B72]">{centerLabel}</p> : null}
          </div>
        ) : null}
        {slices.map((slice) => (
          <div key={slice.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-[#646B72]">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: slice.color }} />
              <span className="truncate">{slice.label}</span>
            </span>
            <span className="font-semibold text-[#212B36]">
              {num(slice.value)} · {((slice.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HorizontalBars({
  data,
  color = "#092C4C",
  formatValue = (v: number) => num(v),
}: {
  data: { label: string; value: number }[];
  color?: string;
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-xs">
            <span className="truncate font-medium text-[#212B36]">{d.label}</span>
            <span className="shrink-0 font-semibold text-[#646B72]">{formatValue(d.value)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#F1F3F5]">
            <div
              className="h-full rounded-full"
              style={{ width: `${(d.value / max) * 100}%`, background: color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatusDots({ items }: { items: { label: string; value: string; tone: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-[#E6EAED] bg-white p-3">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${item.tone}`} />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#7A8086]">
              {item.label}
            </span>
          </div>
          <p className="mt-1.5 text-lg font-bold text-[#212B36]">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

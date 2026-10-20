"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Card, KeyValue, ProgressBar, SectionTitle, StatCard } from "@/components/ui";
import { Checkbox, Field, NumberInput, SelectInput, TextInput, Textarea, btnPrimary, btnSoft } from "@/components/ui";
import { AreaChart, Donut, HorizontalBars } from "@/components/charts";
import { Grid, FormPanel, Money, StatusBadge, TableCard, ViewHeader } from "../parts";
import {
  TABLE_COUNT,
  companies as saCompanies,
  TABLE_MAP,
  countries,
  currencies,
  featureFlags,
  files,
  mrrByMonth,
  platformConfigs,
  platformFeatures,
  platformModules,
  platformSettings,
  saMetrics,
  tenantsByCountry,
  tenantsByPlan,
} from "@/lib/sa-data";
import { mrrFromStore, useSaStore } from "@/lib/sa-store";
import {
  createPlatformModule,
  createPlatformSetting,
  getFeatureFlags,
  getPlatformConfigs,
  getPlatformFeatures,
  getPlatformModules,
  getPlatformSettings,
  updatePlatformSetting,
  type FeatureFlag,
  type PlatformConfig,
  type PlatformFeature,
  type PlatformModule,
  type PlatformSetting,
} from "@/lib/api/platform";
import { getCountries, getCurrencies, type Country as ApiCountry, type Currency as ApiCurrency } from "@/lib/api/master-data";
import { compactMoney, dateShort, dateTime, money, num, timeAgo } from "@/lib/format";

/* ------------------------------- dashboard ------------------------------- */

export function Dashboard() {
  const m = saMetrics();
  const store = useSaStore();
  const liveMrr = mrrFromStore(store.subscriptions, store.addons);
  return (
    <div>
      <ViewHeader
        title="Platform overview"
        subtitle="Every vendor, subscription, invoice and device on your SaaS"
        crumbs={[{ label: "Super Admin" }, { label: "Overview" }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/super-admin/vendors/new" className={btnPrimary}>
              + Add vendor
            </Link>
            <Link href="/super-admin/reports" className={btnSoft}>
              Revenue reports
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Vendors" value={num(m.total)} sub={`${m.active} active · ${m.trial} trial`} icon="building" tone="blue" />
        <StatCard
          label="MRR"
          value={money(liveMrr)}
          sub={`${money(
            store.addons.filter((a) => a.status === "ACTIVE").reduce((sum, a) => sum + a.qty * a.price, 0),
          )} from add-ons`}
          icon="dollar"
          tone="green"
        />
        <StatCard label="ARR" value={money(liveMrr * 12)} icon="chart" tone="purple" />
        <StatCard label="Collected" value={compactMoney(m.collected)} sub={`${money(m.outstanding)} outstanding`} icon="card" tone="orange" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Vendor users" value={num(m.users)} icon="users" tone="blue" />
        <StatCard label="Branches" value={num(m.branches)} sub={`${m.warehouses} warehouses`} icon="pin" tone="teal" />
        <StatCard label="POS terminals" value={num(m.terminals)} icon="phone" tone="purple" />
        <StatCard
          label="Devices online"
          value={`${m.online}/${m.devices}`}
          sub={`${m.offline} offline`}
          icon="activity"
          tone={m.offline > 2 ? "red" : "green"}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Collections" subtitle="Subscription payments received" icon="chart" className="lg:col-span-2">
          <AreaChart data={mrrByMonth()} height={230} />
        </Card>
        <Card title="Vendors by plan" icon="pie">
          <Donut slices={tenantsByPlan()} centerValue={num(m.total)} centerLabel="vendors" />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Needs attention" icon="alert">
          <ul className="space-y-3">
            <li className="flex items-start justify-between gap-3 rounded-lg bg-[#FDECEC] px-3 py-2.5">
              <div>
                <p className="text-sm font-bold text-[#212B36]">Ceylon Mart suspended</p>
                <p className="text-xs text-[#646B72]">Two failed payments — deletion approved for 14 days</p>
              </div>
              <Link href="/super-admin/vendors/5" className="shrink-0 text-xs font-bold text-[#D63031]">
                Review
              </Link>
            </li>
            <li className="flex items-start justify-between gap-3 rounded-lg bg-[#FFF6EE] px-3 py-2.5">
              <div>
                <p className="text-sm font-bold text-[#212B36]">XYZ Grocery trial ends in 2 days</p>
                <p className="text-xs text-[#646B72]">No payment method on file · upgrade requested</p>
              </div>
              <Link href="/super-admin/vendors/2" className="shrink-0 text-xs font-bold text-[#B4661A]">
                Open
              </Link>
            </li>
            <li className="flex items-start justify-between gap-3 rounded-lg bg-[#F9FAFB] px-3 py-2.5">
              <div>
                <p className="text-sm font-bold text-[#212B36]">{m.openTickets} support tickets open</p>
                <p className="text-xs text-[#646B72]">1 urgent — offline sync at Freshmart</p>
              </div>
              <Link href="/super-admin/tickets" className="shrink-0 text-xs font-bold text-[#0984E3]">
                Queue
              </Link>
            </li>
            <li className="flex items-start justify-between gap-3 rounded-lg bg-[#F9FAFB] px-3 py-2.5">
              <div>
                <p className="text-sm font-bold text-[#212B36]">{m.overrides} feature overrides active</p>
                <p className="text-xs text-[#646B72]">Vendors using features outside their plan</p>
              </div>
              <Link href="/super-admin/overrides" className="shrink-0 text-xs font-bold text-[#0984E3]">
                Manage
              </Link>
            </li>
          </ul>
        </Card>
        <Card title="Vendors by country" subtitle="Tax system follows the vendor country" icon="globe">
          <div className="space-y-3">
            {tenantsByCountry().map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-[#212B36]">{row.label}</span>
                  <span className="text-[#646B72]">
                    {row.value} vendor{row.value > 1 ? "s" : ""} · VAT {row.rate}%
                  </span>
                </div>
                <ProgressBar value={(row.value / m.total) * 100} />
              </div>
            ))}
          </div>
        </Card>
        <Card title="Quick actions" icon="settings">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "New vendor", href: "/super-admin/vendors/new", icon: "plus" as const },
              { label: "Plans & limits", href: "/super-admin/plans", icon: "award" as const },
              { label: "Invoices", href: "/super-admin/invoices", icon: "file" as const },
              { label: "Gateways", href: "/super-admin/gateways", icon: "card" as const },
              { label: "API clients", href: "/super-admin/api", icon: "key" as const },
              { label: "Audit log", href: "/super-admin/audit", icon: "activity" as const },
              { label: "Countries & tax", href: "/super-admin/countries", icon: "globe" as const },
              { label: "Database map", href: "/super-admin/database", icon: "database" as const },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-lg border border-[#E6EAED] px-3 py-2.5 text-xs font-bold text-[#212B36] transition hover:border-[#FE9F43] hover:bg-[#FFF6EE]"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------- reports -------------------------------- */

export function ReportsView() {
  const m = saMetrics();
  return (
    <div>
      <ViewHeader
        title="Platform reports"
        subtitle="Revenue, growth and adoption across every tenant"
        crumbs={[{ label: "Super Admin" }, { label: "Reports" }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="MRR" value={money(m.mrr)} icon="dollar" tone="green" />
        <StatCard label="ARR" value={money(m.arr)} icon="chart" tone="purple" />
        <StatCard label="Collected" value={money(m.collected)} icon="card" tone="blue" />
        <StatCard label="Outstanding" value={money(m.outstanding)} icon="clock" tone="orange" />
      </div>
      <Grid>
        <Card title="Collections trend" icon="chart">
          <AreaChart data={mrrByMonth()} />
        </Card>
        <Card title="Tenants by plan" icon="pie">
          <HorizontalBars
            data={tenantsByPlan().map((p) => ({ label: p.label, value: p.value }))}
            color="#FE9F43"
            formatValue={(v) => `${v} tenants`}
          />
        </Card>
      </Grid>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Adoption" icon="users">
          <HorizontalBars
            data={[
              { label: "Vendor users", value: m.users },
              { label: "Branches", value: m.branches },
              { label: "Warehouses", value: m.warehouses },
              { label: "Terminals", value: m.terminals },
              { label: "Devices", value: m.devices },
            ]}
            color="#092C4C"
          />
        </Card>
        <Card title="API volume" icon="activity">
          <KeyValue
            items={[
              { label: "Requests / month", value: num(m.apiCalls) },
              { label: "Registered clients", value: num(6) },
              { label: "Webhook failures (24h)", value: num(15) },
              { label: "Avg response", value: "68 ms" },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}

/* --------------------------- platform settings -------------------------- */

export function PlatformSettingsView() {
  const [rows, setRows] = useState<PlatformSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, string>>(Object.fromEntries(platformSettings.map((x) => [x.key, x.value])));

  useEffect(() => {
    getPlatformSettings().then((data) => {
      setRows(data);
      if (data.length) setValues(Object.fromEntries(data.map((x) => [x.setting_key, x.setting_value ?? ""])));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const fields = rows.length ? rows.map((x) => ({ key:x.setting_key, value:x.setting_value ?? "", type:x.value_type ?? "string", description:x.description ?? "", id:x.id })) : platformSettings;

  return (
    <div>
      <ViewHeader title="Platform settings" subtitle="Global defaults applied to every new vendor" crumbs={[{ label: "Super Admin" }, { label: "Platform" }, { label: "Settings" }]} />
      <Grid>
        <FormPanel title="Global settings" hint={loading ? "Loading platform_settings..." : "Changes are written to platform_settings"} submitLabel="Save settings" onSubmit={async (submitted) => {
          const next = { ...values };
          await Promise.all(fields.map(async (setting) => {
            const value = submitted[`setting_${setting.key}`];
            if (typeof value !== "string") return;
            next[setting.key] = value;
            const payload = { setting_key: setting.key, setting_value: value, value_type: setting.type, description: setting.description, is_public: true };
            if ("id" in setting && setting.id) await updatePlatformSetting(setting.id, payload);
            else await createPlatformSetting(payload);
          }));
          setValues(next);
          const refreshed = await getPlatformSettings();
          setRows(refreshed);
        }}>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((setting) => (
              <Field key={setting.key} label={setting.key.replace(/_/g, " ")} hint={setting.description}>
                {setting.type === "boolean" ? <SelectInput name={`setting_${setting.key}`} defaultValue={values[setting.key]} options={[{ value:"true", label:"Enabled" }, { value:"false", label:"Disabled" }]} /> : setting.type === "number" ? <NumberInput name={`setting_${setting.key}`} defaultValue={values[setting.key]} /> : <TextInput name={`setting_${setting.key}`} defaultValue={values[setting.key]} />}
              </Field>
            ))}
          </div>
        </FormPanel>
        <div className="space-y-4">
          <Card title="Live values" icon="database"><KeyValue items={fields.slice(0, 6).map((setting) => ({ label:setting.key.replace(/_/g, " "), value:setting.type === "boolean" ? <StatusBadge value={values[setting.key] === "true" ? "ACTIVE" : "INACTIVE"} /> : values[setting.key] }))} /></Card>
          <Card title="What lives here" icon="shield"><p className="text-sm text-[#646B72]">Only platform wide behaviour. Vendor specific configuration lives in <span className="font-mono text-xs">company_settings</span> and vendor tax lives in <span className="font-mono text-xs">company_tax_settings</span>.</p></Card>
        </div>
      </Grid>
    </div>
  );
}

export function PlatformConfigsView() {
  const [rows, setRows] = useState<PlatformConfig[]>([]);
  useEffect(() => { getPlatformConfigs().then(setRows).catch(console.error); }, []);
  const data = rows.length ? rows.map((x) => ({ id:x.id, key:x.config_key, group:x.config_group, value:x.config_value, env:x.environment, encrypted:x.is_encrypted })) : platformConfigs.map((x, i) => ({ id:i + 1, ...x }));
  return (
    <div>
      <ViewHeader title="Technical configuration" subtitle="Environment scoped settings with encrypted secrets" crumbs={[{ label: "Super Admin" }, { label: "Platform" }, { label: "Configs" }]} />
      <TableCard title="platform_configs" subtitle="Grouped by subsystem · production environment" columns={[
        { key:"key", label:"Setting", render:(row)=><span className="font-mono text-xs">{row.key}</span> },
        { key:"group", label:"Group", render:(row)=><Badge tone="blue">{row.group}</Badge> },
        { key:"value", label:"Value", render:(row)=><span className="font-mono text-[11px] text-[#646B72]">{JSON.stringify(row.value)}</span> },
        { key:"env", label:"Environment" },
        { key:"encrypted", label:"Secret", render:(row)=>row.encrypted ? <Badge tone="red">Encrypted</Badge> : <Badge tone="gray">Plain</Badge> },
      ]} rows={data} footer={<p className="text-xs text-[#7A8086]">Secrets are stored encrypted with the platform KMS key and never returned by the API.</p>} />
    </div>
  );
}

/* ------------------------------ modules --------------------------------- */

export function PlatformModulesView() {
  const [modules, setModules] = useState<PlatformModule[]>([]);
  const [features, setFeatures] = useState<PlatformFeature[]>([]);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  useEffect(() => { Promise.all([getPlatformModules(), getPlatformFeatures(), getFeatureFlags()]).then(([m,f,ff]) => { setModules(m); setFeatures(f); setFlags(ff); }).catch(console.error); }, []);
  const moduleRows = modules.length ? modules : platformModules.map((m) => ({ id:m.id, module_code:m.code, module_name:m.name, description:m.description, version:m.version, is_active:m.active, sort_order:m.order } as PlatformModule));
  const featureRows = features.length ? features : platformFeatures.map((f) => ({ id:f.id, module_id:f.moduleId, feature_code:f.code, feature_name:f.name, description:f.description, is_active:f.active } as PlatformFeature));
  const flagRows = flags.length ? flags : featureFlags.map((f) => ({ id:f.id, feature_id:f.featureId, flag_key:f.key, is_enabled:f.enabled, rollout_percentage:f.rollout, conditions:f.conditions, created_at:"", updated_at:"" } as FeatureFlag));
  return (
    <div>
      <ViewHeader title="Platform modules" subtitle="What the SaaS can sell — modules are switched on per plan" crumbs={[{ label: "Super Admin" }, { label: "Platform" }, { label: "Modules" }]} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {moduleRows.map((module) => { const fs=featureRows.filter((f)=>f.module_id===module.id); return <Card key={module.id} title={module.module_name} subtitle={`${module.module_code} · v${module.version ?? "1.0.0"}`} actions={<StatusBadge value={module.is_active ? "ACTIVE" : "INACTIVE"} />}><p className="text-sm text-[#646B72]">{module.description}</p><div className="mt-3"><SectionTitle hint={`${fs.length} features`}>Features</SectionTitle><div className="flex flex-wrap gap-1.5">{fs.map((feature)=><span key={feature.id} className="rounded-full bg-[#F1F3F5] px-2 py-0.5 text-[10px] font-semibold text-[#646B72]">{feature.feature_name}</span>)}</div></div></Card>; })}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Feature catalogue" icon="list"><TableCard title="" columns={[{key:"name",label:"Feature"},{key:"code",label:"Code",render:(r)=><span className="font-mono text-[11px]">{r.code}</span>},{key:"module",label:"Module",render:(r)=>moduleRows.find((m)=>m.id===r.moduleId)?.module_name ?? "—"},{key:"status",label:"State",render:(r)=><StatusBadge value={r.active ? "ACTIVE" : "INACTIVE"} />}]} rows={featureRows.map((f)=>({id:f.id,name:f.feature_name,code:f.feature_code,moduleId:f.module_id,active:f.is_active}))} /></Card>
        <div className="space-y-4"><Card title="Feature flags" icon="shield"><TableCard title="" columns={[{key:"key",label:"Flag",render:(r)=><span className="font-mono text-[11px]">{r.key}</span>},{key:"feature",label:"Feature",render:(r)=>featureRows.find((f)=>f.id===r.featureId)?.feature_name ?? "—"},{key:"rollout",label:"Rollout",align:"right",render:(r)=>`${r.rollout}%`},{key:"conditions",label:"Conditions",render:(r)=><span className="font-mono text-[10px] text-[#646B72]">{JSON.stringify(r.conditions)}</span>},{key:"enabled",label:"On",align:"center",render:(r)=>r.enabled?"✓":"—"}]} rows={flagRows.map((f)=>({id:f.id,key:f.flag_key,featureId:f.feature_id,rollout:f.rollout_percentage,conditions:f.conditions,enabled:f.is_enabled}))} /></Card>
          <FormPanel title="Register a module" submitLabel="Add module" onSubmit={async (values)=>{ const code=String(values.code??"").toUpperCase(); const name=String(values.name??""); if(!code||!name)return; await createPlatformModule({module_code:code,module_name:name,description:String(values.description??""),version:"1.0.0",is_active:true,sort_order:moduleRows.length+1}); setModules(await getPlatformModules()); }}>
            <Field label="Module code"><TextInput name="code" placeholder="INVENTORY_ADVANCED" /></Field><Field label="Module name"><TextInput name="name" placeholder="Advanced inventory" /></Field><Field label="Description"><Textarea name="description" /></Field>
          </FormPanel>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- countries / currency ----------------------- */

export function CountriesView() {
  const [countryRows,setCountryRows]=useState<ApiCountry[]>([]);
  const [currencyRows,setCurrencyRows]=useState<ApiCurrency[]>([]);
  useEffect(()=>{Promise.all([getCountries(),getCurrencies()]).then(([c,cur])=>{setCountryRows(c);setCurrencyRows(cur);}).catch(console.error);},[]);
  const rows=countryRows.length?countryRows:countries.map(c=>({id:c.id,uuid:"",country_code:c.code,country_name:c.name,phone_code:c.phone,is_active:c.active,created_at:"",updated_at:""} as ApiCountry));
  const curs=currencyRows.length?currencyRows:currencies.map(c=>({id:c.id,uuid:"",currency_code:c.code,currency_name:c.name,symbol:c.symbol,decimal_places:c.decimals,is_active:c.active,created_at:"",updated_at:""} as ApiCurrency));
  const usage=new Map<number,number>();
  return <div><ViewHeader title="Countries & tax systems" subtitle="The default tax system and rate a vendor inherits when it is created" crumbs={[{label:"Super Admin"},{label:"Master data"},{label:"Countries"}]} /><div className="grid gap-4 lg:grid-cols-3"><Card title="Country list" className="lg:col-span-2"><TableCard title="" columns={[{key:"name",label:"Country"},{key:"code",label:"ISO",render:r=><span className="font-mono text-xs">{r.code}</span>},{key:"phone",label:"Phone code"},{key:"taxSystem",label:"Tax system",render:()=>"—"},{key:"defaultRate",label:"Default rate",align:"right",render:()=>"—"},{key:"tenants",label:"Vendors",align:"right",render:r=>num(usage.get(r.id)??0)},{key:"active",label:"State",render:r=><StatusBadge value={r.active?"ACTIVE":"INACTIVE"} />}]} rows={rows.map(c=>({id:c.id,name:c.country_name,code:c.country_code,phone:c.phone_code,active:c.is_active}))} /></Card><Card title="How vendor tax works" icon="shield"><ol className="space-y-3 text-sm text-[#646B72]"><li>1. A vendor is created with a country.</li><li>2. <span className="font-mono text-xs">company_tax_settings</span> is seeded from that country.</li><li>3. The registration number, rate and inclusive flag are editable per vendor.</li><li>4. The vendor ERP applies its own tax codes and rates on products, customers and invoices.</li></ol></Card></div><div className="mt-4"><Card title="Currencies" icon="dollar"><TableCard title="" columns={[{key:"name",label:"Currency"},{key:"code",label:"Code",render:r=><span className="font-mono text-xs">{r.code}</span>},{key:"symbol",label:"Symbol"},{key:"decimals",label:"Decimals",align:"right"},{key:"active",label:"State",render:r=><StatusBadge value={r.active?"ACTIVE":"INACTIVE"} />}]} rows={curs.map(c=>({id:c.id,name:c.currency_name,code:c.currency_code,symbol:c.symbol,decimals:c.decimal_places,active:c.is_active}))} /></Card></div></div>;
}

export function FilesView() {
  return (
    <div>
      <ViewHeader
        title="Files"
        subtitle="Branding, trade licences and support attachments"
        crumbs={[{ label: "Super Admin" }, { label: "Master data" }, { label: "Files" }]}
      />
      <Card title="Storage" icon="database" actions={<StatCard label="Files" value={num(files.length)} icon="file" tone="blue" />}>
        <TableCard
          title=""
          columns={[
            { key: "name", label: "File", render: (row) => <span className="font-semibold">{row.name}</span> },
            {
              key: "company",
              label: "Vendor",
              render: (row) =>
                row.companyId
                  ? (saCompanyName(row.companyId) ?? "—")
                  : "Platform",
            },
            { key: "mime", label: "Type", render: (row) => <Badge tone="gray">{row.mime}</Badge> },
            { key: "size", label: "Size", align: "right" },
            { key: "by", label: "Uploaded by" },
            { key: "at", label: "When", render: (row) => dateShort(row.at) },
            {
              key: "path",
              label: "Storage path",
              render: (row) => <span className="font-mono text-[10px] text-[#7A8086]">{row.path}</span>,
            },
          ]}
          rows={files}
        />
      </Card>
    </div>
  );
}

function saCompanyName(id: number) {
  return saCompanies.find((c) => c.id === id)?.name;
}

/* ----------------------------- database map ----------------------------- */

export function DatabaseMapView() {
  const [query, setQuery] = useState("");
  return (
    <div>
      <ViewHeader
        title="Super Admin database map"
        subtitle={`${TABLE_COUNT} tables in saas_super_admin — what each one is for, in plain language`}
        crumbs={[{ label: "Super Admin" }, { label: "Reference" }, { label: "Database map" }]}
        actions={
          <div className="w-64">
            <TextInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tables…"
            />
          </div>
        }
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tables" value={num(TABLE_COUNT)} icon="database" tone="blue" />
        <StatCard label="Modules" value={num(TABLE_MAP.length)} icon="layers" tone="orange" />
        <StatCard label="Database" value="saas_super_admin" icon="server" tone="purple" />
        <StatCard label="ERP tables here" value={num(0)} sub="products, sales and stock live in the tenant ERP" icon="shield" tone="green" />
      </div>

      {TABLE_MAP.map((group) => {
        const tables = group.tables.filter((table) =>
          query
            ? `${table.name} ${table.purpose}`.toLowerCase().includes(query.toLowerCase())
            : true,
        );
        if (tables.length === 0) return null;
        return (
          <div key={group.module} className="mb-4">
            <SectionTitle hint={`${tables.length} tables`}>{group.module}</SectionTitle>
            <Card>
              <TableCard
                title=""
                columns={[
                  {
                    key: "name",
                    label: "Table",
                    render: (row) => <span className="font-mono text-xs font-semibold">{row.name}</span>,
                  },
                  { key: "purpose", label: "What it holds" },
                ]}
                rows={tables}
              />
            </Card>
          </div>
        );
      })}

      <Card title="Key relationships" icon="layers">
        <pre className="overflow-x-auto rounded-lg bg-[#F9FAFB] p-4 font-mono text-[11px] leading-relaxed text-[#212B36]">
{`countries ──┐
           ├──> companies ──┬──> company_tax_settings ──> countries  (tax per vendor + country)
currencies ─┘               │
                            ├──> company_users          (vendor staff)
                            ├──> company_branches ──> company_warehouses ──> company_terminals
                            ├──> company_devices
                            ├──> company_settings / contacts / addresses
                            └──> company_subscriptions ──┬── subscription_plans ──┬── plan_limits
                                                        │                        ├── plan_modules
                                                        │                        └── plan_features
                                                        ├── subscription_invoices ──> invoice_items
                                                        │        └──> subscription_payments ──> refunds
                                                        ├── subscription_addons / trials / changes
                                                        └── subscription_usage ──> usage_logs

platform_admins ──> platform_admin_roles ──> platform_permissions
support_tickets ──> messages ──> attachments
company_feature_overrides ──> platform_features   (super admin override)`}
        </pre>
      </Card>
    </div>
  );
}

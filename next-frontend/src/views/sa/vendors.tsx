"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

import {
  createCompany,
  getCompanies,
  getCompany,
  type Company,
} from "@/lib/api/companies";

import {
  getCountries,
  getCurrencies,
  type Country,
  type Currency,
} from "@/lib/api/master-data";

import {
  Badge,
  Card,
  KeyValue,
  ProgressBar,
  StatCard,
} from "@/components/ui";

import {
  Checkbox,
  Field,
  NumberInput,
  SelectInput,
  TextInput,
  Textarea,
  btnPrimary,
  btnSoft,
  btnDanger,
} from "@/components/ui";

import {
  FormPanel,
  Grid,
  Money,
  StatusBadge,
  TableCard,
  ViewHeader,
} from "../parts";

import {
  addons as saAddons,
  companies as mockCompanies,
  companyById,
  deletionRequests,
  featureOverrides,
  platformFeatures,
  plans,
  usernameRules,
} from "@/lib/sa-data";

import {
  dateShort,
  dateTime,
  money,
  num,
} from "@/lib/format";

import {
  addonName,
  assignSubscription,
  attachAddon,
  cancelSubscription,
  reactivateSubscription,
  removeAddon,
  subscriptionFor,
  usageRowsFor,
  useSaStore,
} from "@/lib/sa-store";
import {
  getCompanySettings, getCompanyContacts, getCompanyAddresses, getCompanyStatusHistory, getCompanyUsers, getUsernameRules,
  getCompanyBranches, getCompanyWarehouses, getCompanyDevices, getCompanyTerminals, getCompanyTaxSettings,
} from "@/lib/api/company-resources";


/* =========================================================
   VENDORS
   ========================================================= */

export function VendorsView({
  query,
  status,
}: {
  query: string;
  status: string;
}) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const [search, setSearch] = useState(query ?? "");
  const [filter, setFilter] = useState(status || "ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [
          companyData,
          countryData,
          currencyData,
        ] = await Promise.all([
          getCompanies(),
          getCountries(),
          getCurrencies(),
        ]);

        setCompanies(companyData);
        setCountries(countryData);
        setCurrencies(currencyData);
      } catch (err) {
        console.error("Failed to load vendor data:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load vendor data.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const rows = companies
    .filter(
      (company) =>
        filter === "ALL" ||
        company.status.toUpperCase() ===
          filter.toUpperCase(),
    )
    .filter((company) => {
      if (!search.trim()) {
        return true;
      }

      const searchableText = `
        ${company.company_name}
        ${company.company_code}
        ${company.legal_name ?? ""}
        ${company.tax_number ?? ""}
      `.toLowerCase();

      return searchableText.includes(
        search.toLowerCase(),
      );
    });

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[#FE9F43]" />

          <span className="text-sm font-medium text-gray-600">
            Loading vendors...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h3 className="font-semibold text-red-700">
            Unable to load vendors
          </h3>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>

          <p className="mt-3 text-xs text-red-500">
            Make sure Laravel is running on
            http://127.0.0.1:8000.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <div className="mb-1 flex items-center gap-2 text-xs text-gray-400">
            <span>Super Admin</span>
            <span>/</span>
            <span>Vendors</span>
          </div>

          <h1 className="text-2xl font-bold text-[#212B36]">
            Vendors
          </h1>

          <p className="mt-1 text-sm text-[#7A8086]">
            {companies.length} companies on the platform
          </p>
        </div>

        <Link
          href="/super-admin/vendors/new"
          className={btnPrimary}
        >
          + Add vendor
        </Link>
      </div>


      {/* SEARCH */}

      <Card
        title="Find a vendor"
        subtitle="Search and filter companies connected to the platform"
      >
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">

          <Field label="Search">
            <TextInput
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Company name, code, legal name..."
            />
          </Field>

          <Field label="Status">
            <SelectInput
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
              options={[
                {
                  value: "ALL",
                  label: "All statuses",
                },
                {
                  value: "ACTIVE",
                  label: "Active",
                },
                {
                  value: "PENDING",
                  label: "Pending",
                },
                {
                  value: "SUSPENDED",
                  label: "Suspended",
                },
                {
                  value: "INACTIVE",
                  label: "Inactive",
                },
              ]}
            />
          </Field>

        </div>
      </Card>


      {/* TABLE */}

      <Card
        title="Vendor companies"
        subtitle={`${rows.length} result${
          rows.length === 1 ? "" : "s"
        }`}
      >
        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px] border-collapse">

            <thead>
              <tr className="border-b border-gray-200 text-left">

                {[
                  "Vendor",
                  "Country",
                  "Currency",
                  "Timezone",
                  "Created",
                  "Status",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-500"
                  >
                    {heading}
                  </th>
                ))}

              </tr>
            </thead>

            <tbody>

              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center"
                  >
                    <p className="font-semibold text-gray-700">
                      No vendors found
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Try another search or status.
                    </p>
                  </td>
                </tr>
              ) : (
                rows.map((company) => {

                  const country =
                    countries.find(
                      (item) =>
                        item.id ===
                        company.country_id,
                    );

                  const currency =
                    currencies.find(
                      (item) =>
                        item.id ===
                        company.currency_id,
                    );

                  return (
                    <tr
                      key={company.id}
                      className="border-b border-gray-100 transition hover:bg-gray-50"
                    >

                      <td className="px-4 py-4">
                        <Link
                          href={`/super-admin/vendors/${company.id}`}
                          className="group"
                        >
                          <p className="font-semibold text-[#212B36] group-hover:text-[#FE9F43]">
                            {company.company_name}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {company.company_code}

                            {company.legal_name
                              ? ` · ${company.legal_name}`
                              : ""}
                          </p>
                        </Link>
                      </td>


                      <td className="px-4 py-4 text-sm text-gray-600">
                        {country?.country_name ?? "—"}
                      </td>


                      <td className="px-4 py-4">

                        {currency ? (
                          <>
                            <p className="text-sm font-medium text-gray-700">
                              {currency.currency_code}
                            </p>

                            <p className="text-xs text-gray-400">
                              {currency.currency_name}
                            </p>
                          </>
                        ) : (
                          "—"
                        )}

                      </td>


                      <td className="px-4 py-4 text-sm text-gray-600">
                        {company.timezone}
                      </td>


                      <td className="px-4 py-4 text-sm text-gray-600">
                        {formatDate(company.created_at)}
                      </td>


                      <td className="px-4 py-4">

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(
                            company.status,
                          )}`}
                        >
                          {company.status}
                        </span>

                      </td>

                    </tr>
                  );
                })
              )}

            </tbody>
          </table>

        </div>
      </Card>

    </div>
  );
}


/* =========================================================
   ADD VENDOR
   ========================================================= */

export function AddVendorView() {

  const [countries, setCountries] =
    useState<Country[]>([]);

  const [currencies, setCurrencies] =
    useState<Currency[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<Company | null>(null);


  const [form, setForm] = useState({

    company_name: "",
    company_code: "",
    legal_name: "",
    tax_number: "",
    country_id: "",
    currency_id: "",
    timezone: "Asia/Qatar",
    database_identifier: "",

  });


  useEffect(() => {

    async function loadMasterData() {

      try {

        setLoading(true);
        setError(null);

        const [
          countryData,
          currencyData,
        ] = await Promise.all([
          getCountries(),
          getCurrencies(),
        ]);

        setCountries(
          countryData.filter(
            (country) => country.is_active,
          ),
        );

        setCurrencies(
          currencyData.filter(
            (currency) => currency.is_active,
          ),
        );

      } catch (err) {

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load master data.",
        );

      } finally {

        setLoading(false);

      }

    }

    loadMasterData();

  }, []);


  function updateField(
    field: keyof typeof form,
    value: string,
  ) {

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

  }


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {

    event.preventDefault();

    try {

      setSubmitting(true);
      setError(null);
      setSuccess(null);


      if (!form.company_name.trim()) {
        throw new Error(
          "Company name is required.",
        );
      }

      if (!form.company_code.trim()) {
        throw new Error(
          "Company code is required.",
        );
      }

      if (!form.timezone) {
        throw new Error(
          "Timezone is required.",
        );
      }


      const company = await createCompany({

        company_name:
          form.company_name.trim(),

        company_code:
          form.company_code.trim(),

        legal_name:
          form.legal_name.trim() || null,

        tax_number:
          form.tax_number.trim() || null,

        country_id:
          form.country_id
            ? Number(form.country_id)
            : null,

        currency_id:
          form.currency_id
            ? Number(form.currency_id)
            : null,

        timezone:
          form.timezone,

        status:
          "PENDING",

        database_identifier:
          form.database_identifier.trim()
            || null,

      });


      setSuccess(company);


      setForm({

        company_name: "",
        company_code: "",
        legal_name: "",
        tax_number: "",
        country_id: "",
        currency_id: "",
        timezone: "Asia/Qatar",
        database_identifier: "",

      });

    } catch (err) {

      console.error(
        "Create company failed:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create company.",
      );

    } finally {

      setSubmitting(false);

    }

  }


  if (loading) {

    return (
      <div className="flex min-h-[400px] items-center justify-center">

        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">

          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[#FE9F43]" />

          <span className="text-sm text-gray-600">
            Loading form...
          </span>

        </div>

      </div>
    );

  }


  return (

    <div className="space-y-5">

      {/* HEADER */}

      <div>

        <div className="mb-1 flex items-center gap-2 text-xs text-gray-400">

          <Link
            href="/super-admin"
            className="hover:text-gray-700"
          >
            Super Admin
          </Link>

          <span>/</span>

          <Link
            href="/super-admin/vendors"
            className="hover:text-gray-700"
          >
            Vendors
          </Link>

          <span>/</span>

          <span>New</span>

        </div>

        <h1 className="text-2xl font-bold text-[#212B36]">
          Add a vendor
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a company in the Super Admin database.
        </p>

      </div>


      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">

          <p className="font-semibold text-red-700">
            Unable to create vendor
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>

        </div>
      )}


      {/* SUCCESS */}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">

          <p className="font-semibold text-emerald-700">
            Vendor created successfully.
          </p>

          <p className="mt-1 text-sm text-emerald-600">
            {success.company_name} (
            {success.company_code})
          </p>

          <Link
            href={`/super-admin/vendors/${success.id}`}
            className="mt-3 inline-block text-sm font-bold text-emerald-700 underline"
          >
            Open vendor →
          </Link>

        </div>
      )}


      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 lg:grid-cols-[1fr_320px]"
      >

        <Card
          title="Vendor details"
          subtitle="These values are stored in the companies table."
        >

          <div className="grid gap-4 sm:grid-cols-2">

            <Field label="Company name">

              <TextInput
                value={form.company_name}
                onChange={(e) =>
                  updateField(
                    "company_name",
                    e.target.value,
                  )
                }
                required
                placeholder="Al Sadd Mart W.L.L"
              />

            </Field>


            <Field label="Company code">

              <TextInput
                value={form.company_code}
                onChange={(e) =>
                  updateField(
                    "company_code",
                    e.target.value,
                  )
                }
                required
                placeholder="CMP-001"
              />

            </Field>


            <Field label="Legal name">

              <TextInput
                value={form.legal_name}
                onChange={(e) =>
                  updateField(
                    "legal_name",
                    e.target.value,
                  )
                }
                placeholder="Al Sadd Mart Trading W.L.L"
              />

            </Field>


            <Field label="Tax number">

              <TextInput
                value={form.tax_number}
                onChange={(e) =>
                  updateField(
                    "tax_number",
                    e.target.value,
                  )
                }
                placeholder="TRN-100000000"
              />

            </Field>


            <Field label="Country">

              <SelectInput
                value={form.country_id}
                onChange={(e) =>
                  updateField(
                    "country_id",
                    e.target.value,
                  )
                }
                options={[
                  {
                    value: "",
                    label: "Select country",
                  },

                  ...countries.map(
                    (country) => ({
                      value: country.id,
                      label: `${country.country_name} (${country.country_code})`,
                    }),
                  ),
                ]}
              />

            </Field>


            <Field label="Currency">

              <SelectInput
                value={form.currency_id}
                onChange={(e) =>
                  updateField(
                    "currency_id",
                    e.target.value,
                  )
                }
                options={[
                  {
                    value: "",
                    label: "Select currency",
                  },

                  ...currencies.map(
                    (currency) => ({
                      value: currency.id,
                      label: `${currency.currency_name} (${currency.currency_code})`,
                    }),
                  ),
                ]}
              />

            </Field>


            <Field label="Timezone">

              <SelectInput
                value={form.timezone}
                onChange={(e) =>
                  updateField(
                    "timezone",
                    e.target.value,
                  )
                }
                options={[
                  "Asia/Qatar",
                  "Asia/Dubai",
                  "Asia/Riyadh",
                  "Asia/Colombo",
                  "Asia/Kolkata",
                ].map((value) => ({
                  value,
                  label: value,
                }))}
              />

            </Field>


            <Field
              label="Database identifier"
              hint="Optional tenant database identifier."
            >

              <TextInput
                value={
                  form.database_identifier
                }
                onChange={(e) =>
                  updateField(
                    "database_identifier",
                    e.target.value,
                  )
                }
                placeholder="vendor_al_sadd"
              />

            </Field>

          </div>


          <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4">

            <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
              Initial status
            </p>

            <p className="mt-1 text-sm text-amber-800">
              New companies are created as{" "}
              <strong>PENDING</strong>.
            </p>

          </div>


          <div className="mt-6 flex flex-wrap gap-3">

            <Link
              href="/super-admin/vendors"
              className={btnSoft}
            >
              Cancel
            </Link>


            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-lg bg-[#FE9F43] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#F08B2E] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {submitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Creating...
                </>
              ) : (
                "Create vendor"
              )}

            </button>

          </div>

        </Card>


        <div className="space-y-4">

          <Card title="Database record">

            <div className="space-y-2">

              {[
                "companies",
                "company_settings",
                "company_contacts",
                "company_addresses",
                "company_users",
                "company_branches",
                "company_warehouses",
                "company_devices",
                "company_terminals",
                "company_tax_settings",
              ].map((table) => (

                <div
                  key={table}
                  className="rounded-lg bg-gray-50 px-3 py-2 font-mono text-[11px] text-gray-600"
                >
                  {table}
                </div>

              ))}

            </div>

          </Card>


          <Card title="Important">

            <p className="text-sm leading-6 text-gray-600">
              Creating the vendor here only creates
              the company record.
            </p>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Branches, users, devices, terminals,
              contacts, addresses and tax settings
              will be managed through their respective
              APIs.
            </p>

          </Card>

        </div>

      </form>

    </div>
  );
}


/* =========================================================
   VENDOR DETAIL
   ========================================================= */

export function VendorDetailView({
  id,
  tab,
}: {
  id: number;
  tab?: string;
}) {

  const [company, setCompany] =
    useState<Company | null>(null);

  const [countries, setCountries] =
    useState<Country[]>([]);

  const [currencies, setCurrencies] =
    useState<Currency[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);
  const [resources, setResources] = useState({ settings:0, contacts:0, addresses:0, history:0, users:0, rules:0, branches:0, warehouses:0, devices:0, terminals:0, taxSettings:0 });


  useEffect(() => {

    async function loadCompany() {

      try {

        setLoading(true);
        setError(null);

        const [
          companyData,
          countryData,
          currencyData,
        ] = await Promise.all([
          getCompany(id),
          getCountries(),
          getCurrencies(),
        ]);

        setCompany(companyData);
        setCountries(countryData);
        setCurrencies(currencyData);

        // Load every company-scoped API resource once for the selected tenant.
        // The UI remains the same; these counts prove the detail page is backed by Laravel data.
        const [settings, contacts, addresses, history, users, rules, branches, warehouses, devices, terminals, taxSettings] = await Promise.all([
          getCompanySettings(), getCompanyContacts(), getCompanyAddresses(), getCompanyStatusHistory(), getCompanyUsers(), getUsernameRules(),
          getCompanyBranches(), getCompanyWarehouses(), getCompanyDevices(), getCompanyTerminals(), getCompanyTaxSettings(),
        ]);
        setResources({
          settings:settings.filter(x=>x.company_id===id).length, contacts:contacts.filter(x=>x.company_id===id).length, addresses:addresses.filter(x=>x.company_id===id).length,
          history:history.filter(x=>x.company_id===id).length, users:users.filter(x=>x.company_id===id).length, rules:rules.filter(x=>x.company_id===id).length,
          branches:branches.filter(x=>x.company_id===id).length, warehouses:warehouses.filter(x=>x.company_id===id).length, devices:devices.filter(x=>x.company_id===id).length,
          terminals:terminals.filter(x=>x.company_id===id).length, taxSettings:taxSettings.filter(x=>x.company_id===id).length,
        });

      } catch (err) {

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load vendor.",
        );

      } finally {

        setLoading(false);

      }

    }

    loadCompany();

  }, [id]);


  if (loading) {

    return (
      <div className="p-6 text-sm text-gray-500">
        Loading vendor...
      </div>
    );

  }


  if (error || !company) {

    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">

        <h2 className="font-semibold text-red-700">
          Vendor not found
        </h2>

        <p className="mt-1 text-sm text-red-600">
          {error ||
            "This vendor does not exist."}
        </p>

      </div>
    );

  }


  const country =
    countries.find(
      (item) =>
        item.id === company.country_id,
    );

  const currency =
    currencies.find(
      (item) =>
        item.id === company.currency_id,
    );


  return (

    <div className="space-y-5">

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">

            <Link
              href="/super-admin/vendors"
              className="hover:text-gray-700"
            >
              Vendors
            </Link>

            <span>/</span>

            <span>
              {company.company_name}
            </span>

          </div>

          <h1 className="text-2xl font-bold text-[#212B36]">
            {company.company_name}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {company.company_code}

            {company.legal_name
              ? ` · ${company.legal_name}`
              : ""}
          </p>

        </div>


        <Link
          href="/super-admin/vendors"
          className={btnSoft}
        >
          ← Back to vendors
        </Link>

      </div>


      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {[
          {
            label: "Status",
            value: company.status,
          },
          {
            label: "Company code",
            value: company.company_code,
          },
          {
            label: "Timezone",
            value: company.timezone,
          },
          {
            label: "Created",
            value: formatDate(
              company.created_at,
            ),
          },
        ].map((item) => (

          <div
            key={item.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >

            <p className="text-xs font-bold uppercase text-gray-400">
              {item.label}
            </p>

            {item.label === "Status" ? (

              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                  company.status,
                )}`}
              >
                {item.value}
              </span>

            ) : (

              <p className="mt-2 text-sm font-semibold text-gray-700">
                {item.value}
              </p>

            )}

          </div>

        ))}

      </div>


      <Card
        title="Company profile"
        subtitle="Data returned directly from Laravel"
      >

        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">

          <Detail
            label="Company name"
            value={company.company_name}
          />

          <Detail
            label="Legal name"
            value={company.legal_name}
          />

          <Detail
            label="Company code"
            value={company.company_code}
          />

          <Detail
            label="Tax number"
            value={company.tax_number}
          />

          <Detail
            label="Country"
            value={
              country
                ? `${country.country_name} (${country.country_code})`
                : company.country_id
            }
          />

          <Detail
            label="Currency"
            value={
              currency
                ? `${currency.currency_name} (${currency.currency_code})`
                : company.currency_id
            }
          />

          <Detail
            label="Timezone"
            value={company.timezone}
          />

          <Detail
            label="Database identifier"
            value={company.database_identifier}
            mono
          />

          <Detail
            label="UUID"
            value={company.uuid}
            mono
          />

          <Detail
            label="Created"
            value={formatDate(
              company.created_at,
            )}
          />

          <Detail
            label="Updated"
            value={formatDate(
              company.updated_at,
            )}
          />

          <Detail
            label="Deleted"
            value={formatDate(
              company.deleted_at,
            )}
          />

        </div>

      </Card>


      <Card title="Connected company resources" subtitle="Live counts from the Laravel company APIs">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(resources).map(([key,value]) => <div key={key} className="rounded-lg border border-gray-200 p-3"><p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{key.replace(/([A-Z])/g," $1")}</p><p className="mt-1 text-lg font-bold text-[#212B36]">{value}</p></div>)}
        </div>
      </Card>

      <Card
        title="API information"
        subtitle="Useful while developing the frontend"
      >

        <div className="rounded-xl bg-gray-950 p-4">

          <pre className="overflow-x-auto text-xs leading-6 text-gray-200">
            {JSON.stringify(
              company,
              null,
              2,
            )}
          </pre>

        </div>

      </Card>

    </div>
  );
}


/* =========================================================
   HELPERS
   ========================================================= */

function Detail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value:
    | string
    | number
    | null
    | undefined;
  mono?: boolean;
}) {

  return (
    <div>

      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p
        className={`mt-1 break-words text-sm font-medium text-gray-700 ${
          mono
            ? "font-mono text-xs"
            : ""
        }`}
      >
        {value === null ||
        value === undefined ||
        value === ""
          ? "—"
          : String(value)}
      </p>

    </div>
  );
}


function formatDate(
  date: string | null | undefined,
) {

  if (!date) {
    return "—";
  }

  return new Date(
    date,
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}


function statusClass(
  status: string,
) {

  switch (
    status.toUpperCase()
  ) {

    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700";

    case "PENDING":
      return "bg-amber-50 text-amber-700";

    case "SUSPENDED":
      return "bg-red-50 text-red-700";

    case "INACTIVE":
      return "bg-gray-100 text-gray-600";

    default:
      return "bg-blue-50 text-blue-700";

  }
}


/* =========================================================
   KEEP THESE EXPORTS AT MODULE LEVEL
   =========================================================
   
   IMPORTANT:
   Do NOT put these inside VendorsView(),
   AddVendorView(), or VendorDetailView().
   
   Your page.tsx imports these directly.
*/


export function FeatureOverridesView() {

  const [extra, setExtra] =
    useState<typeof featureOverrides>([]);

  const rows = [
    ...extra,
    ...featureOverrides,
  ];


  return (

    <div>

      <ViewHeader
        title="Feature overrides"
        subtitle="Switch a feature on or off for one vendor without changing their plan"
        crumbs={[
          { label: "Super Admin" },
          { label: "Company control" },
          { label: "Overrides" },
        ]}
      />


      <Grid>

        <TableCard
          title="Active overrides"
          columns={[
            {
              key: "company",
              label: "Vendor",
              render: (row) =>
                companyById(
                  row.companyId,
                )?.name ?? "—",
            },

            {
              key: "name",
              label: "Feature",
            },

            {
              key: "planHas",
              label: "In plan",
              render: (row) =>
                row.planHas ? (
                  <Badge tone="green">
                    Yes
                  </Badge>
                ) : (
                  <Badge tone="orange">
                    No
                  </Badge>
                ),
            },

            {
              key: "enabled",
              label: "Override",
              render: (row) => (
                <StatusBadge
                  value={
                    row.enabled
                      ? "ENABLED"
                      : "DISABLED"
                  }
                />
              ),
            },

            {
              key: "reason",
              label: "Reason",
            },

            {
              key: "window",
              label: "Window",
              render: (row) =>
                `${dateShort(
                  row.from,
                )} → ${dateShort(
                  row.to,
                )}`,
            },
          ]}
          rows={rows}
        />


        <FormPanel
          title="Add override"
          submitLabel="Apply override"
          onSubmit={(values) => {

            const featureCode =
              String(values.feature);

            const feature =
              platformFeatures.find(
                (f) =>
                  f.code === featureCode,
              );

            if (!feature) {
              return;
            }

            setExtra((prev) => [
              ...prev,

              {
                id:
                  100 +
                  prev.length,

                companyId:
                  Number(
                    values.companyId,
                  ),

                feature:
                  featureCode,

                name:
                  feature.name,

                planHas: false,

                enabled: true,

                reason:
                  String(
                    values.reason ?? "",
                  ),

                from: new Date(),

                to: new Date(
                  Date.now() +
                    60 *
                      86400000,
                ),
              },
            ]);

          }}
        >

          <Field label="Vendor">

            <SelectInput
              name="companyId"
              options={mockCompanies.map(
                (c) => ({
                  value: c.id,
                  label: c.name,
                }),
              )}
              placeholder="Select vendor"
            />

          </Field>


          <Field label="Feature">

            <SelectInput
              name="feature"
              options={platformFeatures.map(
                (f) => ({
                  value: f.code,
                  label: `${f.name} (${f.code})`,
                }),
              )}
              placeholder="Select feature"
            />

          </Field>


          <Field label="Reason">

            <Textarea
              name="reason"
              placeholder="Pilot partner — extended access"
            />

          </Field>

        </FormPanel>

      </Grid>

    </div>
  );
}


/* =========================================================
   RETENTION
   ========================================================= */

export function RetentionView() {

  return (

    <div>

      <ViewHeader
        title="Data retention & deletion"
        subtitle="How long each vendor's data and backups are kept"
        crumbs={[
          { label: "Super Admin" },
          { label: "Company control" },
          { label: "Retention" },
        ]}
      />


      <Grid>

        <Card
          title="Retention policies"
          icon="clock"
        >

          <TableCard
            title=""
            rowHref={(row) =>
              `/super-admin/vendors/${row.companyId}`
            }
            columns={[

              {
                key: "company",
                label: "Vendor",
                render: (row) =>
                  companyById(
                    row.companyId,
                  )?.name ?? "—",
              },

              {
                key: "retentionDays",
                label: "Data",
                align: "right",
                render: (row) =>
                  `${row.retentionDays}d`,
              },

              {
                key: "backupDays",
                label: "Backups",
                align: "right",
                render: (row) =>
                  `${row.backupDays}d`,
              },

              {
                key: "auditDays",
                label: "Audit",
                align: "right",
                render: (row) =>
                  `${row.auditDays}d`,
              },

              {
                key: "autoDelete",
                label: "Auto delete",
                render: (row) => (
                  <StatusBadge
                    value={
                      row.autoDelete
                        ? "ACTIVE"
                        : "INACTIVE"
                    }
                  />
                ),
              },

            ]}
            rows={mockCompanies.map(
              (c) => ({
                ...c.retention,
                companyId: c.id,
              }),
            )}
          />

        </Card>


        <Card
          title="Deletion requests"
          icon="alert"
        >

          <TableCard
            title=""
            columns={[

              {
                key: "company",
                label: "Vendor",
                render: (row) =>
                  companyById(
                    row.companyId,
                  )?.name ?? "—",
              },

              {
                key: "reason",
                label: "Reason",
              },

              {
                key: "status",
                label: "Status",
                render: (row) => (
                  <StatusBadge
                    value={row.status}
                  />
                ),
              },

              {
                key: "scheduled",
                label: "Scheduled",
                render: (row) =>
                  row.scheduled
                    ? dateShort(
                        row.scheduled,
                      )
                    : "—",
              },

              {
                key: "approvedBy",
                label: "Approved by",
                render: (row) =>
                  row.approvedBy ??
                  "—",
              },

            ]}
            rows={deletionRequests}
          />

        </Card>

      </Grid>


      <div className="mt-4">

        <Card
          title="Deletion workflow"
          icon="shield"
        >

          <div className="grid gap-3 sm:grid-cols-5">

            {[
              "Request raised",
              "Export offered",
              "Super admin approval",
              "Grace window",
              "Hard delete + backup purge",
            ].map(
              (step, index) => (

                <div
                  key={step}
                  className="rounded-lg bg-[#F9FAFB] p-3 text-center"
                >

                  <p className="text-[11px] font-bold text-[#FE9F43]">
                    STEP {index + 1}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-[#212B36]">
                    {step}
                  </p>

                </div>

              ),
            )}

          </div>

        </Card>

      </div>

    </div>
  );
}


/* =========================================================
   BACKUPS
   ========================================================= */

export function BackupsView() {

  const all =
    mockCompanies.flatMap(
      (company) =>
        company.backups.map(
          (backup) => ({
            ...backup,
            companyId:
              company.id,
          }),
        ),
    );


  return (

    <div>

      <ViewHeader
        title="Backups"
        subtitle="Per tenant database backups with checksums"
        crumbs={[
          { label: "Super Admin" },
          { label: "Company control" },
          { label: "Backups" },
        ]}
      />


      <div className="mb-4 grid gap-4 sm:grid-cols-3">

        <StatCard
          label="Backup runs"
          value={num(all.length)}
          icon="server"
          tone="blue"
        />

        <StatCard
          label="Completed"
          value={num(
            all.filter(
              (b) =>
                b.status ===
                "COMPLETED",
            ).length,
          )}
          icon="check"
          tone="green"
        />

        <StatCard
          label="Running now"
          value={num(
            all.filter(
              (b) =>
                b.status ===
                "RUNNING",
            ).length,
          )}
          icon="activity"
          tone="orange"
        />

      </div>


      <TableCard
        title="Backup records"
        columns={[

          {
            key: "company",
            label: "Vendor",
            render: (row) =>
              companyById(
                row.companyId,
              )?.name ?? "—",
          },

          {
            key: "type",
            label: "Type",
            render: (row) => (
              <Badge tone="blue">
                {row.type}
              </Badge>
            ),
          },

          {
            key: "started",
            label: "Started",
            render: (row) =>
              dateTime(
                row.started,
              ),
          },

          {
            key: "size",
            label: "Size",
            align: "right",
          },

          {
            key: "status",
            label: "State",
            render: (row) => (
              <StatusBadge
                value={row.status}
              />
            ),
          },

          {
            key: "location",
            label: "Location",
            render: (row) => (
              <span className="font-mono text-[10px] text-[#7A8086]">
                {row.location}
              </span>
            ),
          },

          {
            key: "actions",
            label: "",
            align: "right",
            render: () => (
              <button
                type="button"
                className="text-xs font-bold text-[#0984E3]"
              >
                Restore test
              </button>
            ),
          },

        ]}
        rows={all}
      />

    </div>
  );
}
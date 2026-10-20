"use client";

import { notFound } from "next/navigation";
import { useParams, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui";
import * as core from "@/views/sa/core";
import * as vendors from "@/views/sa/vendors";
import * as billing from "@/views/sa/billing";
import * as security from "@/views/sa/security";

export default function SuperAdminCatchAll() {
  const params = useParams();
  const search = useSearchParams();

  const slug = (params.slug as string[] | undefined) ?? [];
  const key = slug.join("/");
  const q = search.get("q") ?? "";
  const status = search.get("status") ?? "ALL";
  const tab = search.get("tab") ?? "overview";

  if (!key) notFound();

  const detailParent = slug.length >= 2 ? slug.slice(0, -1).join("/") : null;
  const idPart = slug.length >= 2 ? Number(slug[slug.length - 1]) : null;

  if (detailParent && idPart && Number.isFinite(idPart)) {
    if (detailParent === "vendors" && key !== "vendors/new") {
      return <vendors.VendorDetailView id={idPart} tab={tab} />;
    }
    if (detailParent === "invoices") return <billing.InvoiceDetailView id={idPart} />;
    if (detailParent === "tickets") return <security.TicketDetailView id={idPart} />;
    notFound();
  }

  switch (key) {
    /* main */
    case "reports":
      return <core.ReportsView />;
    /* vendors */
    case "vendors":
      return <vendors.VendorsView query={q} status={status} />;
    case "vendors/new":
      return <vendors.AddVendorView />;
    case "overrides":
      return <vendors.FeatureOverridesView />;
    case "retention":
      return <vendors.RetentionView />;
    case "backups":
      return <vendors.BackupsView />;
    /* subscriptions */
    case "subscriptions":
      return <billing.SubscriptionsView status={status} />;
    case "plans":
      return <billing.PlansView />;
    case "addons":
      return <billing.AddonsView />;
    case "usage":
      return <billing.UsageView />;
    /* billing */
    case "invoices":
      return <billing.InvoicesView status={status} />;
    case "payments":
      return <billing.PaymentsView />;
    case "gateways":
      return <billing.GatewaysView tab={tab} />;
    /* platform */
    case "settings":
      return <core.PlatformSettingsView />;
    case "configs":
      return <core.PlatformConfigsView />;
    case "modules":
      return <core.PlatformModulesView />;
    case "countries":
      return <core.CountriesView />;
    case "files":
      return <core.FilesView />;
    /* team & security */
    case "admins":
      return <security.AdminsView />;
    case "roles":
      return <security.RolesView />;
    case "audit":
      return <security.SecurityView tab={tab} />;
    /* support */
    case "tickets":
      return <security.TicketsView status={status} />;
    case "notifications":
      return <security.NotificationsView tab={tab} />;
    /* developer */
    case "api":
      return <billing.ApiView tab={tab} />;
    case "database":
      return <core.DatabaseMapView />;
    case 'ecr':
      return <billing.EcrView />;
    default:
      notFound();
  }
}


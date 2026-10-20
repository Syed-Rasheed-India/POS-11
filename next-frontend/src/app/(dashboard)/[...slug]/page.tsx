"use client";

import { notFound } from "next/navigation";
import { useParams, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui";
import * as catalog from "@/views/vendor/catalog";
import * as sales from "@/views/vendor/sales";
import * as ops from "@/views/vendor/ops";
import * as admin from "@/views/vendor/admin";
import * as erp from "@/views/erp";

export default function VendorCatchAll() {
  const params = useParams();
  const search = useSearchParams();

  const slug = (params.slug as string[] | undefined) ?? [];
  const key = slug.join("/");
  const q = search.get("q") ?? "";
  const tab = search.get("tab") ?? "overview";

  if (!key) notFound();

  const detailParent = slug.length >= 2 ? slug.slice(0, -1).join("/") : null;
  const idPart = slug.length >= 2 ? Number(slug[slug.length - 1]) : null;

  if (detailParent && idPart && Number.isFinite(idPart)) {
    switch (detailParent) {
      case "products":
        return <catalog.ProductDetailView id={idPart} tab={tab} />;
      case "sales":
        return <sales.SaleDetailView id={idPart} />;
      case "customers":
        return <admin.CustomerDetailView id={idPart} tab={tab} />;
      case "suppliers":
        return <ops.SupplierDetailView id={idPart} tab={tab} />;
      case "purchase-orders":
        return <ops.PurchaseOrderDetailView id={idPart} />;
      default:
        notFound();
    }
  }

  switch (key) {
    /* Sales */
    case "pos":
      return <sales.PosView />;
    case "sales":
      return <sales.SalesView />;
    case "sales-returns":
      return <sales.ReturnsView />;
    case "held-sales":
      return <sales.HeldSalesView />;
    case "shifts":
      return <sales.ShiftsView />;
    /* Catalogue */
    case "products":
      return <catalog.ProductsView />;
    case "products/new":
      return <catalog.ProductFormView />;
    case "categories":
      return <catalog.CategoriesView />;
    case "brands":
      return <catalog.BrandsView />;
    case "uoms":
      return <catalog.UomsView />;
    case "barcodes":
      return <catalog.BarcodesView />;
    case "price-lists":
      return <catalog.PriceListsView />;
    case "promotions":
      return <catalog.PromotionsView />;
    /* Inventory */
    case "stock":
      return <ops.StockView />;
    case "stock-ledger":
      return <ops.LedgerView />;
    case "adjustments":
      return <ops.AdjustmentsView />;
    case "adjustments/new":
      return <ops.AdjustmentFormView />;
    case "transfers":
      return <ops.TransfersView />;
    case "transfers/new":
      return <ops.TransferFormView />;
    case "stock-valuation":
      return <ops.ValuationView />;
    /* Purchasing */
    case "suppliers":
      return <ops.SuppliersView />;
    case "suppliers/new":
      return <admin.SupplierFormView />;
    case "purchase-orders":
      return <ops.PurchaseOrdersView />;
    case "purchase-orders/new":
      return <ops.PurchaseOrderFormView />;
    case "goods-receipts":
      return <ops.GoodsReceiptsView />;
    case "purchase-invoices":
      return <ops.PurchaseInvoicesView />;
    /* People */
    case "customers":
      return <admin.CustomersView />;
    case "customers/new":
      return <admin.CustomerFormView />;
    case "customer-groups":
      return <admin.CustomerGroupsView />;
    /* Organisation */
    case "users":
      return <admin.UsersView />;
    case "roles":
      return <admin.RolesView />;
    case "branches":
      return <admin.BranchesView />;
    case "warehouses":
      return <admin.WarehousesView />;
    case "terminals":
      return <admin.TerminalsView />;
    /* ERP core */
    case "modules":
      return <erp.ModulesView />;
    case "locations":
      return <erp.LocationsView />;
    case "number-series":
      return <erp.NumberSeriesView />;
    case "approvals":
      return <erp.ApprovalsView />;
    case "data-map":
      return <erp.ErpDataMapView />;
    case "accounting":
      return <erp.AccountingView tab={tab} />;
    /* Extensions */
    case "restaurant":
      return <erp.RestaurantView tab={tab} />;
    case "recipes":
      return <erp.RecipesView />;
    case "loyalty":
      return <erp.LoyaltyView />;
    case "events":
      return <erp.EventsView />;
    case "integrations":
      return <erp.IntegrationsView />;
    /* Settings */
    case "settings":
      return <admin.SettingsView />;
    case "subscription":
      return <admin.SubscriptionView />;
    case "devices":
      return <admin.DevicesView />;
    case "support":
      return <admin.SupportView />;
    case "notifications":
      return <admin.NotificationsView />;
    /* Reports */
    case "reports/sales":
      return <admin.SalesReportView />;
    case "reports/profit":
      return <admin.ProfitReportView />;
    case "reports/products":
      return <admin.ProductReportView />;
    case "reports/z-report":
      return <admin.ZReportView />;
    default:
      notFound();
  }
}

import { Suspense } from "react";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { OrdersWorkspace } from "@/src/components/portal/orders-workspace";
import { PortalDataBoundary } from "@/src/components/portal/portal-data-boundary";
import { loadPortalModule } from "@/src/features/portal/module-loader";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";

type OrdersPageProps = { searchParams: Promise<{ orderId?: string | string[]; view?: string | string[] }> };

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await requirePortalPermission("VIEW_ORDERS");
  const params = await searchParams;
  const initialOrderId = typeof params.orderId === "string" ? params.orderId : undefined;
  const initialView = params.view === "in-motion" ? "in-motion" : "all";

  return <PortalDataBoundary title="Orders & shipments could not be loaded" description="Order records are temporarily unavailable for this unit." className="min-h-48"><Suspense fallback={<OrdersWorkspaceFallback />}><OrdersWorkspaceModule locationId={session.locationId} locationName={session.locationName} initialOrderId={initialOrderId} initialView={initialView} /></Suspense></PortalDataBoundary>;
}

const OrdersWorkspaceModule = async ({ locationId, locationName, initialOrderId, initialView }: { locationId: string; locationName: string; initialOrderId?: string; initialView: "all" | "in-motion" }) => {
  const orders = await loadPortalModule("orders workspace", () => defaultPortalStorage.getOrdersByLocation(locationId));
  return <OrdersWorkspace key={`${locationId}:${initialView}:${initialOrderId ?? ""}`} orders={orders} locationId={locationId} locationName={locationName} initialOrderId={initialOrderId} initialView={initialView} />;
};

const OrdersWorkspaceFallback = () => <section aria-busy="true" className="min-h-48 rounded-2xl border border-bds-teal-dark/15 bg-white p-5 shadow-sm"><h1 className="portal-page-title">Orders &amp; Shipments</h1><p className="mt-2 text-sm text-bds-cocoa/80">Loading order records…</p><div className="mt-4 space-y-3">{[0, 1].map((index) => <div key={index} className="h-16 rounded-xl bg-bds-cream/60" />)}</div><span className="sr-only" role="status">Loading orders and shipments</span></section>;

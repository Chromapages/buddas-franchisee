import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { OrdersWorkspace } from "@/src/components/portal/orders-workspace";
import { MobileOrdersWorkspace } from "@/src/components/portal/mobile-orders-workspace";
import { PortalDataBoundary } from "@/src/components/portal/portal-data-boundary";
import { loadPortalModule } from "@/src/features/portal/module-loader";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";
import { ordersListHref, parseOrdersListQuery } from "@/src/features/portal/orders-query";
import "./orders-desktop.css";

export const metadata: Metadata = { title: "Orders & Shipments" };

type OrdersPageProps = { searchParams: Promise<{ orderId?: string | string[]; view?: string | string[] }> };

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await requirePortalPermission("VIEW_ORDERS");
  const params = await searchParams;
  const initialOrderId = typeof params.orderId === "string" ? params.orderId : undefined;
  const initialQuery = parseOrdersListQuery(params);
  if (initialOrderId) {
    const query = new URLSearchParams(ordersListHref(initialQuery).split("?")[1] || "");
    redirect(`/portal/orders/${encodeURIComponent(initialOrderId)}${query.size ? `?${query.toString()}` : ""}`);
  }

  return <PortalDataBoundary title="Orders & shipments could not be loaded" description="Order records are temporarily unavailable for this unit." className="min-h-48"><Suspense fallback={<OrdersWorkspaceFallback />}><OrdersWorkspaceModule locationId={session.locationId} locationName={session.locationName} initialQuery={initialQuery} /></Suspense></PortalDataBoundary>;
}

const OrdersWorkspaceModule = async ({ locationId, locationName, initialQuery }: { locationId: string; locationName: string; initialQuery: ReturnType<typeof parseOrdersListQuery> }) => {
  const orders = await loadPortalModule("orders workspace", () => defaultPortalStorage.getOrdersByLocation(locationId));
  return <>
    <div className="portal-orders-mobile"><MobileOrdersWorkspace orders={orders} locationId={locationId} locationName={locationName} initialQuery={initialQuery} /></div>
    <div className="portal-orders-desktop"><OrdersWorkspace key={`${locationId}:${initialQuery.view}`} orders={orders} locationId={locationId} locationName={locationName} initialView={initialQuery.view === "needs-attention" ? "all" : initialQuery.view} /></div>
  </>;
};

const OrdersWorkspaceFallback = () => <section aria-busy="true" className="min-h-48 rounded-2xl border border-bds-teal-dark/15 bg-white p-5 shadow-sm"><h1 className="portal-page-title">Orders &amp; Shipments</h1><p className="mt-2 text-sm text-bds-cocoa/80">Loading order records…</p><div className="mt-4 space-y-3">{[0, 1, 2].map((index) => <div key={index} className="h-24 rounded-xl bg-bds-cream/60" />)}</div><span className="sr-only" role="status">Loading orders and shipments</span></section>;

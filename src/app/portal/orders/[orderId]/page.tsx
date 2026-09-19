import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";
import { getOrderCapabilities } from "@/src/features/portal/authorization";
import { loadPortalModule } from "@/src/features/portal/module-loader";
import { MobileOrderDetail } from "@/src/components/portal/mobile-order-detail";
import { DesktopOrderDetail } from "@/src/components/portal/desktop-order-detail";
import { PortalDataBoundary } from "@/src/components/portal/portal-data-boundary";
import { ordersListHref, ordersListScrollKey, parseOrdersListQuery } from "@/src/features/portal/orders-query";
import { getAuthorizedOrderDocuments } from "@/src/features/portal/order-documents";
import "./order-detail-desktop.css";

export const metadata: Metadata = { title: "Order Detail" };

export default async function OrderDetailPage({ params, searchParams }: { params: Promise<{ orderId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requirePortalPermission("VIEW_ORDERS");
  const { orderId } = await params;
  const listQuery = parseOrdersListQuery(await searchParams);
  return <PortalDataBoundary title="Order detail could not be loaded" description="This order is temporarily unavailable for the active unit.">
    <Suspense fallback={<OrderDetailFallback />}><OrderDetailModule session={session} orderId={orderId} backHref={ordersListHref(listQuery)} scrollKey={ordersListScrollKey(session.locationId, listQuery)} /></Suspense>
  </PortalDataBoundary>;
}

const OrderDetailModule = async ({ session, orderId, backHref, scrollKey }: { session: Awaited<ReturnType<typeof requirePortalPermission>>; orderId: string; backHref: string; scrollKey: string }) => {
  const orders = await loadPortalModule("order detail", () => defaultPortalStorage.getOrdersByLocation(session.locationId));
  const order = orders.find((candidate) => candidate.id === orderId);
  if (!order) return <section className="portal-empty-state"><h1>Order unavailable</h1><p>This order is not available for the active unit.</p><Link href={backHref} className="btn-primary">Back to orders</Link></section>;
  const capabilities = getOrderCapabilities(session);
  const documentResult = capabilities.canViewDocuments ? await Promise.allSettled([getAuthorizedOrderDocuments(session, order)]) : [];
  const documents = (documentResult[0]?.status === "fulfilled" ? documentResult[0].value : []).map((document) => ({
    ...document,
    href: `/portal/orders/${encodeURIComponent(order.id)}/documents/${encodeURIComponent(document.id)}`,
  }));
  const detailProps = { order, locationId: session.locationId, locationName: session.locationName, canRequestCancellation: capabilities.canRequestCancellation, canViewShipmentTracking: capabilities.canViewShipmentTracking, backHref, scrollKey, documents, documentsUnavailable: documentResult[0]?.status === "rejected" };
  return <><DesktopOrderDetail {...detailProps} /><MobileOrderDetail {...detailProps} /></>;
};

const OrderDetailFallback = () => <section aria-busy="true" className="portal-empty-state"><h1>Order detail</h1><p>Loading the order for the active unit…</p><span className="sr-only" role="status">Loading order detail</span></section>;

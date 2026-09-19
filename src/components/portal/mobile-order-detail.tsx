"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import type { PortalOrder } from "@/src/features/portal/types";
import { canTransitionOrderStatus } from "@/src/features/portal/order-status";
import { getOrderStatusPresentation } from "@/src/features/portal/order-status-presentation";
import { OrderStatusIcon } from "@/src/components/portal/order-status-icon";
import { formatPortalDate } from "@/src/features/portal/date-time";
import { OrderCancellationRequest } from "@/src/components/portal/order-cancellation-request";
import { ShipmentDetails, type ShipmentRecord } from "@/src/components/portal/shipment-details";
import { OrderSummaryFacts } from "@/src/components/portal/order-summary-facts";
import { OrderLineItem } from "@/src/components/portal/order-line-item";
import { OrderDocuments, type OrderDocumentLink } from "@/src/components/portal/order-documents";
import { OrderCancellationStatus } from "@/src/components/portal/order-cancellation-status";

type MobileOrderDetailProps = {
  order: PortalOrder;
  locationId: string;
  locationName: string;
  canRequestCancellation: boolean;
 backHref: string;
 scrollKey: string;
  shipments?: ShipmentRecord[];
  documents?: OrderDocumentLink[];
  documentsUnavailable?: boolean;
  canViewShipmentTracking: boolean;
};

export const MobileOrderDetail = ({ order, locationId, locationName, canRequestCancellation, backHref, scrollKey, shipments, documents = [], documentsUnavailable = false, canViewShipmentTracking }: MobileOrderDetailProps) => {
  const router = useRouter();
  const presentation = getOrderStatusPresentation(order.status, order.eta);
  const canCancel = canRequestCancellation && canTransitionOrderStatus(order.status, "CANCELLATION_REQUESTED");
  return <div className="portal-page-stack mobile-order-detail">
    <header className="mobile-order-detail__header">
      <Link href={backHref} scroll={false} onClick={(event) => { event.preventDefault(); router.push(backHref, { scroll: false }); }} className="mobile-order-detail__back" data-orders-scroll-key={scrollKey}><ArrowLeft aria-hidden="true" />All orders</Link>
      <h1>Order {order.id}</h1>
      <span className="mobile-order-detail__header-status" aria-label={presentation.primary.accessibleLabel}><OrderStatusIcon icon={presentation.primary.icon} />{presentation.primary.label}</span>
      <p className="mobile-order-detail__metadata"><span>Placed {formatPortalDate(order.createdAt, locationId)}</span><span>Invoice {order.invoiceId}</span></p>
    </header>

    {presentation.exception ? <section className={`mobile-order-detail__exception${presentation.exception.actionRequired ? " is-action-required" : ""}`} role={presentation.exception.actionRequired ? "alert" : "status"}><AlertCircle aria-hidden="true" /><div><h2>{presentation.exception.title}</h2><p>{presentation.exception.explanatoryCopy}</p></div></section> : null}

    <OrderCancellationStatus order={order} />

    <section className="mobile-order-detail__summary" aria-label="Order summary">
      <h2>Order summary</h2>
      <OrderSummaryFacts order={order} />
    </section>

    <ShipmentDetails shipments={shipments} locationId={locationId} canViewTracking={canViewShipmentTracking} />

    <section className="mobile-order-detail__lines" aria-labelledby="order-lines-title"><h2 id="order-lines-title">Line items</h2><ul>{order.items.map((item, index) => <OrderLineItem key={item.sku + "-" + index} item={item} />)}</ul></section>

    <OrderDocuments documents={documents} locationId={locationId} unavailable={documentsUnavailable} />

    {canCancel ? <section className="mobile-order-detail__cancellation" aria-labelledby="order-cancellation-title"><div><h2 id="order-cancellation-title">Need to change this order?</h2><p>Request review of a full-order cancellation before fulfillment is confirmed.</p></div><OrderCancellationRequest order={order} locationId={locationId} locationName={locationName} compact /></section> : null}
  </div>;
};

"use client";

import Link from "next/link";
import { AlertCircle, CircleHelp, FileText, PackageCheck, Truck } from "lucide-react";
import type { PortalOrder } from "@/src/features/portal/types";
import { canTransitionOrderStatus } from "@/src/features/portal/order-status";
import { getOrderStatusPresentation } from "@/src/features/portal/order-status-presentation";
import { OrderStatusIcon } from "@/src/components/portal/order-status-icon";
import { formatPortalDateTime } from "@/src/features/portal/date-time";
import { OrderCancellationRequest } from "@/src/components/portal/order-cancellation-request";
import { ShipmentDetails, type ShipmentRecord } from "@/src/components/portal/shipment-details";
import { OrderSummaryFacts } from "@/src/components/portal/order-summary-facts";
import { OrderDocuments, type OrderDocumentLink } from "@/src/components/portal/order-documents";
import { OrderCancellationStatus } from "@/src/components/portal/order-cancellation-status";

type DesktopOrderDetailProps = {
  order: PortalOrder;
  locationId: string;
  locationName: string;
  canRequestCancellation: boolean;
  canViewShipmentTracking: boolean;
  shipments?: ShipmentRecord[];
  documents?: OrderDocumentLink[];
  documentsUnavailable?: boolean;
};

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export const DesktopOrderDetail = ({ order, locationId, locationName, canRequestCancellation, canViewShipmentTracking, shipments, documents = [], documentsUnavailable = false }: DesktopOrderDetailProps) => {
  const presentation = getOrderStatusPresentation(order.status, order.eta);
  const canCancel = canRequestCancellation && canTransitionOrderStatus(order.status, "CANCELLATION_REQUESTED");

  return <div className="portal-page-stack desktop-order-detail">
    <header className="desktop-order-detail__header">
      <div className="desktop-order-detail__title-row">
        <div>
          <div className="desktop-order-detail__title"><h1>Order {order.id}</h1><span className="desktop-order-detail__status" aria-label={presentation.primary.accessibleLabel}><OrderStatusIcon icon={presentation.primary.icon} />{presentation.primary.label}</span></div>
          <span>Placed {formatPortalDateTime(order.createdAt, locationId)} · Invoice {order.invoiceId}</span>
          <small>{locationName} · {locationId}</small>
        </div>
      </div>
    </header>

    {presentation.exception ? <section className={`desktop-order-detail__exception${presentation.exception.actionRequired ? " is-action-required" : ""}`} role={presentation.exception.actionRequired ? "alert" : "status"}><AlertCircle aria-hidden="true" /><div><h2>{presentation.exception.title}</h2><p>{presentation.exception.explanatoryCopy}</p></div></section> : null}

    <OrderCancellationStatus order={order} />

    <div className="desktop-order-detail__layout">
      <main className="desktop-order-detail__main">
        <section className="desktop-order-detail__lines" aria-labelledby="desktop-order-lines-title">
          <h2 id="desktop-order-lines-title">Line items ({order.items.length})</h2>
          <div className="desktop-order-detail__line-table"><table><thead><tr><th scope="col">Item</th><th scope="col">SKU</th><th scope="col">Qty</th><th scope="col">Unit price</th><th scope="col">Total</th></tr></thead><tbody>{order.items.map((item, index) => <tr key={item.sku + "-" + index}><td><strong>{item.name}</strong><small>Quantity {item.quantity}</small></td><td>{item.sku}</td><td>{item.quantity}</td><td>{money(item.price)}</td><td>{money(item.quantity * item.price)}</td></tr>)}</tbody></table></div>
        </section>
        <ShipmentDetails shipments={shipments} locationId={locationId} canViewTracking={canViewShipmentTracking} />
        <OrderDocuments documents={documents} locationId={locationId} unavailable={documentsUnavailable} />
        {canCancel ? <section className="desktop-order-detail__cancellation" aria-labelledby="desktop-order-cancellation-title"><AlertCircle aria-hidden="true" /><div><h2 id="desktop-order-cancellation-title">Need to change this order?</h2><p>Request review of a full-order cancellation before fulfillment is confirmed.</p><small>Cancellation requests are reviewed by the fulfillment owner. This does not guarantee cancellation.</small></div><OrderCancellationRequest order={order} locationId={locationId} locationName={locationName} compact /></section> : null}
      </main>

      <aside className="desktop-order-detail__aside" aria-label="Order information">
        <section className="desktop-order-detail__status-panel" aria-labelledby="desktop-order-status-title"><h2 id="desktop-order-status-title">Current status</h2><div><PackageCheck aria-hidden="true" /><p><strong>{presentation.primary.label}</strong><span>{presentation.primary.explanatoryCopy}</span></p></div><div><Truck aria-hidden="true" /><p><small>Expected fulfillment</small><strong>{presentation.detailSummary}</strong><span>{presentation.nextStep}</span></p></div></section>
        <section className="desktop-order-detail__summary" aria-labelledby="desktop-order-summary-title"><h2 id="desktop-order-summary-title">Order summary</h2><OrderSummaryFacts order={order} /><dl className="desktop-order-detail__additional-facts"><div><dt>Invoice</dt><dd>{order.invoiceId}</dd></div><div><dt>Unit</dt><dd>{locationName}<small>{locationId}</small></dd></div><div><dt>Placed</dt><dd>{formatPortalDateTime(order.createdAt, locationId)}</dd></div></dl></section>
        {(documents.length || documentsUnavailable || canCancel) ? <section className="desktop-order-detail__actions" aria-labelledby="desktop-order-actions-title"><h2 id="desktop-order-actions-title">More actions</h2>{documents.length ? <Link href={documents[0].href}><FileText aria-hidden="true" />View invoice</Link> : null}{documentsUnavailable ? <span><FileText aria-hidden="true" />Invoice temporarily unavailable</span> : null}<Link href="/portal/support"><CircleHelp aria-hidden="true" />Get help with this order</Link></section> : null}
      </aside>
    </div>
  </div>;
};

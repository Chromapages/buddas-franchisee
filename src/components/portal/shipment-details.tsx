import { ExternalLink } from "lucide-react";
import { formatPortalDateTime } from "@/src/features/portal/date-time";
import { normalizeBackendOperationalStatus } from "@/src/features/portal/order-status-presentation";
import { OrderStatusIcon } from "@/src/components/portal/order-status-icon";

export type ShipmentEvent = { occurredAt: string; description: string };
export type ShipmentContent = { sku: string; name: string; quantity: number };

export type ShipmentRecord = {
  id: string;
  sequence: number;
  totalShipments: number;
  stage: string;
  estimatedShipAt?: string;
  estimatedDeliveryAt?: string;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  events?: ShipmentEvent[];
  contents?: ShipmentContent[];
};

const validHttpsUrl = (value: string | undefined) => {
  if (!value) return null;
  try { return new URL(value).protocol === "https:" ? value : null; } catch { return null; }
};

export const ShipmentDetails = ({ shipments, locationId, canViewTracking }: { shipments?: ShipmentRecord[]; locationId: string; canViewTracking: boolean }) => {
  const validShipments = (shipments ?? []).flatMap((shipment) => {
    const status = normalizeBackendOperationalStatus("shipment", shipment.stage);
    if (!status || !shipment.id || !Number.isInteger(shipment.sequence) || shipment.sequence < 1 || !Number.isInteger(shipment.totalShipments) || shipment.totalShipments < shipment.sequence) return [];
    return [{ shipment, status }];
  });
  if (!validShipments.length) return null;

  return <section className="shipment-details" aria-labelledby="shipment-details-title">
    <h2 id="shipment-details-title">Shipments</h2>
    <div className="shipment-details__list">
      {validShipments.map(({ shipment, status }) => {
        const trackingUrl = canViewTracking ? validHttpsUrl(shipment.trackingUrl) : null;
        const validEvents = (shipment.events ?? []).filter((event) => event.description && Number.isFinite(Date.parse(event.occurredAt)));
        const validContents = (shipment.contents ?? []).filter((item) => item.sku && item.name && Number.isInteger(item.quantity) && item.quantity > 0);
        return <article key={shipment.id + "-" + shipment.sequence} className={"shipment-details__item shipment-details__item--" + status.semantic}>
          <header><div><span>Shipment {shipment.sequence} of {shipment.totalShipments}</span><strong><OrderStatusIcon icon={status.icon} />{status.label}</strong></div></header>
          <dl>
            {shipment.estimatedShipAt && Number.isFinite(Date.parse(shipment.estimatedShipAt)) ? <div><dt>Estimated ship</dt><dd>{formatPortalDateTime(shipment.estimatedShipAt, locationId)}</dd></div> : null}
            {shipment.estimatedDeliveryAt && Number.isFinite(Date.parse(shipment.estimatedDeliveryAt)) ? <div><dt>Estimated delivery</dt><dd>{formatPortalDateTime(shipment.estimatedDeliveryAt, locationId)}</dd></div> : null}
            {shipment.carrier ? <div><dt>Carrier</dt><dd>{shipment.carrier}</dd></div> : null}
            {canViewTracking && shipment.trackingNumber ? <div><dt>Tracking</dt><dd>{trackingUrl ? <a href={trackingUrl} target="_blank" rel="noreferrer">{shipment.trackingNumber}<ExternalLink aria-hidden="true" /></a> : shipment.trackingNumber}</dd></div> : null}
          </dl>
          {validEvents.length ? <details><summary>View shipment history</summary><ol>{validEvents.map((event, index) => <li key={event.occurredAt + "-" + index}><strong>{event.description}</strong><span>{formatPortalDateTime(event.occurredAt, locationId)}</span></li>)}</ol></details> : null}
          {validContents.length ? <div className="shipment-details__contents"><h3>Shipment contents</h3><ul>{validContents.map((item) => <li key={item.sku + "-" + item.quantity}><span>{item.quantity} × {item.name}</span><small>SKU {item.sku}</small></li>)}</ul></div> : null}
        </article>;
      })}
    </div>
  </section>;
};

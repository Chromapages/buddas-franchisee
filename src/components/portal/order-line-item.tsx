import Image from "next/image";
import type { PortalOrderItem } from "@/src/features/portal/types";
import { normalizeBackendOperationalStatus } from "@/src/features/portal/order-status-presentation";
import { OrderStatusIcon } from "@/src/components/portal/order-status-icon";

export type OrderLineItemData = PortalOrderItem & {
  variant?: string;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
  cancelledQuantity?: number;
  backorderedQuantity?: number;
  shipmentAssignment?: string;
  fulfillmentState?: string;
};

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const hasVerifiedThumbnail = (item: OrderLineItemData) => Boolean(item.thumbnailUrl?.startsWith("/images/catalog/") && item.thumbnailAlt?.trim());

export const OrderLineItem = ({ item }: { item: OrderLineItemData }) => {
  const fulfillment = item.fulfillmentState ? normalizeBackendOperationalStatus("fulfillment", item.fulfillmentState) : null;
  const cancelledQuantity = Number.isInteger(item.cancelledQuantity) && item.cancelledQuantity && item.cancelledQuantity > 0 ? item.cancelledQuantity : 0;
  const backorderedQuantity = Number.isInteger(item.backorderedQuantity) && item.backorderedQuantity && item.backorderedQuantity > 0 ? item.backorderedQuantity : 0;
  return <li className="order-line-item">
    {hasVerifiedThumbnail(item) ? <Image className="order-line-item__thumbnail" src={item.thumbnailUrl!} alt={item.thumbnailAlt!} width={44} height={44} sizes="44px" /> : null}
    <div className="order-line-item__copy">
      <strong>{item.name}</strong>
      <span>SKU {item.sku}{item.variant ? " · " + item.variant : ""}</span>
      <small>{item.quantity === 1 ? "Qty 1" : "Qty " + item.quantity + " · " + money(item.price) + " each"}</small>
      {(cancelledQuantity || backorderedQuantity || item.shipmentAssignment || fulfillment) ? <div className="order-line-item__facts">
        {cancelledQuantity ? <span>Cancelled: {cancelledQuantity}</span> : null}
        {backorderedQuantity ? <span>Backordered: {backorderedQuantity}</span> : null}
        {item.shipmentAssignment ? <span>Shipment: {item.shipmentAssignment}</span> : null}
        {fulfillment ? <span><OrderStatusIcon icon={fulfillment.icon} />{fulfillment.label}</span> : null}
      </div> : null}
    </div>
    <strong className="order-line-item__total">{money(item.quantity * item.price)}</strong>
  </li>;
};

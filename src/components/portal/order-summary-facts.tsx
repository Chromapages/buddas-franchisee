import type { PortalOrder } from "@/src/features/portal/types";
import { getOrderStatusPresentation } from "@/src/features/portal/order-status-presentation";

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export const OrderSummaryFacts = ({ order }: { order: PortalOrder }) => {
  const presentation = getOrderStatusPresentation(order.status, order.eta);
  return <dl className="order-summary-facts">
    <div><dt>Items</dt><dd>{order.items.length}</dd></div>
    <div><dt>Fulfillment window</dt><dd>{presentation.detailSummary}</dd></div>
    <div><dt>Total</dt><dd>{money(order.total)}</dd></div>
  </dl>;
};

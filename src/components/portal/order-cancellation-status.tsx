import { OrderStatusIcon } from "@/src/components/portal/order-status-icon";
import type { PortalOrder } from "@/src/features/portal/types";
import { getCancellationWorkflowPresentation } from "@/src/features/portal/order-status-presentation";

export const OrderCancellationStatus = ({ order }: { order: PortalOrder }) => {
  const presentation = getCancellationWorkflowPresentation(order.status, order.cancellationStatus);
  if (!presentation) return null;

  return <section className={`mobile-order-detail__cancellation-status is-${presentation.semantic}`} aria-labelledby="order-cancellation-status-title">
    <OrderStatusIcon icon={presentation.icon} />
    <div>
      <h2 id="order-cancellation-status-title">Cancellation request</h2>
      <strong>{presentation.label}</strong>
      <p>{presentation.description}</p>
    </div>
  </section>;
};

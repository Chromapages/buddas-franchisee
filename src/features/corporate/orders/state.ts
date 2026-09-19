import type {
  CorporateOrder,
  CorporateOrderAcceptanceState,
  CorporateOrderCancellationState,
  CorporateOrderFulfillmentState,
  CorporateOrderIntegrationState,
  CorporateOrderPaymentState,
} from "./types.ts";
import { summarizeFreshness } from "./freshness.ts";

type StateDefinition = {
  label: string;
  meaning: string;
  terminal: boolean;
  needsRecovery: boolean;
};

export const ORDER_ACCEPTANCE_STATES: Record<CorporateOrderAcceptanceState, StateDefinition> = {
  draft: {
    label: "Draft",
    meaning: "The order has not been submitted for acceptance.",
    terminal: false,
    needsRecovery: false,
  },
  received: {
    label: "Received",
    meaning: "The portal recorded an order request; downstream acceptance is not yet confirmed.",
    terminal: false,
    needsRecovery: false,
  },
  pending_review: {
    label: "Pending review",
    meaning: "The order is waiting on a human acceptance decision.",
    terminal: false,
    needsRecovery: false,
  },
  accepted: {
    label: "Accepted",
    meaning: "The order has been accepted into the downstream workflow.",
    terminal: true,
    needsRecovery: false,
  },
  rejected: {
    label: "Rejected",
    meaning: "The order will not proceed in its current form.",
    terminal: true,
    needsRecovery: true,
  },
  cancelled: {
    label: "Cancelled",
    meaning: "The order was withdrawn before completion.",
    terminal: true,
    needsRecovery: true,
  },
};

export const ORDER_FULFILLMENT_STATES: Record<CorporateOrderFulfillmentState, StateDefinition> = {
  unknown: {
    label: "Unknown",
    meaning: "No authoritative fulfillment state is available.",
    terminal: false,
    needsRecovery: true,
  },
  not_started: {
    label: "Not started",
    meaning: "No fulfillment work has been assigned yet.",
    terminal: false,
    needsRecovery: false,
  },
  queued: {
    label: "Queued",
    meaning: "The order is waiting in the fulfillment queue.",
    terminal: false,
    needsRecovery: false,
  },
  picking: {
    label: "Picking",
    meaning: "Items are being picked for shipment.",
    terminal: false,
    needsRecovery: false,
  },
  packed: {
    label: "Packed",
    meaning: "The order has been packed and is ready for shipment.",
    terminal: false,
    needsRecovery: false,
  },
  partial: {
    label: "Partially fulfilled",
    meaning: "Some quantities have shipped or been delivered while others remain open.",
    terminal: false,
    needsRecovery: false,
  },
  shipped: {
    label: "Shipped",
    meaning: "The order has left the fulfillment point.",
    terminal: false,
    needsRecovery: false,
  },
  delivered: {
    label: "Delivered",
    meaning: "The order reached the receiving location.",
    terminal: true,
    needsRecovery: false,
  },
  closed_short: {
    label: "Closed short",
    meaning: "Every remaining quantity has an explicit disposition and will not be fulfilled.",
    terminal: true,
    needsRecovery: false,
  },
  on_hold: {
    label: "On hold",
    meaning: "Fulfillment is paused and needs manual review.",
    terminal: false,
    needsRecovery: true,
  },
  failed: {
    label: "Failed",
    meaning: "Fulfillment could not complete and needs recovery.",
    terminal: true,
    needsRecovery: true,
  },
};

export const ORDER_PAYMENT_STATES: Record<CorporateOrderPaymentState, StateDefinition> = {
  unknown: {
    label: "Unknown",
    meaning: "No authoritative payment state is available.",
    terminal: false,
    needsRecovery: true,
  },
  not_required: {
    label: "Not required",
    meaning: "No payment capture is expected for this order.",
    terminal: true,
    needsRecovery: false,
  },
  pending: {
    label: "Pending",
    meaning: "Payment is awaiting confirmation.",
    terminal: false,
    needsRecovery: false,
  },
  authorized: {
    label: "Authorized",
    meaning: "Payment has been authorized but not yet captured.",
    terminal: false,
    needsRecovery: false,
  },
  captured: {
    label: "Captured",
    meaning: "Payment has been captured and is awaiting settlement or reconciliation.",
    terminal: false,
    needsRecovery: false,
  },
  settled: {
    label: "Settled",
    meaning: "Payment has cleared in the system of record.",
    terminal: true,
    needsRecovery: false,
  },
  voided: {
    label: "Voided",
    meaning: "The payment authorization was voided.",
    terminal: true,
    needsRecovery: true,
  },
  refunded: {
    label: "Refunded",
    meaning: "Payment was returned after capture or settlement.",
    terminal: true,
    needsRecovery: true,
  },
  failed: {
    label: "Failed",
    meaning: "Payment failed and needs recovery or correction.",
    terminal: true,
    needsRecovery: true,
  },
};

export const ORDER_INTEGRATION_STATES: Record<CorporateOrderIntegrationState, StateDefinition> = {
  unknown_outcome: {
    label: "Unknown outcome",
    meaning: "A delivery attempt may have completed and must be reconciled before retrying.",
    terminal: false,
    needsRecovery: true,
  },
  not_sent: {
    label: "Not sent",
    meaning: "The order has not been pushed to an external system yet.",
    terminal: false,
    needsRecovery: false,
  },
  queued: {
    label: "Queued",
    meaning: "The order is waiting to be transmitted.",
    terminal: false,
    needsRecovery: false,
  },
  sent: {
    label: "Sent",
    meaning: "The order was transmitted and is waiting on acknowledgment.",
    terminal: false,
    needsRecovery: false,
  },
  acknowledged: {
    label: "Acknowledged",
    meaning: "The external system accepted the transmission.",
    terminal: false,
    needsRecovery: false,
  },
  reconciled: {
    label: "Reconciled",
    meaning: "The order records match across the systems of record.",
    terminal: true,
    needsRecovery: false,
  },
  degraded: {
    label: "Degraded",
    meaning: "The integration is not trustworthy enough for automation.",
    terminal: false,
    needsRecovery: true,
  },
  failed: {
    label: "Failed",
    meaning: "The integration could not complete and needs recovery.",
    terminal: false,
    needsRecovery: true,
  },
};

export const ORDER_CANCELLATION_STATES: Record<CorporateOrderCancellationState, StateDefinition> = {
  not_requested: {
    label: "Not requested",
    meaning: "No cancellation request has been made.",
    terminal: true,
    needsRecovery: false,
  },
  requested: {
    label: "Requested",
    meaning: "Someone asked for the order to be cancelled.",
    terminal: false,
    needsRecovery: true,
  },
  under_review: {
    label: "Under review",
    meaning: "The cancellation request is being checked against the order state.",
    terminal: false,
    needsRecovery: true,
  },
  approved: {
    label: "Approved",
    meaning: "Cancellation is approved and waiting for processing.",
    terminal: false,
    needsRecovery: true,
  },
  processed: {
    label: "Processed",
    meaning: "Cancellation has been completed in the system of record.",
    terminal: true,
    needsRecovery: false,
  },
  denied: {
    label: "Denied",
    meaning: "The cancellation request was not allowed.",
    terminal: true,
    needsRecovery: true,
  },
  reversed: {
    label: "Reversed",
    meaning: "A previous cancellation was undone.",
    terminal: true,
    needsRecovery: true,
  },
};

export const getOrderAcceptanceState = (state: CorporateOrderAcceptanceState): StateDefinition =>
  ORDER_ACCEPTANCE_STATES[state];

export const getOrderFulfillmentState = (state: CorporateOrderFulfillmentState): StateDefinition =>
  ORDER_FULFILLMENT_STATES[state];

export const getOrderPaymentState = (state: CorporateOrderPaymentState): StateDefinition =>
  ORDER_PAYMENT_STATES[state];

export const getOrderIntegrationState = (state: CorporateOrderIntegrationState): StateDefinition =>
  ORDER_INTEGRATION_STATES[state];

export const getOrderCancellationState = (state: CorporateOrderCancellationState): StateDefinition =>
  ORDER_CANCELLATION_STATES[state];

export const summarizeOrderFreshness = (order: CorporateOrder): ReturnType<typeof summarizeFreshness> => {
  const freshness = order.sourceFreshness.map((item) => item.freshness);
  return summarizeFreshness(freshness);
};

export const getOrderStatusSummary = (order: CorporateOrder): string => {
  const acceptance = getOrderAcceptanceState(order.acceptanceState);
  const fulfillment = getOrderFulfillmentState(order.fulfillmentState);
  const payment = getOrderPaymentState(order.paymentState);
  const integration = getOrderIntegrationState(order.integrationState);
  const cancellation = getOrderCancellationState(order.cancellationState);
  return [
    acceptance.label,
    fulfillment.label,
    payment.label,
    integration.label,
    cancellation.label,
  ].join(" · ");
};

export const requiresOrderRecovery = (order: CorporateOrder): boolean => {
  if (getOrderAcceptanceState(order.acceptanceState).needsRecovery) return true;
  if (getOrderFulfillmentState(order.fulfillmentState).needsRecovery) return true;
  if (getOrderPaymentState(order.paymentState).needsRecovery) return true;
  if (getOrderIntegrationState(order.integrationState).needsRecovery) return true;
  if (getOrderCancellationState(order.cancellationState).needsRecovery) return true;
  return summarizeOrderFreshness(order) === "stale";
};

export const isOrderClosed = (order: CorporateOrder): boolean =>
  getOrderAcceptanceState(order.acceptanceState).terminal
  && getOrderFulfillmentState(order.fulfillmentState).terminal
  && getOrderPaymentState(order.paymentState).terminal
  && getOrderIntegrationState(order.integrationState).terminal
  && getOrderCancellationState(order.cancellationState).terminal;

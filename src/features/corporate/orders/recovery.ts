import type { CorporateOrder } from "./types.ts";
import { summarizeOrderFreshness } from "./state.ts";

export type OrderRecoveryAction = {
  label: string;
  description: string;
};

export const buildOrderRecoveryActions = (order: CorporateOrder): OrderRecoveryAction[] => {
  const actions: OrderRecoveryAction[] = [];

  if (order.acceptanceState === "draft" || order.acceptanceState === "pending_review") {
    actions.push({
      label: "Confirm acceptance status",
      description: "Do not treat the order as active until acceptance is recorded in the system of record.",
    });
  }
  if (order.paymentState === "failed") {
    actions.push({
      label: "Resolve payment failure",
      description: "Retry or correct the payment record before promising downstream fulfillment.",
    });
  }
  if (order.fulfillmentState === "on_hold" || order.fulfillmentState === "failed") {
    actions.push({
      label: "Route fulfillment recovery",
      description: "Send the order to a manual fulfillment queue and preserve the original order reference.",
    });
  }
  if (order.integrationState === "degraded" || order.integrationState === "failed") {
    actions.push({
      label: "Reconcile with the system of record",
      description: "Refresh the authoritative order record before any status is shown as final.",
    });
  }
  if (order.cancellationState === "requested" || order.cancellationState === "under_review" || order.cancellationState === "approved") {
    actions.push({
      label: "Track cancellation separately",
      description: "Cancellation must stay separate from fulfillment and payment until the cancellation is processed.",
    });
  }
  if (summarizeOrderFreshness(order) === "stale") {
    actions.push({
      label: "Refresh stale source data",
      description: "Show the last verified state and collect a fresh update before taking a new action.",
    });
  }

  return actions;
};

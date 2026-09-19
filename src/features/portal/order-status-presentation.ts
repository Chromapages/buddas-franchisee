import { getOrderStatus, type PortalOrderStatus } from "./order-status.ts";

export type OperationalStatusDomain = "order" | "fulfillment" | "shipment" | "cancellation";
export type OperationalStatusSemantic = "neutral" | "info" | "success" | "warning" | "error";
export type OperationalStatusIcon = "document" | "clock" | "package" | "truck" | "check" | "alert" | "cancel";
export type OperationalStatusPriority = "routine" | "informational" | "attention" | "critical";

export type NormalizedOperationalStatus = {
  domain: OperationalStatusDomain;
  backendValue: string;
  label: string;
  semantic: OperationalStatusSemantic;
  icon: OperationalStatusIcon;
 priority: OperationalStatusPriority;
 explanatoryCopy: string;
  accessibleLabel: string;
};

export type OrderStatusPresentation = {
  primary: NormalizedOperationalStatus;
  nextStep: string;
  detailSummary: string;
  isTerminal: boolean;
  exception?: {
    title: string;
    explanatoryCopy: string;
    actionRequired: boolean;
    priority: OperationalStatusPriority;
  };
};

export type CancellationWorkflowState = "PENDING" | "APPROVED" | "PARTIALLY_APPROVED" | "REJECTED" | "CANCELLED";

export type CancellationWorkflowPresentation = {
  state: CancellationWorkflowState;
  label: string;
  semantic: OperationalStatusSemantic;
  icon: OperationalStatusIcon;
  description: string;
};

const semanticForTone = (tone: ReturnType<typeof getOrderStatus>["presentation"]["tone"]): OperationalStatusSemantic =>
  tone === "positive" ? "success" : tone === "warning" ? "warning" : tone === "critical" ? "error" : "neutral";

const iconForPortalStatus: Record<PortalOrderStatus, OperationalStatusIcon> = {
  DRAFT: "document",
  SUBMITTED: "document",
  PENDING: "clock",
  PROCESSING: "package",
  IN_TRANSIT: "truck",
  DELAYED: "alert",
  DELIVERED: "check",
  CANCELLATION_REQUESTED: "clock",
  CANCELLED: "cancel",
  FAILED: "alert",
};

const nextStepForPortalStatus: Record<PortalOrderStatus, string> = {
  DRAFT: "Order is still a draft",
  SUBMITTED: "Awaiting fulfillment",
  PENDING: "Awaiting fulfillment",
  PROCESSING: "Fulfillment underway",
  IN_TRANSIT: "In transit to the unit",
  DELAYED: "Shipment delayed",
  DELIVERED: "Delivery completed",
  CANCELLATION_REQUESTED: "Cancellation request pending",
  CANCELLED: "Order cancelled",
  FAILED: "Order needs review",
};

const exceptionForPortalStatus: Partial<Record<PortalOrderStatus, OrderStatusPresentation["exception"]>> = {
  DELAYED: {
    title: "Action required: shipment delayed",
    explanatoryCopy: "Review the fulfillment window and contact Operations Support if the delay affects your unit.",
    actionRequired: true,
    priority: "attention",
  },
  FAILED: {
    title: "Action required: order failed",
    explanatoryCopy: "This order was not accepted. Review the order and contact Operations Support before placing a replacement.",
    actionRequired: true,
    priority: "critical",
  },
  CANCELLATION_REQUESTED: {
    title: "Cancellation request pending",
    explanatoryCopy: "The fulfillment owner must confirm what can still be cancelled. Payment and fulfillment outcomes remain pending.",
    actionRequired: false,
    priority: "informational",
  },
};

export const getOrderStatusPresentation = (status: PortalOrderStatus, fulfillmentWindow?: string): OrderStatusPresentation => {
  const definition = getOrderStatus(status);
  const domain: OperationalStatusDomain = status === "CANCELLATION_REQUESTED" || status === "CANCELLED" ? "cancellation" : "order";
 const defaultNextStep = nextStepForPortalStatus[status];
 const nextStep = !definition.isTerminal && fulfillmentWindow
    ? status === "IN_TRANSIT" ? `In transit · ${fulfillmentWindow}` : status === "DELAYED" ? "Shipment delayed" : `Fulfillment window: ${fulfillmentWindow}`
   : defaultNextStep;
  return {
    primary: {
      domain,
      backendValue: status,
      label: definition.label,
      semantic: semanticForTone(definition.presentation.tone),
      icon: iconForPortalStatus[status],
      priority: requiresPriority(status),
      explanatoryCopy: definition.presentation.accessibleDescription,
      accessibleLabel: `${domain === "cancellation" ? "Cancellation" : "Order"} status: ${definition.label}. ${definition.presentation.accessibleDescription}`,
    },
    nextStep,
    detailSummary: definition.isTerminal ? defaultNextStep : fulfillmentWindow || defaultNextStep,
    isTerminal: definition.isTerminal,
    ...(exceptionForPortalStatus[status] ? { exception: exceptionForPortalStatus[status] } : {}),
  };
};

const requiresPriority = (status: PortalOrderStatus): OperationalStatusPriority =>
  status === "FAILED" ? "critical" : status === "DELAYED" ? "attention" : status === "CANCELLATION_REQUESTED" ? "informational" : "routine";

type BackendStatusMap = Record<string, Omit<NormalizedOperationalStatus, "domain" | "backendValue" | "accessibleLabel">>;

const fulfillmentStatuses: BackendStatusMap = {
  not_started: { label: "Not started", semantic: "neutral", icon: "clock", priority: "routine", explanatoryCopy: "Fulfillment has not started." },
  picking: { label: "Picking", semantic: "info", icon: "package", priority: "informational", explanatoryCopy: "Items are being picked." },
  packed: { label: "Packing", semantic: "info", icon: "package", priority: "informational", explanatoryCopy: "Items are being packed for fulfillment." },
  ready: { label: "Ready", semantic: "info", icon: "package", priority: "informational", explanatoryCopy: "Fulfillment is ready for shipment or pickup." },
  partial: { label: "Partially fulfilled", semantic: "warning", icon: "alert", priority: "attention", explanatoryCopy: "Only part of the order has been fulfilled." },
  fulfilled: { label: "Fulfilled", semantic: "success", icon: "check", priority: "routine", explanatoryCopy: "Fulfillment is complete." },
};

const shipmentStatuses: BackendStatusMap = {
  not_shipped: { label: "Not shipped", semantic: "neutral", icon: "clock", priority: "routine", explanatoryCopy: "The shipment has not left fulfillment." },
  label_created: { label: "Label created", semantic: "info", icon: "document", priority: "informational", explanatoryCopy: "A carrier label has been created." },
  carrier_received: { label: "Carrier received", semantic: "info", icon: "truck", priority: "informational", explanatoryCopy: "The carrier has received the shipment." },
  in_transit: { label: "In transit", semantic: "info", icon: "truck", priority: "informational", explanatoryCopy: "The shipment is moving to the unit." },
  out_for_delivery: { label: "Out for delivery", semantic: "info", icon: "truck", priority: "informational", explanatoryCopy: "The shipment is out for delivery." },
  delivered: { label: "Delivered", semantic: "success", icon: "check", priority: "routine", explanatoryCopy: "The shipment was delivered." },
  delayed: { label: "Delayed", semantic: "warning", icon: "alert", priority: "attention", explanatoryCopy: "The shipment is delayed." },
  exception: { label: "Exception", semantic: "error", icon: "alert", priority: "critical", explanatoryCopy: "The carrier reported a shipment exception." },
};

const cancellationStatuses: BackendStatusMap = {
  not_requested: { label: "Not requested", semantic: "neutral", icon: "clock", priority: "routine", explanatoryCopy: "No cancellation has been requested." },
  eligible: { label: "Eligible", semantic: "info", icon: "document", priority: "informational", explanatoryCopy: "Cancellation eligibility is available." },
  requested: { label: "Request submitted", semantic: "info", icon: "clock", priority: "informational", explanatoryCopy: "The cancellation request was submitted." },
  under_review: { label: "Under review", semantic: "warning", icon: "clock", priority: "attention", explanatoryCopy: "The cancellation request is under review." },
  partially_approved: { label: "Partially approved", semantic: "warning", icon: "alert", priority: "attention", explanatoryCopy: "Only part of the cancellation was approved." },
  approved: { label: "Approved", semantic: "success", icon: "check", priority: "routine", explanatoryCopy: "The cancellation was approved." },
  rejected: { label: "Rejected", semantic: "error", icon: "cancel", priority: "attention", explanatoryCopy: "The cancellation request was rejected." },
  completed: { label: "Completed", semantic: "success", icon: "check", priority: "routine", explanatoryCopy: "The cancellation is complete." },
  cancelled: { label: "Cancelled", semantic: "success", icon: "cancel", priority: "routine", explanatoryCopy: "The order was cancelled." },
};

const mapsByDomain: Record<Exclude<OperationalStatusDomain, "order">, BackendStatusMap> = {
  fulfillment: fulfillmentStatuses,
  shipment: shipmentStatuses,
  cancellation: cancellationStatuses,
};

export const normalizeBackendOperationalStatus = (
  domain: Exclude<OperationalStatusDomain, "order">,
  backendValue: unknown,
): NormalizedOperationalStatus | null => {
  const value = typeof backendValue === "string" ? backendValue.trim().toLowerCase().replace(/[\s-]+/g, "_") : "";
 const match = mapsByDomain[domain][value];
 return match ? { domain, backendValue: value, ...match, accessibleLabel: `${domain[0].toUpperCase()}${domain.slice(1)} status: ${match.label}. ${match.explanatoryCopy}` } : null;
};

const cancellationWorkflowStates: Record<string, CancellationWorkflowPresentation> = {
  requested: { state: "PENDING", label: "Request submitted", semantic: "info", icon: "clock", description: "The fulfillment owner must review this request. Cancellation is not immediate, and fulfillment or payment changes are not yet confirmed." },
  under_review: { state: "PENDING", label: "Under review", semantic: "warning", icon: "clock", description: "The fulfillment owner is reviewing this cancellation request. The order is not cancelled unless a final outcome is recorded." },
  approved: { state: "APPROVED", label: "Approved", semantic: "info", icon: "check", description: "Cancellation approval was recorded. Final processing remains pending until the system of record confirms the outcome." },
  partially_approved: { state: "PARTIALLY_APPROVED", label: "Partially approved", semantic: "warning", icon: "alert", description: "Only part of the requested cancellation was approved. Review the updated fulfillment details when they are available." },
  rejected: { state: "REJECTED", label: "Request not approved", semantic: "error", icon: "cancel", description: "No cancellation was confirmed. Review the current order status for the next operational step." },
  completed: { state: "CANCELLED", label: "Cancelled", semantic: "success", icon: "cancel", description: "The order cancellation has been completed. This order will not be fulfilled." },
  cancelled: { state: "CANCELLED", label: "Cancelled", semantic: "success", icon: "cancel", description: "The order cancellation has been completed. This order will not be fulfilled." },
};

/**
 * Portal orders currently use an order-level status as the canonical fallback.
 * If a fulfillment source supplies a more specific cancellation outcome, it is
 * normalized here without inventing an outcome when the field is absent.
 */
export const getCancellationWorkflowPresentation = (
  status: PortalOrderStatus,
  cancellationStatus?: string,
): CancellationWorkflowPresentation | null => {
  const raw = typeof cancellationStatus === "string"
    ? cancellationStatus.trim().toLowerCase().replace(/[\s-]+/g, "_")
    : "";
  if (raw && cancellationWorkflowStates[raw]) return cancellationWorkflowStates[raw];
  if (status === "CANCELLATION_REQUESTED") return cancellationWorkflowStates.requested;
  if (status === "CANCELLED") return cancellationWorkflowStates.cancelled;
  return null;
};

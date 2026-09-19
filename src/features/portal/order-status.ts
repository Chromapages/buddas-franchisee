export type PortalOrderStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PENDING"
  | "PROCESSING"
  | "IN_TRANSIT"
  | "DELAYED"
  | "DELIVERED"
  | "CANCELLATION_REQUESTED"
  | "CANCELLED"
  | "FAILED";

type OrderStatusTone = "neutral" | "positive" | "warning" | "critical";

export type OrderStatusDefinition = {
  id: PortalOrderStatus;
  label: string;
  meaning: string;
  allowedNextStates: readonly PortalOrderStatus[];
  operatorActionRequired: boolean;
  isTerminal: boolean;
  isInMotion: boolean;
  presentation: {
    tone: OrderStatusTone;
    accessibleDescription: string;
  };
  notification: {
    title: string;
    actionLabel: string;
  };
  analytics: {
    lifecycleStage: "received" | "fulfillment" | "shipment" | "exception" | "complete";
  };
  storageValues: readonly string[];
};

export const ORDER_STATUS: Record<PortalOrderStatus, OrderStatusDefinition> = {
  DRAFT: {
    id: "DRAFT", label: "Draft", meaning: "Order is being prepared and has not been submitted.",
    allowedNextStates: ["SUBMITTED"], operatorActionRequired: false, isTerminal: false, isInMotion: false,
    presentation: { tone: "neutral", accessibleDescription: "Order is still a draft and has not been submitted." },
    notification: { title: "Order draft", actionLabel: "View order" },
    analytics: { lifecycleStage: "received" }, storageValues: ["DRAFT", "Draft"],
  },
  SUBMITTED: {
    id: "SUBMITTED", label: "Submitted", meaning: "Order was submitted and is awaiting fulfillment work.",
    allowedNextStates: ["PROCESSING", "FAILED", "CANCELLATION_REQUESTED"], operatorActionRequired: false, isTerminal: false, isInMotion: true,
    presentation: { tone: "neutral", accessibleDescription: "Order was submitted and is awaiting fulfillment." },
    notification: { title: "Order submitted", actionLabel: "View order" },
    analytics: { lifecycleStage: "received" }, storageValues: ["SUBMITTED", "Submitted"],
  },
  PENDING: {
    id: "PENDING", label: "Pending", meaning: "Order received and awaiting fulfillment work.",
    allowedNextStates: ["PROCESSING", "CANCELLATION_REQUESTED"], operatorActionRequired: false, isTerminal: false, isInMotion: true,
    presentation: { tone: "neutral", accessibleDescription: "Order is pending fulfillment." },
    notification: { title: "Order pending fulfillment", actionLabel: "View order" },
    analytics: { lifecycleStage: "received" }, storageValues: ["PENDING", "Pending"],
  },
  PROCESSING: {
    id: "PROCESSING", label: "Processing", meaning: "Fulfillment is underway.",
    allowedNextStates: ["IN_TRANSIT", "DELAYED", "CANCELLATION_REQUESTED"], operatorActionRequired: false, isTerminal: false, isInMotion: true,
    presentation: { tone: "neutral", accessibleDescription: "Order is being fulfilled." },
    notification: { title: "Order is being fulfilled", actionLabel: "View order" },
    analytics: { lifecycleStage: "fulfillment" }, storageValues: ["PROCESSING", "Processing"],
  },
  IN_TRANSIT: {
    id: "IN_TRANSIT", label: "In transit", meaning: "Order has left fulfillment and is moving to the unit.",
    allowedNextStates: ["DELAYED", "DELIVERED", "CANCELLATION_REQUESTED"], operatorActionRequired: false, isTerminal: false, isInMotion: true,
    presentation: { tone: "neutral", accessibleDescription: "Shipment is in transit to the unit." },
    notification: { title: "Shipment is in transit", actionLabel: "Track shipment" },
    analytics: { lifecycleStage: "shipment" }, storageValues: ["IN_TRANSIT", "Shipped", "In transit"],
  },
  DELAYED: {
    id: "DELAYED", label: "Delayed", meaning: "The recorded shipment plan is delayed and needs operator review.",
    allowedNextStates: ["IN_TRANSIT", "DELIVERED", "CANCELLATION_REQUESTED"], operatorActionRequired: true, isTerminal: false, isInMotion: true,
    presentation: { tone: "warning", accessibleDescription: "Shipment is delayed and requires operator review." },
    notification: { title: "Delayed shipment needs review", actionLabel: "Review shipment" },
    analytics: { lifecycleStage: "exception" }, storageValues: ["DELAYED", "Delayed"],
  },
  DELIVERED: {
    id: "DELIVERED", label: "Fulfilled", meaning: "Order delivery has been completed.",
    allowedNextStates: [], operatorActionRequired: false, isTerminal: true, isInMotion: false,
    presentation: { tone: "positive", accessibleDescription: "Order delivery is complete." },
    notification: { title: "Order fulfilled", actionLabel: "View order" },
    analytics: { lifecycleStage: "complete" }, storageValues: ["DELIVERED", "Delivered", "FULFILLED", "Fulfilled"],
  },
  CANCELLATION_REQUESTED: {
    id: "CANCELLATION_REQUESTED", label: "Cancellation requested", meaning: "A cancellation request is waiting for confirmation from the fulfillment owner.",
    allowedNextStates: ["CANCELLED"], operatorActionRequired: false, isTerminal: false, isInMotion: true,
    presentation: { tone: "warning", accessibleDescription: "Cancellation is requested; fulfillment and payment outcomes are not yet confirmed." },
    notification: { title: "Cancellation request recorded", actionLabel: "View order" },
    analytics: { lifecycleStage: "exception" }, storageValues: ["CANCELLATION_REQUESTED", "Cancellation requested"],
  },
  CANCELLED: {
    id: "CANCELLED", label: "Cancelled", meaning: "Order will not be fulfilled.",
    allowedNextStates: [], operatorActionRequired: false, isTerminal: true, isInMotion: false,
    presentation: { tone: "neutral", accessibleDescription: "Order was cancelled and will not be fulfilled." },
    notification: { title: "Order cancelled", actionLabel: "View order" },
    analytics: { lifecycleStage: "exception" }, storageValues: ["CANCELLED", "Cancelled", "Canceled"],
  },
  FAILED: {
    id: "FAILED", label: "Failed", meaning: "Order could not be accepted and requires operator review.",
    allowedNextStates: [], operatorActionRequired: true, isTerminal: true, isInMotion: false,
    presentation: { tone: "critical", accessibleDescription: "Order failed and requires operator review." },
    notification: { title: "Order failed and needs review", actionLabel: "Review order" },
    analytics: { lifecycleStage: "exception" }, storageValues: ["FAILED", "Failed"],
  },
};

export const ORDER_STATUS_IDS = Object.keys(ORDER_STATUS) as PortalOrderStatus[];

export const getOrderStatus = (status: PortalOrderStatus): OrderStatusDefinition => ORDER_STATUS[status];
export const isOrderInMotion = (status: PortalOrderStatus): boolean => getOrderStatus(status).isInMotion;
export const isOrderTerminal = (status: PortalOrderStatus): boolean => getOrderStatus(status).isTerminal;
export const requiresOrderOperatorAction = (status: PortalOrderStatus): boolean => getOrderStatus(status).operatorActionRequired;
export const canTransitionOrderStatus = (current: PortalOrderStatus, next: PortalOrderStatus): boolean =>
  getOrderStatus(current).allowedNextStates.includes(next);
export const getOrderStatusAccessibleLabel = (status: PortalOrderStatus): string => {
  const definition = getOrderStatus(status);
  return `Status: ${definition.label}. ${definition.presentation.accessibleDescription}`;
};
export const getOrderStatusNotification = (status: PortalOrderStatus) => getOrderStatus(status).notification;
export const getOrderStatusAnalytics = (status: PortalOrderStatus) => getOrderStatus(status).analytics;
export const normalizeOrderStatus = (value: unknown): PortalOrderStatus => {
  const storedValue = typeof value === "string" ? value.trim() : "";
  const match = ORDER_STATUS_IDS.find((status) => ORDER_STATUS[status].storageValues.includes(storedValue));
  if (!match) throw new Error(`Unsupported portal order status: ${storedValue || "missing"}`);
  return match;
};
export const serializeOrderStatus = (status: PortalOrderStatus): string => getOrderStatus(status).id;

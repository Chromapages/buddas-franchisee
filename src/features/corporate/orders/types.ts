import type { CorporateSourceFreshness } from "../requests/types.ts";

export type CorporateOrderAcceptanceState =
  | "draft"
  | "received"
  | "pending_review"
  | "accepted"
  | "rejected"
  | "cancelled";

export type CorporateOrderFulfillmentState =
  | "unknown"
  | "not_started"
  | "queued"
  | "picking"
  | "packed"
  | "partial"
  | "shipped"
  | "delivered"
  | "closed_short"
  | "on_hold"
  | "failed";

export type CorporateOrderPaymentState =
  | "unknown"
  | "not_required"
  | "pending"
  | "authorized"
  | "captured"
  | "settled"
  | "voided"
  | "refunded"
  | "failed";

export type CorporateOrderIntegrationState =
  | "unknown_outcome"
  | "not_sent"
  | "queued"
  | "sent"
  | "acknowledged"
  | "reconciled"
  | "degraded"
  | "failed";

export type CorporateOrderCancellationState =
  | "not_requested"
  | "requested"
  | "under_review"
  | "approved"
  | "processed"
  | "denied"
  | "reversed";

export type CorporateOrderLine = {
  sku: string;
  name: string;
  orderedQuantity: number;
  acceptedQuantity?: number;
  shippedQuantity: number;
  deliveredQuantity?: number;
  cancelledQuantity?: number;
  amendedQuantity?: number;
  unitPrice: number;
  shipmentReference?: string;
  amendmentReason?: string;
};

export type CorporateOrderSourceFreshnessSource =
  | "acceptance"
  | "fulfillment"
  | "payment"
  | "integration"
  | "cancellation";

export type CorporateOrderSourceFreshness = {
  source: CorporateOrderSourceFreshnessSource;
  observedAt?: string;
  freshness: CorporateSourceFreshness;
};

export type CorporateOrderRecoveryAction = {
  label: string;
  description: string;
};

export type CorporateOrder = {
  id: string;
  sourceOrderId?: string;
  organizationId?: string;
  regionId?: string;
  locationId: string;
  locationName: string;
  supplierLabel?: string;
  createdAt: string;
  updatedAt: string;
  acceptanceState: CorporateOrderAcceptanceState;
  fulfillmentState: CorporateOrderFulfillmentState;
  paymentState: CorporateOrderPaymentState;
  integrationState: CorporateOrderIntegrationState;
  cancellationState: CorporateOrderCancellationState;
  lines: CorporateOrderLine[];
  sourceFreshness: CorporateOrderSourceFreshness[];
  recoveryActions: CorporateOrderRecoveryAction[];
  acceptanceReference?: string;
  paymentReference?: string;
  fulfillmentReference?: string;
  integrationReference?: string;
  cancellationReason?: string;
  portalStatus?: string;
  procurementVersion: number;
  supplierAcknowledgedAt?: string;
  reconciledAt?: string;
  reconciliationStatus?: "MATCHED" | "EXCEPTION";
  reconciliationNote?: string;
};

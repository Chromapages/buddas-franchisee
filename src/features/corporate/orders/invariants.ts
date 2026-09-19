import type { CorporateOrderLine } from "./types.ts";

export const getLiveLineQuantity = (line: CorporateOrderLine): number =>
  line.amendedQuantity ?? line.acceptedQuantity ?? line.orderedQuantity;

export const getRemainingLineQuantity = (line: CorporateOrderLine): number =>
  getLiveLineQuantity(line) - line.shippedQuantity - (line.cancelledQuantity ?? 0);

export const validateOrderLineInvariants = (line: CorporateOrderLine): string[] => {
  const issues: string[] = [];

  const isWholeNumber = (value: number) => Number.isInteger(value) && value >= 0;
  if (!isWholeNumber(line.orderedQuantity)) {
    issues.push("Ordered quantity must be a non-negative whole number.");
  }
  if (!isWholeNumber(line.shippedQuantity)) {
    issues.push("Shipped quantity must be a non-negative whole number.");
  }
  if (line.acceptedQuantity !== undefined && !isWholeNumber(line.acceptedQuantity)) {
    issues.push("Accepted quantity must be a non-negative whole number.");
  }
  if (line.deliveredQuantity !== undefined && !isWholeNumber(line.deliveredQuantity)) {
    issues.push("Delivered quantity must be a non-negative whole number.");
  }
  if (line.cancelledQuantity !== undefined && !isWholeNumber(line.cancelledQuantity)) {
    issues.push("Cancelled quantity must be a non-negative whole number.");
  }
  if (line.amendedQuantity !== undefined && !isWholeNumber(line.amendedQuantity)) {
    issues.push("Amended quantity must be a non-negative whole number.");
  }

  const liveQuantity = getLiveLineQuantity(line);
  if (line.shippedQuantity > liveQuantity) {
    issues.push("Shipped quantity cannot exceed the live line quantity.");
  }
  if (line.amendedQuantity !== undefined && line.amendedQuantity < line.shippedQuantity) {
    issues.push("An amendment cannot reduce a shipped line below the shipped quantity.");
  }
  if ((line.deliveredQuantity ?? 0) > line.shippedQuantity) {
    issues.push("Delivered quantity cannot exceed shipped quantity.");
  }
  if (line.shippedQuantity + (line.cancelledQuantity ?? 0) > liveQuantity) {
    issues.push("Shipped and cancelled quantities cannot exceed the live line quantity.");
  }
  return issues;
};

export const amendOrderLineQuantity = (
  line: CorporateOrderLine,
  nextQuantity: number,
  reason?: string,
): CorporateOrderLine => {
  if (!Number.isInteger(nextQuantity) || nextQuantity < 0) {
    throw new Error("Amended quantity must be a non-negative whole number.");
  }
  if (nextQuantity < line.shippedQuantity) {
    throw new Error("An amendment cannot reduce quantity below shipped quantity.");
  }

  const issues = validateOrderLineInvariants({
    ...line,
    amendedQuantity: nextQuantity,
    amendmentReason: reason ?? line.amendmentReason,
  });
  if (issues.length) {
    throw new Error(issues[0] || "Invalid order line amendment.");
  }

  return {
    ...line,
    amendedQuantity: nextQuantity,
    amendmentReason: reason?.trim() || line.amendmentReason,
  };
};

export const recordOrderLineShipment = (
  line: CorporateOrderLine,
  quantity: number,
  shipmentReference?: string,
): CorporateOrderLine => {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Shipment quantity must be a positive whole number.");
  }

  const remaining = getRemainingLineQuantity(line);
  if (quantity > remaining) {
    throw new Error("Shipment quantity cannot exceed the remaining line quantity.");
  }

  return {
    ...line,
    shippedQuantity: line.shippedQuantity + quantity,
    shipmentReference: shipmentReference?.trim() || line.shipmentReference,
  };
};

export const recordOrderLineDelivery = (
  line: CorporateOrderLine,
  quantity: number,
): CorporateOrderLine => {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Delivery quantity must be a positive whole number.");
  }
  const delivered = line.deliveredQuantity ?? 0;
  if (delivered + quantity > line.shippedQuantity) {
    throw new Error("Delivered quantity cannot exceed shipped quantity.");
  }
  return { ...line, deliveredQuantity: delivered + quantity };
};

export const cancelOrderLineRemainder = (
  line: CorporateOrderLine,
  quantity: number,
): CorporateOrderLine => {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Cancellation quantity must be a positive whole number.");
  }
  if (quantity > getRemainingLineQuantity(line)) {
    throw new Error("Cancellation quantity cannot exceed the unshipped remainder.");
  }
  return { ...line, cancelledQuantity: (line.cancelledQuantity ?? 0) + quantity };
};

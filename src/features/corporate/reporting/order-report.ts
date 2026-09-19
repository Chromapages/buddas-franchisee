import type { CorporateOrder } from "../orders/types";

export type AuthoritativeOrderReport = {
  submitted: number;
  acknowledged: number;
  reconciled: number;
  matched: number;
  exceptions: number;
  acknowledgedValue: number;
  averageAcknowledgmentHours?: number;
  coveragePercent: number;
};

export const buildAuthoritativeOrderReport = (orders: CorporateOrder[]): AuthoritativeOrderReport => {
  const acknowledged = orders.filter((order) => Boolean(order.supplierAcknowledgedAt));
  const reconciled = acknowledged.filter((order) => Boolean(order.reconciledAt));
  const latencies = acknowledged.flatMap((order) => {
    const start = Date.parse(order.createdAt); const end = Date.parse(order.supplierAcknowledgedAt || "");
    return Number.isFinite(start) && Number.isFinite(end) && end >= start ? [(end - start) / 3_600_000] : [];
  });
  return {
    submitted: orders.length,
    acknowledged: acknowledged.length,
    reconciled: reconciled.length,
    matched: reconciled.filter((order) => order.reconciliationStatus === "MATCHED").length,
    exceptions: reconciled.filter((order) => order.reconciliationStatus === "EXCEPTION").length,
    acknowledgedValue: acknowledged.reduce((sum, order) => sum + order.lines.reduce((lineTotal, line) => lineTotal + (line.acceptedQuantity ?? 0) * line.unitPrice, 0), 0),
    ...(latencies.length ? { averageAcknowledgmentHours: latencies.reduce((sum, value) => sum + value, 0) / latencies.length } : {}),
    coveragePercent: orders.length ? Math.round((acknowledged.length / orders.length) * 100) : 0,
  };
};

"use server";

import { revalidatePath } from "next/cache";
import { firebaseDb } from "@/src/lib/firebase/admin";
import { assertCorporatePermission } from "../authorization";
import { getCorporateSession } from "../session";

export type OrderReconciliationState = { status: "idle" | "success" | "error"; message: string };
const safeId = (value: FormDataEntryValue | null): string => typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value) ? value : "";

export async function reconcileSupplierOrder(_previous: OrderReconciliationState, formData: FormData): Promise<OrderReconciliationState> {
  const session = await getCorporateSession();
  if (!session || !firebaseDb) return { status: "error", message: "Corporate order reconciliation is unavailable." };
  const locationId = safeId(formData.get("locationId"));
  const orderId = safeId(formData.get("orderId"));
  const expectedVersion = Number(formData.get("expectedVersion"));
  const rawNote = formData.get("note");
  const note = typeof rawNote === "string" ? rawNote.normalize("NFKC").trim().slice(0, 1000) : "";
  if (!locationId || !orderId || !Number.isSafeInteger(expectedVersion) || expectedVersion < 1) return { status: "error", message: "Reload the order before reconciling it." };
  const unitRef = firebaseDb.collection("units").doc(locationId);
  const orderRef = unitRef.collection("orders").doc(orderId);
  try {
    const unit = await unitRef.get();
    if (!unit.exists) return { status: "error", message: "The order location is unavailable." };
    const unitData = unit.data()!;
    assertCorporatePermission(session, "COORDINATE_ORDERS", { locationId, organizationId: typeof unitData.organizationId === "string" ? unitData.organizationId : undefined, regionId: typeof unitData.regionId === "string" ? unitData.regionId : undefined });
    await firebaseDb.runTransaction(async (transaction) => {
      const order = await transaction.get(orderRef);
      if (!order.exists) throw new Error("NOT_FOUND");
      const data = order.data()!;
      const procurement = data.procurement as Record<string, unknown> | undefined;
      if (Number(procurement?.version || 0) !== expectedVersion) throw new Error("VERSION_CONFLICT");
      const supplier = procurement?.supplier as { acceptedQuantities?: Record<string, number> } | undefined;
      if (!supplier?.acceptedQuantities) throw new Error("NO_ACKNOWLEDGMENT");
      const items = Array.isArray(data.items) ? data.items as Array<{ sku?: unknown; quantity?: unknown }> : [];
      const matched = items.length > 0 && items.every((item) => typeof item.sku === "string" && typeof item.quantity === "number" && supplier.acceptedQuantities?.[item.sku] === item.quantity) && Object.keys(supplier.acceptedQuantities).length === items.length;
      const reconciledAt = new Date().toISOString();
      const reconciliation = { status: matched ? "MATCHED" : "EXCEPTION", reconciledAt, reconciledById: session.userId, reconciledByName: session.displayName, ...(note ? { note } : {}) };
      const nextVersion = expectedVersion + 1;
      const auditRef = firebaseDb!.collection("corporateAuditEvents").doc(`order-reconciled-${locationId}-${orderId}-${nextVersion}`);
      transaction.update(orderRef, { procurement: { ...procurement, version: nextVersion, reconciliation }, updatedAt: reconciledAt });
      transaction.create(auditRef, { actorId: session.userId, actorName: session.displayName, action: "SUPPLIER_ORDER_RECONCILED", outcome: matched ? "SUCCESS" : "EXCEPTION", targetType: "portal_order", targetId: orderId, locationId, occurredAt: reconciledAt, changedFields: ["procurement.reconciliation", "procurement.version"] });
    });
    revalidatePath(`/corporate/orders/${encodeURIComponent(`${locationId}:${orderId}`)}`);
    revalidatePath("/corporate/orders");
    revalidatePath("/corporate/reporting/orders");
    return { status: "success", message: "Supplier acknowledgment reconciled. Reloading will show the recorded outcome." };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "FAILED";
    return { status: "error", message: reason === "VERSION_CONFLICT" ? "This order changed. Reload and review the latest supplier acknowledgment." : reason === "NO_ACKNOWLEDGMENT" ? "A verified supplier acknowledgment is required before reconciliation." : reason === "NOT_FOUND" ? "The order no longer exists." : "The reconciliation could not be recorded." };
  }
}

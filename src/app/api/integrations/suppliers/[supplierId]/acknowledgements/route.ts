import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { firebaseDb } from "@/src/lib/firebase/admin";

export const dynamic = "force-dynamic";

const safeId = (value: unknown): value is string => typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value);
const validSignature = (body: string, signature: string | null): boolean => {
  const secret = process.env.SUPPLIER_ACK_SECRET;
  if (!secret || !signature?.startsWith("sha256=")) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(body).digest("hex"), "utf8");
  const supplied = Buffer.from(signature.slice(7), "utf8");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
};

export async function POST(request: Request, { params }: { params: Promise<{ supplierId: string }> }) {
  const body = await request.text();
  if (!validSignature(body, request.headers.get("x-buddas-signature"))) return NextResponse.json({ error: "Invalid supplier signature." }, { status: 401 });
  if (!firebaseDb) return NextResponse.json({ error: "Supplier acknowledgment storage is unavailable." }, { status: 503 });
  const { supplierId } = await params;
  if (!safeId(supplierId)) return NextResponse.json({ error: "Invalid supplier." }, { status: 400 });
  let payload: Record<string, unknown>;
  try { payload = JSON.parse(body) as Record<string, unknown>; } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const { eventId, locationId, orderId, supplierName, acknowledgmentReference, acknowledgedAt } = payload;
  const quantities = payload.acceptedQuantities;
  if (![eventId, locationId, orderId].every(safeId) || typeof supplierName !== "string" || !supplierName.trim() || typeof acknowledgmentReference !== "string" || !acknowledgmentReference.trim() || typeof acknowledgedAt !== "string" || !Number.isFinite(Date.parse(acknowledgedAt)) || !quantities || typeof quantities !== "object" || Array.isArray(quantities)) return NextResponse.json({ error: "Invalid acknowledgment payload." }, { status: 400 });
  const acceptedQuantities = Object.fromEntries(Object.entries(quantities as Record<string, unknown>).filter(([sku, quantity]) => safeId(sku) && Number.isInteger(quantity) && Number(quantity) >= 0).map(([sku, quantity]) => [sku, Number(quantity)]));
  if (!Object.keys(acceptedQuantities).length) return NextResponse.json({ error: "Accepted quantities are required." }, { status: 400 });
  const eventRef = firebaseDb.collection("supplierAcknowledgementEvents").doc(`${supplierId}__${eventId}`);
  const orderRef = firebaseDb.collection("units").doc(locationId as string).collection("orders").doc(orderId as string);
  const auditRef = firebaseDb.collection("corporateAuditEvents").doc(`supplier-ack-${supplierId}-${eventId}`);
  const recordedAt = new Date().toISOString();
  try {
    const replayed = await firebaseDb.runTransaction(async (transaction) => {
      const [event, order] = await transaction.getAll(eventRef, orderRef);
      if (event.exists) return true;
      if (!order.exists) throw new Error("ORDER_NOT_FOUND");
      const data = order.data()!;
      const items = Array.isArray(data.items) ? data.items : [];
      if (Object.entries(acceptedQuantities).some(([sku, quantity]) => !items.some((item: { sku?: unknown; quantity?: unknown }) => item.sku === sku && typeof item.quantity === "number" && quantity <= item.quantity))) throw new Error("QUANTITY_MISMATCH");
      const version = Number(data.procurement?.version || 0) + 1;
      const supplier = { systemOfRecord: supplierId, supplierName: supplierName.trim().slice(0, 128), acknowledgmentReference: acknowledgmentReference.trim().slice(0, 128), acknowledgedAt, recordedAt, recordedById: `supplier:${supplierId}`, recordedByName: supplierName.trim().slice(0, 128), acceptedQuantities };
      transaction.create(eventRef, { supplierId, eventId, locationId, orderId, supplier, receivedAt: recordedAt });
      transaction.update(orderRef, { procurement: { version, supplier }, updatedAt: recordedAt });
      transaction.create(auditRef, { actorId: `supplier:${supplierId}`, action: "SUPPLIER_ORDER_ACKNOWLEDGED", outcome: "SUCCESS", targetType: "portal_order", targetId: orderId, locationId, occurredAt: recordedAt, sourceEventId: eventId });
      return false;
    });
    return NextResponse.json({ status: replayed ? "already_processed" : "recorded" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "FAILED";
    return NextResponse.json({ error: message === "ORDER_NOT_FOUND" ? "Order not found." : message === "QUANTITY_MISMATCH" ? "Acknowledged quantities do not match the submitted order." : "Acknowledgment could not be recorded." }, { status: message === "ORDER_NOT_FOUND" ? 404 : message === "QUANTITY_MISMATCH" ? 409 : 500 });
  }
}

import { NextResponse } from "next/server";
import { firebaseDb } from "@/src/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cronSecret = process.env.SUPPLIER_ORDER_CRON_SECRET || process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const destination = process.env.SUPPLIER_ORDER_URL;
  if (!firebaseDb || !destination) return NextResponse.json({ error: "Supplier order delivery is not configured." }, { status: 503 });
  const queued = await firebaseDb.collection("supplierOrderDeliveries").where("state", "in", ["QUEUED", "FAILED"]).limit(25).get();
  const results = await Promise.all(queued.docs.map(async (delivery) => {
    const data = delivery.data();
    const order = await firebaseDb!.collection("units").doc(String(data.locationId)).collection("orders").doc(String(data.orderId)).get();
    if (!order.exists) { await delivery.ref.update({ state: "FAILED", lastError: "Order not found.", lastAttemptAt: new Date().toISOString() }); return { id: delivery.id, state: "FAILED" }; }
    const attemptedAt = new Date().toISOString();
    try {
      const response = await fetch(destination, { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": String(data.idempotencyKey), ...(process.env.SUPPLIER_ORDER_TOKEN ? { Authorization: `Bearer ${process.env.SUPPLIER_ORDER_TOKEN}` } : {}) }, body: JSON.stringify({ locationId: data.locationId, orderId: data.orderId, order: order.data() }), signal: AbortSignal.timeout(10_000), cache: "no-store", redirect: "error" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await delivery.ref.update({ state: "SENT", attempts: Number(data.attempts || 0) + 1, lastAttemptAt: attemptedAt, sentAt: attemptedAt, lastError: null });
      return { id: delivery.id, state: "SENT" };
    } catch (error) {
      await delivery.ref.update({ state: "FAILED", attempts: Number(data.attempts || 0) + 1, lastAttemptAt: attemptedAt, lastError: error instanceof Error ? error.message.slice(0, 250) : "Delivery failed." });
      return { id: delivery.id, state: "FAILED" };
    }
  }));
  return NextResponse.json({ processed: results.length, results });
}

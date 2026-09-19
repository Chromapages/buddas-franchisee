"use client";

import { useActionState } from "react";
import { reconcileSupplierOrder, type OrderReconciliationState } from "@/src/features/corporate/orders/actions";

const initialState: OrderReconciliationState = { status: "idle", message: "" };

export function OrderReconciliationForm({ locationId, orderId, expectedVersion }: { locationId: string; orderId: string; expectedVersion: number }) {
  const [state, action, pending] = useActionState(reconcileSupplierOrder, initialState);
  return <form action={action} className="corporate-support-form">
    <input type="hidden" name="locationId" value={locationId} /><input type="hidden" name="orderId" value={orderId} /><input type="hidden" name="expectedVersion" value={expectedVersion} />
    <label className="corporate-field"><span>Reconciliation note</span><textarea name="note" maxLength={1000} placeholder="Optional source comparison or exception context" /></label>
    <div className="corporate-form-footer"><p>The system compares every acknowledged quantity with the submitted order. Differences remain an exception.</p><button className="corporate-button" type="submit" disabled={pending}>{pending ? "Reconciling…" : "Reconcile acknowledgment"}</button></div>
    {state.message ? <p className={`corporate-form-message corporate-form-message-${state.status}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p> : null}
  </form>;
}

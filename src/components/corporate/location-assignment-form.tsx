"use client";
import { useActionState } from "react";
import { assignLocationOperator, type LocationActionState } from "@/src/features/corporate/locations/actions";
const initial: LocationActionState = { status: "idle", message: "" };
export function LocationAssignmentForm({ locationId, operators }: { locationId: string; operators: Array<{ id: string; displayName: string; email: string }> }) {
  const [state, submit, pending] = useActionState(assignLocationOperator, initial);
  return <form action={submit} className="corporate-support-form"><input type="hidden" name="locationId" value={locationId} /><label className="corporate-field"><span>Assign existing operator</span><select name="operatorId" required defaultValue=""><option value="" disabled>Select operator</option>{operators.map((operator) => <option key={operator.id} value={operator.id}>{operator.displayName} · {operator.email}</option>)}</select></label><button className="corporate-button-secondary" type="submit" disabled={pending}>{pending ? "Assigning…" : "Assign operator"}</button>{state.message ? <p className={`corporate-form-message corporate-form-message-${state.status}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p> : null}</form>;
}

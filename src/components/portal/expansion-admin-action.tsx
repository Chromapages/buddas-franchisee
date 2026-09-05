"use client";

import { useActionState, useState } from "react";
import { updateExpansionApplicationStageAction, type ExpansionStageActionState } from "@/src/features/portal/expansion-actions";
import { EXPANSION_STATUS, type ExpansionApplicationStatus } from "@/src/features/portal/expansion-status";

const initialState: ExpansionStageActionState = { status: "idle", message: "" };

export const ExpansionAdminAction = ({ entityId, applicationId, allowedNextStates }: { entityId: string; applicationId: string; allowedNextStates: readonly ExpansionApplicationStatus[] }) => {
  const [state, action, isPending] = useActionState(updateExpansionApplicationStageAction, initialState);
  const [nextStatus, setNextStatus] = useState(allowedNextStates[0] || "");
  if (!allowedNextStates.length) return null;
  return <form action={action} className="expansion-admin-action">
    <input type="hidden" name="entityId" value={entityId} /><input type="hidden" name="applicationId" value={applicationId} />
    <label>Next stage<select name="nextStatus" required value={nextStatus} onChange={(event) => setNextStatus(event.target.value as ExpansionApplicationStatus)}>{allowedNextStates.map((status) => <option value={status} key={status}>{EXPANSION_STATUS[status].label}</option>)}</select></label>
    {nextStatus === "BUILDOUT" ? <label>Existing Firestore unit code<input name="provisionedUnitId" required placeholder="e.g. HNL-015" /></label> : null}
    <button type="submit" disabled={isPending}>{isPending ? "Updating" : "Update stage"}</button>
    {state.status !== "idle" ? <p role={state.status === "error" ? "alert" : "status"}>{state.message}</p> : null}
  </form>;
};

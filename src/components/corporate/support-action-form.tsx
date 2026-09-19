"use client";

import { useActionState } from "react";
import { runCorporateSupportAction, type CorporateSupportActionState } from "@/src/features/corporate/support/actions";
import type { SupportCommandKind } from "@/src/features/corporate/support/model";

const initialState: CorporateSupportActionState = { status: "idle", message: "" };

export function SupportActionForm({ commandId, unitId, caseId, expectedVersion, kind, label, audience, assigneeId }: { commandId: string; unitId: string; caseId: string; expectedVersion: number; kind: SupportCommandKind; label: string; audience?: string; assigneeId?: string }) {
  const [state, action, pending] = useActionState(runCorporateSupportAction, initialState);
  const needsMessage = ["REPLY", "NOTE", "WAIT", "RESOLVE", "REOPEN"].includes(kind);
  return <form action={action} className="corporate-support-form">
    <input type="hidden" name="commandId" value={commandId} />
    <input type="hidden" name="unitId" value={unitId} />
    <input type="hidden" name="caseId" value={caseId} />
    <input type="hidden" name="expectedVersion" value={expectedVersion} />
    <input type="hidden" name="kind" value={kind} />
    {assigneeId !== undefined ? <input type="hidden" name="assigneeId" value={assigneeId} /> : null}
    {needsMessage ? <label className="corporate-field"><span>{audience || "Update details"}</span><textarea name="message" required maxLength={10000} placeholder={kind === "NOTE" ? "Visible to authorized corporate staff only" : "Write a clear update for the operator"} /></label> : null}
    <div className="corporate-form-footer">{audience ? <p><strong>Audience:</strong> {audience}</p> : <span />}
      <button className={kind === "NOTE" ? "corporate-button-secondary" : "corporate-button"} type="submit" disabled={pending}>{pending ? "Saving…" : label}</button>
    </div>
    {state.message ? <p className={`corporate-form-message corporate-form-message-${state.status}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p> : null}
  </form>;
}

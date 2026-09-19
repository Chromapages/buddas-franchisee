"use client";

import { useActionState } from "react";
import { runCorporateInquiryAction, type InquiryActionState } from "@/src/features/corporate/inquiries";

const initial: InquiryActionState = { status: "idle", message: "" };

export function InquiryActionForm({ inquiryId, expectedVersion, action, label, needsNote = false }: { inquiryId: string; expectedVersion: number; action: "claim" | "advance" | "hold" | "close" | "reroute"; label: string; needsNote?: boolean }) {
  const [state, submit, pending] = useActionState(runCorporateInquiryAction, initial);
  return <form action={submit} className="corporate-support-form">
    <input type="hidden" name="inquiryId" value={inquiryId} />
    <input type="hidden" name="expectedVersion" value={expectedVersion} />
    <input type="hidden" name="action" value={action} />
    {action === "reroute" ? <label className="corporate-field"><span>Franchise-development region ID</span><input name="regionId" required pattern="[A-Za-z0-9_-]{1,128}" placeholder="Configured region ID" /></label> : null}
    {needsNote ? <label className="corporate-field"><span>Decision note</span><textarea name="note" required minLength={8} maxLength={900} placeholder="Record the human review rationale" /></label> : null}
    <button type="submit" className={action === "close" ? "corporate-button-danger" : "corporate-button"} disabled={pending}>{pending ? "Saving…" : label}</button>
    {state.message ? <p role={state.status === "error" ? "alert" : "status"} className={`corporate-form-message corporate-form-message-${state.status}`}>{state.message}</p> : null}
  </form>;
}

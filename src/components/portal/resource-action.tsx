"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileUp, LoaderCircle } from "lucide-react";
import type { ResourceDeliveryState, ResourceRequiredAction } from "@/src/features/resources/types";

const stateCopy: Partial<Record<ResourceDeliveryState, string>> = {
  ACKNOWLEDGED: "Acknowledged",
  RETURN_SUBMITTED: "Completed document is under Corporate review.",
  CHANGES_REQUESTED: "Corporate requested changes. Upload a corrected completed document.",
  ACCEPTED: "Completed document accepted by Corporate.",
};

export function ResourceAction({ resourceId, requiredAction, responseState, dueAt }: { resourceId: string; requiredAction?: ResourceRequiredAction; responseState?: ResourceDeliveryState; dueAt?: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  if (!requiredAction || requiredAction === "NONE") return null;
  const complete = responseState === "ACKNOWLEDGED" || responseState === "ACCEPTED";
  const stateMessage = responseState ? stateCopy[responseState] : "";

  const acknowledge = async () => {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/portal/resource-acknowledgements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resourceId }) });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "The acknowledgement could not be recorded.");
      setMessage(result.message || "Acknowledgement recorded.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The acknowledgement could not be recorded.");
    } finally {
      setPending(false);
    }
  };

  const submitReturn = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { setMessage("Choose the completed document before submitting it."); return; }
    setPending(true);
    setMessage("");
    const formData = new FormData();
    formData.set("resourceId", resourceId);
    formData.set("completedDocument", file);
    try {
      const response = await fetch("/api/portal/resource-returns", { method: "POST", body: formData });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "The completed document could not be submitted.");
      setMessage(result.message || "Completed document submitted.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The completed document could not be submitted.");
    } finally {
      setPending(false);
    }
  };

  return <section className="portal-resource-action" aria-label="Required resource action">
    <div><strong>{requiredAction === "ACKNOWLEDGE" ? "Acknowledgement required" : "Completed document required"}</strong>{dueAt ? <span>Due {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(dueAt))}</span> : null}</div>
    {complete ? <p className="portal-resource-complete"><CheckCircle2 size={16} aria-hidden="true" /> {stateMessage}</p> : requiredAction === "ACKNOWLEDGE" ? <><p>Confirm that you reviewed this resource. This acknowledgement is not an electronic signature.</p><button type="button" className="btn-outline" disabled={pending} onClick={acknowledge}>{pending ? <><LoaderCircle className="animate-spin" size={15} aria-hidden="true" /> Recording…</> : "I reviewed this resource"}</button></> : <><p>{stateMessage || "Download, complete, and submit the requested operational document for Corporate review."}</p>{responseState !== "RETURN_SUBMITTED" ? <div className="portal-resource-return"><input ref={fileRef} type="file" accept="application/pdf,image/jpeg,image/png" aria-label="Completed document" /><button type="button" className="btn-outline" disabled={pending} onClick={submitReturn}>{pending ? <><LoaderCircle className="animate-spin" size={15} aria-hidden="true" /> Sending…</> : <><FileUp size={15} aria-hidden="true" /> Submit completed document</>}</button></div> : null}<small>Do not upload signed contracts, identity documents, payment information, health records, or other confidential files here.</small></>}
    {message ? <p role="status" className="portal-resource-action-message">{message}</p> : null}
  </section>;
}

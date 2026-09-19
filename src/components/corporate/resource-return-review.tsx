"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ResourceReturnReview({ resourceId, locationId, returnId }: { resourceId: string; locationId: string; returnId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  const review = async (decision: "ACCEPT" | "REQUEST_CHANGES") => {
    if (pending) return;
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/corporate/resources/review-return", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resourceId, locationId, returnId, decision, reviewNote: note }) });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "The review could not be saved.");
      setMessage(result.message || "Review saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The review could not be saved.");
    } finally {
      setPending(false);
    }
  };

  return <div className="resource-return-review">
    <label className="corporate-field"><span>Review note</span><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} rows={3} placeholder="Optional note for the store" /></label>
    <div><button type="button" className="corporate-button-secondary" disabled={pending} onClick={() => review("REQUEST_CHANGES")}>{pending ? "Saving…" : "Request changes"}</button><button type="button" className="corporate-button" disabled={pending} onClick={() => review("ACCEPT")}>{pending ? "Saving…" : "Accept completed document"}</button></div>
    {message ? <p className="corporate-form-message corporate-form-message-success" role="status">{message}</p> : null}
  </div>;
}

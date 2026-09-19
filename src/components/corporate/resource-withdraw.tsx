"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ResourceWithdraw({ resourceId, recipientCount }: { resourceId: string; recipientCount: number }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  const withdraw = async () => {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/corporate/resources/withdraw", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resourceId }) });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "The resource could not be withdrawn.");
      setMessage(result.message || "Resource withdrawn.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The resource could not be withdrawn.");
    } finally {
      setPending(false);
    }
  };

  return confirming ? <div className="resource-withdraw-confirmation" role="alert"><p>Withdraw this resource from {recipientCount} store{recipientCount === 1 ? "" : "s"}? It will disappear from their resource centers; delivery history remains available to Corporate.</p><div><button type="button" className="corporate-button-secondary" disabled={pending} onClick={() => setConfirming(false)}>Keep published</button><button type="button" className="corporate-button-danger" disabled={pending} onClick={withdraw}>{pending ? "Withdrawing…" : "Withdraw resource"}</button></div>{message ? <p className="corporate-form-message corporate-form-message-error" role="alert">{message}</p> : null}</div> : <button type="button" className="corporate-button-danger" onClick={() => setConfirming(true)}>Withdraw resource</button>;
}

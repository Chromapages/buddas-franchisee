"use client";

import { useState, useTransition } from "react";
import {
  changeCorporateAccessStatusAction,
  type CorporateAccessActionResult,
} from "@/src/features/corporate/access-actions";

type AccessStatusFormProps = {
  targetUserId: string;
  displayName: string;
  currentStatus: "ACTIVE" | "SUSPENDED" | "INVITED";
  expectedVersion: number;
};

const stableTargetKey = (value: string) => [...value].reduce((hash, character) => Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0, 2166136261).toString(36);

export function AccessStatusForm({
  targetUserId,
  displayName,
  currentStatus,
  expectedVersion,
}: AccessStatusFormProps) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<CorporateAccessActionResult | null>(null);
  const nextStatus = currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
  const operationKey = `access_${expectedVersion}_${nextStatus}_${stableTargetKey(targetUserId)}`;

  if (currentStatus === "INVITED") {
    return <p className="corporate-table-note">Invitation delivery is managed through reviewed provisioning.</p>;
  }

  return <form className="corporate-access-form" onSubmit={(event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const response = await changeCorporateAccessStatusAction(data);
      setResult(response);
      if (response.status === "success") form.reset();
    });
  }}>
    <input type="hidden" name="targetUserId" value={targetUserId} />
    <input type="hidden" name="status" value={nextStatus} />
    <input type="hidden" name="expectedVersion" value={expectedVersion} />
    <input type="hidden" name="idempotencyKey" value={operationKey} />
    <label className="corporate-field">
      <span>Reason for {nextStatus === "SUSPENDED" ? "suspension" : "reinstatement"}</span>
      <input name="reason" minLength={8} maxLength={500} required placeholder="Record the verified business reason" />
    </label>
    <label className="corporate-check-row">
      <input type="checkbox" name="confirmation" value="confirmed" required />
      <span>I reviewed {displayName}’s scope and the impact on assigned work.</span>
    </label>
    <button className={nextStatus === "SUSPENDED" ? "corporate-button-danger" : "corporate-button"} type="submit" disabled={pending}>
      {pending ? "Applying…" : nextStatus === "SUSPENDED" ? "Suspend access" : "Reinstate access"}
    </button>
    {result ? <p className={`corporate-form-message corporate-form-message-${result.status}`} role={result.status === "error" ? "alert" : "status"}>{result.message}</p> : null}
  </form>;
}

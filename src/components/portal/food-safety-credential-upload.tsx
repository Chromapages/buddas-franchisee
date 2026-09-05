"use client";

import { useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export const FoodSafetyCredentialUpload = ({ unitId }: { unitId: string }) => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;
    setMessage("");
    const form = event.currentTarget;
    startTransition(async () => {
      try {
        const response = await fetch("/api/portal/food-safety-credentials", { method: "POST", body: new FormData(form) });
        const result = await response.json() as { message?: string };
        if (!response.ok) throw new Error(result.message || "Credential submission could not be completed.");
        formRef.current?.reset();
        setMessage(result.message || "Credential submitted for review.");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Credential submission could not be completed.");
      }
    });
  };

  return <form ref={formRef} onSubmit={submit} className="account-credential-upload" encType="multipart/form-data">
    <input type="hidden" name="unitId" value={unitId} />
    <div className="account-upload-fields">
      <label>Credential type<select name="credentialType" required defaultValue=""><option value="" disabled>Select a credential</option><option value="SERVSAFE">ServSafe</option><option value="STATE_HEALTH_CERTIFICATION">State health certification</option><option value="FOOD_HANDLER_CARD">Food handler card</option></select></label>
      <label>Credential holder<input name="holderName" autoComplete="name" required maxLength={128} /></label>
      <label>Expiration date <span>(if shown)</span><input name="expiresAt" type="date" /></label>
      <label>Credential file<input name="credentialFile" type="file" accept="application/pdf,image/jpeg,image/png" required /></label>
    </div>
    <div className="account-upload-footer"><p>PDF, JPEG, or PNG up to 10 MB. Submissions remain pending until verified.</p><button type="submit" disabled={isPending}><Upload size={16} aria-hidden="true" />{isPending ? "Submitting" : "Upload credential"}</button></div>
    {message ? <p className="account-upload-message" role={message.includes("could not") || message.includes("Review") ? "alert" : "status"}>{message}</p> : null}
  </form>;
};

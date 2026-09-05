"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { signBrandStandardAction } from "@/src/features/portal/actions";

export const BrandSignoffForm = ({ unitId, signoffId, mode, defaultName }: { unitId: string; signoffId: string; mode: "DIGITAL_SIGNATURE" | "ACKNOWLEDGEMENT"; defaultName?: string }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const submit = (formData: FormData) => {
    setMessage("");
    startTransition(async () => {
      const result = await signBrandStandardAction(formData);
      setMessage(result.message);
      if (result.status === "success") router.refresh();
    });
  };

  const buttonLabel = mode === "DIGITAL_SIGNATURE" ? "Sign and acknowledge" : "Acknowledge update";
  return <form action={submit} className="account-signoff-form">
    <input type="hidden" name="unitId" value={unitId} />
    <input type="hidden" name="signoffId" value={signoffId} />
    <label>Legal name<input name="legalName" required minLength={2} maxLength={128} defaultValue={defaultName || ""} autoComplete="name" /></label>
    <label className="account-attestation"><input name="attestation" type="checkbox" value="confirmed" required /><span>I am authorized to {mode === "DIGITAL_SIGNATURE" ? "sign" : "acknowledge"} this operational standard for the working unit.</span></label>
    <button type="submit" disabled={isPending}><Check size={16} aria-hidden="true" />{isPending ? "Recording" : buttonLabel}</button>
    {message ? <p className="account-upload-message" role={message.includes("recorded") ? "status" : "alert"}>{message}</p> : null}
  </form>;
};

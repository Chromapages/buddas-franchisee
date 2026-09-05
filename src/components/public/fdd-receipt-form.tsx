"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signFddReceiptAction } from "@/src/features/fdd/actions";
import type { FddReceipt } from "@/src/features/fdd/types";
import { CheckCircle2, ShieldCheck, FileText, Lock } from "lucide-react";

export type FddReceiptFormProps = {
  receipt: FddReceipt;
};

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full py-4 text-base font-bold shadow-md hover:shadow-lg transition-all"
    >
      {pending ? "Recording Electronic Signature..." : "Sign & Acknowledge Item 23 Receipt"}
    </button>
  );
};

export const FddReceiptForm = ({ receipt }: FddReceiptFormProps) => {
  const [state, formAction] = useActionState(signFddReceiptAction, {
    status: receipt.status === "SIGNED" ? "success" : "error",
    message:
      receipt.status === "SIGNED"
        ? "This Item 23 Receipt was signed and recorded."
        : "",
    receipt,
  });

  const isSigned = state.status === "success" && state.receipt?.status === "SIGNED";

  if (isSigned) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 sm:p-10 text-emerald-950 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
          </div>
          <div>
            <h3 className="heading-compact text-emerald-950">
              Item 23 Receipt Executed Successfully
            </h3>
            <p className="text-sm text-emerald-800">
              Electronic confirmation filed with Budda&apos;s Franchising compliance team.
            </p>
          </div>
        </div>

        <div className="bg-white/80 rounded-2xl p-6 border border-emerald-100 space-y-3 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold uppercase text-emerald-700">
                Signatory Legal Name
              </span>
              <p className="font-semibold text-emerald-950 text-base">
                {state.receipt?.signatureLegalName || receipt.signatureLegalName || receipt.prospectName}
              </p>
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-emerald-700">
                Candidate Email
              </span>
              <p className="font-semibold text-emerald-950">
                {receipt.prospectEmail}
              </p>
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-emerald-700">
                FDD Document Version
              </span>
              <p className="font-semibold text-emerald-950">
                Budda&apos;s Franchise Disclosure Document (v{receipt.fddVersion})
              </p>
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-emerald-700">
                Timestamp (UTC)
              </span>
              <p className="font-semibold text-emerald-950">
                {new Date(
                  state.receipt?.signedAt || receipt.signedAt || Date.now(),
                ).toUTCString()}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-100/60 text-xs text-emerald-900 leading-relaxed">
          <strong>14-Day Mandatory Hold Notice:</strong> Under FTC regulations, no franchise agreement may be signed, and no payment or fee may be accepted by Budda&apos;s Franchising LLC, until at least 14 calendar days after the execution of this receipt.
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="bg-white border border-brand-charcoal/10 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
      <input type="hidden" name="token" value={receipt.token} />

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-sand text-brand-clay text-xs font-bold uppercase tracking-wider">
          <Lock className="w-3.5 h-3.5" aria-hidden="true" />
          Item 23 Compliance Acknowledgement
        </div>
        <h3 className="heading-compact text-brand-charcoal">
          Acknowledge &amp; Sign Receipt of FDD
        </h3>
        <p className="text-sm text-brand-charcoal/70 leading-relaxed">
          Please review the Franchise Disclosure Document (FDD v{receipt.fddVersion}) above. By completing this form, you acknowledge receipt of the disclosure document in compliance with FTC Franchise Rule (16 C.F.R. Part 436).
        </p>
      </div>

      {state.status === "error" && state.message ? (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
          {state.message}
        </div>
      ) : null}

      <div className="space-y-6">
        <div>
          <label htmlFor="legalName" className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-2">
            Full Legal Name (Electronic Signature) *
          </label>
          <input
            id="legalName"
            name="legalName"
            type="text"
            required
            defaultValue={receipt.prospectName}
            className="w-full px-4 py-3.5 bg-brand-sand/50 border border-brand-charcoal/20 rounded-xl text-base font-semibold text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-clay focus:border-brand-clay"
            placeholder="e.g. Maya Kealoha Lindqvist"
          />
        </div>

        <div className="space-y-4 pt-2 border-t border-brand-sand">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="acknowledgeEsign"
              required
              className="mt-1 w-5 h-5 rounded text-brand-clay focus:ring-brand-clay"
            />
            <span className="text-xs text-brand-charcoal/80 leading-relaxed">
              I agree to use an electronic signature and consent to the electronic delivery and receipt of the Budda&apos;s Franchise Disclosure Document pursuant to the U.S. Electronic Signatures in Global and National Commerce Act (E-SIGN).
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="acknowledgeHoldPeriod"
              required
              className="mt-1 w-5 h-5 rounded text-brand-clay focus:ring-brand-clay"
            />
            <span className="text-xs text-brand-charcoal/80 leading-relaxed">
              I understand that this receipt does not obligate me to purchase a franchise, nor does it obligate Budda&apos;s to sell a franchise, and that no binding agreement or fee will be accepted for at least 14 days following this date.
            </span>
          </label>
        </div>
      </div>

      <SubmitButton />
    </form>
  );
};

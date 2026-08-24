"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitSupportRequestAction } from "@/src/features/portal/actions";
import { CheckCircle2, HelpCircle } from "lucide-react";

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full py-4 text-base font-bold shadow-sm"
    >
      {pending ? "Submitting Ticket..." : "Submit Operations Ticket"}
    </button>
  );
};

export const SupportForm = ({ locationId }: { locationId: string }) => {
  const [state, formAction] = useActionState(submitSupportRequestAction, {
    status: "error",
    message: "",
  });

  if (state.status === "success") {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-emerald-950 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-heading">
              Support Request Created ({state.caseId})
            </h3>
            <p className="text-sm text-emerald-800">
              {state.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="bg-white border border-brand-charcoal/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <input type="hidden" name="locationId" value={locationId} />

      <div className="flex items-center gap-3 pb-4 border-b border-brand-sand">
        <div className="w-10 h-10 rounded-xl bg-brand-sand flex items-center justify-center text-brand-clay">
          <HelpCircle className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-xl font-bold font-heading text-brand-charcoal">
            Open an Operations Support Ticket
          </h3>
          <p className="text-xs text-brand-charcoal/70">
            Assigned to Budda&apos;s Field Operations &amp; Supply Logistics team.
          </p>
        </div>
      </div>

      {state.status === "error" && state.message ? (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
          {state.message}
        </div>
      ) : null}

      <div className="space-y-4">
        <div>
          <label htmlFor="topic" className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-2">
            Support Category *
          </label>
          <select
            id="topic"
            name="topic"
            required
            className="w-full px-4 py-3 bg-brand-sand/50 border border-brand-charcoal/20 rounded-xl text-sm font-semibold text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-clay"
          >
            <option value="Supply Logistics & Freight">Supply Logistics &amp; Freight</option>
            <option value="Equipment & Steam Deck Oven Maintenance">Equipment &amp; Oven Maintenance</option>
            <option value="Baking Quality & Recipe Adherence">Baking Quality &amp; Recipe Adherence</option>
            <option value="POS & Inventory Systems">POS &amp; Inventory Systems</option>
            <option value="Local Marketing & Grand Opening">Local Marketing &amp; Grand Opening</option>
          </select>
        </div>

        <div>
          <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-2">
            Subject *
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            placeholder="e.g. Steam deck gasket replacement needed"
            className="w-full px-4 py-3 bg-brand-sand/50 border border-brand-charcoal/20 rounded-xl text-sm font-semibold text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-clay"
          />
        </div>

        <div>
          <label htmlFor="details" className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-2">
            Details &amp; Urgency *
          </label>
          <textarea
            id="details"
            name="details"
            rows={4}
            required
            placeholder="Provide specific equipment serials, order numbers, or detailed symptoms..."
            className="w-full px-4 py-3 bg-brand-sand/50 border border-brand-charcoal/20 rounded-xl text-sm text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-clay"
          />
        </div>
      </div>

      <SubmitButton />
    </form>
  );
};

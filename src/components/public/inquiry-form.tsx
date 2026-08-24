"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitFranchiseInquiry } from "@/src/features/inquiry/submit";
import { initialInquiryState } from "@/src/features/inquiry/state";
import {
  investmentRangeOptions,
  preferredTimelineOptions,
} from "@/src/features/inquiry/schema";
import type { InquiryFormSession } from "@/src/features/inquiry/form-token";
import { CheckCircle2, AlertCircle, Send, RotateCcw } from "lucide-react";

export type InquiryFormProps = {
  formSession: InquiryFormSession;
  submissionToken: string;
};

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full py-4 text-base font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
    >
      {pending ? (
        "Submitting Inquiry..."
      ) : (
        <>
          <Send className="w-5 h-5" aria-hidden="true" />
          Submit Franchise Inquiry
        </>
      )}
    </button>
  );
};

export const InquiryForm = ({
  formSession: _formSession,
  submissionToken,
}: InquiryFormProps) => {
  const [state, formAction] = useActionState(
    submitFranchiseInquiry,
    initialInquiryState,
  );
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isCleared, setIsCleared] = useState(false);

  const handleReset = () => {
    formRef.current?.reset();
    setIsCleared(true);
  };

  if (state.status === "success") {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 sm:p-12 text-emerald-950 space-y-6 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-black font-heading tracking-tight">
            Aloha &amp; Mahalo!
          </h3>
          <p className="text-base text-emerald-900 leading-relaxed max-w-xl">
            {state.message}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-100/60 text-xs text-emerald-800 space-y-1">
          <p><strong>Status:</strong> Queued for Leadership Fit Review</p>
          <p><strong>Confirmation Sent:</strong> A copy has been dispatched to your provided email address.</p>
        </div>
      </div>
    );
  }

  if (state.status === "duplicate") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 sm:p-12 text-amber-950 space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
          <AlertCircle className="w-8 h-8" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold font-heading">
            Inquiry Already Received
          </h3>
          <p className="text-base text-amber-900 leading-relaxed max-w-xl">
            {state.message}
          </p>
        </div>
      </div>
    );
  }

  const errors = isCleared ? {} : state.fieldErrors || {};

  return (
    <form
      ref={formRef}
      action={formAction}
      className="bg-white border border-brand-charcoal/10 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8"
    >
      {/* Hidden Session Token & Anti-Spam Honeypot */}
      <input type="hidden" name="submissionToken" value={submissionToken} />
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Leave blank</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" && state.message ? (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          <span>{state.message}</span>
        </div>
      ) : null}

      {/* Form Fields Grid */}
      <div className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-2">
              First Name *
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              defaultValue={state.values?.firstName}
              className="w-full px-4 py-3.5 bg-brand-sand/50 border border-brand-charcoal/20 rounded-xl text-base font-semibold text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-clay focus:border-brand-clay"
              placeholder="e.g. Maya"
            />
            {errors.firstName ? (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.firstName}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-2">
              Last Name *
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              defaultValue={state.values?.lastName}
              className="w-full px-4 py-3.5 bg-brand-sand/50 border border-brand-charcoal/20 rounded-xl text-base font-semibold text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-clay focus:border-brand-clay"
              placeholder="e.g. Lindqvist"
            />
            {errors.lastName ? (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.lastName}</p>
            ) : null}
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-2">
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={state.values?.email}
              className="w-full px-4 py-3.5 bg-brand-sand/50 border border-brand-charcoal/20 rounded-xl text-base font-semibold text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-clay focus:border-brand-clay"
              placeholder="maya@example.com"
            />
            {errors.email ? (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.email}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-2">
              Phone Number *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              defaultValue={state.values?.phone}
              className="w-full px-4 py-3.5 bg-brand-sand/50 border border-brand-charcoal/20 rounded-xl text-base font-semibold text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-clay focus:border-brand-clay"
              placeholder="(808) 555-0199"
            />
            {errors.phone ? (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.phone}</p>
            ) : null}
          </div>
        </div>

        {/* Geographic Market Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="cityState" className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-2">
              Current Residence (City, State) *
            </label>
            <input
              id="cityState"
              name="cityState"
              type="text"
              required
              defaultValue={state.values?.cityState}
              className="w-full px-4 py-3.5 bg-brand-sand/50 border border-brand-charcoal/20 rounded-xl text-base font-semibold text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-clay focus:border-brand-clay"
              placeholder="e.g. Honolulu, HI or Salt Lake City, UT"
            />
            {errors.cityState ? (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.cityState}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="marketInterest" className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-2">
              Target Market or Territory *
            </label>
            <input
              id="marketInterest"
              name="marketInterest"
              type="text"
              required
              defaultValue={state.values?.marketInterest}
              className="w-full px-4 py-3.5 bg-brand-sand/50 border border-brand-charcoal/20 rounded-xl text-base font-semibold text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-clay focus:border-brand-clay"
              placeholder="e.g. North Shore, Oahu or Phoenix, AZ"
            />
            {errors.marketInterest ? (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.marketInterest}</p>
            ) : null}
          </div>
        </div>

        {/* Qualifications & Readiness */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="investmentRange" className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-2">
              Available Investment Capital *
            </label>
            <select
              id="investmentRange"
              name="investmentRange"
              required
              defaultValue={state.values?.investmentRange || investmentRangeOptions[2]}
              className="w-full px-4 py-3.5 bg-brand-sand/50 border border-brand-charcoal/20 rounded-xl text-base font-semibold text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-clay focus:border-brand-clay"
            >
              {investmentRangeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {errors.investmentRange ? (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.investmentRange}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="preferredTimeline" className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-2">
              Preferred Development Timeline *
            </label>
            <select
              id="preferredTimeline"
              name="preferredTimeline"
              required
              defaultValue={state.values?.preferredTimeline || preferredTimelineOptions[1]}
              className="w-full px-4 py-3.5 bg-brand-sand/50 border border-brand-charcoal/20 rounded-xl text-base font-semibold text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-clay focus:border-brand-clay"
            >
              {preferredTimelineOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {errors.preferredTimeline ? (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.preferredTimeline}</p>
            ) : null}
          </div>
        </div>

        {/* Experience Background */}
        <div>
          <label htmlFor="experience" className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-2">
            Relevant Restaurant, Multi-Unit, or Business Experience *
          </label>
          <textarea
            id="experience"
            name="experience"
            rows={3}
            required
            defaultValue={state.values?.experience}
            className="w-full px-4 py-3.5 bg-brand-sand/50 border border-brand-charcoal/20 rounded-xl text-sm text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-clay focus:border-brand-clay"
            placeholder="Describe your operating background, food & beverage ownership, general management, or team leadership history..."
          />
          {errors.experience ? (
            <p className="text-xs text-red-600 mt-1 font-medium">{errors.experience}</p>
          ) : null}
        </div>

        {/* Additional Message & Broker Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="sm:col-span-2">
            <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-2">
              Additional Context or Questions (Optional)
            </label>
            <textarea
              id="message"
              name="message"
              rows={2}
              defaultValue={state.values?.message}
              className="w-full px-4 py-3 bg-brand-sand/50 border border-brand-charcoal/20 rounded-xl text-sm text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-clay focus:border-brand-clay"
              placeholder="Tell us about specific sites in mind, partner backgrounds, etc."
            />
          </div>

          <div>
            <label htmlFor="brokerId" className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-2">
              Broker / FSO Referral Code (Optional)
            </label>
            <input
              id="brokerId"
              name="brokerId"
              type="text"
              defaultValue={state.values?.brokerId}
              className="w-full px-4 py-3 bg-brand-sand/50 border border-brand-charcoal/20 rounded-xl text-sm font-semibold text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-clay focus:border-brand-clay"
              placeholder="e.g. FSO-889"
            />
          </div>
        </div>

        {/* Consent Checkbox */}
        <div className="pt-2 border-t border-brand-sand">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="consent"
              name="consent"
              required
              className="mt-1 w-5 h-5 rounded text-brand-clay focus:ring-brand-clay"
            />
            <span className="text-xs text-brand-charcoal/80 leading-relaxed">
              I consent to receive franchise-related communications from Budda&apos;s Franchising LLC via email or phone. I acknowledge that submitting this form does not constitute an application, reservation of territory, or offer of a franchise.
            </span>
          </label>
          {errors.consent ? (
            <p className="text-xs text-red-600 mt-1 font-medium">{errors.consent}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
        <SubmitButton />
        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/60 hover:text-brand-charcoal py-3 px-4 flex items-center gap-1.5 focus:outline-none"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          Clear Form
        </button>
      </div>
    </form>
  );
};

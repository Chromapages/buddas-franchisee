"use client";

import { useActionState, useEffect, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { submitFranchiseInquiry } from "@/src/features/inquiry/submit";
import { initialInquiryState } from "@/src/features/inquiry/state";
import { inquiryExperienceMinimumLength, inquiryFieldNames, investmentRangeOptions, preferredTimelineOptions, validateInquiryField } from "@/src/features/inquiry/schema";
import type { InquiryFormSession } from "@/src/features/inquiry/form-token";
import type { InquiryAttribution } from "@/src/features/inquiry/types";
import { trackFunnelEvent } from "@/src/lib/analytics";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, RotateCcw, Send } from "lucide-react";

export type InquiryFormProps = { formSession: InquiryFormSession; submissionToken: string; attribution?: InquiryAttribution };
type Step = 1 | 2 | 3;
type Values = Record<(typeof inquiryFieldNames)[number], string>;
const details = {
  1: { title: "Contact Info", fields: ["firstName", "lastName", "email", "phone"] },
  2: { title: "Location & Fit", fields: ["cityState", "marketInterest", "preferredTimeline"] },
  3: { title: "Investment & Experience", fields: ["investmentRange", "experience", "message", "brokerId", "consent"] },
} as const;
const inputClass = "w-full px-4 py-3.5 bg-brand-sand/50 border-2 border-brand-charcoal/70 rounded-xl text-base font-semibold text-brand-charcoal placeholder:text-brand-charcoal/65 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-charcoal focus-visible:border-brand-charcoal";
const textClass = "w-full px-4 py-3.5 bg-brand-sand/50 border-2 border-brand-charcoal/70 rounded-xl text-sm text-brand-charcoal placeholder:text-brand-charcoal/65 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-charcoal focus-visible:border-brand-charcoal";
const selectClass = inputClass + " appearance-none pr-12";
const initialValues = (): Values => ({ firstName: "", lastName: "", email: "", phone: "", cityState: "", marketInterest: "", experience: "", investmentRange: investmentRangeOptions[2], preferredTimeline: preferredTimelineOptions[1], message: "", brokerId: "", consent: "" });

const Field = ({ label, htmlFor, required = false, error, children }: { label: string; htmlFor: string; required?: boolean; error?: string; children: ReactNode }) => <div><label htmlFor={htmlFor} className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-2">{label}{required ? <span aria-hidden="true" className="text-red-700"> *</span> : null}</label>{children}{error ? <p id={htmlFor + "-error"} role="alert" className="text-xs text-red-700 mt-1 font-medium flex items-start gap-1.5"><AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />{error}</p> : null}</div>;
const SubmitButton = () => {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="btn-primary min-h-11 w-full py-4 text-base font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-charcoal">{pending ? "Submitting Inquiry..." : <><Send className="w-5 h-5" aria-hidden="true" />Submit Franchise Inquiry</>}</button>;
};
const SelectControl = ({ children, ...props }: ComponentPropsWithoutRef<"select">) => <div className="relative"><select {...props} className={selectClass}>{children}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-charcoal" aria-hidden="true" /></div>;

export const InquiryForm = ({ formSession: _formSession, submissionToken, attribution = {} }: InquiryFormProps) => {
  const [state, formAction] = useActionState(submitFranchiseInquiry, initialInquiryState);
  const [step, setStep] = useState<Step>(1);
  const [values, setValues] = useState<Values>(initialValues);
  const [isCleared, setIsCleared] = useState(false);
  const [clientErrors, setClientErrors] = useState<Record<string, string | undefined>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const hasTrackedSuccessfulSubmission = useRef(false);
  const hasStartedForm = useRef(false);
  const errors = isCleared ? clientErrors : { ...state.fieldErrors, ...clientErrors };
  const update = (field: keyof Values, value: string) => {
    if (!hasStartedForm.current) {
      hasStartedForm.current = true;
      window.dispatchEvent(new CustomEvent("buddas:inquiry-form-started"));
    }
    setIsCleared(false);
    setValues((current) => ({ ...current, [field]: value }));
  };
  const validate = (field: (typeof inquiryFieldNames)[number], value: string) => {
    const error = validateInquiryField(field, value);
    setClientErrors((current) => ({ ...current, [field]: error }));
    return error;
  };

  useEffect(() => {
    if (state.status !== "error" || !state.values) return;
    setValues((current) => ({ ...current, ...state.values }));
    const invalidStep = ([1, 2, 3] as const).find((candidate) => details[candidate].fields.some((field) => state.fieldErrors?.[field]));
    if (invalidStep) setStep(invalidStep);
  }, [state]);

  useEffect(() => {
    stepHeadingRef.current?.focus();
    window.dispatchEvent(new CustomEvent("buddas:inquiry-step-change", { detail: { step } }));
  }, [step]);

  useEffect(() => {
    if (state.status !== "success" || hasTrackedSuccessfulSubmission.current) return;

    hasTrackedSuccessfulSubmission.current = true;
    trackFunnelEvent("franchise_inquiry_form_submitted", {
      form_version: "inquiry-prequalifier-v1",
    });
  }, [state.status]);

  const next = () => {
    let firstInvalid: (typeof inquiryFieldNames)[number] | undefined;
    const stepErrors: Record<string, string | undefined> = {};
    for (const name of details[step].fields) {
      const error = validateInquiryField(name, values[name]);
      stepErrors[name] = error;
      if (error && !firstInvalid) firstInvalid = name;
    }
    setClientErrors((current) => ({ ...current, ...stepErrors }));
    if (firstInvalid) {
      const element = formRef.current?.elements.namedItem(firstInvalid);
      if (element instanceof HTMLElement) element.focus();
      return;
    }
    setStep((current) => (current + 1) as Step);
  };
  const reset = () => {
    const defaults = initialValues();
    if (Object.entries(values).some(([field, value]) => value !== defaults[field as keyof Values]) && !window.confirm("Clear all entered information? This cannot be undone.")) return;
    setValues(initialValues()); setClientErrors({}); setStep(1); setIsCleared(true);
  };

  if (state.status === "success") return <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 sm:p-12 text-emerald-950 space-y-6 animate-in fade-in"><div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-8 h-8" aria-hidden="true" /></div><div className="space-y-2"><h2 className="heading-section text-emerald-950">Aloha &amp; Mahalo!</h2><p className="text-base text-emerald-900 leading-relaxed max-w-xl">{state.message}</p></div><div className="p-4 rounded-xl bg-emerald-100/60 text-xs text-emerald-800 space-y-1"><p><strong>Status:</strong> Queued for Leadership Fit Review</p><p><strong>Confirmation Sent:</strong> A copy has been dispatched to your provided email address.</p></div></div>;
  if (state.status === "duplicate") return <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 sm:p-12 text-amber-950 space-y-6"><div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600"><AlertCircle className="w-8 h-8" aria-hidden="true" /></div><div className="space-y-2"><h2 className="heading-compact text-amber-950">Inquiry Already Received</h2><p className="text-base text-amber-900 leading-relaxed max-w-xl">{state.message}</p></div></div>;

  const active = details[step].fields;
  return <form ref={formRef} action={formAction} onSubmit={(event) => {
    const submissionErrors: Record<string, string | undefined> = {};
    const firstInvalid = inquiryFieldNames.find((field) => {
      const error = validateInquiryField(field, values[field]);
      submissionErrors[field] = error;
      return Boolean(error);
    });
    setClientErrors((current) => ({ ...current, ...submissionErrors }));
    if (!firstInvalid) return;
    event.preventDefault();
    const invalidStep = ([1, 2, 3] as const).find((candidate) => details[candidate].fields.includes(firstInvalid as never));
    if (invalidStep) setStep(invalidStep);
    window.setTimeout(() => {
      const element = formRef.current?.elements.namedItem(firstInvalid);
      if (element instanceof HTMLElement) element.focus();
    }, 0);
  }} onBlur={(event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;
    if (inquiryFieldNames.includes(target.name as (typeof inquiryFieldNames)[number])) {
      const value = target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked ? "on" : ""
        : target.value;
      validate(target.name as (typeof inquiryFieldNames)[number], value);
    }
  }} className="inquiry-form bg-white border border-brand-charcoal/10 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
    <h2 className="sr-only">Franchise inquiry form</h2>
    <input type="hidden" name="submissionToken" value={submissionToken} />
    {Object.entries(attribution).map(([key, value]) => <input key={key} type="hidden" name={"attribution_" + key} value={value} />)}
    <div className="hidden" aria-hidden="true"><label htmlFor="website">Leave blank</label><input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
    {inquiryFieldNames.filter((field) => !active.includes(field as never)).map((field) => <input key={field} type="hidden" name={field} value={values[field]} />)}
    <p className="rounded-xl border border-brand-charcoal/10 bg-brand-sand/40 px-4 py-3 text-sm leading-relaxed text-brand-charcoal"><strong>This is an inquiry, not an application or franchise offer.</strong> It helps us begin a mutual evaluation and does not reserve a territory.</p>
    <p className="text-sm text-brand-charcoal">Fields marked with <span aria-hidden="true" className="font-bold text-red-700">*</span><span className="sr-only"> an asterisk</span> are required.</p>
    <div aria-label="Franchise inquiry progress" className="rounded-2xl border border-brand-sand bg-brand-sand/40 p-4 sm:p-5 space-y-3"><h3 ref={stepHeadingRef} tabIndex={-1} className="text-sm font-bold text-brand-charcoal focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-charcoal rounded">Step {step} of 3: {details[step].title}</h3><p aria-live="polite" className="sr-only">Step {step} of 3: {details[step].title}</p><ol className="grid grid-cols-3 gap-2" aria-label="Form steps">{([1, 2, 3] as const).map((item) => <li key={item} aria-current={item === step ? "step" : undefined} className="space-y-1"><div className={"h-1.5 rounded-full " + (item <= step ? "bg-brand-clay" : "bg-brand-charcoal/15")} /><span className={"block text-[10px] sm:text-xs font-bold uppercase tracking-wider " + (item === step ? "text-brand-charcoal" : "text-brand-charcoal/55")}>Step {item}</span></li>)}</ol></div>
    {state.status === "error" && state.message ? <div role="alert" aria-live="assertive" className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-3"><AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" /><span>{state.message}</span></div> : null}
    <div className="form-field-stack">
      {step === 1 && <><div className="form-field-grid grid grid-cols-1 sm:grid-cols-2"><Field label="First Name" htmlFor="firstName" required error={errors.firstName}><input id="firstName" name="firstName" type="text" required aria-required="true" aria-describedby={errors.firstName ? "firstName-error" : undefined} value={values.firstName} onChange={(e) => update("firstName", e.target.value)} className={inputClass} placeholder="e.g. Maya" /></Field><Field label="Last Name" htmlFor="lastName" required error={errors.lastName}><input id="lastName" name="lastName" type="text" required aria-required="true" aria-describedby={errors.lastName ? "lastName-error" : undefined} value={values.lastName} onChange={(e) => update("lastName", e.target.value)} className={inputClass} placeholder="e.g. Lindqvist" /></Field></div><div className="form-field-grid grid grid-cols-1 sm:grid-cols-2"><Field label="Email Address" htmlFor="email" required error={errors.email}><input id="email" name="email" type="email" required aria-required="true" aria-describedby={errors.email ? "email-error" : undefined} value={values.email} onChange={(e) => update("email", e.target.value)} className={inputClass} placeholder="maya@example.com" /></Field><Field label="Phone Number" htmlFor="phone" required error={errors.phone}><input id="phone" name="phone" type="tel" required aria-required="true" aria-describedby={errors.phone ? "phone-error" : undefined} value={values.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} placeholder="(808) 555-0199" /></Field></div></>}
      {step === 2 && <div className="form-field-grid grid grid-cols-1 sm:grid-cols-2"><Field label="Current Residence (City, State)" htmlFor="cityState" required error={errors.cityState}><input id="cityState" name="cityState" type="text" required aria-required="true" aria-describedby={errors.cityState ? "cityState-error" : undefined} value={values.cityState} onChange={(e) => update("cityState", e.target.value)} className={inputClass} placeholder="e.g. Honolulu, HI or Salt Lake City, UT" /></Field><Field label="Target Market or Territory" htmlFor="marketInterest" required error={errors.marketInterest}><input id="marketInterest" name="marketInterest" type="text" required aria-required="true" aria-describedby={errors.marketInterest ? "marketInterest-error" : undefined} value={values.marketInterest} onChange={(e) => update("marketInterest", e.target.value)} className={inputClass} placeholder="e.g. North Shore, Oahu or Phoenix, AZ" /></Field><Field label="Preferred Development Timeline" htmlFor="preferredTimeline" required error={errors.preferredTimeline}><SelectControl id="preferredTimeline" name="preferredTimeline" required aria-required="true" aria-describedby={errors.preferredTimeline ? "preferredTimeline-error" : undefined} value={values.preferredTimeline} onChange={(e) => update("preferredTimeline", e.target.value)}>{preferredTimelineOptions.map((option) => <option key={option} value={option}>{option}</option>)}</SelectControl></Field></div>}
      {step === 3 && <><Field label="Available Investment Capital" htmlFor="investmentRange" required error={errors.investmentRange}><SelectControl id="investmentRange" name="investmentRange" required aria-required="true" aria-describedby={errors.investmentRange ? "investmentRange-error" : undefined} value={values.investmentRange} onChange={(e) => update("investmentRange", e.target.value)}>{investmentRangeOptions.map((option) => <option key={option} value={option}>{option}</option>)}</SelectControl></Field><Field label="Describe your relevant operating experience" htmlFor="experience" required error={errors.experience}><textarea id="experience" name="experience" rows={3} required aria-required="true" aria-describedby={["experience-guidance", errors.experience ? "experience-error" : ""].filter(Boolean).join(" ")} value={values.experience} onChange={(e) => update("experience", e.target.value)} className={textClass} placeholder="Describe your operating background, food & beverage ownership, general management, or team leadership history..." /><p id="experience-guidance" className="mt-1 text-xs text-brand-charcoal">Please provide at least {inquiryExperienceMinimumLength} characters. {values.experience.length} of 700 characters entered.</p></Field><Field label="Additional Context or Questions (Optional)" htmlFor="message" error={errors.message}><textarea id="message" name="message" rows={2} aria-describedby={errors.message ? "message-error" : undefined} value={values.message} onChange={(e) => update("message", e.target.value)} className={textClass} placeholder="Tell us about specific sites in mind, partner backgrounds, etc." /></Field><section aria-labelledby="referral-information-heading" className="max-w-sm rounded-2xl border border-brand-charcoal/15 bg-brand-sand/40 p-4"><h4 id="referral-information-heading" className="text-xs font-bold uppercase tracking-wider text-brand-charcoal">Referral Information</h4><p className="mt-1 text-xs text-brand-charcoal/80">For franchise brokers and FSO partners only.</p><div className="mt-3"><Field label="Broker / FSO Referral Code (Optional)" htmlFor="brokerId" error={errors.brokerId}><input id="brokerId" name="brokerId" type="text" aria-describedby={errors.brokerId ? "brokerId-error" : undefined} value={values.brokerId} onChange={(e) => update("brokerId", e.target.value)} className={textClass} placeholder="e.g. FSO-889" /></Field></div></section><div className="pt-2 border-t border-brand-sand"><label htmlFor="consent" className="flex items-start gap-3 cursor-pointer"><input type="checkbox" id="consent" name="consent" required aria-required="true" aria-describedby={errors.consent ? "consent-error" : undefined} checked={values.consent === "on"} onChange={(e) => update("consent", e.target.checked ? "on" : "")} className="mt-1 min-h-5 min-w-5 rounded border-2 border-brand-charcoal/70 text-brand-clay focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-charcoal" /><span className="block prose-measure text-xs text-brand-charcoal leading-relaxed">I consent to receive franchise-related communications from Budda&apos;s Franchising LLC via email or phone. I acknowledge that submitting this form does not constitute an application, reservation of territory, or offer of a franchise. See our <Link href="/privacy" className="font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-charcoal rounded">Privacy Policy</Link> for details.<span aria-hidden="true" className="font-bold text-red-700"> *</span><span className="sr-only"> This consent is required.</span></span></label>{errors.consent ? <p id="consent-error" className="text-xs text-red-700 mt-1 font-medium">{errors.consent}</p> : null}</div></>}
    </div>
    <div className="inquiry-actions flex flex-col-reverse sm:flex-row items-center gap-4 pt-4">{step > 1 ? <button type="button" onClick={() => setStep((current) => (current - 1) as Step)} className="touch-target min-h-11 w-full sm:w-auto text-sm font-bold text-brand-charcoal hover:text-brand-charcoal py-3 px-4 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-charcoal rounded-xl"><ChevronLeft className="w-4 h-4" aria-hidden="true" />Back</button> : null}<div className="w-full sm:flex-1">{step < 3 ? <button type="button" onClick={next} className="btn-primary min-h-11 w-full py-4 text-base font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-charcoal">Continue <ChevronRight className="w-5 h-5" aria-hidden="true" /></button> : <SubmitButton />}</div><button type="button" onClick={reset} className="touch-target min-h-11 w-full sm:w-auto text-xs font-bold uppercase tracking-wider text-brand-charcoal hover:text-brand-charcoal py-3 px-4 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-charcoal rounded-xl"><RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />Clear Form</button></div>
  </form>;
};

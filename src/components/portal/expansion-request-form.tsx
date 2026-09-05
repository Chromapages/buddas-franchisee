"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from "lucide-react";
import { investmentRangeOptions, preferredTimelineOptions } from "@/src/features/inquiry/schema";
import { expansionApplicationSchema, expansionSiteReadinessOptions } from "@/src/features/portal/expansion-schema";
import { EXPANSION_STATUS } from "@/src/features/portal/expansion-status";
import { submitExpansionApplicationAction, type ExpansionApplicationActionState } from "@/src/features/portal/expansion-actions";

const initialState: ExpansionApplicationActionState = { status: "idle", message: "" };
const labels = { targetMarket: "Target market", preferredTimeline: "Development timeline", investmentRange: "Available investment capital", siteReadiness: "Site readiness", operatingPlan: "Operating plan" };
type Field = keyof typeof labels;

export const ExpansionRequestForm = ({ workingUnitId, workingUnitName, entityName }: { workingUnitId: string; workingUnitName: string; entityName?: string }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const reviewHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<Field | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [values, setValues] = useState({ targetMarket: "", preferredTimeline: "", investmentRange: "", siteReadiness: "", operatingPlan: "" });
  const [state, action, isPending] = useActionState(async (previous: ExpansionApplicationActionState, data: FormData): Promise<ExpansionApplicationActionState> => {
    try { return await submitExpansionApplicationAction(previous, data); }
    catch { return { status: "error", message: "We couldn’t confirm submission. Check Request status before trying again." }; }
  }, initialState);

  const update = (field: Field, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };
  const focusField = (field: Field) => (formRef.current?.elements.namedItem(field) as HTMLElement | null)?.focus();
  const edit = (field: Field = "targetMarket") => { returnFocus.current = field; setReviewing(false); };
  const startReview = () => {
    const result = expansionApplicationSchema.safeParse({ ...values, territoryAcknowledgement: "acknowledged" });
    if (!result.success) {
      const next: Partial<Record<Field, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as Field;
        if (field in labels && !next[field]) next[field] = values[field].trim() ? issue.message : "Enter or select " + labels[field].toLowerCase() + ".";
      }
      setErrors(next);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    setErrors({});
    setReviewing(true);
  };
  useEffect(() => {
    if (reviewing) reviewHeadingRef.current?.focus();
    else if (returnFocus.current) { focusField(returnFocus.current); returnFocus.current = null; }
  }, [reviewing]);
  const fieldProps = (field: Field) => ({
    id: "growth-" + field, name: field, required: true, value: values[field],
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": ["growth-" + field + "-help", errors[field] ? "growth-" + field + "-error" : ""].filter(Boolean).join(" "),
  });
  const error = (field: Field) => errors[field] ? <p id={"growth-" + field + "-error"} className="growth-field-error">{errors[field]}</p> : null;

  if (state.status === "success") return <section className="expansion-success" aria-labelledby="expansion-success-title"><CheckCircle2 size={24} aria-hidden="true" /><div><p className="dashboard-eyebrow">Request received</p><h3 id="expansion-success-title">Your growth request is submitted</h3><p role="status">{state.message}</p><dl><div><dt>Request reference</dt><dd>{state.applicationId}</dd></div><div><dt>Status at submission</dt><dd>{EXPANSION_STATUS.SUBMITTED.label}</dd></div><div><dt>Originating unit</dt><dd>{workingUnitName} ({workingUnitId})</dd></div></dl><a href="#expansion-history-title" className="growth-text-link">View request status <ArrowRight size={16} aria-hidden="true" /></a></div></section>;

  return <form ref={formRef} action={action} onSubmit={(event) => { if (!reviewing) { event.preventDefault(); startReview(); } }} className="expansion-form">
    <input type="hidden" name="reviewedUnitId" value={workingUnitId} />
    <ol className="growth-steps" aria-label="Request steps">
      <li aria-current={!reviewing ? "step" : undefined}><span aria-hidden="true">{reviewing ? <Check size={14} /> : "1"}</span>Request details</li>
      <li aria-current={reviewing ? "step" : undefined}><span aria-hidden="true">2</span>Review &amp; submit</li>
    </ol>
    <div className="growth-context"><span>Request for</span><strong>{entityName || workingUnitName}</strong><p>Originating unit: {workingUnitName} · {workingUnitId}</p></div>
    {!reviewing ? <>
      <p className="growth-required">All fields are required.</p>
      {Object.values(errors).some(Boolean) ? <div className="growth-error-summary" ref={errorRef} tabIndex={-1}><h3>Check your request details</h3><ul>{(Object.keys(labels) as Field[]).filter((field) => errors[field]).map((field) => <li key={field}><a href={"#growth-" + field} onClick={(event) => { event.preventDefault(); focusField(field); }}>{errors[field]}</a></li>)}</ul></div> : null}
      <fieldset className="growth-fieldset"><legend>Where you want to grow</legend>
        <div className="growth-field"><label htmlFor="growth-targetMarket">Target market</label><p id="growth-targetMarket-help">City, region, or trade area you want to discuss.</p><input {...fieldProps("targetMarket")} minLength={3} maxLength={120} onChange={(event) => update("targetMarket", event.target.value)} />{error("targetMarket")}</div>
        <div className="expansion-fields">
          <div className="growth-field"><label htmlFor="growth-preferredTimeline">Development timeline</label><p id="growth-preferredTimeline-help">Your preferred window to develop a location.</p><select {...fieldProps("preferredTimeline")} onChange={(event) => update("preferredTimeline", event.target.value)}><option value="" disabled>Select timing</option>{preferredTimelineOptions.map((option) => <option key={option}>{option}</option>)}</select>{error("preferredTimeline")}</div>
          <div className="growth-field"><label htmlFor="growth-siteReadiness">Site readiness</label><p id="growth-siteReadiness-help">Choose the closest match to your current plans.</p><select {...fieldProps("siteReadiness")} onChange={(event) => update("siteReadiness", event.target.value)}><option value="" disabled>Select site status</option>{expansionSiteReadinessOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{error("siteReadiness")}</div>
        </div>
      </fieldset>
      <fieldset className="growth-fieldset"><legend>How you’ll support another unit</legend>
        <div className="growth-field growth-capital"><label htmlFor="growth-investmentRange">Available investment capital</label><p id="growth-investmentRange-help">Your self-reported range for this proposed location.</p><select {...fieldProps("investmentRange")} onChange={(event) => update("investmentRange", event.target.value)}><option value="" disabled>Select a range</option>{investmentRangeOptions.map((option) => <option key={option}>{option}</option>)}</select>{error("investmentRange")}</div>
        <div className="growth-field"><label htmlFor="growth-operatingPlan">Operating plan</label><p id="growth-operatingPlan-help">Describe leadership coverage, how this location fits your current operation, and any site details. Use 20–1,200 characters; leave out bank, card, and Tax ID information.</p><textarea {...fieldProps("operatingPlan")} minLength={20} maxLength={1200} rows={5} onChange={(event) => update("operatingPlan", event.target.value)} />{error("operatingPlan")}<p className="growth-character-count">{values.operatingPlan.length.toLocaleString("en-US")} / 1,200 characters</p></div>
      </fieldset>
      <div key="details-actions" className="expansion-form-actions"><p>You’ll check your answers before submitting.</p><button type="button" onClick={startReview}>Review request <ArrowRight size={16} aria-hidden="true" /></button></div>
    </> : <>
      {Object.entries(values).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
      <section className="expansion-review" aria-labelledby="expansion-review-title"><h3 ref={reviewHeadingRef} tabIndex={-1} id="expansion-review-title">Check your request</h3><p>Confirm the details below. You can change any answer.</p><dl>{(Object.keys(labels) as Field[]).map((field) => <div key={field}><dt>{labels[field]}</dt><dd>{field === "siteReadiness" ? expansionSiteReadinessOptions.find((option) => option.value === values[field])?.label : values[field]}</dd><dd><button type="button" disabled={isPending} onClick={() => edit(field)}>Change<span className="sr-only"> {labels[field].toLowerCase()}</span></button></dd></div>)}</dl></section>
      <label className="expansion-acknowledgement"><input type="checkbox" name="territoryAcknowledgement" value="acknowledged" required disabled={isPending} /><span>I understand this is a request for review, not an application approval, franchise offer, or territory reservation.</span></label>
      {state.status === "error" ? <p className="expansion-form-error" role="alert">{state.message}</p> : null}
      <div key="review-actions" className="expansion-form-actions"><button type="button" className="expansion-back" disabled={isPending} onClick={() => edit()}><ArrowLeft size={16} aria-hidden="true" />Back to details</button><button type="submit" disabled={isPending}>{isPending ? "Submitting request…" : "Submit growth request"}<ArrowRight size={16} aria-hidden="true" /></button></div>
    </>}
  </form>;
};

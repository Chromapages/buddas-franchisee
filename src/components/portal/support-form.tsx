"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitSupportRequestAction } from "@/src/features/portal/actions";
import { SUPPORT_TOPICS, SUPPORT_SUBJECT_LIMIT, SUPPORT_DETAILS_LIMIT, SUPPORT_IMPACTS, type SupportImpact } from "@/src/features/portal/support-form-options";
import { AlertCircle, ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ClipboardList, Headphones, MapPin, Send, TimerReset } from "lucide-react";

export const SupportForm = ({ locationId, locationName, initialOrderId, onBack }: { locationId: string; locationName: string; initialOrderId?: string; onBack?: () => void }) => {
  const creationIds = useRef(new Map<string, string>());
  const [state, formAction, pending] = useActionState(async (previous: Awaited<ReturnType<typeof submitSupportRequestAction>>, formData: FormData) => {
    const key = JSON.stringify([...formData.entries()]);
    const requestId = creationIds.current.get(key) || crypto.randomUUID();
    creationIds.current.set(key, requestId);
    formData.set("requestId", requestId);
    return submitSupportRequestAction(previous, formData);
  }, { status: "error", message: "" });
  const [topic, setTopic] = useState(initialOrderId ? "Supply Logistics & Freight" : "");
  const [subject, setSubject] = useState(initialOrderId ? `Fulfillment update for order ${initialOrderId}` : "");
  const [details, setDetails] = useState(initialOrderId ? `Requesting a fulfillment update for order ${initialOrderId}, which is processing beyond its stated fulfillment window.` : "");
  const [impact, setImpact] = useState<SupportImpact>(SUPPORT_IMPACTS[0]);
  const [attempted, setAttempted] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const selectedTopic = SUPPORT_TOPICS.find((option) => option.value === topic);
  const subjectError = attempted && !subject.trim();
  const detailsError = attempted && !details.trim();
  const topicError = attempted && !topic;
  const invalid = !topic || !subject.trim() || !details.trim();

  useEffect(() => {
    if (state.status === "success") successRef.current?.focus();
    else if (state.message) errorRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <section className="support-created">
        <CheckCircle2 size={28} aria-hidden="true" />
        <h2 ref={successRef} tabIndex={-1}>Your support ticket is open</h2>
        <p>Filed for <strong>{locationName}</strong> · Unit {locationId}</p>
        <dl><div><dt>Ticket reference</dt><dd>{state.caseId}</dd></div><div><dt>Subject</dt><dd>{subject}</dd></div></dl>
        <p>Open the ticket to review its status, see responses, and add more details.</p>
        <a className="btn-primary" href={"/portal/support?ticketId=" + encodeURIComponent(state.caseId)}>View ticket <ArrowRight size={18} aria-hidden="true" /></a>
      </section>
    );
  }

  return (
    <div className="support-intake">
      <button type="button" onClick={onBack} className="support-intake-back"><ArrowLeft aria-hidden="true" />Back to support</button>
      <header className="support-intake-heading"><p>Operations Support</p><h2>Open a support request</h2><span>Share the issue and operational impact so we can route it to the right team.</span></header>
      <form action={formAction} className="support-compose support-intake-form" noValidate onSubmit={(event) => {
      setAttempted(true);
      if (invalid || pending) {
        event.preventDefault();
        requestAnimationFrame(() => errorRef.current?.focus());
      }
    }}>
      <input type="hidden" name="locationId" value={locationId} />
      {initialOrderId ? <input type="hidden" name="relatedOrderId" value={initialOrderId} /> : null}
      <div className="support-intake-main">
      <section className="support-intake-card" aria-labelledby="support-details-title">
      <header className="support-compose-header"><div><h3 id="support-details-title">Request details</h3><p>Share what happened so we can route this to the right people.</p></div></header>
      {(attempted && invalid) || state.message ? (
        <div className="support-form-error" ref={errorRef} tabIndex={-1} role="alert">
          <AlertCircle size={20} aria-hidden="true" />
          <div><strong>{attempted && invalid ? "Check the fields below" : "Your ticket needs attention"}</strong>
            <p>{attempted && invalid ? "Choose a topic and add a subject and issue description." : state.message}</p>
          </div>
        </div>
      ) : null}
        <div className="support-compose-fields">
          <div className="support-field">
            <label htmlFor="topic">Support area</label>
            <p id="topic-hint">Choose the area that best matches your request.</p>
            {topicError ? <p className="support-field-error" id="topic-error">Choose a support topic.</p> : null}
            <select id="topic" name="topic" value={topic} onChange={(event) => setTopic(event.target.value)} required disabled={pending} aria-invalid={topicError || undefined} aria-describedby={"topic-hint" + (topicError ? " topic-error" : "")}>
              <option value="">Select a support topic</option>
              {SUPPORT_TOPICS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div className="support-field">
            <label htmlFor="impact">Operational impact</label>
            <p id="impact-hint">Tell us how urgently this affects the unit.</p>
            <select id="impact" name="impact" value={impact} onChange={(event) => setImpact(event.target.value as SupportImpact)} disabled={pending} aria-describedby="impact-hint">
              {SUPPORT_IMPACTS.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>
          <div className="support-field">
            <label htmlFor="subject">Subject</label>
            <p id="subject-hint">A short summary that helps identify the issue later.</p>
            {subjectError ? <p className="support-field-error" id="subject-error">Enter a subject.</p> : null}
            <input id="subject" name="subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={SUPPORT_SUBJECT_LIMIT} required readOnly={pending} aria-invalid={subjectError || undefined} aria-describedby={"subject-hint" + (subjectError ? " subject-error" : "")} placeholder="For example: Two cases missing from our supply delivery" />
          </div>
          <div className="support-field">
            <label htmlFor="details">Describe the issue</label>
            <p id="details-hint">{selectedTopic?.hint || "Explain what happened, when it started, and how it affects your unit."}</p>
            {detailsError ? <p className="support-field-error" id="details-error">Describe the issue so Operations Support can help.</p> : null}
            <textarea id="details" name="details" rows={6} value={details} onChange={(event) => setDetails(event.target.value)} maxLength={SUPPORT_DETAILS_LIMIT} required readOnly={pending} aria-invalid={detailsError || undefined} aria-describedby={"details-hint details-count" + (detailsError ? " details-error" : "")} />
            <span id="details-count" className="support-character-count">{details.length.toLocaleString()} / {SUPPORT_DETAILS_LIMIT.toLocaleString()} characters</span>
          </div>
        </div>
      <footer className="support-compose-footer">
        <button type="button" onClick={onBack} className="support-intake-secondary"><ArrowLeft aria-hidden="true" />Back</button>
        <button type="submit" disabled={pending} className="btn-primary"><Send size={17} aria-hidden="true" />{pending ? "Creating request…" : "Create request"}<ArrowRight size={17} aria-hidden="true" /></button>
      </footer>
      </section>
      <aside className="support-intake-summary" aria-labelledby="request-summary-title">
        <header><h3 id="request-summary-title">Request summary</h3><p>Review the information that will be sent to Operations Support.</p></header>
        <dl>
          <div><ClipboardList aria-hidden="true" /><dt>Support area</dt><dd>{selectedTopic?.label || "Not selected"}</dd></div>
          <div><TimerReset aria-hidden="true" /><dt>Operational impact</dt><dd>{impact}</dd></div>
          <div><MapPin aria-hidden="true" /><dt>Store</dt><dd>{locationName}<small>{locationId}</small></dd></div>
          {initialOrderId ? <div><ClipboardList aria-hidden="true" /><dt>Related order</dt><dd>{initialOrderId}</dd></div> : null}
        </dl>
        <section className="support-intake-assistance"><Headphones aria-hidden="true" /><div><h4>Immediate assistance</h4><p>If this issue is blocking normal operations, call Budda&rsquo;s support team.</p><a href="tel:+18017010617">(801) 701-0617</a></div></section>
        <section className="support-intake-next"><h4>What happens next?</h4><ol><li>We&rsquo;ll create your request and route it to the right team.</li><li>You&rsquo;ll receive a ticket number.</li><li>Replies and status updates will appear in Support.</li></ol></section>
        <a className="support-intake-resources" href="/portal/resources"><BookOpen aria-hidden="true" /><span><strong>Browse guides &amp; SOPs</strong><small>Find helpful resources while you wait.</small></span><ArrowRight aria-hidden="true" /></a>
      </aside>
      </div>
      <span className="sr-only" role="status" aria-live="polite">{pending ? "Creating your support ticket. Please wait." : ""}</span>
      </form>
    </div>
  );
};

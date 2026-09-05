"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitSupportRequestAction } from "@/src/features/portal/actions";
import { SUPPORT_TOPICS, SUPPORT_SUBJECT_LIMIT, SUPPORT_DETAILS_LIMIT } from "@/src/features/portal/support-form-options";
import { AlertCircle, ArrowRight, CheckCircle2, Store, Send } from "lucide-react";

export const SupportForm = ({ locationId, locationName }: { locationId: string; locationName: string }) => {
  const [state, formAction, pending] = useActionState(submitSupportRequestAction, { status: "error", message: "" });
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
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
    <form action={formAction} className="support-compose" noValidate onSubmit={(event) => {
      setAttempted(true);
      if (invalid || pending) {
        event.preventDefault();
        requestAnimationFrame(() => errorRef.current?.focus());
      }
    }}>
      <input type="hidden" name="locationId" value={locationId} />
      <header className="support-compose-header">
        <div><p className="support-kicker">Operations Support</p><h2>Open a support ticket</h2><p>Tell us what’s happening and what help you need.</p></div>
        <span className="support-required">All fields are required</span>
      </header>
      {(attempted && invalid) || state.message ? (
        <div className="support-form-error" ref={errorRef} tabIndex={-1} role="alert">
          <AlertCircle size={20} aria-hidden="true" />
          <div><strong>{attempted && invalid ? "Check the fields below" : "Your ticket needs attention"}</strong>
            <p>{attempted && invalid ? "Choose a topic and add a subject and issue description." : state.message}</p>
          </div>
        </div>
      ) : null}
      <div className="support-compose-grid">
        <div className="support-compose-fields">
          <div className="support-field">
            <label htmlFor="topic">What do you need help with?</label>
            <p id="topic-hint">Choose the topic that best matches your request.</p>
            {topicError ? <p className="support-field-error" id="topic-error">Choose a support topic.</p> : null}
            <select id="topic" name="topic" value={topic} onChange={(event) => setTopic(event.target.value)} required disabled={pending} aria-invalid={topicError || undefined} aria-describedby={"topic-hint" + (topicError ? " topic-error" : "")}>
              <option value="">Select a support topic</option>
              {SUPPORT_TOPICS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
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
        <section className="support-compose-context" aria-labelledby="support-unit-title">
          <div className="support-unit-panel"><Store size={20} aria-hidden="true" /><div><h3 id="support-unit-title">Ticket for</h3><p>{locationName}</p><span>Unit {locationId}</span></div></div>
          <div className="support-writing-guide">
            <h3>Help us understand the issue</h3>
            <ul><li>Describe what happened and when.</li><li>Explain the effect on your operation.</li><li>Include relevant order or equipment references.</li><li>Tell us what you’ve already tried.</li></ul>
          </div>
          <div className="support-next"><h3>After you submit</h3><p>You’ll receive a ticket reference. Follow the conversation and add updates from Operations Support.</p></div>
        </section>
      </div>
      <footer className="support-compose-footer">
        <p>This request will be filed for <strong>{locationName}</strong> ({locationId}).</p>
        <button type="submit" disabled={pending} className="btn-primary"><Send size={17} aria-hidden="true" />{pending ? "Creating ticket…" : "Create support ticket"}</button>
      </footer>
      <span className="sr-only" role="status" aria-live="polite">{pending ? "Creating your support ticket. Please wait." : ""}</span>
    </form>
  );
};

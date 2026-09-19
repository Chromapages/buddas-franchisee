"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CorporateLocation } from "@/src/features/corporate/types";
import { RESOURCE_CATEGORIES, type CorporateResourcePublication, type ResourceRequiredAction } from "@/src/features/resources/types";

const choices = [
  { value: "NONE", label: "Just share it", hint: "Stores can read and download the document." },
  { value: "ACKNOWLEDGE", label: "Ask them to confirm they read it", hint: "Track which stores have confirmed." },
  { value: "RETURN_DOCUMENT", label: "Ask them to complete and return it", hint: "Review each completed document and request changes if needed." },
] as const;
const localDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export function ResourcePublicationForm({ locations, initial }: { locations: CorporateLocation[]; initial?: CorporateResourcePublication }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(initial?.title || "");
  const [titleEdited, setTitleEdited] = useState(Boolean(initial?.title));
  const [category, setCategory] = useState(initial?.category || RESOURCE_CATEGORIES[0]);
  const [version, setVersion] = useState(initial?.version || "v1.0");
  const [instructions, setInstructions] = useState(initial?.instructions || "");
  const [dueAt, setDueAt] = useState(localDate(initial?.dueAt));
  const [requiredAction, setRequiredAction] = useState<ResourceRequiredAction>(initial?.requiredAction || "NONE");
  const [selected, setSelected] = useState(new Set(initial?.locationIds || []));
  const [query, setQuery] = useState("");
  const [resourceId, setResourceId] = useState(initial?.id || "");
  const [fileName, setFileName] = useState(initial?.document?.filename || "");
  const [savedFile, setSavedFile] = useState(Boolean(initial?.document));
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [titleTouched, setTitleTouched] = useState(false);
  const matches = locations.filter((store) => [store.name, store.code, store.market].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  const selectedStores = locations.filter((store) => selected.has(store.id));
  const allSelected = matches.length > 0 && matches.every((store) => selected.has(store.id));
  const fail = (text: string) => { setError(true); setMessage(text); };
  const go = (next: number) => { setStep(next); setMessage(""); requestAnimationFrame(() => headingRef.current?.focus()); };
  const validateDocument = () => {
    setTitleTouched(true);
    if (!title.trim() || !version.trim()) { fail("Add a document title and version before continuing."); return false; }
    if (!fileName) { fail("Choose a document before continuing. You can still save for later."); return false; }
    return true;
  };
  const save = async (intent: "DRAFT" | "PUBLISH") => {
    if (pending) return;
    if (!title.trim()) { setTitleTouched(true); fail("Give your document a title so you can find it later."); return; }
    if (intent === "PUBLISH" && (!validateDocument() || !selectedStores.length)) return;
    const data = new FormData();
    Object.entries({ resourceId, intent, title, category, version, requiredAction, instructions, dueAt: requiredAction !== "NONE" && dueAt ? new Date(dueAt).toISOString() : "" }).forEach(([key, value]) => data.set(key, value));
    selectedStores.forEach((store) => data.append("locationIds", store.id));
    const file = fileRef.current?.files?.[0];
    if (file && !savedFile) data.set("document", file);
    setPending(true); setMessage("");
    try {
      const response = await fetch("/api/corporate/resources/publish", { method: "POST", body: data });
      const result = await response.json() as { id?: string; message?: string };
      if (!response.ok || !result.id) throw new Error(result.message || "Your document could not be saved. Your entries are still here.");
      setResourceId(result.id); setSavedFile(Boolean(fileName)); setError(false);
      if (intent === "DRAFT") setMessage("Draft saved. You can continue now or return to it from Resources.");
      else { router.push("/corporate/resources/" + encodeURIComponent(result.id)); router.refresh(); }
    } catch (cause) { fail(cause instanceof Error ? cause.message : "Your document could not be saved. Your entries are still here."); }
    finally { setPending(false); }
  };

  return <form className="corporate-support-form resource-publication-form" onSubmit={(event) => event.preventDefault()}>
    <ol className="location-lifecycle-stepper" aria-label="Send a document progress">
      {["Add document", "Choose stores", "Review & send"].map((label, index) => <li key={label} className={step === index + 1 ? "is-current" : step > index + 1 ? "is-complete" : ""} aria-current={step === index + 1 ? "step" : undefined}><span>{index + 1}</span><strong>{label}</strong></li>)}
    </ol>
    <h3 ref={headingRef} tabIndex={-1}>{step === 1 ? "1. Add your document" : step === 2 ? "2. Choose stores and what they need to do" : "3. Review and send"}</h3>
    <fieldset hidden={step !== 1} disabled={pending} className="resource-step-fields">
      <legend className="sr-only">Add your document</legend>
      <label className="corporate-field"><span>Choose file</span><input ref={fileRef} type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type) || file.size > 10 * 1024 * 1024 || !file.size) { event.target.value = ""; fail("Choose a PDF, JPEG, or PNG up to 10 MB."); return; }
        setFileName(file.name); setSavedFile(false); setMessage("");
        if (!titleEdited) setTitle(file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").slice(0, 160));
      }} /><small>PDF, JPEG, or PNG up to 10 MB. Only non-sensitive operating documents.</small>{fileName ? <small>Selected document: {fileName}</small> : null}</label>
      <label className="corporate-field"><span>Document title *</span><input value={title} maxLength={160} onChange={(event) => { setTitle(event.target.value); setTitleEdited(true); }} onBlur={() => setTitleTouched(true)} aria-invalid={titleTouched && !title.trim() || undefined} aria-describedby={titleTouched && !title.trim() ? "resource-title-error" : undefined} />{titleTouched && !title.trim() ? <small id="resource-title-error" className="corporate-field-error">Give your document a title.</small> : <small>Suggested from the filename. Change it to something stores will recognize.</small>}</label>
      <details className="corporate-catalog-description"><summary>More details</summary><label className="corporate-field"><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value as typeof category)}>{RESOURCE_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label><label className="corporate-field"><span>Version</span><input value={version} maxLength={32} onChange={(event) => setVersion(event.target.value)} /><small>Starts at v1.0 for a new document.</small></label></details>
    </fieldset>
    <fieldset hidden={step !== 2} disabled={pending} className="resource-step-fields">
      <legend className="sr-only">Stores and response</legend>
      <div className="resource-recipient-toolbar"><label className="corporate-field"><span>Find a store</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Store name, code, or market" /></label><button type="button" className="corporate-button-secondary" disabled={!matches.length} onClick={() => setSelected((current) => { const next = new Set(current); matches.forEach((store) => allSelected ? next.delete(store.id) : next.add(store.id)); return next; })}>{allSelected ? "Clear matching stores" : "Select all matching stores"}</button><output aria-live="polite">{selectedStores.length} stores selected</output></div>
      <div className="resource-recipient-list">{matches.map((store) => <label className="resource-recipient-row" key={store.id}><input type="checkbox" checked={selected.has(store.id)} onChange={() => setSelected((current) => { const next = new Set(current); next.has(store.id) ? next.delete(store.id) : next.add(store.id); return next; })} /><span><strong>{store.name}</strong><small>{store.code}</small></span></label>)}{!matches.length ? <p className="resource-recipient-empty">{locations.length ? "No stores match your search." : "No stores are available to your account. Contact Corporate support for help."}</p> : null}</div>
      <fieldset className="resource-step-fields"><legend>What should stores do?</legend>{choices.map((choice) => <label className="resource-recipient-row" key={choice.value}><input type="radio" name="response-choice" value={choice.value} checked={requiredAction === choice.value} onChange={() => setRequiredAction(choice.value)} /><span><strong>{choice.label}</strong><small>{choice.hint}</small></span></label>)}</fieldset>
      <label className="corporate-field"><span>What do stores need to know? (optional)</span><textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} maxLength={1000} rows={4} /></label>
      {requiredAction !== "NONE" ? <label className="corporate-field"><span>When is it due? (optional)</span><input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} /><small>Uses your device's local time.</small></label> : null}
      {requiredAction === "RETURN_DOCUMENT" ? <p className="resource-publication-warning">Use this for non-sensitive completed documents. Signed contracts and confidential paperwork need a secure signing service, which is not connected yet.</p> : null}
    </fieldset>
    {step === 3 ? <section className="resource-publication-review"><strong>Send {title}</strong><p>To {selectedStores.map((store) => store.name).join(", ")}.</p><p>{requiredAction === "NONE" ? "Stores can read and download it. No response is needed." : requiredAction === "ACKNOWLEDGE" ? "Each store must confirm they read it." : "Each store must complete and return the document."}{requiredAction !== "NONE" && dueAt ? " Due " + new Date(dueAt).toLocaleString() + "." : ""}</p><p>File: {fileName} · {version}</p>{instructions ? <p>{instructions}</p> : null}<p>Appears in each store’s portal. No email is sent.</p></section> : null}
    <div className="resource-publication-actions">
      {step > 1 ? <button type="button" className="corporate-text-link" disabled={pending} onClick={() => go(step - 1)}>Back</button> : null}
      <button type="button" className="corporate-button-secondary" disabled={pending} onClick={() => save("DRAFT")}>{pending ? "Saving…" : "Save for later"}</button>
      <button type="button" className="corporate-button" disabled={pending || step === 2 && !selectedStores.length} onClick={() => { if (step === 1) { if (validateDocument()) go(2); } else if (step === 2) go(3); else void save("PUBLISH"); }}>{pending ? "Saving…" : step === 1 ? "Continue to stores" : step === 2 ? "Review before sending" : "Send to " + selectedStores.length + (selectedStores.length === 1 ? " store" : " stores")}</button>
    </div>
    {message ? <p role={error ? "alert" : "status"} className={"corporate-form-message corporate-form-message-" + (error ? "error" : "success")}>{message}</p> : null}
  </form>;
}

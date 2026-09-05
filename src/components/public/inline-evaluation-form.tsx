"use client";

import Link from "next/link";
import { useState } from "react";
import { trackFunnelEvent } from "@/src/lib/analytics";

const HANDOFF_KEY = "franchise-inline-qualification-v1";
const capital = ["Under $150K", "$150K – $399K", "$400K+"];
const netWorth = ["Under $400K", "$400K – $999K", "$1M+"];
type Values = { name: string; email: string; phone: string; liquidCapital: string; netWorth: string };
const empty: Values = { name: "", email: "", phone: "", liquidCapital: "", netWorth: "" };

export const InlineEvaluationForm = () => {
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const update = (field: keyof Values, value: string) => setValues((current) => ({ ...current, [field]: value }));
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Partial<Record<keyof Values, string>> = {};
    if (!values.name.trim()) next.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Enter a valid email.";
    if (!values.phone.trim()) next.phone = "Enter your phone number.";
    if (!values.liquidCapital) next.liquidCapital = "Select a range.";
    if (!values.netWorth) next.netWorth = "Select a range.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    trackFunnelEvent("cta_button_tap");
    window.sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(values));
    window.setTimeout(() => { setLoading(false); setComplete(true); trackFunnelEvent("inline_qualification_complete"); }, 250);
  };
  if (complete) return <div className="rounded-xl bg-white/10 p-4 text-left"><p className="font-semibold text-bds-cream">Thanks — continue to full qualification to submit your inquiry.</p><Link href="/franchise/contact" className="mt-3 touch-target inline-flex items-center justify-center rounded-lg bg-bds-gold px-4 py-2 text-sm font-bold text-bds-teal-ink">Continue to qualification</Link></div>;
  return <form onSubmit={submit} className="grid gap-3 text-left sm:grid-cols-2">
    {([['name','Name'],['email','Email'],['phone','Phone']] as const).map(([field,label]) => <label key={field} className="text-xs text-bds-cream/90">{label}<input value={values[field]} onChange={(e) => update(field, e.target.value)} className="mt-1 w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white" />{errors[field] ? <span className="mt-1 block text-xs text-bds-gold">{errors[field]}</span> : null}</label>)}
    <label className="text-xs text-bds-cream/90">Liquid capital range<select value={values.liquidCapital} onChange={(e) => update("liquidCapital", e.target.value)} className="mt-1 w-full rounded-lg border border-white/30 bg-bds-teal-dark px-3 py-2 text-sm text-white"><option value="">Select range</option>{capital.map((x) => <option key={x}>{x}</option>)}</select>{errors.liquidCapital ? <span className="mt-1 block text-xs text-bds-gold">{errors.liquidCapital}</span> : null}</label>
    <label className="text-xs text-bds-cream/90">Net-worth range<select value={values.netWorth} onChange={(e) => update("netWorth", e.target.value)} className="mt-1 w-full rounded-lg border border-white/30 bg-bds-teal-dark px-3 py-2 text-sm text-white"><option value="">Select range</option>{netWorth.map((x) => <option key={x}>{x}</option>)}</select>{errors.netWorth ? <span className="mt-1 block text-xs text-bds-gold">{errors.netWorth}</span> : null}</label>
    <button type="submit" disabled={loading} className="touch-target min-h-12 sm:col-span-2 rounded-xl bg-bds-gold px-4 py-3 text-sm font-bold text-bds-teal-ink disabled:opacity-60">{loading ? "Saving your details…" : "Continue to qualification"}</button>
  </form>;
};

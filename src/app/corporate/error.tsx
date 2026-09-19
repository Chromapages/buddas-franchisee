"use client";

import { AlertCircle } from "lucide-react";

export default function CorporateError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="corporate-state corporate-error-state" role="alert"><AlertCircle size={23} aria-hidden="true" /><div><h1>Corporate workspace could not be displayed</h1><p>Your draft and existing records were not changed. Try the authorized request again.</p></div><button type="button" className="corporate-button-secondary" onClick={reset}>Try again</button></section>;
}

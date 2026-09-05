"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function PortalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Route errors are intentionally not rendered with internal details.
    void error;
  }, [error]);

  return (
    <div role="alert" className="max-w-3xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
      <AlertCircle className="h-7 w-7 text-red-600" aria-hidden="true" />
      <h2 className="mt-3 text-xl font-bold text-bds-teal-dark">Current workspace data is unavailable</h2>
      <p className="mt-2 text-sm text-bds-cocoa/80">No cached workspace data is being shown. Try again, or contact Operations Support if this continues.</p>
      <button type="button" onClick={reset} className="btn-primary mt-5 text-xs font-bold uppercase tracking-wider">Try again</button>
    </div>
  );
}

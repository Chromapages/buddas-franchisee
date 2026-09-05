"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";

export const DashboardRefresh = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState("");
  const hasRequestedRefresh = useRef(false);

  useEffect(() => {
    if (isPending) {
      setStatusMessage("Refreshing workspace data.");
    } else if (hasRequestedRefresh.current) {
      setStatusMessage("Refresh finished. Any unavailable sections show recovery options.");
    }
  }, [isPending]);

  const handleRefresh = () => {
    hasRequestedRefresh.current = true;
    startTransition(() => router.refresh());
  };

  return (
    <div className="flex shrink-0 items-center">
      <button
        type="button"
        tabIndex={0}
        onClick={handleRefresh}
        disabled={isPending}
        className="touch-target-inline inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-bds-cocoa/70 hover:text-bds-teal-dark"
        aria-label="Request the latest available workspace data"
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
        {isPending ? "Refreshing" : "Refresh data"}
      </button>
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{statusMessage}</span>
    </div>
  );
};

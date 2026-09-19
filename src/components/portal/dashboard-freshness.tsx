"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { DASHBOARD_AUTO_REFRESH_MS, DASHBOARD_STALE_AFTER_MS } from "@/src/features/portal/dashboard-data-state";
import { trackOperatorWorkspaceEvent } from "@/src/lib/analytics";
import { usePortalContext } from "@/src/features/portal/portal-context";

export type DashboardFreshnessProps = {
  updatedAt?: string;
  updatedLabel?: string;
  failedModules: string[];
  moduleCount: number;
  staleAfterMs?: number;
  autoRefreshMs?: number;
};

type LastSuccessfulUpdate = { timestamp: string; label: string };

export const DashboardFreshness = ({
  updatedAt,
  updatedLabel,
  failedModules,
  moduleCount,
  staleAfterMs = DASHBOARD_STALE_AFTER_MS,
  autoRefreshMs = DASHBOARD_AUTO_REFRESH_MS,
}: DashboardFreshnessProps) => {
  const router = useRouter();
  const { user, permittedUnits } = usePortalContext();
  const analyticsContext = { role_category: user.role === "admin" ? "admin" as const : "franchisee" as const, location_scope_count: permittedUnits.length };
  const rootRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isOffline, setIsOffline] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [lastSuccessfulUpdate, setLastSuccessfulUpdate] = useState<LastSuccessfulUpdate | null>(() => updatedAt ? { timestamp: updatedAt, label: updatedLabel || "Update time unavailable" } : null);
  const refreshInFlight = useRef(false);
  const refreshMode = useRef<"manual" | "background" | null>(null);
  const onlineRef = useRef(true);
  const refreshTimeout = useRef<number | null>(null);
  const reportedDataState = useRef<string | null>(null);

  const refresh = useCallback((mode: "manual" | "background") => {
    // Both responsive views are server rendered; only the visible view polls.
    if (!rootRef.current?.getClientRects().length) return;
    if (!onlineRef.current || isPending || refreshInFlight.current || document.visibilityState !== "visible") return;
    if (mode === "manual") trackOperatorWorkspaceEvent("operator_dashboard_refreshed", { ...analyticsContext, route: "/portal" });
    refreshInFlight.current = true;
    refreshMode.current = mode;
    if (refreshTimeout.current) window.clearTimeout(refreshTimeout.current);
    refreshTimeout.current = window.setTimeout(() => {
      refreshInFlight.current = false;
      refreshMode.current = null;
    }, 15_000);
    startTransition(() => router.refresh());
  }, [analyticsContext.location_scope_count, analyticsContext.role_category, isPending, router]);

  useEffect(() => {
    const syncConnection = () => {
      const wasOnline = onlineRef.current;
      const offline = !navigator.onLine;
      onlineRef.current = !offline;
      setIsOffline(offline);
      if (!offline && !wasOnline && document.visibilityState === "visible") refresh("background");
    };
    const onVisible = () => {
      if (document.visibilityState === "visible" && onlineRef.current) refresh("background");
    };
    syncConnection();
    window.addEventListener("online", syncConnection);
    window.addEventListener("offline", syncConnection);
    document.addEventListener("visibilitychange", onVisible);
    const ageTimer = window.setInterval(() => setNow(Date.now()), 30_000);
    const refreshTimer = window.setInterval(() => {
      if (document.visibilityState === "visible" && onlineRef.current) refresh("background");
    }, autoRefreshMs);
    return () => {
      window.removeEventListener("online", syncConnection);
      window.removeEventListener("offline", syncConnection);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(ageTimer);
      window.clearInterval(refreshTimer);
      if (refreshTimeout.current) window.clearTimeout(refreshTimeout.current);
    };
  }, [autoRefreshMs, refresh]);

  useEffect(() => {
    if (updatedAt && updatedLabel) setLastSuccessfulUpdate({ timestamp: updatedAt, label: updatedLabel });
  }, [updatedAt, updatedLabel]);

  useEffect(() => {
    if (!isPending) {
      refreshInFlight.current = false;
      refreshMode.current = null;
      if (refreshTimeout.current) {
        window.clearTimeout(refreshTimeout.current);
        refreshTimeout.current = null;
      }
    }
  }, [isPending]);

  const isStale = Boolean(lastSuccessfulUpdate && now - Date.parse(lastSuccessfulUpdate.timestamp) > staleAfterMs);
  const allFailed = moduleCount > 0 && failedModules.length >= moduleCount;
  const hasFailure = failedModules.length > 0;
  const state = isOffline
    ? "offline"
    : isPending
      ? "refreshing"
      : allFailed
        ? "full-failure"
        : hasFailure
          ? "partial-failure"
          : isStale
            ? "stale"
            : "fresh";
  const updatedText = lastSuccessfulUpdate ? `Updated ${lastSuccessfulUpdate.label}` : "Update time unavailable";
  const status = state === "offline"
    ? `${updatedText}. Offline; some information may be outdated.`
    : state === "refreshing"
      ? refreshMode.current === "manual" ? "Refreshing dashboard data…" : "Updating dashboard data…"
      : state === "full-failure"
        ? `${updatedText}. We could not update dashboard data; existing information may be outdated.`
        : state === "partial-failure"
          ? `${updatedText}. ${failedModules.join(", ")} could not be updated; other information is available.`
          : state === "stale"
            ? `${updatedText}. Some information may be outdated.`
            : updatedText;

  useEffect(() => {
    if (!rootRef.current?.getClientRects().length) return;
    if (reportedDataState.current === state) return;
    reportedDataState.current = state;
    if (state === "partial-failure" || state === "full-failure" || state === "stale" || state === "offline") {
      trackOperatorWorkspaceEvent("operator_dashboard_fetch_failed", {
        ...analyticsContext,
        route: "/portal",
        error_category: state === "partial-failure" ? "partial_failure" : state === "full-failure" ? "full_failure" : state,
      });
    }
  }, [analyticsContext.location_scope_count, analyticsContext.role_category, state]);

  return <div ref={rootRef} className="dashboard-freshness" data-state={state}>
    <span className="dashboard-freshness-status" role="status" aria-live="polite" aria-atomic="true">
      {state === "offline" ? <WifiOff size={15} aria-hidden="true" /> : state === "partial-failure" || state === "full-failure" || state === "stale" ? <AlertCircle size={15} aria-hidden="true" /> : state === "refreshing" ? <RefreshCw size={15} aria-hidden="true" /> : null}
      {status}
    </span>
    <button type="button" onClick={() => refresh("manual")} disabled={isPending || isOffline} aria-label="Refresh dashboard data">
      <RefreshCw size={16} aria-hidden="true" />{isPending ? "Refreshing" : "Refresh"}
    </button>
  </div>;
};

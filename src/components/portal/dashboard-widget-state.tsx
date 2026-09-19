"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { DASHBOARD_STALE_AFTER_MS, type DashboardDataState } from "@/src/features/portal/dashboard-data-state";
import { trackOperatorWorkspaceEvent, type OperatorAnalyticsProperties } from "@/src/lib/analytics";
import { usePortalContext } from "@/src/features/portal/portal-context";

export const DashboardWidgetStateNotice = ({ state }: { state: DashboardDataState }) => {
  if (state === "stale") {
    return <p className="dashboard-widget-notice" data-state="stale"><AlertCircle size={14} aria-hidden="true" />Displayed information may be outdated.</p>;
  }
  return null;
};

export const DashboardWidgetRetry = ({ label = "Retry this dashboard section" }: { label?: string }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const retry = () => {
    if (isOffline || isPending) return;
    startTransition(() => router.refresh());
  };

  return <div className="dashboard-widget-retry">
    <button type="button" onClick={retry} disabled={isPending || isOffline} aria-label={label}>
      <RefreshCw size={14} aria-hidden="true" />{isPending ? "Retrying" : "Retry"}
    </button>
    <span className="sr-only" role="status" aria-live="polite">{isPending ? "Retrying this dashboard section." : ""}</span>
  </div>;
};

export const DashboardWidgetSnapshot = ({
  state,
  children,
  failureMessage,
  retryLabel,
  moduleId,
  retainOnFailure = true,
  staleAfterMs = DASHBOARD_STALE_AFTER_MS,
}: {
  state: DashboardDataState;
  children: ReactNode;
  failureMessage: string;
  retryLabel: string;
  moduleId?: NonNullable<OperatorAnalyticsProperties["module_id"]>;
  retainOnFailure?: boolean;
  staleAfterMs?: number;
}) => {
  const { user, permittedUnits } = usePortalContext();
  const rootRef = useRef<HTMLDivElement>(null);
  const retained = useRef<ReactNode>(null);
  const reportedFailure = useRef<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [lastSuccessfulAt, setLastSuccessfulAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const isValid = state === "active" || state === "empty" || state === "stale";
  const isFailure = state === "partial-error" || state === "unconfigured";

  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    if (!isValid) return;
    retained.current = children;
    setLastSuccessfulAt(Date.now());
  }, [children, isValid]);

  useEffect(() => {
    if (!lastSuccessfulAt) return;
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, [lastSuccessfulAt]);

  useEffect(() => {
    if (!isFailure) {
      reportedFailure.current = null;
      return;
    }
    if (!moduleId || !rootRef.current?.getClientRects().length || reportedFailure.current === state) return;
    reportedFailure.current = state;
    trackOperatorWorkspaceEvent("operator_dashboard_module_failed", {
      role_category: user.role === "admin" ? "admin" : "franchisee",
      location_scope_count: permittedUnits.length,
      module_id: moduleId,
      error_category: state === "unconfigured" ? "unconfigured" : "partial_failure",
      route: "/portal",
    });
  }, [isFailure, moduleId, permittedUnits.length, state, user.role]);

  const showRetained = retainOnFailure && isFailure && retained.current !== null;
  const stale = Boolean(lastSuccessfulAt && now - lastSuccessfulAt > staleAfterMs);
  const snapshotState = isOffline ? "offline" : stale && !isFailure ? "stale" : state;
  const freshnessNotice = isOffline
    ? "Offline. Displayed information may be outdated."
    : stale && !isFailure
      ? "Displayed information may be outdated."
      : null;
  return <div ref={rootRef} className="dashboard-widget-snapshot" data-dashboard-snapshot-state={snapshotState} data-network-state={isOffline ? "offline" : "online"}>
    {showRetained ? retained.current : children}
    {freshnessNotice ? <p className="dashboard-widget-notice" data-state={snapshotState} role="status">{snapshotState === "offline" ? <WifiOff size={14} aria-hidden="true" /> : <AlertCircle size={14} aria-hidden="true" />}{freshnessNotice}</p> : null}
    {showRetained ? <div className="dashboard-widget-retained-state" role="status"><AlertCircle size={16} aria-hidden="true" /><div><p>{failureMessage} Previously loaded information remains visible.</p>{state === "partial-error" ? <DashboardWidgetRetry label={retryLabel} /> : null}</div></div> : null}
  </div>;
};

"use client";

import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const AUTO_REFRESH_MS = 2 * 60 * 1000;
const STALE_AFTER_MS = 5 * 60 * 1000;

export function CorporateDashboardFreshness({ updatedAt, timeZone }: { updatedAt: string; timeZone: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOffline, setIsOffline] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const refreshInFlight = useRef(false);
  const refreshTimeout = useRef<number | null>(null);
  const onlineRef = useRef(true);

  const refresh = useCallback(() => {
    if (!navigator.onLine || isPending || refreshInFlight.current || document.visibilityState !== "visible") return;
    refreshInFlight.current = true;
    if (refreshTimeout.current) window.clearTimeout(refreshTimeout.current);
    refreshTimeout.current = window.setTimeout(() => { refreshInFlight.current = false; }, 15_000);
    startTransition(() => router.refresh());
  }, [isPending, router]);

  useEffect(() => {
    const syncConnection = () => {
      const wasOnline = onlineRef.current;
      const offline = !navigator.onLine;
      onlineRef.current = !offline;
      setIsOffline(offline);
      if (!offline && !wasOnline && document.visibilityState === "visible") refresh();
    };
    const onVisibility = () => { if (document.visibilityState === "visible") refresh(); };
    syncConnection();
    window.addEventListener("online", syncConnection);
    window.addEventListener("offline", syncConnection);
    document.addEventListener("visibilitychange", onVisibility);
    const ageTimer = window.setInterval(() => setNow(Date.now()), 30_000);
    const refreshTimer = window.setInterval(refresh, AUTO_REFRESH_MS);
    return () => {
      window.removeEventListener("online", syncConnection);
      window.removeEventListener("offline", syncConnection);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(ageTimer);
      window.clearInterval(refreshTimer);
      if (refreshTimeout.current) window.clearTimeout(refreshTimeout.current);
    };
  }, [refresh]);

  useEffect(() => {
    if (!isPending) {
      refreshInFlight.current = false;
      if (refreshTimeout.current) { window.clearTimeout(refreshTimeout.current); refreshTimeout.current = null; }
    }
  }, [isPending]);

  const stale = now - Date.parse(updatedAt) > STALE_AFTER_MS;
  const label = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone, timeZoneName: "short" }).format(new Date(updatedAt));
  const status = isOffline ? `Updated ${label}. Offline; information may be out of date.` : isPending ? "Updating corporate records…" : stale ? `Updated ${label}. Information may be out of date.` : `Updated ${label}`;
  const icon = isOffline ? <WifiOff size={15} aria-hidden="true" /> : stale ? <AlertCircle size={15} aria-hidden="true" /> : isPending ? <RefreshCw size={15} aria-hidden="true" /> : null;

  return <div className="corporate-dashboard-freshness" data-state={isOffline ? "offline" : isPending ? "refreshing" : stale ? "stale" : "fresh"}><span role="status" aria-live="polite" aria-atomic="true">{icon}{status}</span><button type="button" onClick={refresh} disabled={isPending || isOffline}>{isPending ? "Refreshing" : "Refresh"}</button></div>;
}

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import {
  trackOperatorWorkspaceEvent,
  type OperatorAnalyticsProperties,
  type OperatorWorkspaceEvent,
} from "@/src/lib/analytics";
import { usePortalContext } from "@/src/features/portal/portal-context";

export type OperatorAnalyticsEvent = {
  event: OperatorWorkspaceEvent;
  properties?: OperatorAnalyticsProperties;
};

export function OperatorAnalyticsLink({ href, className, ariaLabel, events, children }: {
  href: string;
  className?: string;
  ariaLabel?: string;
  events: OperatorAnalyticsEvent[];
  children: ReactNode;
}) {
  const { user, permittedUnits } = usePortalContext();
  return <Link href={href} className={className} aria-label={ariaLabel} onClick={() => {
    for (const item of events) trackOperatorWorkspaceEvent(item.event, {
      role_category: user.role === "admin" ? "admin" : "franchisee",
      location_scope_count: permittedUnits.length,
      ...item.properties,
    });
  }}>{children}</Link>;
}

export function OperatorDashboardViewed({ surface, roleCategory, locationScopeCount, attentionCount, activeWorkCount, attentionTypes }: {
  surface: "mobile" | "desktop";
  roleCategory: "admin" | "franchisee";
  locationScopeCount: number;
  attentionCount: number;
  activeWorkCount: number;
  attentionTypes: Array<{ type: NonNullable<OperatorAnalyticsProperties["attention_type"]>; count: number }>;
}) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    const desktop = window.matchMedia("(min-width: 64rem)").matches;
    if ((surface === "desktop") !== desktop) return;
    sent.current = true;
    trackOperatorWorkspaceEvent("operator_dashboard_viewed", {
      role_category: roleCategory,
      location_scope_count: locationScopeCount,
      attention_count: attentionCount,
      active_work_count: activeWorkCount,
      viewport_group: surface,
      route: "/portal",
    });
    for (const item of attentionTypes) {
      if (item.count > 0) trackOperatorWorkspaceEvent("operator_attention_items_presented", {
        attention_type: item.type,
        attention_count: item.count,
        route: "/portal",
      });
    }
  }, [activeWorkCount, attentionCount, attentionTypes, locationScopeCount, roleCategory, surface]);
  return null;
}

export function OperatorDashboardModuleViewed({ moduleId, surface }: {
  moduleId: NonNullable<OperatorAnalyticsProperties["module_id"]>;
  surface: "mobile" | "desktop";
}) {
  const { user, permittedUnits } = usePortalContext();
  const rootRef = useRef<HTMLSpanElement>(null);
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    const desktop = window.matchMedia("(min-width: 64rem)").matches;
    if ((surface === "desktop") !== desktop || !rootRef.current?.getClientRects().length) return;
    sent.current = true;
    trackOperatorWorkspaceEvent("operator_dashboard_module_viewed", {
      role_category: user.role === "admin" ? "admin" : "franchisee",
      location_scope_count: permittedUnits.length,
      module_id: moduleId,
      viewport_group: surface,
      route: "/portal",
    });
  }, [moduleId, permittedUnits.length, surface, user.role]);
  return <span ref={rootRef} className="dashboard-analytics-sentinel" aria-hidden="true" />;
}

export function OperatorEventOnMount({ event, properties = {}, dedupeKey }: OperatorAnalyticsEvent & { dedupeKey?: string }) {
  const { user, permittedUnits } = usePortalContext();
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    if (dedupeKey) {
      const storageKey = `buddas:operator-analytics:${dedupeKey}`;
      try {
        if (window.sessionStorage.getItem(storageKey)) return;
        window.sessionStorage.setItem(storageKey, "1");
      } catch { /* Analytics storage failures must not block the page. */ }
    }
    trackOperatorWorkspaceEvent(event, { role_category: user.role === "admin" ? "admin" : "franchisee", location_scope_count: permittedUnits.length, ...properties });
  }, [dedupeKey, event, permittedUnits.length, properties, user.role]);
  return null;
}

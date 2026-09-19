"use client";

import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { trackFunnelEvent } from "@/src/lib/analytics";

const trackedMetrics = new Set(["LCP", "INP", "CLS"]);

/** Lightweight field measurement; delivery remains in the existing dataLayer path. */
export const WebVitalsReporter = () => {
  const pathname = usePathname();
  const pagePath = pathname.startsWith("/portal/") ? pathname.split("/").slice(0, 3).join("/") : pathname;

  useReportWebVitals((metric) => {
    if (!trackedMetrics.has(metric.name)) return;

    trackFunnelEvent("web_vital", {
      page_path: pagePath,
      web_vital_name: metric.name as "LCP" | "INP" | "CLS",
      web_vital_value: metric.value,
      web_vital_rating: metric.rating,
    });
  });

  return null;
};

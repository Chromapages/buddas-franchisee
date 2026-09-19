"use client";

import { useEffect, useRef } from "react";
import { trackFranchiseFunnelEvent } from "@/src/lib/analytics";

/** Records one meaningful homepage view per mounted franchise page. */
export const FranchiseHomeAnalytics = () => {
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (hasTrackedView.current) return;
    hasTrackedView.current = true;
    trackFranchiseFunnelEvent("franchise_home_viewed");
  }, []);

  return null;
};

"use client";

import { useEffect, useRef } from "react";
import { trackFunnelEvent } from "@/src/lib/analytics";

/** Records one real viewport exposure for the visible responsive proof stack. */
export const OperatorProofViewTracker = ({ targetId, surface }: { targetId: string; surface: "mobile" | "desktop" }) => {
  const hasTrackedView = useRef(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target || hasTrackedView.current || target.dataset.advantageViewTracked === "true") return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || hasTrackedView.current) return;
      hasTrackedView.current = true;
      target.dataset.advantageViewTracked = "true";
      trackFunnelEvent("franchise_advantage_viewed", {
        page_path: "/franchise",
        placement: `operator_proof_${surface}`,
      });
      observer.disconnect();
    }, { threshold: 0.35 });

    observer.observe(target);
    return () => observer.disconnect();
  }, [surface, targetId]);

  return null;
};

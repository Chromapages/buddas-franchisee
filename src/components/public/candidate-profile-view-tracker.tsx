"use client";

import { useEffect, useRef } from "react";
import { trackFranchiseFunnelEvent } from "@/src/lib/analytics";

/** Tracks one real viewport exposure for the visible Candidate Profile presentation. */
export const CandidateProfileViewTracker = ({ targetId }: { targetId: string }) => {
  const tracked = useRef(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target || tracked.current || target.dataset.candidateProfileViewed === "true") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || tracked.current) return;
      tracked.current = true;
      target.dataset.candidateProfileViewed = "true";
      trackFranchiseFunnelEvent("franchise_candidate_profile_viewed");
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  return null;
};

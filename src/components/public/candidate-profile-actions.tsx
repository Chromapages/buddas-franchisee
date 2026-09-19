"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { trackFranchiseFunnelEvent } from "@/src/lib/analytics";
import { CtaWithMicrocopy } from "@/src/components/public/cta-with-microcopy";
import { CANDIDATE_PROFILE_CONTENT } from "@/src/features/franchise/candidate-criteria";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const CandidateProfileActions = () => {
  const qualificationActivation = useRef(false);
  const [isQualificationNavigating, setIsQualificationNavigating] = useState(false);

  useEffect(() => {
    const restoreAction = () => {
      qualificationActivation.current = false;
      setIsQualificationNavigating(false);
    };
    window.addEventListener("pageshow", restoreAction);
    return () => window.removeEventListener("pageshow", restoreAction);
  }, []);

  const handleQualificationClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (qualificationActivation.current) {
      event.preventDefault();
      return;
    }
    qualificationActivation.current = true;
    setIsQualificationNavigating(true);
    trackFranchiseFunnelEvent("franchise_full_qualifications_clicked");
  };

  return (
    <div className="candidate-action-align flex flex-col items-stretch gap-2 shrink-0">
      <div className="candidate-action-row flex flex-col items-stretch w-full">
        <div className="flex flex-col items-center gap-1 w-full">
          <CtaWithMicrocopy
            href={CANDIDATE_PROFILE_CONTENT.qualificationAction.href}
            label={CANDIDATE_PROFILE_CONTENT.qualificationAction.label}
            microcopy={CANDIDATE_PROFILE_CONTENT.qualificationAction.microcopy}
            dataStickyCtaHide
            isNavigating={isQualificationNavigating}
            navigatingLabel="OPENING QUALIFICATIONS…"
            onClick={handleQualificationClick}
            className={`candidate-action-link w-full min-h-[52px] inline-flex items-center justify-center gap-2 text-sm font-semibold font-heading text-bds-cream bg-bds-teal-dark hover:bg-bds-teal-ink px-6 py-3 rounded-xl transition-colors duration-150 motion-reduce:transition-none shadow-none focus:outline-none focus-visible:ring-4 focus-visible:ring-bds-teal-dark focus-visible:ring-offset-2 focus-visible:ring-offset-bds-cream ${isQualificationNavigating ? "pointer-events-none opacity-75" : ""}`}
          />
          <Link
            href={CANDIDATE_PROFILE_CONTENT.inquiryAction.href}
            onClick={() => trackFranchiseFunnelEvent("franchise_candidate_inquiry_clicked")}
            className="candidate-inquiry-link touch-target-inline mt-3 gap-2 rounded-lg px-3 font-heading text-sm font-semibold uppercase tracking-[0.04em] text-bds-teal-dark underline decoration-bds-teal-dark/35 underline-offset-4 transition-colors duration-150 hover:text-bds-teal-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-teal-dark focus-visible:ring-offset-2 focus-visible:ring-offset-bds-cream motion-reduce:transition-none"
          >
            <span>{CANDIDATE_PROFILE_CONTENT.inquiryAction.label}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </Link>
        </div>

      </div>
    </div>
  );
};

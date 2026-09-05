"use client";

import { useRef, useState, type MouseEvent } from "react";
import { trackFunnelEvent } from "@/src/lib/analytics";
import { CtaWithMicrocopy } from "@/src/components/public/cta-with-microcopy";

export const CandidateProfileActions = () => {
  const qualificationActivation = useRef(false);
  const [isQualificationNavigating, setIsQualificationNavigating] = useState(false);

  const handleQualificationClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (qualificationActivation.current) {
      event.preventDefault();
      return;
    }
    qualificationActivation.current = true;
    setIsQualificationNavigating(true);
    trackFunnelEvent("candidate_profile_primary_click", {
      page_path: "/franchise",
      placement: "candidate_profile",
      candidate_destination: "qualifications",
      destination: "/franchise/the-opportunity#qualifications",
    });
  };

  return (
    <div className="candidate-action-align flex flex-col items-stretch gap-2 shrink-0">
      <div className="candidate-action-row flex flex-col items-stretch w-full">
        <div className="flex flex-col items-center gap-1 w-full">
          <CtaWithMicrocopy
            href="/franchise/the-opportunity?source_page=homepage_candidate_profile#qualifications"
            label="REVIEW QUALIFICATIONS"
            microcopy="No obligation — review the full candidate criteria."
            dataStickyCtaHide
            isNavigating={isQualificationNavigating}
            navigatingLabel="OPENING QUALIFICATIONS…"
            onClick={handleQualificationClick}
            className={`candidate-action-link w-full min-h-[48px] inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-[#1C5F56] hover:bg-bds-teal px-6 py-3 rounded-xl transition-all motion-reduce:transition-none motion-reduce:transform-none shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1C5F56] focus-visible:ring-offset-2 focus-visible:ring-offset-bds-cream active:scale-[0.99] ${isQualificationNavigating ? "pointer-events-none opacity-75" : ""}`}
          />
        </div>

      </div>
    </div>
  );
};

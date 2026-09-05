"use client";

import { trackFunnelEvent } from "@/src/lib/analytics";

export const CandidateProfileInvestmentLink = ({
  href,
  label,
}: {
  href: string;
  label: string;
}) => (
  <a
    href={href}
    onClick={() => trackFunnelEvent("candidate_profile_investment_click", {
      page_path: "/franchise",
      placement: "candidate_profile",
      candidate_criterion: "capitalize",
      candidate_destination: "investment",
      destination: href,
    })}
    className="touch-target-inline mt-2 inline-flex font-bold text-xs text-[#1C5F56] underline underline-offset-2 hover:text-[#54BFA5] focus:outline-none focus:ring-2 focus:ring-[#1C5F56] focus:ring-offset-1 rounded-sm"
  >
    {label}
  </a>
);

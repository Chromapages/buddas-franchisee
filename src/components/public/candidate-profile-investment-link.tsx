"use client";

import { trackFranchiseFunnelEvent } from "@/src/lib/analytics";

export const CandidateProfileInvestmentLink = ({
  href,
  label,
}: {
  href: string;
  label: string;
}) => (
  <a
    href={href}
    onClick={() => trackFranchiseFunnelEvent("franchise_financial_qualifications_clicked")}
    className="touch-target-inline mt-3 inline-flex font-heading text-sm font-semibold leading-[1.4] text-bds-teal-dark underline underline-offset-4 hover:text-bds-teal-ink focus:outline-none focus:ring-2 focus:ring-bds-teal-dark focus:ring-offset-2 rounded-sm"
  >
    {label}
  </a>
);

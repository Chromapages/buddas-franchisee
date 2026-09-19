"use client";

import { CtaWithMicrocopy } from "@/src/components/public/cta-with-microcopy";
import { trackFunnelEvent } from "@/src/lib/analytics";

type OperatorProofOpportunityCtaProps = {
  href: string;
  label: string;
  microcopy: string;
  inverse?: boolean;
};

export const OperatorProofOpportunityCta = ({ href, label, microcopy, inverse = false }: OperatorProofOpportunityCtaProps) => (
  <CtaWithMicrocopy
    href={href}
    label={label}
    microcopy={microcopy}
    dataStickyCtaHide
    onClick={() => trackFunnelEvent("franchise_advantage_primary_cta_clicked", {
      page_path: "/franchise",
      placement: "operator_proof_stack",
      destination: href,
    })}
    className={`touch-target flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-center font-heading text-sm font-semibold leading-[1.4] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-teal focus-visible:ring-offset-2 motion-reduce:transition-none ${inverse ? "bg-bds-cream text-bds-teal-dark hover:bg-bds-gold-light" : "bg-bds-teal text-white hover:bg-bds-teal-ink"}`}
  />
);

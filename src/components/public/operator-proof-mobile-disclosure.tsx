"use client";

import { useState } from "react";
import { CtaWithMicrocopy } from "@/src/components/public/cta-with-microcopy";

type MobileProofPillar = {
  number: string;
  category: string;
  proposition: string;
  description: string;
  operationalFact?: {
    label: string;
    value: string;
  };
};

type MobileOperatorDisclosureListProps = {
  pillars: readonly MobileProofPillar[];
  ctaMicrocopy: string;
};

export const MobileOperatorDisclosureList = ({
  pillars,
  ctaMicrocopy,
}: MobileOperatorDisclosureListProps) => {
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  return (
    <>
      <ol className="operator-proof-grid operator-proof-mobile-list md:hidden relative z-10" aria-label="Operator model pillars">
        {pillars.map((pillar) => {
          const isExpanded = expandedPillar === pillar.number;
          const detailId = `operator-pillar-detail-${pillar.number}`;

          return (
            <li key={pillar.number} data-pillar-number={pillar.number}>
              <article className="overflow-hidden rounded-2xl border border-bds-teal-dark/10 bg-white shadow-sm text-left">
                <button
                  id={`operator-pillar-trigger-${pillar.number}`}
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={detailId}
                  onClick={() => setExpandedPillar(isExpanded ? null : pillar.number)}
                  className="touch-target flex w-full items-center justify-between gap-4 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-bds-teal-dark"
                >
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#1C5F56]">
                      {pillar.number} <span aria-hidden="true">·</span>{" "}
                      {pillar.category.replace("THE ", "")}
                    </span>
                    <span className="mt-1 block text-base font-bold leading-tight text-[#1C5F56] text-balance">
                      {pillar.proposition}
                    </span>
                  </span>
                  <span className="shrink-0 text-xl font-medium leading-none text-[#1C5F56]" aria-hidden="true">
                    {isExpanded ? "−" : "+"}
                  </span>
                </button>
                {isExpanded ? (
                  <div
                    id={detailId}
                    role="region"
                    aria-labelledby={`operator-pillar-trigger-${pillar.number}`}
                    className="operator-proof-mobile-disclosure border-t border-bds-teal-dark/10 px-4 pb-4 pt-3"
                  >
                    <p className="text-xs leading-relaxed text-[#5A3A1F]/90">
                      {pillar.description}
                    </p>
                    {pillar.operationalFact ? (
                      <dl className="mt-3 border-l-2 border-bds-teal-dark/20 pl-3">
                        <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1C5F56]">
                          {pillar.operationalFact.label}
                        </dt>
                        <dd className="mt-1 text-xs leading-relaxed text-[#5A3A1F]/90">
                          {pillar.operationalFact.value}
                        </dd>
                      </dl>
                    ) : null}
                  </div>
                ) : null}
              </article>
            </li>
          );
        })}
      </ol>

      <div className="operator-proof-mobile-cta md:hidden">
        <CtaWithMicrocopy
          href="/franchise/the-opportunity"
          label="Review the Franchise Opportunity"
          microcopy={ctaMicrocopy}
          dataStickyCtaHide
          className="touch-target min-h-11 btn-primary w-full text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-teal-dark focus-visible:ring-offset-2"
        />
      </div>
    </>
  );
};

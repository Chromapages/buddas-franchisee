export type CandidateFitPillar = {
  number: string;
  category: string;
  meaning: string;
  standard: string;
  supportingExpectation?: string;
  detailsHref?: string;
  detailsLabel?: string;
};

/**
 * Mobile presents the complete operator standard at once. This is intentionally
 * static: qualification criteria are reference information, not a hidden flow.
 */
export const CandidateProfileMobileFitGate = ({
  pillars,
}: {
  pillars: readonly CandidateFitPillar[];
}) => (
  <ol
    aria-label="Operator standards"
    className="md:hidden divide-y divide-[#1C5F56]/15 border-y border-[#1C5F56]/15"
  >
    {pillars.map((pillar) => (
      <li
        key={pillar.number}
        data-candidate-criterion={pillar.number}
        className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 px-1 py-4"
      >
        <span className="pt-0.5 text-sm font-bold tabular-nums text-[#1C5F56]" aria-hidden="true">
          {pillar.number}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#1C5F56]">
            {pillar.category}
            <span className="font-medium normal-case tracking-normal text-bds-text-body/80">{" "}— {pillar.meaning}</span>
          </p>
          <h3 className="mt-1 text-sm font-bold leading-snug text-[#1C5F56]">{pillar.standard}</h3>
          {pillar.supportingExpectation ? (
            <p className="mt-1 text-xs leading-relaxed text-bds-text-body/90" data-candidate-supporting-expectation>
              {pillar.supportingExpectation}
            </p>
          ) : null}
          {pillar.detailsHref && pillar.detailsLabel ? (
            <CandidateProfileInvestmentLink href={pillar.detailsHref} label={pillar.detailsLabel} />
          ) : null}
        </div>
      </li>
    ))}
  </ol>
);
import { CandidateProfileInvestmentLink } from "@/src/components/public/candidate-profile-investment-link";

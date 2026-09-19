export type CandidateFitPillar = {
  id: string;
  number: string;
  frameworkTerm: string;
  publicLabel: string;
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
    className="candidate-standard-ledger lg:hidden divide-y divide-bds-teal-dark/30 border-y-2 border-bds-teal-dark/55"
  >
    {pillars.map((pillar) => (
      <li
        key={pillar.id}
        data-candidate-criterion={pillar.id}
        className="px-4 py-6"
      >
        <p className="font-heading text-xs font-semibold uppercase leading-[1.5] tracking-[0.12em] text-bds-teal-dark">
          <span className="tabular-nums">{pillar.number}</span><span aria-hidden="true"> · </span>{pillar.publicLabel}
        </p>
        <h3 className="mt-2 font-heading text-[18px] font-semibold leading-[1.25] text-bds-teal-dark">{pillar.standard}</h3>
        {pillar.supportingExpectation ? (
          <p className="mt-2 font-body text-[15px] leading-[1.5] text-bds-cocoa" data-candidate-supporting-expectation>
            {pillar.supportingExpectation}
          </p>
        ) : null}
        {pillar.detailsHref && pillar.detailsLabel ? (
          <CandidateProfileInvestmentLink href={pillar.detailsHref} label={pillar.detailsLabel} />
        ) : null}
      </li>
    ))}
  </ol>
);
import { CandidateProfileInvestmentLink } from "@/src/components/public/candidate-profile-investment-link";

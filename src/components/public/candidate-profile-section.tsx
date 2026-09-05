import Image from "next/image";
import { CandidateProfileActions } from "@/src/components/public/candidate-profile-actions";
import { CandidateProfileInvestmentLink } from "@/src/components/public/candidate-profile-investment-link";
import { CandidateProfileMobileFitGate } from "@/src/components/public/candidate-profile-mobile-fit-gate";
import { FRANCHISE_CANDIDATE_CRITERIA } from "@/src/features/franchise/candidate-criteria";
import { getApprovedCandidateProfileFinancialQualification } from "@/src/features/financials/financial-data";

const OperateTeamIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Center Operator with Cap & Apron */}
    <circle cx="24" cy="14" r="4.5" />
    <path d="M19.5 13.5C19.5 11 21.5 9 24 9C26.5 9 28.5 11 28.5 13.5H30.5" />
    <path d="M17 25C17 22.5 19.5 21 24 21C28.5 21 31 22.5 31 25" />
    <path d="M20 25V37H28V25" />
    {/* Left Team Member */}
    <circle cx="12" cy="18" r="3.5" />
    <path d="M7 28C7 26 8.8 24.5 12 24.5C13.2 24.5 14.3 24.8 15.2 25.3" />
    <path d="M9 28V36H15" />
    {/* Right Team Member */}
    <circle cx="36" cy="18" r="3.5" />
    <path d="M32.8 25.3C33.7 24.8 34.8 24.5 36 24.5C39.2 24.5 41 26 41 28" />
    <path d="M33 36H39V28" />
  </svg>
);

const CapitalizeFinanceIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Piggy Bank Body */}
    <path d="M38 27C38 33 33 37 25 37C17 37 11 32 11 26C11 20 16 16 23 16C24.5 16 26 16.3 27.5 16.8" />
    {/* Snout */}
    <path d="M11 23H7C6.4 23 6 23.4 6 24V28C6 28.6 6.4 29 7 29H11" />
    {/* Ear */}
    <path d="M31 16L34 11C34.3 10.5 35 10.5 35.3 11L36 17" />
    {/* Tail */}
    <path d="M38 24C40 24 41 23 41 22C41 21 40 20 38 20" />
    {/* Feet */}
    <path d="M16 37V41M32 37V41" />
    {/* Eye */}
    <circle cx="15" cy="22" r="1" fill="currentColor" />
    {/* Coin above */}
    <circle cx="28" cy="11" r="5" />
    <path d="M28 8.5V13.5M26.5 9.5C26.5 9.5 27 8.8 28 8.8C29 8.8 29.5 9.3 29.5 10C29.5 11 26.5 11.2 26.5 12.2C26.5 12.8 27.2 13.2 28 13.2C29 13.2 29.5 12.8 29.5 12.8" />
  </svg>
);

const StewardHeartIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Caring Heart */}
    <path d="M24 23.5L22.6 22.2C17.6 17.6 14.5 14.8 14.5 11.3C14.5 8.5 16.7 6.3 19.5 6.3C21.1 6.3 22.6 7 23.5 8.2C24.4 7 25.9 6.3 27.5 6.3C30.3 6.3 32.5 8.5 32.5 11.3C32.5 14.8 29.4 17.6 24.4 22.2L24 23.5Z" />
    {/* Open Generous Supporting Hand */}
    <path d="M8 29L17 26C19 25.3 21.2 25.8 22.8 27.2L27 31C28.2 32.1 30 32.1 31.2 31L39 24C40.2 23 42 23.5 42.5 25C43 26.5 41.8 28.2 40.5 29.2L32 36.5C30.2 38 27.8 38.8 25.5 38.5L14 37L8 33V29Z" />
  </svg>
);

const getCandidatePillars = (hasApprovedFinancialQualification: boolean) => [
  {
    number: "01",
    category: "OPERATE",
    meaning: FRANCHISE_CANDIDATE_CRITERIA.operatingExperience.meaning,
    standard: FRANCHISE_CANDIDATE_CRITERIA.operatingExperience.heading,
    supportingExpectation: FRANCHISE_CANDIDATE_CRITERIA.operatingExperience.description,
    Icon: OperateTeamIcon,
  },
  {
    number: "02",
    category: "CAPITALIZE",
    meaning: FRANCHISE_CANDIDATE_CRITERIA.financial.meaning,
    standard: hasApprovedFinancialQualification
      ? `${FRANCHISE_CANDIDATE_CRITERIA.financial.liquidCapital.display} ${FRANCHISE_CANDIDATE_CRITERIA.financial.liquidCapital.qualifier} · ${FRANCHISE_CANDIDATE_CRITERIA.financial.netWorth.display} ${FRANCHISE_CANDIDATE_CRITERIA.financial.netWorth.qualifier}`
      : "Financial readiness is reviewed during mutual evaluation.",
    supportingExpectation: hasApprovedFinancialQualification
      ? FRANCHISE_CANDIDATE_CRITERIA.financial.description
      : undefined,
    detailsHref: FRANCHISE_CANDIDATE_CRITERIA.financial.investmentDetailsHref,
    detailsLabel: "Review financial qualification and disclosure status",
    Icon: CapitalizeFinanceIcon,
  },
  {
    number: "03",
    category: "STEWARD",
    meaning: FRANCHISE_CANDIDATE_CRITERIA.stewardship.meaning,
    standard: FRANCHISE_CANDIDATE_CRITERIA.stewardship.heading,
    supportingExpectation: FRANCHISE_CANDIDATE_CRITERIA.stewardship.description,
    Icon: StewardHeartIcon,
  },
];

export const CandidateProfileSection = () => {
  const approvedCandidateFinancialQualification =
    getApprovedCandidateProfileFinancialQualification();
  const candidatePillars = getCandidatePillars(
    approvedCandidateFinancialQualification !== null,
  );
  const mobileFitPillars = candidatePillars.map(({ Icon: _Icon, ...pillar }) => pillar);

  return (
    <section
      aria-labelledby="candidate-profile-heading"
      className="candidate-profile-section relative bg-bds-cream text-bds-teal-dark overflow-hidden section-standard border-b border-bds-teal-dark/10"
    >
      <div className="content-wide relative z-10">
        
        {/* =========================================================================
            8:4 TWO-COLUMN EDITORIAL COMPOSITION
           ========================================================================= */}
        <div className="candidate-profile-layout grid layout-gap xl:gap-14 items-stretch">
          
          {/* -----------------------------------------------------------------------
              LEFT COLUMN (~66.7% width): Intro, 3 Pillars, and Partnership Action Area
             ----------------------------------------------------------------------- */}
          <div className="candidate-profile-content min-w-0 flex flex-col space-y-6 lg:space-y-10">
            
            {/* 1. Left-Side Introduction */}
            <div className="space-y-0 text-left">
              {/* Eyebrow with gold underline accent */}
              <div className="inline-block">
                <p className="homepage-section-eyebrow">
                  CANDIDATE PROFILE
                </p>
              </div>

              {/* Large Display Headline */}
              <h2 id="candidate-profile-heading" className="mt-3 homepage-section-heading lg:text-[2.75rem]">
                Built for operators who can build with us.
              </h2>

              {/* Supporting Paragraph */}
              <p className="mt-3 homepage-section-description prose-measure">
                The gate reviews restaurant leadership, financial readiness, and owner responsibility.
              </p>
            </div>

            {/* 2. Three Vertical Pillars in One Row with Dividers and Sequential Integrity */}
            <div>
              <CandidateProfileMobileFitGate pillars={mobileFitPillars} />

              <div className="hidden md:grid md:grid-cols-3 md:divide-x divide-[#1C5F56]/15 pt-2">
                {candidatePillars.map((pillar, index) => {
                  const Icon = pillar.Icon;
                  const spacing = index === 0 ? "md:pr-6" : index === 1 ? "md:px-6" : "md:pl-6";

                  return (
                    <article key={pillar.number} className={`flex flex-col items-start text-left space-y-2.5 ${spacing}`}>
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-[#1C5F56] bg-bds-cream flex items-center justify-center text-[#1C5F56] shadow-sm">
                        <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
                      </div>
                      <div className="flex items-center space-x-2 pt-0.5">
                        <span className="text-xl sm:text-2xl font-bold font-heading text-[#1C5F56] select-none">{pillar.number}</span>
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#1C5F56]">
                          {pillar.category}
                          <span className="font-medium normal-case tracking-normal text-bds-text-body/80">{" "}— {pillar.meaning}</span>
                        </p>
                      </div>
                      <h3 className="heading-minor text-[#1C5F56]">{pillar.standard}</h3>
                      {pillar.supportingExpectation ? <p className="support-copy text-bds-text-body/90">{pillar.supportingExpectation}</p> : null}
                      {pillar.detailsHref && pillar.detailsLabel ? <CandidateProfileInvestmentLink href={pillar.detailsHref} label={pillar.detailsLabel} /> : null}
                    </article>
                  );
                })}
              </div>

            </div>

            {/* 3. Bottom Partnership Callout and Action Suite */}
            <div className="candidate-action-suite flex flex-col justify-between gap-6">
              
              {/* A concise reciprocal conclusion to the three candidate standards above. */}
              <div className="candidate-partnership-exchange max-w-xl text-left">
                <div className="min-w-0">
                  <h3 className="heading-panel text-[#1C5F56]">
                    THE PARTNERSHIP WORKS BOTH WAYS.
                  </h3>
                  <dl className="mt-4 divide-y divide-[#1C5F56]/15 border-y border-[#1C5F56]/15">
                    <div className="grid gap-1 py-3 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4">
                      <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#1C5F56]">What you bring</dt>
                      <dd className="text-xs font-semibold leading-relaxed text-bds-text-body/90">Operate · Capitalize · Steward</dd>
                    </div>
                    <div className="grid gap-1 py-3 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4">
                      <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#1C5F56]">What Budda&apos;s brings</dt>
                      <dd className="text-xs leading-relaxed text-bds-text-body/90">Signature product · Bakery standards · Operating systems · Support</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <CandidateProfileActions />

            </div>

          </div>

          {/* -----------------------------------------------------------------------
              RIGHT COLUMN (~33.3% width): Tall Editorial Image Panel with Overlay Badge
             ----------------------------------------------------------------------- */}
          <div className="relative flex w-full min-w-0 aspect-[4/3] min-h-0 sm:min-h-[360px] lg:h-[32rem] lg:min-h-0 lg:max-w-[23rem] lg:justify-self-end">
            <figure className="relative h-full w-full min-h-0 overflow-hidden rounded-3xl border-2 border-white/80 bg-[#1C5F56]/10 shadow-lg sm:min-h-[360px] lg:min-h-0">
              <Image
                src="/images/buddas-about-storefront.png"
                alt="A baker arranging freshly baked rolls at a sunlit bakery counter"
                fill
                sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1024px) 45vw, 368px"
                loading="lazy"
                className="object-cover object-[100%_50%] md:object-[92%_50%] lg:object-[85%_50%]"
              />

              {/* Upper-left placement protects the baker's hands and the rolls from overlay coverage. */}
              <figcaption className="absolute left-4 top-4 sm:left-6 sm:top-6 lg:left-8 lg:top-8 rounded-2xl border border-white/15 bg-bds-teal-dark/95 px-4 py-3 text-white shadow-lg">
                <div className="text-left leading-tight">
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#FFF8E8] block">OPERATING DISCIPLINE</span>
                  <span className="mt-1 block text-[11px] font-black uppercase tracking-[0.14em] text-[#FFF8E8]">MORE TABLES. SAME STANDARD.</span>
                </div>
              </figcaption>
            </figure>
          </div>

        </div>

      </div>
    </section>
  );
};

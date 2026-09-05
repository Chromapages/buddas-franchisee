import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  MapPin,
  CheckCircle2,
  Users,
  DollarSign,
  Lock,
} from "lucide-react";
import { OperatorProofRail } from "@/src/components/public/operator-proof-rail";
import { CandidateProfileSection } from "@/src/components/public/candidate-profile-section";
import { FranchiseFinalCta } from "@/src/components/public/franchise-final-cta";
import { WorkflowReassuranceCarousel } from "@/src/components/public/workflow-reassurance-carousel";
import { HeroInquiryLink } from "@/src/components/public/hero-inquiry-link";
import { HeroOpportunityLink } from "@/src/components/public/hero-opportunity-link";
import { MobileStickyFranchiseCta } from "@/src/components/public/mobile-sticky-franchise-cta";
import {
  FRANCHISE_INVESTMENT_DISCLOSURE,
  isApprovedPublicFinancialPlacement,
} from "@/src/features/financials/financial-data";

const FranchiseHomePage = () => {
  const capitalReadinessRange = FRANCHISE_INVESTMENT_DISCLOSURE.displayRange;
  const showHeroInvestment = isApprovedPublicFinancialPlacement(
    FRANCHISE_INVESTMENT_DISCLOSURE.governance,
    "hero",
  );

  return (
    <div className="flex flex-col">
      {/* Reference Matched Hero Section with Custom Background Cover */}
      <section data-franchise-home-hero className="franchise-home-hero relative pt-0 pb-0 sm:pt-14 hero:pt-16 hero:pb-20 overflow-hidden bg-bds-cream border-b border-bds-teal-dark/10">
        {/* Background Cover Image (Mobile vs Desktop) */}
        <div className="absolute inset-0 pointer-events-none hidden hero:block" aria-hidden="true">
          {/* Desktop Optimized Background Cover (>= lg) */}
          <div className="relative w-full h-full">
            <Image
              src="/images/franchise-hero.jpg"
              alt=""
              fill
              priority
              className="object-cover object-right hero:object-center"
              sizes="100vw"
            />
          </div>
        </div>

        <div className="franchise-home-hero-content content-wide relative z-10">
          <div className="franchise-home-hero-grid grid grid-cols-1 hero:grid-cols-12 gap-8 hero:gap-12 items-center">
            {/* Left Content Column matching reference image */}
            <div className="franchise-home-hero-copy hero:col-span-6 hero-wide:col-span-5 max-w-2xl text-left">
              {/* Eyebrow: Inline Roll Icon SVG + Gold Text */}
              <div className="flex items-center gap-2.5 text-bds-teal-dark text-xs sm:text-sm font-bold uppercase tracking-widest">
                <span
                  className="inline-block w-7 h-5 bg-[#C47D2B] shrink-0"
                  style={{
                    maskImage: "url(/roll-icon.svg)",
                    WebkitMaskImage: "url(/roll-icon.svg)",
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                  }}
                  aria-hidden="true"
                />
                <span>Franchise Opportunity</span>
              </div>

              {/* Condensed Heavy Heading */}
              <h1 className="heading-page uppercase text-bds-text-heading hero:text-[3.5rem] hero-wide:text-[4rem]">
                Build Budda&apos;s<br />
                in Your Market.
              </h1>

              {/* Subheadline / Value Proposition */}
              <p className="text-[15px] leading-6 sm:text-base hero:text-lg text-bds-text-body">
                Explore a Hawaiian Bakery &amp; Grill franchise opportunity built around the Budda Roll, operating discipline, and generous hospitality.
              </p>

              {/* Mobile trust and self-qualification signals. The capital band
               * comes from the inquiry form's existing available-capital options. */}
              <dl className="divide-y divide-bds-teal-dark/15 border-y border-bds-teal-dark/15 sm:hidden" aria-label="Franchise qualification signals">
                <div className="flex min-h-12 flex-wrap items-center gap-3 py-2">
                  <MapPin className="h-4 w-4 shrink-0 text-bds-teal-dark" aria-hidden="true" />
                  <dt className="min-w-0 flex-1 text-xs font-bold uppercase tracking-wide text-bds-text-body">Operating proof</dt>
                  <dd className="ml-auto min-w-0 max-w-full text-right text-sm font-black leading-5 text-bds-text-heading">2 Operating Utah Restaurants</dd>
                </div>
                {showHeroInvestment ? <div className="flex min-h-12 flex-wrap items-center gap-3 py-2">
                  <DollarSign className="h-4 w-4 shrink-0 text-bds-teal-dark" aria-hidden="true" />
                  <dt className="min-w-0 flex-1 text-xs font-bold uppercase tracking-wide text-bds-text-body">Capital readiness</dt>
                  <dd className="ml-auto min-w-0 max-w-full break-words text-right text-sm font-black leading-5 text-bds-text-heading">{capitalReadinessRange}</dd>
                </div> : null}
              </dl>

              {/* Evaluation first, then the direct high-intent inquiry path. */}
              <div className="franchise-hero-action-context">
                <div className="franchise-hero-actions flex w-full max-w-none flex-col items-stretch gap-4 pt-0">
                <HeroOpportunityLink
                  href="/franchise/the-opportunity"
                  className="touch-target btn-primary min-h-[52px] w-full !px-6 !py-3.5 text-[15px] sm:text-base font-bold flex items-center justify-center gap-2 rounded-xl shadow-sm hover:!bg-bds-teal hover:text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-teal-dark focus-visible:ring-offset-2"
                >
                  <span>Review the Franchise Opportunity</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </HeroOpportunityLink>
                <HeroInquiryLink
                  href="/franchise/contact?source_page=homepage_hero"
                  className="touch-target inline-flex min-h-[48px] w-full max-w-full items-center justify-center gap-2 rounded-xl border border-bds-teal-dark/30 bg-white/50 px-4 py-3 text-center text-sm font-semibold leading-5 text-bds-teal-dark hover:border-bds-teal-dark hover:bg-white hover:text-bds-teal focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2 sm:w-auto sm:px-6 sm:text-base"
                >
                  <span className="text-center">Start a Franchise Inquiry<span className="mt-0.5 block text-[11px] font-medium leading-4 text-bds-text-body/75 sm:text-xs">3-step initial inquiry</span></span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </HeroInquiryLink>
                </div>
              </div>

              {/* Operating Location Proof Badge (Hidden on mobile) */}
              <div className="hidden sm:block pt-2">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#F3E5D0] flex items-center justify-center text-[#9E5D1D] shrink-0 shadow-sm">
                    <MapPin className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black uppercase tracking-wider text-bds-text-heading">
                      2 Operating Utah Restaurants
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-bds-text-body">
                      Pleasant Grove <span className="text-[#C47D2B] mx-1.5 font-bold">•</span> Salt Lake City
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Empty to allow background cover artwork to show through */}
            <div className="hero:col-span-6 hero-wide:col-span-7 hidden hero:block" aria-hidden="true" />
          </div>
        </div>

        <div className="franchise-home-hero-mobile-image hero:hidden relative mt-2 h-72">
          <Image
            src="/images/buddas-about-storefront.png"
            alt="A baker arranging freshly baked rolls at a sunlit bakery counter"
            width={1672}
            height={941}
            loading="eager"
            className="h-72 w-full object-cover object-[78%_52%] sm:object-[75%_50%]"
            sizes="(max-width: 67.25rem) 100vw, 0px"
          />
        </div>
      </section>

      {/* Operator Proof Rail (Homepage Second Section) */}
      <OperatorProofRail />

      {/* Candidate Profile (Homepage Third Section) */}
      <CandidateProfileSection />

      {/* Final Call to Action */}
      <FranchiseFinalCta />
      {false && <>
      <section className="content-wide section-standard">
        <div className="bg-bds-teal-dark rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-14 text-white shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 phone:gap-8 md:gap-10 lg:gap-12 xl:gap-14 items-center">
            {/* 1. Message Cluster: Order 1 on mobile, col 1-7 on desktop */}
            <div className="w-full lg:col-span-7 text-center lg:text-left space-y-3 order-1">
              <h2 className="heading-section heading-inverse lg:text-5xl">
                Let&apos;s Build Something Together.
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-bds-cream/80 leading-relaxed max-w-xl mx-auto lg:mx-0">
                We seek experienced operators who share our commitment to standards. Provide your background to begin a confidential, two-way evaluation.
              </p>
            </div>

            {/* 2. Trust Card: Order 2 on mobile (under body text), col 8-12 on desktop */}
            <div className="w-full lg:col-span-5 lg:row-span-2 order-2 lg:order-2 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-7 backdrop-blur-sm">
              <h3 className="heading-panel text-bds-gold mb-3.5 text-center lg:text-left">
                Franchise Evaluation Benchmarks
              </h3>
              <div className="grid grid-cols-2 gap-4 border-b border-white/10 pb-5 mb-5 text-center lg:text-left">
                <div>
                  <div className="text-2xl sm:text-3xl font-black font-heading text-white">$150K</div>
                  <div className="text-xs text-bds-cream/80 mt-0.5">Min. Liquid Capital</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black font-heading text-white">$400K</div>
                  <div className="text-xs text-bds-cream/80 mt-0.5">Min. Net Worth</div>
                </div>
              </div>
              <div className="border-b border-white/10 pb-5 mb-5">
                <div className="flex items-center gap-3 text-left">
                  <MapPin className="w-5 h-5 text-bds-gold shrink-0" aria-hidden="true" />
                  <div>
                    <div className="text-2xl font-black font-heading text-white">2</div>
                    <div className="text-xs text-bds-cream/80 mt-0.5">Operating Corporate Locations · Utah</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Decision Zone: Process signals, actions, and disclosures. */}
            <div className="w-full lg:col-span-12 text-center lg:text-left space-y-4 sm:space-y-5 order-3 lg:order-3 border-t border-white/10 pt-6 sm:pt-8">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-left">
                <div className="flex items-start gap-3 text-xs text-bds-cream/80">
                  <CheckCircle2 className="w-4 h-4 text-bds-gold shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Structured 4-Stage Mutual Vetting Process</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-bds-cream/80">
                  <Users className="w-4 h-4 text-bds-gold shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Direct Leadership &amp; Operational Onboarding</span>
                </div>
              </div>
              {/* Action Cluster (44-48px Mobile Touch Targets) */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 sm:gap-4">
                <div className="w-full sm:w-auto space-y-1.5">
                  <p className="text-[11px] leading-4 text-bds-cream/90 max-w-xs mx-auto sm:mx-0">
                    Takes 3–5 minutes. We review inquiries within 2 business days.
                  </p>
                  <Link
                    href="/franchise/contact"
                    className="btn-secondary text-sm sm:text-base font-bold w-full sm:w-auto min-h-[48px] flex items-center justify-center hover:!bg-bds-teal hover:!text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bds-teal-dark"
                  >
                    Request a Mutual Evaluation
                  </Link>
                  <p className="text-[11px] leading-4 text-bds-cream/90 max-w-xs mx-auto sm:mx-0">
                    Initial inquiry only. Your information is confidential, reviewed solely by our internal corporate team, and never shared or sold. Submission does not constitute a formal franchise offering or binding agreement.
                  </p>
                </div>
                <Link
                  href="/franchise/process"
                  className="text-sm font-semibold text-bds-cream/80 hover:text-white px-4 py-3 min-h-[44px] flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bds-teal-dark transition-colors duration-200"
                >
                  See How We Partner &rarr;
                </Link>
              </div>

              {/* Tertiary reassurance signals (not a third CTA). */}
              <div className="border-t border-white/10 pt-4">
                <WorkflowReassuranceCarousel theme="teal" />
              </div>

            </div>
          </div>
        </div>
      </section></>}
      <MobileStickyFranchiseCta />
    </div>
  );
};

export default FranchiseHomePage;

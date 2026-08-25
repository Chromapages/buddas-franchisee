import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  MapPin,
  Lock,
} from "lucide-react";
import { OperatorProofRail } from "@/src/components/public/operator-proof-rail";
import { CandidateProfileSection } from "@/src/components/public/candidate-profile-section";

export const FranchiseHomePage = () => {

  return (
    <div className="flex flex-col">
      {/* Reference Matched Hero Section with Custom Background Cover */}
      <section className="relative pt-8 pb-80 sm:pt-14 sm:pb-80 lg:pt-16 lg:pb-20 overflow-hidden bg-bds-cream border-b border-bds-teal-dark/10">
        {/* Background Cover Image (Mobile vs Desktop) */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {/* Mobile Optimized Background Cover (< lg) */}
          <div className="relative w-full h-full lg:hidden">
            <Image
              src="/images/FRANCHISE-HERO-mobile.jpg"
              alt=""
              fill
              priority
              className="object-cover object-bottom"
              sizes="100vw"
            />
          </div>

          {/* Desktop Optimized Background Cover (>= lg) */}
          <div className="relative w-full h-full hidden lg:block">
            <Image
              src="/images/franchise-hero.jpg"
              alt=""
              fill
              priority
              className="object-cover object-right lg:object-center"
              sizes="100vw"
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column matching reference image */}
            <div className="lg:col-span-6 xl:col-span-5 max-w-sm sm:max-w-md lg:max-w-lg space-y-4 sm:space-y-6 text-left">
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
                <span>Home of the Budda Roll</span>
              </div>

              {/* Condensed Heavy Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-black font-heading uppercase text-bds-text-heading leading-[0.96] tracking-tight">
                Build the Home<br />
                of the Budda Roll<br />
                in Your Market.
              </h1>

              {/* Subheadline / Value Proposition */}
              <p className="text-sm sm:text-base lg:text-lg text-bds-text-body leading-relaxed">
                Budda&apos;s is a Hawaiian Bakery &amp; Grill franchise opportunity built around the Budda Roll, satisfying all-day food, and generous hospitality.
              </p>

              {/* Action Buttons Matching Reference */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-0.5 max-w-[320px] sm:max-w-none">
                <Link
                  href="/franchise/the-opportunity"
                  className="btn-primary !px-6 !py-3.5 text-sm sm:text-base font-bold flex items-center justify-center gap-2 rounded-xl shadow-sm hover:!bg-bds-teal hover:text-white transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-bds-teal-dark focus-visible:outline-offset-4"
                >
                  <span>Review the Franchise Opportunity</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </Link>
                <Link
                  href="/franchise/contact"
                  className="self-center inline-flex items-center justify-center gap-2 px-4 py-3.5 text-sm sm:text-base font-semibold text-bds-teal-dark underline underline-offset-4 hover:text-bds-teal focus-visible:ring-2 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2 sm:self-auto sm:rounded-xl sm:border-2 sm:border-bds-teal-dark/30 sm:bg-white/40 sm:px-6 sm:no-underline sm:hover:border-bds-teal-dark sm:hover:bg-white"
                >
                  <span>Start a Franchise Inquiry</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </Link>
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
            <div className="lg:col-span-6 xl:col-span-7 hidden lg:block" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* Operator Proof Rail (Homepage Second Section) */}
      <OperatorProofRail />

      {/* Candidate Profile (Homepage Third Section) */}
      <CandidateProfileSection />

      {/* Final Call to Action */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
        <div className="bg-bds-teal-dark rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-14 text-white shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Message & Action Cluster (cols 1-7) */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-5 sm:space-y-6">
              {/* Message Cluster (Tight Proximity) */}
              <div className="space-y-2.5 sm:space-y-4">
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black font-heading text-white tracking-tight leading-tight">
                  Let&apos;s Build Something Together.
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-bds-cream/80 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  We seek experienced operators who share our commitment to standards. Provide your background to begin a confidential, two-way evaluation.
                </p>
              </div>

              {/* Action Cluster (44-48px Mobile Touch Targets) */}
              <div className="pt-1 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 sm:gap-4">
                <Link
                  href="/franchise/contact"
                  className="btn-secondary text-sm sm:text-base font-bold w-full sm:w-auto min-h-[48px] flex items-center justify-center hover:!bg-bds-teal hover:!text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bds-teal-dark"
                >
                  Request a Mutual Evaluation
                </Link>
                <Link
                  href="/franchise/process"
                  className="text-sm font-semibold text-bds-cream/80 hover:text-white px-4 py-3 min-h-[44px] flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bds-teal-dark transition-colors duration-200"
                >
                  See How We Partner &rarr;
                </Link>
              </div>

              {/* Workflow & Reassurance Signals */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1.5 text-xs text-bds-cream/80">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-bds-gold shrink-0" aria-hidden="true" />
                  <span>In-House Corporate Review</span>
                </span>
                <span className="text-bds-gold/40 hidden sm:inline">&bull;</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-bds-gold shrink-0" aria-hidden="true" />
                  <span>Instant Digital Brochure via Email</span>
                </span>
                <span className="text-bds-gold/40 hidden sm:inline">&bull;</span>
                <span>Zero Obligation</span>
              </div>

              {/* Approved Legal Privacy & Non-Binding Disclosure */}
              <p className="text-[11px] text-bds-cream/60 leading-relaxed max-w-xl mx-auto lg:mx-0 pt-1">
                Initial inquiry only. Your information is confidential, reviewed solely by our internal corporate team, and never shared or sold. Submission does not constitute a formal franchise offering or binding agreement.
              </p>
            </div>

            {/* Right Column: Existing Brand Trust Anchor (cols 8-12) */}
            <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-7 backdrop-blur-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-bds-gold mb-3.5 text-center lg:text-left">
                Franchise Evaluation Benchmarks
              </div>
              <div className="grid grid-cols-2 gap-4 border-b border-white/10 pb-5 mb-5 text-center lg:text-left">
                <div>
                  <div className="text-2xl sm:text-3xl font-black font-heading text-white">$150K</div>
                  <div className="text-xs text-bds-cream/70 mt-0.5">Min. Liquid Capital</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black font-heading text-white">$400K</div>
                  <div className="text-xs text-bds-cream/70 mt-0.5">Min. Net Worth</div>
                </div>
              </div>
              <div className="space-y-2.5 text-xs text-bds-cream/80 text-left">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-bds-gold shrink-0" aria-hidden="true" />
                  <span>2 Operating Corporate Locations (Utah)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-bds-gold shrink-0" aria-hidden="true" />
                  <span>Structured 4-Stage Mutual Vetting Process</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-bds-gold shrink-0" aria-hidden="true" />
                  <span>Direct Leadership &amp; Operational Onboarding</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FranchiseHomePage;

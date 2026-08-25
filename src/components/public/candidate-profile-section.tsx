import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const MonsteraIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 48 48"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M24 4C23.2 4 22.5 4.1 21.8 4.3C18.2 5.3 15.1 7.8 13.2 11.2C11.5 14.1 10.8 17.5 11.1 20.9C11.3 22.6 11.8 24.3 12.5 25.8C10.2 25.5 8.1 26.5 6.9 28.4C5.5 30.6 5.8 33.5 7.6 35.3C8.8 36.5 10.5 37.1 12.2 37C12.8 38.6 13.9 40 15.4 41C17.3 42.2 19.6 42.4 21.7 41.7C22.4 41.5 23 41.2 23.5 40.8L23.5 44C23.5 44.3 23.7 44.5 24 44.5C24.3 44.5 24.5 44.3 24.5 44L24.5 40.8C25 41.2 25.6 41.5 26.3 41.7C28.4 42.4 30.7 42.2 32.6 41C34.1 40 35.2 38.6 35.8 37C37.5 37.1 39.2 36.5 40.4 35.3C42.2 33.5 42.5 30.6 41.1 28.4C39.9 26.5 37.8 25.5 35.5 25.8C36.2 24.3 36.7 22.6 36.9 20.9C37.2 17.5 36.5 14.1 34.8 11.2C32.9 7.8 29.8 5.3 26.2 4.3C25.5 4.1 24.8 4 24 4ZM23.5 7.1C23.5 10.5 23.6 14.5 23.8 18.5C23 18.8 21.8 19.3 20.5 20C18.2 21.2 15.8 22.9 14.5 24.5C13.8 23.2 13.4 21.7 13.2 20.2C13 17.3 13.6 14.4 15 11.9C16.6 9 19.2 6.9 22.3 6.1C22.7 6 23.1 6 23.5 7.1ZM24.5 7.1C24.9 6 25.3 6 25.7 6.1C28.8 6.9 31.4 9 33 11.9C34.4 14.4 35 17.3 34.8 20.2C34.6 21.7 34.2 23.2 33.5 24.5C32.2 22.9 29.8 21.2 27.5 20C26.2 19.3 25 18.8 24.2 18.5C24.4 14.5 24.5 10.5 24.5 7.1ZM23.5 20.6C23.6 23.5 23.7 26.5 23.8 29.5C22.6 29.8 21.2 30.4 19.8 31.2C17.2 32.7 14.8 34.9 13.8 36.4C13.2 36.2 12.6 35.8 12.1 35.2C10.9 33.9 10.6 31.8 11.6 30.2C12.5 28.8 14.1 28.1 15.8 28.3C17.2 28.5 18.8 27.6 19.4 26.3C19.9 25.1 19.5 23.6 18.4 22.9C19.8 22 21.4 21.1 23.5 20.6ZM24.5 20.6C26.6 21.1 28.2 22 29.6 22.9C28.5 23.6 28.1 25.1 28.6 26.3C29.2 27.6 30.8 28.5 32.2 28.3C33.9 28.1 35.5 28.8 36.4 30.2C37.4 31.8 37.1 33.9 35.9 35.2C35.4 35.8 34.8 36.2 34.2 36.4C33.2 34.9 30.8 32.7 28.2 31.2C26.8 30.4 25.4 29.8 24.2 29.5C24.3 26.5 24.4 23.5 24.5 20.6ZM23.5 31.6C23.6 34.4 23.7 37.2 23.8 39.8C22.8 40.1 21.7 40.2 20.7 39.9C19.3 39.4 18.1 38.3 17.5 36.9C19.2 35.2 21.2 33.6 23.5 31.6ZM24.5 31.6C26.8 33.6 28.8 35.2 30.5 36.9C29.9 38.3 28.7 39.4 27.3 39.9C26.3 40.2 25.2 40.1 24.2 39.8C24.3 37.2 24.4 34.4 24.5 31.6Z" />
  </svg>
);

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

const PartnershipHandshakeIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
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
    {/* Handshake Nodes */}
    <path d="M11 20L18 13C19.2 11.8 21.2 11.8 22.4 13L24 14.6L25.6 13C26.8 11.8 28.8 11.8 30 13L37 20" />
    <path d="M14 23L20 29C20.8 29.8 22.2 29.8 23 29L26 26" />
    <path d="M34 23L28 29C27.2 29.8 25.8 29.8 25 29L22 26" />
    <path d="M7 24L13 30L20 23" />
    <path d="M41 24L35 30L28 23" />
  </svg>
);

export const CandidateProfileSection = () => {
  return (
    <section
      aria-label="Candidate Profile"
      className="relative bg-bds-cream text-bds-teal-dark overflow-hidden py-12 sm:py-16 lg:py-20 border-b border-bds-teal-dark/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* =========================================================================
            60/40 TWO-COLUMN EDITORIAL COMPOSITION
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-stretch">
          
          {/* -----------------------------------------------------------------------
              LEFT COLUMN (~60% width): Intro, 3 Pillars, and Partnership Action Area
             ----------------------------------------------------------------------- */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-between space-y-8 lg:space-y-10">
            
            {/* 1. Left-Side Introduction */}
            <div className="space-y-3 text-left">
              {/* Eyebrow with gold underline accent */}
              <div className="inline-block">
                <span className="text-xs font-black uppercase tracking-[0.16em] text-[#1C5F56]">
                  CANDIDATE PROFILE
                </span>
                <span className="block h-0.5 w-10 bg-[#C47D2B] mt-1.5" aria-hidden="true" />
              </div>

              {/* Large Display Headline */}
              <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold font-heading text-[#1C5F56] leading-[1.1] tracking-tight">
                Built for operators<br />
                who can build with us.
              </h2>

              {/* Supporting Paragraph */}
              <p className="text-sm sm:text-base text-[#5A3A1F]/85 max-w-xl leading-relaxed">
                We&apos;re looking for experienced restaurant leaders with the operational discipline, financial readiness, and hospitality mindset to grow Budda&apos;s well.
              </p>
            </div>

            {/* 2. Three Vertical Pillars in One Row with Dividers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-[#1C5F56]/15 pt-2">
              
              {/* Pillar 01: OPERATE (Experience-Based) */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left md:pr-5 pt-4 md:pt-0 space-y-2.5">
                {/* 1. Icon */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-[#1C5F56] bg-bds-cream flex items-center justify-center text-[#1C5F56] shadow-sm">
                  <OperateTeamIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>

                {/* 2. Number Label & Category */}
                <div className="flex items-center space-x-2 pt-0.5">
                  <span className="text-xl sm:text-2xl font-bold font-heading text-[#54BFA5] select-none">
                    01
                  </span>
                  <div className="inline-block text-left">
                    <span className="text-xs font-black uppercase tracking-[0.14em] text-[#1C5F56] block">
                      OPERATE
                    </span>
                    <span className="block h-0.5 w-6 bg-[#C47D2B] mt-0.5" aria-hidden="true" />
                  </div>
                </div>

                {/* 3. One Bolded Criterion Statement */}
                <h3 className="text-sm sm:text-base font-bold text-[#1C5F56] leading-snug min-h-[44px] flex items-center">
                  Multi-unit or high-volume restaurant experience
                </h3>

                {/* 4. One Supporting Sentence */}
                <p className="text-xs text-[#5A3A1F]/80 leading-relaxed">
                  Proven experience leading multiple units or managing high-volume operations with strong results.
                </p>
              </div>

              {/* Pillar 02: CAPITALIZE (Financial-Based) */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left md:px-5 pt-5 md:pt-0 space-y-2.5">
                {/* 1. Icon */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-[#1C5F56] bg-bds-cream flex items-center justify-center text-[#1C5F56] shadow-sm">
                  <CapitalizeFinanceIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>

                {/* 2. Number Label & Category */}
                <div className="flex items-center space-x-2 pt-0.5">
                  <span className="text-xl sm:text-2xl font-bold font-heading text-[#54BFA5] select-none">
                    02
                  </span>
                  <div className="inline-block text-left">
                    <span className="text-xs font-black uppercase tracking-[0.14em] text-[#1C5F56] block">
                      CAPITALIZE
                    </span>
                    <span className="block h-0.5 w-6 bg-[#C47D2B] mt-0.5" aria-hidden="true" />
                  </div>
                </div>

                {/* 3. One Bolded Criterion Statement (Resolved 2-figure primary/secondary treatment) */}
                <h3 className="text-sm sm:text-base font-bold text-[#1C5F56] leading-snug min-h-[44px] flex flex-col justify-center">
                  <span className="inline-flex items-baseline">
                    <span className="text-base sm:text-lg font-black tracking-tight text-[#1C5F56]">$150K</span>
                    <span className="ml-1 text-xs sm:text-sm font-black uppercase tracking-wider text-[#1C5F56]">LIQUID CAPITAL</span>
                    <sup className="text-xs font-bold text-[#C47D2B] ml-0.5" aria-hidden="true">*</sup>
                  </span>
                  <span className="text-xs sm:text-[13px] font-semibold text-[#5A3A1F]/90 mt-0.5 inline-flex items-baseline">
                    and <span className="font-bold text-[#1C5F56] mx-1">$400K</span> <span className="text-[11px] sm:text-xs uppercase font-bold tracking-wide text-[#5A3A1F]/80">NET WORTH</span>
                    <sup className="text-[10px] font-bold text-[#C47D2B] ml-0.5" aria-hidden="true">*</sup>
                  </span>
                </h3>

                {/* 4. One Supporting Sentence */}
                <div className="space-y-1">
                  <p className="text-xs text-[#5A3A1F]/80 leading-relaxed">
                    Minimum financial requirements to support development.
                  </p>
                  {/* Coordinated FDD Footnote Reference */}
                  <p id="fdd-financial-disclosure-note" className="text-[11px] text-[#5A3A1F]/75 leading-tight">
                    *Preliminary criteria. See{" "}
                    <a
                      href="/franchise/the-opportunity#financial-requirements"
                      className="text-[#1C5F56] font-bold underline underline-offset-2 hover:text-[#54BFA5] focus:outline-none focus:ring-2 focus:ring-[#1C5F56] focus:ring-offset-1 rounded-sm inline-flex items-center"
                      aria-label="View formal Franchise Disclosure Document Item 7 investment requirements"
                    >
                      FDD Item 7
                    </a>{" "}
                    for complete initial investment ranges.
                  </p>
                </div>
              </div>

              {/* Pillar 03: STEWARD (Values-Based) */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left md:pl-5 pt-5 md:pt-0 space-y-2.5">
                {/* 1. Icon */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-[#1C5F56] bg-bds-cream flex items-center justify-center text-[#1C5F56] shadow-sm">
                  <StewardHeartIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>

                {/* 2. Number Label & Category */}
                <div className="flex items-center space-x-2 pt-0.5">
                  <span className="text-xl sm:text-2xl font-bold font-heading text-[#54BFA5] select-none">
                    03
                  </span>
                  <div className="inline-block text-left">
                    <span className="text-xs font-black uppercase tracking-[0.14em] text-[#1C5F56] block">
                      STEWARD
                    </span>
                    <span className="block h-0.5 w-6 bg-[#C47D2B] mt-0.5" aria-hidden="true" />
                  </div>
                </div>

                {/* 3. One Bolded Criterion Statement */}
                <h3 className="text-sm sm:text-base font-bold text-[#1C5F56] leading-snug min-h-[44px] flex items-center">
                  Protect the product, lead the team, and serve community
                </h3>

                {/* 4. One Supporting Sentence */}
                <p className="text-xs text-[#5A3A1F]/80 leading-relaxed">
                  A commitment to Budda&apos;s standards, our people, and the communities we serve.
                </p>
              </div>

            </div>

            {/* 3. Bottom Partnership Callout and Action Suite */}
            <div className="pt-6 border-t border-[#1C5F56]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              
              {/* Left: Relationship Callout */}
              <div className="flex items-start gap-3.5 max-w-sm text-left">
                <div className="w-11 h-11 rounded-full border border-[#1C5F56] bg-bds-cream flex items-center justify-center text-[#1C5F56] shrink-0 mt-0.5">
                  <PartnershipHandshakeIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#1C5F56]">
                    THE RIGHT PARTNERSHIP WORKS BOTH WAYS.
                  </h4>
                  <p className="text-xs text-[#5A3A1F]/80 leading-relaxed">
                    Budda&apos;s brings a distinctive product, brand standards, operating systems, and support to help you grow strong, lasting restaurants.
                  </p>
                </div>
              </div>

              {/* Right: Action Buttons Suite */}
              <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                <Link
                  href="/franchise/the-opportunity#qualifications"
                  className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-[#1C5F56] hover:bg-bds-teal px-5 py-2.5 rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-gold active:scale-[0.99]"
                >
                  <span>REVIEW QUALIFICATIONS</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
                
                <Link
                  href="/franchise/the-opportunity#financials"
                  className="text-xs font-bold uppercase tracking-wider text-[#1C5F56] hover:text-[#C47D2B] hover:underline underline-offset-2 inline-flex items-center gap-1 transition-colors"
                >
                  <span>VIEW INVESTMENT DETAILS</span>
                  <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              </div>

            </div>

          </div>

          {/* -----------------------------------------------------------------------
              RIGHT COLUMN (~40% width): Tall Editorial Image Panel with Overlay Badge
             ----------------------------------------------------------------------- */}
          <div className="lg:col-span-5 xl:col-span-5 relative flex min-h-[420px] lg:min-h-full">
            <div className="relative w-full h-full min-h-[420px] rounded-3xl overflow-hidden shadow-lg border-2 border-white/80 bg-[#1C5F56]/10">
              <Image
                src="/images/stock1.webp"
                alt="Budda's Baker Holding Fresh Tray of Golden Budda Rolls"
                fill
                sizes="(max-width: 1024px) 100vw, 450px"
                className="object-cover object-center"
              />

              {/* Frosted Glass Overlay Badge in Lower-Right */}
              <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-black/65 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center gap-3 border border-white/15 text-white shadow-lg select-none">
                <div className="w-7 h-7 rounded-full bg-[#E9C559]/20 flex items-center justify-center text-[#E9C559] shrink-0">
                  <MonsteraIcon className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight">
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#FFF8E8] block">
                    MORE TABLES.
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#FFF8E8] block">
                    SAME STANDARD.
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

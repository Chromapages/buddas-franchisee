import Image from "next/image";

type ProofPillar = {
  number: string;
  category: string;
  headline: string;
  description: string;
  type: "image" | "icon";
  imageSrc?: string;
  imageAlt?: string;
  icon?: (props: { className?: string }) => React.JSX.Element;
};

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

const SystemStoreIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
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
    {/* Storefront Roof & Awning */}
    <path d="M6 18L9 9H39L42 18" />
    <path d="M6 18H42V22C42 24.2 40.2 26 38 26C35.8 26 34 24.2 34 22C34 24.2 32.2 26 30 26C27.8 26 26 24.2 26 22C26 24.2 24.2 26 22 26C19.8 26 18 24.2 18 22C18 24.2 16.2 26 14 26C11.8 26 10 24.2 10 22C10 24.2 8.2 26 6 26V18Z" />
    {/* Storefront Walls */}
    <path d="M10 26V39H26" />
    <path d="M15 39V32H21V39" />
    {/* Operating Gear */}
    <circle cx="36" cy="34" r="3.5" />
    <path d="M36 27.5V29.5M36 38.5V40.5M29.5 34H31.5M40.5 34H42.5M31.4 29.4L32.8 30.8M39.2 37.2L40.6 38.6M31.4 38.6L32.8 37.2M39.2 30.8L40.6 29.4" />
  </svg>
);

const ExperienceCareIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
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
    {/* Central Person */}
    <circle cx="24" cy="14" r="4.5" />
    <path d="M17 25C17 22.5 19.5 20.5 24 20.5C28.5 20.5 31 22.5 31 25" />
    {/* Left Person */}
    <circle cx="13" cy="18" r="3.5" />
    <path d="M8 27C8 25 9.8 23.5 13 23.5C14.5 23.5 15.7 23.9 16.6 24.6" />
    {/* Right Person */}
    <circle cx="35" cy="18" r="3.5" />
    <path d="M31.4 24.6C32.3 23.9 33.5 23.5 35 23.5C38.2 23.5 40 25 40 27" />
    {/* Generous Heart Motif */}
    <path d="M24 39.5L22.2 37.8C15.8 32 11.5 28.1 11.5 23.3C11.5 19.4 14.5 16.5 18.4 16.5C20.6 16.5 22.7 17.5 24 19.1C25.3 17.5 27.4 16.5 29.6 16.5C33.5 16.5 36.5 19.4 36.5 23.3C36.5 28.1 32.2 32 25.8 37.8L24 39.5Z" />
  </svg>
);

const GrowthChartIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
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
    {/* Baseline */}
    <path d="M8 40H40" />
    {/* Bar 1 */}
    <rect x="11" y="28" width="5.5" height="12" rx="1" />
    {/* Bar 2 */}
    <rect x="21" y="21" width="5.5" height="19" rx="1" />
    {/* Bar 3 */}
    <rect x="31" y="14" width="5.5" height="26" rx="1" />
    {/* Growth Arrow */}
    <path d="M12 21L24 11L38 4" />
    <path d="M30 4H38V12" />
  </svg>
);

const proofPillars: ProofPillar[] = [
  {
    number: "01",
    category: "THE PRODUCT",
    headline: "The Roll creates the pull.",
    description:
      "Budda Rolls give Budda's a distinctive reason for guests to visit—and come back.",
    type: "image",
    imageSrc: "/roll-icon.svg",
    imageAlt: "Classic Budda Roll with exposed soft crumb",
  },
  {
    number: "02",
    category: "THE SYSTEM",
    headline: "Built to repeat.",
    description:
      "Product standards, training, digital ordering, and operating discipline support consistent results across locations.",
    type: "icon",
    icon: SystemStoreIcon,
  },
  {
    number: "03",
    category: "THE EXPERIENCE",
    headline: "Warmth made teachable.",
    description:
      "Generous hospitality comes to life through clear behaviors that teams can learn and guests can feel.",
    type: "icon",
    icon: ExperienceCareIcon,
  },
  {
    number: "04",
    category: "THE GROWTH",
    headline: "Expansion is earned.",
    description:
      "We grow when product, people, operations, supply, and demand are ready.",
    type: "icon",
    icon: GrowthChartIcon,
  },
];

export const OperatorProofRail = () => {
  return (
    <section
      aria-label="The Budda's Advantage"
      className="relative bg-white text-bds-teal-dark overflow-hidden py-10 sm:py-12 lg:py-14 border-b border-bds-teal-dark/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* =========================================================================
            1. CENTERED INTRODUCTION HIERARCHY (COMPACT)
           ========================================================================= */}
        <header className="max-w-3xl mx-auto text-center space-y-2 sm:space-y-2.5">
          
          {/* Eyebrow Label with flanking thin horizontal rules & decorative gold mark */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 text-[#1C5F56]">
            <span className="h-px w-6 sm:w-12 bg-[#1C5F56]/25" aria-hidden="true" />
            <div className="inline-flex items-center gap-1.5">
              <MonsteraIcon className="w-3.5 h-3.5 text-[#C47D2B] shrink-0" />
              <span className="text-xs font-black uppercase tracking-[0.16em] text-[#1C5F56]">
                THE BUDDA&apos;S ADVANTAGE
              </span>
              <MonsteraIcon className="w-3.5 h-3.5 text-[#C47D2B] shrink-0" />
            </div>
            <span className="h-px w-6 sm:w-12 bg-[#1C5F56]/25" aria-hidden="true" />
          </div>

          {/* Large Display Headline */}
          <h2 className="text-2xl sm:text-4xl lg:text-[2.6rem] font-bold font-heading text-[#1C5F56] leading-[1.1] tracking-tight">
            Built for operators. Designed to grow.
          </h2>

          {/* Centered Supporting Paragraph */}
          <p className="text-xs sm:text-sm lg:text-base text-[#5A3A1F]/90 max-w-xl mx-auto leading-relaxed pt-0.5">
            Four connected strengths that make Budda&apos;s a proven opportunity
            and a partner you can build with for the long run.
          </p>
        </header>

        {/* =========================================================================
            2. FOUR-PART ADVANTAGE TIMELINE (COMPACT RAIL)
           ========================================================================= */}
        <div className="mt-8 sm:mt-10 lg:mt-10 relative">
          
          {/* Continuous Connecting Rail Line (Desktop horizontal line through icon centers) */}
          <div
            className="absolute top-[66px] sm:top-[70px] left-[10%] right-[10%] h-[2.5px] bg-[#1C5F56] z-0 hidden lg:block"
            aria-hidden="true"
          />

          {/* Timeline Accent Dots (Desktop centered between node pairs) */}
          <div
            className="absolute top-[62px] sm:top-[66px] left-[34%] w-2.5 h-2.5 rounded-full bg-[#E9C559] border-2 border-[#1C5F56] z-10 hidden lg:block -translate-x-1/2"
            aria-hidden="true"
          />
          <div
            className="absolute top-[62px] sm:top-[66px] left-[50%] w-2.5 h-2.5 rounded-full bg-[#E9C559] border-2 border-[#1C5F56] z-10 hidden lg:block -translate-x-1/2"
            aria-hidden="true"
          />
          <div
            className="absolute top-[62px] sm:top-[66px] left-[66%] w-2.5 h-2.5 rounded-full bg-[#E9C559] border-2 border-[#1C5F56] z-10 hidden lg:block -translate-x-1/2"
            aria-hidden="true"
          />

          {/* Four Advantage Pillars Ordered List */}
          <ol
            role="list"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 md:gap-6 lg:gap-5 relative z-10"
          >
            {proofPillars.map((pillar) => {
              const IconComp = pillar.icon;

              return (
                <li
                  key={pillar.number}
                  className="flex flex-col items-center text-center space-y-2 group"
                >
                  {/* Sequence Number */}
                  <span className="text-lg sm:text-xl font-bold font-heading text-[#1C5F56] tracking-wider select-none">
                    {pillar.number}
                  </span>

                  {/* Circular Icon Frame (Centered on connecting timeline) */}
                  <div className="w-20 h-20 sm:w-22 sm:h-22 lg:w-24 lg:h-24 rounded-full border-2 border-[#1C5F56] bg-bds-cream flex items-center justify-center p-1.5 shadow-sm transition-transform duration-200 group-hover:scale-105">
                    {pillar.type === "image" && pillar.imageSrc ? (
                      <div className="relative w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 overflow-hidden">
                        <Image
                          src={pillar.imageSrc}
                          alt={pillar.imageAlt || pillar.headline}
                          fill
                          sizes="(max-width: 768px) 44px, 48px"
                          className="object-contain object-center"
                        />
                      </div>
                    ) : IconComp ? (
                      <IconComp className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-[#1C5F56]" />
                    ) : null}
                  </div>

                  {/* Category Label */}
                  <div className="pt-1">
                    <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.14em] text-[#1C5F56]">
                      {pillar.category}
                    </span>
                  </div>

                  {/* Display-Style Subheadline */}
                  <h3 className="text-base sm:text-lg font-bold font-heading text-[#1C5F56] leading-snug max-w-[220px]">
                    {pillar.headline}
                  </h3>

                  {/* Supporting Paragraph */}
                  <p className="text-xs sm:text-[13px] text-[#5A3A1F]/85 leading-relaxed max-w-[220px]">
                    {pillar.description}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>

      </div>
    </section>
  );
};

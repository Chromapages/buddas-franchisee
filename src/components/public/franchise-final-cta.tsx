"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PUBLISHED_FINANCIAL_THRESHOLDS } from "@/src/features/financials/financial-data";
import { InlineEvaluationForm } from "@/src/components/public/inline-evaluation-form";
import { trackFunnelEvent } from "@/src/lib/analytics";

export type GlobalEvaluationCtaProps = {
  fullBleed?: boolean;
  minLiquidCapital?: number;
  minNetWorth?: number;
  operatingLocationCount?: number;
  operatingLocationLabel?: string;
  processStages?: readonly { label: string; description: string }[];
};

const defaultProcessStages = [
  { label: "Inquiry", description: "Share your operating background, market interest, and readiness." },
  { label: "Review", description: "Our franchise development team reviews potential fit." },
  { label: "Diligence", description: "Qualified candidates review the relevant disclosure and business materials." },
  { label: "Onboarding", description: "Approved operators move into site, training, and opening preparation." },
] as const;

const formatCompactCurrency = (amount: number) => `$${Math.round(amount / 1_000)}K`;

const EvaluationActionCluster = ({
  href,
  onPrimaryClick,
}: {
  href: string;
  onPrimaryClick: () => void;
}) => (
  <div className="pt-4">
    <div className="mx-auto w-full max-w-sm lg:mx-0">
      <Link href={href} onClick={onPrimaryClick} className="btn-secondary !text-brand-charcoal text-sm sm:text-base font-bold w-full min-h-[52px] sm:w-auto sm:min-w-[300px] sm:px-8 flex items-center justify-center hover:!bg-bds-teal hover:!text-white transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bds-teal-dark">Request a Mutual Evaluation</Link>
    </div>
    <p className="mt-3 text-xs text-bds-cream/90">Takes 2 minutes · Response in 48 hrs. · In-House Corporate Review</p>
    <p className="mt-4 max-w-[40ch] text-xs leading-5 text-bds-cream/80 mx-auto lg:mx-0">Confidential inquiry only — not an application, territory reservation, or franchise offer.</p>
  </div>
);

export const FranchiseFinalCta = ({
  fullBleed = true,
  minLiquidCapital = PUBLISHED_FINANCIAL_THRESHOLDS.liquidCapitalRequirement,
  minNetWorth = PUBLISHED_FINANCIAL_THRESHOLDS.minimumNetWorth,
  operatingLocationCount = 2,
  operatingLocationLabel = "corporate locations in Utah",
  processStages = defaultProcessStages,
}: GlobalEvaluationCtaProps) => {
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [isInlineFormOpen, setIsInlineFormOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const hasTrackedView = useRef(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const attributionKeys = ["source_page", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const attributionQuery = new URLSearchParams();
  for (const key of attributionKeys) {
    const value = searchParams.get(key);
    if (value) attributionQuery.set(key, value);
  }
  if (!attributionQuery.has("source_page")) attributionQuery.set("source_page", pathname);
  const contactHref = "/franchise/contact" + (attributionQuery.size ? "?" + attributionQuery.toString() : "");
  const isProcessEducationPage = pathname === "/franchise/process";
  const isCandidateProfileSource = searchParams.get("source_page") === "homepage_candidate_profile";
  const analyticsContext = {
    page_path: pathname,
    page_type: pathname.split("/").filter(Boolean).pop() || "franchise",
    cta_variant: "global_evaluation",
    placement: isProcessEducationPage ? "process_final_cta" : "global_footer",
  };
  const trackPrimaryInquiryTransition = () => {
    trackFunnelEvent(
      isCandidateProfileSource
        ? "candidate_profile_inquiry_progression"
        : isProcessEducationPage
          ? "process_inquiry_click"
          : "global_cta_primary_click",
      isProcessEducationPage
        ? { ...analyticsContext, process_interaction: "inquiry_transition" }
        : { ...analyticsContext, placement: isCandidateProfileSource ? "candidate_profile" : analyticsContext.placement },
    );
  };

  useEffect(() => {
    if (isProcessEducationPage) return;

    const section = sectionRef.current;
    if (!section || hasTrackedView.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || hasTrackedView.current) return;
      hasTrackedView.current = true;
      trackFunnelEvent("global_cta_view", analyticsContext);
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(section);
    return () => observer.disconnect();
  }, [pathname, isProcessEducationPage]);

  return (
  <section ref={sectionRef} className={fullBleed ? "relative left-1/2 w-screen -translate-x-1/2 bg-bds-teal-dark py-12 sm:py-16 lg:py-16" : "content-wide section-standard"} aria-label="Franchise evaluation request">
    <div className={fullBleed ? "content-wide text-white" : "bg-bds-teal-dark rounded-2xl sm:rounded-3xl p-4 sm:p-10 lg:p-14 text-white shadow-xl relative overflow-hidden"}>
      <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(440px,520px)] gap-6 lg:gap-8 xl:gap-12 items-start">
        <div className="w-full lg:col-span-1 text-center lg:text-left space-y-4 order-1 lg:pt-4">
          <h2 className="homepage-section-heading text-bds-cream lg:text-5xl">Let&apos;s Build Something Together.</h2>
          <p className="homepage-section-description text-bds-cream/80 lg:text-lg mx-auto lg:mx-0">For experienced operators ready for a confidential, two-way evaluation.{!isProcessEducationPage ? <> <Link href="/franchise/process" onClick={() => trackFunnelEvent("global_cta_secondary_click", { ...analyticsContext, secondary_destination: "/franchise/process" })} className="font-semibold underline underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-gold rounded-sm">See how we partner &rarr;</Link></> : null}</p>
          <EvaluationActionCluster href={contactHref} onPrimaryClick={trackPrimaryInquiryTransition} />
        </div>
        {/* Qualification module: consolidate proof, financial readiness, and process into one scannable container. */}
        <div className="w-full lg:col-span-1 order-2 lg:order-2 rounded-2xl border border-white/20 bg-white/10 p-6 space-y-5">
          <div className="text-left">
            {/* Verified operating proof replaces unsupported testimonial or operator-count claims. */}
            {/* Configured operating proof is a real qualification signal, not generic social proof. */}
            <p className="text-xs font-semibold text-bds-cream/90">Operating proof: {operatingLocationCount} {operatingLocationLabel}</p>
            <h3 className="heading-panel text-bds-cream mt-2">Franchise Evaluation Benchmarks</h3>
          </div>
          <div className="grid grid-cols-2 gap-5 border-y border-white/15 py-4 text-left"><div className="border-r border-white/15 pr-5"><div className="text-3xl font-black font-heading leading-none text-white">{formatCompactCurrency(minLiquidCapital)}</div><div className="mt-2 text-xs font-semibold text-bds-cream/85">Min. Liquid Capital</div></div><div><div className="text-3xl font-black font-heading leading-none text-white">{formatCompactCurrency(minNetWorth)}</div><div className="mt-2 text-xs font-semibold text-bds-cream/85">Min. Net Worth</div></div></div>
          {/* Process visualization: replaces a prose bullet with an at-a-glance four-stage path. */}
          <ol className="relative grid grid-cols-4 gap-2 text-center before:pointer-events-none before:absolute before:left-[12.5%] before:right-[12.5%] before:top-3 before:h-px before:bg-white/25" aria-label="Four-stage mutual evaluation process">{processStages.map((stage, index) => <li key={stage.label} className="relative space-y-2"><span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-bds-gold text-[10px] font-black text-brand-charcoal">{index + 1}</span><span className="block text-[11px] font-semibold leading-none text-bds-cream/90">{stage.label}</span></li>)}</ol>
          {/* Tappable process explainer elevates the stated mutual-vetting differentiator. */}
          <button type="button" onClick={() => setIsProcessOpen((open) => !open)} aria-expanded={isProcessOpen} aria-controls="global-evaluation-process-details" className="touch-target-inline w-full justify-center gap-1.5 text-xs font-semibold text-bds-cream underline underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-gold rounded-sm">Explore the 4-stage process <ChevronDown className={`h-4 w-4 transition-transform duration-200 motion-reduce:transition-none ${isProcessOpen ? "rotate-180" : ""}`} aria-hidden="true" /></button>
          <ol id="global-evaluation-process-details" hidden={!isProcessOpen} className="space-y-2 text-left">{processStages.map((stage, index) => <li key={stage.label} className="text-xs text-bds-cream/90"><span className="font-bold text-bds-cream">{index + 1}. {stage.label}:</span> {stage.description}</li>)}</ol>
          <p className="border-t border-white/15 pt-4 text-xs leading-relaxed text-bds-cream/85">Direct leadership and operational onboarding throughout the evaluation.</p>
        </div>
        {/* Decision zone: whitespace separates the single action from qualification information without another decorative rule. */}
        <div className="hidden">
          {/* Single dominant CTA: one filled action avoids competing conversion choices. */}
          <div className="mx-auto w-full max-w-sm lg:mx-0">
            <button type="button" onClick={() => setIsInlineFormOpen(true)} className="btn-secondary text-sm sm:text-base font-bold w-full min-h-[52px] sm:w-auto sm:min-w-[300px] sm:px-8 flex items-center justify-center hover:!bg-bds-teal hover:!text-white transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bds-teal-dark">Request a Mutual Evaluation</button>
          </div>
          {isInlineFormOpen ? <InlineEvaluationForm /> : null}
          {/* Trust caption: plain text, not a pill or alternate CTA. */}
          <p className="mt-3 text-xs text-bds-cream/90">Takes 2 minutes · Response in 48 hrs. · In-House Corporate Review</p>
          <p className="mt-4 max-w-[40ch] text-[10px] leading-4 tracking-wide text-bds-cream/80 mx-auto lg:mx-0">Confidential inquiry only — not an application, territory reservation, or franchise offer.</p>
        </div>
      </div>
    </div>
  </section>
  );
};

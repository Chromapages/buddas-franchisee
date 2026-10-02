"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { FranchiseFinalCtaDesktop } from "@/src/components/public/franchise-final-cta-desktop";
import { FranchiseFinalCtaMobile } from "@/src/components/public/franchise-final-cta-mobile";
import { FinalCtaAction } from "@/src/components/public/franchise-final-cta-shared";
import { FRANCHISE_FINAL_CTA_CONTENT } from "@/src/features/franchise/final-cta-content";
import { trackFunnelEvent, trackFranchiseFunnelEvent } from "@/src/lib/analytics";

export type GlobalEvaluationCtaProps = {
  fullBleed?: boolean;
  simplified?: boolean;
  content?: typeof FRANCHISE_FINAL_CTA_CONTENT;
};

/** Shared controller; the mobile and desktop components own their own presentation. */
export const FranchiseFinalCta = ({
  fullBleed = true,
  simplified = false,
  content = FRANCHISE_FINAL_CTA_CONTENT,
}: GlobalEvaluationCtaProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasTrackedView = useRef(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const attributionQuery = new URLSearchParams();
  for (const key of ["source_page", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const value = searchParams.get(key);
    if (value) attributionQuery.set(key, value);
  }
  if (!attributionQuery.has("source_page")) attributionQuery.set("source_page", pathname);
  const contactHref = content.primaryAction.href + (attributionQuery.size ? "?" + attributionQuery.toString() : "");
  const isProcessEducationPage = pathname === "/franchise/process";
  const isCandidateProfileSource = searchParams.get("source_page") === "homepage_candidate_profile";
  const analyticsContext = { page_path: pathname, page_type: pathname.split("/").filter(Boolean).pop() || "franchise", cta_variant: "global_evaluation", placement: isProcessEducationPage ? "process_final_cta" : "global_footer" };

  const onPrimaryClick = () => {
    trackFranchiseFunnelEvent("franchise_mutual_evaluation_started", { cta_variant: "mutual_fit_gate" });
    trackFunnelEvent(
      isCandidateProfileSource ? "candidate_profile_inquiry_progression" : isProcessEducationPage ? "process_inquiry_click" : "global_cta_primary_click",
      isProcessEducationPage ? { ...analyticsContext, process_interaction: "inquiry_transition" } : { ...analyticsContext, placement: isCandidateProfileSource ? "candidate_profile" : analyticsContext.placement },
    );
  };
  const onProcessLinkClick = () => {
    trackFranchiseFunnelEvent("franchise_process_opened", { cta_variant: "mutual_fit_gate" });
    trackFunnelEvent("global_cta_secondary_click", { ...analyticsContext, secondary_destination: "/franchise/process" });
  };

  useEffect(() => {
    if (isProcessEducationPage || !sectionRef.current || hasTrackedView.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || hasTrackedView.current) return;
      hasTrackedView.current = true;
      trackFranchiseFunnelEvent("franchise_cta_viewed", { cta_variant: "mutual_fit_gate" });
      trackFunnelEvent("global_cta_view", analyticsContext);
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [pathname, isProcessEducationPage]);

  const presentation = {
    fullBleed,
    contactHref,
    eyebrow: content.eyebrow,
    title: content.title,
    description: content.description,
    qualificationBenchmark: content.qualificationBenchmark,
    expectation: content.expectation,
    boundary: content.boundary,
    primaryActionLabel: content.primaryAction.label,
    processHref: content.researchAction.href,
    processActionLabel: content.researchAction.label,
    onPrimaryClick,
    onProcessLinkClick,
  };

  if (simplified) return <div ref={sectionRef}>
    <section aria-labelledby="franchise-final-cta-title" className={fullBleed ? "home-section bg-bds-teal-dark text-bds-cream" : "home-section content-wide rounded-xl bg-bds-teal-dark p-8 text-bds-cream"}>
      <div className="content-wide grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.7fr)] lg:items-center lg:gap-16">
        <div><h2 id="franchise-final-cta-title" className="home-section-title text-bds-cream">{content.title}</h2><p className="home-section-intro text-bds-cream">We&apos;ll determine together whether Budda&apos;s is the right fit.</p></div>
        <div><FinalCtaAction href={contactHref} label={content.primaryAction.label} onPrimaryClick={onPrimaryClick} fullWidth /><p className="mt-4 max-w-[48ch] font-body text-sm leading-6 text-bds-cream">{content.boundary}</p></div>
      </div>
    </section>
  </div>;

  return <div ref={sectionRef}>
    <FranchiseFinalCtaMobile {...presentation} />
    <FranchiseFinalCtaDesktop {...presentation} />
  </div>;
};

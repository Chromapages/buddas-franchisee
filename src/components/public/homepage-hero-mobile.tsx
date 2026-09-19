import { ArrowRight } from "lucide-react";
import { HeroInquiryLink } from "@/src/components/public/hero-inquiry-link";
import { HeroOpportunityLink } from "@/src/components/public/hero-opportunity-link";
import { FRANCHISE_HOME_HERO_CONTENT } from "@/src/features/franchise/home-hero-content";

/**
 * Mobile-only homepage entry point. Its content order and spacing intentionally
 * differ from desktop so mobile redesigns do not cascade across the hero split.
 */
export const HomepageHeroMobile = ({ content = FRANCHISE_HOME_HERO_CONTENT }: { content?: typeof FRANCHISE_HOME_HERO_CONTENT }) => {
  const hero = content.mobile;

  return (
    <section className="homepage-mobile-hero hero:hidden bg-bds-cream">
      <div className="homepage-mobile-hero-content">
        <div className="homepage-mobile-hero-copy">
          <div className="flex items-center gap-2.5 font-heading text-xs font-semibold uppercase leading-[1.5] tracking-[0.12em] text-bds-teal-dark">
            <span>{hero.eyebrow}</span>
          </div>

          <div role="heading" aria-level={1} className="homepage-mobile-hero-title font-heading font-bold uppercase leading-[1.02] tracking-[-0.02em] text-bds-text-heading [overflow-wrap:anywhere]">
            {hero.headline}
          </div>

          <p className="font-body text-base font-normal leading-[1.5] text-bds-text-body">
            {hero.description}
          </p>

          <div className="homepage-mobile-hero-actions">
            <HeroOpportunityLink
              href={content.opportunity.href}
              className="touch-target flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-bds-action-primary px-6 py-3.5 font-heading text-[15px] font-semibold text-bds-action-primary-text hover:bg-bds-teal-ink active:bg-bds-teal-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-teal-dark focus-visible:ring-offset-2 focus-visible:ring-offset-bds-cream"
            >
              <span>{hero.opportunityLabel}</span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </HeroOpportunityLink>
            <HeroInquiryLink
              href={content.inquiry.href}
              className="touch-target inline-flex min-h-11 w-full max-w-full items-center justify-center gap-1.5 px-3 text-center font-heading text-sm font-semibold leading-[1.5] text-bds-teal-dark underline decoration-current decoration-1 underline-offset-4 hover:text-bds-teal-ink active:text-bds-teal-ink"
            >
              <span>
                {hero.inquiryLabel}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </HeroInquiryLink>
          </div>
        </div>
      </div>

    </section>
  );
};

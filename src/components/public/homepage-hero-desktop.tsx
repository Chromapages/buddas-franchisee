import { ArrowRight } from "lucide-react";
import { HeroInquiryLink } from "@/src/components/public/hero-inquiry-link";
import { HeroOpportunityLink } from "@/src/components/public/hero-opportunity-link";
import { FRANCHISE_HOME_HERO_CONTENT } from "@/src/features/franchise/home-hero-content";

/** Desktop-only hero: its image-led composition is intentionally independent from mobile. */
export const HomepageHeroDesktop = ({ content = FRANCHISE_HOME_HERO_CONTENT }: { content?: typeof FRANCHISE_HOME_HERO_CONTENT }) => {
  const hero = content.desktop;
  const headlineLines = hero.headline === FRANCHISE_HOME_HERO_CONTENT.desktop.headline
    ? ["Build the next", "Budda's."]
    : [hero.headline];

  return (
    <section className="franchise-home-hero relative z-10 hidden overflow-hidden bg-transparent hero:block">
      <div className="franchise-home-hero-content content-wide relative z-10">
        <div className="franchise-home-hero-grid">
          <div className="franchise-home-hero-copy text-left">
            <p className="franchise-home-hero-eyebrow">{hero.eyebrow}</p>
            <h1 className="franchise-home-hero-title heading-page text-bds-text-heading">
              {headlineLines.map((line) => <span key={line}>{line}</span>)}
            </h1>
            <p className="franchise-home-hero-description text-bds-text-body">
              {hero.description}
            </p>
            <div className="franchise-hero-action-context"><div className="franchise-hero-actions">
              <HeroOpportunityLink href={content.opportunity.href} className="franchise-hero-primary-action touch-target inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-bds-action-primary px-6 py-3.5 text-[15px] font-bold text-bds-action-primary-text transition-colors duration-200 hover:bg-bds-teal-ink active:bg-bds-teal-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-teal-dark focus-visible:ring-offset-2 motion-reduce:transition-none sm:text-base"><span>{content.opportunity.label}</span><ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" /></HeroOpportunityLink>
              <HeroInquiryLink href={content.inquiry.href} className="franchise-hero-secondary-action touch-target inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-bds-teal-dark transition-colors duration-200 hover:text-bds-teal-ink active:text-bds-teal-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2 sm:text-base"><span>Start the 3-Step Inquiry</span><ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" /></HeroInquiryLink>
            </div></div>
          </div>
          <div className="franchise-home-hero-image-space" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};

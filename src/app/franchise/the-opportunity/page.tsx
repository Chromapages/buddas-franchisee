import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { isActiveOfferingEnabled } from "@/src/lib/flags";
import {
  FRANCHISE_INVESTMENT_DISCLOSURE,
  ITEM_19_GOVERNANCE,
  isApprovedPublicFinancialPlacement,
} from "@/src/features/financials/financial-data";
import { FRANCHISE_CANDIDATE_CRITERIA } from "@/src/features/franchise/candidate-criteria";
import { FinancialDisclosure } from "@/src/components/public/financial-disclosure";
import { CandidateReadinessCheck } from "@/src/components/public/candidate-readiness-check";
import { FranchisePageHeader } from "@/src/components/public/franchise-page-header";
import { Item19FprTable } from "@/src/components/public/item19-fpr-table";
import { OpportunityIndex } from "@/src/components/public/opportunity-index";
import { OpportunityIndexEnhancer } from "@/src/components/public/opportunity-index-enhancer";
import { OpportunityAnalyticsLink } from "@/src/components/public/opportunity-analytics-link";
import { TerritoryChecker } from "@/src/components/public/territory-checker";
import {
  getPublicJurisdictionDisplay,
  PUBLIC_JURISDICTION_STATUSES,
} from "@/src/features/territory/public-jurisdiction-status";
import { getOpportunityDossierChapter, OPPORTUNITY_DOSSIER_CONTENT } from "@/src/features/franchise/opportunity-content";

const OPPORTUNITY_BREADCRUMBS = [
  {
    name: "Franchising",
    href: "/franchise",
    absoluteHref: "https://buddasfranchise.com/franchise",
  },
  {
    name: "The Opportunity",
    href: "/franchise/the-opportunity",
    absoluteHref: "https://buddasfranchise.com/franchise/the-opportunity",
  },
] as const;

export const metadata: Metadata = {
  title: OPPORTUNITY_DOSSIER_CONTENT.metadata.title,
  description: OPPORTUNITY_DOSSIER_CONTENT.metadata.description,
  alternates: {
    canonical: "/franchise/the-opportunity",
  },
  openGraph: {
    title: OPPORTUNITY_DOSSIER_CONTENT.metadata.title,
    description: OPPORTUNITY_DOSSIER_CONTENT.metadata.description,
    url: "/franchise/the-opportunity",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Budda's Hawaiian Bakery & Grill franchise opportunity",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: OPPORTUNITY_DOSSIER_CONTENT.metadata.title,
    description: OPPORTUNITY_DOSSIER_CONTENT.metadata.description,
    images: ["/images/og-image.png"],
  },
};

const OpportunityPageStructuredData = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://buddasfranchise.com/franchise/the-opportunity#webpage",
        url: "https://buddasfranchise.com/franchise/the-opportunity",
        name: OPPORTUNITY_DOSSIER_CONTENT.metadata.title,
        description: OPPORTUNITY_DOSSIER_CONTENT.metadata.description,
        inLanguage: "en-US",
        isPartOf: {
          "@id": "https://buddasfranchise.com/#website",
        },
        about: {
          "@id": "https://buddasfranchise.com/#organization",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://buddasfranchise.com/franchise/the-opportunity#breadcrumb",
        itemListElement: OPPORTUNITY_BREADCRUMBS.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.absoluteHref,
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
};

const DossierSection = ({
  number,
  eyebrow,
  title,
  description,
  id,
  children,
  contextualLink,
  tone = "default",
  railLayout = false,
  isOpeningChapter = false,
  legacyIds = [],
  chapterLabelAs = "h2",
  titleHeadingAs = "h3",
}: {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  id: string;
  children: ReactNode;
  contextualLink?: { href: string; label: string; destinationId: string };
  tone?: "default" | "sand";
  /** Use inside the wide-screen dossier rail without applying a second page container. */
  railLayout?: boolean;
  /** Tightens the handoff from the dossier title spread into the first chapter. */
  isOpeningChapter?: boolean;
  /** Stable aliases preserve inbound links after a chapter ID is clarified. */
  legacyIds?: readonly string[];
  /** The opening chapter uses its candidate-facing title as the H2. */
  chapterLabelAs?: "h2" | "p";
  titleHeadingAs?: "h2" | "h3";
}) => (
  <section id={id} aria-labelledby={titleHeadingAs === "h2" ? `${id}-heading` : undefined} className={`${tone === "sand" ? "border-y border-brand-charcoal/10 bg-brand-sand/45" : ""} scroll-mt-[var(--opportunity-anchor-offset)] ${isOpeningChapter ? "pb-12 pt-8 lg:pb-14 lg:pt-10" : "py-12 lg:py-14"}`}>
    {legacyIds.map((legacyId) => <span key={legacyId} id={legacyId} aria-hidden="true" className="block h-0 scroll-mt-[var(--opportunity-anchor-offset)]" />)}
    <div className={railLayout ? "min-w-0" : "content-wide"}>
      <div className="grid items-start gap-8 xl:grid-cols-[11rem_minmax(0,1fr)] xl:gap-9">
        <div>
          {chapterLabelAs === "h2" ? <h2 data-opportunity-chapter-heading tabIndex={-1} className="flex items-baseline gap-3 xl:flex-col xl:items-start xl:gap-2">
            <span className="block font-heading text-3xl font-black text-bds-teal-dark xl:text-4xl">{number}</span>
            <span className="block text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-bds-teal-dark">{eyebrow}</span>
          </h2> : <p className="flex items-baseline gap-3 xl:flex-col xl:items-start xl:gap-2">
            <span className="block font-heading text-3xl font-black text-bds-teal-dark xl:text-4xl">{number}</span>
            <span className="block text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-bds-teal-dark">{eyebrow}</span>
          </p>}
        </div>
        <div className="min-w-0">
          <div className="max-w-3xl">
            {title !== eyebrow && titleHeadingAs === "h2" ? <h2 id={`${id}-heading`} data-opportunity-chapter-heading tabIndex={-1} className="heading-section text-brand-charcoal">{title}</h2> : null}
            {title !== eyebrow && titleHeadingAs === "h3" ? <h3 className="heading-section text-brand-charcoal">{title}</h3> : null}
            <p className="mt-3 text-base leading-7 text-brand-charcoal/75">{description}</p>
          </div>
          <div className="mt-8 lg:mt-10">{children}</div>
          {contextualLink ? (
            <OpportunityAnalyticsLink href={contextualLink.href} event="opportunity_context_link_click" sectionId={id} destinationId={contextualLink.destinationId} className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-bds-teal-dark underline underline-offset-4 hover:text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-teal-dark focus-visible:ring-offset-2">
              {contextualLink.label}
            </OpportunityAnalyticsLink>
          ) : null}
        </div>
      </div>
    </div>
  </section>
);

export default function TheOpportunityPage() {
  const activeOffering = isActiveOfferingEnabled();
  const showPublicInvestment = activeOffering && isApprovedPublicFinancialPlacement(
    FRANCHISE_INVESTMENT_DISCLOSURE.governance,
    "opportunity",
  );
  const showItem19 = activeOffering && isApprovedPublicFinancialPlacement(
    ITEM_19_GOVERNANCE,
    "item19",
  );
  const publicJurisdictions = PUBLIC_JURISDICTION_STATUSES.map(getPublicJurisdictionDisplay);

  const buddasFitCriteria = [
    {
      label: "Operating experience",
      title: FRANCHISE_CANDIDATE_CRITERIA.operatingExperience.meaning,
      description: `${FRANCHISE_CANDIDATE_CRITERIA.operatingExperience.heading}. ${FRANCHISE_CANDIDATE_CRITERIA.operatingExperience.description}`,
    },
    {
      label: "Financial qualification",
      title: "Capital readiness",
      description: "Financial readiness is reviewed alongside operating experience and leadership expectations.",
    },
    {
      label: "Operating quality evaluated",
      title: "Hospitality leadership, standards discipline, and stewardship",
      description: FRANCHISE_CANDIDATE_CRITERIA.stewardship.description,
    },
  ] as const;

  const candidateEvaluationAreas = [
    {
      title: "Concept and operating model",
      description: "Whether the bakery-and-grill model, product standards, and day-to-day operating expectations fit your leadership approach.",
    },
    {
      title: "Market and development context",
      description: "The public state offering status, how a specific market is reviewed, and the fact that an inquiry does not reserve a territory.",
    },
    {
      title: "Capital and disclosure context",
      description: "How candidate capital requirements differ from estimated initial investment and which cost information is delivered through the FDD.",
    },
    {
      title: "Support and partnership expectations",
      description: "Whether the support runway and mutual evaluation process match the way you want to build and operate a business.",
    },
  ] as const;

  const readinessItems = [
    {
      id: "operating-experience",
      label: "I recognize the published operating-experience requirement.",
      description: "Review the restaurant leadership and multi-unit experience described in the fit criteria above.",
    },
    {
      id: "capital-criteria",
      label: "I understand the current financial information status.",
      description: "Review the Capital & Disclosure chapter for the financial information currently available on this page.",
    },
    {
      id: "market-interest",
      label: "I have a target market I would like to discuss.",
      description: "State offering status is informational; a specific commercial market is reviewed individually during qualification.",
    },
    {
      id: "diligence-path",
      label: "I am prepared to review the concept, support, and disclosure path.",
      description: "Use the opportunity dossier and mutual evaluation process to decide whether further discussion makes sense.",
    },
  ] as const;

  const opportunityThesisItems = OPPORTUNITY_DOSSIER_CONTENT.thesis.items;
  const opportunityThesisChapter = getOpportunityDossierChapter("opportunity-thesis");
  const capitalChapter = getOpportunityDossierChapter("capital-disclosure");
  const territoryChapter = getOpportunityDossierChapter("markets-territory");
  const qualificationsChapter = getOpportunityDossierChapter("mutual-operator-fit");
  const supportChapter = getOpportunityDossierChapter("operator-support");
  const nextStepChapter = getOpportunityDossierChapter("next-step");

  return (
    <div data-opportunity-dossier>
      <OpportunityPageStructuredData />
      <OpportunityIndexEnhancer />
      <FranchisePageHeader
        eyebrow={{
          label: OPPORTUNITY_DOSSIER_CONTENT.hero.eyebrow.text,
        }}
        contentClassName="flex flex-col"
        preTitle={
          <div className="mb-[1rem]">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-brand-charcoal/70">
                {OPPORTUNITY_BREADCRUMBS.map((item, index) => (
                  <li key={item.href} className="flex items-center gap-2">
                    {index > 0 ? <span aria-hidden="true" className="text-brand-charcoal/45">/</span> : null}
                    {index === OPPORTUNITY_BREADCRUMBS.length - 1 ? (
                      <span aria-current="page" className="font-semibold text-brand-charcoal">{item.name}</span>
                    ) : (
                      <Link href={item.href} className="font-semibold text-bds-teal-dark underline underline-offset-4 hover:text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-teal-dark focus-visible:ring-offset-2">{item.name}</Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        }
        title={OPPORTUNITY_DOSSIER_CONTENT.hero.title.text}
        eyebrowClassName="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bds-action-primary"
        titleClassName="heading-page mb-[1rem] max-w-[23ch] text-[clamp(2.25rem,2.65vw,3.0625rem)]"
        description={OPPORTUNITY_DOSSIER_CONTENT.hero.description.text}
        descriptionClassName="text-base leading-relaxed text-bds-text-body sm:text-xl"
        sectionClassName="border-b border-bds-teal-dark/10 bg-bds-cream/60 py-12 xl:py-12"
        containerClassName="content-wide"
        layoutClassName="lg:items-start lg:grid-cols-1 lg:gap-8 dossier-spine:grid-cols-[minmax(34rem,1.15fr)_minmax(17rem,0.85fr)] dossier-spine:gap-8"
        aside={
          <figure className="relative aspect-video overflow-hidden rounded-3xl border-4 border-white bg-brand-sand shadow-xl dossier-spine:aspect-[2/1]">
            <Image
              src="/images/buddas-contact-service.png"
              alt="A Budda's team member greeting a guest at a bakery counter"
              fill
              className="object-cover object-[38%_50%]"
              sizes="(max-width: 67.25rem) 100vw, 34rem"
            />
          </figure>
        }
      />

      <div className="content-wide pb-8 pt-6 dossier-spine:hidden">
        <OpportunityIndex layout="inline" labelId="opportunity-index-inline-heading" />
      </div>

      <div className="content-wide">
        <div className="dossier-spine:grid dossier-spine:grid-cols-[17rem_minmax(0,1fr)] dossier-spine:gap-8">
          <aside className="hidden dossier-spine:mt-6 dossier-spine:block">
            <div className="opportunity-dossier-spine sticky">
              <OpportunityIndex labelId="opportunity-index-dossier-spine-heading" />
            </div>
          </aside>
          <div className="min-w-0">
      <DossierSection
        id={opportunityThesisChapter.id}
        number={opportunityThesisChapter.number}
        eyebrow={opportunityThesisChapter.label.text}
        title={OPPORTUNITY_DOSSIER_CONTENT.thesis.title.text}
        description={OPPORTUNITY_DOSSIER_CONTENT.thesis.description.text}
        contextualLink={{ href: "/franchise/why-buddas#four-pillars", label: "Review Budda's four operating pillars", destinationId: "why-buddas-four-pillars" }}
        railLayout
        isOpeningChapter
        chapterLabelAs="p"
        titleHeadingAs="h2"
      >
        <dl className="grid border-y border-bds-teal-dark/65 lg:grid-cols-2">
          {opportunityThesisItems.map((item, index) => (
            <div key={item.label.text} className={`p-6 sm:p-7 ${index > 0 ? "border-t border-bds-teal-dark/65" : ""} ${index === 1 ? "lg:border-t-0" : ""} ${index % 2 === 1 ? "lg:border-l lg:border-bds-teal-dark/65" : ""} ${index > 1 ? "lg:border-t lg:border-bds-teal-dark/65" : ""}`}>
              <dt className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-bds-teal-dark">{item.label.text}</dt>
              <dd className="mt-3"><h3 className="font-heading text-xl font-bold text-brand-charcoal">{item.title.text}</h3></dd>
              <dd className="mt-2 text-base leading-7 text-brand-charcoal/75">{item.description.text}</dd>
              <dd className="mt-5 pt-1">
                <p className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-bds-teal-dark">{OPPORTUNITY_DOSSIER_CONTENT.thesis.operatorLensLabel.text}</p>
                <p className="mt-2 text-sm leading-6 text-brand-charcoal/75 sm:text-base">{item.operatorLens.text}</p>
              </dd>
            </div>
          ))}
        </dl>
      </DossierSection>

      <DossierSection
        id={capitalChapter.id}
        legacyIds={capitalChapter.legacyIds}
        number={capitalChapter.number}
        eyebrow={capitalChapter.label.text}
        title={OPPORTUNITY_DOSSIER_CONTENT.capital.title.text}
        description={OPPORTUNITY_DOSSIER_CONTENT.capital.description.text}
        contextualLink={{ href: "/franchise/faq#financial-qualifications", label: "Read the financial qualifications FAQ", destinationId: "faq-financial-qualifications" }}
        railLayout
      >
        <FinancialDisclosure isActiveOffering={showPublicInvestment} />
      </DossierSection>

      {showItem19 ? (
        <section className="pb-16">
          <Item19FprTable />
        </section>
      ) : null}

      <DossierSection
        id={territoryChapter.id}
        legacyIds={territoryChapter.legacyIds}
        number={territoryChapter.number}
        eyebrow={territoryChapter.label.text}
        title="Where development may be considered"
        description="State offering status and the availability of a specific market are reviewed separately. Selecting a state below does not confirm an available territory or reserve one."
        contextualLink={{ href: "/franchise/faq#territory-award-process", label: "See how market territories are reviewed", destinationId: "faq-territory-award-process" }}
        tone="sand"
        railLayout
      >
        <TerritoryChecker jurisdictions={publicJurisdictions} />
      </DossierSection>

      <DossierSection
        id={qualificationsChapter.id}
        legacyIds={qualificationsChapter.legacyIds}
        number={qualificationsChapter.number}
        eyebrow={qualificationsChapter.label.text}
        title="Mutual Operator Fit"
        description="Budda&apos;s reviews verified requirements and operating qualities. In parallel, a prospective operator should examine the concept, market, capital context, support runway, and partnership expectations."
        contextualLink={{ href: "/franchise/process", label: "Review the mutual evaluation process", destinationId: "mutual-evaluation-process" }}
        railLayout
      >
        <div className="grid gap-10 xl:grid-cols-2 xl:gap-12">
          <section aria-labelledby="buddas-fit-heading" className="border-t-2 border-bds-teal-dark/70 pt-5">
            <h3 id="buddas-fit-heading" className="heading-compact text-brand-charcoal">Budda&apos;s evaluates</h3>
            <dl className="mt-5 border-y border-bds-teal-dark/15">
              {buddasFitCriteria.map((criterion, index) => (
                <div key={criterion.title} className={`py-5 ${index > 0 ? "border-t border-bds-teal-dark/15" : ""}`}>
                  <dt className="text-[0.8125rem] font-bold uppercase tracking-[0.1em] text-bds-teal-dark">{criterion.label}</dt>
                  <dd className="mt-2 font-heading text-xl font-bold text-brand-charcoal">{criterion.title}</dd>
                  <dd className="mt-2 text-base leading-7 text-brand-charcoal/75">{criterion.description}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="candidate-evaluation-heading" className="border-t-2 border-brand-clay/70 pt-5">
            <h3 id="candidate-evaluation-heading" className="heading-compact text-brand-charcoal">Candidate should evaluate</h3>
            <ol className="mt-5 border-y border-bds-teal-dark/15">
              {candidateEvaluationAreas.map((area, index) => (
                <li key={area.title} className={`grid gap-3 py-5 sm:grid-cols-[2.5rem_minmax(0,1fr)] sm:gap-5 ${index > 0 ? "border-t border-bds-teal-dark/15" : ""}`}>
                  <span className="font-heading text-2xl font-black text-bds-teal-dark">0{index + 1}</span>
                  <div>
                    <h4 className="font-heading text-xl font-bold text-brand-charcoal">{area.title}</h4>
                    <p className="mt-2 text-base leading-7 text-brand-charcoal/75">{area.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <CandidateReadinessCheck items={readinessItems} />
      </DossierSection>

      <DossierSection
        id={supportChapter.id}
        legacyIds={supportChapter.legacyIds}
        number={supportChapter.number}
        eyebrow={supportChapter.label.text}
        title="How support and operator responsibility work across the runway"
        description="The support model follows real operating phases. Budda&apos;s provides defined systems and resources; the operator remains responsible for local decisions, leadership, and execution."
        contextualLink={{ href: "/franchise/faq#training-and-support", label: "Read the training and support FAQ", destinationId: "faq-training-support" }}
        tone="sand"
        railLayout
      >
        <ol className="border-y border-bds-teal-dark/25">
          <li className="hidden grid-cols-[5rem_minmax(13rem,0.55fr)_minmax(0,1fr)_minmax(0,0.9fr)] gap-6 border-b border-bds-teal-dark/15 py-4 text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-bds-teal-dark xl:grid">
            <span>Phase</span>
            <span>Support area</span>
            <span>Budda&apos;s provides</span>
            <span>Operator remains responsible for</span>
          </li>
          {OPPORTUNITY_DOSSIER_CONTENT.support.phases.map((phase, index) => (
            <li key={phase.number} className={`grid gap-4 py-6 xl:grid-cols-[5rem_minmax(13rem,0.55fr)_minmax(0,1fr)_minmax(0,0.9fr)] xl:gap-6 ${index > 0 ? "border-t border-bds-teal-dark/15" : ""}`}>
              <div>
                <span className="font-heading text-3xl font-black text-bds-teal-dark">{phase.number}</span>
                <span className="mt-1 block text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-bds-teal-dark">{phase.phase.text}</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-brand-charcoal">{phase.title.text}</h3>
              <div>
                <p className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-bds-teal-dark xl:hidden">Budda&apos;s provides</p>
                <p className="mt-1 text-base leading-7 text-brand-charcoal/75 xl:mt-0">{phase.support.text}</p>
              </div>
              <div>
                <p className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-bds-teal-dark xl:hidden">Operator remains responsible for</p>
                <p className="mt-1 text-base leading-7 text-brand-charcoal/75 xl:mt-0">{phase.operatorResponsibility.text}</p>
              </div>
            </li>
          ))}
        </ol>
          </DossierSection>
          <section id={nextStepChapter.id} aria-labelledby="opportunity-next-step-heading" className="scroll-mt-[var(--opportunity-anchor-offset)] bg-bds-teal-dark px-6 py-14 text-bds-cream lg:px-10 lg:py-18">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] xl:items-end xl:gap-12">
              <div className="min-w-0">
                <h2 data-opportunity-chapter-heading tabIndex={-1} className="text-[0.8125rem] font-bold uppercase tracking-[0.1em] text-bds-gold-accessible">{nextStepChapter.number} / {nextStepChapter.label.text}</h2>
                <h3 id="opportunity-next-step-heading" className="mt-3 break-words font-heading text-4xl font-black leading-[1.05] tracking-tight text-bds-cream sm:text-5xl">Decide whether a mutual evaluation is the right next conversation.</h3>
                <p className="mt-4 max-w-[58ch] text-base leading-7 text-bds-cream/85">Request franchise information when you are ready to discuss your operating background, target market, and capital readiness. We review inquiries within 2 business days.</p>
              </div>

              <div className="min-w-0 border-l-2 border-bds-gold pl-5">
                <OpportunityAnalyticsLink href="/franchise/contact" event="opportunity_request_info_click" sectionId="next-step" destinationId="franchise-contact" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-bds-gold px-5 py-3 text-base font-bold text-bds-teal-ink hover:bg-bds-gold-accessible focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bds-teal-dark">Request Franchise Information</OpportunityAnalyticsLink>
                <OpportunityAnalyticsLink href="/franchise/process" event="opportunity_how_it_works_click" sectionId="next-step" destinationId="mutual-evaluation-process" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-bds-cream underline underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bds-teal-dark">Review How It Works</OpportunityAnalyticsLink>
                <p className="mt-5 border-t border-white/20 pt-4 text-sm leading-6 text-bds-cream/80">This begins an inquiry—not an application, territory reservation, franchise offer, or approval decision.</p>
              </div>
            </div>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
}

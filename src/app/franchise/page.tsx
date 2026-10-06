import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, ChartNoAxesCombined, ChefHat, CircleCheck, Croissant, FileSearch, FileText, Headphones, Heart, Leaf, Megaphone, Phone, Settings, Store, Sunrise, UsersRound, Utensils, Wheat } from "lucide-react";
import { FranchiseFinalCta } from "@/src/components/public/franchise-final-cta";
import { HomepageFaq } from "@/src/components/public/homepage-faq";
import { FranchiseHomeAnalytics } from "@/src/components/public/franchise-home-analytics";
import { HeroInquiryLink } from "@/src/components/public/hero-inquiry-link";
import { HeroOpportunityLink } from "@/src/components/public/hero-opportunity-link";
import { StructuredData } from "@/src/components/public/structured-data";
import { CANDIDATE_PROFILE_CONTENT, OPERATOR_SUPPORT_CONTENT } from "@/src/features/franchise/candidate-criteria";
import { getHomepageContent, getSiteSettings } from "@/src/features/cms/content";
import { formatCurrentFootprint } from "@/src/features/franchise/home-hero-content";
import { OPERATOR_PROOF_CONTENT } from "@/src/features/franchise/operator-proof-content";
import { getPublicFranchiseProcessContent } from "@/src/features/franchise/process-content";
import "./operator-support.css";
import "./development-path.css";
import "./concept-in-practice.css";
import "./homepage-typography.css";
import "./homepage-spacing.css";
import "./homepage-hero.css";
import "./homepage-opportunity.css";

const inquiryHref = "/franchise/contact";
const inquiryLabel = "Request Franchise Information";
const processHref = "/franchise/process";
const processLabel = "Explore the full development process";

const qualificationRows = [
  {
    number: "01",
    question: "Can you lead a restaurant team?",
    title: CANDIDATE_PROFILE_CONTENT.partnership.candidateItems[0],
    detail: "Build and lead a strong team, create a great guest experience, and uphold Budda's standards in your market.",
  },
  {
    number: "02",
    question: "Are you financially ready?",
    title: CANDIDATE_PROFILE_CONTENT.partnership.candidateItems[1],
    detail: "Be prepared for the investment, have access to the necessary capital, and understand the long-term commitment.",
  },
  {
    number: "03",
    question: "Do you want to stay close to the business?",
    title: "Hands-on ownership",
    detail: "Stay engaged in the business, lead by example, and be committed to your people, your community, and Budda's long-term success.",
  },
] as const;

const partnershipBenefits = [
  { label: "A distinctive product", Icon: Leaf },
  { label: "A repeatable operating system", Icon: Settings },
  { label: "Ongoing operator support", Icon: UsersRound },
  { label: "Clear standards for long-term growth", Icon: Store },
] as const;

const whyPillars = [
  { title: "Signature Product", detail: OPERATOR_PROOF_CONTENT.pillars[0].body, Icon: Wheat, tone: "teal" },
  { title: "Production System", detail: OPERATOR_PROOF_CONTENT.pillars[1].body, Icon: ChefHat, tone: "gold" },
  { title: "Operator Support", detail: OPERATOR_PROOF_CONTENT.pillars[2].body, Icon: UsersRound, tone: "orange" },
  { title: "Hospitality Standard", detail: OPERATOR_PROOF_CONTENT.pillars[3].body, Icon: Heart, tone: "teal" },
] as const;

const whyOutcomes = [
  { title: "Consistent Experience", detail: OPERATOR_PROOF_CONTENT.outcomes.result.body, Icon: Store, tone: "teal" },
  { title: "Disciplined Growth", detail: OPERATOR_PROOF_CONTENT.outcomes.opportunity.body, Icon: ChartNoAxesCombined, tone: "gold" },
] as const;

const supportRows = [
  { area: OPERATOR_SUPPORT_CONTENT.areas[0], stage: "Open", description: "Get your team and restaurant ready for a strong start.", points: ["Product training", "Team preparation", "Opening guidance"], Icon: UsersRound, tone: "teal" },
  { area: OPERATOR_SUPPORT_CONTENT.areas[1], stage: "Operate", description: "Follow a proven system that protects the product and guest experience.", points: ["Recipes and preparation methods", "Service expectations", "Daily procedures"], Icon: ChefHat, tone: "gold" },
  { area: OPERATOR_SUPPORT_CONTENT.areas[2], stage: "Grow", description: "Leverage a trusted brand with ready-to-use tools and resources for your local market.", points: ["Brand guidelines", "Approved assets", "Local marketing resources"], Icon: Megaphone, tone: "orange" },
  { area: OPERATOR_SUPPORT_CONTENT.areas[4], stage: "Stay supported", description: "You're never on your own. We provide ongoing support to help you run and grow your restaurant.", points: ["Dedicated support channels", "Ongoing resources", "Standards and program updates"], Icon: Headphones, tone: "teal" },
] as const;

const processStagePreview = {
  "initial-inquiry": { Icon: FileText, label: "Start the conversation", detail: "Share your contact details, restaurant background, and market interest.", outcome: "The conversation begins.", image: "/images/development-path-inquiry.webp", alt: "Illustration of hands typing on a laptop beside a Budda's coffee mug" },
  "discovery-call": { Icon: Phone, label: "Explore the fit", detail: "Discuss your restaurant experience, goals, and questions with our team.", outcome: "Decide whether to keep exploring.", image: "/images/development-path-call.webp", alt: "Illustration of a prospective operator speaking on a phone" },
  "fdd-disclosure": { Icon: FileSearch, label: "Review the details", detail: "Review the Franchise Disclosure Document and related materials before deciding whether to proceed.", outcome: "Understand the opportunity in detail.", image: "/images/development-path-disclosure.webp", alt: "Illustrative cover of a Franchise Disclosure Document on a wooden table" },
  "discovery-day": { Icon: UsersRound, label: "Experience the model", detail: "Visit the bakery, meet the team, and see the operating environment in context.", outcome: "Continue the mutual-fit decision.", image: "/images/buddas-about-storefront.png", alt: "A baker arranging rolls at an open bakery window" },
} as const;

const conceptProofItems = [
  {
    number: "01", title: "Rolls + production", Icon: Croissant, tone: "teal",
    src: "/images/operator-proof-system-baker.png", alt: "Budda's bakery team member arranging rolls on a tray",
    description: "Bakery production built around a consistent product standard, so every Budda Roll is made the right way, every time.",
    callout: ["A distinctive product", "builds it all."],
  },
  {
    number: "02", title: "Restaurant execution", Icon: Utensils, tone: "gold",
    src: "/images/concept-kitchen-finish.jpg", alt: "Cook finishing a grilled chicken plate in the kitchen",
    description: "Savory menu items prepared through repeatable methods, with clear recipes, procedures, and quality standards.",
    callout: ["Consistent execution", "creates great experiences."],
  },
  {
    number: "03", title: "Guest experience", Icon: UsersRound, tone: "teal",
    src: "/images/concept-guest-experience-reference.png", alt: "Illustration of a smiling Budda's team member handing a takeaway bag to a guest",
    description: "Service behaviors, hospitality standards, and a welcoming environment help deliver a consistent, generous experience in every restaurant.",
    callout: ["Happy guests", "fuel what's next."],
  },
] as const;

const fallbackMetadata: Metadata = {
  title: "Budda's Franchise Opportunity | Hawaiian Bakery & Grill",
  description: "Explore the Budda's Hawaiian Bakery & Grill franchise opportunity for experienced restaurant operators.",
  alternates: { canonical: "/franchise" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Budda's Franchise Opportunity | Hawaiian Bakery & Grill",
    description: "Explore the Budda's Hawaiian Bakery & Grill franchise opportunity for experienced restaurant operators.",
    url: "/franchise", siteName: "Budda's Franchising", type: "website", locale: "en_US",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Budda's Franchising wordmark on a dark teal background" }],
  },
  twitter: {
    card: "summary_large_image", title: "Budda's Franchise Opportunity | Hawaiian Bakery & Grill",
    description: "Explore the Budda's Hawaiian Bakery & Grill franchise opportunity for experienced restaurant operators.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Budda's Franchising wordmark on a dark teal background" }],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const content = await getHomepageContent();
  return { ...fallbackMetadata, title: content.seo.title, description: content.seo.description };
}

export default async function FranchiseHomePage() {
  const [content, settings] = await Promise.all([getHomepageContent(), getSiteSettings()]);
  const processStages = getPublicFranchiseProcessContent().stages;

  return <>
    <StructuredData organizationName={settings.organizationName} siteUrl={settings.siteUrl} email={settings.email} phoneHref={settings.phoneHref} />
    <FranchiseHomeAnalytics />
    <div className="franchise-home flex flex-col">
      <section data-franchise-home-hero className="home-section home-section--edge-bleed home-reference-hero" aria-labelledby="franchise-home-title">
        <div className="home-reference-hero-copy">
          <p className="home-reference-hero-eyebrow">Hawaiian Bakery &amp; Grill Franchise</p>
          <h1 id="franchise-home-title" className="home-reference-hero-title"><span>Home of the</span><span>Budda Roll.</span></h1>
          <p className="home-reference-hero-description">A signature bakery product at the center of a broader restaurant experience built around breakfast, bentos, sandwiches, sharing occasions, and generous hospitality.</p>
          <div className="home-reference-hero-actions">
            <HeroInquiryLink href={inquiryHref} className="home-reference-hero-primary">{inquiryLabel}<ArrowRight aria-hidden="true" /></HeroInquiryLink>
            <HeroOpportunityLink href={content.hero.opportunity.href} className="home-reference-hero-secondary">Explore the Opportunity<ArrowRight aria-hidden="true" /></HeroOpportunityLink>
          </div>
          <p className="mt-4 font-heading text-sm font-bold text-bds-teal-ink">{formatCurrentFootprint(content.hero.currentFootprint)}</p>
          <ul className="home-reference-hero-features" aria-label="The Budda's restaurant experience">
            <li><span className="home-reference-hero-icon"><Image src="/roll-icon.svg" width={48} height={48} alt="" aria-hidden="true" /></span><span>Signature<br />roll</span></li>
            <li><span className="home-reference-hero-icon"><Sunrise aria-hidden="true" /></span><span>Breakfast<br />to dinner</span></li>
            <li><span className="home-reference-hero-icon"><UsersRound aria-hidden="true" /></span><span>Sharing +<br />catering</span></li>
          </ul>
        </div>
        <figure className="home-reference-hero-media">
          <Image src={content.hero.media.desktopImage === "/images/franchise-hero-signature-roll.png" ? "/images/homepage-hero-bakery-reference.webp" : content.hero.media.desktopImage} alt={content.hero.media.imageAlt} fill priority sizes="100vw" className="home-reference-hero-photo" />
        </figure>
      </section>

      <section className="home-section home-opportunity" aria-labelledby="franchise-qualification-title">
        <div className="home-opportunity-shell">
          <div className="home-opportunity-main">
            <div className="home-opportunity-intro">
              <p className="home-opportunity-eyebrow">Franchise opportunity</p>
              <h2 id="franchise-qualification-title">A strong fit<br />works both ways.</h2>
              <p className="home-opportunity-description">We&apos;re looking for passionate, hands-on operators who can lead a restaurant well &mdash; and who want a brand and system they can grow with.</p>
              <div className="home-opportunity-intro-actions">
                <Link href={inquiryHref}>{inquiryLabel}<ArrowRight aria-hidden="true" /></Link>
                <Link href={processHref} className="is-secondary">{processLabel}<ArrowRight aria-hidden="true" /></Link>
              </div>
            </div>
            <div className="home-opportunity-criteria">
              <p className="home-opportunity-eyebrow">What strong operators bring</p>
              <ol aria-label="Preliminary operator profile">
                {qualificationRows.map(({ number, question, title, detail }) => <li key={number}>
                  <span className="home-opportunity-number" aria-hidden="true">{number}</span>
                  <div className="home-opportunity-row-copy">
                    <p className="home-opportunity-question">{question}</p>
                    <h3>{title}</h3>
                    <p className="home-opportunity-detail">{detail}</p>
                  </div>
                </li>)}
              </ol>
            </div>
          </div>
          <div className="home-opportunity-partnership">
            <div className="home-opportunity-promise">
              <p className="home-opportunity-eyebrow">What you can expect from Budda&apos;s</p>
              <h3>A proven concept.<br />A committed partner.</h3>
            </div>
            <ul className="home-opportunity-benefits" aria-label="What Budda's brings to the partnership">
              {partnershipBenefits.map(({ label, Icon }) => <li key={label}><span className="home-opportunity-benefit-icon" aria-hidden="true"><Icon /></span><p>{label}</p></li>)}
            </ul>
            <div className="home-opportunity-action">
              <Link href="/franchise/the-opportunity#mutual-operator-fit"><span>View the full<br />candidate profile</span><ArrowRight aria-hidden="true" /></Link>
              <p className="home-opportunity-tagline">The right people<br />drive brighter days.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section bg-bds-cream" aria-labelledby="franchise-why-title">
        <div className="content-wide">
          <header className="text-center">
            <p className="home-eyebrow text-bds-teal-dark">Why Budda&apos;s</p>
            <h2 id="franchise-why-title" className="home-section-title mx-auto text-bds-text-heading">The system behind the signature product</h2>
            <p className="home-section-intro mx-auto text-bds-text-body">Clear standards for food, service, training, and daily operations.</p>
          </header>

          <ul className="home-section-content grid gap-7 sm:grid-cols-2 sm:gap-x-10 xl:grid-cols-4 xl:gap-8">
            {whyPillars.map(({ title, detail, Icon, tone }) => <li key={title} className="flex items-start gap-5 sm:flex-col sm:items-center sm:gap-0 sm:text-center">
              <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-full sm:h-24 sm:w-24 ${tone === "gold" ? "bg-bds-gold/20 text-bds-cocoa" : tone === "orange" ? "bg-bds-orange/10 text-bds-orange" : "bg-bds-teal/10 text-bds-teal-ink"}`} aria-hidden="true"><Icon className="h-8 w-8 stroke-[1.7] sm:h-11 sm:w-11" /></span>
              <div className="min-w-0 sm:mt-4"><h3 className="font-heading text-xl font-bold leading-tight text-bds-text-heading sm:text-2xl">{title}</h3><p className="mt-2 max-w-[30ch] font-body text-sm leading-6 text-bds-text-body sm:text-base">{detail}</p></div>
            </li>)}
          </ul>

          <div className="relative mx-auto mt-4 hidden h-6 w-[76%] rounded-b-2xl border-x border-b border-bds-teal-dark/30 xl:block" aria-hidden="true"><span className="absolute -bottom-6 left-1/2 h-6 w-px bg-bds-teal-dark/30" /><span className="absolute -bottom-7 left-1/2 -translate-x-1/2 border-x-[6px] border-t-[9px] border-x-transparent border-t-bds-gold" /></div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:mt-10">
            {whyOutcomes.map(({ title, detail, Icon, tone }) => <div key={title} className={`grid items-center gap-5 rounded-2xl border p-6 sm:grid-cols-[5rem_minmax(0,1fr)] lg:min-h-[9rem] ${tone === "gold" ? "border-bds-gold bg-bds-gold/5" : "border-bds-teal-dark/30 bg-bds-teal/5"}`}>
              <span className="grid h-20 w-20 place-items-center rounded-full bg-bds-gold/20 text-bds-cocoa" aria-hidden="true"><Icon className="h-10 w-10 stroke-[1.7]" /></span>
              <div className="border-l border-bds-teal-dark/25 pl-5"><h3 className="font-heading text-xl font-bold text-bds-text-heading sm:text-2xl">{title}</h3><p className="mt-2 max-w-[38ch] font-body text-sm leading-6 text-bds-text-body sm:text-base">{detail}</p></div>
            </div>)}
          </div>

        </div>
      </section>

      <section className="home-section operator-support-section home-support" aria-labelledby="franchise-support-title">
        <div className="home-support-shell">
          <header className="home-support-header">
            <div>
              <p className="home-eyebrow">Operator support system</p>
              <h2 id="franchise-support-title" className="home-section-title">Support starts before opening and continues after launch.</h2>
              <p className="home-support-description">From opening preparation through daily operations, Budda&apos;s provides the standards, tools, and support behind the restaurant.</p>
            </div>
            <div className="home-support-signoff">
              <p className="home-opportunity-script">Great Food<br />Brings Opportunity.</p>
              <p className="home-support-tagline">A brighter<br />tomorrow together.</p>
            </div>
          </header>

          <ol className="home-support-stages" aria-label="Four stages of operator support">
            {supportRows.map(({ area, stage, description, points, Icon, tone }, index) => <li key={area.index} className={`home-support-stage is-${tone}`}>
              <div className="home-support-stage-symbols" aria-hidden="true">
                <span className="home-support-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="home-support-icon"><Icon /></span>
                {index < supportRows.length - 1 && <span className="home-support-connector"><ArrowRight /></span>}
              </div>
              <p className="home-support-stage-label">{stage}</p>
              <h3>{area.label}</h3>
              <p className="home-support-stage-description">{description}</p>
              <ul className="home-support-checklist">
                {points.map(point => <li key={point}><CircleCheck aria-hidden="true" /><span>{point}</span></li>)}
              </ul>
            </li>)}
          </ol>

          <div className="home-support-workspace">
            <Image src="/images/operator-workspace-laptop.png" alt="Illustration of Budda's Operator Workspace on a laptop" width={600} height={400} loading="lazy" sizes="(max-width: 767px) 280px, 320px" className="home-support-workspace-image" />
            <div className="home-support-workspace-copy">
              <p className="home-support-stage-label">Connected through</p>
              <h3>Budda&apos;s Operator Workspace</h3>
              <p>Key supplies, resources, tools, and support stay accessible in one place so you can focus on what matters most, running a great restaurant.</p>
            </div>
            <div className="home-support-action">
              <Link href="/franchise/login">Explore the Operator Workspace<ArrowRight aria-hidden="true" /></Link>
              <p className="home-support-tagline">Same standards. A stronger tomorrow.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section development-path-section" aria-labelledby="franchise-process-title">
        <div className="content-wide">
          <header className="development-path-header">
            <p className="home-eyebrow">The development path</p>
            <h2 id="franchise-process-title" className="home-section-title">What happens after you inquire</h2>
            <p className="home-section-intro">Each stage is a meaningful step toward a potential partnership, designed to help you and Budda&apos;s determine whether there&apos;s a strong fit.</p>
          </header>

          <ol className="development-path-stages" aria-label="Four franchise development stages">
            {processStages.map((stage, index) => {
              const { Icon, label, detail, outcome, image, alt } = processStagePreview[stage.id];
              return <li key={stage.id} className={index % 2 === 0 ? "is-teal" : "is-gold"}>
                <div className="development-path-symbols" aria-hidden="true"><span className="development-path-number">{stage.number}</span><span className="development-path-icon"><Icon /></span></div>
                <div className="development-path-stage-heading"><p>{label}</p><h3>{stage.publicTitle}</h3>{index < processStages.length - 1 && <ArrowRight className="development-path-connector" aria-hidden="true" />}</div>
                <div className="development-path-photo"><Image src={image} alt={alt} fill loading="lazy" sizes="(max-width: 639px) 92vw, (max-width: 1199px) 44vw, 22vw" className="object-cover" /></div>
                <p className="development-path-detail">{detail}</p>
                <div className="development-path-outcome"><p>Outcome</p><strong>{outcome}</strong></div>
              </li>;
            })}
          </ol>

          <div className="development-path-footer">
            <div className="home-section-action"><Link href={processHref}>{processLabel}<ArrowRight aria-hidden="true" /></Link></div>
          </div>
        </div>
      </section>

      <section className="home-section concept-proof-section" aria-labelledby="franchise-proof-title">
        <div className="content-wide concept-proof-layout">
          <div className="concept-proof-copy">
            <div>
              <p className="concept-proof-eyebrow home-eyebrow">The bakery engine in practice</p>
              <h2 id="franchise-proof-title" className="home-section-title">The concept in practice</h2>
              <p className="concept-proof-intro home-section-intro">Great food is the start. Budda&apos;s pairs bakery preparation, restaurant execution, and guest service with clear standards.</p>
              <div className="concept-proof-growth">
                <p className="concept-proof-growth-label">Disciplined growth</p>
                <h3>We grow only when the restaurant, team, supply chain, and market are ready.</h3>
                <p className="concept-proof-growth-description">A stronger restaurant experience today leads to more opportunities tomorrow.</p>
              </div>
            </div>
            <div className="home-section-action concept-proof-action"><Link href="https://buddasbakerygrill.com" target="_blank" rel="noopener noreferrer">See Budda&apos;s in operation<ArrowRight aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></Link></div>
          </div>
          <ol className="concept-proof-gallery" aria-label="Bakery, restaurant, and guest experience">
            {conceptProofItems.map(({ number, title, src, alt, description, callout, Icon, tone }) => <li key={title} className={`concept-proof-story is-${tone}`}>
              <figure>
                <div className="concept-proof-photo"><Image src={src} alt={alt} fill loading="lazy" sizes="(max-width: 767px) 100vw, (max-width: 1199px) 33vw, 24vw" className="object-cover" /></div>
                <figcaption>
                  <span className="concept-proof-icon" aria-hidden="true"><Icon /></span>
                  <div className="concept-proof-story-copy">
                    <div className="concept-proof-story-heading"><span className="concept-proof-number" aria-hidden="true">{number}</span><h3>{title}</h3></div>
                    <p className="concept-proof-story-description">{description}</p>
                  </div>
                  <p className="concept-proof-callout"><span>{callout[0]}<br />{callout[1]}</span></p>
                </figcaption>
              </figure>
            </li>)}
          </ol>
        </div>
      </section>

      <HomepageFaq />

      <Suspense fallback={null}><FranchiseFinalCta simplified /></Suspense>
    </div>
  </>;
}

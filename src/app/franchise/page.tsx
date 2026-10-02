import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, ChartNoAxesCombined, Check, ChefHat, FileSearch, FileText, Handshake, Headphones, Heart, Megaphone, Package, Phone, ShoppingCart, Store, UsersRound, Wheat } from "lucide-react";
import { FranchiseFinalCta } from "@/src/components/public/franchise-final-cta";
import { HomepageFaq } from "@/src/components/public/homepage-faq";
import { FranchiseHomeAnalytics } from "@/src/components/public/franchise-home-analytics";
import { HeroInquiryLink } from "@/src/components/public/hero-inquiry-link";
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

const inquiryHref = "/franchise/contact";
const inquiryLabel = "Request Franchise Information";
const processHref = "/franchise/process";
const processLabel = "See the Process";

const qualificationRows = [
  {
    number: "01",
    question: "Can you lead a restaurant team?",
    title: CANDIDATE_PROFILE_CONTENT.partnership.candidateItems[0],
    detail: "You can build and lead a strong team, create a great guest experience, and uphold Budda's standards in your market.",
    Icon: UsersRound,
    tone: "teal",
  },
  {
    number: "02",
    question: "Are you financially ready for the opportunity?",
    title: CANDIDATE_PROFILE_CONTENT.partnership.candidateItems[1],
    detail: "You're prepared for the investment, have access to the necessary capital, and understand the long-term commitment.",
    Icon: ChartNoAxesCombined,
    tone: "gold",
  },
  {
    number: "03",
    question: "Do you want to stay close to the business?",
    title: CANDIDATE_PROFILE_CONTENT.partnership.candidateItems[2],
    detail: "You stay engaged in the business, lead by example, and are committed to your people, your community, and Budda's long-term success.",
    Icon: Handshake,
    tone: "teal",
  },
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
  { area: OPERATOR_SUPPORT_CONTENT.areas[0], Icon: UsersRound, tone: "teal", points: ["Product training", "Team preparation", "Opening guidance"] },
  { area: OPERATOR_SUPPORT_CONTENT.areas[1], Icon: ChefHat, tone: "gold", points: ["Recipes", "Preparation methods", "Service expectations", "Daily procedures"] },
  { area: OPERATOR_SUPPORT_CONTENT.areas[2], Icon: Megaphone, tone: "orange", points: ["Brand guidelines", "Approved assets", "Local marketing resources"] },
  { area: OPERATOR_SUPPORT_CONTENT.areas[3], Icon: Package, tone: "teal", points: ["Approved supplies", "Materials and pricing", "Current orders"] },
  { area: OPERATOR_SUPPORT_CONTENT.areas[4], Icon: Headphones, tone: "gold", points: ["Support channels", "Operating resources", "Standards updates"] },
] as const;

const workspaceFeatures = [
  { label: "Orders", detail: "Track orders", Icon: Package },
  { label: "Supplies", detail: "Approved catalog", Icon: ShoppingCart },
  { label: "Resources", detail: "Guides and tools", Icon: FileText },
  { label: "Support", detail: "Get help", Icon: Headphones },
] as const;

const processStagePreview = {
  "initial-inquiry": { Icon: FileText, detail: "Share your contact details, restaurant background, and market interest." },
  "discovery-call": { Icon: Phone, detail: "Discuss your restaurant experience, goals, and questions with our team." },
  "fdd-disclosure": { Icon: FileSearch, detail: "Review the Franchise Disclosure Document and related materials before deciding whether to proceed." },
  "discovery-day": { Icon: UsersRound, detail: "Visit the bakery, meet the team, and see the operating environment in context." },
} as const;

const conceptProofItems = [
  { number: "01", title: "Rolls + production", detail: "The Budda Roll follows defined preparation standards.", src: "/images/operator-proof-system-baker.png", alt: "Budda's bakery team member arranging rolls on a tray", Icon: Wheat, tone: "teal" },
  { number: "02", title: "Restaurant execution", detail: "Food preparation and service follow clear operating standards.", src: "/images/concept-kitchen-finish.jpg", alt: "Cook finishing a grilled chicken plate in the kitchen", Icon: ChefHat, tone: "gold" },
  { number: "03", title: "Guest experience", detail: "Generous hospitality is carried through each guest visit.", src: "/images/buddas-contact-service.png", alt: "Budda's team member handing an order to a guest", Icon: UsersRound, tone: "teal" },
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
      <section data-franchise-home-hero className="home-section home-section--edge-bleed bg-bds-cream" aria-labelledby="franchise-home-title">
        <div className="content-wide grid lg:grid-cols-2">
          <div className="home-hero-copy flex flex-col justify-center lg:pr-12">
            <h1 id="franchise-home-title" className="home-hero-title text-bds-text-heading">A Hawaiian Bakery &amp; Grill franchise</h1>
            <p className="home-section-intro text-bds-text-body">For experienced restaurant operators. Built around the signature Budda Roll and a bakery-led menu.</p>
            <HeroInquiryLink href={inquiryHref} className="mt-8 inline-flex min-h-14 w-fit items-center justify-center gap-3 rounded-xl bg-bds-action-primary px-6 py-3 font-heading text-base font-bold text-bds-action-primary-text hover:bg-bds-teal-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-teal-dark focus-visible:ring-offset-2 focus-visible:ring-offset-bds-cream">{inquiryLabel}<ArrowRight className="h-5 w-5" aria-hidden="true" /></HeroInquiryLink>
          </div>
          <figure className="relative min-h-[20rem] sm:min-h-[28rem] lg:min-h-[38rem]">
            <Image src={content.hero.media.desktopImage} alt={content.hero.media.imageAlt} fill priority sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover" />
          </figure>
        </div>
      </section>

      <section className="home-section border-y border-bds-teal-dark/10 bg-white" aria-labelledby="franchise-qualification-title">
        <div className="content-wide grid gap-6 sm:gap-8 hero-wide:grid-cols-[minmax(0,.85fr)_minmax(0,1.25fr)] hero-wide:gap-16">
          <div className="flex flex-col justify-between gap-12">
            <div>
              <p className="home-eyebrow text-bds-teal-dark">Franchise opportunity</p>
              <h2 id="franchise-qualification-title" className="home-section-title text-bds-text-heading">Is Budda&apos;s right for you?</h2>
              <p className="home-section-intro text-bds-text-body">A strong Budda&apos;s candidate should be able to say yes to these.</p>
            </div>
            <p className="flex items-center gap-5 font-heading text-xs font-bold uppercase tracking-[0.16em] text-bds-teal-dark sm:text-sm"><span className="h-px w-10 shrink-0 bg-bds-teal-dark" aria-hidden="true" />Great food brings opportunity.</p>
          </div>
          <div>
            <ol className="divide-y divide-bds-teal-dark/15" aria-label="Preliminary operator profile">
              {qualificationRows.map(({ number, question, title, detail, Icon, tone }) => <li key={number} className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-3 py-5 first:pt-0 sm:grid-cols-[5.25rem_minmax(0,1fr)] sm:gap-5 lg:py-6">
                <span className={`grid h-16 w-16 place-items-center rounded-full sm:h-[5.25rem] sm:w-[5.25rem] ${tone === "gold" ? "bg-bds-gold/20 text-bds-orange" : "bg-bds-teal/10 text-bds-teal-dark"}`} aria-hidden="true"><Icon className="h-8 w-8 stroke-[1.75] sm:h-10 sm:w-10" /></span>
                <div className="col-span-2 min-w-0 pt-1 sm:col-span-1 sm:pl-2 sm:pt-0">
                  <p className="font-heading text-[.625rem] font-bold uppercase leading-4 tracking-[0.14em] text-bds-teal-dark sm:text-xs">{question}</p>
                  <h3 className="mt-1 font-heading text-lg font-bold leading-tight text-bds-text-heading sm:text-2xl">{title}</h3>
                  <p className="mt-1 max-w-[58ch] font-body text-sm leading-6 text-bds-text-body sm:text-base">{detail}</p>
                </div>
              </li>)}
            </ol>
            <div className="grid gap-5 border-t border-bds-teal-dark/15 pt-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center sm:gap-8">
              <Link href="/franchise/the-opportunity#mutual-operator-fit" className="inline-flex min-h-16 items-center justify-center gap-4 rounded-xl bg-bds-teal-dark px-6 py-4 font-heading text-base font-bold text-bds-cream hover:bg-bds-teal-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-teal-dark focus-visible:ring-offset-2">View the full candidate profile<ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" /></Link>
              <div className="border-l-2 border-bds-teal-dark pl-6"><p className="font-heading text-xs font-bold uppercase tracking-[0.14em] text-bds-teal-dark">Ready to take the next step?</p><p className="mt-1 font-body text-sm leading-6 text-bds-text-body sm:text-base">Learn more about what it takes to join the Budda&apos;s family.</p></div>
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

          <p className="mt-6 flex items-center gap-5 font-heading text-[.625rem] font-bold uppercase tracking-[0.3em] text-bds-teal-dark before:h-px before:flex-1 before:bg-bds-teal-dark/30 after:h-px after:flex-1 after:bg-bds-teal-dark/30 sm:text-xs">Same good ahead</p>
        </div>
      </section>

      <section className="home-section operator-support-section" aria-labelledby="franchise-support-title">
        <div className="content-wide operator-support-layout">
            <header className="operator-support-intro">
              <p className="home-eyebrow">Operator support system</p>
              <h2 id="franchise-support-title" className="home-section-title">What you receive as an operator</h2>
              <span className="home-section-intro">{OPERATOR_SUPPORT_CONTENT.description}</span>
            </header>
            <ul className="operator-support-list" aria-label="Five areas of operator support">
              {supportRows.map(({ area, Icon, tone, points }) => <li key={area.index} className={`operator-support-row is-${tone}`}>
                <span className="operator-support-row-icon" aria-hidden="true"><Icon /></span>
                <div className="operator-support-row-copy"><h3>{area.label}</h3><p>{area.description}</p></div>
                <ul className="operator-support-row-points" aria-label={`${area.label} includes`}>{points.map((point) => <li key={point}><Check aria-hidden="true" />{point}</li>)}</ul>
              </li>)}
            </ul>

          <aside className="operator-support-aside" aria-labelledby="operator-workspace-title">
            <div className="operator-support-panel">
              <p className="operator-support-panel-eyebrow">All connected through the</p>
              <h3 id="operator-workspace-title">Budda&apos;s Operator Workspace</h3>
              <p className="operator-support-panel-description">A central place for orders, approved supplies, resources, and support.</p>

              <figure className="operator-support-devices" role="img" aria-label="Illustration of the Budda's Operator Workspace on a laptop and phone">
                <div className="operator-support-laptop" aria-hidden="true">
                  <div className="operator-support-screen">
                    <div className="operator-support-screen-nav"><Image src="/images/Logo-white.svg" alt="" width={105} height={29} />{workspaceFeatures.map(({ label }) => <span key={label}>{label}</span>)}</div>
                    <div className="operator-support-screen-content"><strong>Operator Workspace</strong><span>Tools for your restaurant</span><div>{workspaceFeatures.map(({ label, Icon }) => <span key={label}><Icon />{label}</span>)}</div></div>
                  </div>
                </div>
                <div className="operator-support-laptop-base" aria-hidden="true" />
                <div className="operator-support-phone" aria-hidden="true"><span className="operator-support-phone-notch" /><strong>Budda&apos;s</strong><span>Operator tools</span>{workspaceFeatures.map(({ label, Icon }) => <small key={label}><Icon />{label}</small>)}</div>
              </figure>

              <ul className="operator-support-features" aria-label="Operator Workspace tools">{workspaceFeatures.map(({ label, detail, Icon }) => <li key={label}><Icon aria-hidden="true" /><strong>{label}</strong><span>{detail}</span></li>)}</ul>
              <div className="operator-support-panel-action"><Link href={processHref}>{processLabel}<ArrowRight aria-hidden="true" /></Link><p>The support behind a brighter tomorrow.</p></div>
            </div>
          </aside>
        </div>
      </section>

      <section className="home-section development-path-section" aria-labelledby="franchise-process-title">
        <div className="content-wide">
          <header className="development-path-header">
            <div><p className="home-eyebrow">The development path</p><h2 id="franchise-process-title" className="home-section-title">What happens after you inquire</h2><span className="home-section-intro">The inquiry form has three steps. It starts Budda&apos;s four-stage franchise development process. We&apos;ll determine together whether Budda&apos;s is the right fit.</span></div>
          </header>

          <ol className="development-path-stages" aria-label="Four franchise development stages">
            {processStages.map((stage, index) => {
              const { Icon, detail } = processStagePreview[stage.id];
              return <li key={stage.id}>
                <span className={`development-path-icon ${index % 2 === 0 ? "is-teal" : "is-gold"}`} aria-hidden="true"><Icon /></span>
                <div className="development-path-stage-copy"><span className="development-path-number">{stage.number}</span><h3>{stage.publicTitle}</h3><p>{detail}</p></div>
              </li>;
            })}
          </ol>

          <div className="home-section-action mt-6"><Link href={processHref}>{processLabel}<ArrowRight aria-hidden="true" /></Link><p>A clear process.<br />A brighter tomorrow.</p></div>
        </div>
      </section>

      <section className="home-section concept-proof-section" aria-labelledby="franchise-proof-title">
        <div className="content-wide concept-proof-layout">
          <div className="concept-proof-copy">
            <div>
              <p className="concept-proof-eyebrow home-eyebrow">The bakery engine in practice</p>
              <h2 id="franchise-proof-title" className="home-section-title">The concept in practice</h2>
              <p className="concept-proof-footprint">{formatCurrentFootprint(content.hero.currentFootprint)}</p>
              <p className="concept-proof-intro home-section-intro">Great food is the start. Budda&apos;s pairs bakery preparation, restaurant execution, and guest service with clear standards.</p>
              <div className="concept-proof-growth"><p>Our approach to growth</p><h3>We grow only when the restaurant, team, supply chain, and market are ready.</h3></div>
            </div>
            <div className="home-section-action"><Link href="https://buddasbakerygrill.com" target="_blank" rel="noopener noreferrer">See Budda&apos;s in operation<ArrowRight aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></Link><p>Real restaurants.<br />A brighter tomorrow.</p></div>
          </div>
          <ol className="concept-proof-gallery" aria-label="Bakery, restaurant, and guest experience">
            {conceptProofItems.map(({ number, title, detail, src, alt, Icon, tone }) => <li key={number}>
              <figure><div className="concept-proof-photo"><Image src={src} alt={alt} fill loading="lazy" sizes="(max-width: 639px) 90vw, (max-width: 1023px) 30vw, 20vw" className="object-cover" /></div><figcaption><span className={`concept-proof-icon is-${tone}`} aria-hidden="true"><Icon /></span><div><span>{number}</span><h3>{title}</h3><p>{detail}</p></div></figcaption></figure>
            </li>)}
          </ol>
        </div>
      </section>

      <HomepageFaq />

      <Suspense fallback={null}><FranchiseFinalCta simplified /></Suspense>
    </div>
  </>;
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { OperatorProofDesktop } from "@/src/components/public/operator-proof-desktop";
import { OperatorProofMobile } from "@/src/components/public/operator-proof-mobile";
import { CandidateProfileSection } from "@/src/components/public/candidate-profile-section";
import { FranchiseFinalCta } from "@/src/components/public/franchise-final-cta";
import { FranchiseHomeAnalytics } from "@/src/components/public/franchise-home-analytics";
import { HomepageHeroDesktop } from "@/src/components/public/homepage-hero-desktop";
import { HomepageHeroMedia } from "@/src/components/public/homepage-hero-media";
import { HomepageHeroMobile } from "@/src/components/public/homepage-hero-mobile";
import { StructuredData } from "@/src/components/public/structured-data";
import { BusinessProofBand } from "@/src/components/public/business-proof-band";
import { HomepageTestimonial } from "@/src/components/public/homepage-testimonial";
import { HomepageSocialProof } from "@/src/components/public/homepage-social-proof";
import { getHomepageContent, getHomepageSocialProof, getHomepageTestimonial } from "@/src/features/cms/content";
import { getSiteSettings } from "@/src/features/cms/content";

const fallbackMetadata: Metadata = {
  title: "Budda's Franchise Opportunity | Hawaiian Bakery & Grill",
  description:
    "Explore the Budda's Hawaiian Bakery & Grill franchise opportunity, built around the Budda Roll, bakery-led differentiation, and generous hospitality.",
  alternates: { canonical: "/franchise" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Budda's Franchise Opportunity | Hawaiian Bakery & Grill",
    description:
      "Explore the Budda's Hawaiian Bakery & Grill franchise opportunity, built around the Budda Roll, bakery-led differentiation, and generous hospitality.",
    url: "/franchise",
    siteName: "Budda's Franchising",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Budda's Franchising wordmark on a dark teal background",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Budda's Franchise Opportunity | Hawaiian Bakery & Grill",
    description:
      "Explore the Budda's Hawaiian Bakery & Grill franchise opportunity, built around the Budda Roll, bakery-led differentiation, and generous hospitality.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Budda's Franchising wordmark on a dark teal background",
      },
    ],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const content = await getHomepageContent();
  return { ...fallbackMetadata, title: content.seo.title, description: content.seo.description, openGraph: { ...fallbackMetadata.openGraph, title: content.seo.title, description: content.seo.description }, twitter: { ...fallbackMetadata.twitter, title: content.seo.title, description: content.seo.description } };
}

const FranchiseHomePage = async () => {
  const [content, socialProof, testimonial, settings] = await Promise.all([getHomepageContent(), getHomepageSocialProof(), getHomepageTestimonial(), getSiteSettings()]);
  return (
    <><StructuredData organizationName={settings.organizationName} siteUrl={settings.siteUrl} email={settings.email} phoneHref={settings.phoneHref} /><FranchiseHomeAnalytics /><div className="flex flex-col">
      <div data-franchise-home-hero className="homepage-hero-shell">
        <HomepageHeroDesktop content={content.hero} />
        <HomepageHeroMobile content={content.hero} />
        <HomepageHeroMedia content={content.hero} />
      </div>

      <BusinessProofBand />

      <OperatorProofMobile section={content.advantage} />
      <OperatorProofDesktop section={content.advantage} />
      {testimonial ? <HomepageTestimonial content={testimonial} /> : null}
      <CandidateProfileSection content={content.candidateProfile} />
      <HomepageSocialProof content={socialProof} />
      <Suspense fallback={null}>
        <FranchiseFinalCta content={content.closingCta} />
      </Suspense>
    </div></>
  );
};

export default FranchiseHomePage;

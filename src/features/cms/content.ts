import { cache } from "react";
import { z } from "zod";
import { sanityClient } from "@/src/features/cms/client";
import { HOMEPAGE_QUERY, HOMEPAGE_SOCIAL_PROOF_QUERY, HOMEPAGE_TESTIMONIAL_QUERY, SITE_SETTINGS_QUERY } from "@/src/features/cms/queries";
import { FRANCHISE_HOME_HERO_CONTENT } from "@/src/features/franchise/home-hero-content";
import { OPERATOR_PROOF_CONTENT } from "@/src/features/franchise/operator-proof-content";
import { CANDIDATE_PROFILE_CONTENT } from "@/src/features/franchise/candidate-criteria";
import { FRANCHISE_FINAL_CTA_CONTENT } from "@/src/features/franchise/final-cta-content";
import { FOOTER_CONTENT, FOOTER_NAVIGATION } from "@/src/features/footer/footer-content";
import { primaryNavItems, utilityNavItems } from "@/src/features/navigation/nav-config";

const safeHref = z.string().refine((value) => value.startsWith("/") || /^(https:|mailto:|tel:)/.test(value));
const link = z.object({ label: z.string().min(1), href: safeHref, external: z.boolean().optional() });
const image = z.object({ asset: z.object({ url: z.string().url() }).nullable().optional(), alt: z.string().min(1) }).transform((value) => value.asset ? { src: value.asset.url, alt: value.alt } : undefined);

const homepageSchema = z.object({
  seo: z.object({ title: z.string(), description: z.string() }).optional(),
  hero: z.object({ eyebrow: z.string(), headline: z.string(), description: z.string(), desktopImage: image, mobileImage: image, locations: z.array(z.string()).min(1), region: z.string(), status: z.string(), heroProofRail: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).length(3).optional(), primaryAction: link, secondaryAction: link, secondaryDetail: z.string().optional() }).optional(),
  advantage: z.object({ eyebrow: z.string(), heading: z.string(), introduction: z.string() }).optional(),
  candidateProfile: z.object({ eyebrow: z.string(), heading: z.string(), introduction: z.string(), image: image, partnership: z.object({ candidateItems: z.array(z.string()).min(1), brandItems: z.array(z.string()).min(1) }) }).optional(),
  closingCta: z.object({ eyebrow: z.string(), title: z.string(), description: z.string(), primaryAction: link, secondaryAction: link }).optional(),
}).nullable().optional();

const homepageTestimonialSchema = z.object({
  eyebrow: z.string().min(1),
  quote: z.string().min(40),
  personName: z.string().min(1),
  personTitle: z.string().min(1),
  image,
  ctaLabel: z.string().min(1),
}).nullable().optional();

const homepageSocialProofSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(30),
  instagramPosts: z.array(z.object({ image, postUrl: z.string().url() })).min(3),
  googleReviews: z.array(z.object({ reviewerName: z.string().min(1), review: z.string().min(20), rating: z.number().int().min(1).max(5) })).min(1),
  googleReviewsUrl: z.string().url(),
  socialLinks: z.array(link).min(2),
}).nullable().optional();

const siteSettingsSchema = z.object({
  organizationName: z.string(), siteUrl: z.string().url(), defaultSeo: z.object({ title: z.string(), description: z.string() }).optional(), primaryNavigation: z.array(link).min(1), utilityNavigation: z.array(link).min(1), inquiryAction: link,
  email: z.string().email(), phone: z.string(), phoneHref: z.string().startsWith("tel:"), copyright: z.string(), legalDisclaimer: z.string(),
  footerNavigation: z.array(z.object({ id: z.string(), title: z.string(), items: z.array(link).min(1) })).min(1),
}).nullable().optional();

export type HomepageCmsContent = {
  seo: { title: string; description: string };
  hero: typeof FRANCHISE_HOME_HERO_CONTENT;
  advantage: { eyebrow: string; heading: string; introduction: string };
  candidateProfile: typeof CANDIDATE_PROFILE_CONTENT;
  closingCta: typeof FRANCHISE_FINAL_CTA_CONTENT;
};

export type HomepageTestimonialContent = {
  eyebrow: string;
  quote: string;
  personName: string;
  personTitle: string;
  image: { src: string; alt: string };
  ctaLabel: string;
};

export type HomepageSocialProofContent = {
  source: "cms" | "fallback";
  eyebrow: string;
  title: string;
  description: string;
  galleryLabel: string;
  instagramPosts: { image: { src: string; alt: string }; postUrl: string }[];
  googleReviews: { reviewerName: string; review: string; rating: number }[];
  googleReviewsUrl?: string;
  socialLinks: { label: string; href: string; external?: boolean }[];
};

const homepageSocialProofFallback: HomepageSocialProofContent = {
  source: "fallback",
  eyebrow: "The Budda's experience",
  title: "Good food brings people together.",
  description: "From fresh-baked rolls to warm hospitality, every visit starts with the care behind the counter.",
  galleryLabel: "Inside Budda's",
  instagramPosts: [
    { image: { src: "/images/franchise-hero-signature-roll.png", alt: "Signature Budda Roll on a plate in a warm bakery setting" }, postUrl: "https://buddasbakerygrill.com" },
    { image: { src: "/images/operator-proof-system-baker.png", alt: "Budda's bakery team member preparing a tray of rolls" }, postUrl: "https://buddasbakerygrill.com" },
    { image: { src: "/images/buddas-contact-service.png", alt: "Budda's team member welcoming a guest at the counter" }, postUrl: "https://buddasbakerygrill.com" },
  ],
  googleReviews: [],
  socialLinks: [],
};

export const getHomepageContent = cache(async (): Promise<HomepageCmsContent> => {
  const fallback: HomepageCmsContent = {
    seo: { title: "Budda's Franchise Opportunity | Hawaiian Bakery & Grill", description: "Explore the Budda's Hawaiian Bakery & Grill franchise opportunity, built around the Budda Roll, bakery-led differentiation, and generous hospitality." },
    hero: FRANCHISE_HOME_HERO_CONTENT,
    advantage: OPERATOR_PROOF_CONTENT.section,
    candidateProfile: CANDIDATE_PROFILE_CONTENT,
    closingCta: FRANCHISE_FINAL_CTA_CONTENT,
  };
  try {
    const parsed = homepageSchema.safeParse(await sanityClient.fetch(HOMEPAGE_QUERY, {}, { next: { revalidate: 60, tags: ["sanity:homepage"] } }));
    if (!parsed.success || !parsed.data) return fallback;
    const { seo, hero, advantage, candidateProfile, closingCta } = parsed.data;
    return {
      seo: seo || fallback.seo,
      hero: hero ? {
        desktop: { eyebrow: hero.eyebrow, headline: hero.headline, description: hero.description },
        mobile: { eyebrow: hero.eyebrow, headline: hero.headline, description: hero.description, opportunityLabel: hero.primaryAction.label, inquiryLabel: hero.secondaryAction.label },
        media: { desktopImage: hero.desktopImage?.src || fallback.hero.media.desktopImage, mobileImage: hero.mobileImage?.src || fallback.hero.media.mobileImage, imageAlt: hero.desktopImage?.alt || hero.mobileImage?.alt || fallback.hero.media.imageAlt },
        currentFootprint: { locations: hero.locations, region: hero.region, status: hero.status },
        heroProofRail: hero.heroProofRail || fallback.hero.heroProofRail,
        opportunity: { href: hero.primaryAction.href, label: hero.primaryAction.label },
        inquiry: { href: hero.secondaryAction.href, label: hero.secondaryAction.label, detail: hero.secondaryDetail || fallback.hero.inquiry.detail },
      } : fallback.hero,
      advantage: advantage || fallback.advantage,
      candidateProfile: candidateProfile ? { ...fallback.candidateProfile, section: { ...fallback.candidateProfile.section, eyebrow: candidateProfile.eyebrow, heading: candidateProfile.heading, introduction: candidateProfile.introduction }, mobileOrientation: { heading: candidateProfile.heading, introduction: candidateProfile.introduction }, image: candidateProfile.image?.src ? { ...fallback.candidateProfile.image, ...candidateProfile.image } : fallback.candidateProfile.image, partnership: { ...fallback.candidateProfile.partnership, candidateItems: candidateProfile.partnership.candidateItems, brandItems: candidateProfile.partnership.brandItems } } : fallback.candidateProfile,
      closingCta: closingCta ? { ...fallback.closingCta, eyebrow: closingCta.eyebrow, title: closingCta.title, description: closingCta.description, primaryAction: closingCta.primaryAction, researchAction: closingCta.secondaryAction } : fallback.closingCta,
    } as unknown as HomepageCmsContent;
  } catch { return fallback; }
});

export const getHomepageTestimonial = cache(async (): Promise<HomepageTestimonialContent | null> => {
  try {
    const parsed = homepageTestimonialSchema.safeParse(await sanityClient.withConfig({ useCdn: false }).fetch(HOMEPAGE_TESTIMONIAL_QUERY, {}, { next: { revalidate: 0, tags: ["sanity:homepage-testimonial"] } }));
    if (!parsed.success || !parsed.data?.image) return null;
    return { ...parsed.data, image: parsed.data.image };
  } catch { return null; }
});

export const getHomepageSocialProof = cache(async (): Promise<HomepageSocialProofContent> => {
  try {
    const parsed = homepageSocialProofSchema.safeParse(await sanityClient.withConfig({ useCdn: false }).fetch(HOMEPAGE_SOCIAL_PROOF_QUERY, {}, { next: { revalidate: 0, tags: ["sanity:homepage-social-proof"] } }));
    if (!parsed.success || !parsed.data || parsed.data.instagramPosts.some((post) => !post.image)) return homepageSocialProofFallback;
    return { ...parsed.data, source: "cms" } as HomepageSocialProofContent;
  } catch { return homepageSocialProofFallback; }
});

export const getSiteSettings = cache(async () => {
  const fallback = { organizationName: "Budda's Hawaiian Bakery & Grill", siteUrl: "https://buddasfranchise.com", defaultSeo: { title: "Budda's Hawaiian Bakery & Grill — Franchise Opportunity", description: "Explore Budda's Hawaiian Bakery & Grill franchise information." }, primaryNavigation: primaryNavItems, utilityNavigation: utilityNavItems, inquiryAction: { label: "Request Franchise Info", href: "/franchise/contact" }, ...FOOTER_CONTENT, footerNavigation: FOOTER_NAVIGATION };
  try {
    const parsed = siteSettingsSchema.safeParse(await sanityClient.fetch(SITE_SETTINGS_QUERY, {}, { next: { revalidate: 60, tags: ["sanity:site-settings"] } }));
    if (!parsed.success || !parsed.data) return fallback;
    return { ...fallback, ...parsed.data };
  } catch { return fallback; }
});

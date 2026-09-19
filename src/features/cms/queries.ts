import { defineQuery } from "next-sanity";

export const HOMEPAGE_QUERY = defineQuery(`*[_id == "homepage"][0]{
  seo,
  hero{..., heroProofRail[]{label, value}, desktopImage{asset->{url}, alt}, mobileImage{asset->{url}, alt}},
  advantage,
  candidateProfile{..., image{asset->{url}, alt}},
  closingCta
}`);

export const HOMEPAGE_TESTIMONIAL_QUERY = defineQuery(`*[_type == "homepageTestimonial" && enabled == true] | order(_updatedAt desc)[0]{
  eyebrow,
  quote,
  personName,
  personTitle,
  image{asset->{url}, alt},
  ctaLabel
}`);

export const HOMEPAGE_SOCIAL_PROOF_QUERY = defineQuery(`*[_type == "homepageSocialProof" && enabled == true] | order(_updatedAt desc)[0]{
  eyebrow,
  title,
  description,
  instagramPosts[]{image{asset->{url}, alt}, postUrl},
  googleReviews[]{reviewerName, review, rating},
  googleReviewsUrl,
  socialLinks[]{label, href, external}
}`);

export const SITE_SETTINGS_QUERY = defineQuery(`*[_id == "siteSettings"][0]{
  organizationName, siteUrl, defaultSeo{..., ogImage{asset->{url}, alt}},
  primaryNavigation, utilityNavigation, inquiryAction, email, phone, phoneHref,
  copyright, legalDisclaimer, footerNavigation
}`);

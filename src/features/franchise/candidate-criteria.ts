import {
  CANDIDATE_FINANCIAL_QUALIFICATION,
  getApprovedCandidateProfileFinancialQualification,
} from "@/src/features/financials/financial-data";

/**
 * Single application source for candidate self-selection content. Financial
 * values derive from the published threshold source; legal/editorial approval
 * metadata is intentionally internal and must be honored by a future CMS.
 */
export const FRANCHISE_CANDIDATE_CRITERIA = {
  operatingExperience: {
    id: "capability",
    index: "01",
    frameworkTerm: "Capability",
    publicLabel: "Operating Experience",
    meaning: "Restaurant leadership",
    heading: "Lead restaurant operations at scale.",
    description: "Relevant leadership may include multi-unit or high-volume restaurant operations.",
    requirementStatus: "REQUIRES_FRANCHISE_DEVELOPMENT_CONFIRMATION",
  },
  financial: {
    id: "capital",
    index: "02",
    frameworkTerm: "Capital",
    publicLabel: "Financial Readiness",
    meaning: "Financial requirement",
    description: CANDIDATE_FINANCIAL_QUALIFICATION.language,
    liquidCapital: CANDIDATE_FINANCIAL_QUALIFICATION.liquidCapital,
    netWorth: CANDIDATE_FINANCIAL_QUALIFICATION.netWorth,
    investmentDetailsHref: CANDIDATE_FINANCIAL_QUALIFICATION.destination,
    investmentRange: CANDIDATE_FINANCIAL_QUALIFICATION.investmentRange,
    disclosureStatus: CANDIDATE_FINANCIAL_QUALIFICATION.disclosureStatus,
    sourceReference: "PUBLIC_FRANCHISE_FINANCIAL_CONTENT.candidateQualification",
    governance: CANDIDATE_FINANCIAL_QUALIFICATION.governance,
    reviewOwner: CANDIDATE_FINANCIAL_QUALIFICATION.contentOwner,
    qualificationBasis: CANDIDATE_FINANCIAL_QUALIFICATION.qualificationBasis,
    requirementStatus: "REQUIRES_LEGAL_AND_FRANCHISE_DEVELOPMENT_REVIEW",
  },
  stewardship: {
    id: "stewardship",
    index: "03",
    frameworkTerm: "Stewardship",
    publicLabel: "Owner Stewardship",
    meaning: "Owner responsibility",
    heading: "Protect the product. Lead the team. Serve the community.",
    description: "Lead teams while upholding Budda's standards and community responsibilities.",
    requirementStatus: "REQUIRES_FRANCHISE_DEVELOPMENT_CONFIRMATION",
  },
  reviewedAt: null as string | null,
  reviewStatus: "REQUIRES_LEGAL_AND_FRANCHISE_DEVELOPMENT_REVIEW",
  contentOwner: "Franchise Development",
  requiresLegalReview: true,
} as const;

export const BUDDAS_EQUATION_CONTENT = {
  intro: {
    eyebrow: "The opportunity",
    heading: "A system built to repeat.",
    description: "Budda's pairs a distinctive bakery-led product with clear operating standards and hands-on owner stewardship.",
    tension: "Local soul × scalable discipline",
  },
  heroImage: {
    src: "/images/franchise-hero-signature-roll.png",
    alt: "Classic Budda Roll with a golden-brown crown and fine fibrous crumb.",
  },
  parts: [
    {
      id: "product",
      index: "01",
      label: "The product",
      heading: "A recognizable product at the center.",
      description: "The Budda Roll and a bakery-led menu give the brand a clear center of gravity.",
      proof: ["Signature product", "Bakery-led menu", "Recognizable experience"],
      image: {
        src: "/images/franchise-hero-signature-roll.png",
        alt: "Classic Budda Roll served on a plate.",
      },
    },
    {
      id: "system",
      index: "02",
      label: "The system",
      heading: "Standards that protect the experience.",
      description: "Clear operating standards, training, and ongoing support help make execution repeatable.",
      proof: ["Operating standards", "Training + opening support", "Brand tools + guidance", "Ongoing operational guidance"],
      image: {
        src: "/images/operator-proof-system-baker.png",
        alt: "Budda's bakery team member preparing a tray of rolls.",
      },
    },
    {
      id: "operator",
      index: "03",
      label: "The operator",
      heading: "The right people carry it forward.",
      description: "Hands-on operators lead teams and steward Budda's product and hospitality standards in their communities.",
      proof: ["Lead with integrity", "Build strong teams", "Steward the standard"],
      image: {
        src: "/images/buddas-contact-service.png",
        alt: "Budda's team member welcoming a guest at the counter.",
      },
    },
  ],
  result: {
    label: "The result",
    lead: "More tables.",
    emphasis: "Same standard.",
    description: "When the product, system, and operator work together, growth can follow readiness while the experience stays Budda's.",
  },
  opportunity: {
    href: "/franchise/the-opportunity",
    label: "Explore the Opportunity",
    microcopy: "Review the full franchise opportunity.",
  },
} as const;

export const OPERATOR_SUPPORT_CONTENT = {
  eyebrow: "What do I get as an operator?",
  heading: "Support built for operators.",
  description: "Practical systems help operators prepare teams, protect the product, order approved supplies, and carry Budda's standards into daily restaurant work.",
  image: {
    src: "/images/operator-proof-system-baker.png",
    alt: "Budda's bakery team member preparing a tray of rolls in the bakery.",
  },
  areas: [
    { index: "01", label: "Opening + training", title: "Prepare the team and the restaurant.", description: "Product knowledge, team preparation, and opening guidance help the team get ready to operate." },
    { index: "02", label: "Operating standards", title: "Operate from clear standards.", description: "Recipes, preparation methods, service behaviors, and operating procedures keep the standard visible." },
    { index: "03", label: "Brand + marketing", title: "Use approved brand tools.", description: "Brand guidelines, approved assets, and local-store marketing resources support consistent market expression." },
    { index: "04", label: "Supply + procurement", title: "Order against the approved catalog.", description: "The Operator Portal provides location-aware access to approved supplies, materials, pricing, and current orders." },
    { index: "05", label: "Ongoing operations", title: "Use current operating guidance.", description: "Support channels, operating resources, and standards updates keep guidance available after opening." },
  ],
  action: { href: "/franchise/process", label: "See How It Works", microcopy: "Review the mutual evaluation and development process." },
  governance: {
    reviewStatus: "REQUIRES_OPERATIONS_AND_FRANCHISE_DEVELOPMENT_REVIEW",
    sourceReference: null,
  },
} as const;

/** Candidate-facing framing and presentation metadata share one governed source. */
export const CANDIDATE_PROFILE_CONTENT = {
  mobileOrientation: {
    heading: "What we look for in an operator.",
    introduction: "Strong candidates bring restaurant leadership, financial readiness, and an ownership mindset that protects the product, team, and guest experience.",
  },
  section: {
    eyebrow: "Candidate Profile",
    framework: "Capability × Capital × Stewardship",
    heading: "What we look for in an operator.",
    introduction:
      "Strong candidates bring restaurant leadership, financial readiness, and an ownership mindset that protects the product, team, and guest experience.",
  },
  partnership: {
    heading: "The partnership works both ways.",
    candidateLabel: "What you bring",
    candidateItems: [
      "Restaurant leadership",
      "Financial readiness",
      "Hands-on owner stewardship",
    ],
    brandLabel: "What Budda's brings",
    brandItems: [
      "A distinctive signature product",
      "Bakery and product standards",
    ],
    reviewStatus: "REQUIRES_FRANCHISE_DEVELOPMENT_REVIEW",
  },
  preliminaryNotice: {
    label: "Preliminary candidate profile",
    text: "Meeting preliminary criteria does not constitute approval. An inquiry is not an application, territory reservation, or offer of a franchise.",
    reviewStatus: "REQUIRES_LEGAL_AND_FRANCHISE_DEVELOPMENT_REVIEW",
  },
  processAction: {
    href: "/franchise/process",
    label: "See the mutual evaluation process",
  },
  qualificationAction: {
    href: "/franchise/the-opportunity?source_page=homepage_candidate_profile#qualifications",
    label: "View Qualifications",
    microcopy: "Opens the Mutual Operator Fit section of the franchise opportunity.",
  },
  inquiryAction: {
    href: "/franchise/contact?source_page=homepage_candidate_profile",
    label: "Start the 3-Step Inquiry",
  },
  image: {
    src: "/images/buddas-about-storefront.png",
    alt: "A baker arranging freshly baked rolls at a sunlit bakery counter",
    captionLabel: "Bakery operations",
    caption: "Product handling in practice.",
    reviewStatus: "REQUIRES_BRAND_AND_OPERATIONS_REVIEW",
  },
  reviewStatus: "REQUIRES_LEGAL_AND_FRANCHISE_DEVELOPMENT_REVIEW",
  reviewedAt: null as string | null,
} as const;

export type CandidateProfilePillar = {
  id: "capability" | "capital" | "stewardship";
  number: "01" | "02" | "03";
  frameworkTerm: string;
  publicLabel: string;
  meaning: string;
  standard: string;
  supportingExpectation?: string;
  detailsHref?: string;
  detailsLabel?: string;
};

/** Both responsive presentations resolve qualification facts through this gate. */
export const getCandidateProfilePillars = (): readonly CandidateProfilePillar[] => {
  const hasApprovedFinancialQualification =
    getApprovedCandidateProfileFinancialQualification() !== null;

  return [
    {
      id: FRANCHISE_CANDIDATE_CRITERIA.operatingExperience.id,
      number: FRANCHISE_CANDIDATE_CRITERIA.operatingExperience.index,
      frameworkTerm: FRANCHISE_CANDIDATE_CRITERIA.operatingExperience.frameworkTerm,
      publicLabel: FRANCHISE_CANDIDATE_CRITERIA.operatingExperience.publicLabel,
      meaning: FRANCHISE_CANDIDATE_CRITERIA.operatingExperience.meaning,
      standard: FRANCHISE_CANDIDATE_CRITERIA.operatingExperience.heading,
      supportingExpectation: FRANCHISE_CANDIDATE_CRITERIA.operatingExperience.description,
    },
    {
      id: FRANCHISE_CANDIDATE_CRITERIA.financial.id,
      number: FRANCHISE_CANDIDATE_CRITERIA.financial.index,
      frameworkTerm: FRANCHISE_CANDIDATE_CRITERIA.financial.frameworkTerm,
      publicLabel: FRANCHISE_CANDIDATE_CRITERIA.financial.publicLabel,
      meaning: FRANCHISE_CANDIDATE_CRITERIA.financial.meaning,
      standard: hasApprovedFinancialQualification
        ? `${FRANCHISE_CANDIDATE_CRITERIA.financial.liquidCapital.display} ${FRANCHISE_CANDIDATE_CRITERIA.financial.liquidCapital.qualifier} · ${FRANCHISE_CANDIDATE_CRITERIA.financial.netWorth.display} ${FRANCHISE_CANDIDATE_CRITERIA.financial.netWorth.qualifier}`
        : "Have the resources to develop responsibly.",
      supportingExpectation: FRANCHISE_CANDIDATE_CRITERIA.financial.description,
      detailsHref: FRANCHISE_CANDIDATE_CRITERIA.financial.investmentDetailsHref,
      detailsLabel: "See financial qualifications →",
    },
    {
      id: FRANCHISE_CANDIDATE_CRITERIA.stewardship.id,
      number: FRANCHISE_CANDIDATE_CRITERIA.stewardship.index,
      frameworkTerm: FRANCHISE_CANDIDATE_CRITERIA.stewardship.frameworkTerm,
      publicLabel: FRANCHISE_CANDIDATE_CRITERIA.stewardship.publicLabel,
      meaning: FRANCHISE_CANDIDATE_CRITERIA.stewardship.meaning,
      standard: FRANCHISE_CANDIDATE_CRITERIA.stewardship.heading,
      supportingExpectation: FRANCHISE_CANDIDATE_CRITERIA.stewardship.description,
    },
  ];
};

import {
  CANDIDATE_FINANCIAL_QUALIFICATION,
} from "@/src/features/financials/financial-data";

/**
 * Single application source for candidate self-selection content. Financial
 * values derive from the published threshold source; legal/editorial approval
 * metadata is intentionally internal and must be honored by a future CMS.
 */
export const FRANCHISE_CANDIDATE_CRITERIA = {
  operatingExperience: {
    meaning: "Restaurant leadership",
    heading: "Multi-unit or high-volume restaurant experience",
    description: "Lead multiple locations or high-volume restaurant operations.",
  },
  financial: {
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
  },
  stewardship: {
    meaning: "Owner responsibility",
    heading: "Protect the product. Lead the team. Serve the community.",
    description: "Lead teams while upholding Budda's standards and community responsibilities.",
  },
  reviewedAt: null as string | null,
  reviewStatus: "REQUIRES_LEGAL_AND_FRANCHISE_DEVELOPMENT_REVIEW",
  contentOwner: "Franchise Development",
  requiresLegalReview: true,
} as const;

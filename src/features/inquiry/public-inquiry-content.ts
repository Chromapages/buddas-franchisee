type InquiryFactGovernance = {
  source: string;
  owner: string;
  status: "APPROVED" | "REQUIRES_FRANCHISE_DEVELOPMENT_REVIEW";
  lastReviewedAt: string | null;
  effectiveDate: string | null;
};

type GovernedInquiryFact<T> = {
  value: T;
  governance: InquiryFactGovernance;
};

const inquiryExpectationGovernance: InquiryFactGovernance = {
  source: "Franchise development initial-inquiry process",
  owner: "Franchise Development Leadership",
  status: "REQUIRES_FRANCHISE_DEVELOPMENT_REVIEW",
  lastReviewedAt: null,
  effectiveDate: null,
};

const governedInquiryFact = <T>(value: T): GovernedInquiryFact<T> => ({
  value,
  governance: inquiryExpectationGovernance,
});

/**
 * One public source for the inquiry route's pre-submit expectations. These
 * facts are shared by the CTA, route header, process page, and confirmations
 * so candidates do not receive conflicting process information.
 */
export const PUBLIC_INITIAL_INQUIRY_CONTENT = {
  stageCount: governedInquiryFact(3),
  completionEstimate: governedInquiryFact("3–5 minutes"),
  ctaExpectation: governedInquiryFact("Three-step initial inquiry · about 3–5 minutes"),
  responseTarget: governedInquiryFact("within 2 business days"),
} as const;

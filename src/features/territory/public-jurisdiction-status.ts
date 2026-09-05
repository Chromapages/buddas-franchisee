export type JurisdictionOfferingStatus =
  | "OFFERING_CLEARED"
  | "REGISTRATION_PENDING"
  | "FUTURE_MARKET_INTEREST";

export type CommercialAvailabilityStatus = "INDIVIDUAL_REVIEW" | "NOT_PUBLISHED";

export type JurisdictionReviewStatus = "APPROVED" | "PENDING_LEGAL_REVIEW" | "OUTDATED";

export type PublicJurisdictionStatusRecord = {
  code: string;
  name: string;
  publicLabel: string;
  offeringStatus: JurisdictionOfferingStatus;
  commercialAvailability: CommercialAvailabilityStatus;
  explanatoryNote: string;
  lastReviewedAt: string | null;
  reviewStatus: JurisdictionReviewStatus;
  sourceOwner: string;
  sourceReference: string | null;
};

export type PublicJurisdictionDisplay = {
  code: string;
  name: string;
  label: string;
  note: string;
  commercialAvailabilityLabel: string;
  inquiryNotice: string;
  isCurrent: boolean;
};

const REVIEW_MAX_AGE_DAYS = 90;

const withPendingReview = (
  code: string,
  name: string,
  offeringStatus: JurisdictionOfferingStatus,
  publicLabel: string,
  explanatoryNote: string,
): PublicJurisdictionStatusRecord => ({
  code,
  name,
  offeringStatus,
  publicLabel,
  commercialAvailability: "INDIVIDUAL_REVIEW",
  explanatoryNote,
  lastReviewedAt: null,
  reviewStatus: "PENDING_LEGAL_REVIEW",
  sourceOwner: "Franchise Legal & Development",
  sourceReference: null,
});

/**
 * Jurisdiction content is intentionally separate from presentation. A record
 * cannot be displayed as current until Legal & Development provide a reviewed
 * date, approved status, and source reference.
 */
export const PUBLIC_JURISDICTION_STATUSES: readonly PublicJurisdictionStatusRecord[] = [
  ...[
    ["HI", "Hawai'i"], ["UT", "Utah"], ["NV", "Nevada"], ["AZ", "Arizona"], ["TX", "Texas"], ["FL", "Florida"],
    ["CO", "Colorado"], ["NC", "North Carolina"], ["GA", "Georgia"], ["OH", "Ohio"], ["CA", "California"], ["WA", "Washington"],
  ].map(([code, name]) => withPendingReview(code, name, "OFFERING_CLEARED", "Active offering cleared", "Current public offering status is subject to approved jurisdiction review.")),
  ...[
    ["NY", "New York"], ["IL", "Illinois"], ["VA", "Virginia"], ["MD", "Maryland"], ["MN", "Minnesota"],
    ["WI", "Wisconsin"], ["IN", "Indiana"], ["ND", "North Dakota"], ["RI", "Rhode Island"], ["SD", "South Dakota"],
  ].map(([code, name]) => withPendingReview(code, name, "REGISTRATION_PENDING", "Registration pending", "Public offering status is pending current jurisdiction review.")),
  ...[
    ["OR", "Oregon"], ["ID", "Idaho"], ["TN", "Tennessee"],
  ].map(([code, name]) => withPendingReview(code, name, "FUTURE_MARKET_INTEREST", "Future market interest", "This jurisdiction is listed for future market interest only.")),
] as const;

const statusIsCurrent = (record: PublicJurisdictionStatusRecord) => {
  if (record.reviewStatus !== "APPROVED" || !record.lastReviewedAt || !record.sourceReference) return false;

  const reviewedAt = new Date(record.lastReviewedAt);
  if (Number.isNaN(reviewedAt.getTime())) return false;

  const ageInDays = (Date.now() - reviewedAt.getTime()) / (1000 * 60 * 60 * 24);
  return ageInDays >= 0 && ageInDays <= REVIEW_MAX_AGE_DAYS;
};

export const getPublicJurisdictionDisplay = (
  record: PublicJurisdictionStatusRecord,
): PublicJurisdictionDisplay => {
  const isCurrent = statusIsCurrent(record);

  if (!isCurrent) {
    return {
      code: record.code,
      name: record.name,
      label: "Status under review",
      note: "Current public offering status is not available in this explorer. Discuss this jurisdiction with the franchise development team during qualification.",
      commercialAvailabilityLabel: "Reviewed individually during qualification",
      inquiryNotice: "An inquiry does not reserve, protect, award, or guarantee a territory.",
      isCurrent: false,
    };
  }

  return {
    code: record.code,
    name: record.name,
    label: record.publicLabel,
    note: record.explanatoryNote,
    commercialAvailabilityLabel: record.commercialAvailability === "INDIVIDUAL_REVIEW"
      ? "Reviewed individually during qualification"
      : "Not published publicly",
    inquiryNotice: "An inquiry does not reserve, protect, award, or guarantee a territory.",
    isCurrent: true,
  };
};

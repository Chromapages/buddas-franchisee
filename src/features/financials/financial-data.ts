import type {
  FinancialThresholds,
  FinancialDisclosureGovernance,
  FinancialDisclosurePlacement,
  InvestmentItem,
  Item19PerformanceRow,
} from "./types";

const UNAPPROVED_FINANCIAL_GOVERNANCE: FinancialDisclosureGovernance = {
  fddEdition: null,
  effectiveDate: null,
  reviewStatus: "REQUIRES_LEGAL_AND_FRANCHISE_DEVELOPMENT_REVIEW",
  reviewedBy: null,
  reviewedAt: null,
  approvalExpiresAt: null,
  approvedPlacements: [],
};

const isCurrentApproval = (
  governance: FinancialDisclosureGovernance,
  asOf: Date,
) => {
  if (
    governance.effectiveDate === null ||
    governance.approvalExpiresAt === null
  ) {
    return false;
  }

  const effectiveAt = Date.parse(governance.effectiveDate);
  const expiresAt = Date.parse(governance.approvalExpiresAt);

  return Number.isFinite(effectiveAt) &&
    Number.isFinite(expiresAt) &&
    effectiveAt <= asOf.getTime() &&
    asOf.getTime() <= expiresAt;
};

export const isApprovedPublicFinancialPlacement = (
  governance: FinancialDisclosureGovernance,
  placement: FinancialDisclosurePlacement,
  asOf = new Date(),
) =>
  governance.reviewStatus === "APPROVED" &&
  governance.fddEdition !== null &&
  governance.effectiveDate !== null &&
  governance.reviewedBy !== null &&
  governance.reviewedAt !== null &&
  isCurrentApproval(governance, asOf) &&
  governance.approvedPlacements.includes(placement);

/** Sensitive values retained for approved-placement release paths; not public by default. */
export const UNAPPROVED_FINANCIAL_THRESHOLDS: FinancialThresholds = {
  initialFranchiseFee: 35_000,
  estimatedInvestmentLow: 425_000,
  estimatedInvestmentHigh: 875_000,
  liquidCapitalRequirement: 150_000,
  minimumNetWorth: 400_000,
  royaltyFeePercent: 5.0,
  brandFundPercent: 1.5,
};

const formatCompactCurrency = (amount: number) => `$${Math.round(amount / 1_000)}K`;

/**
 * FDD Item 7-aligned investment disclosure. Legal and franchise-development
 * approval is required before this value is published in any new placement.
 */
const formatInvestmentAmount = (amount: number) =>
  `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount)}`;

const estimatedInvestmentLow = formatInvestmentAmount(
  UNAPPROVED_FINANCIAL_THRESHOLDS.estimatedInvestmentLow,
);
const estimatedInvestmentHigh = formatInvestmentAmount(
  UNAPPROVED_FINANCIAL_THRESHOLDS.estimatedInvestmentHigh,
);

export const FRANCHISE_INVESTMENT_DISCLOSURE = {
  displayRange: `${estimatedInvestmentLow} – ${estimatedInvestmentHigh}`,
  inquiryOptions: [
    `Under ${estimatedInvestmentLow}`,
    `${estimatedInvestmentLow} – ${estimatedInvestmentHigh}`,
    `${estimatedInvestmentHigh}+`,
  ],
  publicationStatus: "REQUIRES_LEGAL_AND_FRANCHISE_DEVELOPMENT_REVIEW",
  governance: UNAPPROVED_FINANCIAL_GOVERNANCE,
} as const;

/**
 * Canonical public-financial model. It deliberately keeps qualification,
 * startup investment, and Item 19 performance data in separate domains.
 * Missing or expired approval metadata must fail closed at each placement.
 */
export const PUBLIC_FRANCHISE_FINANCIAL_CONTENT = {
  candidateQualification: {
    liquidCapital: {
      amount: UNAPPROVED_FINANCIAL_THRESHOLDS.liquidCapitalRequirement,
      display: formatCompactCurrency(UNAPPROVED_FINANCIAL_THRESHOLDS.liquidCapitalRequirement),
      qualifier: "Liquid capital",
    },
    netWorth: {
      amount: UNAPPROVED_FINANCIAL_THRESHOLDS.minimumNetWorth,
      display: formatCompactCurrency(UNAPPROVED_FINANCIAL_THRESHOLDS.minimumNetWorth),
      qualifier: "Net worth",
    },
    language: "Required financial readiness for development.",
    destination: "/franchise/the-opportunity#financial-requirements",
    investmentRange: FRANCHISE_INVESTMENT_DISCLOSURE.displayRange,
    disclosureStatus: FRANCHISE_INVESTMENT_DISCLOSURE.publicationStatus,
    governance: FRANCHISE_INVESTMENT_DISCLOSURE.governance,
    contentOwner: "Franchise Development",
    qualificationBasis: {
      applicantScope: null as "individual" | "entity" | "candidate-group" | null,
      commitmentBasis: null as "per-unit" | "per-development-commitment" | null,
      fundsCondition: null as "unencumbered" | "non-borrowed" | null,
    },
  },
} as const;

export const CANDIDATE_FINANCIAL_QUALIFICATION =
  PUBLIC_FRANCHISE_FINANCIAL_CONTENT.candidateQualification;

/** @deprecated Use UNAPPROVED_FINANCIAL_THRESHOLDS until a placement is approved. */
export const PUBLISHED_FINANCIAL_THRESHOLDS = UNAPPROVED_FINANCIAL_THRESHOLDS;

export const isCandidateProfileFinancialQualificationApproved =
  isApprovedPublicFinancialPlacement(
    CANDIDATE_FINANCIAL_QUALIFICATION.governance,
    "candidate-profile",
  );

export const getApprovedCandidateProfileFinancialQualification = (
  asOf = new Date(),
) =>
  isApprovedPublicFinancialPlacement(
    CANDIDATE_FINANCIAL_QUALIFICATION.governance,
    "candidate-profile",
    asOf,
  )
    ? CANDIDATE_FINANCIAL_QUALIFICATION
    : null;

export const ESTIMATED_INITIAL_INVESTMENT_TABLE: InvestmentItem[] = [
  {
    category: "Initial Franchise Fee",
    lowEstimate: 35_000,
    highEstimate: 35_000,
    paymentMethod: "Lump Sum",
    toWhomPaid: "Budda's Franchising LLC",
    notes: "Fully earned upon signing franchise agreement.",
  },
  {
    category: "Leasehold Improvements & Architecture",
    lowEstimate: 210_000,
    highEstimate: 450_000,
    paymentMethod: "As Incurred",
    toWhomPaid: "Contractors & Architects",
    notes: "Varies by restaurant footprint (1,800 - 2,600 sq ft) and site condition.",
  },
  {
    category: "Bakery & Kitchen Equipment, POS, Smallwares",
    lowEstimate: 110_000,
    highEstimate: 220_000,
    paymentMethod: "As Incurred",
    toWhomPaid: "Approved Vendors",
    notes: "Includes steam ovens, roll proofers, char-broilers, refrigeration, and POS hardware.",
  },
  {
    category: "Signage & Brand Graphics Package",
    lowEstimate: 20_000,
    highEstimate: 45_000,
    paymentMethod: "As Incurred",
    toWhomPaid: "Approved Fabricators",
    notes: "Exterior architectural signage, illuminated roll icons, and interior mural packages.",
  },
  {
    category: "Opening Inventory, Packaging & Supplies",
    lowEstimate: 15_000,
    highEstimate: 35_000,
    paymentMethod: "Before Opening",
    toWhomPaid: "Approved Distributors",
    notes: "Initial proprietary dough bases, butter spreads, branded boxes, and dry goods.",
  },
  {
    category: "Grand Opening Marketing & Local Launch",
    lowEstimate: 10_000,
    highEstimate: 25_000,
    paymentMethod: "As Incurred",
    toWhomPaid: "Media & Marketing Vendors",
    notes: "Targeted digital, tasting events, and community partnership initiatives.",
  },
  {
    category: "Additional Funds (3-Month Working Capital)",
    lowEstimate: 25_000,
    highEstimate: 65_000,
    paymentMethod: "As Incurred",
    toWhomPaid: "Employees, Utilities, Suppliers",
    notes: "Operating reserve to cover initial payroll, utilities, and working cash.",
  },
];

export const ITEM_19_FPR_DATA: Item19PerformanceRow[] = [
  {
    metric: "Annual Gross Revenues (AUV)",
    topQuartile: "$2,450,000",
    midQuartile: "$1,820,000",
    systemAverage: "$1,940,000",
    notes: "Based on reporting affiliate/restaurant operations open full 12 months.",
  },
  {
    metric: "Cost of Goods Sold (Food & Packaging %)",
    topQuartile: "28.4%",
    midQuartile: "30.8%",
    systemAverage: "29.9%",
    notes: "Reflects wholesale dough program efficiencies and optimized recipe yields.",
  },
  {
    metric: "Gross Margin (before labor & occupancy)",
    topQuartile: "71.6%",
    midQuartile: "69.2%",
    systemAverage: "70.1%",
    notes: "Excludes royalty fees, occupancy costs, and manager salaries.",
  },
  {
    metric: "Average Ticket Size",
    topQuartile: "$28.50",
    midQuartile: "$22.80",
    systemAverage: "$24.20",
    notes: "Driven by multi-pack roll additions on 72% of grill lunch/dinner tickets.",
  },
];

export const ITEM_19_LEGAL_DISCLAIMER =
  "These figures are based on historical operating data of affiliate locations operating under the Budda's brand name. Some outlets have sold this amount. Your individual financial results may differ. There is no assurance that you'll sell as much. Written substantiation for the financial performance representation will be made available to prospective franchisees upon reasonable request.";

export const ITEM_19_GOVERNANCE: FinancialDisclosureGovernance = {
  ...UNAPPROVED_FINANCIAL_GOVERNANCE,
  approvedPlacements: [],
};

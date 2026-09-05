export type InvestmentItem = {
  category: string;
  lowEstimate: number;
  highEstimate: number;
  paymentMethod: string;
  toWhomPaid: string;
  notes: string;
};

export type FinancialThresholds = {
  initialFranchiseFee: number;
  estimatedInvestmentLow: number;
  estimatedInvestmentHigh: number;
  liquidCapitalRequirement: number;
  minimumNetWorth: number;
  royaltyFeePercent: number;
  brandFundPercent: number;
};

export type Item19PerformanceRow = {
  metric: string;
  topQuartile: string;
  midQuartile: string;
  systemAverage: string;
  notes: string;
};

export type FinancialDisclosurePlacement = "hero" | "inquiry" | "opportunity" | "candidate-profile" | "item19";

export type FinancialDisclosureGovernance = {
  fddEdition: string | null;
  effectiveDate: string | null;
  reviewStatus: "REQUIRES_LEGAL_AND_FRANCHISE_DEVELOPMENT_REVIEW" | "APPROVED" | "REJECTED";
  reviewedBy: string | null;
  reviewedAt: string | null;
  approvalExpiresAt: string | null;
  approvedPlacements: readonly FinancialDisclosurePlacement[];
};

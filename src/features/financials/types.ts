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

import type {
  FinancialThresholds,
  InvestmentItem,
  Item19PerformanceRow,
} from "./types";

export const PUBLISHED_FINANCIAL_THRESHOLDS: FinancialThresholds = {
  initialFranchiseFee: 35_000,
  estimatedInvestmentLow: 425_000,
  estimatedInvestmentHigh: 875_000,
  liquidCapitalRequirement: 150_000,
  minimumNetWorth: 400_000,
  royaltyFeePercent: 5.0,
  brandFundPercent: 1.5,
};

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

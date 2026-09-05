import type { StructuredListData } from "@/src/components/public/structured-list-highlight";

type FaqReviewStatus = "APPROVED" | "REQUIRES_FRANCHISE_DEVELOPMENT_REVIEW" | "REQUIRES_LEGAL_AND_FRANCHISE_DEVELOPMENT_REVIEW";
type FinancialReviewRequirement = "NONE" | "FINANCIAL_DISCLOSURE_REVIEW_REQUIRED" | "ITEM_19_REQUIRED";

type FranchiseFaqGovernance = {
  publicStatus: "PUBLIC" | "HOLD_FOR_REVIEW";
  lastReviewedAt: string | null;
  sourceDocument: string | null;
  owner: string;
  legalReviewStatus: FaqReviewStatus;
  financialClaimReviewRequirement: FinancialReviewRequirement;
  requiresLegalReview: boolean;
};

type FranchiseFaqContentItem = {
  id: string;
  slug: string;
  category: string;
  question: string;
  answer: string;
  details?: string[];
  structuredList?: StructuredListData;
  relatedSlugs?: string[];
  searchTerms?: string[];
  deepLink?: { href: string; label: string };
  contextualCta?: never;
  helpfulnessEnabled: boolean;
  sortOrder: number;
  governance: FranchiseFaqGovernance;
};

export type PublicFranchiseFaqItem = Omit<FranchiseFaqContentItem, "governance" | "sortOrder" | "question"> & {
  title: string;
};

export const FAQ_RETRIEVAL_CONFIG = {
  searchEnabled: true,
  categoryFilter: {
    enabled: true,
    minimumQuestionsPerCategory: 2,
  },
} as const;

export const FRANCHISE_FAQ_CONTENT: readonly FranchiseFaqContentItem[] = [
  {
    id: "faq-1",
    slug: "what-makes-buddas-different",
    category: "Concept & Operations",
    question: "What makes Budda's different from other Hawaiian fast-casual brands?",
    answer: "Budda's is anchored by an authentic in-house steam deck bakery producing our proprietary sweet Budda Roll.",
    details: ["Unlike standard plate lunch concepts that rely strictly on a lunch rush, our bakery unlocks three high-margin dayparts: morning breakfast roll sandwiches, high-speed lunch plate combos, and dinner family feast takeout packages with multi-pack roll boxes."],
    structuredList: { ariaLabel: "Three operating dayparts", items: [{ label: "Morning", detail: "Breakfast roll sandwiches", icon: "sun" }, { label: "Lunch", detail: "High-speed plate combos", icon: "clock" }, { label: "Dinner", detail: "Family feast takeout", icon: "moon" }] },
    relatedSlugs: ["financial-qualifications", "training-and-support"],
    searchTerms: ["bakery", "budda roll", "daypart"],
    deepLink: { href: "/franchise/why-buddas", label: "Explore the Budda's operating model" },
    helpfulnessEnabled: true,
    sortOrder: 10,
    governance: { publicStatus: "PUBLIC", lastReviewedAt: null, sourceDocument: "Why Budda's operating model", owner: "Franchise Development", legalReviewStatus: "REQUIRES_FRANCHISE_DEVELOPMENT_REVIEW", financialClaimReviewRequirement: "NONE", requiresLegalReview: false },
  },
  {
    id: "faq-4",
    slug: "in-store-roll-baking",
    category: "Supply & Ingredients",
    question: "Do I have to bake the rolls from scratch at every restaurant?",
    answer: "No. Budda's supplies proprietary pre-portioned frozen dough bases formulated by our founding master bakers.",
    details: ["In-store staff simply follow our standardized proofing and steam baking protocols, eliminating the need for master baker labor while ensuring 100% recipe consistency across every location."],
    structuredList: { ariaLabel: "Roll production overview", items: [{ label: "Pre-portioned", detail: "Proprietary frozen dough bases", icon: "package" }, { label: "Standardized", detail: "Proofing and steam-baking steps", icon: "clock" }, { label: "Consistent", detail: "Same recipe across locations", icon: "package" }] },
    relatedSlugs: ["training-and-support", "what-makes-buddas-different"],
    searchTerms: ["bakery", "supply", "dough"],
    deepLink: { href: "/franchise/why-buddas", label: "Explore the bakery operating model" },
    helpfulnessEnabled: true,
    sortOrder: 20,
    governance: { publicStatus: "PUBLIC", lastReviewedAt: null, sourceDocument: "Bakery operating model", owner: "Operations", legalReviewStatus: "REQUIRES_FRANCHISE_DEVELOPMENT_REVIEW", financialClaimReviewRequirement: "NONE", requiresLegalReview: false },
  },
  {
    id: "faq-2",
    slug: "financial-qualifications",
    category: "Investment & Capital",
    question: "What are the financial qualifications required to open a Budda's franchise?",
    answer: "Prospective operating partners must possess a minimum of $150,000 in verifiable liquid capital and a minimum net worth of $400,000 per unit commitment.",
    details: ["The initial franchise fee is $35,000, with an estimated initial investment range of $425,000 to $875,000 depending on location size, building condition, and market real estate costs."],
    structuredList: { ariaLabel: "Financial qualification overview", items: [{ label: "$150K", detail: "Minimum liquid capital", icon: "banknote" }, { label: "$400K", detail: "Minimum net worth", icon: "banknote" }, { label: "$425K–$875K", detail: "Estimated initial investment", icon: "banknote" }] },
    relatedSlugs: ["territory-award-process", "franchise-opening-timeline"],
    searchTerms: ["fdd", "net worth", "liquid capital", "investment"],
    deepLink: { href: "/franchise/the-opportunity#financial-requirements", label: "Review financial qualification and disclosure information" },
    helpfulnessEnabled: true,
    sortOrder: 30,
    governance: { publicStatus: "PUBLIC", lastReviewedAt: null, sourceDocument: "FDD Item 5 and Item 7 / candidate qualification criteria", owner: "Franchise Legal & Development", legalReviewStatus: "REQUIRES_LEGAL_AND_FRANCHISE_DEVELOPMENT_REVIEW", financialClaimReviewRequirement: "FINANCIAL_DISCLOSURE_REVIEW_REQUIRED", requiresLegalReview: true },
  },
  {
    id: "faq-3",
    slug: "territory-award-process",
    category: "Territory & Markets",
    question: "How does Budda's determine and award market territories?",
    answer: "Budda's grants protected geographic territories based on demographic density, traffic patterns, and trade area population.",
    details: ["Territory availability is evaluated during preliminary qualification screening. An initial inquiry does not hold or reserve a territory until a Franchise Agreement is executed."],
    structuredList: { ariaLabel: "Territory evaluation overview", items: [{ label: "Market data", detail: "Demographics and trade area", icon: "map" }, { label: "Qualification", detail: "Availability reviewed early", icon: "calendar" }, { label: "Agreement", detail: "Only then is territory granted", icon: "map" }] },
    relatedSlugs: ["financial-qualifications", "franchise-opening-timeline"],
    searchTerms: ["territory", "market"],
    deepLink: { href: "/franchise/the-opportunity#territory", label: "Review market and territory information" },
    helpfulnessEnabled: true,
    sortOrder: 40,
    governance: { publicStatus: "PUBLIC", lastReviewedAt: null, sourceDocument: "Territory evaluation process", owner: "Franchise Development", legalReviewStatus: "REQUIRES_LEGAL_AND_FRANCHISE_DEVELOPMENT_REVIEW", financialClaimReviewRequirement: "NONE", requiresLegalReview: true },
  },
  {
    id: "faq-5",
    slug: "training-and-support",
    category: "Training & Support",
    question: "What initial and ongoing training does Budda's provide?",
    answer: "All new franchisees complete our 3-week intensive training academy covering baking science, grill line execution, POS and inventory management, labor scheduling, and island hospitality standards.",
    details: ["We also provide on-site opening support teams for 7 days during your grand opening week."],
    structuredList: { ariaLabel: "Training and support overview", items: [{ label: "3 weeks", detail: "Initial training academy", icon: "training" }, { label: "Operations", detail: "Baking, grill, POS and inventory", icon: "training" }, { label: "7 days", detail: "Opening-week onsite support", icon: "calendar" }] },
    relatedSlugs: ["in-store-roll-baking", "franchise-opening-timeline"],
    searchTerms: ["support", "training"],
    deepLink: { href: "/franchise/the-opportunity#support-runway", label: "Review support and operating responsibilities" },
    helpfulnessEnabled: true,
    sortOrder: 50,
    governance: { publicStatus: "PUBLIC", lastReviewedAt: null, sourceDocument: "Training and support runway", owner: "Operations", legalReviewStatus: "REQUIRES_FRANCHISE_DEVELOPMENT_REVIEW", financialClaimReviewRequirement: "NONE", requiresLegalReview: false },
  },
  {
    id: "faq-6",
    slug: "franchise-opening-timeline",
    category: "Process & Diligence",
    question: "What is the timeline from initial inquiry to restaurant opening?",
    answer: "The mutual evaluation and qualification process typically takes 30 to 60 days.",
    details: ["Following franchise agreement execution, site selection, architectural permitting, buildout, and opening preparation generally takes 6 to 9 months depending on municipal permitting timelines."],
    structuredList: { ariaLabel: "Development timeline overview", items: [{ label: "30–60 days", detail: "Mutual evaluation and qualification", icon: "calendar" }, { label: "Site to permit", detail: "Selection and approvals", icon: "map" }, { label: "6–9 months", detail: "Buildout through opening", icon: "clock" }] },
    relatedSlugs: ["financial-qualifications", "territory-award-process"],
    searchTerms: ["timeline", "opening"],
    deepLink: { href: "/franchise/process", label: "Review the mutual evaluation process" },
    helpfulnessEnabled: true,
    sortOrder: 60,
    governance: { publicStatus: "PUBLIC", lastReviewedAt: null, sourceDocument: "Mutual evaluation and opening process", owner: "Franchise Development", legalReviewStatus: "REQUIRES_FRANCHISE_DEVELOPMENT_REVIEW", financialClaimReviewRequirement: "NONE", requiresLegalReview: false },
  },
];

export const getPublicFranchiseFaqItems = (): PublicFranchiseFaqItem[] =>
  FRANCHISE_FAQ_CONTENT
    .filter((item) => item.governance.publicStatus === "PUBLIC")
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map(({ governance: _governance, sortOrder: _sortOrder, question, ...item }) => ({
      ...item,
      title: question,
    }));

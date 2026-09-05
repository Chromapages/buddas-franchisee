export type OpportunityContentReview = {
  classification: "EDITORIAL" | "BUSINESS_COMMITMENT" | "FINANCIAL_DISCLOSURE" | "LEGAL_DISCLOSURE";
  reviewStatus: "APPROVED" | "REQUIRES_BUSINESS_REVIEW" | "REQUIRES_LEGAL_AND_FRANCHISE_DEVELOPMENT_REVIEW";
  verificationStatus: "NOT_APPLICABLE" | "UNVERIFIED" | "VERIFIED";
  owner: string;
  reviewedAt: string | null;
  sourceReference: string | null;
  reviewTrigger: string | null;
};

export type GovernedOpportunityCopy = {
  text: string;
  governance: OpportunityContentReview;
};

const editorial = (text: string): GovernedOpportunityCopy => ({
  text,
  governance: { classification: "EDITORIAL", reviewStatus: "APPROVED", verificationStatus: "NOT_APPLICABLE", owner: "Brand & Content", reviewedAt: null, sourceReference: null, reviewTrigger: null },
});

const reviewed = (
  text: string,
  classification: Exclude<OpportunityContentReview["classification"], "EDITORIAL">,
  owner: string,
  reviewTrigger: string,
): GovernedOpportunityCopy => ({
  text,
  // Sensitive public copy cannot become verified until its accountable owner attaches an approved source.
  governance: { classification, reviewStatus: classification === "BUSINESS_COMMITMENT" ? "REQUIRES_BUSINESS_REVIEW" : "REQUIRES_LEGAL_AND_FRANCHISE_DEVELOPMENT_REVIEW", verificationStatus: "UNVERIFIED", owner, reviewedAt: null, sourceReference: null, reviewTrigger },
});

const FINANCIAL_QUALIFICATION_DISTINCTION = editorial(
  "Candidate financial qualification is the baseline Budda's uses for fit review; it is not a statement of franchise development cost.",
);

/**
 * Authoritative public dossier outline. Every responsive index, section ID,
 * visible chapter label, and chapter-navigation analytic resolves from here.
 * Review franchise-sensitive chapter naming once here before publishing.
 */
export const OPPORTUNITY_DOSSIER_CHAPTERS = [
  { number: "01", label: editorial("Opportunity Thesis"), id: "opportunity-thesis", legacyIds: [], analyticsId: "opportunity_thesis" },
  { number: "02", label: editorial("Capital & Disclosure"), id: "capital-disclosure", legacyIds: ["capital"], analyticsId: "capital_disclosure" },
  { number: "03", label: editorial("Markets & Territory"), id: "markets-territory", legacyIds: ["territory"], analyticsId: "markets_territory" },
  { number: "04", label: editorial("Mutual Operator Fit"), id: "mutual-operator-fit", legacyIds: ["qualifications"], analyticsId: "mutual_operator_fit" },
  { number: "05", label: editorial("Operator Support"), id: "operator-support", legacyIds: ["support-runway"], analyticsId: "operator_support" },
  { number: "06", label: editorial("Next Step"), id: "next-step", legacyIds: [], analyticsId: "next_step" },
] as const;

export type OpportunityDossierChapterId = (typeof OPPORTUNITY_DOSSIER_CHAPTERS)[number]["id"];

export const getOpportunityDossierChapter = (id: OpportunityDossierChapterId) => {
  const chapter = OPPORTUNITY_DOSSIER_CHAPTERS.find((item) => item.id === id);
  if (!chapter) throw new Error(`Missing opportunity dossier chapter: ${id}`);
  return chapter;
};

/** Page copy only. Monetary values remain in financial-data; territory status remains in public-jurisdiction-status. */
export const OPPORTUNITY_DOSSIER_CONTENT = {
  metadata: {
    title: "Budda's Hawaiian Franchise Opportunity | Investment & Diligence",
    description: "Review Budda's Hawaiian franchise opportunity: capital readiness, markets, operator fit, support, and mutual evaluation diligence.",
  },
  hero: {
    // Context and orientation are ordinary editorial copy; the positioning claim remains separately governed.
    eyebrow: editorial("Operator Investment Dossier"),
    title: reviewed("Invest in a Category-Defining Hawaiian Bakery & Grill.", "BUSINESS_COMMITMENT", "Brand & Franchise Development", "Any change to category positioning or substantiating source"),
    description: editorial("Understand the opportunity, review the information presented, and decide whether a mutual evaluation merits further discussion."),
  },
  opportunityIndex: {
    items: OPPORTUNITY_DOSSIER_CHAPTERS,
  },
  thesis: {
    title: editorial("What an operator is evaluating in the Budda's model"),
    description: editorial("Before reviewing capital requirements, an operator can examine the product, service, production, and hospitality systems that define the concept."),
    operatorLensLabel: editorial("Operator lens"),
    items: [
      { label: editorial("In-house bakery system"), title: reviewed("Budda Roll production in an in-house steam-deck bakery.", "BUSINESS_COMMITMENT", "Operations", "Any product or production-system change"), description: reviewed("The format combines Budda Roll bakery production with grill service.", "BUSINESS_COMMITMENT", "Operations", "Any product-format or production-system change"), operatorLens: editorial("What production and service coordination would this bakery-and-grill format require in your operation?") },
      { label: editorial("Daypart format"), title: reviewed("Breakfast, lunch, and dinner menu occasions.", "BUSINESS_COMMITMENT", "Operations", "Any menu or service-format change"), description: reviewed("The menu and service architecture includes breakfast roll sandwiches, lunch plate combinations, and dinner family-feast takeout packages.", "BUSINESS_COMMITMENT", "Operations", "Any menu or service-format change"), operatorLens: editorial("What menu breadth and service planning would these dayparts require in your operation?") },
      { label: editorial("Production discipline"), title: reviewed("Proofing, steam-baking, and defined production steps.", "BUSINESS_COMMITMENT", "Operations", "Any production-protocol change"), description: reviewed("The production model includes pre-portioned frozen dough bases and defined baking steps for team execution.", "BUSINESS_COMMITMENT", "Operations", "Any production-protocol change"), operatorLens: editorial("What process control and team execution would these production steps require in your operation?") },
      { label: editorial("Hospitality standards"), title: reviewed("Team leadership, guest-service standards, and product stewardship.", "BUSINESS_COMMITMENT", "Franchise Development", "Any standards or stewardship expectation change"), description: reviewed("The owner role includes leading teams, upholding product standards, and carrying community responsibilities.", "BUSINESS_COMMITMENT", "Franchise Development", "Any standards or stewardship expectation change"), operatorLens: editorial("What team leadership, guest-service standards, product stewardship, and community responsibility would this role require?") },
    ],
  },
  capital: {
    title: editorial("Capital Readiness & Financial Disclosure"),
    description: editorial("Review what financial information is currently available for diligence on this page."),
  },
  fit: {
    title: editorial("Mutual Operator Fit"),
    description: editorial("Budda's reviews verified requirements and operating qualities. In parallel, a prospective operator should examine the concept, market, capital context, support runway, and partnership expectations."),
    operatingRequirement: reviewed("Minimum 3+ years of restaurant management, multi-unit leadership, or food-service franchise ownership with a proven record of team development.", "BUSINESS_COMMITMENT", "Franchise Development", "Any candidate requirement change"),
  },
  support: {
    title: editorial("How support and operator responsibility work across the runway"),
    description: editorial("The support model follows real operating phases. Budda's provides defined systems and resources; the operator remains responsible for local decisions, leadership, and execution."),
    phases: [
      { number: "01", phase: editorial("Development"), title: editorial("Real Estate & Site Selection"), support: reviewed("Demographic scoring, drive-thru optimization, footprint sizing (1,800–2,600 sq ft), lease negotiation advisory, and architectural space planning.", "BUSINESS_COMMITMENT", "Franchise Development", "Any real-estate support change"), operatorResponsibility: editorial("Evaluate whether the proposed market, site, lease, and local conditions fit the operator's business judgment.") },
      { number: "02", phase: editorial("Readiness"), title: editorial("Training & Supply Chain"), support: reviewed("A 3-week training academy covering dough proofing, steam baking, line speed, inventory controls, and Hawaiian hospitality standards, alongside access to master-batch frozen dough bases, signature glazes, and custom packaging.", "BUSINESS_COMMITMENT", "Operations", "Any training or supply-chain support change"), operatorResponsibility: editorial("Lead training participation, build the operating team, and apply the standards and supply systems in day-to-day execution.") },
      { number: "03", phase: editorial("Opening"), title: editorial("Grand Opening & Local Marketing"), support: reviewed("Targeted digital campaigns, VIP roll tasting events, local PR orchestration, and local store marketing (LSM) toolkits for the launch period.", "BUSINESS_COMMITMENT", "Marketing & Operations", "Any launch-support change"), operatorResponsibility: editorial("Lead local opening execution, team readiness, and the market-facing activity required for the restaurant's launch.") },
      { number: "04", phase: editorial("Ongoing local operations"), title: editorial("Local Marketing Toolkit"), support: reviewed("Ongoing local store marketing (LSM) toolkits remain part of the stated support architecture after the opening period.", "BUSINESS_COMMITMENT", "Marketing & Operations", "Any ongoing-support change"), operatorResponsibility: editorial("Continue leading the restaurant, its team, and local hospitality standards while deciding how to apply available operating resources.") },
    ],
  },
  finalDecision: {
    title: editorial("Decide whether a mutual evaluation is the right next conversation."),
    description: reviewed("Request franchise information when you are ready to discuss your operating background, target market, and capital readiness. We review inquiries within 2 business days.", "BUSINESS_COMMITMENT", "Franchise Development", "Any response-SLA or inquiry-process change"),
    boundary: reviewed("This begins an inquiry—not an application, territory reservation, franchise offer, or approval decision.", "LEGAL_DISCLOSURE", "Franchise Legal & Development", "Any offering, territory, or inquiry-process change"),
  },
  financialDisclosure: {
    guide: editorial("Financial information on this page"),
    qualificationExplanation: FINANCIAL_QUALIFICATION_DISTINCTION,
    publicInformation: editorial("This page does not currently publish estimated initial investment, franchise fee, royalty, or other cost details."),
    fddInformation: editorial("FDD delivery timing and contents are not stated on this page."),
    rows: [
      { label: editorial("Candidate financial qualification"), description: FINANCIAL_QUALIFICATION_DISTINCTION, reference: editorial("Candidate qualification criteria"), status: editorial("Values not published in this placement") },
      { label: editorial("Public investment disclosure"), description: editorial("This page does not currently publish estimated initial investment, franchise fee, royalty, or other cost details."), reference: editorial("Public financial disclosure"), status: editorial("Not published on this page") },
      { label: editorial("FDD disclosure"), description: editorial("FDD delivery timing and contents are not stated on this page."), reference: editorial("Franchise Disclosure Document"), status: editorial("Timing not stated on this page") },
    ],
  },
} as const;

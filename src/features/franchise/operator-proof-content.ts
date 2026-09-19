export type OperatorProofPillar = {
  id: "product" | "production" | "operator" | "hospitality" | "growth";
  index: "01" | "02" | "03" | "04" | "05";
  category: string;
  headline: string;
  body: string;
  evidenceItems: readonly {
    type: "signature-product" | "operating-behavior";
    label: string;
    value: string;
  }[];
  media?: {
    src: string;
    alt: string;
    objectPosition: string;
    reviewStatus: "REQUIRES_BRAND_REVIEW";
  };
  href?: string;
  linkLabel?: string;
  governance: {
    sourceOwner: "Brand" | "Operations" | "Franchise Development";
    reviewStatus: "REQUIRES_OWNER_REVIEW";
    evidenceStatus: "REQUIRES_SOURCE_VALIDATION";
    sourceReference: null;
    reviewedAt: null;
  };
};

const pendingReview = (
  sourceOwner: OperatorProofPillar["governance"]["sourceOwner"],
): OperatorProofPillar["governance"] => ({
  sourceOwner,
  reviewStatus: "REQUIRES_OWNER_REVIEW",
  evidenceStatus: "REQUIRES_SOURCE_VALIDATION",
  sourceReference: null,
  reviewedAt: null,
});

/**
 * One content source for the responsive operator-advantage section. Empty
 * evidence lists intentionally represent proof that still needs an approved source.
 */
export const OPERATOR_PROOF_CONTENT = {
  section: {
    eyebrow: "The Budda's Advantage",
    heading: "What makes the Budda's model different.",
    introduction:
      "A distinctive product is only the beginning. The opportunity depends on making the food, experience and operating standard clear enough to repeat.",
  },
  pillars: [
    {
      id: "product",
      index: "01",
      category: "Product",
      headline: "The Budda Roll creates distinction.",
      body: "The Budda Roll gives the menu a signature bakery-led identity.",
      evidenceItems: [
        {
          type: "signature-product",
          label: "Named signature product",
          value: "The Budda Roll anchors the bakery-led menu identity.",
        },
      ],
      media: {
        src: "/images/franchise-hero-signature-roll.png",
        alt: "Classic Budda Roll with a golden-brown crown and fine fibrous crumb.",
        objectPosition: "50% 52%",
        reviewStatus: "REQUIRES_BRAND_REVIEW",
      },
      governance: pendingReview("Brand"),
    },
    {
      id: "production",
      index: "02",
      category: "Production system",
      headline: "Preparation standards support repeatability.",
      body: "Clear preparation expectations help protect consistency from batch to batch.",
      evidenceItems: [],
      governance: pendingReview("Operations"),
    },
    {
      id: "operator",
      index: "03",
      category: "Operator support system",
      headline: "Clear standards make execution teachable.",
      body: "Training, ordering, and clear standards support consistent execution.",
      evidenceItems: [],
      governance: pendingReview("Operations"),
    },
    {
      id: "hospitality",
      index: "04",
      category: "Hospitality standard",
      headline: "Hospitality is designed into the standard.",
      body: "Clear service behaviors make generous hospitality teachable.",
      evidenceItems: [],
      governance: pendingReview("Franchise Development"),
    },
    {
      id: "growth",
      index: "05",
      category: "Growth gate",
      headline: "Repeatability comes before expansion.",
      body: "Expansion follows readiness across product, people, operations, supply, and demand.",
      evidenceItems: [
        {
          type: "operating-behavior",
          label: "Readiness condition",
          value: "We grow when product, people, operations, supply, and demand are ready.",
        },
      ],
      governance: pendingReview("Franchise Development"),
    },
  ] satisfies readonly OperatorProofPillar[],
  outcomes: {
    result: {
      label: "The result",
      headline: "Consistent guest experience.",
      body: "A clearer operating standard helps protect the experience from first visit to repeat visit.",
    },
    opportunity: {
      label: "The opportunity",
      headline: "More tables. Same standard.",
      body: "Growth follows readiness across product, people, operations, supply, and demand.",
    },
  },
  opportunity: {
    href: "/franchise/process",
    label: "See How It Works",
    microcopy: "Review the franchise evaluation and development process.",
  },
} as const;

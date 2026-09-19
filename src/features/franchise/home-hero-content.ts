type CurrentFootprint = {
  locations: readonly string[];
  region: string;
  status: string;
};

const PRIMARY_HERO_COPY = {
  eyebrow: "Franchise Opportunity",
  headline: "Build the Next Budda's.",
  description:
    "A Hawaiian Bakery & Grill built around our signature Budda Roll for experienced restaurant operators.",
} as const;

/**
 * Public marketing data. Do not derive this from corporate preview locations,
 * which are fictional and deliberately not a public source of truth.
 */
export const formatCurrentFootprint = ({ locations, region, status }: CurrentFootprint) =>
  `${locations.length} ${region} ${locations.length === 1 ? "restaurant" : "restaurants"} ${status}`;

export const FRANCHISE_HOME_HERO_CONTENT = {
  desktop: {
    ...PRIMARY_HERO_COPY,
  },
  mobile: {
    ...PRIMARY_HERO_COPY,
    opportunityLabel: "Explore the Opportunity",
    inquiryLabel: "Start the 3-Step Inquiry",
  },
  media: {
    desktopImage: "/images/franchise-hero-signature-roll.png",
    mobileImage: "/images/franchise-hero-signature-roll.png",
    imageAlt: "Signature Budda Roll on a plate in a warm bakery setting",
  },
  currentFootprint: {
    locations: ["Pleasant Grove", "Salt Lake City"],
    region: "Utah",
    status: "operating today",
  },
  heroProofRail: [
    { label: "Current footprint", value: "2 Utah restaurants operating today." },
    { label: "Product", value: "Signature product." },
    { label: "Operations", value: "Defined operating standards." },
  ],
  opportunity: {
    href: "/franchise/the-opportunity",
    label: "Explore the Opportunity",
  },
  inquiry: {
    href: "/franchise/contact?source_page=homepage_hero",
    label: "Start a Franchise Inquiry",
    detail: "3-step initial inquiry",
  },
} as const;

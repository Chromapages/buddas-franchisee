export interface Pillar {
  id: string;
  number: string;
  shortTitle: string;
  tagline: string;
  headline: string;
  narrative: string;
  quote: string;
  quoteAuthor: string;
  metrics: Array<{ value: string; label: string }>;
  badges: string[];
  imageSrc: string;
  imageAlt: string;
}

export const WHY_BUDDAS_PILLARS: Pillar[] = [
  {
    id: "proprietary-icon",
    number: "01",
    shortTitle: "The Proprietary Icon",
    tagline: "The Roll That Started Everything",
    headline: "A 100% Proprietary Bakery Moat No Competitor Can Replicate",
    narrative:
      "Unlike standard fast-casual Hawaiian concepts reliant on commercial wholesale buns, Budda's scratch-baked butter roll is an iconic destination product. It transforms everyday lunch and dinner into high-frequency craveable dining, commands customer loyalty, and unlocks multi-pack retail take-home box sales.",
    quote:
      "The Budda Roll isn't an afterthought or a side item—it's our primary customer acquisition hook and brand signature.",
    quoteAuthor: "Harrelle Budda, Founding Family",
    metrics: [
      { value: "72%", label: "Roll Attach on Entrées" },
      { value: "+$14", label: "Retail 6-Pack/12-Pack Cart Lift" },
      { value: "100%", label: "Proprietary Bakery Recipe" },
    ],
    badges: ["Proprietary Recipe", "Destination Anchor", "Retail Revenue"],
    imageSrc: "/images/buddas-hero.png",
    imageAlt: "Freshly baked golden Budda Rolls with signature sweet glaze",
  },
  {
    id: "daypart-engine",
    number: "02",
    shortTitle: "Three-Daypart Revenue Engine",
    tagline: "All-Day Kitchen Utility",
    headline: "Eliminating Afternoon Dead Zones with 3 High-Margin Dayparts",
    narrative:
      "Conventional fast-casual restaurants struggle with idle labor and underutilized kitchen capital outside a 2-hour lunch spike. Budda's captures morning breakfast commuters, rapid lunch traffic, and high-ticket evening family feasts with one continuous, balanced kitchen engine.",
    quote:
      "By capturing breakfast bakery traffic and evening retail feasts, our kitchen assets work three times harder than standard QSR.",
    quoteAuthor: "Culinary & Operations Team",
    metrics: [
      { value: "7 AM – 9 PM", label: "All-Day Kitchen Utility" },
      { value: "3 Peaks", label: "Distinct Revenue Windows" },
      { value: "$28+", label: "Avg Evening Dinner Ticket" },
    ],
    badges: ["Breakfast & Bakery", "High-Speed Lunch", "Dinner & Retail Feasts"],
    imageSrc: "/images/buddas-hero.png",
    imageAlt: "Budda's three daypart meal spread across morning, noon, and dinner",
  },
  {
    id: "speed-simplicity",
    number: "03",
    shortTitle: "High-Speed Simple Assembly",
    tagline: "Sub-4-Minute Speed of Service",
    headline: "Disciplined Grilling and Assembly Without Master Culinary Staff",
    narrative:
      "Our kitchen layout eliminates complex sauté stations. Through batch bakery execution, char-broiled proteins, and streamlined assembly lines, cross-trained team members deliver consistent quality in under 4 minutes with low product waste and optimized labor ratios.",
    quote:
      "We engineered kitchen flow for maximum throughput and consistency, ensuring multi-unit operators scale effortlessly.",
    quoteAuthor: "Franchise Operations Team",
    metrics: [
      { value: "< 4 Min", label: "Average Ticket-to-Handoff" },
      { value: "1 Kitchen", label: "Compact Operational Footprint" },
      { value: "Zero", label: "Master Chef Dependency" },
    ],
    badges: ["Fast Throughput", "Low Food Waste", "Simplified Training"],
    imageSrc: "/images/buddas-hero.png",
    imageAlt: "Streamlined Hawaiian grill plate assembly line",
  },
  {
    id: "generosity-baked-in",
    number: "04",
    shortTitle: "Generosity Baked In",
    tagline: "Local Soul × Scalable Discipline",
    headline: "Authentic Island Comfort Backed by Multi-Unit Operating Rigor",
    narrative:
      "Rooted in La'ie, Hawai'i, Budda's balances generous portions, true aloha hospitality, and community warmth with rigorous multi-unit business discipline across both island and suburban mainland markets.",
    quote:
      "Hospitality isn't just how we greet guests—it's the foundation of our multi-unit repeat customer economics.",
    quoteAuthor: "Brand & Culture Leadership",
    metrics: [
      { value: "3 Markets", label: "La'ie, Honolulu, Salt Lake City" },
      { value: "High Repeat", label: "Deep Community Loyalty" },
      { value: "Proven Fit", label: "Island & Mainland Viability" },
    ],
    badges: ["La'ie Origin", "Mainland Proven", "True Aloha Spirit"],
    imageSrc: "/images/buddas-hero.png",
    imageAlt: "Budda's generous Hawaiian family feast table",
  },
];

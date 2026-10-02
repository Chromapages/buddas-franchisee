export type FooterNavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export type FooterNavSection = {
  id: "explore" | "operators" | "company" | "governance";
  title: string;
  items: readonly FooterNavItem[];
};

/**
 * Public footer content: routes, contact channels, and legal copy live here so
 * changes are reviewed once and applied consistently on every footer breakpoint.
 */
export const FOOTER_CONTENT = {
  email: "buddasbakery@gmail.com",
  phone: "(801) 701-0617",
  phoneHref: "tel:+18017010617",
  copyright: "© 2026 Budda's Franchising LLC. All rights reserved.",
  legalDisclaimer:
    "This website is informational and does not constitute an offer to sell or the solicitation of an offer to buy a franchise in any registration state where registration or exemption is required.",
  inquiryDisclaimer:
    "This begins an inquiry—not an application, territory reservation, franchise offer, or approval decision.",
} as const;

export const FOOTER_NAVIGATION: readonly FooterNavSection[] = [
  {
    id: "explore",
    title: "Explore",
    items: [
      { label: "Why Budda's", href: "/franchise/why-buddas" },
      { label: "The Opportunity", href: "/franchise/the-opportunity" },
      { label: "See the Process", href: "/franchise/process" },
      { label: "FAQ", href: "/franchise/faq" },
    ],
  },
  {
    id: "operators",
    title: "For operators",
    items: [
      { label: "Operator Criteria", href: "/franchise/the-opportunity#mutual-operator-fit" },
      { label: "Investment Overview", href: "/franchise/the-opportunity#capital-disclosure" },
      { label: "Territory & Market Growth", href: "/franchise/the-opportunity#markets-territory" },
      { label: "Request Franchise Information", href: "/franchise/contact" },
      { label: "Operator Portal Login", href: "/franchise/login" },
    ],
  },
  {
    id: "company",
    title: "Company",
    items: [
      { label: "Our Story & Heritage", href: "/franchise/about" },
      { label: "Restaurant & Menu", href: "https://buddasbakerygrill.com", external: true },
    ],
  },
  {
    id: "governance",
    title: "Governance",
    items: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
] as const;

export const FOOTER_LEGAL_LINKS = FOOTER_NAVIGATION.find(
  (section) => section.id === "governance",
)!.items;

export type FooterNavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export type FooterNavSection = {
  id: "concept" | "development" | "ecosystem" | "governance";
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
} as const;

export const FOOTER_NAVIGATION: readonly FooterNavSection[] = [
  {
    id: "concept",
    title: "Concept & Model",
    items: [
      { label: "Why Budda's", href: "/franchise/why-buddas" },
      { label: "The Opportunity", href: "/franchise/the-opportunity" },
      { label: "Our Story & Heritage", href: "/franchise/about" },
      { label: "4-Step Process", href: "/franchise/process" },
      { label: "FAQ & Diligence", href: "/franchise/faq" },
    ],
  },
  {
    id: "development",
    title: "Franchise Development",
    items: [
      { label: "Operator Criteria", href: "/franchise/the-opportunity#qualifications" },
      { label: "Investment Overview", href: "/franchise/the-opportunity#financials" },
      { label: "Territory & Market Growth", href: "/franchise/the-opportunity#territory" },
      { label: "Start Franchise Inquiry", href: "/franchise/contact" },
    ],
  },
  {
    id: "ecosystem",
    title: "Resources & Portals",
    items: [
      { label: "Consumer Restaurant Site", href: "https://buddasbakerygrill.com", external: true },
      { label: "Operator Portal Login", href: "/franchise/login" },
      { label: "Franchise Opportunity Guide", href: "/franchise/the-opportunity" },
      { label: "How Franchising Works", href: "/franchise/process" },
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

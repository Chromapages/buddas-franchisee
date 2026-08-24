export type NavItem = {
  href: string;
  label: string;
  external?: boolean;
};

export const primaryNavItems: NavItem[] = [
  { href: "/franchise/why-buddas", label: "Why Budda's" },
  { href: "/franchise/the-opportunity", label: "The Opportunity" },
  { href: "/franchise/process", label: "How It Works" },
  { href: "/franchise/faq", label: "FAQ" },
];

export const utilityNavItems: NavItem[] = [
  {
    href: "https://buddasbakerygrill.com",
    label: "Restaurant & Menu",
    external: true,
  },
  {
    href: "/franchise/login",
    label: "Operator login",
    external: false,
  },
];

// Backwards-compatible alias for any legacy consumers
export const publicNavItems: NavItem[] = primaryNavItems;

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Lock, Mail, Phone, ExternalLink, ChevronDown } from "lucide-react";

type FooterNavItem = {
  label: string;
  href: string;
  external?: boolean;
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
};

type FooterNavSection = {
  id: string;
  title: string;
  items: FooterNavItem[];
};

const navSections: FooterNavSection[] = [
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
    title: "Ecosystem & Operator",
    items: [
      { label: "Consumer Restaurant Site", href: "https://buddasbakerygrill.com", external: true },
      { label: "Operator Portal Login", href: "/franchise/login", icon: Lock },
      { label: "Franchisee Supply Orders", href: "/portal/supplies", icon: Lock },
      { label: "Support & Operations", href: "/portal/support", icon: Lock },
    ],
  },
  {
    id: "governance",
    title: "Governance",
    items: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Accessibility (WCAG 2.2)", href: "/accessibility" },
    ],
  },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Accessibility (WCAG 2.2)", href: "/accessibility" },
];

export const Footer = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const handleToggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  return (
    <footer aria-label="Site Footer" className="bg-bds-teal-dark text-bds-cream border-t border-white/10 pt-10 sm:pt-14 pb-10 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* =========================================================================
            DESKTOP VIEW: 3-TIER HIERARCHY (hidden on mobile, visible on lg)
            Tier 1: Brand statement & primary support/contact action first
            Tier 2: Grouped navigation sitemap second
            Tier 3: Legal / secondary links & regulatory disclosures last
           ========================================================================= */}
        <div className="hidden lg:block space-y-10">
          
          {/* TIER 1 (FIRST): Brand Statement & Primary Action / Support Suite */}
          <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 shadow-sm flex items-center justify-between gap-10">
            {/* Left: Brand Identity & Positioning Statement */}
            <div className="max-w-xl space-y-3 text-left">
              <Link
                href="/franchise"
                aria-label="Budda's Franchising Home"
                className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-gold rounded-lg p-0.5"
              >
                <Image
                  src="/images/Logo.svg"
                  alt="Budda's Hawaiian Bakery & Grill"
                  width={190}
                  height={38}
                  className="h-8 w-auto object-contain brightness-0 invert"
                />
              </Link>

              <p className="text-sm text-bds-cream/80 leading-relaxed">
                Home of the iconic Budda Roll. A modern Hawaiian bakery &amp; grill franchise opportunity blending warm island generosity with scalable, all-day operating utility.
              </p>

              {/* Heritage & Operating Proof Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bds-gold/10 border border-bds-gold/20 text-xs font-semibold text-bds-gold">
                <span>Born in La&apos;ie, Oahu &bull; 2 Operating Utah Locations</span>
              </div>
            </div>

            {/* Right: Primary Conversion Action & Direct Support Suite */}
            <div className="shrink-0 space-y-3.5 text-right flex flex-col items-end">
              <Link
                href="/franchise/contact"
                className="w-full min-h-[48px] flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider text-bds-teal-dark bg-bds-gold hover:bg-bds-teal hover:text-white px-6 py-3 rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.99]"
              >
                <span>Start a Franchise Inquiry</span>
                <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </Link>

              <div className="flex items-center gap-5 text-xs text-bds-cream/80 pt-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-bds-gold shrink-0" aria-hidden="true" />
                  <a
                    href="mailto:buddasbakery@gmail.com"
                    className="hover:text-bds-gold underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-gold rounded"
                  >
                    buddasbakery@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-bds-gold shrink-0" aria-hidden="true" />
                  <a
                    href="tel:+18017010617"
                    className="hover:text-bds-gold underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-gold rounded"
                  >
                    (801) 701-0617
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* TIER 2 (SECOND): Grouped Sitemap Navigation */}
          <div className="grid grid-cols-3 gap-10 py-6 border-y border-white/10">
            {navSections.filter((s) => s.id !== "governance").map((section) => (
              <nav key={section.id} aria-label={section.title} className="space-y-4 text-left">
                <h4 className="text-xs font-black uppercase tracking-widest text-bds-gold pb-2 border-b border-white/10">
                  {section.title}
                </h4>
                <ul role="list" className="space-y-3 pt-1 text-sm text-bds-cream/80">
                  {section.items.map((item) => {
                    const IconComponent = item.icon;
                    if (item.external) {
                      return (
                        <li key={item.href}>
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 py-0.5 text-bds-cream/90 hover:text-bds-gold hover:translate-x-0.5 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-gold rounded"
                          >
                            <span>{item.label}</span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-60 shrink-0" aria-hidden="true" />
                          </a>
                        </li>
                      );
                    }

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="inline-flex items-center gap-1.5 py-0.5 hover:text-bds-gold hover:translate-x-0.5 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-gold rounded"
                        >
                          {IconComponent ? <IconComponent className="w-3.5 h-3.5 opacity-60 shrink-0" aria-hidden="true" /> : null}
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ))}
          </div>

          {/* TIER 3 (LAST): Legal / Secondary Links & Regulatory Disclosures */}
          <div className="space-y-4 pt-2 text-xs sm:text-sm text-bds-cream/80">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Horizontal Legal Links Row */}
              <nav aria-label="Legal and Compliance" className="flex items-center gap-6">
                {legalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hover:text-bds-gold underline-offset-2 hover:underline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-gold rounded"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Copyright Notice */}
              <p className="font-medium">
                &copy; {new Date().getFullYear()} Budda&apos;s Franchising LLC. All rights reserved.
              </p>
            </div>

            {/* Regulatory Disclaimer */}
            <p className="max-w-4xl text-left leading-relaxed text-xs text-bds-cream/70 pt-1">
              This website is informational and does not constitute an offer to sell or the solicitation of an offer to buy a franchise in any registration state where registration or exemption is required.
            </p>
          </div>

        </div>

        {/* =========================================================================
            MOBILE VIEW: ACCORDION SITEMAP (hidden on lg, visible on mobile)
           ========================================================================= */}
        <div className="lg:hidden space-y-6 pb-6">
          
          {/* Mobile Zone 1: Brand & Conversion Header */}
          <div className="space-y-3.5 text-left">
            <Link
              href="/franchise"
              aria-label="Budda's Franchising Home"
              className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-gold rounded-lg p-0.5"
            >
              <Image
                src="/images/Logo.svg"
                alt="Budda's Hawaiian Bakery & Grill"
                width={180}
                height={36}
                className="h-7 w-auto object-contain brightness-0 invert"
              />
            </Link>

            <p className="text-sm text-bds-cream/85 leading-relaxed">
              Home of the iconic Budda Roll. A modern Hawaiian bakery &amp; grill franchise opportunity blending warm island generosity with scalable, all-day operating utility.
            </p>

            {/* Full-Width Generous Primary CTA */}
            <div className="pt-1">
              <Link
                href="/franchise/contact"
                className="w-full min-h-[48px] flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider text-bds-teal-dark bg-bds-gold hover:bg-bds-teal hover:text-white px-5 py-3 rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.99]"
              >
                <span>Start a Franchise Inquiry</span>
                <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Mobile Zone 2: Direct Contact Card (Divided) */}
          <div className="border-t border-white/10 pt-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-bds-gold">
              <span>Direct Inquiries</span>
              <span className="text-bds-cream/50 normal-case font-normal">La&apos;ie, Oahu &bull; Utah</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href="mailto:buddasbakery@gmail.com"
                className="min-h-[48px] flex items-center gap-3 py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-sm text-bds-cream/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-gold"
              >
                <div className="w-8 h-8 rounded-lg bg-bds-gold/15 flex items-center justify-center text-bds-gold shrink-0">
                  <Mail className="w-4 h-4" aria-hidden="true" />
                </div>
                <span className="truncate text-xs sm:text-sm font-medium">buddasbakery@gmail.com</span>
              </a>

              <a
                href="tel:+18017010617"
                className="min-h-[48px] flex items-center gap-3 py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-sm text-bds-cream/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-gold"
              >
                <div className="w-8 h-8 rounded-lg bg-bds-gold/15 flex items-center justify-center text-bds-gold shrink-0">
                  <Phone className="w-4 h-4" aria-hidden="true" />
                </div>
                <span className="truncate text-xs sm:text-sm font-medium">(801) 701-0617</span>
              </a>
            </div>
          </div>

          {/* Mobile Zone 3: Navigation Accordion List (Divided with 8px group separation) */}
          <div className="border-t border-white/10 pt-3 space-y-2">
            {navSections.map((section) => {
              const isOpen = Boolean(openSections[section.id]);
              const headerId = `footer-accordion-header-${section.id}`;
              const panelId = `footer-accordion-panel-${section.id}`;

              return (
                <div key={section.id} className="rounded-xl overflow-hidden bg-white/[0.02] border border-white/5">
                  <button
                    type="button"
                    id={headerId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => handleToggleSection(section.id)}
                    className="w-full min-h-[48px] flex items-center justify-between py-3 px-3.5 text-left font-bold text-sm text-bds-gold hover:text-white hover:bg-white/5 active:bg-white/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-gold"
                  >
                    <span className="uppercase tracking-wider text-xs sm:text-sm font-black">{section.title}</span>
                    <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-bds-gold shrink-0">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ease-out ${
                          isOpen ? "rotate-180 text-white" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </span>
                  </button>

                  {isOpen ? (
                    <nav
                      id={panelId}
                      role="region"
                      aria-labelledby={headerId}
                      className="pt-1 pb-3 px-2 border-t border-white/5 animate-in fade-in-50 duration-150"
                    >
                      <ul role="list" className="space-y-2">
                        {section.items.map((item) => {
                          const IconComponent = item.icon;
                          if (item.external) {
                            return (
                              <li key={item.href}>
                                <a
                                  href={item.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="min-h-[44px] w-full flex items-center justify-between py-2.5 px-3 text-sm text-bds-cream/90 hover:text-bds-gold hover:bg-white/5 active:bg-white/10 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-gold"
                                >
                                  <span>{item.label}</span>
                                  <ExternalLink className="w-3.5 h-3.5 opacity-60 shrink-0" aria-hidden="true" />
                                </a>
                              </li>
                            );
                          }

                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className="min-h-[44px] w-full flex items-center gap-2 py-2.5 px-3 text-sm text-bds-cream/85 hover:text-bds-gold hover:bg-white/5 active:bg-white/10 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bds-gold"
                              >
                                {IconComponent ? <IconComponent className="w-3.5 h-3.5 opacity-60 shrink-0" aria-hidden="true" /> : null}
                                <span>{item.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </nav>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Mobile Zone 4: Regulatory Subfooter */}
          <div className="pt-6 border-t border-white/10 flex flex-col items-center justify-between gap-4 text-xs sm:text-sm text-bds-cream/80">
            <p className="font-medium text-center">
              &copy; {new Date().getFullYear()} Budda&apos;s Franchising LLC. All rights reserved.
            </p>
            <p className="max-w-2xl text-center leading-relaxed text-xs sm:text-sm text-bds-cream/75">
              This website is informational and does not constitute an offer to sell or the solicitation of an offer to buy a franchise in any registration state where registration or exemption is required.
            </p>
          </div>

        </div>

      </div>
    </footer>
  );
};

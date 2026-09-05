"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ExternalLink, Mail, Phone } from "lucide-react";
import {
  FOOTER_CONTENT,
  FOOTER_LEGAL_LINKS,
  FOOTER_NAVIGATION,
  type FooterNavItem,
  type FooterNavSection,
} from "@/src/features/footer/footer-content";
import { trackFunnelEvent } from "@/src/lib/analytics";

const primaryFooterNavigation = FOOTER_NAVIGATION.filter((section) => section.id !== "governance");

type FooterLinkListProps = {
  items: readonly FooterNavItem[];
  group: string;
  pagePath: string;
  mobile?: boolean;
};

const FooterLinkList = ({ items, group, pagePath, mobile = false }: FooterLinkListProps) => (
  <ul role="list" className={mobile ? "space-y-1 pb-3 pt-1" : "space-y-1"}>
    {items.map((item) => {
      const className = mobile
        ? "flex min-h-11 items-center gap-2 border-b border-bds-teal-dark/10 px-1 font-body text-[15px] leading-6 text-bds-text-body last:border-b-0 hover:text-bds-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        : "group inline-flex min-h-10 items-center gap-2 font-body text-[15px] leading-6 text-bds-text-body transition-colors duration-150 hover:text-bds-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white";
      const onClick = () => trackFunnelEvent("footer_nav_link_click", {
        page_path: pagePath,
        footer_nav_group: group,
        footer_destination: item.href,
      });

      if (item.external) {
        return (
          <li key={item.href}>
            <a href={item.href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={className}>
              <span>{item.label}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-75" aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        );
      }

      return <li key={item.href}><Link href={item.href} onClick={onClick} className={className}>{item.label}</Link></li>;
    })}
  </ul>
);

const FooterColumnHeading = ({ id, children }: { id: string; children: string }) => (
  <h2 id={id} className="font-heading text-xs font-bold uppercase tracking-[0.12em] text-bds-text-heading">
    {children}
  </h2>
);

const FooterContact = ({ pagePath }: { pagePath: string }) => (
  <section aria-labelledby="footer-contact-heading">
    <FooterColumnHeading id="footer-contact-heading">Direct Contact</FooterColumnHeading>
    <div className="mt-3 space-y-1">
      <a href={`mailto:${FOOTER_CONTENT.email}`} onClick={() => trackFunnelEvent("footer_email_click", { page_path: pagePath, footer_destination: FOOTER_CONTENT.email })} className="inline-flex min-h-11 items-center gap-2 font-body text-[15px] leading-6 text-bds-text-body transition-colors duration-150 hover:text-bds-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white">
        <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{FOOTER_CONTENT.email}</span>
      </a>
      <a href={FOOTER_CONTENT.phoneHref} onClick={() => trackFunnelEvent("footer_phone_click", { page_path: pagePath, footer_destination: FOOTER_CONTENT.phoneHref })} className="inline-flex min-h-11 items-center gap-2 font-body text-[15px] leading-6 text-bds-text-body transition-colors duration-150 hover:text-bds-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white">
        <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{FOOTER_CONTENT.phone}</span>
      </a>
    </div>
  </section>
);

const FooterDesktopNavGroup = ({ section, pagePath }: { section: FooterNavSection; pagePath: string }) => {
  const headingId = `footer-${section.id}-heading`;

  return (
    <nav aria-labelledby={headingId}>
      <FooterColumnHeading id={headingId}>{section.title}</FooterColumnHeading>
      <div className="mt-3"><FooterLinkList items={section.items} group={section.id} pagePath={pagePath} /></div>
    </nav>
  );
};

const FooterMobileNavGroup = ({ section, pagePath }: { section: FooterNavSection; pagePath: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const headerId = `footer-accordion-header-${section.id}`;
  const panelId = `footer-accordion-panel-${section.id}`;
  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) trackFunnelEvent("footer_nav_section_open", { page_path: pagePath, footer_nav_group: section.id });
  };

  return (
    <section className="border-b border-bds-teal-dark/15">
      <h2>
        <button type="button" id={headerId} aria-expanded={isOpen} aria-controls={panelId} onClick={toggle} className="flex min-h-14 w-full items-center justify-between gap-4 text-left font-heading text-xs font-bold uppercase tracking-[0.12em] text-bds-text-heading hover:text-bds-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white">
          <span>{section.title}</span>
          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-150 motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      </h2>
      {isOpen ? <nav id={panelId} aria-labelledby={headerId}><FooterLinkList items={section.items} group={section.id} pagePath={pagePath} mobile /></nav> : null}
    </section>
  );
};

const FooterNavigation = ({ pagePath }: { pagePath: string }) => (
  <section className="border-b border-bds-teal-dark/15 py-9 lg:py-10">
    <div className="grid gap-x-10 gap-y-8 lg:grid-cols-4">
      <FooterContact pagePath={pagePath} />
      <div className="mt-6 border-t border-bds-teal-dark/15 lg:hidden">{primaryFooterNavigation.map((section) => <FooterMobileNavGroup key={section.id} section={section} pagePath={pagePath} />)}</div>
      <div className="hidden lg:contents">{primaryFooterNavigation.map((section) => <FooterDesktopNavGroup key={section.id} section={section} pagePath={pagePath} />)}</div>
    </div>
  </section>
);

const FooterLegal = ({ pagePath }: { pagePath: string }) => (
  <section className="py-6 lg:py-7">
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-8">
      <nav aria-label="Legal">
        <ul role="list" className="flex flex-wrap gap-x-5 gap-y-1">
          {FOOTER_LEGAL_LINKS.map((item) => <li key={item.href}><Link href={item.href} onClick={() => trackFunnelEvent("footer_legal_link_click", { page_path: pagePath, footer_destination: item.href })} className="inline-flex min-h-9 items-center font-body text-sm font-medium text-bds-text-body underline decoration-bds-teal-dark/35 underline-offset-4 transition-colors duration-150 hover:text-bds-action-primary hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white">{item.label}</Link></li>)}
        </ul>
      </nav>
      <p className="font-body text-sm text-bds-text-body">{FOOTER_CONTENT.copyright}</p>
    </div>
    <p className="mt-4 max-w-[80ch] font-body text-[13px] leading-[1.6] text-bds-text-body">{FOOTER_CONTENT.legalDisclaimer}</p>
  </section>
);

export const Footer = () => {
  const pathname = usePathname();

  if (pathname === "/franchise/login" || pathname === "/franchise/login/reset") return null;

  return (
    <footer className="site-footer border-t border-bds-teal-dark/10 bg-white/95 text-bds-text-body backdrop-blur-md">
      <div className="content-wide">
        <FooterNavigation pagePath={pathname} />
        <FooterLegal pagePath={pathname} />
      </div>
    </footer>
  );
};

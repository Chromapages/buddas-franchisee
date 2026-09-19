"use client";

import { useState } from "react";
import Image from "next/image";
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

type FooterContent = typeof FOOTER_CONTENT & { footerNavigation: readonly FooterNavSection[] };
const fallbackContent: FooterContent = { ...FOOTER_CONTENT, footerNavigation: FOOTER_NAVIGATION };

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

const FooterContact = ({ pagePath, content }: { pagePath: string; content: FooterContent }) => (
  <section aria-labelledby="footer-contact-heading">
    <FooterColumnHeading id="footer-contact-heading">Get in touch</FooterColumnHeading>
    <div className="mt-4 grid grid-cols-2 gap-2 lg:mt-3 lg:block lg:space-y-1">
      <a href={`mailto:${content.email}`} onClick={() => trackFunnelEvent("footer_email_click", { page_path: pagePath, footer_destination: content.email })} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-bds-teal-dark/20 bg-bds-cream/60 px-3 font-body text-sm font-semibold text-bds-text-body transition-colors duration-150 hover:border-bds-action-primary hover:text-bds-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white lg:min-h-11 lg:justify-start lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:text-[15px] lg:font-normal">
        <Mail className="h-4 w-4 shrink-0 text-bds-action-primary lg:text-current" aria-hidden="true" />
        <span className="lg:hidden">Email us</span>
        <span className="hidden lg:inline">{content.email}</span>
      </a>
      <a href={content.phoneHref} onClick={() => trackFunnelEvent("footer_phone_click", { page_path: pagePath, footer_destination: content.phoneHref })} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-bds-teal-dark/20 bg-bds-cream/60 px-3 font-body text-sm font-semibold text-bds-text-body transition-colors duration-150 hover:border-bds-action-primary hover:text-bds-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white lg:min-h-11 lg:justify-start lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:text-[15px] lg:font-normal">
        <Phone className="h-4 w-4 shrink-0 text-bds-action-primary lg:text-current" aria-hidden="true" />
        <span className="lg:hidden">Call us</span>
        <span className="hidden lg:inline">{content.phone}</span>
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

const FooterBrand = () => (
  <section className="hidden lg:flex lg:flex-col lg:justify-center lg:pr-8" aria-label="Budda's Franchising">
    <Link href="/franchise" className="inline-flex w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bds-cream">
      <Image src="/images/Logo.svg" alt="Budda's Franchising" width={310} height={57} className="h-auto w-[260px] object-contain" />
    </Link>
    <span className="mt-8 block h-px w-12 bg-bds-action-primary/70" aria-hidden="true" />
    <p className="mt-6 max-w-[32ch] font-heading text-xs font-bold uppercase leading-6 tracking-[0.2em] text-bds-text-body">
      Franchise opportunities for experienced restaurant operators.
    </p>
  </section>
);

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

const FooterNavigation = ({ pagePath, content }: { pagePath: string; content: FooterContent }) => {
  const primaryFooterNavigation = content.footerNavigation.filter((section) => section.id !== "governance");
  return (
  <section className="pt-5 pb-2 lg:border-b lg:border-bds-teal-dark/25 lg:pt-16 lg:pb-8">
    <div className="grid gap-x-10 gap-y-2 lg:grid-cols-[minmax(12rem,1.15fr)_repeat(3,minmax(0,1fr))_minmax(14rem,1fr)] lg:gap-x-0">
      <FooterBrand />
      <div className="lg:order-last lg:pl-8">
        <FooterContact pagePath={pagePath} content={content} />
        <div className="mt-8 border-t border-bds-teal-dark/25 pt-7">
          <p className="max-w-[24ch] font-heading text-xs font-bold uppercase leading-6 tracking-[0.2em] text-bds-text-heading">Good food brings people together.</p>
          <span className="mt-5 block h-px w-9 bg-bds-action-primary/70" aria-hidden="true" />
        </div>
      </div>
      <div className="mt-2 border-t border-bds-teal-dark/15 lg:hidden">{primaryFooterNavigation.map((section) => <FooterMobileNavGroup key={section.id} section={section} pagePath={pagePath} />)}</div>
      <div className="hidden lg:contents">{primaryFooterNavigation.map((section) => <div className="pl-8" key={section.id}><FooterDesktopNavGroup section={section} pagePath={pagePath} /></div>)}</div>
    </div>
  </section>
  );
};

const FooterLegal = ({ pagePath, content }: { pagePath: string; content: FooterContent }) => {
  const legalLinks = content.footerNavigation.find((section) => section.id === "governance")?.items || FOOTER_LEGAL_LINKS;
  return (
  <section className="pt-3 pb-2 lg:py-7">
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-8">
      <nav aria-label="Legal">
        <ul role="list" className="flex flex-wrap gap-x-5 gap-y-1">
          {legalLinks.map((item) => <li key={item.href}><Link href={item.href} onClick={() => trackFunnelEvent("footer_legal_link_click", { page_path: pagePath, footer_destination: item.href })} className="inline-flex min-h-9 items-center font-body text-sm font-medium text-bds-text-body underline decoration-bds-teal-dark/35 underline-offset-4 transition-colors duration-150 hover:text-bds-action-primary hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white">{item.label}</Link></li>)}
        </ul>
      </nav>
      <p className="font-body text-sm text-bds-text-body">{content.copyright}</p>
    </div>
    <p className="mt-4 max-w-[80ch] font-body text-[13px] leading-[1.6] text-bds-text-body">{content.legalDisclaimer}</p>
  </section>
  );
};

export const Footer = ({ content = fallbackContent }: { content?: FooterContent }) => {
  const pathname = usePathname();

  if (pathname === "/franchise/login" || pathname === "/franchise/login/reset") return null;

  return (
    <footer className="site-footer border-t border-bds-teal-dark/10 bg-white text-bds-text-body lg:bg-bds-cream/35">
      <div className="content-wide footer-desktop-shell">
        <FooterNavigation pagePath={pathname} content={content} />
        <FooterLegal pagePath={pathname} content={content} />
      </div>
    </footer>
  );
};

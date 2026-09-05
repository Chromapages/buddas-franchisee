import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const footer = fs.readFileSync(path.resolve("src/components/public/footer.tsx"), "utf8");
const content = fs.readFileSync(path.resolve("src/features/footer/footer-content.ts"), "utf8");
const analytics = fs.readFileSync(path.resolve("src/lib/analytics.ts"), "utf8");
const globals = fs.readFileSync(path.resolve("src/app/globals.css"), "utf8");

test("footer uses one centralized source for navigation, contact, CTA, and legal content", () => {
  assert.ok(footer.includes("FOOTER_CONTENT"));
  assert.ok(footer.includes("FOOTER_NAVIGATION"));
  assert.ok(footer.includes("FOOTER_LEGAL_LINKS"));
  assert.ok(content.includes('href: "/franchise/contact"'));
  assert.ok(content.includes("buddasbakery@gmail.com"));
  assert.ok(content.includes("tel:+18017010617"));
  assert.ok(content.includes("does not constitute an offer to sell"));
});

test("footer keeps legal destinations in the utility row instead of duplicating Governance navigation", () => {
  assert.ok(footer.includes('FOOTER_NAVIGATION.filter((section) => section.id !== "governance")'));
  assert.ok(footer.includes("primaryFooterNavigation.map"));
});

test("footer keeps inquiry available through candidate navigation without a duplicate conversion rail", () => {
  assert.ok(content.includes('{ label: "Start Franchise Inquiry", href: "/franchise/contact" }'));
  assert.ok(!footer.includes("FooterBrandRail"));
  assert.ok(!footer.includes("FooterPrimaryAction"));
  assert.ok(!footer.includes("ArrowRight"));
  assert.ok(!footer.includes("/images/Logo.svg"));
});

test("mobile footer disclosures are full-row native buttons with stable accessible state", () => {
  assert.ok(footer.includes('type="button"'));
  assert.ok(footer.includes("aria-expanded={isOpen}"));
  assert.ok(footer.includes("aria-controls={panelId}"));
  assert.ok(footer.includes("min-h-[56px]"));
  assert.ok(footer.includes("{isOpen ? <nav"));
  assert.ok(footer.includes("footer-accordion-header-"));
  assert.ok(footer.includes("footer-accordion-panel-"));
});

test("footer contact methods remain semantic and meet practical target sizing", () => {
  assert.ok(footer.includes("mailto:${FOOTER_CONTENT.email}"));
  assert.ok(footer.includes("FOOTER_CONTENT.phoneHref"));
  assert.ok(footer.includes("min-h-11"));
  assert.ok(footer.includes('aria-labelledby={headingId}'));
  assert.equal((footer.match(/<FooterContact\b/g) || []).length, 1);
  assert.equal((footer.match(/footer-contact-heading/g) || []).length, 2);
});

test("footer uses the approved desktop information hierarchy", () => {
  assert.ok(footer.includes("bg-white/95"));
  assert.ok(footer.includes("backdrop-blur-md"));
  assert.ok(!footer.includes("bg-bds-teal-dark text-bds-cream"));
  assert.ok(footer.includes("content-wide"));
  assert.ok(footer.includes("lg:contents"));
  assert.ok(content.includes('title: "Resources & Portals"'));
  assert.ok(content.includes('{ label: "Accessibility", href: "/accessibility" }'));
  assert.ok(content.includes("copyright:"));
});

test("footer tracks non-identifying interaction milestones and honors motion and safe areas", () => {
  for (const event of ["footer_inquiry_click", "footer_email_click", "footer_phone_click", "footer_nav_section_open", "footer_nav_link_click", "footer_legal_link_click"]) {
    assert.ok(footer.includes(event));
    assert.ok(analytics.includes(event));
  }
  assert.ok(footer.includes("motion-reduce:transition-none"));
  assert.ok(globals.includes("calc(var(--space-6) + env(safe-area-inset-bottom))"));
  assert.ok(globals.includes(".site-footer :is(a, button)"));
  assert.ok(globals.includes("scroll-margin-block: calc(var(--public-header-height) + var(--space-4))"));
  assert.ok(footer.includes("focus-visible:ring-2 focus-visible:ring-bds-action-primary"));
});

test("focused authentication routes do not render the marketing footer", () => {
  assert.ok(footer.includes('pathname === "/franchise/login"'));
  assert.ok(footer.includes('pathname === "/franchise/login/reset"'));
});

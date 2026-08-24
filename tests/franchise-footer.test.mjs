import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const footerPath = path.resolve("src/components/public/footer.tsx");
const footerContent = fs.readFileSync(footerPath, "utf8");

test("Footer component utilizes BDS v2.0 design tokens", () => {
  assert.ok(footerContent.includes("bg-bds-teal-dark"), "Footer uses bds-teal-dark background");
  assert.ok(footerContent.includes("text-bds-cream"), "Footer uses bds-cream base text");
  assert.ok(footerContent.includes("text-bds-gold"), "Footer uses bds-gold headings/icons");
  assert.ok(footerContent.includes("hover:text-bds-gold"), "Footer uses bds-gold hover accents");
});

test("Footer implements 3-tier desktop hierarchy: Tier 1 Brand/Actions first, Tier 2 Sitemap second, Tier 3 Legal last", () => {
  const tier1Pos = footerContent.indexOf("TIER 1 (FIRST)");
  const tier2Pos = footerContent.indexOf("TIER 2 (SECOND)");
  const tier3Pos = footerContent.indexOf("TIER 3 (LAST)");

  assert.ok(tier1Pos !== -1, "Contains Tier 1 comment/marker");
  assert.ok(tier2Pos !== -1, "Contains Tier 2 comment/marker");
  assert.ok(tier3Pos !== -1, "Contains Tier 3 comment/marker");
  assert.ok(tier1Pos < tier2Pos, "Tier 1 appears before Tier 2");
  assert.ok(tier2Pos < tier3Pos, "Tier 2 appears before Tier 3");
});

test("Footer provides accessible landmarks and ARIA attributes", () => {
  assert.ok(footerContent.includes('aria-label="Site Footer"'), "Footer has landmark label");
  assert.ok(footerContent.includes('aria-label={section.title}'), "Nav landmark dynamically matches section title");
  assert.ok(footerContent.includes('aria-label="Legal and Compliance"'), "Legal nav landmark present");
  assert.ok(footerContent.includes("focus-visible:ring-bds-gold"), "Focus visible styling is applied");
});

test("Footer implements accessible mobile accordion with WAI-ARIA compliance", () => {
  assert.ok(footerContent.includes("aria-expanded={isOpen}"), "Accordion trigger binds aria-expanded");
  assert.ok(footerContent.includes("aria-controls={panelId}"), "Accordion trigger binds aria-controls");
  assert.ok(footerContent.includes('role="region"'), "Accordion panel specifies region role");
  assert.ok(footerContent.includes("aria-labelledby={headerId}"), "Accordion panel is labelled by header button");
  assert.ok(footerContent.includes("ChevronDown"), "Accordion includes chevron toggle indicator");
});

test("Footer supports multiple-open accordion groups for sitemap discovery", () => {
  assert.ok(footerContent.includes("Record<string, boolean>"), "Uses dictionary state to track independent group open states");
  assert.ok(footerContent.includes("[sectionId]: !prev[sectionId]"), "Toggles individual group without closing adjacent groups");
});

test("Footer provides a visually distinct brand and trust action card on desktop", () => {
  assert.ok(footerContent.includes("rounded-2xl bg-white/[0.03] border border-white/10"), "Desktop brand card styling");
  assert.ok(footerContent.includes("Oahu"), "Heritage and proof trust badge");
  assert.ok(footerContent.includes("2 Operating Utah Locations"), "Utah operating proof");
});

test("Footer accordion triggers and items satisfy 44-48px touch target ergonomics with 8px separation", () => {
  assert.ok(footerContent.includes("min-h-[48px]"), "Accordion trigger button enforces 48px minimum target height");
  assert.ok(footerContent.includes("min-h-[44px]"), "Accordion panel links enforce 44px minimum touch target height");
  assert.ok(footerContent.includes("space-y-2"), "Enforces at least 8px separation between adjacent links and accordion cards");
  assert.ok(footerContent.includes("hover:bg-white/5"), "Touch targets include visual tap feedback");
});

test("Footer contains actionable contact links, primary CTA, and consumer bridge", () => {
  assert.ok(footerContent.includes('href="mailto:buddasbakery@gmail.com"'), "Clickable mailto email link");
  assert.ok(footerContent.includes('href="tel:+18017010617"'), "Clickable tel phone link");
  assert.ok(footerContent.includes("https://buddasbakerygrill.com"), "External link to consumer restaurant");
  assert.ok(footerContent.includes('href="/franchise/contact"'), "Primary inquiry CTA link");
  assert.ok(footerContent.includes("Start a Franchise Inquiry"), "Primary CTA button text immediately visible");
  assert.ok(footerContent.includes('"/franchise/login"'), "Operator portal login route");
});

test("Footer includes standard regulatory and copyright disclaimers", () => {
  assert.ok(footerContent.includes("Franchising LLC"), "Contains legal entity name");
  assert.ok(footerContent.includes("All rights reserved"), "Contains copyright text");
  assert.ok(footerContent.includes("does not constitute an offer to sell"), "Contains regulatory disclaimer");
});

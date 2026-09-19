import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const pageContent = fs.readFileSync(path.resolve("src/app/franchise/page.tsx"), "utf8");
const desktopHero = fs.readFileSync(path.resolve("src/components/public/homepage-hero-desktop.tsx"), "utf8");
const mobileHero = fs.readFileSync(path.resolve("src/components/public/homepage-hero-mobile.tsx"), "utf8");
const heroMedia = fs.readFileSync(path.resolve("src/components/public/homepage-hero-media.tsx"), "utf8");
const heroContent = fs.readFileSync(path.resolve("src/features/franchise/home-hero-content.ts"), "utf8");

test("Franchise homepage hero section contains required BDS v2.0 design tokens and structure", () => {
  assert.ok(pageContent.includes("homepage-hero-shell"), "Mounts the shared cream hero surface");
  assert.ok(mobileHero.includes("bds-text-heading"), "Includes mobile bds-text-heading");
  assert.ok(mobileHero.includes("bds-text-body"), "Includes mobile bds-text-body");
  assert.ok(desktopHero.includes("bg-bds-action-primary"), "Includes desktop primary action styling");
  assert.ok(desktopHero.includes("transition-colors duration-200"), "Limits desktop CTA feedback to a short color transition");
});

test("Hero section displays the franchise-first headline and editorial eyebrow", () => {
  assert.ok(heroContent.includes("Build the Next Budda's."), "Contains the responsive hero headline");
  assert.ok(heroContent.includes("Hawaiian Bakery & Grill built around our signature Budda Roll"), "Contains the concrete franchise concept in body copy");
  assert.ok(heroContent.includes("Franchise Opportunity"), "Contains franchise-first eyebrow text");
  assert.ok(!desktopHero.includes("/roll-icon.svg"), "Desktop hero keeps the left column typographic");
  assert.ok(!mobileHero.includes("/roll-icon.svg"), "Mobile hero keeps the photograph as its single visual device");
  assert.ok(heroContent.includes('headline: "Build the Next Budda\'s."'), "Responsive presentations share the primary headline source");
  assert.ok(!mobileHero.includes("formatCurrentFootprint"), "Mobile hero leaves footprint proof to the evidence chapter");
  assert.ok(heroContent.includes("Explore the Opportunity"), "Mobile primary CTA uses the approved label");
  assert.ok(heroContent.includes("Start the 3-Step Inquiry"), "Mobile secondary CTA uses the approved label");
});

test("Hero section provides responsive mobile and desktop optimized imagery", () => {
  assert.ok(heroContent.includes("franchise-hero-signature-roll.png"), "Includes the desktop signature-roll hero image");
  assert.ok(heroContent.includes('mobileImage: "/images/franchise-hero-signature-roll.png"'), "Uses the product-truth Roll at mobile hero scale");
  assert.ok(heroMedia.includes('loading="eager"'), "Loads the above-the-fold hero image eagerly");
  assert.ok(heroMedia.includes('fetchPriority="high"'), "Marks the LCP request as high priority");
  assert.ok(heroMedia.includes('(max-width: 67.1875rem) 100vw, 58.333vw'), "Provides responsive image sizes");
  assert.ok(!desktopHero.includes("<Image"), "Desktop does not request a competing hidden hero image");
  assert.ok(!mobileHero.includes("<Image"), "Mobile does not duplicate the shared hero image");
  assert.ok(desktopHero.includes("hero:block"), "Desktop hero has an isolated desktop breakpoint");
  assert.ok(mobileHero.includes("hero:hidden"), "Mobile hero has an isolated mobile breakpoint");
  assert.ok(mobileHero.includes("homepage-mobile-hero-copy"), "Mobile hero uses its own styling scope");
  assert.ok(!desktopHero.includes("homepage-mobile-hero-copy"), "Desktop does not share mobile styling scope");
  assert.ok(heroMedia.includes("content.media"), "Shared hero media is not owned by the mobile content variant");
  assert.ok(heroMedia.includes("<picture>"), "Selects the image source at the responsive breakpoint without a hidden duplicate");
  assert.ok(heroMedia.includes("homepage-hero-shared-media-image"), "Shared hero media has a component-neutral styling scope");
});

test("Hero section provides accessible CTAs with correct destinations", () => {
  assert.ok(desktopHero.includes("focus-visible:ring-4"), "Includes focus-visible ring styles");
  assert.ok(desktopHero.includes("<h1"), "Desktop hero uses native primary-heading semantics");
  assert.ok(heroContent.includes('href: "/franchise/the-opportunity"'), "Primary CTA links to /franchise/the-opportunity");
  assert.ok(heroContent.includes("Explore the Opportunity"), "Primary CTA label describes the opportunity destination");
  assert.ok(heroContent.includes('href: "/franchise/contact?source_page=homepage_hero"'), "Secondary CTA links to /franchise/contact");
  assert.ok(heroContent.includes("Start a Franchise Inquiry"), "Secondary CTA label matches approved direct-interest CTA copy");
});

test("Hero section keeps footprint source for proof and reserves the desktop hero for the proposition", () => {
  assert.ok(heroContent.includes("currentFootprint:"), "Contains the public current-footprint source");
  assert.ok(heroContent.includes('locations.length === 1 ? "restaurant" : "restaurants"'), "Uses count-aware restaurant grammar");
  assert.ok(!heroContent.includes("operatingProof:"), "Does not maintain a duplicate operating-proof source");
  assert.ok(heroContent.includes("Pleasant Grove"), "Contains Pleasant Grove location");
  assert.ok(heroContent.includes("Salt Lake City"), "Contains Salt Lake City location");
  assert.ok(pageContent.includes("HomepageHeroDesktop"), "Mounts the isolated desktop hero");
  assert.ok(pageContent.includes("HomepageHeroMobile"), "Mounts the isolated mobile hero");
  assert.ok(!desktopHero.includes("formatCurrentFootprint"), "Desktop hero leaves footprint proof to the evidence chapter");
  assert.ok(desktopHero.includes("{hero.description}"), "Desktop hero uses the configured description");
  assert.ok(desktopHero.includes("{content.opportunity.label}"), "Desktop hero uses the configured opportunity label");
  assert.ok(desktopHero.includes("const headlineLines"), "Desktop keeps the approved fallback headline cadence without bypassing CMS content");
  assert.ok(!desktopHero.includes("heroProofRail.map"), "Desktop reserves supporting proof for the evidence section");
  assert.ok(pageContent.includes("<OperatorProofMobile"), "Mounts the isolated mobile proof section");
  assert.ok(pageContent.includes("<OperatorProofDesktop"), "Mounts the isolated desktop proof section");
});

import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const navbar = fs.readFileSync(path.resolve("src/components/public/navbar.tsx"), "utf8");
const analytics = fs.readFileSync(path.resolve("src/lib/analytics.ts"), "utf8");

test("mobile navigation is a non-modal disclosure with accessible native controls", () => {
  assert.match(navbar, /aria-expanded=\{isMobileMenuOpen\}/);
  assert.match(navbar, /aria-controls="mobile-navigation-drawer"/);
  assert.match(navbar, /if \(event\.key === "Escape"\)/);
  assert.doesNotMatch(navbar, /role="dialog"|aria-modal|aria-haspopup="dialog"|document\.body\.style\.overflow/);
  assert.match(navbar, /<nav aria-label="Mobile Primary Navigation" className="nav:hidden">/);
});

test("mobile navigation keeps one breakpoint, safe viewport sizing, and usable controls", () => {
  assert.match(navbar, /hidden nav:flex items-center/);
  assert.match(navbar, /public-navbar-mobile-actions absolute right-0 nav:hidden/);
  assert.match(navbar, /max-h-\[calc\(100dvh-4rem-env\(safe-area-inset-bottom\)\)\]/);
  assert.match(navbar, /pb-\[calc\(1\.5rem\+env\(safe-area-inset-bottom\)\)\]/);
  assert.match(navbar, /touch-target shrink-0 rounded-xl border border-bds-teal-dark\/15 bg-bds-cream p-2\.5/);
  assert.match(navbar, /!border-bds-action-primary\/70/);
});

test("mobile navigation records non-identifying interaction milestones", () => {
  for (const event of ["mobile_nav_open", "mobile_nav_close", "mobile_nav_link_click", "mobile_nav_request_info_click"]) {
    assert.match(navbar, new RegExp(event));
    assert.match(analytics, new RegExp(event));
  }
  assert.doesNotMatch(navbar, /email|phone|investmentRange|marketInterest/);
});

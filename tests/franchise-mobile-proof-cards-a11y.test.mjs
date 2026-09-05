import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const homepage = fs.readFileSync(path.resolve("src/app/franchise/page.tsx"), "utf8");
const styles = fs.readFileSync(path.resolve("src/app/globals.css"), "utf8");
const proofBlock = homepage.match(/<dl[^>]*aria-label="Franchise qualification signals"[\s\S]*?<\/dl>/)?.[0] || "";

test("mobile proof cards pair decorative icons with semantic label/value content", () => {
  assert.match(homepage, /<MapPin[^>]*aria-hidden="true"/);
  assert.match(homepage, /<DollarSign[^>]*aria-hidden="true"/);
  assert.match(homepage, /aria-label="Franchise qualification signals"/);
  assert.match(homepage, /min-h-12 flex-wrap items-center gap-3 py-2/);
  assert.match(homepage, /text-xs font-bold uppercase tracking-wide text-bds-text-body/);
  assert.match(homepage, /text-sm font-black leading-5 text-bds-text-heading/);
  assert.match(homepage, /<dt[^>]*>Operating proof<\/dt>[\s\S]*?<dd[^>]*>2 Operating Utah Restaurants<\/dd>/);
  assert.match(homepage, /<dt[^>]*>Capital readiness<\/dt>[\s\S]*?<dd[^>]*>\{capitalReadinessRange\}<\/dd>/);
  assert.doesNotMatch(proofBlock, /onClick=|cursor-pointer/);
});

test("compact header keeps an 8px action gap", () => {
  assert.match(styles, /\.public-navbar-mobile-actions \{\s+gap: 0\.5rem;/);
});

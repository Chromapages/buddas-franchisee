import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import robots from "../src/app/robots.ts";
import sitemap from "../src/app/sitemap.ts";
import nextConfig from "../next.config.ts";

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");

test("corporate pages have explicit private caching and anti-indexing headers", async () => {
  const rules = await nextConfig.headers();
  for (const source of ["/corporate", "/corporate/:path*"]) {
    const rule = rules.find((entry) => entry.source === source);
    assert.ok(rule, `Missing protected response headers for ${source}`);
    const headers = new Map(rule.headers.map(({ key, value }) => [key.toLowerCase(), value.toLowerCase()]));
    assert.match(headers.get("cache-control") ?? "", /no-store/);
    assert.match(headers.get("x-robots-tag") ?? "", /noindex/);
    assert.match(headers.get("x-robots-tag") ?? "", /nofollow/);
  }
});

test("production crawlers are excluded from corporate routes and sitemap", () => {
  const previous = Object.fromEntries(["NODE_ENV", "DEPLOYMENT_ENV", "VERCEL_ENV"].map((key) => [key, process.env[key]]));
  try {
    process.env.NODE_ENV = "production";
    process.env.DEPLOYMENT_ENV = "production";
    process.env.VERCEL_ENV = "production";
    const configured = robots().rules;
    const rules = Array.isArray(configured) ? configured : [configured];
    const disallows = rules.flatMap((rule) => Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow]);
    assert.ok(disallows.includes("/corporate"), "Production must explicitly exclude the corporate root");
    assert.ok(disallows.includes("/corporate/*"), "Production must explicitly exclude corporate details");
    for (const entry of sitemap()) {
      assert.doesNotMatch(new URL(entry.url).pathname, /^\/corporate(?:\/|$)/);
    }
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("the corporate route layout obtains authoritative membership before rendering", () => {
  const layout = read("src/app/corporate/layout.tsx");
  assert.match(layout, /await\s+requireCorporateSession\s*\(/,
    "Cookie-presence middleware or a hidden navigation link cannot replace the corporate session guard");
  assert.doesNotMatch(layout, /role\s*===?\s*["']admin["']\s*\|\|/,
    "Legacy portal admin must not bypass corporate membership");
  assert.match(layout, /robots\s*:/);
  assert.match(layout, /index\s*:\s*false/);
});

test("corporate identity is independently checked against current staff grants and provider evidence", () => {
  const source = read("src/features/corporate/session.ts");
  assert.match(source, /verifySessionCookie\(cookie,\s*true\)/, "Revoked Firebase sessions must fail verification");
  assert.match(source, /email_verified/);
  assert.match(source, /sign_in_second_factor/, "Corporate production access needs the required second-factor evidence");
  assert.match(source, /collection\(["']corporateStaff["']\)\.doc\(token\.uid\)/);
  assert.match(source, /staff\.status\s*!==\s*["']ACTIVE["']/);
  assert.match(source, /parseCorporateMemberships\(staff\.memberships\)/);
  assert.match(source, /isActiveCorporateMembership/);
  assert.doesNotMatch(source, /(?:identity|session|staff)\.role\s*===?\s*["']admin["']/,
    "Legacy portal role must not establish real corporate membership");
});

test("corporate navigation provides a usable skip target and keyboard disclosure state", () => {
  const shell = read("src/components/corporate/corporate-shell.tsx");
  assert.match(shell, /href=["']#corporate-main["']/);
  assert.match(shell, /<main\b[^>]*id=["']corporate-main["'][^>]*tabIndex=\{-1\}/);
  assert.match(shell, /<nav\b[^>]*aria-label=/);
  assert.match(shell, /aria-current=\{current\s*\?\s*["']page["']/);
  assert.match(shell, /aria-expanded=\{menuOpen\}/);
  assert.match(shell, /aria-controls=["']corporate-mobile-nav["']/);
  assert.match(shell, /id=["']corporate-mobile-nav["']/);
  assert.match(shell, /["']Escape["']/);
  assert.match(shell, /menuButton\.current\?\.focus\(\)/, "Closing navigation returns focus to its trigger");
  assert.match(shell, /\/images\/Logo-white\.svg/);
  assert.doesNotMatch(shell, /dangerouslySetInnerHTML/);
});

test("shared work tables expose comparison relationships and asynchronous states", () => {
  const components = read("src/components/corporate/corporate-ui.tsx");
  assert.match(components, /<caption\b/);
  assert.match(components, /<th\b[^>]*scope=["']col["']/);
  assert.match(components, /<th\b[^>]*scope=["']row["']/);
  assert.match(components, /role=["']region["'][^>]*aria-label=/);
  assert.match(components, /role=["']alert["']/);
  assert.match(components, /aria-busy=["']true["']/);
  assert.match(components, /role=["']status["']/);
  assert.match(components, /aria-live=["']polite["']/);
});

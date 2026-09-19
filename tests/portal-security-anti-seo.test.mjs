import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import sitemap from "../src/app/sitemap.ts";
import robots from "../src/app/robots.ts";
import { FOOTER_NAVIGATION } from "../src/features/footer/footer-content.ts";
import { primaryNavItems, utilityNavItems } from "../src/features/navigation/nav-config.ts";
import nextConfig from "../next.config.ts";

const restoreEnvironmentVariable = (name, value) => {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
};

test("sitemap: strictly excludes all portal application routes from public sitemap", () => {
  const generatedSitemap = sitemap();
  assert.ok(Array.isArray(generatedSitemap));
  assert.ok(generatedSitemap.length > 0);

  for (const entry of generatedSitemap) {
    const url = entry.url.toLowerCase();
    assert.equal(
      url.includes("/portal"),
      false,
      `Sitemap must not include protected portal routes: found ${entry.url}`,
    );
    assert.equal(
      url.includes("/api/portal"),
      false,
      `Sitemap must not include portal API routes: found ${entry.url}`,
    );
    assert.equal(
      url.includes("/franchise/login"),
      false,
      `Sitemap must not include login/auth routes: found ${entry.url}`,
    );
  }
});

test("robots.ts: explicitly disallows all portal and authentication routes", () => {
  const robotsConfig = robots();
  const disallowList = Array.isArray(robotsConfig.rules)
    ? robotsConfig.rules[0]?.disallow
    : robotsConfig.rules?.disallow;

  assert.ok(disallowList, "robots.txt must contain a disallow rule");

  const normalizedDisallows = (Array.isArray(disallowList) ? disallowList : [disallowList]).map((item) =>
    item.toLowerCase(),
  );

  assert.ok(
    normalizedDisallows.includes("/portal") || normalizedDisallows.includes("/"),
    "robots.txt must disallow /portal",
  );
  assert.ok(
    normalizedDisallows.includes("/portal/*") || normalizedDisallows.includes("/"),
    "robots.txt must disallow /portal/*",
  );
  assert.ok(
    normalizedDisallows.includes("/api/portal") || normalizedDisallows.includes("/"),
    "robots.txt must disallow /api/portal",
  );
  assert.ok(
    normalizedDisallows.includes("/api/portal/*") || normalizedDisallows.includes("/"),
    "robots.txt must disallow /api/portal/*",
  );
  assert.ok(
    normalizedDisallows.includes("/franchise/login") || normalizedDisallows.includes("/"),
    "robots.txt must disallow /franchise/login",
  );
});

test("robots.ts: blocks all crawling in preview and keeps public marketing routes crawlable in production", () => {
  const previous = Object.fromEntries(["NODE_ENV", "DEPLOYMENT_ENV", "VERCEL_ENV"].map((name) => [name, process.env[name]]));
  try {
    process.env.NODE_ENV = "production";
    delete process.env.DEPLOYMENT_ENV;
    process.env.VERCEL_ENV = "preview";
    const previewRules = robots().rules;
    assert.equal(Array.isArray(previewRules) ? previewRules[0]?.disallow : previewRules.disallow, "/");

    process.env.DEPLOYMENT_ENV = "production";
    process.env.VERCEL_ENV = "production";
    const productionRules = robots().rules;
    const productionDisallows = Array.isArray(productionRules) ? productionRules[0]?.disallow : productionRules.disallow;
    assert.ok(Array.isArray(productionDisallows));
    assert.ok(productionDisallows.includes("/portal"));
    assert.equal(productionDisallows.includes("/franchise"), false);
  } finally {
    for (const [name, value] of Object.entries(previous)) restoreEnvironmentVariable(name, value);
  }
});

test("marketing navigation: excludes internal portal routes from public navbar and footer", () => {
  // 1. Navbar audit
  const allNavLinks = [...primaryNavItems, ...utilityNavItems];
  for (const link of allNavLinks) {
    assert.equal(
      link.href.startsWith("/portal/"),
      false,
      `Public navbar must not leak internal portal route: ${link.href}`,
    );
  }

  // 2. Footer audit
  for (const section of FOOTER_NAVIGATION) {
    for (const item of section.items) {
      assert.equal(
        item.href.startsWith("/portal/"),
        false,
        `Public footer must not leak internal portal route: ${item.href} in section "${section.title}"`,
      );
      assert.equal(
        item.href === "/portal",
        false,
        `Public footer must not link directly to /portal`,
      );
    }
  }
});

test("next.config.ts: attaches X-Robots-Tag noindex and no-cache headers to portal routes", async () => {
  assert.ok(typeof nextConfig.headers === "function");
  const headersConfig = await nextConfig.headers();

  const portalHeaders = headersConfig.find(
    (entry) => entry.source === "/portal/:path*",
  );
  assert.ok(portalHeaders, "next.config.ts must configure headers for /portal/:path*");

  const xRobotsTag = portalHeaders.headers.find(
    (h) => h.key.toLowerCase() === "x-robots-tag",
  );
  assert.ok(xRobotsTag, "portal routes must include X-Robots-Tag header");
  assert.ok(xRobotsTag.value.includes("noindex"));
  assert.ok(xRobotsTag.value.includes("nofollow"));
  assert.ok(xRobotsTag.value.includes("noarchive"));
  assert.ok(xRobotsTag.value.includes("nosnippet"));

  const cacheControl = portalHeaders.headers.find(
    (h) => h.key.toLowerCase() === "cache-control",
  );
  assert.ok(cacheControl, "portal routes must include Cache-Control header");
  assert.ok(cacheControl.value.includes("no-store"));

  for (const source of ["/franchise/login", "/franchise/login/:path*", "/franchise/fdd/:path*"]) {
    const entry = headersConfig.find((candidate) => candidate.source === source);
    assert.ok(entry, `${source} must have an explicit private-route header policy`);
    assert.ok(entry.headers.find((header) => header.key.toLowerCase() === "x-robots-tag")?.value.includes("noindex"));
    assert.ok(entry.headers.find((header) => header.key.toLowerCase() === "cache-control")?.value.includes("no-store"));
  }
});

test("metadata directives: private application and login surfaces declare noindex and clear social metadata", () => {
  const portalLayout = fs.readFileSync(path.resolve("src/app/portal/layout.tsx"), "utf8");
  const corporateLayout = fs.readFileSync(path.resolve("src/app/corporate/layout.tsx"), "utf8");
  const loginPage = fs.readFileSync(path.resolve("src/app/franchise/login/page.tsx"), "utf8");
  const resetPage = fs.readFileSync(path.resolve("src/app/franchise/login/reset/page.tsx"), "utf8");
  const fddPage = fs.readFileSync(path.resolve("src/app/franchise/fdd/[token]/page.tsx"), "utf8");

  for (const [name, content] of [["portal", portalLayout], ["corporate", corporateLayout], ["login", loginPage], ["reset", resetPage], ["FDD", fddPage]]) {
    assert.match(content, /index:\s*false/, `${name} metadata must be noindex`);
    assert.match(content, /follow:\s*false/, `${name} metadata must be nofollow`);
    assert.match(content, /openGraph:\s*null/, `${name} metadata must clear inherited Open Graph data`);
    assert.match(content, /twitter:\s*null/, `${name} metadata must clear inherited Twitter data`);
  }

  assert.match(portalLayout, /default:\s*"Dashboard \| Budda's Operator Portal"/);
  assert.match(portalLayout, /template:\s*"%s \| Budda's Operator Portal"/);
  assert.match(loginPage, /corporate \? "Corporate Login \| Budda's Workspace" : "Operator Login \| Budda's Operator Portal"/);
});

test("structured data appears on indexable marketing pages but not shared auth or private-document layouts", () => {
  const franchiseLayout = fs.readFileSync(path.resolve("src/app/franchise/layout.tsx"), "utf8");
  assert.equal(franchiseLayout.includes("StructuredData"), false);

  for (const file of [
    "src/app/franchise/login/page.tsx",
    "src/app/franchise/login/reset/page.tsx",
    "src/app/franchise/fdd/[token]/page.tsx",
  ]) {
    assert.equal(fs.readFileSync(path.resolve(file), "utf8").includes("<StructuredData"), false, `${file} must not emit public JSON-LD`);
  }

  for (const file of [
    "src/app/franchise/page.tsx",
    "src/app/franchise/about/page.tsx",
    "src/app/franchise/contact/page.tsx",
    "src/app/franchise/faq/page.tsx",
    "src/app/franchise/process/page.tsx",
    "src/app/franchise/the-opportunity/page.tsx",
    "src/app/franchise/why-buddas/page.tsx",
  ]) {
    assert.ok(fs.readFileSync(path.resolve(file), "utf8").includes("<StructuredData"), `${file} must retain approved public JSON-LD`);
  }
});

test("portal pages provide safe, route-specific titles without private record identifiers", () => {
  const expectedTitles = new Map([
    ["src/app/portal/account/page.tsx", "Account Profile"],
    ["src/app/portal/bulletins/page.tsx", "Operations Bulletins"],
    ["src/app/portal/cart/page.tsx", "Wholesale Cart"],
    ["src/app/portal/checkout/page.tsx", "Review Supply Order"],
    ["src/app/portal/checkout/confirmation/page.tsx", "Order Confirmation"],
    ["src/app/portal/expansion/page.tsx", "Growth Requests"],
    ["src/app/portal/orders/page.tsx", "Orders & Shipments"],
    ["src/app/portal/resources/page.tsx", "Resource Center"],
    ["src/app/portal/supplies/page.tsx", "Supplies Catalog"],
    ["src/app/portal/supplies/[slug]/page.tsx", "Supply Item"],
    ["src/app/portal/support/page.tsx", "Operations Support"],
  ]);
  for (const [file, title] of expectedTitles) {
    const content = fs.readFileSync(path.resolve(file), "utf8");
    assert.ok(content.includes(`export const metadata: Metadata = { title: "${title}" };`), `${file} must define its safe static title`);
    assert.equal(content.includes("generateMetadata"), false, `${file} must not derive metadata from private route data`);
  }
});

test("middleware: protects portal and corporate matchers and applies redirect/header contracts", () => {
  const content = fs.readFileSync(path.resolve("src/middleware.ts"), "utf8");
  assert.match(content, /pathname === "\/portal"/);
  assert.match(content, /pathname\.startsWith\("\/portal\/"\)/);
  assert.match(content, /NextResponse\.redirect\(loginUrl, 307\)/);
  assert.match(content, /"noindex, nofollow, noarchive, nosnippet"/);
  assert.match(content, /"no-store, no-cache, must-revalidate, max-age=0"/);
  assert.match(content, /matcher: \["\/portal\/:path\*"/);
});

test("codebase audit: all portal pages strictly require authentication before executing data queries", () => {
  const portalDir = path.resolve(process.cwd(), "src/app/portal");

  const checkDirectory = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        checkDirectory(fullPath);
      } else if (entry.name === "page.tsx") {
        const content = fs.readFileSync(fullPath, "utf-8");

        // Assert no unsafe non-null assertions on getPortalSession
        assert.equal(
          content.includes("(await getPortalSession())!"),
          false,
          `Unsafe non-null assertion on getPortalSession found in ${fullPath}`,
        );

        // Assert requirePortalPermission is used
        assert.ok(
          content.includes("requirePortalPermission"),
          `Portal page ${fullPath} must call requirePortalPermission before executing queries`,
        );
      }
    }
  };

  checkDirectory(portalDir);
});

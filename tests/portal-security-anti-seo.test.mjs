import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import sitemap from "../src/app/sitemap.ts";
import robots from "../src/app/robots.ts";
import { FOOTER_NAVIGATION } from "../src/features/footer/footer-content.ts";
import { primaryNavItems, utilityNavItems } from "../src/features/navigation/nav-config.ts";
import nextConfig from "../next.config.ts";
import { metadata as portalMetadata } from "../src/app/portal/layout.tsx";
import { metadata as loginMetadata } from "../src/app/franchise/login/page.tsx";
import { metadata as resetMetadata } from "../src/app/franchise/login/reset/page.tsx";
import { middleware } from "../src/middleware.ts";

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
});

test("metadata directives: portal layout and login pages declare noindex, nofollow, nocache", () => {
  // Portal Layout Metadata
  assert.ok(portalMetadata.robots);
  assert.equal(portalMetadata.robots.index, false);
  assert.equal(portalMetadata.robots.follow, false);
  assert.equal(portalMetadata.robots.nocache, true);
  assert.equal(portalMetadata.robots.googleBot?.index, false);
  assert.equal(portalMetadata.robots.googleBot?.follow, false);
  assert.equal(portalMetadata.robots.googleBot?.noimageindex, true);

  // Login Page Metadata
  assert.ok(loginMetadata.robots);
  assert.equal(loginMetadata.robots.index, false);
  assert.equal(loginMetadata.robots.follow, false);
  assert.equal(loginMetadata.robots.nocache, true);

  // Reset Password Page Metadata
  assert.ok(resetMetadata.robots);
  assert.equal(resetMetadata.robots.index, false);
  assert.equal(resetMetadata.robots.follow, false);
  assert.equal(resetMetadata.robots.nocache, true);
});

test("middleware: intercepts unauthenticated requests to /portal with 307 redirect, noindex, and no-store", () => {
  // Mock unauthenticated NextRequest
  const mockUnauthRequest = {
    nextUrl: { pathname: "/portal/orders" },
    url: "https://buddasfranchise.com/portal/orders",
    cookies: {
      has: () => false,
    },
  };

  // @ts-expect-error test mock
  const unauthResponse = middleware(mockUnauthRequest);
  assert.ok(unauthResponse);
  assert.equal(unauthResponse.status, 307);
  assert.ok(unauthResponse.headers.get("location")?.includes("/franchise/login"));
  assert.equal(
    unauthResponse.headers.get("x-robots-tag"),
    "noindex, nofollow, noarchive, nosnippet",
  );
  assert.ok(unauthResponse.headers.get("cache-control")?.includes("no-store"));

  // Mock authenticated NextRequest
  const mockAuthRequest = {
    nextUrl: { pathname: "/portal/supplies" },
    url: "https://buddasfranchise.com/portal/supplies",
    cookies: {
      has: (name: string) => name === "buddas_portal_session",
    },
  };

  // @ts-expect-error test mock
  const authResponse = middleware(mockAuthRequest);
  assert.ok(authResponse);
  assert.equal(
    authResponse.headers.get("x-robots-tag"),
    "noindex, nofollow, noarchive, nosnippet",
  );
  assert.ok(authResponse.headers.get("cache-control")?.includes("no-store"));
});

test("codebase audit: all portal pages strictly require authentication before executing data queries", () => {
  const portalDir = path.resolve(process.cwd(), "src/app/portal");

  const checkDirectory = (dir: string) => {
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

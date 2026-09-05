import { readFileSync } from "node:fs";
import { responsiveTokens } from "../responsive.tokens.js";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const failures: string[] = [];

const config = read("tailwind.config.ts");
if (!config.includes('import { tailwindScreens } from "./responsive.tokens.js"')) {
  failures.push("tailwind.config.ts must import tailwindScreens from the responsive registry.");
}
if (!config.includes("screens: tailwindScreens")) {
  failures.push("tailwind.config.ts must use the canonical screen registry.");
}

const css = read("src/app/globals.css");
for (const className of [
  ".content-narrow",
  ".content-default",
  ".content-wide",
  ".section-standard",
  ".page-rhythm",
  ".workspace-form",
  ".workspace-reading",
  ".workspace-detail",
  ".portal-shell-main",
]) {
  if (!css.includes(className)) failures.push(`globals.css is missing ${className}.`);
}

const requiredTokens = [
  responsiveTokens.breakpoints.phone,
  responsiveTokens.breakpoints.sm,
  responsiveTokens.breakpoints.md,
  responsiveTokens.breakpoints.lg,
  responsiveTokens.breakpoints.hero,
  responsiveTokens.breakpoints.nav,
  responsiveTokens.breakpoints.xl,
  responsiveTokens.breakpoints.heroWide,
];
if (new Set(requiredTokens).size !== requiredTokens.length) {
  failures.push("Responsive breakpoint tokens must be unique.");
}

const shellRules: Array<[string, string]> = [
  ["src/app/franchise/login/page.tsx", "content-narrow section-standard"],
  ["src/app/franchise/fdd/[token]/page.tsx", "content-wide page-rhythm"],
  ["src/app/portal/account/page.tsx", "workspace-reading"],
  ["src/app/portal/support/page.tsx", "workspace-form"],
  ["src/app/portal/checkout/page.tsx", "workspace-reading"],
  ["src/app/portal/cart/page.tsx", "workspace-detail"],
  ["src/app/portal/supplies/[slug]/page.tsx", "workspace-detail"],
  ["src/app/portal/checkout/confirmation/page.tsx", "workspace-form section-standard"],
];

for (const [path, expected] of shellRules) {
  if (!read(path).includes(expected)) failures.push(`${path} must use ${expected}.`);
}

if (failures.length) {
  console.error("Responsive system verification failed:\n- " + failures.join("\n- "));
  process.exitCode = 1;
} else {
  console.log("Responsive system verification passed.");
}

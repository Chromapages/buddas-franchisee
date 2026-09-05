import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const PORTAL_APP_DIR = path.resolve("src/app/portal");
const PORTAL_COMPONENTS_DIR = path.resolve("src/components/portal");
const PORTAL_FEATURES_DIR = path.resolve("src/features/portal");

const getAllFiles = (dir, extList = [".tsx", ".ts"]) => {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, extList));
    } else if (extList.some((ext) => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
};

test("Branding Compliance: Zero legacy unaligned tokens in portal codebase", () => {
  const portalFiles = [
    ...getAllFiles(PORTAL_APP_DIR),
    ...getAllFiles(PORTAL_COMPONENTS_DIR),
    ...getAllFiles(PORTAL_FEATURES_DIR),
  ];

  const forbiddenTokens = [
    "brand-charcoal",
    "brand-clay",
    "brand-sand",
    "brand-butter",
    "brand-mango",
  ];

  const violations = [];

  for (const filePath of portalFiles) {
    const content = fs.readFileSync(filePath, "utf-8");
    for (const token of forbiddenTokens) {
      if (content.includes(token)) {
        violations.push({
          file: path.relative(process.cwd(), filePath),
          token,
        });
      }
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Found ${violations.length} legacy unaligned token violations: ${JSON.stringify(violations, null, 2)}`,
  );
});

test("Branding Compliance: Max radius rounded-2xl enforced (no rounded-3xl in portal)", () => {
  const portalFiles = [
    ...getAllFiles(PORTAL_APP_DIR),
    ...getAllFiles(PORTAL_COMPONENTS_DIR),
  ];

  const violations = [];

  for (const filePath of portalFiles) {
    const content = fs.readFileSync(filePath, "utf-8");
    if (content.includes("rounded-3xl")) {
      violations.push(path.relative(process.cwd(), filePath));
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Found rounded-3xl violations in: ${JSON.stringify(violations, null, 2)} (per design.md §9.1 max card radius is rounded-2xl)`,
  );
});

test("Branding Compliance: Distinctive Brand Assets (DBAs) created and exported", () => {
  const tableLineFile = path.resolve(PORTAL_COMPONENTS_DIR, "table-line.tsx");
  const rollArcFormFile = path.resolve(PORTAL_COMPONENTS_DIR, "roll-arc-form.tsx");

  assert.ok(fs.existsSync(tableLineFile), "table-line.tsx must exist");
  assert.ok(fs.existsSync(rollArcFormFile), "roll-arc-form.tsx must exist");

  const tableLineContent = fs.readFileSync(tableLineFile, "utf-8");
  assert.ok(
    tableLineContent.includes("export const TableLine") ||
      tableLineContent.includes("export function TableLine"),
    "TableLine must be exported",
  );
  assert.ok(
    tableLineContent.includes("bds-teal") || tableLineContent.includes("#237B6E"),
    "TableLine must use canonical brand teal",
  );

  const rollArcFormContent = fs.readFileSync(rollArcFormFile, "utf-8");
  assert.ok(
    rollArcFormContent.includes("RollArcForm02"),
    "RollArcForm02 must be exported",
  );
});

test("Branding Compliance: DBA TableLine is integrated in key portal views", () => {
  const targetFiles = [
    path.resolve(PORTAL_APP_DIR, "page.tsx"),
    path.resolve(PORTAL_COMPONENTS_DIR, "portal-shell.tsx"),
    path.resolve(PORTAL_COMPONENTS_DIR, "orders-workspace.tsx"),
    path.resolve(PORTAL_COMPONENTS_DIR, "support-workspace.tsx"),
    path.resolve(PORTAL_COMPONENTS_DIR, "cart-workspace.tsx"),
  ];

  for (const filePath of targetFiles) {
    assert.ok(fs.existsSync(filePath), `File must exist: ${filePath}`);
    const content = fs.readFileSync(filePath, "utf-8");
    assert.ok(
      content.includes("TableLine"),
      `TableLine DBA must be integrated into ${path.basename(filePath)}`,
    );
  }
});

test("Branding Compliance: Authentic product photography and RollArcForm02 in supplies & cart", () => {
  const dataFile = path.resolve(PORTAL_FEATURES_DIR, "data.ts");
  const catalogBrowserFile = path.resolve(PORTAL_COMPONENTS_DIR, "catalog-browser.tsx");
  const cartWorkspaceFile = path.resolve(PORTAL_COMPONENTS_DIR, "cart-workspace.tsx");

  const dataContent = fs.readFileSync(dataFile, "utf-8");
  assert.ok(
    dataContent.includes("/images/classic-budda-roll.png"),
    "Product catalog must reference authentic Budda Roll photography",
  );

  const catalogContent = fs.readFileSync(catalogBrowserFile, "utf-8");
  assert.ok(
    catalogContent.includes("<Image") || catalogContent.includes("next/image"),
    "Catalog browser must render product truth photography using next/image",
  );

  const cartContent = fs.readFileSync(cartWorkspaceFile, "utf-8");
  assert.ok(
    cartContent.includes("RollArcForm02"),
    "Cart workspace must integrate RollArcForm02 DBA flourish",
  );
});

test("Branding Compliance: Canonical Locked Master Palette tokens used in portal shell and navigation", () => {
  const shellFile = path.resolve(PORTAL_COMPONENTS_DIR, "portal-shell.tsx");
  const shellContent = fs.readFileSync(shellFile, "utf-8");

  assert.ok(
    shellContent.includes("bds-teal-dark"),
    "Portal shell sidebar must use bds-teal-dark",
  );
  assert.ok(
    shellContent.includes("border-bds-teal") || shellContent.includes("text-bds-teal"),
    "Portal navigation active state must use brand light teal indicator",
  );
  assert.ok(
    shellContent.includes("bg-bds-cream"),
    "Portal main background must use bds-cream",
  );
});

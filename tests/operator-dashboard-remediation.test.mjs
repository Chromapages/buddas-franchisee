import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { evaluateAudienceTargeting } from "../src/features/portal/targeting.ts";
import {
  DASHBOARD_DATA_STATE,
  resolveDashboardCollectionState,
} from "../src/features/portal/dashboard-data-state.ts";
import {
  getDashboardCapabilities,
  getOperatorDashboardModules,
} from "../src/features/portal/dashboard-authorization.ts";
import { buildDashboardOperationalState } from "../src/features/portal/dashboard-attention.ts";
import { selectDashboardOperationsRail } from "../src/features/portal/dashboard-operations-rail.ts";
import { buildDashboardDesktopLayout } from "../src/features/portal/dashboard-layout-engine.ts";
import { formatPortalFreshnessTime, getUnitTimeZone } from "../src/features/portal/date-time.ts";

const relativeLuminance = (hex) => {
  const channels = hex.match(/[\da-f]{2}/gi).map((channel) => Number.parseInt(channel, 16) / 255);
  const linear = channels.map((channel) => channel <= 0.03928
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
};

const contrastRatio = (foreground, background) => {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
};

test("operator admins remain within the active bulletin audience", () => {
  const result = evaluateAudienceTargeting(
    { unitIds: ["OAH-207"] },
    { unitId: "HNL-014", role: "admin" },
  );

  assert.equal(result.isTargeted, false);
  assert.match(result.summary, /Excluded/);
});

test("dashboard collection failures never become successful empty states", () => {
  const failed = resolveDashboardCollectionState(
    { status: "rejected", reason: new Error("network unavailable") },
    true,
  );
  const unauthorized = resolveDashboardCollectionState(undefined, false);
  const empty = resolveDashboardCollectionState(
    { status: "fulfilled", value: [] },
    true,
  );

  assert.equal(failed.state, DASHBOARD_DATA_STATE.PARTIAL_ERROR);
  assert.equal(unauthorized.state, DASHBOARD_DATA_STATE.PERMISSION_UNAVAILABLE);
  assert.equal(empty.state, DASHBOARD_DATA_STATE.EMPTY);
});

test("dashboard operational model separates action-required work from normal progress", () => {
  const state = buildDashboardOperationalState({
    locationId: "HNL-014",
    bulletins: [{ id: "BUL-1", title: "Confirm updated protocol", summary: "", publishedAt: "2026-09-01T00:00:00.000Z", priority: "ACTION_REQUIRED" }],
    supportCases: [
      { id: "SUP-1", locationId: "HNL-014", userEmail: "operator@example.test", subject: "Reply needed", topic: "Operations", details: "", status: "Open", operatorActionRequired: true, createdAt: "2026-09-01T00:00:00.000Z", updatedAt: "2026-09-01T00:00:00.000Z" },
      { id: "SUP-2", locationId: "HNL-014", userEmail: "operator@example.test", subject: "Processing request", topic: "Operations", details: "", status: "In Review", operatorActionRequired: false, createdAt: "2026-09-01T00:00:00.000Z", updatedAt: "2026-09-01T00:00:00.000Z" },
    ],
    orders: [
      { id: "BD-1", locationId: "HNL-014", createdAt: "2026-09-01T00:00:00.000Z", status: "PROCESSING", items: [], total: 0, invoiceId: "INV-1" },
      { id: "BD-2", locationId: "HNL-014", createdAt: "2026-09-01T00:00:00.000Z", status: "DELAYED", items: [], total: 0, invoiceId: "INV-2" },
    ],
  });

  assert.deepEqual(state.attention.map((item) => item.type), ["required-update", "support-reply", "supply-order"]);
  assert.deepEqual(state.active.map((item) => item.type), ["support-request", "supply-order"]);
  assert.ok([...state.attention, ...state.active].every((item) => item.id && item.label && item.secondaryText && item.destination && item.locationId));
  assert.ok(state.attention.every((item) => item.requiresAction));
  assert.ok(state.active.every((item) => !item.requiresAction));
});

test("dashboard attention queue supports one and many actionable items", () => {
  const oneItem = buildDashboardOperationalState({
    locationId: "HNL-014",
    bulletins: [{ id: "BUL-1", title: "Confirm protocol", summary: "", publishedAt: "2026-09-01T00:00:00.000Z", priority: "ACTION_REQUIRED" }],
    supportCases: [],
    orders: [],
  });
  assert.equal(oneItem.attention.length, 1);

  const manyItems = buildDashboardOperationalState({
    locationId: "HNL-014",
    bulletins: [
      { id: "BUL-1", title: "Confirm protocol", summary: "", publishedAt: "2026-09-01T00:00:00.000Z", priority: "ACTION_REQUIRED" },
      { id: "BUL-2", title: "Review revised SOP", summary: "", publishedAt: "2026-09-01T00:00:00.000Z", priority: "ACTION_REQUIRED" },
    ],
    supportCases: [
      { id: "SUP-1", locationId: "HNL-014", userEmail: "operator@example.test", subject: "Reply needed", topic: "Operations", details: "", status: "Open", operatorActionRequired: true, createdAt: "2026-09-01T00:00:00.000Z", updatedAt: "2026-09-01T00:00:00.000Z" },
      { id: "SUP-2", locationId: "HNL-014", userEmail: "operator@example.test", subject: "Reply needed", topic: "Operations", details: "", status: "Open", operatorActionRequired: true, createdAt: "2026-09-01T00:00:00.000Z", updatedAt: "2026-09-01T00:00:00.000Z" },
    ],
    orders: [{ id: "BD-1", locationId: "HNL-014", createdAt: "2026-09-01T00:00:00.000Z", status: "DELAYED", items: [], total: 0, invoiceId: "INV-1" }],
  });
  assert.equal(manyItems.attention.length, 5);
  assert.ok(manyItems.attention.every((item) => item.requiresAction));
});

test("default dashboard modules are permission-scoped and priority-ordered", () => {
  const session = {
    userId: "operator-1",
    email: "operator@example.test",
    role: "franchisee",
    locationId: "HNL-014",
    locationName: "La'ie Origin Grill",
    managedLocationIds: ["HNL-014"],
    expiresAt: Date.now() + 10_000,
  };
  const modules = getOperatorDashboardModules(session);

  assert.deepEqual(modules.map((module) => module.id), ["operator-status", "quick-actions", "support-rail", "recent-orders", "operations-bulletins", "resource-rail"]);
  assert.ok(modules.every((module) => module.locationScope === "active-unit" || module.locationScope === "targeted-active-unit"));
  assert.ok(modules.every((module) => module.component && module.dataDependencies && module.columnSpan && module.desktopRegion && module.minimumContentState));
});

test("dashboard capability flags remain a projection of existing portal authorization", () => {
  const baseSession = {
    userId: "operator-1", email: "operator@example.test", role: "franchisee", locationId: "HNL-014", locationName: "La'ie Origin Grill", managedLocationIds: ["HNL-014"], expiresAt: Date.now() + 10_000,
  };
  const franchiseeCapabilities = getDashboardCapabilities(baseSession);
  const adminCapabilities = getDashboardCapabilities({ ...baseSession, role: "admin" });

  assert.equal(franchiseeCapabilities["supplies.order"], true);
  assert.equal(franchiseeCapabilities["orders.view"], true);
  assert.equal(franchiseeCapabilities["growth_requests.view"], true);
  assert.equal(adminCapabilities["growth_requests.view"], true);
  assert.ok(Object.values(getDashboardCapabilities({ ...baseSession, managedLocationIds: [] })).every((available) => available === false));
});

test("dashboard freshness uses the active unit IANA zone and honors DST", () => {
  assert.equal(getUnitTimeZone("SLC-001"), "America/Denver");
  assert.equal(getUnitTimeZone("HNL-014"), "Pacific/Honolulu");
  assert.match(formatPortalFreshnessTime("2026-07-15T20:07:00.000Z", "SLC-001"), /2:07 PM MDT$/);
  assert.match(formatPortalFreshnessTime("2026-01-15T20:07:00.000Z", "SLC-001"), /1:07 PM MST$/);
  assert.match(formatPortalFreshnessTime("2026-07-15T20:07:00.000Z", "HNL-014"), /10:07 AM HST$/);
});

test("operations rail ranks meaningful context and leaves space unused data-free", () => {
  const modules = getOperatorDashboardModules({
    userId: "operator-1", email: "operator@example.test", role: "franchisee", locationId: "HNL-014", locationName: "La'ie Origin Grill", managedLocationIds: ["HNL-014"], expiresAt: Date.now() + 10_000,
  });

  assert.deepEqual(selectDashboardOperationsRail(modules, {}), []);
  assert.deepEqual(selectDashboardOperationsRail(modules, {
    bulletins: [{ id: "BUL-1", title: "Confirm protocol", summary: "", publishedAt: "2026-09-01T00:00:00.000Z", priority: "ACTION_REQUIRED" }],
    supportCases: [{ id: "SUP-1", locationId: "HNL-014", userEmail: "operator@example.test", subject: "Reply needed", topic: "Operations", details: "", status: "Open", operatorActionRequired: true, createdAt: "2026-09-01T00:00:00.000Z", updatedAt: "2026-09-01T00:00:00.000Z" }],
    resources: [{ id: "RES-1", title: "Updated SOP", category: "Operations Manuals", version: "1.0", updatedAt: "2026-09-01T00:00:00.000Z", fileSize: "1 MB", downloadUrl: "/resource" }],
  }), ["operations-bulletins", "support-rail", "resource-rail"]);
  assert.deepEqual(selectDashboardOperationsRail(modules, { failures: { resources: true } }), ["resource-rail"]);
});

test("desktop layout uses approved grid templates from data-selected modules", () => {
  const session = { userId: "operator-1", email: "operator@example.test", role: "franchisee", locationId: "HNL-014", locationName: "La'ie Origin Grill", managedLocationIds: ["HNL-014"], expiresAt: Date.now() + 10_000 };
  const modules = getOperatorDashboardModules(session);

  assert.equal(buildDashboardDesktopLayout(modules, []).template, "12");
  assert.deepEqual(buildDashboardDesktopLayout(modules, ["support-rail"]).columns.map((column) => column.span), [8, 4]);

  const balanced = modules.filter((module) => module.id === "recent-orders" || module.id === "operations-bulletins")
    .map((module) => ({ ...module, desktopRegion: "primary", columnSpan: { ...module.columnSpan, desktop: 6 } }));
  assert.equal(buildDashboardDesktopLayout(balanced, []).template, "6-6");

  const thirds = ["recent-orders", "operations-bulletins", "resource-rail"].map((id) => {
    const module = modules.find((candidate) => candidate.id === id);
    return { ...module, desktopRegion: "primary", columnSpan: { ...module.columnSpan, desktop: 4 } };
  });
  assert.equal(buildDashboardDesktopLayout(thirds, []).template, "4-4-4");
});

test("dashboard keeps one native H1 while mobile retains an equivalent level-one heading", () => {
  const mobile = readFileSync("src/components/portal/mobile-operator-dashboard.tsx", "utf8");
  const desktop = readFileSync("src/components/portal/desktop-operator-dashboard.tsx", "utf8");
  const status = readFileSync("src/components/portal/operator-status.tsx", "utf8");

  assert.equal((mobile.match(/<h1\b/g) || []).length, 0);
  assert.match(mobile, /role="heading" aria-level=\{1\}>Dashboard/);
  assert.equal((desktop.match(/<h1\b/g) || []).length, 1);
  assert.match(desktop, /<h1 className="home-dashboard-title">Dashboard<\/h1>/);
  assert.match(status, /You’re caught up/);
  assert.doesNotMatch(status, /You&apos;re caught up/);
});

test("portal rail labels use the AA-safe inverse accent and focused controls clear fixed navigation", () => {
  const shell = readFileSync("src/components/portal/portal-shell.tsx", "utf8");
  const css = readFileSync("src/app/globals.css", "utf8");

  assert.match(css, /--bds-workspace-sidebar-accent:\s*#A7EBDC/);
  assert.ok(contrastRatio("#A7EBDC", "#1C5F56") >= 4.5);
  assert.match(shell, /className="portal-sidebar-kicker mt-2/);
  assert.doesNotMatch(shell, /Working unit/);
  assert.match(shell, /portal-sidebar-unit-single/);
  assert.match(css, /\.portal-sidebar-unit-single \{[^}]*border-left: 3px solid var\(--bds-color-brand-teal\)/);
  assert.match(css, /\.portal-sidebar-kicker \{ color: var\(--bds-workspace-sidebar-accent\); \}/);
  assert.match(css, /scroll-margin-bottom: calc\(var\(--portal-mobile-tabbar-measured-height, var\(--portal-mobile-tabbar-height\)\) \+ max\(1rem, env\(safe-area-inset-bottom\)\)\)/);
  assert.match(css, /portal-shell-main :where\(a, button, input, select, textarea, summary/);
});

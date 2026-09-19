import { isBulletinActive, isBulletinActionOutstanding } from "./bulletins.ts";
import type { DashboardModuleConfig } from "./dashboard-authorization";
import type { PortalBulletin, PortalResource, PortalSupportCase } from "./types";

type DashboardOperationsRailData = {
  bulletins?: PortalBulletin[];
  supportCases?: PortalSupportCase[];
  resources?: PortalResource[];
  failures?: Partial<Record<"bulletins" | "supportCases" | "resources", boolean>>;
};

type RailCandidate = {
  id: DashboardModuleConfig["id"];
  priority: number;
};

const hasOpenSupport = (supportCases?: PortalSupportCase[]) =>
  Boolean(supportCases?.some((supportCase) => supportCase.status !== "Resolved"));

const hasCurrentBulletin = (bulletins?: PortalBulletin[]) =>
  Boolean(bulletins?.some((bulletin) => isBulletinActive(bulletin)));

const hasActionableBulletin = (bulletins?: PortalBulletin[]) =>
  Boolean(bulletins?.some((bulletin) => isBulletinActive(bulletin) && isBulletinActionOutstanding(bulletin)));

/**
 * Keeps the desktop rail content-led. Loaders are already capability-gated by
 * the module registry, and only real contextual content (or a scoped recovery
 * state) may reserve rail space. This deliberately has no synthetic all-clear
 * candidate: the primary stream can use the full width when there is no
 * secondary context.
 */
export const selectDashboardOperationsRail = (
  modules: readonly DashboardModuleConfig[],
  data: DashboardOperationsRailData,
): DashboardModuleConfig["id"][] => {
  const allowed = new Set(
    modules
      .filter((module) => module.desktopRegion === "rail" && module.minimumContentState === "meaningful")
      .map((module) => module.id),
  );
  const candidates: RailCandidate[] = [];

  if (allowed.has("operations-bulletins") && hasCurrentBulletin(data.bulletins)) {
    candidates.push({ id: "operations-bulletins", priority: hasActionableBulletin(data.bulletins) ? 100 : 300 });
  }
  if (allowed.has("support-rail") && hasOpenSupport(data.supportCases)) {
    candidates.push({ id: "support-rail", priority: 200 });
  }
  if (allowed.has("resource-rail") && data.resources?.length) {
    candidates.push({ id: "resource-rail", priority: 400 });
  }
  // A source failure is shown locally rather than disappearing into a generic
  // dashboard failure. It is lower priority than live operational context.
  if (allowed.has("operations-bulletins") && data.failures?.bulletins && !hasCurrentBulletin(data.bulletins)) {
    candidates.push({ id: "operations-bulletins", priority: 500 });
  }
  if (allowed.has("support-rail") && data.failures?.supportCases && !hasOpenSupport(data.supportCases)) {
    candidates.push({ id: "support-rail", priority: 510 });
  }
  if (allowed.has("resource-rail") && data.failures?.resources && !data.resources?.length) {
    candidates.push({ id: "resource-rail", priority: 520 });
  }

  return candidates
    .sort((left, right) => left.priority - right.priority)
    .slice(0, 3)
    .map((candidate) => candidate.id);
};

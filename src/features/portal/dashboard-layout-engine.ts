import type { DashboardModuleConfig } from "./dashboard-authorization";

export type DashboardDesktopLayoutTemplate = "12" | "6-6" | "8-4" | "4-4-4";
export type DashboardDesktopColumn = {
  span: 4 | 6 | 8 | 12;
  moduleIds: DashboardModuleConfig["id"][];
  region: "primary" | "rail";
};

export type DashboardDesktopLayout = {
  template: DashboardDesktopLayoutTemplate;
  columns: DashboardDesktopColumn[];
};

const primaryModules = (modules: readonly DashboardModuleConfig[]) =>
  modules.filter((module) => module.desktopRegion === "primary");

const moduleIds = (modules: readonly DashboardModuleConfig[]) => modules.map((module) => module.id);

/**
 * Arranges capability- and data-selected modules into approved grid patterns.
 * It intentionally does not accept user positioning: role and data state are
 * the only inputs that can affect an operator's dashboard composition.
 */
export const buildDashboardDesktopLayout = (
  modules: readonly DashboardModuleConfig[],
  railModuleIds: readonly DashboardModuleConfig["id"][],
): DashboardDesktopLayout => {
  const primary = primaryModules(modules);
  const rail = railModuleIds
    .map((id) => modules.find((module) => module.id === id))
    .filter((module): module is DashboardModuleConfig => Boolean(module));

  if (rail.length && primary.length) {
    return {
      template: "8-4",
      columns: [
        { span: 8, moduleIds: moduleIds(primary), region: "primary" },
        { span: 4, moduleIds: moduleIds(rail), region: "rail" },
      ],
    };
  }

  if (!rail.length && primary.length >= 3 && primary.slice(0, 3).every((module) => module.columnSpan.desktop === 4)) {
    return {
      template: "4-4-4",
      columns: primary.slice(0, 3).map((module) => ({ span: 4, moduleIds: [module.id], region: "primary" })),
    };
  }

  if (!rail.length && primary.length >= 2 && primary.slice(0, 2).every((module) => module.columnSpan.desktop === 6)) {
    return {
      template: "6-6",
      columns: primary.slice(0, 2).map((module) => ({ span: 6, moduleIds: [module.id], region: "primary" })),
    };
  }

  // With no meaningful rail, the primary stream gets the full grid. If a
  // restricted role has no primary module, real rail content still has a
  // useful full-width home instead of an orphaned four-column strip.
  return {
    template: "12",
    columns: [{ span: 12, moduleIds: moduleIds(primary.length ? primary : rail), region: "primary" }],
  };
};

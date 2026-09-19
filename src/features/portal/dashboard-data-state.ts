import { isPortalModuleUnconfigured } from "./module-loader.ts";

export const DASHBOARD_DATA_STATE = {
  LOADING: "loading",
  ACTIVE: "active",
  EMPTY: "empty",
  STALE: "stale",
  PARTIAL_ERROR: "partial-error",
  OFFLINE: "offline",
  PERMISSION_UNAVAILABLE: "permission-unavailable",
  UNCONFIGURED: "unconfigured",
} as const;

// This measures the age of the Dashboard's last successful server read. It is
// intentionally separate from provider synchronization timestamps, which are
// not available from the current order, support, or bulletin sources.
export const DASHBOARD_STALE_AFTER_MS = 5 * 60 * 1000;
export const DASHBOARD_AUTO_REFRESH_MS = 2 * 60 * 1000;

export type DashboardDataState = (typeof DASHBOARD_DATA_STATE)[keyof typeof DASHBOARD_DATA_STATE];

export type DashboardCollectionState<T> = {
  state: DashboardDataState;
  data: T[];
};

export const resolveDashboardCollectionState = <T,>(
  result: PromiseSettledResult<T[]> | undefined,
  authorized: boolean,
  options: { updatedAt?: string; staleAfterMs?: number } = {},
): DashboardCollectionState<T> => {
  if (!authorized) return { state: DASHBOARD_DATA_STATE.PERMISSION_UNAVAILABLE, data: [] };
  if (!result) return { state: DASHBOARD_DATA_STATE.UNCONFIGURED, data: [] };
  if (result.status === "rejected") {
    return {
      state: isPortalModuleUnconfigured(result.reason)
        ? DASHBOARD_DATA_STATE.UNCONFIGURED
        : DASHBOARD_DATA_STATE.PARTIAL_ERROR,
      data: [],
    };
  }

  const updatedAt = options.updatedAt ? Date.parse(options.updatedAt) : Number.NaN;
  const isStale = Boolean(
    options.staleAfterMs
    && Number.isFinite(updatedAt)
    && Date.now() - updatedAt > options.staleAfterMs,
  );
  if (isStale) return { state: DASHBOARD_DATA_STATE.STALE, data: result.value };
  return {
    state: result.value.length ? DASHBOARD_DATA_STATE.ACTIVE : DASHBOARD_DATA_STATE.EMPTY,
    data: result.value,
  };
};

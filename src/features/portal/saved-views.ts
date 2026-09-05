import type { PortalOrder } from "./types";

export type OrderViewMode = "all" | "in-motion" | "needs-attention";
export type OrderSortMode = "newest" | "oldest" | "highest-total";

export type OrderViewCriteria = {
  query: string;
  statusFilter: PortalOrder["status"] | "ALL";
  view: OrderViewMode;
  sort: OrderSortMode;
};

export type SavedOrderView = {
  id: string;
  name: string;
  isSystem?: boolean;
  criteria: OrderViewCriteria;
};

export type SupportViewMode = "all" | "needs-attention" | "open" | "resolved";

export type SupportViewCriteria = {
  query: string;
  filter: SupportViewMode;
};

export type SavedSupportView = {
  id: string;
  name: string;
  isSystem?: boolean;
  criteria: SupportViewCriteria;
};

export const SYSTEM_ORDER_VIEWS: readonly SavedOrderView[] = [
  {
    id: "sys-orders-all",
    name: "All orders",
    isSystem: true,
    criteria: {
      query: "",
      statusFilter: "ALL",
      view: "all",
      sort: "newest",
    },
  },
  {
    id: "sys-orders-in-motion",
    name: "In motion",
    isSystem: true,
    criteria: {
      query: "",
      statusFilter: "ALL",
      view: "in-motion",
      sort: "newest",
    },
  },
  {
    id: "sys-orders-attention",
    name: "Needs attention",
    isSystem: true,
    criteria: {
      query: "",
      statusFilter: "ALL",
      view: "needs-attention",
      sort: "newest",
    },
  },
] as const;

export const SYSTEM_SUPPORT_VIEWS: readonly SavedSupportView[] = [
  {
    id: "sys-support-all",
    name: "All tickets",
    isSystem: true,
    criteria: {
      query: "",
      filter: "all",
    },
  },
  {
    id: "sys-support-attention",
    name: "Needs attention",
    isSystem: true,
    criteria: {
      query: "",
      filter: "needs-attention",
    },
  },
  {
    id: "sys-support-open",
    name: "Open & in review",
    isSystem: true,
    criteria: {
      query: "",
      filter: "open",
    },
  },
  {
    id: "sys-support-resolved",
    name: "Resolved",
    isSystem: true,
    criteria: {
      query: "",
      filter: "resolved",
    },
  },
] as const;

export const areOrderCriteriaEqual = (
  first: OrderViewCriteria,
  second: OrderViewCriteria,
): boolean => {
  if (first.query.trim().toLowerCase() !== second.query.trim().toLowerCase()) {
    return false;
  }
  if (first.statusFilter !== second.statusFilter) {
    return false;
  }
  if (first.view !== second.view) {
    return false;
  }
  if (first.sort !== second.sort) {
    return false;
  }
  return true;
};

export const areSupportCriteriaEqual = (
  first: SupportViewCriteria,
  second: SupportViewCriteria,
): boolean => {
  if (first.query.trim().toLowerCase() !== second.query.trim().toLowerCase()) {
    return false;
  }
  if (first.filter !== second.filter) {
    return false;
  }
  return true;
};

const getStorageKey = (domain: "orders" | "support", unitId: string): string =>
  `buddas_portal_views_${domain}_${unitId}`;

export const loadCustomViews = <T extends { id: string; name: string }>(
  domain: "orders" | "support",
  unitId: string,
): T[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(getStorageKey(domain, unitId));
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
};

export const saveCustomView = <T extends { id: string; name: string }>(
  domain: "orders" | "support",
  unitId: string,
  newView: T,
): T[] => {
  const existing = loadCustomViews<T>(domain, unitId);
  const updated = [...existing.filter((item) => item.id !== newView.id), newView];
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        getStorageKey(domain, unitId),
        JSON.stringify(updated),
      );
    } catch {
      // Storage unavailable or quota exceeded
    }
  }
  return updated;
};

export const deleteCustomView = <T extends { id: string; name: string }>(
  domain: "orders" | "support",
  unitId: string,
  viewId: string,
): T[] => {
  const existing = loadCustomViews<T>(domain, unitId);
  const updated = existing.filter((item) => item.id !== viewId);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        getStorageKey(domain, unitId),
        JSON.stringify(updated),
      );
    } catch {
      // Storage unavailable
    }
  }
  return updated;
};

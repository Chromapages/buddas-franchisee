import { ORDER_STATUS_IDS, type PortalOrderStatus } from "./order-status.ts";

export type OrdersListView = "all" | "in-motion" | "needs-attention";
export type OrdersListSort = "newest" | "oldest" | "highest-total";

export type OrdersListQuery = {
  query: string;
  status: PortalOrderStatus | "ALL";
  sort: OrdersListSort;
  view: OrdersListView;
};

export const DEFAULT_ORDERS_LIST_QUERY: OrdersListQuery = {
  query: "",
  status: "ALL",
  sort: "newest",
  view: "all",
};

type SearchParams = Record<string, string | string[] | undefined>;

const value = (params: SearchParams, key: string) => typeof params[key] === "string" ? params[key] : "";

export const parseOrdersListQuery = (params: SearchParams): OrdersListQuery => {
  const query = value(params, "q").trim().slice(0, 120);
  const status = value(params, "status");
  const sort = value(params, "sort");
  const view = value(params, "view");
  return {
    query,
    status: status === "ALL" || ORDER_STATUS_IDS.includes(status as PortalOrderStatus) ? status as PortalOrderStatus | "ALL" : DEFAULT_ORDERS_LIST_QUERY.status,
    sort: sort === "oldest" || sort === "highest-total" ? sort : DEFAULT_ORDERS_LIST_QUERY.sort,
    view: view === "in-motion" || view === "needs-attention" ? view : DEFAULT_ORDERS_LIST_QUERY.view,
  };
};

export const serializeOrdersListQuery = (query: OrdersListQuery): string => {
  const params = new URLSearchParams();
  if (query.query) params.set("q", query.query);
  if (query.status !== "ALL") params.set("status", query.status);
  if (query.sort !== "newest") params.set("sort", query.sort);
  if (query.view !== "all") params.set("view", query.view);
  return params.toString();
};

export const ordersListHref = (query: OrdersListQuery): string => {
  const serialized = serializeOrdersListQuery(query);
  return serialized ? `/portal/orders?${serialized}` : "/portal/orders";
};

export const ordersListScrollKey = (locationId: string, query: OrdersListQuery) =>
  `buddas-orders-scroll:${locationId}:${serializeOrdersListQuery(query) || "default"}`;

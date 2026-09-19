import type { PortalBulletin, PortalOrder, PortalSupportCase } from "./types.ts";
import { isBulletinActionOutstanding } from "./bulletins.ts";
import { getOrderStatus, isOrderInMotion } from "./order-status.ts";

export type DashboardOperationalCategory = "ATTENTION" | "ACTIVE";
export type DashboardOperationalPriority = "P0_BLOCKING" | "P1_ACTION_REQUIRED" | "P2_ACTIVE";
export type DashboardOperationalType = "required-update" | "support-reply" | "support-request" | "supply-order" | "growth-request";

export type DashboardOperationalItem = {
  id: string;
  type: DashboardOperationalType;
  category: DashboardOperationalCategory;
  priority: DashboardOperationalPriority;
  label: string;
  secondaryText: string;
  destination: string;
  requiresAction: boolean;
  dueAt?: string;
  locationId: string;
};

export type DashboardOperationalState = {
  attention: DashboardOperationalItem[];
  active: DashboardOperationalItem[];
};

const priorityRank: Record<DashboardOperationalPriority, number> = {
  P0_BLOCKING: 0,
  P1_ACTION_REQUIRED: 1,
  P2_ACTIVE: 2,
};

const validDate = (value: string | undefined) => value && Number.isFinite(Date.parse(value)) ? value : undefined;

const fulfillmentWindowBusinessDays = (eta: string | undefined) => {
  const match = eta?.match(/(?:\d+\s*[-–]\s*)?(\d+)\s*business\s*days?/i);
  const value = Number(match?.[1]);
  return Number.isInteger(value) && value > 0 ? value : null;
};

const businessDaysElapsed = (from: string, now: Date) => {
  const started = new Date(from);
  if (!Number.isFinite(started.getTime())) return null;
  const cursor = new Date(Date.UTC(started.getUTCFullYear(), started.getUTCMonth(), started.getUTCDate()));
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  let elapsed = 0;
  while (cursor < today) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) elapsed += 1;
  }
  return elapsed;
};

const sortItems = (items: DashboardOperationalItem[]) => [...items].sort((left, right) => {
  const priorityDifference = priorityRank[left.priority] - priorityRank[right.priority];
  if (priorityDifference) return priorityDifference;
  const leftDue = left.dueAt ? Date.parse(left.dueAt) : Number.POSITIVE_INFINITY;
  const rightDue = right.dueAt ? Date.parse(right.dueAt) : Number.POSITIVE_INFINITY;
  return leftDue - rightDue;
});

/** Maps authorized operational records into the two Dashboard states. */
export const buildDashboardOperationalState = ({
  orders,
  supportCases,
  bulletins,
  locationId,
  now = new Date(),
}: {
  orders: PortalOrder[];
  supportCases: PortalSupportCase[];
  bulletins: PortalBulletin[];
  locationId: string;
  now?: Date;
}): DashboardOperationalState => {
  const items: DashboardOperationalItem[] = [
    ...bulletins.flatMap((bulletin): DashboardOperationalItem[] => {
      if (!isBulletinActionOutstanding(bulletin)) return [];
      return [{
        id: `bulletin:${bulletin.id}`,
        type: "required-update",
        category: "ATTENTION",
        priority: "P1_ACTION_REQUIRED",
        label: bulletin.title,
        secondaryText: "Acknowledgement required",
        destination: `/portal/bulletins?bulletinId=${encodeURIComponent(bulletin.id)}`,
        requiresAction: true,
        dueAt: validDate(bulletin.acknowledgement?.dueAt),
        locationId,
      }];
    }),
    ...supportCases.flatMap((ticket): DashboardOperationalItem[] => {
      if (ticket.status === "Resolved") return [];
      if (ticket.operatorActionRequired) return [{
        id: `support:${ticket.id}`,
        type: "support-reply",
        category: "ATTENTION",
        priority: "P1_ACTION_REQUIRED",
        label: "Support reply",
        secondaryText: "Response required",
        destination: `/portal/support?ticketId=${encodeURIComponent(ticket.id)}`,
        requiresAction: true,
        locationId: ticket.locationId,
      }];
      return [{
        id: `support:${ticket.id}`,
        type: "support-request",
        category: "ACTIVE",
        priority: "P2_ACTIVE",
        label: "Support request",
        secondaryText: ticket.status,
        destination: `/portal/support?ticketId=${encodeURIComponent(ticket.id)}`,
        requiresAction: false,
        locationId: ticket.locationId,
      }];
    }),
    ...orders.flatMap((order): DashboardOperationalItem[] => {
      const status = getOrderStatus(order.status);
      const expectedBusinessDays = fulfillmentWindowBusinessDays(order.eta);
      const elapsedBusinessDays = expectedBusinessDays ? businessDaysElapsed(order.createdAt, now) : null;
      if (order.status === "PROCESSING" && expectedBusinessDays !== null && elapsedBusinessDays !== null && elapsedBusinessDays > expectedBusinessDays) return [{
        id: `order:${order.id}`,
        type: "supply-order",
        category: "ATTENTION",
        priority: "P1_ACTION_REQUIRED",
        label: `Order ${order.id}`,
        secondaryText: `Processing beyond expected ${order.eta}`,
        destination: `/portal/orders?orderId=${encodeURIComponent(order.id)}`,
        requiresAction: true,
        locationId: order.locationId,
      }];
      if (order.status === "FAILED" || status.operatorActionRequired) return [{
        id: `order:${order.id}`,
        type: "supply-order",
        category: "ATTENTION",
        priority: "P1_ACTION_REQUIRED",
        label: `Order ${order.id}`,
        secondaryText: status.label,
        destination: `/portal/orders?orderId=${encodeURIComponent(order.id)}`,
        requiresAction: true,
        locationId: order.locationId,
      }];
      if (!isOrderInMotion(order.status)) return [];
      return [{
        id: `order:${order.id}`,
        type: "supply-order",
        category: "ACTIVE",
        priority: "P2_ACTIVE",
        label: "Supply order",
        secondaryText: status.label,
        destination: `/portal/orders?orderId=${encodeURIComponent(order.id)}`,
        requiresAction: false,
        locationId: order.locationId,
      }];
    }),
  ];

  return {
    attention: sortItems(items.filter((item) => item.category === "ATTENTION")),
    active: sortItems(items.filter((item) => item.category === "ACTIVE")),
  };
};

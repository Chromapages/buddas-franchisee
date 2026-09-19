import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, ArrowRight, CheckCircle2, Clock3, Info, Package } from "lucide-react";
import type { DashboardDataState } from "@/src/features/portal/dashboard-data-state";
import { OperatorAnalyticsLink, type OperatorAnalyticsEvent } from "@/src/components/portal/operator-analytics";
import type { OperatorAnalyticsProperties } from "@/src/lib/analytics";
import type { DashboardOperationalItem } from "@/src/features/portal/dashboard-attention";

export type AttentionPriority = "overdue" | "blocking" | "due-today" | "action-required" | "due-soon" | "informational";

export type OperatorAttentionItem = {
  id: string;
  category: string;
  title: string;
  status: string;
  dueLabel?: string;
  dueDateTime?: string;
  href: string;
  accessibleStateLabel: string;
  priority: AttentionPriority;
  icon: LucideIcon;
  analyticsType: NonNullable<OperatorAnalyticsProperties["attention_type"]>;
  orderStatusCategory?: NonNullable<OperatorAnalyticsProperties["order_status_category"]>;
};

const countLabel = (count: number) => count > 99 ? "99+" : String(count);

export const StatusBadge = ({ label, priority }: { label: string; priority: AttentionPriority }) => {
  const Icon = priority === "overdue" || priority === "blocking"
    ? AlertCircle
    : priority === "due-today" || priority === "due-soon"
      ? Clock3
      : priority === "informational"
        ? Info
        : AlertCircle;
  return <span className="operator-status-badge" data-priority={priority}><Icon size={13} aria-hidden="true" />{label}</span>;
};

export const AllClearState = ({ headingId, desktop = false }: { headingId: string; desktop?: boolean }) => <div className="operator-all-clear"><CheckCircle2 size={22} aria-hidden="true" /><div><h2 id={headingId}>{desktop ? "Nothing needs attention" : "You’re caught up"}</h2><p>{desktop ? "You’re all clear right now." : "No action needed right now."}</p></div></div>;

const activeTitle = (items: DashboardOperationalItem[]) => {
  if (!items.length) return "No active work";
  if (items.every((item) => item.type === "supply-order")) return `${countLabel(items.length)} ${items.length === 1 ? "supply order" : "supply orders"} in motion`;
  if (items.length === 1) return `${items[0].secondaryText} ${items[0].label.toLowerCase()}`;
  return `${countLabel(items.length)} active workflows`;
};

const activeWorkEvents = (activeItems: DashboardOperationalItem[]): OperatorAnalyticsEvent[] => [{
  event: "operator_active_work_opened",
  properties: {
    module_id: "operator-status",
    active_work_count: activeItems.length,
    ...(activeItems.every((item) => item.type === "supply-order") ? { route: "/portal/orders" as const } : {}),
  },
}];

const ActiveWorkLink = ({ activeItems }: { activeItems: DashboardOperationalItem[] }) => activeItems.length ? <OperatorAnalyticsLink className="operator-active-work" href={activeItems.every((item) => item.type === "supply-order") ? "/portal/orders?view=in-motion" : activeItems[0].destination} events={activeWorkEvents(activeItems)}><Package size={16} aria-hidden="true" /><span><small>Active work</small><strong>{activeTitle(activeItems)}</strong></span></OperatorAnalyticsLink> : null;

export const ActiveWorkPanel = ({ activeItems }: { activeItems: DashboardOperationalItem[] }) => {
  const onlySupplyOrders = activeItems.length > 0 && activeItems.every((item) => item.type === "supply-order");
  return <section className="desktop-active-work" aria-labelledby="desktop-active-work-heading"><p className="home-section-label">Active work</p><h2 id="desktop-active-work-heading">{activeTitle(activeItems)}</h2>{activeItems.length === 1 ? <OperatorAnalyticsLink href={onlySupplyOrders ? "/portal/orders?view=in-motion" : activeItems[0].destination} events={activeWorkEvents(activeItems)}><Package size={18} aria-hidden="true" /><span>{onlySupplyOrders ? "View orders in motion" : `View ${activeItems[0].label.toLowerCase()}`}</span><ArrowRight size={16} aria-hidden="true" /></OperatorAnalyticsLink> : activeItems.length > 1 ? <ul>{activeItems.slice(0, 2).map((item) => <li key={item.id}><OperatorAnalyticsLink href={item.destination} events={activeWorkEvents(activeItems)}><span>{item.label}</span><small>{item.secondaryText}</small><ArrowRight size={16} aria-hidden="true" /></OperatorAnalyticsLink></li>)}</ul> : <p>No work is progressing right now.</p>}</section>;
};

export const OperatorStatusSummary = ({
  attentionCount,
  activeItems,
  state,
  idPrefix,
  children,
  showActiveWork = true,
  desktopAllClear = false,
  attentionContent,
}: {
  attentionCount: number;
  activeItems: DashboardOperationalItem[];
  state: DashboardDataState;
  idPrefix: string;
  children?: ReactNode;
  showActiveWork?: boolean;
  desktopAllClear?: boolean;
  attentionContent?: ReactNode;
}) => <section className="home-status" data-dashboard-state={state} aria-labelledby={`${idPrefix}-status-heading`}>
  <p className="home-section-label">Right now</p>
  {state === "partial-error" || state === "unconfigured" || state === "permission-unavailable"
    ? <div className="operator-status-unavailable"><AlertCircle size={22} aria-hidden="true" /><div><h2 id={`${idPrefix}-status-heading`}>Status partly unavailable</h2><p>Some monitored information could not be confirmed.</p></div></div>
    : attentionCount
      ? <div className="operator-status-attention"><AlertCircle size={22} aria-hidden="true" /><div><h2 id={`${idPrefix}-status-heading`}>{countLabel(attentionCount)} {attentionCount === 1 ? "item needs" : "items need"} your attention</h2><p>Review the highest-priority items below.</p></div></div>
      : <AllClearState headingId={`${idPrefix}-status-heading`} desktop={desktopAllClear} />}
  {showActiveWork ? <ActiveWorkLink activeItems={activeItems} /> : null}
  {children}
  {attentionContent}
</section>;

export const AttentionItem = ({ item }: { item: OperatorAttentionItem }) => {
  const Icon = item.icon;
  const route = item.analyticsType === "required_update" ? "/portal/bulletins" as const : item.analyticsType === "support_reply" ? "/portal/support" as const : "/portal/orders" as const;
  const events: OperatorAnalyticsEvent[] = [{ event: "operator_attention_item_opened", properties: { attention_type: item.analyticsType, module_id: "operator-status", route } }];
  if (item.analyticsType === "required_update") events.push({ event: "operator_bulletin_opened", properties: { module_id: "operator-status", route } });
  if (item.analyticsType === "support_reply") events.push({ event: "operator_support_opened", properties: { module_id: "operator-status", route } });
  if (item.analyticsType === "order_exception") events.push({ event: "operator_order_opened", properties: { module_id: "operator-status", route, order_status_category: item.orderStatusCategory } });
  return <li><OperatorAnalyticsLink href={item.href} events={events} ariaLabel={`${item.category}: ${item.title}. ${item.accessibleStateLabel}${item.dueLabel ? `. ${item.dueLabel}` : ""}.`}><Icon size={19} aria-hidden="true" /><span className="operator-attention-copy"><small>{item.category}</small><strong>{item.title}</strong><span><StatusBadge label={item.status} priority={item.priority} />{item.dueLabel ? <time dateTime={item.dueDateTime}>{item.dueLabel}</time> : null}</span></span></OperatorAnalyticsLink></li>;
};

export const AttentionList = ({ items, idPrefix, limit = 4, embedded = false }: { items: OperatorAttentionItem[]; idPrefix: string; limit?: number; embedded?: boolean }) => {
  if (!items.length) return null;
  const visibleItems = items.slice(0, limit);
  if (embedded) return <div className="desktop-attention-list"><ul aria-label={`${countLabel(items.length)} attention ${items.length === 1 ? "item" : "items"}`}>{visibleItems.map((item) => <AttentionItem key={item.id} item={item} />)}</ul>{items.length > limit ? <p className="operator-attention-overflow">Showing the {limit} highest-priority items.</p> : null}</div>;
  return <section className="home-attention" aria-labelledby={`${idPrefix}-attention-heading`}><header><div><p className="home-section-label">Next actions</p><h2 id={`${idPrefix}-attention-heading`}>Needs attention</h2></div><span aria-label={`${countLabel(items.length)} ${items.length === 1 ? "item" : "items"}`}>{countLabel(items.length)}</span></header><ul>{visibleItems.map((item) => <AttentionItem key={item.id} item={item} />)}</ul>{items.length > limit ? <p className="operator-attention-overflow">Showing the {limit} highest-priority items.</p> : null}</section>;
};

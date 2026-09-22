"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BookOpen, Headphones, Package, ShoppingCart } from "lucide-react";
import { usePortalContext } from "@/src/features/portal/portal-context";
import { trackOperatorWorkspaceEvent, type OperatorAnalyticsProperties, type OperatorWorkspaceEvent } from "@/src/lib/analytics";
import type { DashboardCapabilityFlags, DashboardModuleSurface } from "@/src/features/portal/dashboard-authorization";
import { OperatorDashboardModuleViewed } from "./operator-analytics";

type QuickAction = { id: string; href: string; label: string; detail: string; icon: ReactNode; primary?: boolean; disabled?: boolean; analytics: Array<{ event: OperatorWorkspaceEvent; properties?: OperatorAnalyticsProperties }> };

const QuickActionLink = ({ action }: { action: QuickAction }) => {
  const className = `home-tool-action${action.primary ? " home-tool-primary" : ""}`;
  const content = <>{action.icon}<span><strong>{action.label}</strong><small>{action.detail}</small></span><ArrowRight className="home-tool-arrow" size={17} aria-hidden="true" /></>;
  const actionId = (action.id === "resources" ? "resource_center" : action.id.replace(/-/g, "_")) as NonNullable<OperatorAnalyticsProperties["action_id"]>;
  return action.disabled ? <span className={className} aria-disabled="true">{content}</span> : <Link className={className} href={action.href} onClick={() => action.analytics.forEach(({ event, properties }) => trackOperatorWorkspaceEvent(event, { ...properties, module_id: "quick-actions", action_id: actionId }))}>{content}</Link>;
};

export const QuickActions = ({ capabilities, idPrefix, surface }: { capabilities: DashboardCapabilityFlags; idPrefix: string; surface: DashboardModuleSurface }) => {
  const { counts, user, permittedUnits } = usePortalContext();
  const hasCart = capabilities["supplies.order"] && counts.cartItemCount !== null && counts.cartItemCount > 0;
  const actions: QuickAction[] = [];
  if (hasCart) actions.push({ id: "resume-order", href: "/portal/cart", label: "Resume order", detail: `${counts.cartItemCount} ${counts.cartItemCount === 1 ? "item" : "items"} in cart`, icon: <ShoppingCart size={19} aria-hidden="true" />, primary: true, analytics: [{ event: "operator_quick_action_selected", properties: { quick_action: "resume_order", route: "/portal/cart" } }] });
  else if (capabilities["supplies.order"]) actions.push({ id: "order-supplies", href: "/portal/supplies", label: "Order supplies", detail: "Browse approved items", icon: <Package size={19} aria-hidden="true" />, primary: true, analytics: [{ event: "operator_quick_action_selected", properties: { quick_action: "order_supplies", route: "/portal/supplies" } }] });
  if (capabilities["resources.view"]) actions.push({ id: "resources", href: "/portal/resources", label: "Resource Center", detail: "Manuals and SOPs", icon: <BookOpen size={19} aria-hidden="true" />, analytics: [{ event: "operator_quick_action_selected", properties: { quick_action: "resource_center", route: "/portal/resources" } }, { event: "operator_resource_center_opened", properties: { route: "/portal/resources" } }] });
  if (surface === "desktop" && capabilities["support.create"]) actions.push({ id: "get-support", href: "/portal/support", label: "Contact support", detail: "Get fulfillment help", icon: <Headphones size={19} aria-hidden="true" />, analytics: [{ event: "operator_quick_action_selected", properties: { quick_action: "get_support", route: "/portal/support" } }] });
  if (actions.length < 2) return null;
  const context = { role_category: user.role === "admin" ? "admin" as const : "franchisee" as const, location_scope_count: permittedUnits.length };
  return <section className={`home-tools home-tools-${surface}`} aria-labelledby={`${idPrefix}-tools-heading`}><OperatorDashboardModuleViewed moduleId="quick-actions" surface={surface} /><div className="home-tools-heading"><p className="home-section-label">{surface === "mobile" ? "Quick actions" : "Frequent tools"}</p><h2 id={`${idPrefix}-tools-heading`}>Quick actions</h2></div><div className="home-tools-list">{actions.slice(0, 4).map((action) => <QuickActionLink key={action.id} action={{ ...action, analytics: action.analytics.map((item) => ({ ...item, properties: { ...context, ...item.properties } })) }} />)}</div></section>;
};

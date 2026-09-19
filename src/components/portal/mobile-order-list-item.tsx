"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { PortalOrder } from "@/src/features/portal/types";
import { getOrderStatusPresentation } from "@/src/features/portal/order-status-presentation";
import { OrderStatusIcon } from "@/src/components/portal/order-status-icon";

type MobileOrderListItemProps = {
  order: PortalOrder;
  href: string;
  searchQuery: string;
  onOpen: () => void;
};

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export const MobileOrderListItem = ({ order, href, searchQuery, onOpen }: MobileOrderListItemProps) => {
  const presentation = getOrderStatusPresentation(order.status, order.eta);
  const attentionRequired = presentation.exception?.actionRequired === true;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const invoiceMatched = Boolean(normalizedQuery && order.invoiceId.toLowerCase().includes(normalizedQuery) && !order.id.toLowerCase().includes(normalizedQuery));
  const itemLabel = `${order.items.length} ${order.items.length === 1 ? "item" : "items"}`;
  const badgeLabel = attentionRequired ? "Action required" : presentation.primary.label;
  return <Link
    href={href}
    className={`mobile-order-list-item mobile-order-list-item--${attentionRequired ? "attention" : presentation.primary.semantic}`}
    aria-label={`Open order ${order.id}. ${attentionRequired ? "Action required. " : ""}${presentation.primary.accessibleLabel}. ${presentation.nextStep}. ${itemLabel}. Total ${money(order.total)}.`}
    onClick={onOpen}
  >
    <div className="mobile-order-list-item__top"><strong>Order {order.id}</strong><strong>{money(order.total)}</strong></div>
    <div className="mobile-order-list-item__state"><span><OrderStatusIcon icon={attentionRequired ? "alert" : presentation.primary.icon} />{badgeLabel}</span>{invoiceMatched ? <small>Invoice {order.invoiceId}</small> : null}</div>
    <div className="mobile-order-list-item__bottom"><span>{presentation.nextStep}</span><span>{itemLabel}</span><ChevronRight aria-hidden="true" /></div>
  </Link>;
};

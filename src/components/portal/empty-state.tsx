import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

export type PortalEmptyStateSize = "compact" | "standard" | "full-page";

export const PortalEmptyState = ({
  title,
  description,
  size = "standard",
  action,
}: {
  title: string;
  description?: string;
  size?: PortalEmptyStateSize;
  action?: ReactNode;
}) => <div className={`portal-state-empty portal-state-empty-${size}`} role="status"><CheckCircle2 size={size === "compact" ? 18 : 22} aria-hidden="true" /><div><p>{title}</p>{description ? <span>{description}</span> : null}</div>{action}</div>;

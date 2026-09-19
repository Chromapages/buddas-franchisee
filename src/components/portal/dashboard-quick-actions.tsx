import { QuickActions } from "./dashboard-quick-actions-client";
import type { DashboardCapabilityFlags, DashboardModuleSurface } from "@/src/features/portal/dashboard-authorization";

export const DashboardQuickActions = async ({
  capabilities,
  idPrefix,
  surface,
}: {
  capabilities: DashboardCapabilityFlags;
  idPrefix: string;
  surface: DashboardModuleSurface;
}) => {
  return <QuickActions idPrefix={idPrefix} surface={surface} capabilities={capabilities} />;
};

export const QuickActionsSkeleton = ({ idPrefix }: { idPrefix: string }) => <section className="home-tools home-tools-skeleton" aria-labelledby={`${idPrefix}-tools-heading`} aria-busy="true"><div className="home-tools-heading"><p className="home-section-label">Frequent tools</p><h2 id={`${idPrefix}-tools-heading`}>Quick actions</h2></div><div /><span className="sr-only" role="status">Loading quick actions</span></section>;

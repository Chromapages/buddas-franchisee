import { Suspense } from "react";
import Link from "next/link";
import { AlertCircle, HelpCircle, Package, Store } from "lucide-react";
import { DashboardRefresh } from "@/src/components/portal/dashboard-refresh";
import { defaultPortalStorage, isUsingInMemoryPortalStorage } from "@/src/features/portal/storage-adapter";
import {
  BulletinModule,
  BulletinModuleSkeleton,
  NeedsAttentionModule,
  NeedsAttentionSkeleton,
  OperationalPulseModule,
  OperationalPulseSkeleton,
  RecentOrdersModule,
  RecentOrdersSkeleton,
} from "@/src/components/portal/dashboard-modules";
import { PortalDataBoundary } from "@/src/components/portal/portal-data-boundary";
import { getPortalEnvironmentNotice } from "@/src/features/portal/environment";
import { loadPortalModule } from "@/src/features/portal/module-loader";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PortalDashboardPage() {
  const session = await requirePortalPermission("ACCESS_WORKSPACE");
  const orders = loadPortalModule("dashboard orders", () => defaultPortalStorage.getOrdersByLocation(session.locationId));
  const bulletins = loadPortalModule("dashboard bulletins", () => defaultPortalStorage.getBulletinsForSession(session));
  const supportCases = loadPortalModule("dashboard support", () => defaultPortalStorage.getSupportCasesByLocation(session.locationId));
  const dashboardGreeting = session.displayName ? `Aloha, ${session.displayName}.` : "Aloha. Welcome to your workspace.";
  const environmentNotice = getPortalEnvironmentNotice();

  return (
    <div className="operator-dashboard">
      <section className="dashboard-header">
        <div className="dashboard-header-top">
          <div>
            <p className="dashboard-eyebrow">Operator Workspace</p>
            <h1>Dashboard</h1>
            <p className="dashboard-greeting">{dashboardGreeting} Here’s your unit at a glance.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link href="/portal/supplies" className="touch-target btn-primary inline-flex items-center gap-2 !px-4 !py-2 text-xs font-bold uppercase tracking-wider">
              <Package className="h-4 w-4" aria-hidden="true" />Order supplies
            </Link>
            <Link href="/portal/support" className="dashboard-support-action">
              <HelpCircle className="h-4 w-4" aria-hidden="true" />Get support
            </Link>
          </div>
        </div>
        <div className="dashboard-context"><p><Store size={18} aria-hidden="true" /><span>Working unit <strong>{session.locationName}</strong><span className="dashboard-unit-id">{session.locationId}</span></span></p><DashboardRefresh /></div>
      </section>

      {environmentNotice ? (
        <p role="status" className="flex items-start gap-2 rounded-xl border border-bds-teal/30 bg-bds-cream px-4 py-3 text-sm text-bds-cocoa/85">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-bds-teal-dark" aria-hidden="true" />
          <span><strong>{isUsingInMemoryPortalStorage ? "Development-only data." : "Non-production environment."}</strong> {environmentNotice}</span>
        </p>
      ) : null}

      <PortalDataBoundary title="Needs your attention could not be loaded" description="Actionable order, support, or bulletin updates are temporarily unavailable.">
        <Suspense fallback={<NeedsAttentionSkeleton />}><NeedsAttentionModule session={session} orders={orders} bulletins={bulletins} supportCases={supportCases} /></Suspense>
      </PortalDataBoundary>

      <PortalDataBoundary title="Operational pulse could not be loaded" description="Current orders, support tickets, or required updates could not be retrieved.">
        <Suspense fallback={<OperationalPulseSkeleton />}><OperationalPulseModule session={session} orders={orders} supportCases={supportCases} bulletins={bulletins} /></Suspense>
      </PortalDataBoundary>

      <div className="dashboard-streams">
        <PortalDataBoundary title="Recent orders could not be loaded" description="Order history is temporarily unavailable. Try again in a moment.">
          <Suspense fallback={<RecentOrdersSkeleton />}><RecentOrdersModule orders={orders} locationId={session.locationId} /></Suspense>
        </PortalDataBoundary>
        <PortalDataBoundary title="Operations bulletins could not be loaded" description="Current operational communication is temporarily unavailable.">
          <Suspense fallback={<BulletinModuleSkeleton />}><BulletinModule session={session} bulletins={bulletins} /></Suspense>
        </PortalDataBoundary>
      </div>
    </div>
  );
}

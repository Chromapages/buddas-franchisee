import type { Metadata } from "next";
import "./operator-mobile.css";
import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { getPortalSession } from "@/src/features/auth/session";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { readDashboardBulletins, readDashboardSupport } from "@/src/features/portal/dashboard-reads";
import { PortalShell } from "@/src/components/portal/portal-shell";
import { assertPortalPermission, hasPortalPermission } from "@/src/features/portal/authorization";
import { getPortalCart } from "@/src/features/portal/cart";
import { getVisibleBulletins, isBulletinActionOutstanding } from "@/src/features/portal/bulletins";
import { PortalProvider, type ScopedNotificationCounts } from "@/src/features/portal/portal-context";
import { PortalCountsUpdate } from "@/src/components/portal/portal-counts-update";
import { WebVitalsReporter } from "@/src/components/public/web-vitals-reporter";

// Portal content is scoped by authenticated user, role, and active unit.
// Never place it in the shared route or data cache.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

async function StreamedCount({ countKey, result }: {
  countKey: keyof ScopedNotificationCounts;
  result: Promise<number | null>;
}) {
  return <PortalCountsUpdate countKey={countKey} value={await result} />;
}

export const metadata: Metadata = {
  title: {
    default: "Dashboard | Budda's Operator Portal",
    template: "%s | Budda's Operator Portal",
  },
  description: "Authorized operational workspace for Budda's franchise operators.",
  openGraph: null,
  twitter: null,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "none",
      "max-snippet": -1,
    },
  },
};

export default async function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getPortalSession();

  if (!session) {
    redirect("/franchise/login");
  }
  assertPortalPermission(session, "ACCESS_WORKSPACE");

  const canManageCart = hasPortalPermission(session, "MANAGE_CART");
  const canViewSupport = hasPortalPermission(session, "VIEW_SUPPORT");
  const canViewBulletins = hasPortalPermission(session, "ACCESS_WORKSPACE");
  // Start independent reads together, but do not hold the shell for badge data.
  const locationRequest = Promise.all(session.managedLocationIds.map((locationId) => defaultPortalStorage.getLocationById(locationId)));
  const cartCount = canManageCart ? getPortalCart(session).then(
    (items) => items.reduce((total, item) => total + item.quantity, 0), () => null,
  ) : Promise.resolve(null);
  const supportCount = canViewSupport ? readDashboardSupport(session.locationId).then(
    (tickets) => tickets.filter((ticket) => ticket.status !== "Resolved" && ticket.operatorActionRequired === true).length, () => null,
  ) : Promise.resolve(null);
  const bulletinResult = canViewBulletins ? Promise.allSettled([readDashboardBulletins(session)]).then(([result]) => result) : Promise.resolve(undefined);
  const locationRecords = await locationRequest;

  const locations = locationRecords.filter((location): location is NonNullable<typeof location> => location !== null);

  const activeLocation =
    locations.find((location) => location.id === session.locationId) ?? null;
  if (!activeLocation) {
    redirect("/franchise/login");
  }
  const bulletinCount = bulletinResult.then((result) => result?.status === "fulfilled"
    ? getVisibleBulletins(result.value, session.locationId, session.role, activeLocation).filter(isBulletinActionOutstanding).length
    : null);

  return (
    <PortalProvider
      key={`${session.userId}:${session.locationId}:${session.role}`}
      initialUser={{
        id: session.userId,
        email: session.email,
        role: session.role,
        displayName: session.displayName,
      }}
      permittedUnits={locations}
      activeUnit={{
        id: session.locationId,
        name: session.locationName,
      }}
    >
      <WebVitalsReporter />
      <PortalShell key={`${session.userId}:${session.locationId}:${session.role}`} session={session} locations={locations}>
        <Suspense fallback={null}><StreamedCount countKey="cartItemCount" result={cartCount} /></Suspense>
        <Suspense fallback={null}><StreamedCount countKey="actionRequiredSupportCount" result={supportCount} /></Suspense>
        <Suspense fallback={null}><StreamedCount countKey="actionRequiredBulletinCount" result={bulletinCount} /></Suspense>
        {children}
      </PortalShell>
    </PortalProvider>
  );
}

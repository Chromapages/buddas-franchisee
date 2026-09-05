import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getPortalSession } from "@/src/features/auth/session";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { PortalShell } from "@/src/components/portal/portal-shell";
import { canAccessLocation } from "@/src/lib/auth/auth-provider";
import { assertPortalPermission } from "@/src/features/portal/authorization";
import { getPortalCart } from "@/src/features/portal/cart";
import { getVisibleBulletins, requiresBulletinAction } from "@/src/features/portal/bulletins";
import { PortalProvider } from "@/src/features/portal/portal-context";

export const metadata = {
  title: "Operator Portal — Budda's Workspace",
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

  const [allLocations, cartItems, supportCases, rawBulletins] = await Promise.all([
    defaultPortalStorage.getLocations(),
    getPortalCart(session).catch(() => []),
    defaultPortalStorage.getSupportCasesByLocation(session.locationId).catch(() => []),
    defaultPortalStorage.getBulletinsForSession(session).catch(() => []),
  ]);

  const locations = allLocations.filter((location) =>
    canAccessLocation(session, location.id),
  );

  const activeLocation =
    locations.find((location) => location.id === session.locationId) ?? null;
  const visibleBulletins = getVisibleBulletins(
    rawBulletins,
    session.locationId,
    session.role,
    activeLocation,
  );

  const initialCounts = {
    cartItemCount: cartItems.reduce((total, item) => total + item.quantity, 0),
    actionRequiredSupportCount: supportCases.filter(
      (ticket) => ticket.status !== "Resolved" && ticket.operatorActionRequired === true,
    ).length,
    actionRequiredBulletinCount: visibleBulletins.filter(requiresBulletinAction).length,
  };

  return (
    <PortalProvider
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
      initialCounts={initialCounts}
    >
      <PortalShell session={session} locations={locations}>
        {children}
      </PortalShell>
    </PortalProvider>
  );
}

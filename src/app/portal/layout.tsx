import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getPortalSession } from "@/src/features/auth/session";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { PortalShell } from "@/src/components/portal/portal-shell";

export const metadata = {
  title: "Operator Portal — Budda's Workspace",
  robots: {
    index: false,
    follow: false,
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

  const locations = await defaultPortalStorage.getLocations();

  return (
    <PortalShell session={session} locations={locations}>
      {children}
    </PortalShell>
  );
}

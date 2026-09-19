import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { isBulletinActionOutstanding } from "@/src/features/portal/bulletins";
import { InteractiveBulletinList } from "@/src/components/portal/interactive-bulletin-list";
import { PortalDataBoundary } from "@/src/components/portal/portal-data-boundary";
import { loadPortalModule } from "@/src/features/portal/module-loader";
import type { PortalSession } from "@/src/lib/auth/auth-provider";

export const metadata: Metadata = { title: "Operations Bulletins" };

export default async function BulletinsPage({ searchParams }: { searchParams: Promise<{ bulletinId?: string; view?: string }> }) {
  const session = await requirePortalPermission("ACCESS_WORKSPACE");
  const query = await searchParams;
  return <div className="bulletins-page portal-page-stack">
    <Link className="touch-target-inline w-fit text-bds-teal-dark underline" href="/portal">Back to Dashboard</Link>
    <header className="portal-page-header"><h1 className="portal-page-title">Corporate bulletins</h1><p>Operations updates for {session.locationName} · {session.locationId}</p></header>
    <PortalDataBoundary title="Bulletins unavailable" description="These updates could not be loaded. Try again."><Suspense fallback={<p role="status">Loading corporate bulletins…</p>}><BulletinRecords session={session} {...query} /></Suspense></PortalDataBoundary>
  </div>;
}

async function BulletinRecords({ session, bulletinId, view }: { session: PortalSession; bulletinId?: string; view?: string }) {
  const records = await loadPortalModule("corporate bulletins", () => defaultPortalStorage.getBulletinsForSession(session));
  const rows = records.filter((bulletin) => (!bulletinId || bulletin.id === bulletinId) && (view !== "required" || isBulletinActionOutstanding(bulletin)));
  return <><nav className="flex flex-wrap gap-4" aria-label="Bulletin views"><Link className="touch-target-inline underline" href="/portal/bulletins" aria-current={!bulletinId && view !== "required" ? "page" : undefined}>All current bulletins</Link><Link className="touch-target-inline underline" href="/portal/bulletins?view=required" aria-current={view === "required" ? "page" : undefined}>Required updates</Link></nav>{rows.length ? <InteractiveBulletinList key={session.userId + ":" + session.locationId + ":" + (bulletinId || view || "all")} bulletins={rows} locationId={session.locationId} /> : <p className="portal-empty-state">{bulletinId ? "This bulletin is no longer available for your unit." : view === "required" ? "No required updates are outstanding." : "No current bulletins for this unit."}</p>}</>;
}

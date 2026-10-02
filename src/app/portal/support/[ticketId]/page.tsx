import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { SupportWorkspace } from "@/src/components/portal/support-workspace";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { PortalDataBoundary } from "@/src/components/portal/portal-data-boundary";
import { loadPortalModule } from "@/src/features/portal/module-loader";
import { assertPortalPermission } from "@/src/features/portal/authorization";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";
import "../support-page.css";

export const metadata: Metadata = { title: "Support Request" };

export default async function SupportRequestPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const session = await requirePortalPermission("VIEW_SUPPORT");
  assertPortalPermission(session, "CREATE_SUPPORT");
  const { ticketId } = await params;
  return <div className="support-page portal-page-stack support-request-detail-page">
    <header className="support-page-heading support-request-detail-heading">
      <Link href="/portal/support" className="support-back-link"><ArrowLeft size={16} aria-hidden="true" />Back to support requests</Link>
      <span className="portal-page-eyebrow">Operations Support</span>
      <h1 className="portal-page-title">Support request</h1>
      <div className="support-location" aria-label={`Support request for ${session.locationName}, unit ${session.locationId}`}><MapPin aria-hidden="true" /><span><strong>{session.locationName}</strong><small>{session.locationId}</small></span></div>
    </header>
    <PortalDataBoundary title="Support request could not be loaded" description="This support request is temporarily unavailable for the active unit." className="min-h-48">
      <Suspense fallback={<SupportRequestFallback />}><SupportRequestModule locationId={session.locationId} locationName={session.locationName} ticketId={ticketId} /></Suspense>
    </PortalDataBoundary>
  </div>;
}

const SupportRequestModule = async ({ locationId, locationName, ticketId }: { locationId: string; locationName: string; ticketId: string }) => {
  const supportCases = await loadPortalModule("support-ticket detail", () => defaultPortalStorage.getSupportCasesByLocation(locationId));
  const ticket = supportCases.find((candidate) => candidate.id === ticketId);
  if (!ticket) return <section className="portal-empty-state"><h2>Support request unavailable</h2><p>This request is not available for the active unit.</p><Link href="/portal/support" className="btn-primary">Back to support requests</Link></section>;
  return <SupportWorkspace tickets={supportCases} locationId={locationId} locationName={locationName} initialTicketId={ticket.id} detailOnly />;
};

const SupportRequestFallback = () => <section aria-busy="true" className="portal-empty-state"><h2>Support request</h2><p>Loading this request…</p><span className="sr-only" role="status">Loading support request</span></section>;

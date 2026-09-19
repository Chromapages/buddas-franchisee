import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BookOpen, Plus, ShieldCheck } from "lucide-react";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";
import { getExpansionApplications } from "@/src/features/portal/expansion-records";
import { GrowthRequestsWorkspace } from "@/src/components/portal/growth-requests-workspace";
import "./growth-board.css";

export const metadata: Metadata = { title: "Growth Requests" };

export default async function ExpansionRequestsPage() {
  const session = await requirePortalPermission("ACCESS_WORKSPACE");
  const applications = await getExpansionApplications(session).catch(() => null);
  const isAdmin = session.role === "admin";

  return <div className="expansion-page growth-workspace growth-requests-page">
    <header className="growth-page-header growth-requests-page-header">
      <div><p className="portal-page-eyebrow">Portfolio growth</p><h1 className="portal-page-title">Growth requests</h1><p>Track proposed locations and follow each request through Franchise Development.</p></div>
      <div className="growth-page-actions">
        {!isAdmin ? <div><Link href="/portal/expansion/new" className="growth-request-create"><Plus aria-hidden="true" />Start growth request</Link><p><ShieldCheck aria-hidden="true" />Submitting a request does not reserve territory or guarantee development approval.</p></div> : null}
        <aside><BookOpen aria-hidden="true" /><div><strong>About the development process</strong><span>Learn how opportunities are evaluated and what to expect at each stage.</span><Link href="/franchise/process">View the development process <ArrowRight aria-hidden="true" /></Link></div></aside>
      </div>
    </header>

    {applications ? <GrowthRequestsWorkspace applications={applications} isAdmin={isAdmin} /> : <section role="alert" className="expansion-load-error"><h2>Growth requests could not be loaded</h2><p>The application service is temporarily unavailable.</p><div><a href="/portal/expansion">Retry</a><Link href="/portal/support">Contact Operations Support</Link></div></section>}
  </div>;
}

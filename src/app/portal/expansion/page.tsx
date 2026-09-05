import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { getAccountEntityRecord } from "@/src/features/portal/account-private-records";
import { getExpansionApplications } from "@/src/features/portal/expansion-records";
import { EXPANSION_STATUS } from "@/src/features/portal/expansion-status";
import { expansionSiteReadinessOptions } from "@/src/features/portal/expansion-schema";
import { formatPortalDateTime } from "@/src/features/portal/date-time";
import { ExpansionRequestForm } from "@/src/components/portal/expansion-request-form";
import { ExpansionAdminAction } from "@/src/components/portal/expansion-admin-action";

export default async function ExpansionRequestsPage() {
  const session = await requirePortalPermission("ACCESS_WORKSPACE");
  const loaded = await Promise.all([
    getExpansionApplications(session),
    getAccountEntityRecord(session),
    defaultPortalStorage.getLocationById(session.locationId),
  ]).catch(() => null);
  const isAdmin = session.role === "admin";
  const recordedTime = (value: string, unitId: string) => Number.isFinite(new Date(value).getTime())
    ? <time dateTime={value}>{formatPortalDateTime(value, unitId)}</time> : "Date unavailable";

  return <div className="expansion-page growth-workspace">
    <header className="growth-page-header">
      <div><p className="dashboard-eyebrow">Portfolio growth</p><h1>Growth requests</h1><p>Plan your next location and follow your requests through review.</p></div>
      <Link href="/franchise/process" className="growth-text-link">Development process <ArrowRight size={16} aria-hidden="true" /></Link>
    </header>

    {!loaded ? <section role="alert" className="expansion-load-error"><h2>Growth requests could not be loaded</h2><p>The application service is temporarily unavailable.</p><div><a href="/portal/expansion">Retry</a><Link href="/portal/support">Contact Operations Support</Link></div></section> : <div className={"growth-layout" + (isAdmin ? " growth-layout-admin" : "")}>
      {!isAdmin ? <section className="expansion-compose" aria-labelledby="expansion-compose-title">
        <header><h2 id="expansion-compose-title">Request another location</h2><p>Tell Franchise Development where you’d like to grow.</p></header>
        <ExpansionRequestForm key={session.locationId} workingUnitId={session.locationId} workingUnitName={session.locationName} entityName={loaded[1]?.legalName || loaded[2]?.franchiseeName} />
      </section> : null}

      <div className="growth-status-column">
        <section className="expansion-history" aria-labelledby="expansion-history-title">
          <header><div><h2 id="expansion-history-title" tabIndex={-1}>{isAdmin ? "Application review queue" : "Request status"}</h2><p>{isAdmin ? "Submitted requests for Franchise Development." : "Requests for your franchise entity."}</p></div>{loaded[0].length > 0 ? <span>{loaded[0].length} shown</span> : null}</header>
          {loaded[0].length ? <ul>{loaded[0].map((application) => {
            const status = EXPANSION_STATUS[application.status];
            const titleId = "application-" + application.entityId + "-" + application.id;
            return <li key={titleId}><article aria-labelledby={titleId}>
              <div className="expansion-application-head"><div><p>Request {application.id}</p><h3 id={titleId}>{application.targetMarket}</h3></div><span className="expansion-status">{status.label}</span></div>
              <p className="expansion-status-meaning">{status.meaning}</p>
              <p className="growth-request-updated">Updated {recordedTime(application.updatedAt, application.originatingUnitId)}</p>
              <details className="growth-request-details">
                <summary>Request details<span className="sr-only"> for {application.id}</span></summary>
                <dl>
                  {isAdmin ? <div><dt>Applicant</dt><dd>{application.applicantName}<br />{application.applicantEmail}</dd></div> : null}
                  <div><dt>Submitted</dt><dd>{recordedTime(application.submittedAt, application.originatingUnitId)}</dd></div>
                  <div><dt>Development timeline</dt><dd>{application.preferredTimeline}</dd></div>
                  <div><dt>Site readiness</dt><dd>{expansionSiteReadinessOptions.find((option) => option.value === application.siteReadiness)?.label}</dd></div>
                  <div><dt>Originating unit</dt><dd>{application.originatingUnitId}</dd></div>
                  <div><dt>Investment range</dt><dd>{application.investmentRange}</dd></div>
                  <div><dt>Operating plan</dt><dd className="growth-narrative">{application.operatingPlan}</dd></div>
                  {application.provisionedUnitId ? <div><dt>Provisioned unit</dt><dd>{application.provisionedUnitId}</dd></div> : null}
                </dl>
              </details>
              {isAdmin ? <ExpansionAdminAction key={application.status} entityId={application.entityId} applicationId={application.id} allowedNextStates={status.allowedNextStates} /> : null}
            </article></li>;
          })}</ul> : <div className="expansion-empty"><FileText size={22} aria-hidden="true" /><h3>{isAdmin ? "No requests to review" : "Your next location starts here"}</h3><p>{isAdmin ? "Franchisee requests will appear here after submission." : "Once you submit a request, its reference and current review stage will appear here."}</p></div>}
        </section>
        {!isAdmin ? <div className="growth-help">
          <h2>After you submit</h2>
          <p>Franchise Development reviews your market, timing, and operating plan. Check Request status for recorded updates.</p>
          <p className="growth-terms">Submitting a request does not reserve territory. Territory rights depend on the approved review process and an executed agreement.</p>
          <Link href="/portal/support" className="growth-text-link">Ask Operations Support <ArrowRight size={16} aria-hidden="true" /></Link>
        </div> : null}
      </div>
    </div>}
  </div>;
}

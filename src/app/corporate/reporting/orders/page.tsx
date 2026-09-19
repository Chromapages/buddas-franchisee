import { CorporatePageHeader, CorporatePanel, PermissionState } from "@/src/components/corporate/corporate-ui";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import { listCorporateOrders } from "@/src/features/corporate/operations-data";
import { buildAuthoritativeOrderReport } from "@/src/features/corporate/reporting/order-report";
import { requireCorporateSession } from "@/src/features/corporate/session";

export default async function CorporateOrderReportingPage() {
  const session = await requireCorporateSession();
  if (!hasCorporatePermission(session, "VIEW_REPORTS")) return <PermissionState description="Your current corporate access does not include aggregate reporting." />;
  const orders = await listCorporateOrders(session);
  const report = buildAuthoritativeOrderReport(orders);
  const metrics = [["Submitted", report.submitted], ["Supplier acknowledged", report.acknowledged], ["Reconciled", report.reconciled], ["Matched", report.matched], ["Exceptions", report.exceptions], ["Acknowledgment coverage", `${report.coveragePercent}%`]] as const;
  return <div className="corporate-main-stack"><CorporatePageHeader eyebrow="Authoritative reporting" title="Order reconciliation" description="Only supplier acknowledgments received through the authenticated integration and corporate reconciliation outcomes contribute to these results." /><section className="corporate-dashboard-metrics" aria-label="Order reconciliation metrics">{metrics.map(([label, value]) => <article key={label}><div><small>{label}</small><strong>{value}</strong></div></article>)}</section><CorporatePanel title="Authoritative coverage" description="Portal submissions are counted as requests. Acknowledged value and latency appear only when supplier evidence exists."><div className="corporate-detail-body"><p><strong>Acknowledged order value:</strong> ${report.acknowledgedValue.toFixed(2)}</p><p><strong>Average acknowledgment time:</strong> {report.averageAcknowledgmentHours === undefined ? "Unavailable" : `${report.averageAcknowledgmentHours.toFixed(1)} hours`}</p><p>POS sales, inventory on hand, payment settlement, profitability, and fulfillment performance remain excluded until their named systems of record are connected.</p></div></CorporatePanel></div>;
}

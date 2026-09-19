import { CorporatePageHeader, CorporatePanel, StatusBadge } from "@/src/components/corporate/corporate-ui";
import { requireCorporateSession } from "@/src/features/corporate/session";

export default async function NotificationAdministrationPage() {
  const session = await requireCorporateSession();
  return <div className="corporate-main-stack"><CorporatePageHeader eyebrow="Personal settings" title="Notifications" description={`Delivery settings for ${session.email}. Work remains visible even when optional alerts are unavailable.`} /><CorporatePanel title="Delivery channels" description="Preference storage is not configured, so these values are shown without a false save action."><div className="corporate-detail-body"><div className="corporate-setting-row"><div><h3>In-app activity</h3><p>Assignment, reply, resolution, recovery, and access events.</p></div><StatusBadge tone="success">Required</StatusBadge></div><div className="corporate-setting-row"><div><h3>Email delivery</h3><p>Minimal context and an authenticated record link.</p></div><StatusBadge tone="waiting">Not configured</StatusBadge></div><div className="corporate-setting-row"><div><h3>Routine digest</h3><p>Optional summary delivery requires a configured preference store.</p></div><StatusBadge>Unavailable</StatusBadge></div></div></CorporatePanel></div>;
}

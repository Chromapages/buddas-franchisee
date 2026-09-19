import Link from "next/link";
import { Bell, Cable, KeyRound, Route, ScrollText } from "lucide-react";
import { CorporatePageHeader, PermissionState } from "@/src/components/corporate/corporate-ui";
import { hasCorporatePermission } from "@/src/features/corporate/authorization";
import { requireCorporateSession } from "@/src/features/corporate/session";

export default async function CorporateAdministrationPage() {
  const session = await requireCorporateSession();
  const links = [
    { href: "/corporate/administration/access", title: "Access", description: "Review corporate memberships, status, and scope.", icon: KeyRound, show: hasCorporatePermission(session, "MANAGE_ACCESS") },
    { href: "/corporate/administration/routing", title: "Routing", description: "Inspect accountable teams and assignment defaults.", icon: Route, show: hasCorporatePermission(session, "ASSIGN_SUPPORT") },
    { href: "/corporate/administration/notifications", title: "Notifications", description: "Review personal delivery preferences and required events.", icon: Bell, show: true },
    { href: "/corporate/administration/integrations", title: "Integrations & recovery", description: "Find failed or uncertain delivery and reconciliation work.", icon: Cable, show: hasCorporatePermission(session, "VIEW_RECOVERY") },
    { href: "/corporate/administration/audit", title: "Audit", description: "Search committed actions and their safe field changes.", icon: ScrollText, show: hasCorporatePermission(session, "VIEW_AUDIT") },
  ].filter((item) => item.show);
  if (links.length === 1) return <PermissionState description="Your current access includes only personal notification settings." />;
  return <div className="corporate-main-stack"><CorporatePageHeader eyebrow="Governance" title="Administration" description="Manage access, ownership, delivery recovery, and traceability within your granted scope." /><div className="corporate-admin-grid">{links.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className="corporate-admin-link"><div><h2>{item.title}</h2><Icon size={22} aria-hidden="true" /></div><p>{item.description}</p><span>Open {item.title.toLowerCase()} →</span></Link>; })}</div></div>;
}

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { CORPORATE_BUNDLE_LABELS, hasCorporatePermission } from "@/src/features/corporate/authorization";
import { requireCorporateSession } from "@/src/features/corporate/session";
import { getCorporateStorage } from "@/src/features/corporate/storage";
import { CorporatePanel, EmptyState, ErrorState, PermissionState, StatusBadge } from "@/src/components/corporate/corporate-ui";
import { CorporateDashboardFreshness } from "@/src/components/corporate/corporate-dashboard-freshness";
import "../work/work-masthead.css";

export default async function CorporateDirectoryPage({ searchParams }: { searchParams: Promise<{ tab?: string | string[]; q?: string | string[] }> }) {
  const session = await requireCorporateSession();
  if (!hasCorporatePermission(session, "VIEW_DIRECTORY")) return <PermissionState description="Your current corporate access does not include the directory." />;
  const query = await searchParams;
  const tab = query.tab === "organizations" || query.tab === "people" ? query.tab : "locations";
  const q = typeof query.q === "string" ? query.q.trim().toLowerCase() : "";
  const searchPlaceholder = tab === "people" ? "Search people by name or email…" : tab === "organizations" ? "Search organizations by name or ID…" : "Search locations by name, code, or market…";
  const storage = getCorporateStorage();
  const loaded = await Promise.all([storage.getOrganizations(session), storage.getLocations(session), storage.getPeople(session)]).catch(() => null);
  const canAddLocation = hasCorporatePermission(session, "MANAGE_LOCATIONS");
  const organizations = loaded?.[0].filter((item) => !q || `${item.id} ${item.name}`.toLowerCase().includes(q)) || [];
  const locations = loaded?.[1].filter((item) => !q || `${item.code} ${item.name} ${item.market || ""} ${item.organizationId || ""}`.toLowerCase().includes(q)) || [];
  const people = loaded?.[2].filter((item) => !q || `${item.displayName} ${item.email}`.toLowerCase().includes(q)) || [];
  const tabs = [
    { id: "locations", label: "Locations", count: loaded?.[1].length || 0 },
    { id: "organizations", label: "Organizations", count: loaded?.[0].length || 0 },
    { id: "people", label: "People", count: loaded?.[2].length || 0 },
  ];
  return <div className="corporate-main-stack corporate-work-page">
    <section className="corporate-work-masthead" aria-labelledby="corporate-directory-title">
      <div className="corporate-work-masthead-top">
        <div className="corporate-work-masthead-intro">
          <p>Portfolio records</p>
          <h1 id="corporate-directory-title">Directory</h1>
          <span>Find permitted organizations, locations, and people without treating names as authorization.</span>
        </div>
        <div className="corporate-work-masthead-tools">
          {loaded ? <CorporateDashboardFreshness updatedAt={new Date().toISOString()} timeZone="America/Denver" showRefreshIcon /> : <span className="corporate-masthead-status">Directory unavailable</span>}
          {canAddLocation ? <Link href="/corporate/directory/locations/new" className="corporate-button"><Plus size={19} aria-hidden="true" />Add location</Link> : null}
        </div>
      </div>
      {loaded ? <div className="corporate-work-masthead-bottom">
        <nav className="corporate-work-tabs" aria-label="Directory sections">{tabs.map((item) => <Link key={item.id} href={item.id === "locations" ? "/corporate/directory" : "/corporate/directory?tab=" + item.id} aria-current={tab === item.id ? "page" : undefined}>{item.label}<span>{item.count}</span></Link>)}</nav>
        <div className="corporate-work-toolbar">
          <form className="corporate-work-search" method="get" role="search">{tab !== "locations" ? <input type="hidden" name="tab" value={tab} /> : null}<button type="submit" aria-label={"Search " + tab}><Search size={21} aria-hidden="true" /></button><input type="search" name="q" defaultValue={q} aria-label={"Search " + tab} placeholder={searchPlaceholder} /></form>
        </div>
      </div> : null}
    </section>
    {!loaded ? <ErrorState title="Directory could not be loaded" description="Authorized portfolio records are temporarily unavailable." retryHref="/corporate/directory" /> : <CorporatePanel title="Authorized directory" description="The directory shows only records covered by your current memberships.">
    {tab === "organizations" ? (organizations.length ? <div className="corporate-table-region" tabIndex={0} role="region" aria-label="Organizations"><table className="corporate-table"><caption className="sr-only">Permitted organizations</caption><thead><tr><th scope="col">Organization</th><th scope="col">Verification</th><th scope="col">Locations</th></tr></thead><tbody>{organizations.map((item) => <tr key={item.id}><th scope="row"><Link href={`/corporate/directory/organizations/${encodeURIComponent(item.id)}`}><small>{item.id}</small><strong>{item.name}</strong></Link></th><td><StatusBadge tone={item.verificationStatus === "VERIFIED" ? "success" : "waiting"}>{item.verificationStatus}</StatusBadge></td><td>{item.locationIds.length}</td></tr>)}</tbody></table></div> : <EmptyState title={q ? "No matching organizations" : "No organizations in this scope"} description={q ? "Try another search term." : "An access steward can review your assigned portfolio."} />) : tab === "people" ? (people.length ? <div className="corporate-table-region" tabIndex={0} role="region" aria-label="People"><table className="corporate-table"><caption className="sr-only">Permitted people</caption><thead><tr><th scope="col">Person</th><th scope="col">Status</th><th scope="col">Access bundles</th><th scope="col">Updated</th></tr></thead><tbody>{people.map((item) => <tr key={item.id}><th scope="row"><Link href={`/corporate/directory/people/${encodeURIComponent(item.id)}`}><small>{item.email}</small><strong>{item.displayName}</strong></Link></th><td><StatusBadge tone={item.status === "ACTIVE" ? "success" : item.status === "SUSPENDED" ? "danger" : "waiting"}>{item.status}</StatusBadge></td><td>{item.memberships.map((membership) => CORPORATE_BUNDLE_LABELS[membership.bundle]).join(", ") || "None"}</td><td>{item.updatedAt ? <time dateTime={item.updatedAt}>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(item.updatedAt))}</time> : "Unavailable"}</td></tr>)}</tbody></table></div> : <EmptyState title={q ? "No matching people" : "No people in this scope"} description={q ? "Try another search term." : "People appear after a server-owned membership is available."} />) : (locations.length ? <div className="corporate-table-region" tabIndex={0} role="region" aria-label="Locations"><table className="corporate-table"><caption className="sr-only">Permitted locations</caption><thead><tr><th scope="col">Location</th><th scope="col">Organization</th><th scope="col">Market</th><th scope="col">Status</th></tr></thead><tbody>{locations.map((item) => <tr key={item.id}><th scope="row"><Link href={`/corporate/directory/locations/${encodeURIComponent(item.id)}`}><small>{item.code}</small><strong>{item.name}</strong></Link></th><td>{item.organizationId || "Unverified"}</td><td>{item.market || "Not recorded"}</td><td><StatusBadge tone={item.status === "ACTIVE" ? "success" : "waiting"}>{item.status}</StatusBadge></td></tr>)}</tbody></table></div> : <EmptyState title={q ? "No matching locations" : "No locations in this scope"} description={q ? "Try another search term." : "An access steward can review your assigned portfolio."} />)}
  </CorporatePanel>}</div>;
}

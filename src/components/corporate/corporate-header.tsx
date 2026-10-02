"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Bell, BookOpen, Building2, Check, ChevronDown, ChevronRight, ClipboardCheck, Headphones, LayoutDashboard, LogOut, Menu, ReceiptText, Search, Settings, X } from "lucide-react";
import { logoutAction } from "@/src/features/auth/actions";

type Panel = "portfolio" | "search" | "activity" | "account";
type SearchCategory = "all" | "order" | "resources" | "support" | "units" | "requests";
type HeaderData = {
  locations: Array<{ id: string; name: string; code: string }>;
  locationCount: number;
  searchItems: Array<{ id: string; category: string; title: string; detail: string; href: string }>;
  activity: Array<{ id: string; reference: string; title: string; detail: string; href: string; updatedAt: string; needsAttention: boolean }>;
  attentionCount: number;
  availability: { locations: boolean; work: boolean; resources: boolean };
};

type CorporateHeaderProps = {
  displayName: string;
  email: string;
  scopeLabel: string;
  initials: string;
  access: { administration: boolean; directory: boolean; orders: boolean; support: boolean; resources: boolean; requests: boolean; inquiries: boolean };
  mobileMenuOpen: boolean;
  mobileMenuButton: RefObject<HTMLButtonElement | null>;
  onToggleMobileMenu: () => void;
};

const categoryMatches = (category: SearchCategory, item: HeaderData["searchItems"][number]) =>
  category === "all" || item.category === category || (category === "requests" && (item.category === "request" || item.category === "inquiry"));

const iconFor = (category: string) => category === "order" ? ReceiptText : category === "resources" ? BookOpen : category === "support" ? Headphones : category === "units" ? Building2 : category === "request" || category === "inquiry" ? ClipboardCheck : LayoutDashboard;

export function CorporateHeader({ displayName, email, scopeLabel, initials, access, mobileMenuOpen, mobileMenuButton, onToggleMobileMenu }: CorporateHeaderProps) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const portfolioButton = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const mobileSearchInput = useRef<HTMLInputElement>(null);
  const activityButton = useRef<HTMLButtonElement>(null);
  const accountButton = useRef<HTMLButtonElement>(null);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SearchCategory>("all");
  const [activityView, setActivityView] = useState<"attention" | "recent">("attention");
  const [data, setData] = useState<HeaderData | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => { setPanel(null); }, [pathname]);
  useEffect(() => { if (mobileMenuOpen) setPanel(null); }, [mobileMenuOpen]);

  useEffect(() => {
    if (!panel || panel === "account" || data || loadError) return;
    const controller = new AbortController();
    fetch("/api/corporate/header", { signal: controller.signal, cache: "no-store" })
      .then((response) => { if (!response.ok) throw new Error("Header data unavailable"); return response.json() as Promise<HeaderData>; })
      .then(setData)
      .catch((error: unknown) => { if (!(error instanceof DOMException && error.name === "AbortError")) setLoadError(true); });
    return () => controller.abort();
  }, [panel, data, loadError]);

  useEffect(() => {
    if (!panel) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setPanel(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      const trigger = panel === "portfolio" ? portfolioButton.current : panel === "search" ? (window.matchMedia("(max-width: 40rem)").matches ? mobileSearchInput.current : searchInput.current) : panel === "activity" ? activityButton.current : accountButton.current;
      setPanel(null);
      requestAnimationFrame(() => trigger?.focus());
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("pointerdown", onPointerDown); document.removeEventListener("keydown", onKeyDown); };
  }, [panel]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      if (mobileMenuOpen) onToggleMobileMenu();
      setPanel("search");
      requestAnimationFrame(() => (window.matchMedia("(max-width: 40rem)").matches ? mobileSearchInput.current : searchInput.current)?.focus());
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen, onToggleMobileMenu]);

  const searchTerms = query.trim().toLowerCase();
  const displayScope = scopeLabel === "All permitted locations" ? "All locations" : scopeLabel;
  const results = data?.searchItems.filter((item) => categoryMatches(category, item) && (!searchTerms || `${item.title} ${item.detail}`.toLowerCase().includes(searchTerms))).slice(0, 6) || [];
  const activityItems = data?.activity.filter((item) => activityView === "recent" || item.needsAttention).slice(0, 5) || [];
  const searchCategories: Array<{ id: SearchCategory; label: string; show: boolean }> = [
    { id: "all", label: "All", show: true }, { id: "order", label: "Orders", show: access.orders },
    { id: "resources", label: "Resources", show: access.resources }, { id: "support", label: "Support", show: access.support },
    { id: "units", label: "Units", show: access.directory }, { id: "requests", label: "Requests", show: access.requests || access.inquiries },
  ];

  return <header ref={headerRef} className="corporate-topbar" aria-label="Corporate workspace header">
    <button ref={mobileMenuButton} type="button" className="corporate-menu-button" onClick={onToggleMobileMenu} aria-label={mobileMenuOpen ? "Close corporate navigation" : "Open corporate navigation"} aria-expanded={mobileMenuOpen} aria-controls="corporate-mobile-nav">
      {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}<span>{mobileMenuOpen ? "Close" : "Menu"}</span>
    </button>

    <div className="corporate-header-portfolio">
      <button ref={portfolioButton} type="button" className="corporate-header-portfolio-trigger" aria-label={`Portfolio: ${scopeLabel}`} aria-haspopup="true" aria-expanded={panel === "portfolio"} aria-controls="corporate-header-portfolio-panel" onClick={() => setPanel(panel === "portfolio" ? null : "portfolio") }>
        <Building2 size={26} aria-hidden="true" /><span><small>Portfolio</small><strong>{displayScope}</strong></span><ChevronDown size={18} aria-hidden="true" />
      </button>
      {panel === "portfolio" ? <div id="corporate-header-portfolio-panel" className="corporate-header-popover corporate-header-portfolio-panel" role="region" aria-label="Permitted locations">
        <p className="corporate-header-panel-label">Portfolio</p>
        <div className="corporate-header-portfolio-list">
          <div className="corporate-header-portfolio-item is-current"><Building2 size={23} aria-hidden="true" /><span><strong>{displayScope}</strong><small>Current portfolio scope</small></span><Check size={19} aria-hidden="true" /></div>
          {!data && !loadError ? <p className="corporate-header-panel-message">Loading permitted locations…</p> : null}
          {loadError || (data && !data.availability.locations) ? <div className="corporate-header-panel-message">Locations are unavailable right now. {loadError ? <button type="button" onClick={() => setLoadError(false)}>Try again</button> : null}</div> : null}
          {data?.locations.map((location) => <Link key={location.id} href={`/corporate/directory/locations/${encodeURIComponent(location.id)}`} onClick={() => setPanel(null)} className="corporate-header-portfolio-item"><Building2 size={22} aria-hidden="true" /><span><strong>{location.name}</strong><small>{location.code}</small></span></Link>)}
        </div>
        {access.directory ? <Link href="/corporate/directory?tab=locations" onClick={() => setPanel(null)} className="corporate-header-panel-footer">View all locations{data && data.locationCount > data.locations.length ? ` (${data.locationCount})` : ""}<ChevronRight size={18} aria-hidden="true" /></Link> : null}
      </div> : null}
    </div>

    <div className="corporate-header-search-wrap">
      <form id="corporate-header-search-form" className="corporate-header-search-form" action="/corporate/work" method="get" role="search">
        <Search size={23} aria-hidden="true" />
        <input ref={searchInput} type="search" name="q" value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setPanel("search")} aria-label="Search permitted work and records" aria-controls="corporate-header-search-panel" placeholder="Search orders, resources, units, support, and more…" />
        <kbd>Ctrl K</kbd>
      </form>
      <button type="button" className="corporate-header-mobile-search" onClick={() => { setPanel("search"); requestAnimationFrame(() => mobileSearchInput.current?.focus()); }} aria-label="Open search"><Search size={22} aria-hidden="true" /></button>
      {panel === "search" ? <div id="corporate-header-search-panel" className="corporate-header-popover corporate-header-search-panel" role="region" aria-label="Quick search results">
        <form className="corporate-header-search-mobile-form" action="/corporate/work" method="get" role="search"><Search size={20} aria-hidden="true" /><input ref={mobileSearchInput} type="search" name="q" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search permitted work and records" placeholder="Search permitted records" /></form>
        <div className="corporate-header-search-tabs" aria-label="Search categories">{searchCategories.filter((item) => item.show).map((item) => <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div>
        <div className="corporate-header-search-results">
          {!data && !loadError ? <p className="corporate-header-panel-message">Loading permitted records…</p> : null}
          {loadError ? <div className="corporate-header-panel-message">Quick results are unavailable. Press Enter to search the work queue. <button type="button" onClick={() => setLoadError(false)}>Try again</button></div> : null}
          {data && !results.length ? <p className="corporate-header-panel-message">No quick results. Search the full work queue below.</p> : null}
          {results.map((item) => { const Icon = iconFor(item.category); return <Link key={item.id} href={item.href} onClick={() => setPanel(null)} className="corporate-header-result"><Icon size={21} aria-hidden="true" /><span><small>{item.category}</small><strong>{item.title}</strong><em>{item.detail}</em></span><ChevronRight size={17} aria-hidden="true" /></Link>; })}
        </div>
        <button type="submit" form="corporate-header-search-form" className="corporate-header-panel-footer"><Search size={18} aria-hidden="true" />Search full work queue<ChevronRight size={18} aria-hidden="true" /></button>
      </div> : null}
    </div>

    <div className="corporate-header-actions">
      <div className="corporate-header-activity-wrap">
        <button ref={activityButton} type="button" className="corporate-header-icon-button" aria-label={data?.attentionCount ? `${data.attentionCount} work items need attention` : "Open work activity"} aria-haspopup="true" aria-expanded={panel === "activity"} aria-controls="corporate-header-activity-panel" onClick={() => setPanel(panel === "activity" ? null : "activity")}><Bell size={24} aria-hidden="true" />{data?.attentionCount ? <span className="corporate-header-attention-count">{data.attentionCount > 99 ? "99+" : data.attentionCount}</span> : null}</button>
        {panel === "activity" ? <div id="corporate-header-activity-panel" className="corporate-header-popover corporate-header-activity-panel" role="region" aria-label="Work activity"><div className="corporate-header-panel-heading"><strong>Notifications</strong><small>Updates from your permitted work</small></div><div className="corporate-header-activity-tabs"><button type="button" aria-pressed={activityView === "attention"} onClick={() => setActivityView("attention")}>Needs attention{data?.attentionCount ? ` (${data.attentionCount})` : ""}</button><button type="button" aria-pressed={activityView === "recent"} onClick={() => setActivityView("recent")}>Recent work</button></div><div className="corporate-header-activity-list">{!data && !loadError ? <p className="corporate-header-panel-message">Loading work activity…</p> : null}{loadError || (data && !data.availability.work) ? <div className="corporate-header-panel-message">Work activity is unavailable right now. {loadError ? <button type="button" onClick={() => setLoadError(false)}>Try again</button> : null}</div> : null}{data?.availability.work && !activityItems.length ? <p className="corporate-header-panel-message">No {activityView === "attention" ? "work items need attention" : "recent work updates"}.</p> : null}{activityItems.map((item) => <Link key={item.id} href={item.href} onClick={() => setPanel(null)} className="corporate-header-activity-item"><span className={item.needsAttention ? "is-attention" : ""}><Bell size={17} aria-hidden="true" /></span><span><strong>{item.title}</strong><small>{item.reference} · {item.detail}</small></span><ChevronRight size={17} aria-hidden="true" /></Link>)}</div><Link href="/corporate/work" onClick={() => setPanel(null)} className="corporate-header-panel-footer">View work queue<ChevronRight size={18} aria-hidden="true" /></Link></div> : null}
      </div>
      <div className="corporate-header-account-wrap">
        <button ref={accountButton} type="button" className="corporate-header-account-trigger" aria-label={`Open account menu for ${displayName || email}`} aria-haspopup="dialog" aria-expanded={panel === "account"} aria-controls="corporate-header-account-panel" onClick={() => setPanel(panel === "account" ? null : "account")}><span className="corporate-header-avatar" aria-hidden="true">{initials}</span><span className="corporate-header-account-copy"><strong>{displayName || "Corporate user"}</strong><small>Corporate workspace</small></span><ChevronDown size={18} aria-hidden="true" /></button>
        {panel === "account" ? <div id="corporate-header-account-panel" className="corporate-header-popover corporate-header-account-panel" role="dialog" aria-label="Account menu"><div className="corporate-header-account-summary"><span className="corporate-header-avatar" aria-hidden="true">{initials}</span><span><strong>{displayName || "Corporate user"}</strong><small>{email}</small></span><button type="button" aria-label="Close account menu" onClick={() => { setPanel(null); accountButton.current?.focus(); }}><ChevronDown size={19} aria-hidden="true" /></button></div><div className="corporate-header-account-links">{access.administration ? <Link href="/corporate/administration" onClick={() => setPanel(null)}><Settings size={20} aria-hidden="true" />Administration<ChevronRight size={17} aria-hidden="true" /></Link> : null}{access.directory ? <Link href="/corporate/directory?tab=locations" onClick={() => setPanel(null)}><Building2 size={20} aria-hidden="true" />Portfolio locations<ChevronRight size={17} aria-hidden="true" /></Link> : null}{access.support ? <Link href="/corporate/support" onClick={() => setPanel(null)}><Headphones size={20} aria-hidden="true" />Account access help<ChevronRight size={17} aria-hidden="true" /></Link> : null}</div><form action={logoutAction}><button type="submit" className="corporate-header-signout"><LogOut size={20} aria-hidden="true" />Sign out</button></form></div> : null}
      </div>
    </div>
  </header>;
}

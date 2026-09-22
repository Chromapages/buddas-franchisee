"use client";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock3, FileText, HelpCircle, Megaphone, Search, Store, Star } from "lucide-react";
import type { PortalResource } from "@/src/features/portal/types";
import { formatPortalDate } from "@/src/features/portal/date-time";
import { ResourceAction } from "@/src/components/portal/resource-action";
type Filter = "ALL" | "TRAINING" | "RECIPES" | "MARKETING";
const displayCategory = (category: PortalResource["category"]) => category === "Brand & Marketing" ? "Marketing Toolkits" : category === "Recipes & Prep" ? "Recipes & Standards" : "Training & SOPs";
const filterFor = (category: PortalResource["category"]): Filter => category === "Brand & Marketing" ? "MARKETING" : category === "Recipes & Prep" ? "RECIPES" : "TRAINING";
const resourceIcon = (category: PortalResource["category"]) => category === "Brand & Marketing" ? Megaphone : category === "Recipes & Prep" ? BookOpen : FileText;
export function ResourceCenterWorkspace({ resources, locationId, locationName, address, initialQuery }: { resources: PortalResource[]; locationId: string; locationName: string; address?: string; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery || "");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [sort, setSort] = useState<"recent" | "az">("recent");
  const [headerNavTarget, setHeaderNavTarget] = useState<HTMLElement | null>(null);
  const [useHeaderNav, setUseHeaderNav] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 64rem)");
    const sync = () => setUseHeaderNav(media.matches);
    setHeaderNavTarget(document.getElementById("portal-header-local-nav"));
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  const resetBrowse = () => { setFilter("ALL"); setQuery(""); };
  const selectCategory = (nextFilter: Exclude<Filter, "ALL">) => { setFilter(nextFilter); setQuery(""); };
  const normalized = query.trim().toLowerCase();
  const visible = useMemo(() => resources.filter((resource) => (filter === "ALL" || filterFor(resource.category) === filter) && (!normalized || (resource.title + " " + resource.category).toLowerCase().includes(normalized))).sort((a,b) => sort === "az" ? a.title.localeCompare(b.title) : (Date.parse(b.updatedAt)||0) - (Date.parse(a.updatedAt)||0)), [resources, filter, normalized, sort]);
  const required = visible.filter((resource) => resource.requiredAction && resource.requiredAction !== "NONE");
  const recent = visible.filter((resource) => !required.includes(resource));
  const categories: Array<{ id: Exclude<Filter,"ALL">; title: string; description: string; icon: typeof FileText }> = [
    { id:"TRAINING", title:"Training & SOPs", description:"Operating procedures, equipment, sanitation, and team training.", icon:FileText },
    { id:"RECIPES", title:"Recipes & Standards", description:"Approved preparation methods, recipes, and product standards.", icon:BookOpen },
    { id:"MARKETING", title:"Marketing Toolkits", description:"Current campaigns, templates, and approved store materials.", icon:Megaphone },
  ];
  const localNavigation = <nav className="resource-local-nav" aria-label="Resource Center navigation"><button type="button" onClick={resetBrowse} aria-pressed={filter === "ALL"}><FileText aria-hidden="true" />All Resources</button><button type="button" onClick={() => selectCategory("TRAINING")} aria-pressed={filter === "TRAINING"}><FileText aria-hidden="true" />Training &amp; SOPs</button><button type="button" onClick={() => selectCategory("RECIPES")} aria-pressed={filter === "RECIPES"}><BookOpen aria-hidden="true" />Recipes &amp; Standards</button><button type="button" onClick={() => selectCategory("MARKETING")} aria-pressed={filter === "MARKETING"}><Megaphone aria-hidden="true" />Marketing Toolkits</button><a href="#resource-required" onClick={resetBrowse}><Star aria-hidden="true" />Required</a><a href="#resource-updated" onClick={resetBrowse}><Clock3 aria-hidden="true" />Recently Updated</a></nav>;
  const Row = ({ resource, requiredRow = false }: { resource: PortalResource; requiredRow?: boolean }) => {
    const Icon = resourceIcon(resource.category);
    return <article className="resource-library-row"><Icon aria-hidden="true" /><div><h3>{resource.title}</h3><p>{displayCategory(resource.category)}<span />{resource.version}<span />Updated {formatPortalDate(resource.updatedAt, locationId)}</p></div><span className={requiredRow ? "resource-tag-required" : "resource-tag-updated"}>{requiredRow ? "Required" : "Updated"}</span><a href={"/portal/resources/download/" + encodeURIComponent(resource.id)}>View <ArrowRight aria-hidden="true" /></a><ResourceAction resourceId={resource.id} requiredAction={resource.requiredAction} responseState={resource.responseState} dueAt={resource.dueAt} /></article>;
  };
  return <div className="resource-center-layout">
    {useHeaderNav && headerNavTarget ? createPortal(localNavigation, headerNavTarget) : localNavigation}
    <main className="resource-library-main" id="resource-top">
      <header className="resource-library-heading"><p>Resources</p><h1>Resource Center</h1><span>Approved training guides, recipes, and marketing toolkits for <strong>{locationName}</strong>.</span></header>
      <div className="resource-search"><Search aria-hidden="true" /><label htmlFor="resource-search-input" className="sr-only">Search resources</label><input id="resource-search-input" type="search" value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search guides, recipes, SOPs, or toolkits…" /></div>
      <div className="resource-filter-row" aria-label="Resource sort"><label><span>Sort by</span><select value={sort} onChange={(event)=>setSort(event.target.value as "recent"|"az")}><option value="recent">Most Recent</option><option value="az">Name A–Z</option></select></label></div>
      <section className="resource-library-section resource-required-section" id="resource-required" aria-labelledby="resource-required-title"><header><Star aria-hidden="true" /><div><h2 id="resource-required-title">Required for your unit</h2><p>Resources assigned to your location that may require review or acknowledgement.</p></div></header>{required.length ? <div>{required.map((resource)=><Row key={resource.id} resource={resource} requiredRow />)}</div> : <p className="resource-section-empty"><CheckCircle2 aria-hidden="true" />No required resource actions are assigned to this unit.</p>}</section>
      <section className="resource-library-section" id="resource-updated" aria-labelledby="resource-updated-title"><header><Clock3 aria-hidden="true" /><div><h2 id="resource-updated-title">Recently updated</h2><p>Stay current with the latest guides, recipes, and marketing materials.</p></div></header>{recent.length ? <div>{recent.map((resource)=><Row key={resource.id} resource={resource} />)}</div> : <p className="resource-section-empty">No resources match this search and category.</p>}</section>
      <section className="resource-browse" aria-labelledby="resource-browse-title"><header><h2 id="resource-browse-title">Browse by category</h2><p>Find the resources you need by category.</p></header><div>{categories.map(({id,title,description,icon:Icon})=><button type="button" key={id} onClick={()=>selectCategory(id)}><Icon aria-hidden="true" /><span><strong>{title}</strong><small>{description}</small><u>View resources <ArrowRight aria-hidden="true" /></u></span></button>)}</div></section>
    </main>
    <aside className="resource-context-rail" aria-label="Resource Center context"><section><Store aria-hidden="true" /><div><h2>Your unit</h2><strong>{locationName}</strong><span>{locationId}</span>{address?<span>{address}</span>:null}<p><b>Active</b><em>Working unit</em></p><Link href="/portal/account/units-access">View unit details <ArrowRight aria-hidden="true" /></Link></div></section><section><HelpCircle aria-hidden="true" /><div><h2>Can&rsquo;t find what you need?</h2><p>Contact Operations Support if you need a specific manual, recipe, or toolkit for this unit.</p><Link href="/portal/support">Contact support <ArrowRight aria-hidden="true" /></Link></div></section><section><FileText aria-hidden="true" /><div><h2>Resource guidelines</h2><p>Materials are current, approved, and intended for Budda&rsquo;s operators only.</p></div></section></aside>
  </div>;
}

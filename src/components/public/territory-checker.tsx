"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { PublicJurisdictionDisplay } from "@/src/features/territory/public-jurisdiction-status";
import { trackFunnelEvent } from "@/src/lib/analytics";

type ExplorerStatus = "ALL" | "CURRENT_STATUS" | "UNDER_REVIEW";

const statusLabels: Record<Exclude<ExplorerStatus, "ALL">, string> = {
  CURRENT_STATUS: "Current public status",
  UNDER_REVIEW: "Status under review",
};

export const TerritoryChecker = ({ jurisdictions }: { jurisdictions: readonly PublicJurisdictionDisplay[] }) => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ExplorerStatus>("ALL");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [statusAnnouncement, setStatusAnnouncement] = useState("");
  const lastSearchKey = useRef("");

  const explorerStates = useMemo(() => jurisdictions
    .map((display) => ({
      display,
      filterStatus: display.isCurrent ? "CURRENT_STATUS" as const : "UNDER_REVIEW" as const,
    }))
    .sort((a, b) => a.display.name.localeCompare(b.display.name)), [jurisdictions]);

  const filters = useMemo<Array<{ value: ExplorerStatus; label: string }>>(() => [
    { value: "ALL", label: "All jurisdictions" },
    ...(["CURRENT_STATUS", "UNDER_REVIEW"] as const)
      .filter((status) => explorerStates.some((state) => state.filterStatus === status))
      .map((status) => ({ value: status, label: statusLabels[status] })),
  ], [explorerStates]);

  const visibleStates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return explorerStates.filter((state) => {
      const matchesFilter = filter === "ALL" || state.filterStatus === filter;
      const matchesQuery = !normalizedQuery || `${state.display.name} ${state.display.code}`.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  const selected = selectedCode
    ? explorerStates.find((state) => state.display.code === selectedCode) ?? null
    : null;

  useEffect(() => {
    if (!query.trim()) return;

    const searchKey = `${filter}:${visibleStates.length}:${query.trim().length}`;
    const timer = window.setTimeout(() => {
      if (lastSearchKey.current === searchKey) return;
      lastSearchKey.current = searchKey;
      trackFunnelEvent("opportunity_territory_search", {
        page_path: "/franchise/the-opportunity",
        opportunity_section_id: "territory",
        has_search_query: true,
        territory_result_count: visibleStates.length,
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [filter, query, visibleStates.length]);

  return (
    <section className="border-y border-bds-teal-dark/25 bg-white/70 px-6 py-7 sm:px-8 sm:py-8" aria-labelledby="state-offering-status-heading">
      <div className="grid gap-6 xl:grid-cols-[minmax(15rem,0.65fr)_minmax(0,1.35fr)] xl:gap-10">
        <div>
          <h3 id="state-offering-status-heading" className="heading-compact text-brand-charcoal">State offering status</h3>
          <p className="mt-2 text-base leading-7 text-brand-charcoal/75">This explorer publishes jurisdiction status only when its review metadata is current and approved.</p>
        </div>
        <dl className="border-y border-bds-teal-dark/15 text-base leading-7 text-brand-charcoal/75">
          <div className="grid gap-1 border-b border-bds-teal-dark/15 py-3 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-5">
            <dt className="font-semibold text-brand-charcoal">State offering status</dt>
            <dd>Whether an approved and current public jurisdiction status is available in this explorer.</dd>
          </div>
          <div className="grid gap-1 border-b border-bds-teal-dark/15 py-3 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-5">
            <dt className="font-semibold text-brand-charcoal">Commercial availability</dt>
            <dd>Not represented by this list; a specific market is reviewed individually during qualification.</dd>
          </div>
          <div className="grid gap-1 py-3 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-5">
            <dt className="font-semibold text-brand-charcoal">Inquiry effect</dt>
            <dd>An inquiry expresses interest only. It does not reserve a territory or confer territory protection.</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 border-t border-bds-teal-dark/20 pt-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h4 className="heading-minor text-brand-charcoal">Explore jurisdiction status</h4>
            <p className="mt-1 text-base leading-7 text-brand-charcoal/70">Filter or search the current public list. A state row never confirms a commercial territory decision.</p>
          </div>
          <div className="w-full lg:max-w-sm">
            <label htmlFor="state-status-search" className="mb-2 block text-sm font-semibold text-brand-charcoal">Search jurisdiction</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bds-teal-dark" aria-hidden="true" />
              <input
                id="state-status-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search state or abbreviation"
                className="w-full rounded-xl border border-brand-charcoal/25 bg-brand-sand/50 py-3 pl-10 pr-4 text-base text-brand-charcoal placeholder:text-brand-charcoal/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-teal-dark"
              />
            </div>
          </div>
        </div>

        <div className="mt-5" role="group" aria-labelledby="jurisdiction-status-filter-label">
          <p id="jurisdiction-status-filter-label" className="mb-2 text-sm font-semibold text-brand-charcoal">Filter public status</p>
          <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={filter === item.value}
              onClick={() => {
                setFilter(item.value);
                trackFunnelEvent("opportunity_territory_filter", {
                  page_path: "/franchise/the-opportunity",
                  opportunity_section_id: "territory",
                  territory_filter_id: item.value === "ALL" ? "all" : item.value === "CURRENT_STATUS" ? "current_status" : "under_review",
                  territory_result_count: item.value === "ALL" ? explorerStates.length : explorerStates.filter((state) => state.filterStatus === item.value).length,
                });
              }}
              className={`min-h-11 rounded-full border px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bds-teal-dark focus-visible:ring-offset-2 ${
                filter === item.value
                  ? "border-bds-teal-dark bg-bds-teal-dark text-bds-cream"
                  : "border-brand-charcoal/25 bg-white text-brand-charcoal hover:border-bds-teal-dark"
              }`}
            >
              {item.label}
            </button>
          ))}
          </div>
        </div>

        <ul className="mt-5 border-y border-bds-teal-dark/20" aria-label="Jurisdiction status results">
          {visibleStates.map((state) => {
            const isSelected = selectedCode === state.display.code;

            return (
              <li key={state.display.code} className="border-b border-bds-teal-dark/15 last:border-b-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCode(state.display.code);
                    setStatusAnnouncement(`${state.display.name}: ${state.display.label}. ${state.display.commercialAvailabilityLabel}.`);
                    trackFunnelEvent("opportunity_territory_status_selected", {
                      page_path: "/franchise/the-opportunity",
                      opportunity_section_id: "territory",
                      territory_status_category: state.filterStatus === "CURRENT_STATUS" ? "current_status" : "under_review",
                    });
                  }}
                  aria-pressed={isSelected}
                  className={`grid min-h-14 w-full gap-2 px-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-bds-teal-dark sm:grid-cols-[minmax(12rem,0.8fr)_minmax(13rem,0.85fr)_minmax(0,1fr)] sm:items-center sm:gap-5 ${
                    isSelected ? "bg-bds-cream" : "bg-transparent hover:bg-brand-sand/45"
                  }`}
                >
                  <span className="font-semibold text-brand-charcoal">{state.display.name} <span className="text-brand-charcoal/65">({state.display.code})</span></span>
                  <span className="text-[15px] font-semibold text-bds-teal-dark">{state.display.label}</span>
                  <span className="text-[15px] leading-6 text-brand-charcoal/70">{state.display.commercialAvailabilityLabel} · No inquiry reservation</span>
                </button>
              </li>
            );
          })}
        </ul>

        {visibleStates.length === 0 ? (
          <p className="border-b border-bds-teal-dark/20 py-5 text-base leading-7 text-brand-charcoal/70">No matching state appears in the current public list. A different market may still be discussed during qualification.</p>
        ) : null}

        {selected ? (
          <section className="mt-5 border-l-4 border-bds-teal-dark bg-brand-sand/45 px-5 py-4" aria-labelledby="selected-state-status-heading">
            <h4 id="selected-state-status-heading" className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-bds-teal-dark">Selected state: {selected.display.name}</h4>
            <p className="mt-2 text-base font-semibold leading-7 text-brand-charcoal">{selected.display.label}</p>
            <p className="mt-1 text-base leading-7 text-brand-charcoal/75">{selected.display.note}</p>
            <p className="mt-3 border-t border-bds-teal-dark/15 pt-3 text-base leading-7 text-brand-charcoal/75">{selected.display.inquiryNotice}</p>
          </section>
        ) : null}
        <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">{statusAnnouncement}</p>
      </div>
    </section>
  );
};

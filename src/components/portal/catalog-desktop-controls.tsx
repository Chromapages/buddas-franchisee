"use client";

import type { CatalogFilters } from "./catalog-filtering";

export function CatalogDesktopControls({ categories, filters, hasHistory, resultCount, totalCount, searchQuery, showCategory, showAvailability, showLeadTime, showHistory, showSort, onCategory, onAvailability, onLeadTime, onHistory, onSort }: {
  categories: string[]; filters: CatalogFilters; hasHistory: boolean; resultCount: number; totalCount: number; searchQuery: string;
  showCategory: boolean; showAvailability: boolean; showLeadTime: boolean; showHistory: boolean; showSort: boolean;
  onCategory: (value: string) => void;
  onAvailability: (value: CatalogFilters["availability"]) => void;
  onLeadTime: (value: CatalogFilters["leadTime"]) => void;
  onHistory: (value: CatalogFilters["purchaseHistory"]) => void;
  onSort: (value: CatalogFilters["sort"]) => void;
}) {
  const showFilters = showAvailability || showLeadTime || showHistory;

  return <section className="catalog-desktop-controls" aria-label="Catalog toolbar">
    <div className="catalog-desktop-heading catalog-desktop-control-row"><p aria-live="polite">{resultCount} approved {resultCount === 1 ? "product" : "products"}{searchQuery.trim() ? ` for “${searchQuery.trim()}”` : ""}</p>{showCategory ? <label className="catalog-strip-select catalog-category-select"><span>Category</span><select value={filters.category} onChange={(event) => onCategory(event.target.value)}><option value="ALL">All supplies ({totalCount})</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label> : null}<div className="catalog-desktop-toolbar-actions">{showAvailability ? <label className="catalog-strip-select"><span>Availability</span><select value={filters.availability} onChange={(event) => onAvailability(event.target.value as CatalogFilters["availability"])}><option value="ALL">All items</option><option value="AVAILABLE">Available to order</option></select></label> : null}{showHistory ? <label className="catalog-strip-select"><span>Order history</span><select value={filters.purchaseHistory} onChange={(event) => onHistory(event.target.value as CatalogFilters["purchaseHistory"])}><option value="ALL">All items</option><option value="RECENTLY_ORDERED">Previously ordered</option></select></label> : null}{showSort ? <label className="catalog-strip-sort"><span>Sort</span><select value={filters.sort} onChange={(event) => onSort(event.target.value as CatalogFilters["sort"])}><option value="ORDER_GUIDE">{hasHistory ? "Recently ordered first" : "Name A–Z"}</option>{searchQuery.trim() ? <option value="RELEVANCE">Search relevance</option> : null}<option value="NAME">Name A–Z</option><option value="PRICE">Price low–high</option>{showAvailability ? <option value="AVAILABILITY">Availability</option> : null}{showLeadTime ? <option value="LEAD_TIME">Lead time</option> : null}</select></label> : null}</div></div>
    {showFilters ? <aside className="catalog-desktop-facets catalog-contextual-filter-strip" aria-label="Catalog filters">
      <div className="catalog-filter-strip-controls">
        {showAvailability ? <label className="catalog-strip-check"><input type="checkbox" checked={filters.availability === "AVAILABLE"} onChange={(event) => onAvailability(event.target.checked ? "AVAILABLE" : "ALL")} /><span>Available to order only</span></label> : null}
        {showHistory ? <label className="catalog-strip-check"><input type="checkbox" checked={filters.purchaseHistory === "RECENTLY_ORDERED"} onChange={(event) => onHistory(event.target.checked ? "RECENTLY_ORDERED" : "ALL")} /><span>Previously ordered at this location</span></label> : null}
        {showLeadTime ? <label className="catalog-strip-select"><span>Lead time</span><select value={filters.leadTime} onChange={(event) => onLeadTime(event.target.value as CatalogFilters["leadTime"])}><option value="ALL">Any lead time</option><option value="UP_TO_THREE_DAYS">Up to 3 business days</option><option value="FOUR_OR_MORE_DAYS">4+ business days</option></select></label> : null}
      </div>
    </aside> : null}
  </section>;
}

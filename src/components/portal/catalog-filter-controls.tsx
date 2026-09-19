"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Check, ListFilter, SlidersHorizontal, X } from "lucide-react";
import type { PortalProduct } from "@/src/features/portal/types";
import {
  type CatalogAvailability,
  type CatalogFilters,
  type CatalogLeadTime,
  type CatalogPurchaseHistory,
  type CatalogSort,
  filterCatalogProducts,
} from "./catalog-filtering";

type CatalogDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
};

const CatalogDialog = ({ open, onClose, title, children, className = "" }: CatalogDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleClose = () => {
    onClose();
    requestAnimationFrame(() => returnFocusRef.current?.focus());
  };

  return (
    <dialog ref={dialogRef} onClose={handleClose} aria-modal="true" aria-labelledby={titleId} className={`catalog-sheet ${className}`}>
      <div className="catalog-sheet-frame">
        <header className="catalog-sheet-header">
          <h2 id={titleId}>{title}</h2>
          <form method="dialog"><button type="submit" className="catalog-sheet-close touch-target" aria-label={`Close ${title.toLocaleLowerCase()}`}><X aria-hidden="true" /></button></form>
        </header>
        {children}
      </div>
    </dialog>
  );
};

const ChoiceRow = ({
  checked,
  children,
  name,
  onChange,
  value,
}: {
  checked: boolean;
  children: ReactNode;
  name: string;
  onChange: () => void;
  value: string;
}) => (
  <label className="catalog-choice-row">
    <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
    <span>{children}</span>
    {checked ? <Check aria-hidden="true" /> : null}
  </label>
);

export const CatalogToolbar = ({
  filters,
  showCategory,
  showFilters,
  showSort,
  onOpenFilters,
  onOpenSort,
}: {
  filters: CatalogFilters;
  showCategory: boolean;
  showFilters: boolean;
  showSort: boolean;
  onOpenFilters: () => void;
  onOpenSort: () => void;
}) => {
  const activeFilterCount = [filters.category !== "ALL", filters.availability !== "ALL", filters.purchaseHistory !== "ALL", filters.leadTime !== "ALL"].filter(Boolean).length;
  const hasFilters = showCategory || showFilters;

  if (!hasFilters && !showSort) return null;

  return (
    <div className="catalog-toolbar" aria-label="Catalog controls">
      <div className="catalog-toolbar-actions">
        {hasFilters ? <button type="button" className="catalog-toolbar-action touch-target-inline" onClick={onOpenFilters} aria-label={activeFilterCount ? `Filters. ${activeFilterCount} active.` : "Filters"}><SlidersHorizontal size={17} aria-hidden="true" />Filters{activeFilterCount ? <span className="catalog-toolbar-count" aria-hidden="true">{activeFilterCount}</span> : null}</button> : null}
        {showSort ? <button type="button" className="catalog-toolbar-action touch-target-inline" onClick={onOpenSort}><ListFilter size={17} aria-hidden="true" />Sort</button> : null}
      </div>
    </div>
  );
};

export const FilterDrawer = ({
  categories,
  filters,
  hasRecentOrders,
  showCategory,
  showAvailability,
  showLeadTime,
  open,
  products,
  recentlyOrderedSkus,
  searchTerm,
  onApply,
  onClose,
}: {
  categories: string[];
  filters: CatalogFilters;
  hasRecentOrders: boolean;
  showCategory: boolean;
  showAvailability: boolean;
  showLeadTime: boolean;
  open: boolean;
  products: PortalProduct[];
  recentlyOrderedSkus: string[];
  searchTerm: string;
  onApply: (next: Pick<CatalogFilters, "category" | "availability" | "purchaseHistory" | "leadTime">) => void;
  onClose: () => void;
}) => {
  const [category, setCategory] = useState(filters.category);
  const [availability, setAvailability] = useState<CatalogAvailability>(filters.availability);
  const [purchaseHistory, setPurchaseHistory] = useState<CatalogPurchaseHistory>(filters.purchaseHistory);
  const [leadTime, setLeadTime] = useState<CatalogLeadTime>(filters.leadTime);

  useEffect(() => {
    if (!open) return;
    setCategory(filters.category);
    setAvailability(filters.availability);
    setPurchaseHistory(filters.purchaseHistory);
    setLeadTime(filters.leadTime);
  }, [filters.availability, filters.category, filters.leadTime, filters.purchaseHistory, open]);

  const draftFilters = { ...filters, category, availability, purchaseHistory, leadTime };
  const matchingCount = filterCatalogProducts({ products, filters: draftFilters, searchTerm, recentlyOrderedSkus }).length;
  const resetDraft = () => {
    setCategory("ALL");
    setAvailability("ALL");
    setPurchaseHistory("ALL");
    setLeadTime("ALL");
  };

  return (
    <CatalogDialog open={open} onClose={onClose} title="Filter supplies" className="catalog-filter-drawer">
      <div className="catalog-sheet-body catalog-filter-sheet">
        {showCategory ? <fieldset><legend>Category</legend>{["ALL", ...categories].map((option) => <ChoiceRow key={option} name="catalog-category" value={option} checked={category === option} onChange={() => setCategory(option)}>{option === "ALL" ? "All categories" : option}</ChoiceRow>)}</fieldset> : null}
        {showAvailability ? <fieldset><legend>Availability</legend><label className="catalog-choice-row"><input type="checkbox" checked={availability === "AVAILABLE"} onChange={(event) => setAvailability(event.target.checked ? "AVAILABLE" : "ALL")} /><span>Available to order only</span></label></fieldset> : null}
        {hasRecentOrders ? <fieldset><legend>Purchase history</legend><label className="catalog-choice-row"><input type="checkbox" checked={purchaseHistory === "RECENTLY_ORDERED"} onChange={(event) => setPurchaseHistory(event.target.checked ? "RECENTLY_ORDERED" : "ALL")} /><span>Previously ordered at this location</span></label></fieldset> : null}
        {showLeadTime ? <fieldset><legend>Fulfillment lead time</legend>
          <ChoiceRow name="catalog-lead-time" value="ALL" checked={leadTime === "ALL"} onChange={() => setLeadTime("ALL")}>Any lead time</ChoiceRow>
          <ChoiceRow name="catalog-lead-time" value="UP_TO_THREE_DAYS" checked={leadTime === "UP_TO_THREE_DAYS"} onChange={() => setLeadTime("UP_TO_THREE_DAYS")}>Up to 3 business days</ChoiceRow>
          <ChoiceRow name="catalog-lead-time" value="FOUR_OR_MORE_DAYS" checked={leadTime === "FOUR_OR_MORE_DAYS"} onChange={() => setLeadTime("FOUR_OR_MORE_DAYS")}>4 or more business days</ChoiceRow>
        </fieldset> : null}
      </div>
      <footer className="catalog-sheet-footer">
        <button type="button" className="touch-target-inline catalog-sheet-clear" onClick={resetDraft}>Clear filters</button>
        <button type="button" className="btn-primary catalog-sheet-apply" onClick={() => { onApply({ category, availability, purchaseHistory, leadTime }); onClose(); }}>{`Show ${matchingCount} ${matchingCount === 1 ? "product" : "products"}`}</button>
      </footer>
    </CatalogDialog>
  );
};

const SORT_OPTIONS: Array<{ id: CatalogSort; label: string; searchOnly?: boolean }> = [
  { id: "RELEVANCE", label: "Relevance", searchOnly: true },
  { id: "NAME", label: "Name A–Z" },
  { id: "PRICE", label: "Price: low to high" },
  { id: "AVAILABILITY", label: "Availability" },
  { id: "LEAD_TIME", label: "Shortest lead time" },
];

export const SortSheet = ({ hasHistory, open, searchTerm, selectedSort, showAvailability, showLeadTime, onClose, onSelect }: { hasHistory: boolean; open: boolean; searchTerm: string; selectedSort: CatalogSort; showAvailability: boolean; showLeadTime: boolean; onClose: () => void; onSelect: (sort: CatalogSort) => void }) => (
  <CatalogDialog open={open} onClose={onClose} title="Sort supplies" className="catalog-sort-sheet">
    <div className="catalog-sheet-body" role="group" aria-label="Sort supplies">
      {[{ id: "ORDER_GUIDE" as const, label: hasHistory ? "Recently ordered first" : "Default order", searchOnly: false }, ...SORT_OPTIONS].filter((option) => (!option.searchOnly || Boolean(searchTerm)) && (option.id !== "AVAILABILITY" || showAvailability) && (option.id !== "LEAD_TIME" || showLeadTime)).map((option) => <button key={option.id} type="button" className="catalog-drawer-choice" aria-pressed={selectedSort === option.id} onClick={() => { onSelect(option.id); onClose(); }}><span>{option.label}</span>{selectedSort === option.id ? <Check aria-hidden="true" /> : null}</button>)}
    </div>
  </CatalogDialog>
);

const FILTER_LABELS: Record<string, string> = {
  AVAILABLE: "Available to order only",
  UNAVAILABLE: "Unavailable",
  RECENTLY_ORDERED: "Previously ordered at this location",
  UP_TO_THREE_DAYS: "Up to 3 business days",
  FOUR_OR_MORE_DAYS: "4+ business days",
  ORDER_GUIDE: "Recently ordered",
  RELEVANCE: "Relevance",
  NAME: "Name A–Z",
  PRICE: "Price: low to high",
  AVAILABILITY: "Availability",
  LEAD_TIME: "Shortest lead time",
};

export const AppliedFilterChips = ({ filters, onClearAll, onRemove, }: { filters: CatalogFilters; onClearAll: () => void; onRemove: (key: "search" | keyof CatalogFilters) => void; }) => {
  const chips: Array<{ key: "search" | keyof CatalogFilters; label: string }> = [];
  if (filters.category !== "ALL") chips.push({ key: "category", label: `Category: ${filters.category}` });
  if (filters.availability !== "ALL") chips.push({ key: "availability", label: FILTER_LABELS[filters.availability] });
  if (filters.purchaseHistory !== "ALL") chips.push({ key: "purchaseHistory", label: FILTER_LABELS[filters.purchaseHistory] });
  if (filters.leadTime !== "ALL") chips.push({ key: "leadTime", label: `Lead time: ${FILTER_LABELS[filters.leadTime]}` });
  if (!chips.length) return null;
  return <div className="catalog-applied-filters" aria-label="Applied filters"><div>{chips.map((chip) => <button key={chip.key} type="button" onClick={() => onRemove(chip.key)}>{chip.label}<X size={14} aria-hidden="true" /><span className="sr-only">Remove {chip.label}</span></button>)}</div><button type="button" className="touch-target-inline" onClick={onClearAll}>Clear filters</button></div>;
};

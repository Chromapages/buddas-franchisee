"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { ChangeEvent } from "react";
import type { PortalProduct } from "@/src/features/portal/types";
import { Search, Check, ChevronRight, Clock3, LayoutGrid, List, MapPin, Minus, Plus, RotateCcw, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { mutatePortalCartAction } from "@/src/features/portal/cart-actions";
import { MAX_CART_QUANTITY } from "@/src/features/portal/cart-policy";
import { usePortalContext } from "@/src/features/portal/portal-context";
import { CatalogProductVisual } from "@/src/components/portal/catalog-product-visual";
import { CatalogProductStateBadge } from "@/src/components/portal/catalog-product-state-badge";
import { resolveCatalogProductState } from "@/src/features/portal/catalog-product-state";
import { trackOperatorWorkspaceEvent, type OperatorAnalyticsProperties } from "@/src/lib/analytics";
import { CatalogReplenishmentGuide, type CatalogReplenishmentItem } from "@/src/components/portal/catalog-replenishment-guide";
import { CatalogCurrentOrder } from "@/src/components/portal/catalog-current-order";
import { CatalogDesktopControls } from "./catalog-desktop-controls";
import {
  AppliedFilterChips,
  CatalogToolbar,
  FilterDrawer,
  SortSheet,
} from "@/src/components/portal/catalog-filter-controls";
import {
  DEFAULT_CATALOG_FILTERS,
  catalogFilterIsActive,
  filterCatalogProducts,
  getCatalogControlVisibility,
  normalizeCatalogSearchTerm,
  type CatalogAvailability,
  type CatalogFilters,
  type CatalogLeadTime,
  type CatalogPurchaseHistory,
  type CatalogSort,
} from "@/src/components/portal/catalog-filtering";

export type CatalogBrowserProps = {
  products: PortalProduct[];
  initialCartCount: number | null;
  locationId: string;
  locationName: string;
  canManageCart: boolean;
  initialCartQuantities: Record<string, number>;
  recentlyOrderedSkus: string[];
  replenishmentItems: CatalogReplenishmentItem[];
  replenishmentFailed: boolean;
};

type CatalogUrlState = {
  searchQuery: string;
  selectedCategory: string;
  availability: CatalogAvailability;
  purchaseHistory: CatalogPurchaseHistory;
  leadTime: CatalogLeadTime;
  sort: CatalogSort;
};

const purchaseUnitLabel = (packSize: string) => {
  const normalized = packSize.toLocaleLowerCase();
  if (normalized.includes("case")) return "case";
  if (normalized.includes("pack")) return "pack";
  if (normalized.includes("set")) return "set";
  if (normalized.includes("bag")) return "bag";
  if (normalized.includes("pail")) return "pail";
  if (normalized.includes("box")) return "box";
  if (normalized.includes("roll")) return "roll";
  if (normalized.includes("kit")) return "kit";
  if (normalized.includes("dozen")) return "dozen";
  if (normalized.includes("each")) return "each";
  return "unit";
};

const purchaseUnitQuantityLabel = (unit: string, quantity: number) => quantity === 1 || unit === "each" ? unit : `${unit}s`;

const itemCountLabel = (quantity: number) => `${quantity.toLocaleString("en-US")} item${quantity === 1 ? "" : "s"}`;

const unitsPerPurchase = (packSize: string) => {
  const match = packSize.match(/(?:pack|case|set|kit|box|dozen)\s+of\s+([\d,]+)|^([\d,]+)\s+per\s+(?:case|pack|set|kit|box|dozen)/i);
  const count = Number((match?.[1] || match?.[2] || "").replaceAll(",", ""));
  return Number.isInteger(count) && count > 1 ? count : null;
};

export const CatalogBrowser = ({
  products,
  initialCartCount,
  locationId,
  locationName,
  canManageCart,
  initialCartQuantities,
  recentlyOrderedSkus,
  replenishmentItems,
  replenishmentFailed,
}: CatalogBrowserProps) => {
  const { updateCount, counts, user, permittedUnits } = usePortalContext();
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(DEFAULT_CATALOG_FILTERS.category);
  const [availability, setAvailability] = useState<CatalogAvailability>(DEFAULT_CATALOG_FILTERS.availability);
  const [purchaseHistory, setPurchaseHistory] = useState<CatalogPurchaseHistory>(DEFAULT_CATALOG_FILTERS.purchaseHistory);
  const [leadTime, setLeadTime] = useState<CatalogLeadTime>(DEFAULT_CATALOG_FILTERS.leadTime);
  const [sort, setSort] = useState<CatalogSort>(DEFAULT_CATALOG_FILTERS.sort);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [cartQuantities, setCartQuantities] = useState(initialCartQuantities);
  const [stagedQuantities, setStagedQuantities] = useState<Record<string, number>>(() => Object.fromEntries(products.map((product) => [product.sku, initialCartQuantities[product.sku] || 1])));
  const [catalogView, setCatalogView] = useState<"browse" | "quick">("browse");
  const [cartPrices, setCartPrices] = useState<Record<string, number>>(() => Object.fromEntries(products.filter((product) => Number.isFinite(product.price) && product.price >= 0).map((product) => [product.sku, product.price])));
  const cartTotalCount = counts.cartItemCount ?? initialCartCount;
  const [notice, setNotice] = useState("");
  const [pendingSku, setPendingSku] = useState<string | null>(null);
  const inFlight = useRef(false);
  const addFeedbackStorageKey = `buddas-catalog-added:${locationId}`;
  const [addedSku, setAddedSku] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(addFeedbackStorageKey) || "null") as { sku?: string; createdAt?: number } | null;
      return saved?.sku && typeof saved.createdAt === "number" && Date.now() - saved.createdAt < 4000 ? saved.sku : null;
    } catch { return null; }
  });
  const [, startTransition] = useTransition();
  const [filtersHydrated, setFiltersHydrated] = useState(false);
  const filterStorageKey = `buddas-catalog-filters:${locationId}`;
  const viewStorageKey = `buddas-catalog-view:${locationId}`;
  const noticeStorageKey = `buddas-catalog-notice:${locationId}`;
  const suppliesViewed = useRef(false);
  const suppliesViewedAt = useRef<number | null>(null);
  const firstProductAdded = useRef(false);
  const lastTrackedSearch = useRef("");
  const analyticsContext = {
    role_category: user.role === "admin" ? "admin" as const : "franchisee" as const,
    location_scope_count: permittedUnits.length,
    location_scope: "active_unit" as const,
    route: "/portal/supplies" as const,
  };

  const readUrlState = (): CatalogUrlState | null => {
    const query = new URLSearchParams(window.location.search);
    if (!query.has("catalog")) return null;
    return {
      searchQuery: query.get("q") || "",
      selectedCategory: query.get("category") || "ALL",
      availability: (["ALL", "AVAILABLE"].includes(query.get("availability") || "") ? query.get("availability") : "ALL") as CatalogAvailability,
      purchaseHistory: (["ALL", "RECENTLY_ORDERED"].includes(query.get("history") || "") ? query.get("history") : "ALL") as CatalogPurchaseHistory,
      leadTime: (["ALL", "UP_TO_THREE_DAYS", "FOUR_OR_MORE_DAYS"].includes(query.get("lead") || "") ? query.get("lead") : "ALL") as CatalogLeadTime,
      sort: (["ORDER_GUIDE", "RELEVANCE", "NAME", "PRICE", "AVAILABILITY", "LEAD_TIME"].includes(query.get("sort") || "") ? query.get("sort") : "ORDER_GUIDE") as CatalogSort,
    };
  };

  const writeUrlState = (next: CatalogUrlState, mode: "pushState" | "replaceState") => {
    const url = new URL(window.location.href);
    const values: Array<[string, string, string]> = [["q", next.searchQuery, ""], ["category", next.selectedCategory, "ALL"], ["availability", next.availability, "ALL"], ["history", next.purchaseHistory, "ALL"], ["lead", next.leadTime, "ALL"], ["sort", next.sort, "ORDER_GUIDE"]];
    const active = values.some(([, value, fallback]) => value !== fallback);
    if (active) url.searchParams.set("catalog", "1"); else url.searchParams.delete("catalog");
    for (const [key, value, fallback] of values) {
      if (value === fallback) url.searchParams.delete(key); else url.searchParams.set(key, value);
    }
    window.history[mode](window.history.state, "", url);
  };

  useEffect(() => {
    if (suppliesViewed.current) return;
    suppliesViewed.current = true;
    suppliesViewedAt.current = Date.now();
    trackOperatorWorkspaceEvent("operator_supplies_viewed", { ...analyticsContext, result_count: products.length });
  }, [analyticsContext, products.length]);

  useEffect(() => {
    try {
      const fromUrl = readUrlState();
      const saved = fromUrl ? JSON.stringify(fromUrl) : window.sessionStorage.getItem(filterStorageKey);
      if (saved) {
        const value = JSON.parse(saved) as Record<string, unknown>;
        if (typeof value.searchQuery === "string") setSearchQuery(value.searchQuery);
        if (typeof value.selectedCategory === "string") setSelectedCategory(value.selectedCategory);
        if (["ALL", "AVAILABLE"].includes(String(value.availability))) setAvailability(value.availability as CatalogAvailability);
        if (["ALL", "RECENTLY_ORDERED"].includes(String(value.purchaseHistory))) setPurchaseHistory(value.purchaseHistory as CatalogPurchaseHistory);
        if (["ALL", "UP_TO_THREE_DAYS", "FOUR_OR_MORE_DAYS"].includes(String(value.leadTime))) setLeadTime(value.leadTime as CatalogLeadTime);
        if (["ORDER_GUIDE", "RELEVANCE", "NAME", "PRICE", "AVAILABILITY", "LEAD_TIME"].includes(String(value.sort))) setSort(value.sort as CatalogSort);
      }
    } catch {
      window.sessionStorage.removeItem(filterStorageKey);
    } finally {
      setFiltersHydrated(true);
    }
  }, [filterStorageKey]);

  useEffect(() => {
    const saved = window.sessionStorage.getItem(viewStorageKey);
    if (saved === "browse" || saved === "quick") setCatalogView(saved);
  }, [viewStorageKey]);

  const updateCatalogView = (view: "browse" | "quick") => {
    setCatalogView(view);
    window.sessionStorage.setItem(viewStorageKey, view);
  };

  useEffect(() => {
    if (!filtersHydrated) return;
    try { window.sessionStorage.setItem(filterStorageKey, JSON.stringify({ searchQuery, selectedCategory, availability, purchaseHistory, leadTime, sort })); } catch { /* URL state remains available when storage is disabled. */ }
    const timer = window.setTimeout(() => {
      writeUrlState({ searchQuery, selectedCategory, availability, purchaseHistory, leadTime, sort }, "replaceState");
    }, 350);
    return () => window.clearTimeout(timer);
  }, [availability, filterStorageKey, filtersHydrated, leadTime, purchaseHistory, searchQuery, selectedCategory, sort]);

  useEffect(() => {
    const restoreUrlState = () => {
      const state = readUrlState();
      if (!state) {
        setSearchQuery("");
        setSelectedCategory("ALL");
        setAvailability("ALL");
        setPurchaseHistory("ALL");
        setLeadTime("ALL");
        setSort("ORDER_GUIDE");
        return;
      }
      setSearchQuery(state.searchQuery);
      setSelectedCategory(state.selectedCategory);
      setAvailability(state.availability);
      setPurchaseHistory(state.purchaseHistory);
      setLeadTime(state.leadTime);
      setSort(state.sort);
    };
    window.addEventListener("popstate", restoreUrlState);
    return () => window.removeEventListener("popstate", restoreUrlState);
  }, []);

  useEffect(() => {
    const restoreNotice = () => {
      const saved = window.sessionStorage.getItem(noticeStorageKey);
      if (!saved) return;
      setNotice(saved);
      window.sessionStorage.removeItem(noticeStorageKey);
    };
    restoreNotice();
    window.addEventListener("buddas:catalog-notice", restoreNotice);
    return () => window.removeEventListener("buddas:catalog-notice", restoreNotice);
  }, [noticeStorageKey]);

  useEffect(() => {
    if (!addedSku) return;
    const timer = window.setTimeout(() => {
      setAddedSku(null);
      window.sessionStorage.removeItem(addFeedbackStorageKey);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [addFeedbackStorageKey, addedSku]);

  const publishNotice = (message: string) => {
    window.sessionStorage.setItem(noticeStorageKey, message);
    window.dispatchEvent(new Event("buddas:catalog-notice"));
    setNotice(message);
  };

  const categories = useMemo(() => ["ALL", ...Array.from(new Set(products.map((product) => product.category)))], [products]);
  const controlVisibility = useMemo(() => getCatalogControlVisibility({ products, recentlyOrderedSkus }), [products, recentlyOrderedSkus]);
  const effectiveControlVisibility = controlVisibility;

  useEffect(() => {
    if (!filtersHydrated) return;
    if (!effectiveControlVisibility.category) setSelectedCategory("ALL");
    if (!effectiveControlVisibility.availability) setAvailability("ALL");
    if (!effectiveControlVisibility.purchaseHistory) setPurchaseHistory("ALL");
    if (!effectiveControlVisibility.leadTime) setLeadTime("ALL");
    if (!effectiveControlVisibility.sort) setSort("ORDER_GUIDE");
  }, [effectiveControlVisibility, filtersHydrated]);

  const persistFilterState = (next: Partial<{ searchQuery: string; selectedCategory: string; availability: CatalogAvailability; purchaseHistory: CatalogPurchaseHistory; leadTime: CatalogLeadTime; sort: CatalogSort }>) => {
    if (!filtersHydrated) return;
    window.sessionStorage.setItem(filterStorageKey, JSON.stringify({
      searchQuery,
      selectedCategory,
      availability,
      purchaseHistory,
      leadTime,
      sort,
      ...next,
    }));
  };

  const updateSearchQuery = (value: string) => {
    setSearchQuery(value);
    persistFilterState({ searchQuery: value });
  };
  const updateCategory = (value: string) => {
    setSelectedCategory(value);
    persistFilterState({ selectedCategory: value });
    writeUrlState({ searchQuery, selectedCategory: value, availability, purchaseHistory, leadTime, sort }, "pushState");
    trackOperatorWorkspaceEvent("operator_supply_category_selected", { ...analyticsContext, category: value === "ALL" ? undefined : value as OperatorAnalyticsProperties["category"] });
  };
  const updateAvailability = (value: CatalogAvailability) => {
    setAvailability(value);
    persistFilterState({ availability: value });
    writeUrlState({ searchQuery, selectedCategory, availability: value, purchaseHistory, leadTime, sort }, "pushState");
  };
  const updatePurchaseHistory = (value: CatalogPurchaseHistory) => {
    setPurchaseHistory(value);
    persistFilterState({ purchaseHistory: value });
    writeUrlState({ searchQuery, selectedCategory, availability, purchaseHistory: value, leadTime, sort }, "pushState");
  };
  const updateLeadTime = (value: CatalogLeadTime) => {
    setLeadTime(value);
    persistFilterState({ leadTime: value });
    writeUrlState({ searchQuery, selectedCategory, availability, purchaseHistory, leadTime: value, sort }, "pushState");
  };
  const updateSort = (value: CatalogSort) => {
    setSort(value);
    persistFilterState({ sort: value });
    writeUrlState({ searchQuery, selectedCategory, availability, purchaseHistory, leadTime, sort: value }, "pushState");
    const sortMap: Record<CatalogSort, NonNullable<OperatorAnalyticsProperties["sort"]>> = { ORDER_GUIDE: "recently_ordered", RELEVANCE: "relevance", NAME: "name", PRICE: "price", AVAILABILITY: "availability", LEAD_TIME: "lead_time" };
    trackOperatorWorkspaceEvent("operator_supply_sort_changed", { ...analyticsContext, sort: sortMap[value] });
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateSearchQuery(e.target.value);
  };

  const searchTerm = normalizeCatalogSearchTerm(deferredSearchQuery);
  const typedSearchTerm = normalizeCatalogSearchTerm(searchQuery);
  const activeCatalogFilterCount = [selectedCategory !== "ALL", availability !== "ALL", purchaseHistory !== "ALL", leadTime !== "ALL"].filter(Boolean).length;

  const handleSaveQuantity = (product: PortalProduct, requestedQuantity: number, purchasePath: "repeat" | "discovery" = "discovery") => {
    if (inFlight.current || !canManageCart || !product.isAvailable || !Number.isFinite(product.price) || product.price < 0) return;
    const quantity = Math.max(0, Math.min(MAX_CART_QUANTITY, Math.trunc(requestedQuantity) || 0));
    const previousQuantity = cartQuantities[product.sku] ?? 0;
    inFlight.current = true;
    setPendingSku(product.sku);
    setNotice("");
    setAddedSku(null);
    window.sessionStorage.removeItem(addFeedbackStorageKey);
    startTransition(async () => {
      try {
        const result = await mutatePortalCartAction({ locationId, sku: product.sku, quantity });
        if (result.status === "error") throw new Error(result.message);
        updateCount("cartItemCount", result.count);
        setCartQuantities(Object.fromEntries(result.items.map((item) => [item.sku, item.quantity])));
        setStagedQuantities((current) => ({ ...current, [product.sku]: Math.max(1, result.items.find((item) => item.sku === product.sku)?.quantity ?? 1) }));
        setCartPrices((current) => ({ ...current, ...Object.fromEntries(result.items.map((item) => [item.sku, item.product.price])) }));
        const unit = purchaseUnitLabel(product.packSize);
        const confirmedQuantity = result.items.find((item) => item.sku === product.sku)?.quantity ?? 0;
        if (previousQuantity === 0 && confirmedQuantity > 0) {
          window.sessionStorage.setItem(addFeedbackStorageKey, JSON.stringify({ sku: product.sku, createdAt: Date.now() }));
          setAddedSku(product.sku);
        }
        const confirmedUnitLabel = purchaseUnitQuantityLabel(unit, confirmedQuantity);
        const subtotal = result.items.reduce((total, item) => total + item.quantity * item.product.price, 0);
        const currentOrderSummary = `${result.count} ${result.count === 1 ? "item" : "items"} · ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(subtotal)}`;
        publishNotice(confirmedQuantity === 0
          ? `${product.name} removed from current order. ${currentOrderSummary}.`
          : previousQuantity === 0
            ? `${product.name}: ${confirmedQuantity} ${confirmedUnitLabel} added to current order. ${currentOrderSummary}.`
            : `${product.name}: ${confirmedQuantity} ${confirmedUnitLabel} in current order. ${currentOrderSummary}.`);
        const productState = resolveCatalogProductState(product);
        const cartAction = previousQuantity === 0 && confirmedQuantity > 0 ? purchasePath === "repeat" ? "quick_reorder" as const : "add" as const : confirmedQuantity === 0 ? "remove" as const : "update" as const;
        const isFirstAdd = (cartAction === "add" || cartAction === "quick_reorder") && !firstProductAdded.current;
        const timeToFirstProductAdded = isFirstAdd && suppliesViewedAt.current !== null
          ? Date.now() - suppliesViewedAt.current
          : undefined;
        if (isFirstAdd) firstProductAdded.current = true;
        const productProperties = { ...analyticsContext, category: product.category, sku: product.sku, quantity: confirmedQuantity, availability_state: productState.code, lead_time_bucket: product.leadTimeDays <= 3 ? "up_to_3_days" as const : "4_plus_days" as const, cart_item_count: result.count, filter_count: activeCatalogFilterCount, purchase_path: purchasePath, cart_action: cartAction, ...(timeToFirstProductAdded !== undefined ? { time_to_first_product_added_ms: timeToFirstProductAdded } : {}) };
        trackOperatorWorkspaceEvent(previousQuantity === 0 && quantity > 0 ? "operator_supply_added" : quantity === 0 ? "operator_supply_removed" : "operator_supply_quantity_changed", productProperties);
      } catch (error) {
        const message = error instanceof Error && error.message ? error.message : "This item could not be updated. Check your connection and working unit, then try again.";
        const supply_error_category = /active unit|available|quantity|valid/i.test(message) ? "validation" as const : "unknown" as const;
        trackOperatorWorkspaceEvent("operator_supply_cart_update_failed", { ...analyticsContext, category: product.category, sku: product.sku, quantity, cart_action: previousQuantity === 0 ? purchasePath === "repeat" ? "quick_reorder" : "add" : quantity === 0 ? "remove" : "update", supply_error_category, filter_count: activeCatalogFilterCount });
        publishNotice(message);
      } finally {
        inFlight.current = false;
        setPendingSku(null);
      }
    });
  };


  const filters = useMemo<CatalogFilters>(() => ({ category: selectedCategory, availability, purchaseHistory, leadTime, sort }), [availability, leadTime, purchaseHistory, selectedCategory, sort]);
  const filteredProducts = useMemo(() => filterCatalogProducts({ products, filters, searchTerm, recentlyOrderedSkus }), [filters, products, recentlyOrderedSkus, searchTerm]);
  const trackFacetMutation = (next: CatalogFilters) => {
    const nextFilterCount = [next.category !== "ALL", next.availability !== "ALL", next.purchaseHistory !== "ALL", next.leadTime !== "ALL"].filter(Boolean).length;
    trackOperatorWorkspaceEvent(nextFilterCount < activeCatalogFilterCount ? "operator_supply_filter_removed" : "operator_supply_filter_applied", { ...analyticsContext, filter_count: Math.abs(nextFilterCount - activeCatalogFilterCount) || 1, result_count: filterCatalogProducts({ products, filters: next, searchTerm, recentlyOrderedSkus }).length });
  };
  const cartSubtotal = Object.entries(cartQuantities).reduce((total, [sku, quantity]) => total + quantity * (cartPrices[sku] ?? 0), 0);
  const currentOrderItems = products.flatMap((product) => (cartQuantities[product.sku] ?? 0) > 0 ? [{ product, quantity: cartQuantities[product.sku] }] : []);
  const historyBySku = useMemo(() => new Map(replenishmentItems.map((item) => [item.sku, item])), [replenishmentItems]);
  const filtersActive = catalogFilterIsActive(filters, searchQuery);
  const facetsActive = filters.category !== "ALL" || filters.availability !== "ALL" || filters.purchaseHistory !== "ALL" || filters.leadTime !== "ALL";
  const clearFilters = () => {
    if (activeCatalogFilterCount) trackOperatorWorkspaceEvent("operator_supply_filter_removed", { ...analyticsContext, filter_count: activeCatalogFilterCount, route: "/portal/supplies" });
    setSearchQuery("");
    setSelectedCategory(DEFAULT_CATALOG_FILTERS.category);
    setAvailability(DEFAULT_CATALOG_FILTERS.availability);
    setPurchaseHistory(DEFAULT_CATALOG_FILTERS.purchaseHistory);
    setLeadTime(DEFAULT_CATALOG_FILTERS.leadTime);
    setSort(DEFAULT_CATALOG_FILTERS.sort);
    persistFilterState({ searchQuery: "", selectedCategory: DEFAULT_CATALOG_FILTERS.category, availability: DEFAULT_CATALOG_FILTERS.availability, purchaseHistory: DEFAULT_CATALOG_FILTERS.purchaseHistory, leadTime: DEFAULT_CATALOG_FILTERS.leadTime, sort: DEFAULT_CATALOG_FILTERS.sort });
    writeUrlState({ searchQuery: "", selectedCategory: "ALL", availability: "ALL", purchaseHistory: "ALL", leadTime: "ALL", sort: "ORDER_GUIDE" }, "pushState");
  };
  const clearFacetFilters = () => {
    if (activeCatalogFilterCount) trackOperatorWorkspaceEvent("operator_supply_filter_removed", { ...analyticsContext, filter_count: activeCatalogFilterCount, route: "/portal/supplies" });
    setSelectedCategory("ALL");
    setAvailability("ALL");
    setPurchaseHistory("ALL");
    setLeadTime("ALL");
    persistFilterState({ selectedCategory: "ALL", availability: "ALL", purchaseHistory: "ALL", leadTime: "ALL" });
    writeUrlState({ searchQuery, selectedCategory: "ALL", availability: "ALL", purchaseHistory: "ALL", leadTime: "ALL", sort }, "pushState");
  };
  const clearSearch = () => updateSearchQuery("");
  useEffect(() => {
    if (!searchTerm) {
      lastTrackedSearch.current = "";
      return;
    }
    const timer = window.setTimeout(() => {
      if (lastTrackedSearch.current === searchTerm) return;
      lastTrackedSearch.current = searchTerm;
      const exactSku = products.find((product) => normalizeCatalogSearchTerm(product.sku) === searchTerm);
      const exactName = products.find((product) => normalizeCatalogSearchTerm(product.name) === searchTerm);
      const exactCategory = products.find((product) => normalizeCatalogSearchTerm(product.category) === searchTerm);
      const onlyResult = filteredProducts.length === 1 ? filteredProducts[0] : undefined;
      const matchedProduct = exactSku || exactName || onlyResult;
      const search_match_type = exactSku ? "exact_sku" as const : exactName ? "exact_name" as const : exactCategory ? "category" as const : filteredProducts.length ? "partial" as const : "no_results" as const;
      const properties = { ...analyticsContext, result_count: filteredProducts.length, search_match_type, ...(matchedProduct ? { sku: matchedProduct.sku, category: matchedProduct.category } : exactCategory ? { category: exactCategory.category } : {}) };
      trackOperatorWorkspaceEvent("operator_supply_search_submitted", properties);
      if (!filteredProducts.length) trackOperatorWorkspaceEvent("operator_supply_search_no_results", properties);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [analyticsContext, filteredProducts, products, searchTerm]);
  useEffect(() => {
    const revealFocusedControl = (event: FocusEvent) => {
      if (!(event.target instanceof HTMLElement)) return;
      const target = event.target;
      const catalog = target.closest<HTMLElement>(".catalog-browser");
      const dock = catalog?.querySelector<HTMLElement>(".catalog-cart-summary");
      if (!catalog || !dock) return;
      requestAnimationFrame(() => {
        const controlBounds = target.getBoundingClientRect();
        const dockBounds = dock.getBoundingClientRect();
        if (!controlBounds || controlBounds.bottom <= dockBounds.top - 8) return;
        // Scroll the focused control through its actual scrolling ancestor first.
        // The portal shell owns scrolling on some breakpoints, while the document
        // owns it on others; scrollIntoView handles both without guessing.
        target.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
        requestAnimationFrame(() => {
          const updatedControlBounds = target.getBoundingClientRect();
          const updatedDockBounds = dock.getBoundingClientRect();
          if (!updatedControlBounds || updatedControlBounds.bottom <= updatedDockBounds.top - 8) return;
          const offset = updatedControlBounds.bottom - updatedDockBounds.top + 12;
          const workspace = catalog.closest<HTMLElement>(".portal-shell-workspace");
          if (workspace && workspace.scrollHeight > workspace.clientHeight) workspace.scrollBy({ top: offset, behavior: "auto" });
          else window.scrollBy({ top: offset, behavior: "auto" });
        });
      });
    };
    document.addEventListener("focusin", revealFocusedControl);
    return () => document.removeEventListener("focusin", revealFocusedControl);
  }, []);

  const currentOrderTotal = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cartSubtotal);
  const currentOrderCommand = canManageCart ? <Link href="/portal/cart" className="catalog-command-order" aria-label={`Open current order${cartTotalCount === null ? ". Item count unavailable." : `. ${cartTotalCount} ${cartTotalCount === 1 ? "item" : "items"}. Current item subtotal ${currentOrderTotal}.`}`} onClick={() => trackOperatorWorkspaceEvent("operator_supply_current_order_opened", { ...analyticsContext, cart_item_count: cartTotalCount ?? undefined, product_count: currentOrderItems.length })}><ShoppingCart size={20} aria-hidden="true" /><span><small>Current order</small><strong>{cartTotalCount === null ? "Unavailable" : `${cartTotalCount} ${cartTotalCount === 1 ? "item" : "items"} · ${currentOrderTotal}`}</strong></span><ChevronRight size={18} aria-hidden="true" /></Link> : null;

  if (products.length === 0) {
    return (
      <div className="catalog-browser space-y-5">
        {currentOrderCommand ? <div className="catalog-command-row catalog-command-row-order-only">{currentOrderCommand}</div> : null}
        <div role="status" className="portal-empty-state flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h2 className="heading-minor text-bds-teal-dark">No approved supplies</h2>
            <p className="text-sm text-bds-cocoa/80">This unit does not currently have products available in its catalog.</p>
          </div>
          <Link href="/portal/support" className="touch-target-inline shrink-0 text-xs font-bold uppercase tracking-wider text-bds-teal-dark underline underline-offset-4">Contact support</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`catalog-browser space-y-5${effectiveControlVisibility.refinementRail ? " catalog-with-refinement-rail" : ""}`}>
      <div className="catalog-command-row">
        <div className="catalog-command-location" aria-label={`Shipping to ${locationName}, unit ${locationId}`}><span>Shipping to</span><div className="catalog-command-location-control"><MapPin size={18} aria-hidden="true" /><strong>{locationName}</strong></div></div>
        <form className="catalog-search-dock" role="search" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="catalog-search" className="sr-only">Search supplies</label>
          <div className="catalog-search relative w-full">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-bds-cocoa/40" aria-hidden="true" />
            <input
              id="catalog-search"
              aria-describedby="catalog-result-count"
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search supplies by name, SKU, or category…"
              className="w-full pl-12 pr-20 py-3 bg-white border border-bds-teal-dark/20 rounded-xl text-sm font-semibold text-bds-teal-dark placeholder:text-bds-cocoa/50 focus:outline-none focus:ring-2 focus:ring-bds-teal focus:border-bds-teal"
            />
            {searchQuery ? <button type="button" className="catalog-search-clear" onClick={clearSearch} aria-label="Clear search"><X size={16} aria-hidden="true" /><span>Clear</span></button> : null}
          </div>
        </form>
        <div className="catalog-view-switcher" role="group" aria-label="Catalog workspace mode">
          <button type="button" aria-pressed={catalogView === "browse"} onClick={() => updateCatalogView("browse")}><LayoutGrid size={17} aria-hidden="true" />Browse</button>
          <button type="button" aria-pressed={catalogView === "quick"} onClick={() => updateCatalogView("quick")}><List size={17} aria-hidden="true" />Quick Order</button>
        </div>
      </div>

      {replenishmentFailed ? <div className="catalog-history-error" role="status"><p>Recent purchases could not be loaded. The catalog remains available.</p><button type="button" onClick={() => window.location.reload()}>Retry order history</button></div> : <CatalogReplenishmentGuide items={replenishmentItems} products={products} cartQuantities={cartQuantities} pendingSku={pendingSku} canManageCart={canManageCart} onAddLastQuantity={(product, quantity) => handleSaveQuantity(product, quantity, "repeat")} />}

      <div className="catalog-procurement-workspace">
      <div className="catalog-workspace-results">
      <CatalogDesktopControls categories={categories.filter((category) => category !== "ALL")} filters={filters} hasHistory={recentlyOrderedSkus.length > 0} resultCount={filteredProducts.length} totalCount={products.length} searchQuery={searchQuery} showCategory={effectiveControlVisibility.category} showAvailability={effectiveControlVisibility.availability} showLeadTime={effectiveControlVisibility.leadTime} showHistory={effectiveControlVisibility.purchaseHistory} showSort={effectiveControlVisibility.sort} onCategory={(value) => { trackFacetMutation({ ...filters, category: value }); updateCategory(value); }} onAvailability={(value) => { trackFacetMutation({ ...filters, availability: value }); updateAvailability(value); }} onLeadTime={(value) => { trackFacetMutation({ ...filters, leadTime: value }); updateLeadTime(value); }} onHistory={(value) => { trackFacetMutation({ ...filters, purchaseHistory: value }); updatePurchaseHistory(value); }} onSort={updateSort} />
      <div className="catalog-workspace-main">

      {filteredProducts.length === 0 ? (
        <div role="status" className="portal-empty-state catalog-search-empty space-y-1">
          <h2 className="heading-minor text-bds-teal-dark">
            {searchQuery.trim() ? `No approved supplies found for “${searchQuery.trim()}”.` : "No approved supplies match these filters."}
          </h2>
          <p className="text-sm text-bds-cocoa/70">
            Search SKU, product name, or category. You can also remove filters or browse an approved category.
          </p>
          <div className="catalog-empty-actions">
            {searchQuery.trim() ? <button type="button" onClick={clearSearch} className="touch-target-inline underline">Clear search</button> : null}
            {facetsActive ? <button type="button" onClick={clearFacetFilters} className="touch-target-inline underline"><RotateCcw size={16} aria-hidden="true" />Clear filters</button> : null}
          </div>
          <div className="catalog-category-fallback" aria-label="Browse an approved category"><span>Browse a category</span>{categories.filter((category) => category !== "ALL").map((category) => <button key={category} type="button" onClick={() => { clearSearch(); updateCategory(category); updateAvailability("ALL"); }}>{category}</button>)}</div>
        </div>
      ) : null}

      <CatalogToolbar
        filters={filters}
        showCategory={effectiveControlVisibility.category}
        showFilters={effectiveControlVisibility.filter}
        showSort={effectiveControlVisibility.sort}
        onOpenFilters={() => setFilterDrawerOpen(true)}
        onOpenSort={() => setSortSheetOpen(true)}
      />

      <AppliedFilterChips
        filters={filters}
        onClearAll={clearFacetFilters}
        onRemove={(key) => {
          if (["category", "availability", "purchaseHistory", "leadTime"].includes(key)) trackOperatorWorkspaceEvent("operator_supply_filter_removed", { ...analyticsContext, filter_count: 1, route: "/portal/supplies" });
          if (key === "search") clearSearch();
          if (key === "category") updateCategory(DEFAULT_CATALOG_FILTERS.category);
          if (key === "availability") updateAvailability(DEFAULT_CATALOG_FILTERS.availability);
          if (key === "purchaseHistory") updatePurchaseHistory(DEFAULT_CATALOG_FILTERS.purchaseHistory);
          if (key === "leadTime") updateLeadTime(DEFAULT_CATALOG_FILTERS.leadTime);
          if (key === "sort") updateSort(DEFAULT_CATALOG_FILTERS.sort);
        }}
      />

      <div className="catalog-results-summary"><p id="catalog-result-count" aria-live="polite"><strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? "approved product" : "approved products"}{typedSearchTerm !== searchTerm ? ", updating results" : searchTerm ? ` for “${searchQuery.trim()}”` : ""}</p>{filtersActive ? <button type="button" onClick={clearFilters}><RotateCcw size={16} aria-hidden="true" />Clear all</button> : null}</div>
      <p role="status" aria-live="polite" aria-atomic="true" className={notice ? "catalog-feedback" : "sr-only"}>{notice}</p>

      {effectiveControlVisibility.filter || effectiveControlVisibility.category ? <FilterDrawer categories={categories.filter((category) => category !== "ALL")} filters={filters} hasRecentOrders={effectiveControlVisibility.purchaseHistory} showCategory={effectiveControlVisibility.category} showAvailability={effectiveControlVisibility.availability} showLeadTime={effectiveControlVisibility.leadTime} open={filterDrawerOpen} products={products} recentlyOrderedSkus={recentlyOrderedSkus} searchTerm={searchTerm} onClose={() => setFilterDrawerOpen(false)} onApply={({ category: nextCategory, availability: nextAvailability, purchaseHistory: nextPurchaseHistory, leadTime: nextLeadTime }) => { const next = { ...filters, category: nextCategory, availability: nextAvailability, purchaseHistory: nextPurchaseHistory, leadTime: nextLeadTime }; setSelectedCategory(nextCategory); setAvailability(nextAvailability); setPurchaseHistory(nextPurchaseHistory); setLeadTime(nextLeadTime); persistFilterState({ selectedCategory: nextCategory, availability: nextAvailability, purchaseHistory: nextPurchaseHistory, leadTime: nextLeadTime }); writeUrlState({ searchQuery, selectedCategory: nextCategory, availability: nextAvailability, purchaseHistory: nextPurchaseHistory, leadTime: nextLeadTime, sort }, "pushState"); if (nextCategory !== selectedCategory) trackOperatorWorkspaceEvent("operator_supply_category_selected", { ...analyticsContext, category: nextCategory === "ALL" ? undefined : nextCategory as OperatorAnalyticsProperties["category"] }); trackOperatorWorkspaceEvent("operator_supply_filter_applied", { ...analyticsContext, filter_count: [next.category !== "ALL", next.availability !== "ALL", next.purchaseHistory !== "ALL", next.leadTime !== "ALL"].filter(Boolean).length, result_count: filterCatalogProducts({ products, filters: next, searchTerm, recentlyOrderedSkus }).length }); }} /> : null}
      {effectiveControlVisibility.sort ? <SortSheet hasHistory={recentlyOrderedSkus.length > 0} open={sortSheetOpen} searchTerm={searchTerm} selectedSort={sort} showAvailability={effectiveControlVisibility.availability} showLeadTime={effectiveControlVisibility.leadTime} onClose={() => setSortSheetOpen(false)} onSelect={updateSort} /> : null}

      {catalogView === "browse" ? <ul className="catalog-grid grid gap-6" aria-label="Approved supplies">
        {filteredProducts.map((product, index) => {
          const currentQuantity = cartQuantities[product.sku] ?? 0;
          const purchaseUnit = purchaseUnitLabel(product.packSize);
          const itemsInPurchase = unitsPerPurchase(product.packSize);
          const priorOrder = historyBySku.get(product.sku);
          const selectedQuantity = currentQuantity || 1;
          const currency = Number.isFinite(product.price) && product.price >= 0
            ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
            : null;
          const leadTime = Number.isFinite(product.leadTimeDays) && product.leadTimeDays >= 0
            ? `${product.leadTimeDays} business day${product.leadTimeDays === 1 ? "" : "s"}`
            : "Lead time unavailable";
          const productState = resolveCatalogProductState(product);
          const canOrder = canManageCart && productState.canOrder && Number.isFinite(product.price) && product.price >= 0;
          return (
          <li key={product.id}><article className="catalog-product-card product-order-row mobile-workspace-panel rounded-2xl border border-bds-teal-dark/15 bg-white p-5 shadow-sm">
            <header className="catalog-product-card-header">
              <p className="catalog-product-category">{product.category}</p>
            </header>
            <div className="catalog-product-identity">
            <div className="catalog-product-image-link">
              <CatalogProductVisual product={product} className="catalog-product-image relative overflow-hidden rounded-xl bg-bds-cream/60 border border-bds-teal-dark/10" sizes="(max-width: 1023px) 100vw, 352px" priority={index === 0 && replenishmentItems.length === 0} />
            </div>
              <div className="catalog-product-body catalog-product-copy">
                <h2 className="catalog-product-name"><Link href={`/portal/supplies/${encodeURIComponent(product.slug)}`} onClick={() => trackOperatorWorkspaceEvent("operator_supply_product_opened", { ...analyticsContext, category: product.category as OperatorAnalyticsProperties["category"], sku: product.sku, availability_state: productState.code, lead_time_bucket: product.leadTimeDays <= 3 ? "up_to_3_days" : "4_plus_days", purchase_path: recentlyOrderedSkus.includes(product.sku) ? "repeat" : "discovery" })}>{product.name}</Link></h2>
                <CatalogProductStateBadge product={product} />
                <p className="catalog-product-pack">{product.packSize}</p>
                <div className="catalog-product-meta">{product.sku ? <span>SKU {product.sku}</span> : null}{Number.isFinite(product.leadTimeDays) && product.leadTimeDays >= 0 ? <span>Ships in ~{leadTime}</span> : null}{searchTerm && normalizeCatalogSearchTerm(product.sku) === searchTerm ? <span className="catalog-exact-sku"><Check size={14} aria-hidden="true" />Exact SKU match</span> : null}</div>
                <dl className="catalog-product-price">{currency ? <><div><dt>Price</dt><dd className="catalog-price-primary"><strong>{currency.format(product.price)}</strong><span>per {purchaseUnit}</span></dd></div>{itemsInPurchase ? <div><dt>Contents</dt><dd><small>{itemCountLabel(itemsInPurchase)} · {currency.format(product.price / itemsInPurchase)} each</small></dd></div> : null}</> : <div><dt>Price</dt><dd>Price unavailable</dd></div>}</dl>
              </div>
            </div>

            <footer className="catalog-product-footer">
              <div className="catalog-product-action">
              {canOrder ? <CatalogQuantityAction product={product} unit={purchaseUnit} quantity={stagedQuantities[product.sku] || selectedQuantity} confirmedQuantity={currentQuantity} pending={pendingSku !== null} onQuantity={(quantity) => setStagedQuantities((current) => ({ ...current, [product.sku]: quantity }))} onCommit={(quantity) => handleSaveQuantity(product, quantity)} /> : <CatalogProductStateBadge product={product} includeDescription />}
              </div>
              {priorOrder ? <p className="catalog-product-history"><Clock3 size={16} aria-hidden="true" />Last ordered {priorOrder.lastOrderedLabel} · {priorOrder.lastQuantity} {purchaseUnitQuantityLabel(purchaseUnit, priorOrder.lastQuantity)}</p> : null}
            </footer>
          </article></li>
          );
        })}
      </ul> : <CatalogQuickOrder products={filteredProducts} cartQuantities={cartQuantities} stagedQuantities={stagedQuantities} pendingSku={pendingSku} canManageCart={canManageCart} onQuantity={(sku, quantity) => setStagedQuantities((current) => ({ ...current, [sku]: quantity }))} onCommit={handleSaveQuantity} />}
      </div>
      </div>
      <CatalogCurrentOrder locationName={locationName} items={currentOrderItems} subtotal={cartSubtotal} pendingSku={pendingSku} notice={notice} onUpdate={handleSaveQuantity} />
      </div>
    </div>
  );
};

const CatalogQuantityAction = ({ product, unit, quantity, confirmedQuantity, pending, onQuantity, onCommit }: { product: PortalProduct; unit: string; quantity: number; confirmedQuantity: number; pending: boolean; onQuantity: (quantity: number) => void; onCommit: (quantity: number) => void }) => {
  const setQuantity = (value: number) => onQuantity(Math.max(1, Math.min(MAX_CART_QUANTITY, Math.trunc(value) || 1)));
  const inCurrentOrder = confirmedQuantity > 0 && confirmedQuantity === quantity;
  return <div className="catalog-quantity-action"><div className="catalog-quantity-field"><label htmlFor={`catalog-quantity-${product.id}`}>Quantity — {purchaseUnitQuantityLabel(unit, 2)}</label><div><button type="button" disabled={pending || quantity <= 1} onClick={() => setQuantity(quantity - 1)} aria-label={`Decrease ${product.name} quantity`}><Minus size={16} aria-hidden="true" /></button><input id={`catalog-quantity-${product.id}`} type="number" min="1" max={MAX_CART_QUANTITY} step="1" inputMode="numeric" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} aria-label={`Quantity — ${product.name}, ${purchaseUnitQuantityLabel(unit, 2)}`} /><button type="button" disabled={pending || quantity >= MAX_CART_QUANTITY} onClick={() => setQuantity(quantity + 1)} aria-label={`Increase ${product.name} quantity`}><Plus size={16} aria-hidden="true" /></button></div></div>{pending ? <p className="catalog-row-order-state" role="status">Saving…</p> : inCurrentOrder ? <p className="catalog-row-order-state"><Check size={16} aria-hidden="true" /><span>In current order</span><strong>{confirmedQuantity} {purchaseUnitQuantityLabel(unit, confirmedQuantity)}</strong></p> : <button type="button" className="catalog-row-add" onClick={() => onCommit(quantity)} aria-label={confirmedQuantity ? `Update ${product.name} order quantity` : `Add ${product.name} to order`}><ShoppingCart size={16} aria-hidden="true" />{confirmedQuantity ? "Update order" : "Add to order"}</button>}</div>;
};

const CatalogQuickOrder = ({ products, cartQuantities, stagedQuantities, pendingSku, canManageCart, onQuantity, onCommit }: { products: PortalProduct[]; cartQuantities: Record<string, number>; stagedQuantities: Record<string, number>; pendingSku: string | null; canManageCart: boolean; onQuantity: (sku: string, quantity: number) => void; onCommit: (product: PortalProduct, quantity: number) => void }) => <div className="catalog-quick-order"><table><caption>Quick Order approved supplies</caption><thead><tr><th scope="col">Product / SKU</th><th scope="col">Order unit</th><th scope="col">Price</th><th scope="col">Fulfillment</th><th scope="col">Quantity</th><th scope="col">Action</th></tr></thead><tbody>{products.map((product) => {
  const unit = purchaseUnitLabel(product.packSize);
  const quantity = stagedQuantities[product.sku] || cartQuantities[product.sku] || 1;
  const confirmedQuantity = cartQuantities[product.sku] || 0;
  const canOrder = canManageCart && product.isAvailable && Number.isFinite(product.price) && product.price >= 0;
  const inCurrentOrder = confirmedQuantity > 0 && confirmedQuantity === quantity;
  return <tr key={product.id}><th scope="row"><Link href={`/portal/supplies/${encodeURIComponent(product.slug)}`}>{product.name}</Link><span>{product.sku}</span></th><td>{product.packSize}</td><td>{Number.isFinite(product.price) && product.price >= 0 ? <><strong>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(product.price)}</strong><span> per {unit}</span></> : "Unavailable"}</td><td>{Number.isFinite(product.leadTimeDays) && product.leadTimeDays >= 0 ? `Ships in ~${product.leadTimeDays} business days` : "Estimate unavailable"}</td><td><label className="sr-only" htmlFor={`quick-quantity-${product.id}`}>{`Quantity — ${product.name}, ${purchaseUnitQuantityLabel(unit, 2)}`}</label><input id={`quick-quantity-${product.id}`} type="number" min="1" max={MAX_CART_QUANTITY} step="1" inputMode="numeric" value={quantity} onChange={(event) => onQuantity(product.sku, Math.max(1, Math.min(MAX_CART_QUANTITY, Math.trunc(Number(event.target.value)) || 1)))} /></td><td>{canOrder ? pendingSku === product.sku ? <span className="catalog-quick-order-state" role="status">Saving…</span> : inCurrentOrder ? <span className="catalog-quick-order-state"><Check size={16} aria-hidden="true" />In current order</span> : <button type="button" disabled={pendingSku !== null} onClick={() => onCommit(product, quantity)} aria-label={`${confirmedQuantity ? "Update order quantity" : "Add to order"} — ${product.name}`}>{confirmedQuantity ? "Update" : "Add"}</button> : <span>Not orderable</span>}</td></tr>;
})}</tbody></table></div>;

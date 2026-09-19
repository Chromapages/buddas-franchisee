import type { PortalProduct } from "@/src/features/portal/types";

export type CatalogAvailability = "ALL" | "AVAILABLE" | "UNAVAILABLE";
export type CatalogPurchaseHistory = "ALL" | "RECENTLY_ORDERED";
export type CatalogLeadTime = "ALL" | "UP_TO_THREE_DAYS" | "FOUR_OR_MORE_DAYS";
export type CatalogSort = "ORDER_GUIDE" | "RELEVANCE" | "NAME" | "PRICE" | "AVAILABILITY" | "LEAD_TIME";

export type CatalogFilters = {
  category: string;
  availability: CatalogAvailability;
  purchaseHistory: CatalogPurchaseHistory;
  leadTime: CatalogLeadTime;
  sort: CatalogSort;
};

export const DEFAULT_CATALOG_FILTERS: CatalogFilters = {
  category: "ALL",
  availability: "ALL",
  purchaseHistory: "ALL",
  leadTime: "ALL",
  sort: "ORDER_GUIDE",
};

export const normalizeCatalogSearchTerm = (value: string) => value.normalize("NFKC").trim().toLocaleLowerCase();

export const catalogSearchRelevance = (product: PortalProduct, searchTerm: string): number | null => {
  if (!searchTerm) return 0;
  const sku = normalizeCatalogSearchTerm(product.sku);
  const name = normalizeCatalogSearchTerm(product.name);
  const category = normalizeCatalogSearchTerm(product.category);
  if (sku === searchTerm) return 0;
  if (name === searchTerm) return 1;
  if (sku.startsWith(searchTerm)) return 2;
  if (name.startsWith(searchTerm)) return 3;
  if (category === searchTerm) return 4;
  if (sku.includes(searchTerm)) return 5;
  if (name.includes(searchTerm)) return 6;
  if (category.includes(searchTerm)) return 7;
  return null;
};

export const matchesCatalogFilters = (product: PortalProduct, filters: CatalogFilters, recentlyOrderedSkus: string[]) => {
  const matchesCategory = filters.category === "ALL" || product.category === filters.category;
  const matchesAvailability = filters.availability === "ALL"
    || (filters.availability === "AVAILABLE" ? product.isAvailable : !product.isAvailable);
  const matchesPurchaseHistory = filters.purchaseHistory === "ALL" || recentlyOrderedSkus.includes(product.sku);
  const matchesLeadTime = filters.leadTime === "ALL"
    || (filters.leadTime === "UP_TO_THREE_DAYS" ? product.leadTimeDays <= 3 : product.leadTimeDays >= 4);
  return matchesCategory && matchesAvailability && matchesPurchaseHistory && matchesLeadTime;
};

export const filterCatalogProducts = ({
  products,
  filters,
  searchTerm,
  recentlyOrderedSkus,
}: {
  products: PortalProduct[];
  filters: CatalogFilters;
  searchTerm: string;
  recentlyOrderedSkus: string[];
}) => products
  .filter((product) => matchesCatalogFilters(product, filters, recentlyOrderedSkus) && catalogSearchRelevance(product, searchTerm) !== null)
  .sort((left, right) => {
    const effectiveSort = filters.sort === "ORDER_GUIDE" && searchTerm ? "RELEVANCE" : filters.sort;
    if (effectiveSort === "RELEVANCE") {
      const relevance = (catalogSearchRelevance(left, searchTerm) ?? Number.MAX_SAFE_INTEGER) - (catalogSearchRelevance(right, searchTerm) ?? Number.MAX_SAFE_INTEGER);
      if (relevance) return relevance;
    }
    if (effectiveSort === "NAME") return left.name.localeCompare(right.name);
    if (effectiveSort === "PRICE") return left.price - right.price || left.name.localeCompare(right.name);
    if (effectiveSort === "AVAILABILITY") return Number(right.isAvailable) - Number(left.isAvailable) || left.name.localeCompare(right.name);
    if (effectiveSort === "LEAD_TIME") return left.leadTimeDays - right.leadTimeDays || left.name.localeCompare(right.name);
    const leftRecent = recentlyOrderedSkus.indexOf(left.sku);
    const rightRecent = recentlyOrderedSkus.indexOf(right.sku);
    return (leftRecent < 0 ? Number.MAX_SAFE_INTEGER : leftRecent) - (rightRecent < 0 ? Number.MAX_SAFE_INTEGER : rightRecent) || left.name.localeCompare(right.name);
  });

export const catalogFilterIsActive = (filters: CatalogFilters, searchQuery: string) => (
  Boolean(searchQuery.trim())
  || filters.category !== DEFAULT_CATALOG_FILTERS.category
  || filters.availability !== DEFAULT_CATALOG_FILTERS.availability
  || filters.purchaseHistory !== DEFAULT_CATALOG_FILTERS.purchaseHistory
  || filters.leadTime !== DEFAULT_CATALOG_FILTERS.leadTime
  || filters.sort !== DEFAULT_CATALOG_FILTERS.sort
);

export type CatalogControlVisibility = {
  search: boolean;
  category: boolean;
  availability: boolean;
  purchaseHistory: boolean;
  leadTime: boolean;
  sort: boolean;
  filter: boolean;
  refinementRail: boolean;
};

const MIN_SEARCHABLE_CATALOG_SIZE = 8;

export const getCatalogControlVisibility = ({
  products,
  recentlyOrderedSkus,
}: {
  products: PortalProduct[];
  recentlyOrderedSkus: string[];
}): CatalogControlVisibility => {
  const indexedTerms = new Set(products.flatMap((product) => [product.name, product.sku, product.category]).filter(Boolean));
  const search = products.length >= MIN_SEARCHABLE_CATALOG_SIZE && indexedTerms.size > products.length;
  const category = new Set(products.map((product) => product.category)).size > 1;
  const availability = new Set(products.map((product) => product.isAvailable)).size > 1;
  const leadTime = new Set(products.map((product) => product.leadTimeDays <= 3 ? "UP_TO_THREE_DAYS" : "FOUR_OR_MORE_DAYS")).size > 1;
  const catalogSkus = new Set(products.map((product) => product.sku));
  const orderedSkus = new Set(recentlyOrderedSkus.filter((sku) => catalogSkus.has(sku)));
  const purchaseHistory = orderedSkus.size > 0 && orderedSkus.size < products.length;
  const defaultOrder = filterCatalogProducts({ products, filters: DEFAULT_CATALOG_FILTERS, searchTerm: "", recentlyOrderedSkus }).map((product) => product.sku).join("|");
  const sort = (["NAME", "PRICE", "AVAILABILITY", "LEAD_TIME"] as CatalogSort[]).some((value) =>
    filterCatalogProducts({ products, filters: { ...DEFAULT_CATALOG_FILTERS, sort: value }, searchTerm: "", recentlyOrderedSkus }).map((product) => product.sku).join("|") !== defaultOrder,
  );
  const filter = availability || purchaseHistory || leadTime;
  const refinementRail = [category, availability, purchaseHistory, leadTime].filter(Boolean).length >= 4;

  return { search, category, availability, purchaseHistory, leadTime, sort, filter, refinementRail };
};

import type { PortalProduct } from "./types";

export type CatalogProductStateCode = "AVAILABLE" | "NOT_AVAILABLE_FOR_LOCATION";

export type CatalogProductState = {
  code: CatalogProductStateCode;
  label: string;
  description: string;
  canOrder: boolean;
};

export const resolveCatalogProductState = (product: PortalProduct): CatalogProductState => product.isAvailable
  ? { code: "AVAILABLE", label: "Available to order", description: "This approved supply is available for the active location.", canOrder: true }
  : { code: "NOT_AVAILABLE_FOR_LOCATION", label: "Not available to order", description: "This approved supply exists, but is not currently orderable for the active location. No replacement or availability reason is configured.", canOrder: false };

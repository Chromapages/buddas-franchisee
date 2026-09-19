import { CheckCircle2, Info } from "lucide-react";
import type { PortalProduct } from "@/src/features/portal/types";
import { resolveCatalogProductState } from "@/src/features/portal/catalog-product-state";

export const CatalogProductStateBadge = ({ product, includeDescription = false }: { product: PortalProduct; includeDescription?: boolean }) => {
  const state = resolveCatalogProductState(product);
  const Icon = state.code === "AVAILABLE" ? CheckCircle2 : Info;
  return <span className="catalog-product-state" data-state={state.code}><span><Icon size={15} aria-hidden="true" />{state.label}</span>{includeDescription ? <small>{state.description}</small> : null}</span>;
};

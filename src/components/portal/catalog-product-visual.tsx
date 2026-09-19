import Image from "next/image";
import { Package, Shirt, Wheat, Wrench } from "lucide-react";
import type { PortalProduct } from "@/src/features/portal/types";

const isApprovedCatalogImageUrl = (value: unknown): value is string => typeof value === "string" && (value.startsWith("/images/catalog/") || /^https:\/\/cdn\.sanity\.io\/images\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\//.test(value) || /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[A-Za-z0-9._-]+\/o\/catalog-images%2F/.test(value));

const categoryVisual = {
  "Bakery & Dough": { Icon: Wheat, label: "Ingredient supply" },
  Packaging: { Icon: Package, label: "Packaging supply" },
  "Packaging & Paper": { Icon: Package, label: "Packaging or paper supply" },
  "Food Safety & PPE": { Icon: Package, label: "Food safety supply" },
  Uniforms: { Icon: Shirt, label: "Uniform supply" },
  "Brand Materials": { Icon: Package, label: "Brand material" },
  "Cleaning & Sanitation": { Icon: Package, label: "Cleaning supply" },
  "Signage & Uniforms": { Icon: Shirt, label: "Uniform or signage supply" },
  Equipment: { Icon: Wrench, label: "Equipment supply" },
} as const;

export const hasVerifiedCatalogImage = (product: PortalProduct): product is PortalProduct & Required<Pick<PortalProduct, "imageUrl" | "imageAlt">> =>
  Boolean(product.imageVerified && isApprovedCatalogImageUrl(product.imageUrl) && product.imageAlt?.trim());

export const CatalogProductVisual = ({ product, className, sizes, priority = false, compactFallback = false }: { product: PortalProduct; className?: string; sizes: string; priority?: boolean; compactFallback?: boolean }) => {
  if (hasVerifiedCatalogImage(product)) {
    return <div className={className}>
      <Image src={product.imageUrl} alt={product.imageAlt} fill className="object-contain" sizes={sizes} priority={priority} />
    </div>;
  }

  const { Icon, label } = categoryVisual[product.category];
  return <div className={`${className || ""} catalog-category-placeholder`} aria-hidden="true">
    <Icon aria-hidden="true" />
    {!compactFallback ? <span aria-hidden="true">{label}</span> : null}
  </div>;
};

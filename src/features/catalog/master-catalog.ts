import "server-only";

import type { Firestore } from "firebase-admin/firestore";
import type { PortalProduct } from "@/src/features/portal/types";

export type CatalogScopeType = "UNIVERSAL" | "SELECTED";

export type MasterCatalogItem = PortalProduct & {
  scopeType: CatalogScopeType;
  locationIds: string[];
  publicationBatchId: string;
  createdAt: string;
  updatedAt: string;
  publishedByName: string;
};

const categories = new Set<PortalProduct["category"]>(["Bakery & Dough", "Packaging & Paper", "Food Safety & PPE", "Uniforms", "Brand Materials", "Cleaning & Sanitation", "Equipment", "Packaging", "Signage & Uniforms"]);
const validId = (value: unknown): value is string => typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value);
const optionalDetailText = (value: unknown, max = 240) => typeof value === "string" ? value.normalize("NFKC").trim().slice(0, max) || undefined : undefined;
export const isApprovedCatalogImageUrl = (value: unknown): value is string => typeof value === "string" && (value.startsWith("/images/catalog/") || /^https:\/\/cdn\.sanity\.io\/images\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\//.test(value) || /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[A-Za-z0-9._-]+\/o\/catalog-images%2F/.test(value));

const supplyDetailsFromUnknown = (raw: unknown): PortalProduct["supplyDetails"] | undefined => {
  if (!raw || typeof raw !== "object") return undefined;
  const value = raw as Record<string, unknown>;
  const object = (key: string) => value[key] && typeof value[key] === "object" ? value[key] as Record<string, unknown> : undefined;
  const ingredient = object("ingredient");
  const packaging = object("packaging");
  const uniform = object("uniform");
  const signage = object("signage");
  const result = {
    ...(ingredient ? { ingredient: { handling: optionalDetailText(ingredient.handling), storage: optionalDetailText(ingredient.storage) } } : {}),
    ...(packaging ? { packaging: { dimensions: optionalDetailText(packaging.dimensions), material: optionalDetailText(packaging.material), count: optionalDetailText(packaging.count), compatibility: optionalDetailText(packaging.compatibility) } } : {}),
    ...(uniform ? { uniform: { size: optionalDetailText(uniform.size), fit: optionalDetailText(uniform.fit), garmentDetails: optionalDetailText(uniform.garmentDetails), sizeChart: optionalDetailText(uniform.sizeChart), approvedPlacement: optionalDetailText(uniform.approvedPlacement) } } : {}),
    ...(signage ? { signage: { dimensions: optionalDetailText(signage.dimensions), application: optionalDetailText(signage.application), artworkVersion: optionalDetailText(signage.artworkVersion), installation: optionalDetailText(signage.installation) } } : {}),
  };
  return Object.values(result).some((detail) => detail && Object.values(detail).some(Boolean)) ? result : undefined;
};

export const catalogProductFromUnknown = (id: string, raw: Record<string, unknown>): PortalProduct | null => {
  if (typeof raw.sku !== "string" || typeof raw.name !== "string" || typeof raw.description !== "string" || typeof raw.packSize !== "string" || typeof raw.slug !== "string"
    || typeof raw.price !== "number" || !Number.isFinite(raw.price) || raw.price <= 0
    || typeof raw.leadTimeDays !== "number" || !Number.isSafeInteger(raw.leadTimeDays) || raw.leadTimeDays < 0 || raw.leadTimeDays > 365
    || !categories.has(raw.category as PortalProduct["category"])) return null;
  const imageUrl = isApprovedCatalogImageUrl(raw.imageUrl) ? raw.imageUrl : undefined;
  const imageAlt = typeof raw.imageAlt === "string" ? raw.imageAlt.normalize("NFKC").trim().slice(0, 160) : "";
  const imageVerified = raw.imageVerified === true;
  const supplyDetails = supplyDetailsFromUnknown(raw.supplyDetails);
  return {
    id,
    sku: raw.sku.toUpperCase(),
    name: raw.name,
    category: raw.category as PortalProduct["category"],
    description: raw.description,
    packSize: raw.packSize,
    leadTimeDays: raw.leadTimeDays,
    isAvailable: raw.isAvailable !== false,
    price: raw.price,
    slug: raw.slug,
    ...(imageUrl && imageAlt && imageVerified ? { imageUrl, imageAlt, imageVerified: true } : {}),
    ...(supplyDetails ? { supplyDetails } : {}),
  };
};

export const masterCatalogItemFromUnknown = (id: string, raw: Record<string, unknown>): MasterCatalogItem | null => {
  const product = catalogProductFromUnknown(id, raw);
  const scopeType = raw.scopeType === "SELECTED" ? "SELECTED" : raw.scopeType === "UNIVERSAL" ? "UNIVERSAL" : null;
  if (!product || !scopeType || typeof raw.publicationBatchId !== "string") return null;
  const locationIds = Array.isArray(raw.locationIds) ? raw.locationIds.filter(validId).slice(0, 500) : [];
  if (scopeType === "SELECTED" && !locationIds.length) return null;
  return {
    ...product,
    scopeType,
    locationIds,
    publicationBatchId: raw.publicationBatchId,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : "",
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : "",
    publishedByName: typeof raw.publishedByName === "string" ? raw.publishedByName : "Corporate catalog",
  };
};

const applyOverride = (product: PortalProduct, override: Record<string, unknown> | undefined, includeUnavailable: boolean): PortalProduct | null => {
  const price = typeof override?.price === "number" && Number.isFinite(override.price) && override.price > 0 && override.price <= 100000 ? override.price : product.price;
  const leadTimeDays = typeof override?.leadTimeDays === "number" && Number.isSafeInteger(override.leadTimeDays) && override.leadTimeDays >= 0 && override.leadTimeDays <= 365 ? override.leadTimeDays : product.leadTimeDays;
  const isAvailable = override?.isAvailable !== false && product.isAvailable;
  return isAvailable || includeUnavailable ? { ...product, price, leadTimeDays, isAvailable } : null;
};

/** Composes the master catalog with lightweight store overrides and legacy store records. */
export const getComposedCatalogForLocation = async (database: Firestore, locationId: string, options: { includeUnavailable?: boolean } = {}): Promise<PortalProduct[]> => {
  if (!validId(locationId)) return [];
  const unitRef = database.collection("units").doc(locationId);
  const [unit, masters, overrides, legacy] = await Promise.all([
    unitRef.get(),
    database.collection("corporateCatalogItems").get(),
    unitRef.collection("catalogOverrides").get(),
    unitRef.collection("products").get(),
  ]);
  const unitData = unit.data() || {};
  const acceptsMasterCatalog = unit.exists && unitData.operatingStatus === "ACTIVE" && unitData.verification?.status === "VERIFIED";
  const overrideById = new Map(overrides.docs.map((document) => [document.id, document.data()]));
  const governedMasterSkus = new Set<string>();
  const masterProducts = masters.docs.flatMap((document) => {
    const master = masterCatalogItemFromUnknown(document.id, document.data());
    if (!master) return [];
    governedMasterSkus.add(master.sku);
    if (!acceptsMasterCatalog || (master.scopeType === "SELECTED" && !master.locationIds.includes(locationId))) return [];
    const product = applyOverride(master, overrideById.get(master.id), options.includeUnavailable === true);
    return product ? [product] : [];
  });
  const legacyProducts = legacy.docs.flatMap((document) => {
    const product = catalogProductFromUnknown(document.id, document.data());
    return product && (product.isAvailable || options.includeUnavailable === true) && !governedMasterSkus.has(product.sku) ? [product] : [];
  });
  return [...masterProducts, ...legacyProducts].sort((left, right) => left.name.localeCompare(right.name));
};

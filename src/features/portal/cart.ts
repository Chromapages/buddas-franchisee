import { cookies } from "next/headers";
import type { PortalSession } from "@/src/lib/auth/auth-provider";
import type { PortalProduct } from "./types";
import { defaultPortalStorage } from "./storage-adapter";
import { MAX_CART_QUANTITY } from "./cart-policy";

export const PORTAL_CART_COOKIE = "buddas_portal_cart";
const PORTAL_CART_UNDO_COOKIE = "buddas_portal_cart_undo";

export const rememberPortalCartRemoval = async (session: PortalSession, item: { sku: string; quantity: number }) => {
  (await cookies()).set(PORTAL_CART_UNDO_COOKIE, JSON.stringify({ userId: session.userId, locationId: session.locationId, ...item }), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/portal", maxAge: 60 * 30,
  });
};

export const clearPortalCartRemoval = async () => {
  (await cookies()).set(PORTAL_CART_UNDO_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/portal", maxAge: 0 });
};

export const getPortalCartRemoval = async (session: PortalSession): Promise<PortalCartItem | null> => {
  assertSessionLocationAccess(session);
  const raw = (await cookies()).get(PORTAL_CART_UNDO_COOKIE)?.value;
  if (!raw) return null;
  let value;
  try { value = JSON.parse(raw); } catch { return null; }
  if (!value || value.userId !== session.userId || value.locationId !== session.locationId
    || typeof value.sku !== "string" || !Number.isInteger(value.quantity) || value.quantity < 1 || value.quantity > MAX_CART_QUANTITY) return null;
  const products = await defaultPortalStorage.getProductsByLocation(session.locationId);
  const product = products.find((product) => product.sku === value.sku && product.isAvailable);
  return product ? { sku: product.sku, quantity: value.quantity, product } : null;
};

type StoredCartItem = { sku: string; quantity: number };
type StoredCartsByLocation = Record<string, StoredCartItem[]>;
export type PortalCartItem = StoredCartItem & { product: PortalProduct };

const normalizeCart = (value: unknown): StoredCartItem[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const { sku, quantity } = item as Record<string, unknown>;
    if (typeof sku !== "string" || typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) return [];
    return [{ sku, quantity: Math.min(quantity, MAX_CART_QUANTITY) }];
  });
};

const normalizeStoredCarts = (value: unknown, legacyLocationId?: string): StoredCartsByLocation => {
  if (Array.isArray(value)) {
    return legacyLocationId ? { [legacyLocationId]: normalizeCart(value) } : {};
  }

  if (!value || typeof value !== "object") return {};

  return Object.entries(value as Record<string, unknown>).reduce<StoredCartsByLocation>(
    (carts, [locationId, items]) => {
      carts[locationId] = normalizeCart(items);
      return carts;
    },
    {},
  );
};

const readStoredCarts = async (legacyLocationId?: string): Promise<StoredCartsByLocation> => {
  const raw = (await cookies()).get(PORTAL_CART_COOKIE)?.value;
  if (!raw) return {};
  try {
    return normalizeStoredCarts(JSON.parse(raw), legacyLocationId);
  } catch {
    return {};
  }
};

const writeStoredCarts = async (carts: StoredCartsByLocation) => {
  (await cookies()).set(PORTAL_CART_COOKIE, JSON.stringify(carts), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
};

export const assertSessionLocationAccess = (session: PortalSession) => {
  if (!session.managedLocationIds.includes(session.locationId)) {
    throw new Error("The active location is not available to this session.");
  }
};

export const getPortalCart = async (session: PortalSession): Promise<PortalCartItem[]> => {
  assertSessionLocationAccess(session);
  const [storedItems, products] = await Promise.all([
    readStoredCarts(session.locationId).then((carts) => carts[session.locationId] ?? []),
    defaultPortalStorage.getProductsByLocation(session.locationId),
  ]);
  const productsBySku = new Map(products.map((product) => [product.sku, product]));

  return storedItems.flatMap((item) => {
    const product = productsBySku.get(item.sku);
    return product && product.isAvailable ? [{ ...item, product }] : [];
  });
};

export const setPortalCartQuantity = async (
  locationId: string,
  sku: string,
  quantity: number,
) => {
  const carts = await readStoredCarts(locationId);
  const cart = carts[locationId] ?? [];
  const normalizedQuantity = Math.max(0, Math.min(Math.trunc(quantity), MAX_CART_QUANTITY));
  const next = normalizedQuantity === 0
    ? cart.filter((item) => item.sku !== sku)
    : cart.some((item) => item.sku === sku)
      ? cart.map((item) => item.sku === sku ? { ...item, quantity: normalizedQuantity } : item)
      : [...cart, { sku, quantity: normalizedQuantity }];
  await writeStoredCarts({ ...carts, [locationId]: next });
  return next;
};

export const clearPortalCart = async (locationId: string) => {
  const carts = await readStoredCarts(locationId);
  await writeStoredCarts({ ...carts, [locationId]: [] });
};

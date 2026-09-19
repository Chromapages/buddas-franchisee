import { cookies } from "next/headers";
import type { PortalSession } from "@/src/lib/auth/auth-provider";
import type { PortalProduct } from "./types";
import { defaultPortalStorage } from "./storage-adapter";
import { MAX_CART_QUANTITY } from "./cart-policy";

export const PORTAL_CART_COOKIE = "buddas_portal_cart";
const PORTAL_CART_UNDO_COOKIE = "buddas_portal_cart_undo";
const PORTAL_CART_LOCATION_NOTICE_COOKIE = "buddas_portal_cart_location_notice";

type PortalCartLocationNotice = {
  userId: string;
  previousLocationId: string;
  nextLocationId: string;
  itemCount: number;
};

export const rememberPortalCartLocationSwitch = async (session: PortalSession, nextLocationId: string, itemCount: number) => {
  if (!nextLocationId || nextLocationId === session.locationId || itemCount < 1) return;
  const value: PortalCartLocationNotice = { userId: session.userId, previousLocationId: session.locationId, nextLocationId, itemCount };
  (await cookies()).set(PORTAL_CART_LOCATION_NOTICE_COOKIE, JSON.stringify(value), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/portal", maxAge: 60 * 2,
  });
};

export const getPortalCartLocationNotice = async (session: PortalSession): Promise<PortalCartLocationNotice | null> => {
  const raw = (await cookies()).get(PORTAL_CART_LOCATION_NOTICE_COOKIE)?.value;
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<PortalCartLocationNotice>;
    if (value.userId !== session.userId || value.nextLocationId !== session.locationId || typeof value.previousLocationId !== "string" || !Number.isInteger(value.itemCount) || value.itemCount < 1 || value.itemCount > MAX_CART_QUANTITY * 100) return null;
    return { userId: session.userId, previousLocationId: value.previousLocationId, nextLocationId: session.locationId, itemCount: value.itemCount };
  } catch {
    return null;
  }
};

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
  return product ? { sku: product.sku, quantity: value.quantity, product, priceChanged: false, packSizeChanged: false } : null;
};

type StoredCartItem = { sku: string; quantity: number; expectedPrice?: number; expectedPackSize?: string };
type StoredCartsByLocation = Record<string, StoredCartItem[]>;
type StoredCartsByUser = Record<string, StoredCartsByLocation>;
export type PortalCartItem = StoredCartItem & { product: PortalProduct; priceChanged: boolean; packSizeChanged: boolean };

const normalizeCart = (value: unknown): StoredCartItem[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const rawItem = item as Record<string, unknown>;
    const { sku, quantity } = rawItem;
    if (typeof sku !== "string" || typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) return [];
    const expectedPrice = typeof rawItem.expectedPrice === "number" && Number.isFinite(rawItem.expectedPrice) && rawItem.expectedPrice >= 0 ? rawItem.expectedPrice : undefined;
    const expectedPackSize = typeof rawItem.expectedPackSize === "string" ? rawItem.expectedPackSize.normalize("NFKC").trim().slice(0, 128) || undefined : undefined;
    return [{ sku, quantity: Math.min(quantity, MAX_CART_QUANTITY), ...(expectedPrice !== undefined ? { expectedPrice } : {}), ...(expectedPackSize ? { expectedPackSize } : {}) }];
  });
};

const normalizeStoredCartsByLocation = (value: unknown, legacyLocationId?: string): StoredCartsByLocation => {
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

const normalizeStoredCartsByUser = (value: unknown, userId: string, legacyLocationId?: string): StoredCartsByUser => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { [userId]: normalizeStoredCartsByLocation(value, legacyLocationId) };
  const entries = Object.entries(value as Record<string, unknown>);
  const legacyShape = entries.every(([, items]) => Array.isArray(items));
  if (legacyShape) return { [userId]: normalizeStoredCartsByLocation(value, legacyLocationId) };
  return entries.reduce<StoredCartsByUser>((cartsByUser, [storedUserId, locations]) => {
    if (typeof storedUserId !== "string" || !storedUserId) return cartsByUser;
    cartsByUser[storedUserId] = normalizeStoredCartsByLocation(locations, legacyLocationId);
    return cartsByUser;
  }, {});
};

const readStoredCarts = async (userId: string, legacyLocationId?: string): Promise<StoredCartsByUser> => {
  const raw = (await cookies()).get(PORTAL_CART_COOKIE)?.value;
  if (!raw) return {};
  try {
    return normalizeStoredCartsByUser(JSON.parse(raw), userId, legacyLocationId);
  } catch {
    return {};
  }
};

const writeStoredCarts = async (carts: StoredCartsByUser) => {
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
  const storedItems = (await readStoredCarts(session.userId, session.locationId))[session.userId]?.[session.locationId] ?? [];
  if (!storedItems.length) return [];
  const products = await defaultPortalStorage.getProductsByLocation(session.locationId);
  const productsBySku = new Map(products.map((product) => [product.sku, product]));

  return storedItems.flatMap((item) => {
    const product = productsBySku.get(item.sku);
    return product ? [{ ...item, product, priceChanged: item.expectedPrice !== undefined && item.expectedPrice !== product.price, packSizeChanged: item.expectedPackSize !== undefined && item.expectedPackSize !== product.packSize }] : [];
  });
};

export const setPortalCartQuantity = async (
  userId: string,
  locationId: string,
  sku: string,
  quantity: number,
  snapshot?: Pick<PortalProduct, "price" | "packSize">,
) => {
  const cartsByUser = await readStoredCarts(userId, locationId);
  const carts = cartsByUser[userId] ?? {};
  const cart = carts[locationId] ?? [];
  const normalizedQuantity = Math.max(0, Math.min(Math.trunc(quantity), MAX_CART_QUANTITY));
  const next = normalizedQuantity === 0
    ? cart.filter((item) => item.sku !== sku)
    : cart.some((item) => item.sku === sku)
      ? cart.map((item) => item.sku === sku ? { ...item, quantity: normalizedQuantity, ...(snapshot ? { expectedPrice: snapshot.price, expectedPackSize: snapshot.packSize } : {}) } : item)
      : [...cart, { sku, quantity: normalizedQuantity, ...(snapshot ? { expectedPrice: snapshot.price, expectedPackSize: snapshot.packSize } : {}) }];
  await writeStoredCarts({ ...cartsByUser, [userId]: { ...carts, [locationId]: next } });
  return next;
};

export const clearPortalCart = async (userId: string, locationId: string) => {
  const cartsByUser = await readStoredCarts(userId, locationId);
  const carts = cartsByUser[userId] ?? {};
  await writeStoredCarts({ ...cartsByUser, [userId]: { ...carts, [locationId]: [] } });
};

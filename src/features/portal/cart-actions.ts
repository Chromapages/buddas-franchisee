"use server";

import { revalidatePath } from "next/cache";
import { getPortalSession } from "../auth/session";
import { assertPortalPermission } from "./authorization";
import { MAX_CART_QUANTITY } from "./cart-policy";
import {
  assertSessionLocationAccess,
  getPortalCart,
  setPortalCartQuantity,
  getPortalCartRemoval,
  rememberPortalCartRemoval,
  clearPortalCartRemoval,
} from "./cart";
import { defaultPortalStorage } from "./storage-adapter";

export type MutatePortalCartResult =
  | {
    status: "success";
    items: Awaited<ReturnType<typeof getPortalCart>>;
    count: number;
  }
  | {
    status: "error";
    message: string;
  };

const getSessionOrThrow = async () => {
  const session = await getPortalSession();
  if (!session) throw new Error("Your session has expired.");
  assertSessionLocationAccess(session);
  assertPortalPermission(session, "MANAGE_CART");
  return session;
};

const refreshCartViews = () => {
  revalidatePath("/portal");
  revalidatePath("/portal/cart");
  revalidatePath("/portal/checkout");
  revalidatePath("/portal/supplies");
};

const resolveCartCount = (items: Awaited<ReturnType<typeof getPortalCart>>) =>
  items.reduce((total, item) => total + item.quantity, 0);

const resolveAuthoritativeCart = async (locationId: string, sku: string, quantity: number) => {
  if (quantity > 0) {
    const products = await defaultPortalStorage.getProductsByLocation(locationId);
    if (!products.some((product) => product.sku === sku && product.isAvailable)) {
      throw new Error("This supply item is no longer available for the active unit.");
    }
  }

  await setPortalCartQuantity(locationId, sku, quantity);
};

export const mutatePortalCartAction = async (input: {
  locationId: string;
  sku: string;
  quantity: number;
}): Promise<MutatePortalCartResult> => {
  try {
    const session = await getSessionOrThrow();
    if (!input || typeof input.sku !== "string" || input.sku.length > 128) return { status: "error", message: "Choose a valid supply item." };
    const { locationId, sku, quantity } = input;
    const normalizedSku = sku.trim();

    if (!normalizedSku || locationId !== session.locationId) {
      return {
        status: "error",
        message: "We couldn't verify the active unit for this cart update.",
      };
    }

    if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_CART_QUANTITY) {
      return {
        status: "error",
        message: `Quantities must be whole numbers between 0 and ${MAX_CART_QUANTITY}.`,
      };
    }

    const previous = quantity === 0 ? (await getPortalCart(session)).find((item) => item.sku === normalizedSku) : null;
    await resolveAuthoritativeCart(session.locationId, normalizedSku, quantity);
    if (previous) await rememberPortalCartRemoval(session, { sku: previous.sku, quantity: previous.quantity });
    if (quantity > 0 && (await getPortalCartRemoval(session))?.sku === normalizedSku) await clearPortalCartRemoval();
    const items = await getPortalCart(session);
    return {
      status: "success",
      items,
      count: resolveCartCount(items),
    };
  } catch {
    return {
      status: "error",
      message: "We couldn't update the wholesale cart right now. Please try again.",
    };
  }
};

export const addPortalCartItemAction = async (sku: string) => {
  const session = await getSessionOrThrow();
  const cart = await getPortalCart(session);
  const existing = cart.find((item) => item.sku === sku);
  const result = await mutatePortalCartAction({
    locationId: session.locationId,
    sku,
    quantity: Math.min((existing?.quantity ?? 0) + 1, MAX_CART_QUANTITY),
  });

  if (result.status === "error") {
    throw new Error(result.message);
  }

  refreshCartViews();
  return { count: result.count };
};

export const updatePortalCartItemAction = async (formData: FormData) => {
  const session = await getSessionOrThrow();
  const sku = String(formData.get("sku") ?? "");
  const direction = String(formData.get("direction") ?? "");
  const cart = await getPortalCart(session);
  const item = cart.find((candidate) => candidate.sku === sku);
  if (!item || !["increment", "decrement"].includes(direction)) return;

  await mutatePortalCartAction({
    locationId: session.locationId,
    sku,
    quantity: Math.max(0, item.quantity + (direction === "increment" ? 1 : -1)),
  });
};

export const removePortalCartItemAction = async (formData: FormData) => {
  const session = await getSessionOrThrow();
  const sku = String(formData.get("sku") ?? "");

  await mutatePortalCartAction({
    locationId: session.locationId,
    sku,
    quantity: 0,
  });
};

export const restorePortalCartItemAction = async (sku: string, quantity: number) => {
  const session = await getSessionOrThrow();
  if (quantity <= 0) return;

  await mutatePortalCartAction({
    locationId: session.locationId,
    sku,
    quantity: Math.min(quantity, MAX_CART_QUANTITY),
  });
};

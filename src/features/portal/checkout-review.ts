import { createHash } from "node:crypto";

type ReviewedItem = { sku: string; name: string; price: number; quantity: number };

/** Detect changes since review; accepted prices always come from the current catalog. */
export const getCheckoutFingerprint = (locationId: string, items: ReviewedItem[]) =>
  createHash("sha256").update(JSON.stringify({
    locationId,
    items: items.map(({ sku, name, price, quantity }) => ({ sku, name, price, quantity }))
      .sort((a, b) => a.sku.localeCompare(b.sku)),
  })).digest("hex");

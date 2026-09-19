import type { PortalProduct } from "./types";

/** Normalizes legacy catalog categories without changing product or order identifiers. */
export const canonicalizeSupplyCategory = (product: PortalProduct): PortalProduct => {
  const name = product.name.toLocaleLowerCase();
  let category = product.category;
  if (/tissue|napkin|cup|box|bag|paper|packag/.test(name)) category = "Packaging & Paper";
  else if (/glove|ppe|date label|food[- ]safe/.test(name)) category = "Food Safety & PPE";
  else if (/apron|shirt|uniform|team hat/.test(name)) category = "Uniforms";
  else if (/badge|sign|poster|banner/.test(name)) category = "Brand Materials";
  else if (/clean|sanit/.test(name)) category = "Cleaning & Sanitation";
  else if (category === "Packaging") category = "Packaging & Paper";
  else if (category === "Signage & Uniforms") category = "Brand Materials";
  return category === product.category ? product : { ...product, category };
};

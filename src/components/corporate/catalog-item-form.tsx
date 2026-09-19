"use client";

import { useActionState, useState } from "react";
import { addCorporateCatalogItem, type CatalogActionState } from "@/src/features/corporate/catalog";
import type { CorporateLocation } from "@/src/features/corporate/types";

const categories = ["Bakery & Dough", "Packaging & Paper", "Food Safety & PPE", "Uniforms", "Brand Materials", "Cleaning & Sanitation", "Equipment"] as const;
const initialCatalogActionState: CatalogActionState = { status: "idle", message: "" };
const skuPattern = /^[A-Za-z0-9][A-Za-z0-9_-]{1,31}$/;

const generateSku = (itemName: string): string => {
  const base = itemName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " AND ")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32)
    .replace(/-+$/g, "");
  if (!base) return "";
  return base.length === 1 ? `ITEM-${base}` : base;
};

const suggestCategory = (itemName: string): (typeof categories)[number] | "" => {
  const value = itemName.toLowerCase();
  if (/apron|uniform|shirt|hat/.test(value)) return "Uniforms";
  if (/sign|banner|poster|badge/.test(value)) return "Brand Materials";
  if (/glove|ppe|label/.test(value)) return "Food Safety & PPE";
  if (/clean|sanit/.test(value)) return "Cleaning & Sanitation";
  if (/box|bag|cup|napkin|lid|paper|packag/.test(value)) return "Packaging & Paper";
  if (/dough|flour|bread|roll|bun|poi/.test(value)) return "Bakery & Dough";
  if (/oven|mixer|proofer|equipment|thermometer/.test(value)) return "Equipment";
  return "";
};

const parseCurrency = (value: string): number => Number(value.replace(/[$,\s]/g, ""));
const priceErrorFor = (value: string): string | undefined => {
  const price = parseCurrency(value);
  if (!Number.isFinite(price) || price <= 0 || price > 100000) return "Enter a wholesale price from $0.01 to $100,000.";
  return undefined;
};
const formatCurrency = (value: string): string => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseCurrency(value));

export function CatalogItemForm({ locations, selectedLocationId }: { locations: CorporateLocation[]; selectedLocationId?: string }) {
  const [state, submit, pending] = useActionState(addCorporateCatalogItem, initialCatalogActionState);
  const [requestId] = useState(() => crypto.randomUUID().replaceAll("-", ""));
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [categoryIsManual, setCategoryIsManual] = useState(false);
  const [sku, setSku] = useState("");
  const [skuIsManual, setSkuIsManual] = useState(false);
  const [skuError, setSkuError] = useState<string>();
  const [skuGenerationMessage, setSkuGenerationMessage] = useState("");
  const [price, setPrice] = useState("");
  const [priceError, setPriceError] = useState<string>();
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [description, setDescription] = useState("");
  const suggestedCategory = suggestCategory(itemName);

  const handleItemNameChange = (value: string) => {
    setItemName(value);
    if (!categoryIsManual) setCategory(suggestCategory(value));
    if (!skuIsManual) {
      setSku(generateSku(value));
      setSkuError(undefined);
    }
  };

  const regenerateSku = () => {
    const generated = generateSku(itemName);
    setSku(generated);
    setSkuIsManual(false);
    setSkuError(generated ? undefined : "Enter an item name before generating a SKU.");
    setSkuGenerationMessage(generated ? `Generated SKU ${generated}.` : "Enter an item name before generating a SKU.");
  };

  return <form action={submit} className="corporate-support-form corporate-catalog-form">
    <input type="hidden" name="requestId" value={requestId} />
    <input type="hidden" name="description" value={descriptionOpen ? description : ""} />

    <fieldset className="corporate-catalog-group">
      <legend>Item identity</legend>
      <label className="corporate-field"><span>Franchise location</span><select name="locationId" required defaultValue={selectedLocationId || ""}><option value="" disabled>Select a location</option>{locations.map((location) => <option key={location.id} value={location.id}>{location.name} · {location.code}</option>)}</select><small>Only locations in your approved corporate scope are shown.</small></label>
      <label className="corporate-field corporate-catalog-primary-field"><span>Item name</span><input name="name" required maxLength={128} value={itemName} onChange={(event) => handleItemNameChange(event.target.value)} placeholder="Approved product name" autoComplete="off" /></label>
      <div className="corporate-field corporate-catalog-primary-field"><label htmlFor="catalog-sku">SKU</label><input id="catalog-sku" name="sku" required maxLength={32} value={sku} onChange={(event) => { setSku(event.target.value.toUpperCase()); setSkuIsManual(true); }} placeholder="e.g. DGH-BR50" autoCapitalize="characters" aria-invalid={Boolean(skuError)} aria-describedby={`catalog-sku-help${skuError ? " catalog-sku-error" : ""}`} onBlur={(event) => setSkuError(skuPattern.test(event.target.value) ? undefined : "Use 2–32 letters, numbers, hyphens, or underscores.")} /><small id="catalog-sku-help">Generated from the item name. You can edit it before publishing.</small><button type="button" className="corporate-button-secondary corporate-sku-generator" onClick={regenerateSku} disabled={!itemName.trim()}>Generate from item name</button>{skuError ? <small id="catalog-sku-error" className="corporate-field-error" role="alert">{skuError}</small> : null}<span className="sr-only" aria-live="polite">{skuGenerationMessage}</span></div>
      <label className="corporate-field"><span>Category</span><select name="category" required value={category} onChange={(event) => { setCategory(event.target.value); setCategoryIsManual(true); }} aria-describedby={suggestedCategory && !categoryIsManual ? "catalog-category-suggestion" : undefined}><option value="" disabled>Select category</option>{categories.map((option) => <option key={option} value={option}>{option}</option>)}</select>{suggestedCategory && !categoryIsManual ? <small id="catalog-category-suggestion">Suggested from item name. You can choose another category.</small> : null}</label>
    </fieldset>

    <fieldset className="corporate-catalog-group corporate-catalog-secondary-group">
      <legend>Fulfillment details</legend>
      <label className="corporate-field corporate-catalog-secondary-field"><span>Pack size</span><input name="packSize" required maxLength={64} inputMode="numeric" placeholder="e.g. 50" /></label>
      <label className="corporate-field corporate-catalog-secondary-field"><span>Lead time (days)</span><input name="leadTimeDays" required type="number" inputMode="numeric" min="0" max="365" step="1" defaultValue="3" /><small>Used to set franchisee reorder expectations.</small></label>
    </fieldset>

    <fieldset className="corporate-catalog-group">
      <legend>Commercial details</legend>
      <label className="corporate-field corporate-catalog-secondary-field"><span>Wholesale price (USD)</span><input name="price" required type="text" inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value)} onBlur={() => { const error = priceErrorFor(price); setPriceError(error); if (!error) setPrice(formatCurrency(price)); }} placeholder="$0.00" aria-invalid={Boolean(priceError)} aria-describedby={priceError ? "catalog-price-error" : "catalog-price-help"} /><small id="catalog-price-help">The price franchisees see when they add this item to a supply order.</small>{priceError ? <small id="catalog-price-error" className="corporate-field-error" role="alert">{priceError}</small> : null}</label>
      <details className="corporate-catalog-description" onToggle={(event) => setDescriptionOpen(event.currentTarget.open)}>
        <summary>Customize approved description <span>(optional)</span></summary>
        <label className="corporate-field"><span>Approved description</span><textarea name="descriptionDraft" maxLength={600} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What franchisees need to know before ordering" /><small>If left blank, the catalog uses the standard item, pack-size, and lead-time description.</small></label>
      </details>
    </fieldset>

    <div className="corporate-catalog-submit"><button className="corporate-button" type="submit" disabled={pending}>{pending ? "Publishing…" : "Publish item to this store"}</button></div>
    {state.message ? <p role={state.status === "error" ? "alert" : "status"} className={`corporate-form-message corporate-form-message-${state.status}`}>{state.message}</p> : null}
  </form>;
}

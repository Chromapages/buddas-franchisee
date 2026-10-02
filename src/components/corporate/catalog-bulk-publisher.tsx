"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CircleCheck, Info, ShoppingCart, Upload, X } from "lucide-react";
import { CorporatePanel, StatusBadge } from "@/src/components/corporate/corporate-ui";
import {
  publishCatalogBatch,
  removeCorporateCatalogItem,
  retryCatalogPublicationDestinations,
  rollbackCatalogPublicationBatch,
  type CatalogPublicationBatch,
  type CatalogPublicationDraft,
  type CatalogPublicationEligibility,
} from "@/src/features/corporate/catalog";

import { catalogEditorDraft, clearCatalogStoreOverride, loadCatalogItems, saveCatalogStoreOverride } from "@/src/features/corporate/catalog-editor-actions";
import type { CorporateCatalogItem } from "@/src/features/corporate/catalog";

const categories = ["Bakery & Dough", "Packaging & Paper", "Food Safety & PPE", "Uniforms", "Brand Materials", "Cleaning & Sanitation", "Equipment"] as const;
const purchaseUnits = ["Each", "Pack", "Case", "Bag"] as const;
const PAGE_SIZE = 25;
type PublicationMode = "NOW" | "SCHEDULED";
type ViewState = "EDIT" | "REVIEW" | "RESULT";
type ItemIntent = "ADD" | "EDIT";
type CatalogScope = "UNIVERSAL" | "SELECTED";
type Field = "name" | "sku" | "price";
type ItemField = Field | "pack" | "days" | "category";

const createSku = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32).replace(/-+$/g, "");
const priceValue = (value: string) => Number(value.replace(/[$,\s]/g, ""));
const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
const packSizeFor = (unit: string, quantity: string) => quantity.trim() ? `${unit} of ${quantity.trim()}` : "";
const unpackSize = (value: string): { unit: (typeof purchaseUnits)[number]; quantity: string } => {
  const match = /^(Each|Pack|Case|Bag) of (\d+)$/i.exec(value.trim());
  if (match) return { unit: purchaseUnits.find((unit) => unit.toLowerCase() === match[1].toLowerCase()) || "Pack", quantity: match[2] };
  return { unit: "Pack", quantity: value.match(/\d+/)?.[0] || "" };
};

const errorFor = (field: Field, value: string): string | undefined => {
  if (field === "name") return value.trim() ? undefined : "Item name is required.";
  if (field === "sku") return /^[A-Z0-9][A-Z0-9_-]{1,31}$/.test(value) ? undefined : "Use 2–32 letters, numbers, hyphens, or underscores.";
  const amount = priceValue(value);
  return Number.isFinite(amount) && amount > 0 && amount <= 100000 ? undefined : "Enter a wholesale price from $0.01 to $100,000.";
};

const extraErrorFor = (field: "pack" | "days" | "category", value: string): string | undefined => {
  if (field === "pack") return /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 100000 ? undefined : "Enter a quantity from 1 to 100,000.";
  if (field === "days") return value.trim() && Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 365 ? undefined : "Enter a whole number from 0 to 365.";
  return value ? undefined : "Choose the category that fits this item.";
};

export function CatalogBulkPublisher({ stores, canPublishUniversal }: { stores: CatalogPublicationEligibility[]; canPublishUniversal: boolean }) {
  const [step, setStep] = useState(1);
  const [itemIntent, setItemIntent] = useState<ItemIntent>("ADD");
  const [consequenceVisible, setConsequenceVisible] = useState(true);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [catalogScope, setCatalogScope] = useState<CatalogScope>(canPublishUniversal ? "UNIVERSAL" : "SELECTED");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const catalogRequest = useRef(0);
  const publicationRequest = useRef("");
  const removalDialogRef = useRef<HTMLDialogElement>(null);
  const removalTriggerRef = useRef<HTMLElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const skuInputRef = useRef<HTMLInputElement>(null);
  const [categoryManual, setCategoryManual] = useState(false);
  const [categorySuggested, setCategorySuggested] = useState(false);
  const [suggestionRevision, setSuggestionRevision] = useState(0);
  const [editing, setEditing] = useState(false);
  const [items, setItems] = useState<CorporateCatalogItem[]>([]);
  const [catalogStore, setCatalogStore] = useState("");
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogMessage, setCatalogMessage] = useState("");
  const [overrideItem, setOverrideItem] = useState<CorporateCatalogItem>();
  const [overridePrice, setOverridePrice] = useState("");
  const [overrideDays, setOverrideDays] = useState("");
  const [overrideAvailable, setOverrideAvailable] = useState(true);
  const [overridePending, setOverridePending] = useState(false);
  const [overrideMessage, setOverrideMessage] = useState("");
  const [overrideError, setOverrideError] = useState(false);
  const [overrideRestoreConfirm, setOverrideRestoreConfirm] = useState(false);
  const [removeItem, setRemoveItem] = useState<CorporateCatalogItem>();
  const [removePending, setRemovePending] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const [extraErrors, setExtraErrors] = useState({ pack: "", days: "", category: "" });
  const [touched, setTouched] = useState<Partial<Record<ItemField, boolean>>>({});
  const [view, setView] = useState<ViewState>("EDIT");
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [skuManual, setSkuManual] = useState(false);
  const [category, setCategory] = useState<(typeof categories)[number] | "">("");
  const [purchaseUnit, setPurchaseUnit] = useState<(typeof purchaseUnits)[number]>("Pack");
  const [packQuantity, setPackQuantity] = useState("");
  const [packSize, setPackSize] = useState("");
  const [leadTimeDays, setLeadTimeDays] = useState("3");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageVerified, setImageVerified] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageUploadPending, setImageUploadPending] = useState(false);
  const [imageUploadMessage, setImageUploadMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});
  const [mode, setMode] = useState<PublicationMode>("NOW");
  const [scheduledAt, setScheduledAt] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("ALL");
  const [group, setGroup] = useState("ALL");
  const [page, setPage] = useState(0);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string>();
  const [batch, setBatch] = useState<CatalogPublicationBatch>();

  useEffect(() => {
    let active = true;
    void catalogEditorDraft().then((result) => { if (active && result.payload) setHasSavedDraft(true); });
    return () => { active = false; };
  }, []);

  const eligible = stores.filter((entry) => entry.eligible);
  const noEligibleStores = eligible.length === 0;
  const regions = [...new Set(stores.map((entry) => entry.location.regionId || "Unassigned"))].sort();
  const groups = [...new Set(stores.map((entry) => entry.location.organizationId || "Unassigned"))].sort();
  const approvedImageUrl = imageVerified && imageAlt.trim() && (/^\/images\/catalog\//.test(imageUrl.trim()) || /^https:\/\/cdn\.sanity\.io\/images\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\//.test(imageUrl.trim()) || /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[A-Za-z0-9._-]+\/o\/catalog-images%2F/.test(imageUrl.trim())) ? imageUrl.trim() : "";
  const imageThumbnailUrl = imagePreviewUrl || imageUrl.trim() || ((/apron/i.test(name) || category === "Uniforms") ? "/images/catalog/buddas-black-apron.png" : "");
  const previewImageUrl = imagePreviewUrl || imageUrl.trim() || ((/apron/i.test(name) || category === "Uniforms") ? "/images/catalog/buddas-black-apron.png" : "/images/Logo.svg");
  const previewImageAlt = imageAlt || ((/apron/i.test(name) || category === "Uniforms") ? "Black Budda's branded kitchen apron" : "Budda's Bakery");
  const filtered = useMemo(() => stores.filter((entry) => {
    const search = `${entry.location.name} ${entry.location.code} ${entry.location.market || ""}`.toLowerCase();
    return (!query || search.includes(query.toLowerCase()))
      && (region === "ALL" || (entry.location.regionId || "Unassigned") === region)
      && (group === "ALL" || (entry.location.organizationId || "Unassigned") === group);
  }), [group, query, region, stores]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageStores = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const selectedEligible = catalogScope === "UNIVERSAL" ? eligible : eligible.filter((entry) => selected.has(entry.location.id));
  const itemErrors = { name: errorFor("name", name), sku: errorFor("sku", sku), price: errorFor("price", price), pack: extraErrorFor("pack", packQuantity), days: extraErrorFor("days", leadTimeDays), category: extraErrorFor("category", category) };
  const itemComplete = !Object.values(itemErrors).some(Boolean);
  const overridePriceError = overrideItem && (!Number.isFinite(priceValue(overridePrice)) || priceValue(overridePrice) <= 0 || priceValue(overridePrice) > 100000) ? "Enter a price from $0.01 to $100,000." : "";
  const overrideDaysError = overrideItem && (!Number.isSafeInteger(Number(overrideDays)) || Number(overrideDays) < 0 || Number(overrideDays) > 365) ? "Enter a whole number from 0 to 365." : "";
  const draft: CatalogPublicationDraft = { name, sku, category: category as CatalogPublicationDraft["category"], packSize, leadTimeDays: Number(leadTimeDays), price: priceValue(price), ...(description.trim() ? { description: description.trim() } : {}), ...(approvedImageUrl ? { imageUrl: approvedImageUrl, imageAlt: imageAlt.trim(), imageVerified: true } : {}) };
  const scheduleReady = mode === "NOW" || Number.isFinite(Date.parse(scheduledAt)) && Date.parse(scheduledAt) > Date.now();
  const canReview = Boolean(itemComplete && selectedEligible.length && scheduleReady);
  const primaryDisabled = pending || (step === 1 ? !itemComplete : !selectedEligible.length || !scheduleReady);

  const validate = (field: Field, value: string) => setFieldErrors((current) => ({ ...current, [field]: errorFor(field, value) }));
  const validateExtra = (field: "pack" | "days" | "category", value: string) => setExtraErrors((current) => ({ ...current, [field]: extraErrorFor(field, value) || "" }));
  const touch = (field: ItemField) => setTouched((current) => ({ ...current, [field]: true }));
  const validateAllItemFields = () => {
    setTouched({ name: true, sku: true, price: true, pack: true, days: true, category: true });
    setFieldErrors({ name: itemErrors.name, sku: itemErrors.sku, price: itemErrors.price });
    setExtraErrors({ pack: itemErrors.pack || "", days: itemErrors.days || "", category: itemErrors.category || "" });
    return itemComplete;
  };
  const toggleStore = (id: string) => setSelected((current) => {
    const next = new Set(current);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const selectEligibleMatches = () => setSelected((current) => new Set([...current, ...filtered.filter((entry) => entry.eligible).map((entry) => entry.location.id)]));
  const clearSelection = () => setSelected(new Set());
  const syncSku = (value: string) => {
    setName(value);
    if (imageUrl) { setImageVerified(false); setImageUploadMessage("Review the uploaded image after changing the item name or SKU."); }
    if (touched.name) validate("name", value);
    if (!skuManual) {
      const generated = createSku(value);
      setSku(generated);
      if (touched.sku) validate("sku", generated);
    }
    if (!categoryManual) {
      const suggested: typeof category = /apron|shirt|uniform|hat/i.test(value) ? "Uniforms" : /sign|poster|badge/i.test(value) ? "Brand Materials" : /glove|ppe|label/i.test(value) ? "Food Safety & PPE" : /clean|sanit/i.test(value) ? "Cleaning & Sanitation" : /box|bag|packaging|cup|paper/i.test(value) ? "Packaging & Paper" : /oven|mixer|equipment/i.test(value) ? "Equipment" : /dough|roll|butter|flour|bread/i.test(value) ? "Bakery & Dough" : "";
      setCategory(suggested);
      setCategorySuggested(Boolean(suggested));
      if (suggested) setSuggestionRevision((current) => current + 1);
      if (touched.category) validateExtra("category", suggested);
    }
  };
  const requestReview = () => {
    if (mode === "SCHEDULED" && (!Number.isFinite(Date.parse(scheduledAt)) || Date.parse(scheduledAt) <= Date.now())) {
      setMessage("Choose a date and time in the future, or turn off Choose a later date.");
      return;
    }
    validateAllItemFields();
    if (!canReview) {
      setMessage("Complete the required item fields and select at least one ready store before review.");
      return;
    }
    setMessage(undefined);
    setStep(3);
    setView("REVIEW");
  };
  const confirm = async () => {
    if (pending) return;
    setPending(true); setMessage(undefined);
    try {
      publicationRequest.current ||= crypto.randomUUID();
      const result = await publishCatalogBatch(draft, selectedEligible.map((entry) => entry.location.id), mode === "SCHEDULED" ? new Date(scheduledAt).toISOString() : undefined, catalogScope, publicationRequest.current);
      if (result.status === "error") return setMessage(result.message);
      setBatch(result.batch); setView("RESULT");
    } catch { setMessage("The result could not be confirmed. Check the catalog before trying again. Your entries are still here."); }
    finally { setPending(false); }
  };
  const go = (value: number) => { setStep(value); setMessage(undefined); requestAnimationFrame(() => headingRef.current?.focus()); };
  const continueToStores = () => {
    if (!validateAllItemFields()) { setMessage("Complete the required item details before continuing."); return; }
    go(2);
  };
  const saveLater = async () => {
    setPending(true); setDraftMessage("");
    try {
      const result = await catalogEditorDraft(JSON.stringify({ name, sku, category, purchaseUnit, packQuantity, packSize, leadTimeDays, price, description, imageUrl, imageAlt, imageVerified, mode, scheduledAt, selected: [...selected], editing, skuManual, categoryManual, catalogScope }));
      setDraftMessage(result.error || "Draft saved. You can return to it from the banner above.");
      if (!result.error) setHasSavedDraft(true);
    } catch { setDraftMessage("The draft could not be saved. Your entries are still here."); }
    finally { setPending(false); }
  };
  const resume = async () => {
    setPending(true); setDraftMessage("");
    try {
      const result = await catalogEditorDraft();
      if (result.error || !result.payload) { setDraftMessage(result.error || "You have no saved draft yet."); return; }
      const data = JSON.parse(result.payload);
      const str = (key: string) => typeof data[key] === "string" ? data[key] : "";
      const savedPack = unpackSize(str("packSize"));
      const savedUnit = purchaseUnits.includes(data.purchaseUnit) ? data.purchaseUnit : savedPack.unit;
      const savedQuantity = str("packQuantity") || savedPack.quantity;
      setName(str("name")); setSku(str("sku")); setPurchaseUnit(savedUnit); setPackQuantity(savedQuantity); setPackSize(packSizeFor(savedUnit, savedQuantity)); setLeadTimeDays(str("leadTimeDays")); setPrice(str("price")); setDescription(str("description")); setImageUrl(str("imageUrl")); setImageAlt(str("imageAlt")); setImageVerified(data.imageVerified === true); setImagePreviewUrl("");
      setCategory(categories.includes(data.category) ? data.category : ""); setMode(data.mode === "SCHEDULED" ? "SCHEDULED" : "NOW"); setScheduledAt(str("scheduledAt"));
      setCatalogScope(data.catalogScope === "UNIVERSAL" && canPublishUniversal ? "UNIVERSAL" : "SELECTED");
      setSelected(new Set(Array.isArray(data.selected) ? data.selected.filter((id: string) => eligible.some((entry) => entry.location.id === id)) : []));
      setEditing(data.editing === true); setItemIntent(data.editing === true ? "EDIT" : "ADD"); setSkuManual(data.skuManual === true); setCategoryManual(data.categoryManual === true); setCategorySuggested(data.categoryManual !== true && Boolean(data.category));
      setView("EDIT"); go(1); setDraftMessage("Saved draft restored. Review the current store availability before sending.");
    } catch { setDraftMessage("The saved draft could not be loaded."); }
    finally { setPending(false); }
  };
  const openCatalog = async (id: string) => {
    const request = ++catalogRequest.current;
    setCatalogStore(id); setItems([]); setOverrideItem(undefined); setOverrideRestoreConfirm(false); setOverrideMessage(""); setOverrideError(false); setCatalogMessage(""); setCatalogLoading(true);
    if (!id) { setCatalogLoading(false); return; }
    try { const result = await loadCatalogItems(id); if (request !== catalogRequest.current) return; setItems(result.items || []); setCatalogMessage(result.error || ""); }
    catch { if (request === catalogRequest.current) setCatalogMessage("This catalog could not be loaded."); }
    finally { if (request === catalogRequest.current) setCatalogLoading(false); }
  };
  const editItem = (item: CorporateCatalogItem) => {
    const parsedPack = unpackSize(item.packSize);
    setName(item.name); setSku(item.sku); setSkuManual(true); setCategory(item.category === "Packaging" ? "Packaging & Paper" : item.category === "Signage & Uniforms" ? /apron|shirt|uniform|hat/i.test(item.name) ? "Uniforms" : "Brand Materials" : item.category); setCategoryManual(true); setCategorySuggested(false);
    setPurchaseUnit(parsedPack.unit); setPackQuantity(parsedPack.quantity); setPackSize(packSizeFor(parsedPack.unit, parsedPack.quantity)); setLeadTimeDays(String(item.leadTimeDays)); setPrice(formatCurrency(item.price)); setDescription(item.description); setImageUrl(item.imageUrl || ""); setImageAlt(item.imageAlt || ""); setImageVerified(item.imageVerified === true); setImagePreviewUrl("");
    setSelected(new Set([item.locationId])); setCatalogScope(item.catalogScope === "UNIVERSAL" && canPublishUniversal ? "UNIVERSAL" : "SELECTED"); setEditing(true); setItemIntent("EDIT"); setMode("NOW"); setFieldErrors({}); setExtraErrors({ pack: "", days: "", category: "" }); setTouched({}); go(1);
  };
  const editStoreException = (item: CorporateCatalogItem) => {
    setOverrideItem(item); setOverridePrice(String(item.price)); setOverrideDays(String(item.leadTimeDays)); setOverrideAvailable(item.isAvailable); setOverrideRestoreConfirm(false); setOverrideMessage(""); setOverrideError(false);
  };
  const saveStoreException = async () => {
    if (!overrideItem || !catalogStore || overridePending) return;
    setOverridePending(true); setOverrideMessage(""); setOverrideError(false);
    try {
      const result = await saveCatalogStoreOverride({ locationId: catalogStore, itemId: overrideItem.id, price: priceValue(overridePrice), leadTimeDays: Number(overrideDays), isAvailable: overrideAvailable });
      if (result.error) { setOverrideError(true); setOverrideMessage(result.error); }
      else {
        const refreshed = await loadCatalogItems(catalogStore);
        setItems(refreshed.items || []); setOverrideItem(undefined); setOverrideMessage(result.message || "Store exception saved.");
      }
    } catch { setOverrideError(true); setOverrideMessage("The store exception could not be saved."); }
    finally { setOverridePending(false); }
  };
  const restoreMasterDefaults = async () => {
    if (!overrideItem || !catalogStore || overridePending) return;
    setOverridePending(true); setOverrideMessage(""); setOverrideError(false);
    try {
      const result = await clearCatalogStoreOverride({ locationId: catalogStore, itemId: overrideItem.id });
      if (result.error) { setOverrideError(true); setOverrideMessage(result.error); }
      else {
        const refreshed = await loadCatalogItems(catalogStore);
        setItems(refreshed.items || []); setOverrideItem(undefined); setOverrideRestoreConfirm(false); setOverrideMessage(result.message || "Master defaults restored.");
      }
    } catch { setOverrideError(true); setOverrideMessage("The store exception could not be removed."); }
    finally { setOverridePending(false); }
  };
  const uploadProductImage = async (file: File) => {
    if (imageUploadPending) return;
    if (errorFor("name", name) || errorFor("sku", sku)) { setImageUploadMessage("Enter a valid item name and SKU before uploading an image."); return; }
    if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(file.type) || file.size <= 0 || file.size > 10 * 1024 * 1024) { setImageUploadMessage("Use a JPEG, PNG, or WebP image up to 10 MB."); return; }
    setImageUploadPending(true); setImageUploadMessage(""); setImageVerified(false);
    const preview = URL.createObjectURL(file);
    setImagePreviewUrl((current) => { if (current) URL.revokeObjectURL(current); return preview; });
    try {
      const payload = new FormData(); payload.set("image", file); payload.set("name", name); payload.set("sku", sku);
      const response = await fetch("/api/corporate/catalog/images", { method: "POST", body: payload });
      const result = await response.json() as { imageUrl?: string; imageAlt?: string; message?: string };
      if (!response.ok || !result.imageUrl || !result.imageAlt) throw new Error(result.message || "Product image upload could not be completed.");
      setImageUrl(result.imageUrl); setImageAlt(result.imageAlt); setImageUploadMessage("Image uploaded. Confirm that it shows this exact SKU before publishing.");
    } catch (error) { setImageUploadMessage(error instanceof Error ? error.message : "Product image upload could not be completed."); }
    finally { setImageUploadPending(false); }
  };
  const removeFromCatalog = async () => {
    if (!removeItem || !catalogStore || removePending) return;
    setRemovePending(true); setCatalogMessage("");
    try {
      const result = await removeCorporateCatalogItem({ locationId: catalogStore, itemId: removeItem.id });
      if (result.status === "error") setCatalogMessage(result.message);
      else {
        const refreshed = await loadCatalogItems(catalogStore);
        setItems(refreshed.items || []); setRemoveItem(undefined); setCatalogMessage(result.message);
      }
    } catch { setCatalogMessage("This catalog item could not be removed."); }
    finally { setRemovePending(false); }
  };
  const dismissRemovalDialog = () => {
    setRemoveItem(undefined);
    requestAnimationFrame(() => removalTriggerRef.current?.focus());
  };
  useEffect(() => {
    const dialog = removalDialogRef.current;
    if (!dialog) return;
    if (removeItem && !dialog.open) dialog.showModal();
    if (!removeItem && dialog.open) dialog.close();
  }, [removeItem]);
  const startNewItem = () => {
    if (editing) {
      setName(""); setSku(""); setSkuManual(false); setCategory(""); setCategoryManual(false); setCategorySuggested(false); setPurchaseUnit("Pack"); setPackQuantity(""); setPackSize(""); setLeadTimeDays("3"); setPrice(""); setDescription(""); setImageUrl(""); setImageAlt(""); setImageVerified(false); setImagePreviewUrl(""); setImageUploadMessage(""); setSelected(new Set()); setCatalogScope(canPublishUniversal ? "UNIVERSAL" : "SELECTED");
      setFieldErrors({}); setExtraErrors({ pack: "", days: "", category: "" }); setTouched({});
    }
    setEditing(false); setItemIntent("ADD"); setCatalogMessage(""); go(1);
  };

  const retry = async (locationIds: string[]) => {
    if (!batch) return;
    setPending(true);
    try {
      const result = await retryCatalogPublicationDestinations(batch.id, locationIds);
      result.status === "success" ? setBatch(result.batch) : setMessage(result.message);
    } catch { setMessage("The retry could not be confirmed. Check the store results before trying again."); }
    finally { setPending(false); }
  };
  const rollback = async () => {
    if (!batch) return;
    setPending(true);
    try {
      const result = await rollbackCatalogPublicationBatch(batch.id);
      result.status === "success" ? setBatch(result.batch) : setMessage(result.message);
    } catch { setMessage("The restore could not be confirmed. Check the store catalog before trying again."); }
    finally { setPending(false); }
  };

  const consequenceBanner = consequenceVisible ? <aside className="catalog-consequence-banner" role="status"><Info size={18} aria-hidden="true" /><p>Adding this item makes it orderable — it doesn’t create an order or guarantee stock.</p><button type="button" onClick={() => setConsequenceVisible(false)} aria-label="Dismiss catalog information"><X size={17} aria-hidden="true" /></button></aside> : null;
  const stepRail = <ol className="catalog-step-rail" aria-label={`Catalog progress, step ${step} of 3`}>{[{ label: "Item", detail: "Describe the item" }, { label: "Stores", detail: "Choose locations" }, { label: "Review", detail: "Confirm and add" }].map((entry, index) => <li key={entry.label} className={step === index + 1 ? "is-current" : step > index + 1 ? "is-complete" : ""} aria-current={step === index + 1 ? "step" : undefined}><span>{index + 1}</span><div><strong>{entry.label}</strong><small>{entry.detail}</small></div></li>)}</ol>;

  if (noEligibleStores) return <div className="corporate-catalog-bulk"><CorporatePanel className="catalog-publication-blocker" title="No stores are ready to receive this item" eyebrow="Catalog publishing blocked" description={`0 of ${stores.length} stores are ready to receive this item. Verify at least one location before creating a catalog publication.`}><div className="catalog-publication-blocker-body"><p>Catalog publishing is unavailable until a permitted location has an active, verified operating status.</p><Link href="/corporate/directory?tab=locations" className="corporate-button">Go verify locations</Link><ul>{stores.map((entry) => <li key={entry.location.id}><div><strong>{entry.location.name}</strong><small>{entry.location.code} · {entry.reason || "Location cannot receive catalog items."}</small></div><Link href={`/corporate/directory/locations/${encodeURIComponent(entry.location.id)}`} className="corporate-button-secondary">Review location</Link></li>)}</ul></div></CorporatePanel></div>;

  if (view === "RESULT" && batch) {
    const failed = batch.destinations.filter((destination) => destination.status === "FAILED");
    const published = batch.destinations.filter((destination) => destination.status === "PUBLISHED").length;
    return <div className="corporate-catalog-bulk"><CorporatePanel title={batch.state === "SCHEDULED" ? "Item scheduled" : "Store results"} eyebrow="Destination status" description={batch.state === "SCHEDULED" ? `Scheduled for ${new Date(batch.effectiveAt).toLocaleString()}. Store eligibility is rechecked when this batch runs.` : `${published} added · ${failed.length} failed · ${batch.destinations.filter((destination) => destination.status === "NOT_ELIGIBLE").length} not eligible.`}><div className="catalog-batch-results"><p className="catalog-batch-item"><strong>{batch.draft.name}</strong><span>{batch.draft.sku} · {formatCurrency(batch.draft.price)}</span></p><ul>{batch.destinations.map((destination) => { const store = stores.find((entry) => entry.location.id === destination.locationId)?.location; return <li key={destination.locationId}><div><strong>{store?.name || destination.locationId}</strong><small>{destination.reason || destination.completedAt || "Awaiting scheduled execution"}</small></div><StatusBadge tone={destination.status === "PUBLISHED" ? "success" : destination.status === "FAILED" ? "danger" : destination.status === "NOT_ELIGIBLE" ? "waiting" : "neutral"}>{({ PUBLISHED: "Added", SCHEDULED: "Scheduled", FAILED: "Needs attention", NOT_ELIGIBLE: "Needs attention", PENDING: "Waiting", ROLLED_BACK: "Restored", ROLLBACK_SKIPPED: "Restore skipped" })[destination.status]}</StatusBadge>{destination.status === "FAILED" ? <button className="corporate-button-secondary" type="button" disabled={pending} onClick={() => retry([destination.locationId])}>Try again</button> : null}</li>; })}</ul><Link href="/corporate/catalog" className="corporate-button-secondary">Back to Store Catalog</Link>{failed.length ? <button className="corporate-button" type="button" disabled={pending} onClick={() => retry(failed.map((destination) => destination.locationId))}>Retry {failed.length} failed store{failed.length === 1 ? "" : "s"}</button> : null}{batch.rollbackUntil && Date.parse(batch.rollbackUntil) > Date.now() && batch.destinations.some((destination) => destination.status === "PUBLISHED") ? <button className="corporate-button-secondary" type="button" disabled={pending} onClick={rollback}>Restore previous catalog versions</button> : null}{message ? <p className="corporate-form-message corporate-form-message-error" role="alert">{message}</p> : null}</div></CorporatePanel></div>;
  }


  if (view === "REVIEW") return <div className="corporate-catalog-bulk">
    <header className="corporate-work-masthead catalog-work-masthead"><div className="corporate-work-masthead-top"><div className="corporate-work-masthead-intro"><p>Store catalog</p><h1>Review and add</h1><span>Review the item and selected stores before confirming the publication.</span></div></div></header>
    {stepRail}{consequenceBanner}<section className="corporate-panel" aria-label="Review item and stores"><div className="catalog-review">
    <p><strong>{editing ? "Update " : "Add "}{name} · {packSize} · {formatCurrency(draft.price)} per pack</strong></p>
    <p>{catalogScope === "UNIVERSAL" ? `To all active stores. ${selectedEligible.length} stores are currently ready, and future active stores will inherit this item.` : `To ${selectedEligible.map((entry) => entry.location.name).join(", ")}.`}</p>
    <p>{mode === "NOW" ? "Available immediately." : "Available " + new Date(scheduledAt).toLocaleString() + "."} Expected shipping time: {leadTimeDays} days.</p>
    <p>Stores can order this item. Adding it does not place an order.</p>
    <p>{catalogScope === "UNIVERSAL" ? "If the master catalog already has this SKU, that master item will be updated for every eligible store." : editing ? "The item with this SKU will be updated in the selected stores." : "If a selected store already receives this SKU, its catalog item will be updated."}</p>
    <div className="catalog-review-actions"><button className="corporate-button-secondary" type="button" disabled={pending} onClick={() => { setView("EDIT"); go(2); }}>Back to stores</button><button type="button" className="corporate-button-secondary" disabled={pending} onClick={saveLater}>Save for later</button><button className="corporate-button" type="button" disabled={pending} onClick={confirm}>{pending ? "Saving…" : catalogScope === "UNIVERSAL" ? (editing ? "Save changes for all stores" : mode === "SCHEDULED" ? "Schedule for all stores" : "Add to all stores") : (editing ? "Save changes to " : mode === "SCHEDULED" ? "Schedule for " : "Add to ") + selectedEligible.length + (selectedEligible.length === 1 ? " store" : " stores")}</button></div>
    {draftMessage ? <p role="status">{draftMessage}</p> : null}{message ? <p className="corporate-form-message corporate-form-message-error" role="alert">{message}</p> : null}
  </div></section></div>;

  return <div className="corporate-catalog-bulk">
    <header className="corporate-work-masthead catalog-work-masthead">
      <div className="corporate-work-masthead-top">
        <div className="corporate-work-masthead-intro">
          {itemIntent === "ADD" || editing ? <button type="button" className="catalog-back-link" onClick={() => { setItemIntent("EDIT"); setEditing(false); go(1); }}>← Back to store catalog</button> : null}
          <p>Store catalog</p>
          <h1 ref={headingRef} tabIndex={-1}>{itemIntent === "EDIT" && !editing ? "Store catalog" : editing ? "Edit item" : step === 1 ? "Add item" : "Choose stores"}</h1>
          <span>{itemIntent === "EDIT" && !editing ? "Choose an item to update, hide, or remove." : editing ? "Update this catalog item for its assigned stores." : "Create a new item to make it available for ordering at selected locations."}</span>
        </div>
        {itemIntent === "EDIT" && !editing ? <button type="button" className="corporate-button" onClick={startNewItem}>Add item</button> : null}
      </div>
    </header>
    {itemIntent === "ADD" || editing ? stepRail : null}
    {itemIntent === "ADD" || editing ? consequenceBanner : null}
    {hasSavedDraft ? <aside className="catalog-saved-draft"><p>You have a saved draft.</p><button className="corporate-text-link" type="button" disabled={pending} onClick={resume}>Resume</button></aside> : null}
    <div hidden={step !== 1}>
      {itemIntent === "EDIT" && !editing ? <section className="corporate-panel catalog-edit-picker"><h3>Choose an existing item</h3><div className="corporate-field"><label htmlFor="catalog-edit-store">Store</label><select id="catalog-edit-store" value={catalogStore} onChange={(event) => void openCatalog(event.target.value)}><option value="">Choose a store</option>{eligible.map(({ location }) => <option key={location.id} value={location.id}>{location.name}</option>)}</select></div>
        {overrideItem ? <section className="catalog-override-editor" aria-label={`Store exception for ${overrideItem.name}`}><p><strong>{overrideItem.name}</strong><span>Only {stores.find((entry) => entry.location.id === catalogStore)?.location.name || catalogStore} will use these values.</span></p><div className="corporate-field"><label htmlFor="override-price">Store price (USD)</label><input id="override-price" inputMode="decimal" value={overridePrice} onChange={(event) => setOverridePrice(event.target.value)} aria-invalid={overridePriceError ? true : undefined} aria-describedby={overridePriceError ? "override-price-error" : undefined} />{overridePriceError ? <small id="override-price-error" className="corporate-field-error">{overridePriceError}</small> : null}</div><div className="corporate-field"><label htmlFor="override-days">Store lead time (days)</label><input id="override-days" type="number" min="0" max="365" value={overrideDays} onChange={(event) => setOverrideDays(event.target.value)} aria-invalid={overrideDaysError ? true : undefined} aria-describedby={overrideDaysError ? "override-days-error" : undefined} />{overrideDaysError ? <small id="override-days-error" className="corporate-field-error">{overrideDaysError}</small> : null}</div><label className="corporate-check-row"><input type="checkbox" checked={overrideAvailable} onChange={(event) => setOverrideAvailable(event.target.checked)} /><span>Available for this store</span></label><div><button type="button" className="corporate-text-link" onClick={() => setOverrideItem(undefined)}>Cancel</button><button type="button" className="corporate-button-secondary" disabled={overridePending} onClick={() => setOverrideRestoreConfirm(true)}>Restore master defaults</button><button type="button" className="corporate-button" disabled={overridePending || Boolean(overridePriceError || overrideDaysError)} onClick={saveStoreException}>{overridePending ? "Saving…" : "Save store exception"}</button></div>{overrideRestoreConfirm ? <div className="catalog-override-confirm" role="alert"><p>Remove this store’s custom values and use the master price, lead time, and availability?</p><button type="button" className="corporate-button-secondary" onClick={() => setOverrideRestoreConfirm(false)}>Keep exception</button><button type="button" className="corporate-button" disabled={overridePending} onClick={restoreMasterDefaults}>{overridePending ? "Restoring…" : "Confirm restore"}</button></div> : null}</section> : null}
        {catalogLoading ? <p role="status">Loading items…</p> : <ul className="catalog-batch-results">{items.map((item) => <li key={item.id}><div><strong>{item.name}</strong><small>{item.packSize} · {formatCurrency(item.price)}{item.catalogScope ? ` · ${item.catalogScope === "UNIVERSAL" ? "All stores" : "Selected stores"}` : " · Legacy store item"}{item.isAvailable ? "" : " · Removed from store catalog"}</small></div><button className="corporate-button-secondary" type="button" onClick={() => editItem(item)}>Edit item<span className="sr-only"> {item.name}</span></button>{item.catalogScope ? <button className="corporate-text-link" type="button" onClick={() => editStoreException(item)}>Store exception<span className="sr-only"> for {item.name}</span></button> : null}{item.isAvailable ? <button className="corporate-button-danger" type="button" disabled={removePending} onClick={(event) => { removalTriggerRef.current = event.currentTarget; setRemoveItem(item); }}>Remove item<span className="sr-only"> {item.name}</span></button> : null}</li>)}</ul>}<dialog ref={removalDialogRef} className="catalog-remove-dialog" aria-modal="true" aria-labelledby="catalog-remove-title" aria-describedby="catalog-remove-description" onClose={dismissRemovalDialog}>{removeItem ? <div className="catalog-remove-dialog__surface"><h3 id="catalog-remove-title">Remove item?</h3><p id="catalog-remove-description">Remove <strong>{removeItem.name}</strong> from {removeItem.catalogScope === "UNIVERSAL" ? "all active stores" : removeItem.catalogScope === "SELECTED" ? "its selected stores" : "this store"}? It will no longer be visible or orderable. You can publish it again later.</p><div className="catalog-remove-dialog__actions"><button type="button" className="corporate-button-secondary" disabled={removePending} onClick={dismissRemovalDialog}>No, keep item</button><button type="button" className="corporate-button-danger" disabled={removePending} onClick={removeFromCatalog}>{removePending ? "Removing…" : "Yes, remove item"}</button></div></div> : null}</dialog>{overrideMessage ? <p className={`corporate-form-message corporate-form-message-${overrideError ? "error" : "success"}`} role={overrideError ? "alert" : "status"}>{overrideMessage}</p> : null}{catalogMessage ? <p role="alert">{catalogMessage}</p> : catalogStore && !catalogLoading && !items.length ? <p>No items have been added to this store.</p> : null}
      </section> : null}
      {itemIntent === "ADD" || editing ? <div className="catalog-entry-layout"><section className="corporate-panel corporate-catalog-panel" aria-label={editing ? `Edit ${name}` : "Add new catalog item"}>
        <header className="catalog-entry-panel-header"><h3>Describe the item</h3><p>Enter the basic information for this catalog item. Fields marked <span aria-hidden="true">*</span> are required.</p></header>
        <fieldset disabled={pending} className="corporate-support-form corporate-catalog-form">
          <legend className="sr-only">Item details</legend>
          <div className="catalog-form-row catalog-form-row-two catalog-identity-row"><div className="catalog-identity-stack"><div className="corporate-field"><label htmlFor="catalog-item-name">Item name <span aria-hidden="true">*</span></label><input id="catalog-item-name" value={name} maxLength={128} onChange={(event) => syncSku(event.target.value)} onBlur={(event) => { touch("name"); validate("name", event.target.value); }} aria-invalid={fieldErrors.name ? true : undefined} aria-describedby={`catalog-name-help${fieldErrors.name ? " catalog-name-error" : ""}`} placeholder="e.g. Branded Black Apron" />{fieldErrors.name ? <small id="catalog-name-error" className="corporate-field-error" role="alert">{fieldErrors.name}</small> : null}<small id="catalog-name-help">Use a clear, descriptive name that will appear in the catalog.</small></div><div className="corporate-field catalog-sku-primary-field"><label htmlFor="catalog-sku">Item code (SKU) <span aria-hidden="true">*</span></label><div className="catalog-sku-input"><input ref={skuInputRef} id="catalog-sku" value={sku} readOnly={editing} maxLength={32} onChange={(event) => { const value = event.target.value.toUpperCase(); setSku(value); setSkuManual(true); if (imageUrl) { setImageVerified(false); setImageUploadMessage("Review the uploaded image after changing the item name or SKU."); } if (touched.sku) validate("sku", value); }} onBlur={(event) => { touch("sku"); validate("sku", event.target.value); }} aria-invalid={fieldErrors.sku ? true : undefined} aria-describedby={`catalog-sku-help${fieldErrors.sku ? " catalog-sku-error" : ""}`} />{!editing ? <button type="button" onClick={() => skuInputRef.current?.focus()}>Edit</button> : null}</div>{fieldErrors.sku ? <small id="catalog-sku-error" className="corporate-field-error" role="alert">{fieldErrors.sku}</small> : null}<small id="catalog-sku-help">{editing ? "This code stays the same when editing an item." : "Generated from the item name. Edit only if this item already has an established code."}</small></div></div><div className="catalog-category-image-stack"><div key={`category-${suggestionRevision}`} className={`corporate-field catalog-category-field ${categorySuggested ? "is-auto-suggested" : ""}`}><div className="catalog-field-label"><label htmlFor="catalog-category">Category <span aria-hidden="true">*</span></label>{categorySuggested ? <span>Auto-suggested</span> : null}</div><select id="catalog-category" value={category} onChange={(event) => { const value = event.target.value as typeof category; setCategory(value); setCategoryManual(true); setCategorySuggested(false); if (touched.category) validateExtra("category", value); }} onBlur={(event) => { touch("category"); validateExtra("category", event.target.value); }} aria-invalid={extraErrors.category ? true : undefined} aria-describedby={`catalog-category-help${extraErrors.category ? " catalog-category-error" : ""}`}><option value="" disabled>Choose a category</option>{categories.map((option) => <option key={option}>{option}</option>)}</select>{extraErrors.category ? <small id="catalog-category-error" className="corporate-field-error" role="alert">{extraErrors.category}</small> : null}<small id="catalog-category-help">{categorySuggested ? `Suggested from “${name}”. You can change it.` : "Select the best category for this item."}</small></div><section className="catalog-image-field" aria-labelledby="catalog-image-heading"><h4 id="catalog-image-heading">Product image</h4><div className="catalog-image-picker"><div className="catalog-image-thumbnail">{imageThumbnailUrl ? (imageThumbnailUrl.startsWith("blob:") ? <img src={imageThumbnailUrl} alt={previewImageAlt} /> : <Image src={imageThumbnailUrl} alt={previewImageAlt} width={160} height={160} />) : <Image src="/images/Logo.svg" alt="Budda's Bakery" width={132} height={27} />}</div><button type="button" className="catalog-image-dropzone" disabled={imageUploadPending} onClick={() => imageInputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files?.[0]; if (file) void uploadProductImage(file); }}><Upload size={20} aria-hidden="true" /><strong>{imageUploadPending ? "Uploading image…" : "Upload image"}</strong><span>JPEG, PNG, or WebP</span><small>Max 10 MB · Square image recommended</small></button></div><input ref={imageInputRef} id="catalog-image-upload" type="file" accept="image/jpeg,image/png,image/webp" disabled={imageUploadPending} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadProductImage(file); event.currentTarget.value = ""; }} />{imageUrl ? <><div className="catalog-image-upload-meta"><span>{imageAlt || "Product image uploaded"}</span><button type="button" className="corporate-text-link" onClick={() => { setImageUrl(""); setImageAlt(""); setImageVerified(false); setImagePreviewUrl(""); setImageUploadMessage("Product image removed."); }}>Remove image</button></div><label className="corporate-check-row"><input type="checkbox" checked={imageVerified} onChange={(event) => setImageVerified(event.target.checked)} /><span>I confirm this image shows the exact item or package for SKU {sku || "above"}.</span></label></> : null}{imageUploadMessage ? <p className={imageUrl ? "catalog-image-upload-status" : "corporate-field-error"} role={imageUrl ? "status" : "alert"}>{imageUploadMessage}</p> : null}</section></div></div>
          <section className="catalog-form-section" aria-labelledby="catalog-ordering-heading"><header><h4 id="catalog-ordering-heading">Ordering details</h4><p>Tell us how this item is purchased and priced.</p></header><div className="catalog-form-row catalog-form-row-three"><div className="corporate-field"><label htmlFor="catalog-purchase-unit">Purchase unit <span aria-hidden="true">*</span></label><select id="catalog-purchase-unit" value={purchaseUnit} onChange={(event) => { const unit = event.target.value as typeof purchaseUnit; setPurchaseUnit(unit); setPackSize(packSizeFor(unit, packQuantity)); }}><option>Each</option><option>Pack</option><option>Case</option><option>Bag</option></select><small>e.g. Each, Pack, Case, Bag</small></div><div className="corporate-field"><label htmlFor="catalog-pack-quantity">Units per pack <span aria-hidden="true">*</span></label><input id="catalog-pack-quantity" value={packQuantity} type="number" min="1" max="100000" inputMode="numeric" onChange={(event) => { setPackQuantity(event.target.value); setPackSize(packSizeFor(purchaseUnit, event.target.value)); if (touched.pack) validateExtra("pack", event.target.value); }} onBlur={(event) => { touch("pack"); validateExtra("pack", event.target.value); }} aria-invalid={extraErrors.pack ? true : undefined} aria-describedby={`catalog-pack-help${extraErrors.pack ? " catalog-pack-error" : ""}`} placeholder="e.g. 5" /><small id="catalog-pack-help">How many items are in one pack?</small>{extraErrors.pack ? <small id="catalog-pack-error" className="corporate-field-error" role="alert">{extraErrors.pack}</small> : null}</div><div className="corporate-field"><label htmlFor="catalog-price">Price per pack (USD) <span aria-hidden="true">*</span></label><div className="catalog-currency-input"><span aria-hidden="true">$</span><input id="catalog-price" value={price} onChange={(event) => { setPrice(event.target.value); if (touched.price) validate("price", event.target.value); }} onBlur={(event) => { touch("price"); validate("price", event.target.value); if (!errorFor("price", event.target.value)) setPrice(formatCurrency(priceValue(event.target.value))); }} inputMode="decimal" aria-invalid={fieldErrors.price ? true : undefined} aria-describedby={`catalog-price-help${fieldErrors.price ? " catalog-price-error" : ""}`} placeholder="0.00" /></div><small id="catalog-price-help">Enter the total price for one pack.</small>{fieldErrors.price ? <small id="catalog-price-error" className="corporate-field-error" role="alert">{fieldErrors.price}</small> : null}</div></div>{Number(packQuantity) > 0 && priceValue(price) > 0 ? <p className="catalog-pack-calculation" role="status"><Info size={16} aria-hidden="true" />You entered a {purchaseUnit.toLowerCase()} of {packQuantity} for {formatCurrency(priceValue(price))}, which is {formatCurrency(priceValue(price) / Number(packQuantity))} per item.</p> : null}</section>
          <section className="catalog-form-section" aria-labelledby="catalog-fulfillment-heading"><header><h4 id="catalog-fulfillment-heading">Fulfillment</h4><p>Set ordering expectations for this item.</p></header><div className="corporate-field catalog-lead-time-field"><label htmlFor="catalog-lead-time">Shipping lead time <span aria-hidden="true">*</span></label><div className="catalog-suffixed-input"><input id="catalog-lead-time" value={leadTimeDays} onChange={(event) => { setLeadTimeDays(event.target.value); if (touched.days) validateExtra("days", event.target.value); }} onBlur={(event) => { touch("days"); validateExtra("days", event.target.value); }} type="number" min="0" max="365" inputMode="numeric" aria-invalid={extraErrors.days ? true : undefined} aria-describedby={`catalog-lead-time-help${extraErrors.days ? " catalog-lead-time-error" : ""}`} /><span>business days</span></div><small id="catalog-lead-time-help">Estimated time before the item ships from the supplier. Used to set reordering expectations.</small>{extraErrors.days ? <small id="catalog-lead-time-error" className="corporate-field-error" role="alert">{extraErrors.days}</small> : null}</div></section>
          <details className="corporate-catalog-description"><summary><span><strong>More details (optional)</strong><small>Add description, brand, dimensions, and other details.</small></span></summary><div className="corporate-field"><label htmlFor="catalog-description">Description (optional)</label><textarea id="catalog-description" value={description} maxLength={600} onChange={(event) => setDescription(event.target.value)} /></div></details>
        </fieldset>
      </section><aside className="catalog-live-preview" aria-label="Catalog preview"><header><h3>Catalog preview</h3><p>This is how the item will appear to franchisees.</p></header><article><div className="catalog-preview-image">{previewImageUrl.startsWith("blob:") ? <img src={previewImageUrl} alt={previewImageAlt} /> : <Image src={previewImageUrl} alt={previewImageAlt} width={640} height={640} />}</div><p className="catalog-preview-category">{category || "Category"}</p><h4>{name || "Item name"}</h4><span className="catalog-preview-pack">{packSize || "Purchase unit"}</span><dl><div><dt>SKU</dt><dd>{sku || "Generated automatically"}</dd></div><div><dt className="sr-only">Availability</dt><dd><CircleCheck size={14} aria-hidden="true" /> Available to order · Ships in ~{leadTimeDays || "—"} business days</dd></div></dl><p className="catalog-preview-price"><strong>{Number.isFinite(priceValue(price)) && priceValue(price) > 0 ? formatCurrency(priceValue(price)) : "$0.00"}</strong> per pack</p>{Number(packQuantity) > 0 && priceValue(price) > 0 ? <small>Includes {packQuantity} items · {formatCurrency(priceValue(price) / Number(packQuantity))} each</small> : <small>Enter quantity and price to see the unit cost.</small>}<button type="button" disabled><ShoppingCart size={16} aria-hidden="true" /> Add 1 pack — {Number.isFinite(priceValue(price)) && priceValue(price) > 0 ? formatCurrency(priceValue(price)) : "$0.00"}</button></article><footer>Preview updates as you enter information.</footer></aside></div> : null}
    </div>
    <div hidden={step !== 2}>
      <CorporatePanel title="Where should this item be available?" description="Use the universal catalog for standard supplies. Limit an item only when stores should not all receive it.">
        <div className="catalog-scope-options" role="radiogroup" aria-label="Catalog availability"><label className={catalogScope === "UNIVERSAL" ? "is-selected" : ""}><input type="radio" name="catalogScope" value="UNIVERSAL" checked={catalogScope === "UNIVERSAL"} disabled={!canPublishUniversal} onChange={() => setCatalogScope("UNIVERSAL")} /><span><strong>All active stores</strong><small>{canPublishUniversal ? "Recommended. Current and future active stores receive the master item automatically." : "Requires corporate-wide catalog access."}</small></span></label><label className={catalogScope === "SELECTED" ? "is-selected" : ""}><input type="radio" name="catalogScope" value="SELECTED" checked={catalogScope === "SELECTED"} onChange={() => setCatalogScope("SELECTED")} /><span><strong>Only selected stores</strong><small>Use for regional products, equipment-specific parts, or limited launches.</small></span></label></div>
        {catalogScope === "UNIVERSAL" ? <div className="catalog-universal-summary" role="status"><strong>{eligible.length} stores ready now</strong><p>The item will also appear automatically when another store becomes active and verified. Store overrides can hide it or adjust price and lead time later.</p></div> : <><div className="catalog-store-controls"><label className="corporate-field"><span>Find a store</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} placeholder="Store name, code, or city" /></label>
          <label className="corporate-field"><span>Region</span><select value={region} onChange={(event) => { setRegion(event.target.value); setPage(0); }}><option value="ALL">All regions</option>{regions.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="corporate-field"><span>Franchise group</span><select value={group} onChange={(event) => { setGroup(event.target.value); setPage(0); }}><option value="ALL">All groups</option>{groups.map((value) => <option key={value}>{value}</option>)}</select></label>
        </div>
        <div className="catalog-selection-actions"><button className="corporate-button-secondary" type="button" onClick={selectEligibleMatches}>Select all available matches</button><button className="corporate-text-link" type="button" onClick={clearSelection}>Clear selection</button><output aria-live="polite">{selectedEligible.length} stores selected</output></div>
        <div className="catalog-store-list">{pageStores.map((entry) => <div className={"catalog-store-row " + (entry.eligible ? "" : "is-ineligible")} key={entry.location.id}><input id={"store-" + entry.location.id} type="checkbox" checked={selected.has(entry.location.id)} disabled={!entry.eligible} onChange={() => toggleStore(entry.location.id)} /><span><label htmlFor={"store-" + entry.location.id}><strong>{entry.location.name}</strong></label><small>{entry.location.code}</small>{entry.reason ? <em>{entry.reason} <Link href={"/corporate/directory/locations/" + encodeURIComponent(entry.location.id) + "/edit"}>Review store details</Link></em> : null}</span><StatusBadge tone={entry.eligible ? "success" : "waiting"}>{entry.eligible ? "Available" : "Needs attention"}</StatusBadge></div>)}</div>
        {!filtered.length ? <p className="catalog-selection-guidance">No stores match your search.</p> : null}
        {pageCount > 1 ? <div className="catalog-pagination"><span>Page {page + 1} of {pageCount}</span><button className="corporate-button-secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button><button className="corporate-button-secondary" disabled={page + 1 >= pageCount} onClick={() => setPage(page + 1)}>Next</button></div> : null}</>}
      </CorporatePanel>
      <div className="catalog-timing"><p>Available immediately after you confirm.</p><label><input type="checkbox" checked={mode === "SCHEDULED"} onChange={(event) => setMode(event.target.checked ? "SCHEDULED" : "NOW")} /> Choose a later date</label>{mode === "SCHEDULED" ? <label className="corporate-field"><span>When should it become available?</span><input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} /><small>Uses your device's local time.</small></label> : null}</div>
    </div>
    {step !== 1 || itemIntent === "ADD" || editing ? <div className="catalog-bulk-action-bar">{step > 1 ? <button className="corporate-button-secondary" type="button" disabled={pending} onClick={() => go(1)}>Back to item</button> : null}<button className="corporate-text-link" type="button" disabled={pending} onClick={saveLater}>{pending ? "Saving…" : "Save draft"}</button>{step === 1 && !itemComplete ? <p id="catalog-action-hint" className="catalog-action-hint">Complete required fields to continue.</p> : null}<span aria-hidden="true" /><button className="corporate-button" type="button" disabled={primaryDisabled} aria-describedby={step === 1 && !itemComplete ? "catalog-action-hint" : undefined} onClick={step === 1 ? continueToStores : requestReview}>{step === 1 ? "Continue to stores" : "Review and add"}</button></div> : null}
    {draftMessage ? <p role="status">{draftMessage}</p> : null}{message ? <p className="corporate-form-message corporate-form-message-error" role="alert">{message}</p> : null}
  </div>;
}

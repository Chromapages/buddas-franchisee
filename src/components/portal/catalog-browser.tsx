"use client";

import { useState, useTransition } from "react";
import type { ChangeEvent } from "react";
import type { PortalProduct } from "@/src/features/portal/types";
import { Search, Plus, Check, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { addPortalCartItemAction } from "@/src/features/portal/cart-actions";
import { usePortalContext } from "@/src/features/portal/portal-context";

export type CatalogBrowserProps = {
  products: PortalProduct[];
  initialCartCount: number;
};

export const CatalogBrowser = ({
  products,
  initialCartCount,
}: CatalogBrowserProps) => {
  const { updateCount } = usePortalContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [cartTotalCount, setCartTotalCount] = useState(initialCartCount);
  const [addedSku, setAddedSku] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const categories = [
    "ALL",
    "Bakery & Dough",
    "Packaging",
    "Signage & Uniforms",
  ];

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddToCart = (product: PortalProduct) => {
    startTransition(async () => {
      const result = await addPortalCartItemAction(product.sku);
      setCartTotalCount(result.count);
      updateCount("cartItemCount", result.count);
      setAddedSku(product.sku);
      setTimeout(() => setAddedSku(null), 1500);
    });
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === "ALL" || p.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (products.length === 0) {
    return (
      <div role="status" className="portal-empty-state flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h2 className="heading-minor text-bds-teal-dark">No authorized supplies are available</h2>
          <p className="text-sm text-bds-cocoa/80">The approved catalog for this unit is currently empty. Operations Support can confirm availability.</p>
        </div>
        <Link href="/portal/support" className="touch-target-inline shrink-0 text-xs font-bold uppercase tracking-wider text-bds-teal-dark underline underline-offset-4">Contact support</Link>
      </div>
    );
  }

  return (
    <div className="catalog-browser space-y-5">
      {/* Search and Filters Bar */}
      <div className="catalog-toolbar flex flex-col items-center justify-between gap-4 rounded-2xl border border-bds-teal-dark/15 bg-white p-5 shadow-sm">
        <div className="catalog-search relative w-full">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-bds-cocoa/40" aria-hidden="true" />
          <input
            id="catalog-search"
            aria-label="Search supplies by SKU or product name"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search SKU or product name..."
            className="w-full pl-12 pr-4 py-3 bg-bds-cream/40 border border-bds-teal-dark/20 rounded-xl text-sm font-semibold text-bds-teal-dark placeholder:text-bds-cocoa/50 focus:outline-none focus:ring-2 focus:ring-bds-teal focus:border-bds-teal"
          />
        </div>

        <div className="catalog-categories flex flex-wrap items-center gap-2 w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`touch-target rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                selectedCategory === cat
                  ? "bg-bds-teal-dark text-white shadow-sm"
                  : "bg-bds-cream hover:bg-bds-gold/30 text-bds-teal-dark border border-bds-teal-dark/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {cartTotalCount > 0 ? (
          <Link
            href="/portal/cart"
            className="touch-target btn-primary !py-2.5 !px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            Cart ({cartTotalCount})
          </Link>
        ) : null}
      </div>

      {/* Product Cards Grid */}
      <div className="catalog-grid grid gap-6">
        {filteredProducts.map((product) => (
          <article
            key={product.id}
            className="flex flex-col justify-between space-y-5 rounded-2xl border border-bds-teal-dark/15 bg-white p-5 shadow-sm"
          >
            <div className="space-y-3">
              {product.imageUrl ? (
                <div className="relative h-44 w-full overflow-hidden rounded-xl bg-bds-cream/60 border border-bds-teal-dark/10">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              ) : null}

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-bds-cream text-bds-teal-dark border border-bds-teal-dark/10">
                  {product.category}
                </span>
                <span className="text-xs font-mono text-bds-cocoa/60">
                  {product.sku}
                </span>
              </div>

              <div className="heading-stack">
                <h2 className="heading-minor text-bds-teal-dark">
                  <Link href={`/portal/supplies/${product.slug}`} className="hover:underline">
                    {product.name}
                  </Link>
                </h2>
                <p className="text-xs text-bds-cocoa/80 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-bds-cream/40 border border-bds-teal-dark/10 text-xs text-bds-cocoa/80 space-y-1">
                <p><strong>Pack Size:</strong> {product.packSize}</p>
                <p><strong>Lead Time:</strong> {product.leadTimeDays} business days</p>
              </div>
            </div>

            <div className="pt-4 border-t border-bds-teal-dark/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-bds-cocoa/60 block">Wholesale Price</span>
                <span className="text-2xl font-black font-heading text-bds-teal-dark">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleAddToCart(product)}
                disabled={isPending}
                className={`touch-target px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  addedSku === product.sku
                    ? "bg-emerald-700 text-white"
                    : "btn-secondary !py-2.5 !px-4"
                }`}
              >
                {addedSku === product.sku ? (
                  <>
                    <Check className="w-4 h-4" aria-hidden="true" />
                    Added
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    {isPending ? "Adding..." : "Add to Cart"}
                  </>
                )}
              </button>
            </div>
          </article>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div role="status" className="portal-empty-state space-y-1">
          <h2 className="heading-minor text-bds-teal-dark">
            No supplies found
          </h2>
          <p className="text-sm text-bds-cocoa/70">
            Try adjusting your search query or selecting a different category.
          </p>
        </div>
      ) : null}
    </div>
  );
};

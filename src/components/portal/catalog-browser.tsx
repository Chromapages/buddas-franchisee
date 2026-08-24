"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import type { PortalProduct } from "@/src/features/portal/types";
import { Package, Search, Plus, Check, ShoppingBag } from "lucide-react";
import Link from "next/link";

export type CatalogBrowserProps = {
  products: PortalProduct[];
  locationId: string;
};

type CartItem = {
  sku: string;
  name: string;
  quantity: number;
  price: number;
};

export const CatalogBrowser = ({
  products,
  locationId: _locationId,
}: CatalogBrowserProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addedSku, setAddedSku] = useState<string | null>(null);

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
    setCart((prev) => {
      const existing = prev.find((item) => item.sku === product.sku);
      if (existing) {
        return prev.map((item) =>
          item.sku === product.sku
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          sku: product.sku,
          name: product.name,
          quantity: 1,
          price: product.price,
        },
      ];
    });

    setAddedSku(product.sku);
    setTimeout(() => {
      setAddedSku(null);
    }, 1500);
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

  const cartTotalCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="space-y-8">
      {/* Search and Filters Bar */}
      <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-brand-charcoal/40" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search SKU or product name..."
            className="w-full pl-12 pr-4 py-3 bg-brand-sand/50 border border-brand-charcoal/20 rounded-xl text-sm font-semibold text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-clay"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                selectedCategory === cat
                  ? "bg-brand-clay text-white shadow-sm"
                  : "bg-brand-sand hover:bg-brand-butter/50 text-brand-charcoal"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {cartTotalCount > 0 ? (
          <Link
            href="/portal/cart"
            className="btn-primary !py-2.5 !px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            Cart ({cartTotalCount})
          </Link>
        ) : null}
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-brand-charcoal/10 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6 hover:border-brand-clay/40 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-sand text-brand-clay">
                  {product.category}
                </span>
                <span className="text-xs font-mono text-brand-charcoal/50">
                  {product.sku}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold font-heading text-brand-charcoal">
                  {product.name}
                </h3>
                <p className="text-xs text-brand-charcoal/70 mt-1 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-brand-sand/40 border border-brand-charcoal/5 text-xs text-brand-charcoal/70 space-y-1">
                <p><strong>Pack Size:</strong> {product.packSize}</p>
                <p><strong>Lead Time:</strong> {product.leadTimeDays} business days</p>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-sand flex items-center justify-between">
              <div>
                <span className="text-xs text-brand-charcoal/50 block">Wholesale Price</span>
                <span className="text-2xl font-black font-heading text-brand-charcoal">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleAddToCart(product)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  addedSku === product.sku
                    ? "bg-emerald-600 text-white"
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
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-12 text-center space-y-3">
          <Package className="w-10 h-10 text-brand-charcoal/30 mx-auto" aria-hidden="true" />
          <h3 className="text-lg font-bold font-heading text-brand-charcoal">
            No supplies found
          </h3>
          <p className="text-xs text-brand-charcoal/60">
            Try adjusting your search query or selecting a different category.
          </p>
        </div>
      ) : null}
    </div>
  );
};

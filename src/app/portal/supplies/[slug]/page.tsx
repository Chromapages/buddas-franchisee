import { notFound } from "next/navigation";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import Link from "next/link";
import { ArrowLeft, Package, Clock } from "lucide-react";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";

import Image from "next/image";

export default async function SupplyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await requirePortalPermission("VIEW_CATALOG");
  const products = await defaultPortalStorage.getProductsByLocation(session.locationId);
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="workspace-detail portal-page-stack">
      <Link
        href="/portal/supplies"
        className="touch-target-inline gap-2 text-xs font-bold uppercase tracking-wider text-bds-cocoa/80 hover:text-bds-teal-dark transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Supplies Catalog
      </Link>

      <div className="space-y-6 rounded-2xl border border-bds-teal-dark/15 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-bds-teal-dark/10 pb-5 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-bds-teal-dark">
              {product.category} &bull; {product.sku}
            </span>
            <h1 className="portal-page-title">
              {product.name}
            </h1>
          </div>
          <div className="text-right">
            <span className="text-xs text-bds-cocoa/70 block">Wholesale Price</span>
            <span className="text-2xl font-black font-heading text-bds-teal-dark">
              ${product.price.toFixed(2)}
            </span>
          </div>
        </div>

        {product.imageUrl ? (
          <div className="relative h-64 sm:h-80 w-full overflow-hidden rounded-xl bg-bds-cream/60 border border-bds-teal-dark/10">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 800px"
            />
          </div>
        ) : null}

        <div className="space-y-4">
          <h2 className="heading-panel text-bds-teal-dark">
            Product Specification &amp; Operating Role
          </h2>
          <p className="text-base text-bds-cocoa/80 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-bds-cream/50 border border-bds-teal-dark/10 flex items-center gap-3">
            <Package className="w-5 h-5 text-bds-teal-dark" aria-hidden="true" />
            <div>
              <span className="text-xs text-bds-cocoa/70 font-semibold block">
                Pack / Case Size
              </span>
              <span className="text-sm font-bold text-bds-teal-dark">
                {product.packSize}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-bds-cream/50 border border-bds-teal-dark/10 flex items-center gap-3">
            <Clock className="w-5 h-5 text-bds-teal-dark" aria-hidden="true" />
            <div>
              <span className="text-xs text-bds-cocoa/70 font-semibold block">
                Logistics Lead Time
              </span>
              <span className="text-sm font-bold text-bds-teal-dark">
                {product.leadTimeDays} Business Days
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-bds-teal-dark/10 pt-4">
          <Link href="/portal/supplies" className="btn-primary text-xs font-bold uppercase tracking-wider">
            Order in Catalog Browser
          </Link>
        </div>
      </div>
    </div>
  );
}

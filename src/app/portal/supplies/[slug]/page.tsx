import { notFound } from "next/navigation";
import { getPortalSession } from "@/src/features/auth/session";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import Link from "next/link";
import { ArrowLeft, Package, Clock, ShieldCheck } from "lucide-react";

export default async function SupplyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = (await getPortalSession())!;
  const products = await defaultPortalStorage.getProductsByLocation(session.locationId);
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <Link
        href="/portal/supplies"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-charcoal/70 hover:text-brand-clay transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Supplies Catalog
      </Link>

      <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-brand-sand">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-clay">
              {product.category} &bull; {product.sku}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-brand-charcoal mt-1">
              {product.name}
            </h1>
          </div>
          <div className="text-right">
            <span className="text-xs text-brand-charcoal/60 block">Wholesale Price</span>
            <span className="text-3xl font-black font-heading text-brand-charcoal">
              ${product.price.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-charcoal">
            Product Specification &amp; Operating Role
          </h3>
          <p className="text-base text-brand-charcoal/80 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-brand-sand/50 border border-brand-charcoal/5 flex items-center gap-3">
            <Package className="w-5 h-5 text-brand-clay" aria-hidden="true" />
            <div>
              <span className="text-xs text-brand-charcoal/60 font-semibold block">
                Pack / Case Size
              </span>
              <span className="text-sm font-bold text-brand-charcoal">
                {product.packSize}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-brand-sand/50 border border-brand-charcoal/5 flex items-center gap-3">
            <Clock className="w-5 h-5 text-brand-clay" aria-hidden="true" />
            <div>
              <span className="text-xs text-brand-charcoal/60 font-semibold block">
                Logistics Lead Time
              </span>
              <span className="text-sm font-bold text-brand-charcoal">
                {product.leadTimeDays} Business Days
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-brand-sand flex items-center justify-between">
          <span className="text-xs text-brand-charcoal/60">
            Assigned Warehouse Route: HI-OAHU-01
          </span>
          <Link href="/portal/supplies" className="btn-primary text-xs font-bold uppercase tracking-wider">
            Order in Catalog Browser
          </Link>
        </div>
      </div>
    </div>
  );
}

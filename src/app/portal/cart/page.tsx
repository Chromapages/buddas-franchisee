import { getPortalSession } from "@/src/features/auth/session";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Package } from "lucide-react";

export default async function CartPage() {
  const session = (await getPortalSession())!;
  const products = await defaultPortalStorage.getProductsByLocation(session.locationId);

  // Demo default cart items
  const demoCartItems = [
    { ...products[0], quantity: 4 },
    { ...products[1], quantity: 2 },
  ];

  const subtotal = demoCartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-clay">
          Wholesale Logistics
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brand-charcoal">
          Store Supply Cart
        </h2>
        <p className="text-sm text-brand-charcoal/70 mt-1">
          Review supply orders allocated for <strong>{session.locationName}</strong>.
        </p>
      </div>

      <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-4 divide-y divide-brand-sand">
          {demoCartItems.map((item) => (
            <div key={item.sku} className="pt-4 first:pt-0 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-clay">
                  {item.sku}
                </span>
                <h4 className="text-base font-bold font-heading text-brand-charcoal">
                  {item.name}
                </h4>
                <p className="text-xs text-brand-charcoal/60">
                  Pack: {item.packSize} &bull; ${item.price.toFixed(2)} / unit
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-brand-charcoal/60 block">
                  Qty: {item.quantity}
                </span>
                <span className="text-lg font-black font-heading text-brand-charcoal">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-brand-sand space-y-3">
          <div className="flex items-center justify-between text-sm text-brand-charcoal/70">
            <span>Estimated Freight &amp; Handling</span>
            <span className="font-semibold text-emerald-700">Covered under Master Agreement</span>
          </div>
          <div className="flex items-center justify-between text-xl font-black font-heading text-brand-charcoal">
            <span>Estimated Total</span>
            <span className="text-brand-clay">${subtotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/portal/supplies"
            className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/70 hover:text-brand-clay"
          >
            &larr; Continue Shopping
          </Link>
          <Link
            href="/portal/checkout"
            className="btn-primary w-full sm:w-auto text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            Proceed to Location Checkout
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}

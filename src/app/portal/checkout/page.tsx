import { getPortalSession } from "@/src/features/auth/session";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { checkoutFormAction } from "@/src/features/portal/actions";
import { ShieldCheck, Store } from "lucide-react";

export default async function CheckoutPage() {
  const session = (await getPortalSession())!;
  const products = await defaultPortalStorage.getProductsByLocation(session.locationId);

  const orderItems = [
    { sku: products[0].sku, name: products[0].name, quantity: 4, price: products[0].price },
    { sku: products[1].sku, name: products[1].name, quantity: 2, price: products[1].price },
  ];

  const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-clay">
          Order Finalization
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brand-charcoal">
          Location Checkout
        </h2>
        <p className="text-sm text-brand-charcoal/70 mt-1">
          Direct warehouse invoice billing for <strong>{session.locationName}</strong>.
        </p>
      </div>

      <form action={checkoutFormAction} className="bg-white border border-brand-charcoal/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <input type="hidden" name="locationId" value={session.locationId} />
        <input type="hidden" name="items" value={JSON.stringify(orderItems)} />

        {/* Location Verification Box */}
        <div className="p-4 rounded-2xl bg-brand-sand/50 border border-brand-charcoal/10 flex items-center gap-3">
          <Store className="w-5 h-5 text-brand-clay shrink-0" aria-hidden="true" />
          <div className="text-xs text-brand-charcoal">
            <span className="font-bold block">Delivery Unit Destination</span>
            <span>{session.locationName} &bull; Unit Code: {session.locationId}</span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-charcoal">
            Line Items Summary
          </h3>
          <div className="space-y-2">
            {orderItems.map((item) => (
              <div key={item.sku} className="flex items-center justify-between text-xs py-2 border-b border-brand-sand">
                <span className="font-semibold text-brand-charcoal">
                  {item.quantity}x {item.name} ({item.sku})
                </span>
                <span className="font-bold text-brand-charcoal">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total & Terms */}
        <div className="pt-4 border-t border-brand-sand flex items-center justify-between">
          <span className="text-base font-bold font-heading text-brand-charcoal">Total Invoice Amount</span>
          <span className="text-2xl font-black font-heading text-brand-clay">
            ${total.toFixed(2)}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-brand-sand/30 border border-brand-charcoal/5 text-xs text-brand-charcoal/70 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-brand-charcoal">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-clay" aria-hidden="true" />
            Terms of Wholesale Supply
          </div>
          <p>
            Invoices are billed net-30 through the franchisee central account. Deliveries are routed via cold-chain freight within 3–5 business days.
          </p>
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-4 text-base font-bold shadow-md hover:shadow-lg transition-all"
        >
          Submit Wholesale Order &amp; Generate Invoice
        </button>
      </form>
    </div>
  );
}

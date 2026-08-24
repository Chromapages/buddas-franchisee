import { getPortalSession } from "@/src/features/auth/session";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { Clock, Package, CheckCircle2 } from "lucide-react";

export default async function OrdersPage() {
  const session = (await getPortalSession())!;
  const orders = await defaultPortalStorage.getOrdersByLocation(session.locationId);

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-clay">
          Shipment Tracking
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brand-charcoal">
          Store Orders &amp; Invoices
        </h2>
        <p className="text-sm text-brand-charcoal/70 mt-1">
          Historical and active wholesale orders for <strong>{session.locationName}</strong>.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-brand-charcoal/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-brand-sand">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-sand flex items-center justify-center text-brand-clay">
                  <Package className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold font-heading text-brand-charcoal">
                      Order {order.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        order.status === "Delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <span className="text-xs text-brand-charcoal/60">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} &bull; Invoice {order.invoiceId}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-brand-charcoal/60 block">Total</span>
                <span className="text-xl font-black font-heading text-brand-charcoal">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/60 block">
                Items in Shipment
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {order.items.map((item, idx) => (
                  <div
                    key={`${item.sku}-${idx}`}
                    className="p-3 rounded-xl bg-brand-sand/30 border border-brand-charcoal/5 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-brand-charcoal">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-mono text-brand-charcoal/60">{item.sku}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-brand-charcoal/60">
              <span>Expected Delivery: {order.eta}</span>
              <span>Billing: Net-30 Central Statement</span>
            </div>
          </div>
        ))}

        {orders.length === 0 ? (
          <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-12 text-center space-y-3">
            <Clock className="w-10 h-10 text-brand-charcoal/30 mx-auto" aria-hidden="true" />
            <h3 className="text-lg font-bold font-heading text-brand-charcoal">
              No orders placed yet
            </h3>
            <p className="text-xs text-brand-charcoal/60">
              Wholesale orders submitted through the supplies catalog will appear here.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

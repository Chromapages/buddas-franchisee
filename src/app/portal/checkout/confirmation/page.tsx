import Link from "next/link";
import { CheckCircle2, Store } from "lucide-react";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { redirect } from "next/navigation";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
  const session = await requirePortalPermission("VIEW_ORDERS");
  const { orderId } = await searchParams;
  if (!orderId) redirect("/portal/orders");
  const orders = await defaultPortalStorage.getOrdersByLocation(session.locationId);
  const order = orders.find((candidate) => candidate.id === orderId);
  if (!order) redirect("/portal/orders");
  return (
    <div className="workspace-form mx-auto portal-page-stack text-center">
      <div className="space-y-5 rounded-2xl border border-bds-teal-dark/15 bg-white p-6 shadow-sm sm:p-8">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-700" aria-hidden="true" />

        <div className="heading-stack">
          <h1 className="portal-page-title">
            Wholesale Order Confirmed
          </h1>
          <p className="text-sm text-bds-cocoa/80 leading-relaxed">
            Your supply order has been accepted for the confirmed fulfillment destination below.
          </p>
        </div>

        <div className="rounded-2xl border border-bds-teal-dark/15 bg-white p-4 text-left text-xs text-bds-teal-dark space-y-1">
          <p><strong>Order reference:</strong> {order.id}</p>
          <p><strong>Invoice reference:</strong> {order.invoiceId}</p>
          <p><strong>Items:</strong> {order.items.length}</p>
          <p><strong>Order total:</strong> ${order.total.toFixed(2)}</p>
        </div>

        <div className="p-5 rounded-2xl bg-bds-cream/60 border-2 border-bds-teal-dark/30 text-left text-xs text-bds-teal-dark space-y-1">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-bds-teal-dark">
            <Store className="h-4 w-4" aria-hidden="true" />
            Confirmed fulfillment destination
          </div>
          <p className="text-base font-bold">{session.locationName}</p>
          <p className="text-bds-cocoa/80">Unit code: {session.locationId}</p>
        </div>

        <div className="p-4 rounded-2xl bg-bds-cream/40 border border-bds-teal-dark/15 text-xs text-bds-cocoa/80 space-y-1">
          <p><strong>Fulfillment ETA:</strong> {order.eta}</p>
          <p><strong>Billing:</strong> Account Statement Net-30</p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/portal/orders" className="btn-primary w-full sm:w-auto text-xs font-bold uppercase tracking-wider">
            View Orders History
          </Link>
          <Link href="/portal" className="btn-outline w-full sm:w-auto text-xs font-bold uppercase tracking-wider">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

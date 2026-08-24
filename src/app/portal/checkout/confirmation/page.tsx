import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function ConfirmationPage() {
  return (
    <div className="space-y-8 max-w-xl mx-auto py-12 text-center">
      <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-8 sm:p-12 shadow-sm space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
          <CheckCircle2 className="w-10 h-10" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-black font-heading text-brand-charcoal">
            Wholesale Order Confirmed
          </h2>
          <p className="text-sm text-brand-charcoal/70 leading-relaxed">
            Your supply order has been accepted and dispatched to the regional fulfillment center.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-brand-sand/50 border border-brand-charcoal/10 text-xs text-brand-charcoal space-y-1">
          <p><strong>Fulfillment ETA:</strong> 3-5 Business Days</p>
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

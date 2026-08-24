import { getPortalSession } from "@/src/features/auth/session";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { logoutAction } from "@/src/features/auth/actions";
import { User, Store, ShieldCheck, LogOut } from "lucide-react";

export default async function AccountPage() {
  const session = (await getPortalSession())!;
  const locations = await defaultPortalStorage.getLocations();
  const currentLocation = locations.find((l) => l.id === session.locationId);

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-clay">
          Operator Credentials
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brand-charcoal">
          Account Profile &amp; Location Scope
        </h2>
        <p className="text-sm text-brand-charcoal/70 mt-1">
          Review your authorized permissions and franchise unit details.
        </p>
      </div>

      <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-brand-sand">
          <div className="w-14 h-14 rounded-2xl bg-brand-sand flex items-center justify-center text-brand-clay font-black font-heading text-xl">
            {session.email[0].toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold font-heading text-brand-charcoal">
              {session.email}
            </h3>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-clay">
              Role: {session.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-brand-sand/40 border border-brand-charcoal/5 space-y-1">
            <span className="font-bold uppercase text-brand-charcoal/60 block">
              Active Store Unit
            </span>
            <span className="text-sm font-bold text-brand-charcoal block">
              {session.locationName} ({session.locationId})
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-brand-sand/40 border border-brand-charcoal/5 space-y-1">
            <span className="font-bold uppercase text-brand-charcoal/60 block">
              Franchisee Entity
            </span>
            <span className="text-sm font-bold text-brand-charcoal block">
              {currentLocation?.franchiseeName || "Budda's Corporate Affiliate"}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-brand-sand/40 border border-brand-charcoal/5 space-y-1">
            <span className="font-bold uppercase text-brand-charcoal/60 block">
              Accessible Units
            </span>
            <span className="text-sm font-bold text-brand-charcoal block">
              {session.managedLocationIds.join(", ")}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-brand-sand/40 border border-brand-charcoal/5 space-y-1">
            <span className="font-bold uppercase text-brand-charcoal/60 block">
              Session Expiration
            </span>
            <span className="text-sm font-bold text-brand-charcoal block">
              {new Date(session.expiresAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="pt-6 border-t border-brand-sand">
          <form action={logoutAction}>
            <button
              type="submit"
              className="btn-outline text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 hover:border-red-300 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Sign Out of Operator Portal
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

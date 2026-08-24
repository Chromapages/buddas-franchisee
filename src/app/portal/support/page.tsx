import { getPortalSession } from "@/src/features/auth/session";
import { SupportForm } from "@/src/components/portal/support-form";

export default async function SupportPage() {
  const session = (await getPortalSession())!;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-clay">
          Field Operations Desk
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brand-charcoal">
          Operations Support &amp; Ticketing
        </h2>
        <p className="text-sm text-brand-charcoal/70 mt-1">
          Direct assistance with bakery equipment, supply logistics, or recipe standards for <strong>{session.locationName}</strong>.
        </p>
      </div>

      <SupportForm locationId={session.locationId} />
    </div>
  );
}

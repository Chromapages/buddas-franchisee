import Link from "next/link";

export default function PortalNotFound() {
  return (
    <section className="portal-empty-state max-w-3xl space-y-3">
      <div className="space-y-1">
        <p className="portal-page-eyebrow">Operator Workspace</p>
        <h1 className="portal-page-title">This workspace item is unavailable</h1>
      </div>
      <p className="text-sm text-bds-cocoa/80">
        It may have been removed, may not be assigned to the active unit, or you may not have access.
      </p>
      <Link href="/portal" className="btn-primary inline-flex text-xs font-bold uppercase tracking-wider">
        Return to dashboard
      </Link>
    </section>
  );
}

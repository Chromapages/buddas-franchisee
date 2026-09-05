export default function PortalLoading() {
  return (
    <div className="portal-page-stack" aria-busy="true" aria-label="Loading operator workspace">
      <div className="portal-page-header">
        <div className="h-3 w-36 rounded bg-bds-cream/80" />
        <div className="h-8 w-72 max-w-full rounded bg-bds-cream/80" />
        <div className="h-4 w-96 max-w-full rounded bg-bds-cream/80" />
      </div>
      <section className="min-h-48 rounded-2xl border border-bds-teal-dark/15 bg-white p-5 shadow-sm sm:p-6">
        <div className="h-10 w-full rounded-xl bg-bds-cream/60" />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="h-28 rounded-xl bg-bds-cream/60" />
          <div className="h-28 rounded-xl bg-bds-cream/60" />
        </div>
      </section>
      <span className="sr-only" role="status">Loading operator workspace</span>
    </div>
  );
}

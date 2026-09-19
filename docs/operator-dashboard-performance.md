# Operator Dashboard performance: September 7, 2026

## Baseline and scope

Measured existing local development chunk files before editing. Inspected the authenticated route, shell, React client boundaries, storage reads, and refresh controllers. No production build artifacts or authenticated Dashboard field-metric dataset were available. The existing WebVitalsReporter is mounted in the public franchise layout, not the Operator Portal. No dependencies were added.

The changes target redundant server work and shell blocking. Authentication and authorized-location validation must still finish before the private shell renders.

## Before / after

| Observation | Before | After | Evidence type |
| --- | --- | --- | --- |
| Development portal layout chunk, uncompressed | 827,579 bytes | 837,262 bytes | Local artifact bytes |
| Development Dashboard chunk, uncompressed | 425,056 bytes | 425,873 bytes | Local artifact bytes |
| Combined development chunks | 1,252,635 bytes | 1,263,135 bytes (+10,500) | Includes development machinery; excludes shared chunks |
| Support storage calls from layout + page | 2 | 1 per render request | Source call graph + React request cache semantics; not a database trace |
| Bulletin storage calls from layout + page | 2 | 1 per render request | Same scope as support |
| Catalog collection read for an empty cart | 1 | 0 | Source branch analysis |
| Responsive views eligible to poll | 2 | Only the visible view | Visibility guard on actual rendered element |
| Badge requests blocking shell | Cart, support, bulletins | None; three independent Suspense streams | Render dependency graph |
| Production bundle transfer | Unavailable | Unavailable | No production artifact measurement |
| Browser HTTP request count | Unavailable | Unavailable | No authenticated browser network recording |
| LCP / INP / CLS, p75 | Unavailable | Unavailable | No Dashboard field dataset |

After-change development gzip sizes: layout 213,792 bytes; Dashboard 107,538 bytes. These are not cold-load production totals and must not be used as a Lighthouse or Core Web Vitals claim. The added badge-stream hydration component increases client bytes slightly while removing badge latency from shell rendering.

## Implementation

- `src/features/auth/session.ts`: React request memoization shares the verified session across layout/page reads. No persistent session cache or extended expiration.
- `src/features/portal/dashboard-reads.ts`: request-scoped support and bulletin deduplication. Authorization remains in callers. Bulletin cache keys include the verified session object, preserving actor-specific acknowledgement targeting.
- `src/app/portal/layout.tsx`: starts independent location and badge reads concurrently. Waits for authorized location context, then streams badge counts separately with Suspense. Failed/unavailable counts stay null. User/unit/role keyed providers prevent previous scope counts surviving a switch.
- `src/components/portal/portal-counts-update.tsx`: receives only a count and its category, and updates the existing context after hydration.
- `src/features/portal/cart.ts`: returns immediately for empty stored carts; nonempty carts still validate current product availability and prices.
- `src/components/portal/dashboard-freshness.tsx`: prevents the hidden mobile/desktop branch from polling.

## Reference caching and remaining costs

The added caches last only for one render request. No live operational status or access-bearing unit reference is persisted between requests. A persistent unit/reference cache needs an explicit invalidation contract for corporate edits and revoked access before adoption. Public immutable framework assets retain normal framework caching.

Existing independent Dashboard promises remain concurrent. Existing content skeletons remain in use. No chart package was installed; inspected development layout/page chunks contain no consumer component bundle or Firebase browser Auth bundle. The existing named Lucide imports and Next bundling remain in use.

Unresolved backend costs: Firebase session verification and operator/unit reads remain on the authentication path; permitted location reads still gate shell context; support storage still loads ticket histories for a dashboard summary; full order and bulletin collections remain subject to source latency and growth. Separate mobile/desktop trees still hydrate widget clients even though hidden polling is suppressed. These require authenticated tracing and production bundle measurements to prioritize further work.

## Verification limits and next measurement

Local requests with an invalid operator session to `/portal` and `/portal/orders` returned 307 with no-store after changes; Next compiled the affected routes. Their observed request durations (1,650 ms and 3,187 ms) include development compilation and rejected authentication and are NOT Dashboard performance measurements.

Before claiming the targets, collect production authenticated navigation and interaction traces on representative mobile hardware, including constrained-network and offline recovery runs. Record transferred JS/shared assets, request waterfalls, shell visibility, final-content LCP, layout shifts, and interactions with Refresh/More/quick actions. Compare at equal network/CPU settings. Field acceptance remains p75 LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1 across enough actual visits; no passing metric is asserted here.

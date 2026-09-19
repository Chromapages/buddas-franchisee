# Budda's Operator Dashboard mobile regression

Date: September 7, 2026

## Release result

The scoped Dashboard regression passes the automated mobile layout, keyboard, accessibility-tree, development-fixture, authorization-redirect, private-indexing, responsive-registry, and lab performance checks described below. It is not a complete production ship approval because the repository-wide TypeScript build has unrelated existing failures and several backend/real-device scenarios have no deterministic integration seam.

Focused release checks: 21/21 passed and the responsive-system verifier passed. Repository-wide tests: 200 total, 168 passed, 32 failed. The failures are outside the Dashboard regression and include stale public-design assertions, `.mjs` files containing TypeScript-only imports, outdated Portal test expectations, and a missing-extension module import. Repository-wide TypeScript validation also remains blocked by existing Corporate resource, Corporate catalog/location, and inquiry storage errors.

Browser evidence: 27 scenarios, 18 before screenshots, and 25 after screenshots. Raw results are in `design-qa/operator-dashboard-regression/after/results.json`. The before directory preserves the initial visual pass and the no-orders unit state.

## Scenario coverage

| Area | Covered | Result / limitation |
| --- | --- | --- |
| Operational state | all clear, one item, three items, overdue update, delayed order, unread support reply | Passed with an isolated temporary in-memory fixture overlay; priority order is required update, support reply, delayed supply order. The permanent seed dataset was restored after capture. |
| Orders | empty collection state, active, cancelled, large total, long ID | Passed domain tests and screenshots. No-orders screenshot is retained in `before/oah-no-orders.png`; the captured after run includes the temporary cancelled/long-order overlay. |
| Bulletins | none, current featured, expired filtered | Passed. Dashboard deliberately shows one highest-priority current bulletin. There is no historical-bulletin product route, so multiple-history rendering is unsupported rather than fabricated. |
| Data | initial shell, reconnect/background refresh, stale, partial failure, offline, throttled connection | Loading geometry and state reducers passed; reconnect retains current content after removal of the route loading fallback. Stale/partial states have domain coverage. A deterministic browser-level full server failure is not available. |
| Location | one, three, long name, unauthorized | Passed. Escape closes the selector and restores focus. Unauthorized scope redirects to login. Searchable selection for >8 units remains source-verified, not browser-fixtured. |
| Session | authenticated local signed fixture, expired, invalid role, unauthorized location | Passed redirect behavior. Firebase revocation and permission changes after login remain integration gaps. |
| Cart | empty, one item, nine items | Passed screenshots and target/overlap checks. Cart remains unit-scoped. |
| Accessibility | keyboard, CDP accessibility tree, 200% text enlargement, effective 200% browser zoom, WCAG text spacing, reduced motion, visible focus | Passed automated checks. Actual NVDA/JAWS/TalkBack speech output was not run. |
| Responsive | 320, 360, 366, 390, 393, 430, 568x320, 667x375, 1280 desktop | Passed. High zoom uses a two-row five-destination tab layout. |
| Security/indexing | unauthorized data start guards, noindex/no-store, sitemap exclusions | Focused security/SEO suite passed. Firestore request tracing was not available. |

## Browser assertions

- Zero horizontal-overflow failures.
- Zero header/cart overlaps.
- Zero location blocks outside the header.
- Zero scenarios with interactive targets below 44px.
- One visible Dashboard level-one heading and one main landmark in the accessibility tree.
- No Next development overlay detected.
- No consumer food imagery requested by the Dashboard.
- Fixed navigation did not obscure any keyboard-focused main control after remediation.
- Opening More and resizing to desktop closes the dialog and clears `inert` from header/main.
- Background refresh retains the Dashboard; the route-level loading shell is absent.

## Performance findings

These are local Chromium lab observations, not p75 field data:

| Metric | Observed maximum |
| --- | ---: |
| LCP | 1,556 ms under the throttled run |
| INP | 24 ms among recorded test interactions |
| CLS | 0.043 across normal scenarios |
| Browser resource entries | 12 under the throttled development run |

The throttled development navigation took about 17.9 seconds to network-idle because it includes development bundles and throttling; its LCP remained 1.56 seconds. Text enlargement and text-spacing changes are excluded from CLS because the test intentionally changes typography after load.

Current development portal layout/page chunks total 1,378,724 uncompressed bytes. This is not a production transfer measurement. The production build is blocked by existing TypeScript errors, so production bundle impact and p75 Core Web Vitals remain unresolved.

## Files changed by this regression

- `src/components/portal/portal-shell.tsx`: location selector dismissal/focus restoration, responsive More cleanup, fixed-nav focus protection, accessible More contrast.
- `src/app/globals.css`: root scroll clearance, wrapped tab labels, high-zoom two-row tab layout.
- `src/app/portal/operator-home.css`: removed bulletin clipping and made Quick Actions adapt to available text width.
- `src/app/portal/loading.tsx`: removed because it replaced valid Dashboard content during background refresh.
- `scripts/mobile-dashboard-regression.py`: authenticated, isolated Playwright matrix and screenshots.
- `scripts/verify-responsive-system.ts`: updated stale page-shell contracts so the release verifier passes current layouts.
- `tests/operator-mobile-regression.test.mjs`: deterministic state/order/bulletin/support regression coverage.

## Components created during the Dashboard redesign

- Mobile and desktop Dashboard renderers.
- Dashboard module registry/renderer.
- Operator status summary, attention list/item, all-clear state and status badge.
- Permission-aware Quick Actions.
- Dashboard freshness and widget snapshot/retry states.
- Compact/standard/full-page empty state.
- Streamed portal count updater.
- Operator analytics links and Dashboard-view instrumentation.

## Components reused

PortalShell, PortalProvider, PortalDataBoundary, canonical order-status definitions, bulletin targeting, Firestore/storage adapters, Next `Suspense`/routing, Lucide icons, the existing analytics transport, and the Budda's workspace design tokens.

## Architecture decisions

- Mobile and desktop presentation remain distinct components while sharing server-authorized module contracts and data promises.
- Authenticated location context gates the shell; badge counts stream independently.
- Live operational records are not persistently cached. Request-scoped React caching only deduplicates support, bulletin and session reads.
- Dashboard widgets summarize and deep-link. Order detail, search, ticket history and bulletin workflows stay in dedicated workspaces.
- Failure and empty states remain different. Failed requests never become zero counts.
- Development fixtures are selected only through explicit non-production seed mode.

## Accessibility findings fixed

- Focus could sit behind the fixed bottom navigation; root scroll clearance plus a focus guard now moves the active main control above it.
- Mobile More could disappear at the desktop breakpoint while leaving the workspace inert; breakpoint cleanup now closes it.
- The location selector now supports Escape, outside dismissal and trigger focus restoration.
- Base Teal small text in More failed contrast; it now uses the AA-safe inverse sidebar accent.
- Bulletin summaries no longer use a two-line overflow clamp.
- High-zoom tab labels wrap within measured cells and switch to a two-row layout at the effective compact viewport.

## Unresolved API/data limitations

- Dashboard order reads still fetch the full unit order collection before selecting two rows.
- Support summary reads still load ticket detail/history for every ticket, creating an N+1 backend cost.
- Cold offline loads have no persisted last-known Dashboard snapshot.
- Source services do not expose authoritative synchronization timestamps for all modules.
- No test-only backend fault injector exists for browser screenshots of partial/full server failure.
- Firebase session revocation, mid-session role changes and location access removal need emulator/live integration tests.
- Historical bulletins are not a current product workflow.

## Better handled separately

- Add Firestore limited/projection queries and count endpoints for Dashboard summaries.
- Add an approved persistent offline cache with unit/access invalidation.
- Add deterministic Firebase Emulator coverage for revoked sessions and permission changes.
- Repair the repository's unrelated Corporate/resource/inquiry TypeScript failures, then produce a real production bundle report.
- Run NVDA + Firefox and TalkBack + Chrome on physical/virtual devices.
- Decide whether a bulletin-history workspace is a product requirement before adding historical rendering.

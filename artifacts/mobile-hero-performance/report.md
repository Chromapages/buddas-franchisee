# Mobile franchise hero performance audit

Audit date: 2026-09-07. Target viewport: 360×800 mobile. Lighthouse 13.0.1 with Chrome. Production measurements used a disposable C: copy because the F: workspace cannot create Turbopack's `firebase-admin` junction.

## Outcome

The hero now has one responsive LCP image across mobile and desktop, starts that request eagerly at High priority, serves a 360px AVIF to the tested phone, reserves image geometry before CSS, and keeps critical copy in the initial static HTML. The page-level null Suspense boundary that caused the entire public page to stream after the footer was removed.

## Measurements

| Measurement | Before | Final |
| --- | ---: | ---: |
| Hero image requests at 360px | 2, both Low priority | 1, High priority |
| Hero image transfer | 19,913 bytes combined | 13,598 bytes AVIF |
| Font requests | 8 | 4 |
| Font transfer | 99,050 bytes | 62,505 bytes |
| Client script transfer | 182,757 bytes | 182,755 bytes |
| Production CLS | 0.78125 during diagnosis | 0 |
| Production TBT | 30–49ms during diagnosis | 112ms DevTools throttling; 21–27ms simulation |
| Production Lighthouse score | 61–64 during diagnosis | 96 DevTools throttling; 94–97 simulation |
| Production LCP | 3.92–4.44s during diagnosis | 2.08s DevTools throttling; 2.58–3.12s simulation |

The initial development baseline was Lighthouse 68 with LCP 2.42s, CLS 0, TBT 2.32s, two Low-priority hero image requests, 62,505 font bytes, and 3.09MB of development JavaScript. Development bundle and timing values are recorded for traceability but are not production comparisons.

Final request evidence: the responsive AVIF request began at 45ms and ended at 90ms in the production trace. Lighthouse confirmed `fetchpriority=high`, initial-document discoverability, and eager loading. The image response was 13,598 transfer bytes at 360px rather than the 2.04MB source PNG.

## Core Web Vitals status

- LCP: **PASS in the final DevTools-throttled production run (2.08s)**. Lighthouse's default simulated runs varied from 2.58s to 3.12s, so universal or field compliance is **UNVERIFIED**.
- CLS: **PASS in every final production run (0)**.
- INP: **UNVERIFIED**. Lighthouse does not provide field INP. Final TBT was 112ms and max potential FID was 113ms in the DevTools-throttled run; these are diagnostic proxies, not INP.
- 75th-percentile field values: **UNVERIFIED**. `WebVitalsReporter` emits LCP, INP, and CLS into the existing optional `dataLayer`, but this repository contains no persisted percentile dataset or configured reporting view.

## Implementation changes

- Consolidated the mobile and desktop hero media into one server-rendered Next Image.
- Added responsive `sizes`, eager loading, High fetch priority, explicit source dimensions, and inline 3:2 geometry reservation.
- Removed the hidden desktop image request from the mobile path.
- Reused the same documentary bakery image with breakpoint-specific focal positioning.
- Removed the franchise layout's page-wide null Suspense fallback and placed narrow boundaries around URL-aware closing CTAs.
- Removed unused Latin Extended font subsets. Poppins weights 600/700/800 remain because the public UI uses all three; DM Sans remains the body family.
- Added no hero client state, remote data, carousel, video, animation package, or JavaScript measurement.

## Verification

- `npm run build` in the workspace: **FAIL**, first on the existing Windows Turbopack `firebase-admin` junction error.
- `npx next build --webpack` in the workspace: **FAIL**, existing `EISDIR` readlink error at `src/app/api/auth/firebase-session/route.ts`.
- Disposable C: production build: compiled successfully; normal type checking then found the existing `ResourcePublicationInput` mismatch in `src/app/api/corporate/resources/publish/route.ts`. For performance measurement only, that disposable copy set `typescript.ignoreBuildErrors`; the workspace config was not changed. The resulting `/franchise` route was statically prerendered.
- `node --experimental-strip-types --test tests/franchise-homepage-hero.test.mjs tests/franchise-mobile-hero-a11y.test.mjs tests/franchise-mobile-hero-spacing.test.mjs tests/franchise-mobile-hero-image.test.mjs`: 10 passed, 0 failed.
- Mobile and desktop renders were visually inspected after media consolidation.

Raw Lighthouse JSON files are stored in this directory. Field data, a production deployment, and a passing full workspace build remain outside this result.

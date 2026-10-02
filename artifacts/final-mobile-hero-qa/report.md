# Final mobile franchise hero quality and regression audit

Audit date: 2026-09-07. This was a read-only final QA pass. No hero production code changed during this audit, so the before/after visual state is the same captured current build.

## Release verdict

**DO NOT SHIP**

The hero passes the visual, interaction, accessibility, local performance, and SEO checks documented below. Shipping is blocked by the unresolved franchise-claim and source-governance issues in `artifacts/franchise-hero-claims-audit.md`, plus the workspace production build failures noted under engineering.

## Screenshots

Current / before-after-identical captures:

- `current-320x568.png`
- `current-360x800.png`
- `current-390x844.png`
- `current-393x852.png`
- `current-430x932.png`
- `current-768x900.png` — tablet
- `current-1440x900.png` — desktop
- `current-844x390.png` — landscape
- `current-320x568-text-200.png` — simulated 200% text enlargement
- `current-keyboard-focus.png` — focused secondary inquiry action

All screenshots and measurements are in this directory. `results.json` contains exact boxes, colors, focus order, screen-reader tree, and navigation evidence.

## Visual

| Check | Result | Evidence |
| --- | --- | --- |
| Mobile gutter system | PASS | 20px at 320–393px; 24px at 430px. |
| Headline wrapping | PASS | Two lines at 320–430px with no orphaned word. |
| Image crop | PASS visually | Rolls, baker hands, face, and service-window work remain visible at every phone width. |
| Cream / Teal application | PASS | Cream canvas, Dark Teal heading/action, Cocoa supporting copy. |
| Tropical decoration | PASS | No botanical wallpaper, palms, tiki, surf, or decorative hero geometry. |
| Primary hierarchy | PASS | One 56px filled primary link; quiet 44px inquiry hit region. |
| Desktop regression | PASS visually | 1440px view preserves the split copy/photo composition. |
| Tablet and landscape | PASS | 768px transitions into an eight-column split; 844×390 has no clipping or overflow. |

## UX

| Check | Result | Evidence |
| --- | --- | --- |
| Primary action | PASS | `Explore the Opportunity` is full width and visually dominant. |
| Secondary inquiry path | PASS | Full-width 44px target, text-level visual treatment. |
| Immediate duplicate CTA | PASS | No duplicate inquiry CTA in the hero viewport. |
| Destination health | PASS | Opportunity and inquiry routes returned HTTP 200. |
| Browser Back | PASS | Primary route opened `/franchise/the-opportunity`; browser Back returned to `/franchise`. |
| Repeated CTAs elsewhere | REVIEW REQUIRED | The subsequent advantage, sticky, and final sections contain additional conversion actions. They are outside the hero viewport but should be reviewed with the wider page-conversion strategy. |

## Accessibility

| Check | Result | Evidence |
| --- | --- | --- |
| Heading semantics | PASS | One H1 in rendered HTML; accessibility tree begins eyebrow → H1 → support → footprint → links → image. |
| Link semantics | PASS | Both hero actions are links with descriptive accessible names; arrows are hidden. |
| Focus | PASS | Keyboard order reaches both hero links; visible focus shown in `current-keyboard-focus.png`. |
| Target size | PASS | Primary 56px high; secondary 44px high. |
| Contrast | PASS | Primary Cream/Dark Teal and secondary Dark Teal/Cream each calculate to 7.04:1. |
| Image alternative | PASS structurally | Descriptive bakery-worker alt text is exposed in the screen-reader tree. Asset approval remains separate. |
| Text enlargement | PASS in simulation | Doubled computed text at 320px produced no horizontal overflow; long words wrap rather than clip. |
| Reduced motion | PASS | No hero animations; sticky CTA transition is `none` under reduced motion. |
| Native screen reader | UNVERIFIED | Browser accessibility-tree order was inspected; VoiceOver, TalkBack, NVDA, and JAWS were not run. |

## SEO

| Check | Result | Evidence |
| --- | --- | --- |
| Title | PASS | `Budda's Franchise Opportunity | Hawaiian Bakery & Grill`. |
| Canonical | PASS | `https://buddasfranchise.com/franchise`. |
| Indexing | PASS locally | Rendered `index, follow`; no `noindex` present. |
| H1 | PASS | One rendered H1. |
| Responsive meaning | PASS | Shared primary hero copy is rendered in both mobile and desktop presentations. |
| Crawlable hero image | PASS | Next Image renders the descriptive photo in initial HTML. |
| Metadata | PASS | Page-specific Open Graph and Twitter metadata were verified in the earlier SEO audit. |

## Performance

| Check | Result | Evidence |
| --- | --- | --- |
| Hero image loading | PASS | `loading="eager"`, `fetchpriority="high"`, dimensions, responsive `sizes`, and Next image optimization. |
| Image request | PASS locally | 360px AVIF began at 98ms, ended at 107.6ms, and transferred 13,291 bytes. |
| Local layout shift | PASS locally | 0.035 over the post-navigation observation window. |
| Hero animation work | PASS | No running hero animations in all inspected viewports. |
| Client work | PASS for hero scope | No carousel, video, animation library, client-only copy, or JavaScript layout measurement in the hero. |
| Field Core Web Vitals | UNVERIFIED | No production p75 LCP, INP, or CLS data source is available in this repository. |

## Content and legal

- **FAIL:** Current store count is not verified by a reviewed public business source.
- **PASS:** Hero market language does not claim specific territory availability or scarcity.
- **PASS:** No AUV, revenue, earnings, profit, ROI, margin, return, or payback statement renders in the hero.
- **FAIL:** Homepage final CTA renders unapproved $150K/$400K financial qualification figures.
- **FAIL:** Timing, response-SLA, qualification, systems/support, product-demand, and `proven opportunity` claims lack completed review evidence.
- **PASS:** Footer registration-state/non-offer disclaimer and inquiry non-offer boundary remain present.

See `../franchise-hero-claims-audit.md` for exact sources, owners, and release blockers. This audit is not legal advice.

## Engineering

- Shared current-footprint source is reused by hero and final CTA; its business-record accuracy remains unverified.
- Hero media is a single shared responsive component rather than duplicated mobile/desktop image requests.
- No unused hero component or CSS issue was identified in the scoped source review; repository-wide dead-code analysis is **UNVERIFIED**.
- Clean browser capture reported no console warning, console error, or page error.
- Focused hero, accessibility, spacing, image, and funnel tests have passed in prior checks.
- `npm run build` remains blocked by an existing Windows Turbopack `firebase-admin` junction failure. Webpack fallback remains blocked by an existing `EISDIR` readlink failure in `src/app/api/auth/firebase-session/route.ts`. A separate corporate resource type error also prevents an ordinary full build. These are release blockers outside the hero implementation.

## Relevant files changed during the redesign

- `src/features/franchise/home-hero-content.ts`
- `src/components/public/homepage-hero-mobile.tsx`
- `src/components/public/homepage-hero-desktop.tsx`
- `src/components/public/homepage-hero-media.tsx`
- `src/components/public/hero-opportunity-link.tsx`
- `src/components/public/hero-inquiry-link.tsx`
- `src/components/public/franchise-home-analytics.tsx`
- `src/components/public/inquiry-form.tsx`
- `src/components/public/opportunity-index-enhancer.tsx`
- `src/app/franchise/page.tsx`
- `src/app/franchise/layout.tsx`
- `src/app/globals.css`
- `src/lib/analytics.ts`
- `src/app/layout.tsx`
- `src/components/public/navbar.tsx`

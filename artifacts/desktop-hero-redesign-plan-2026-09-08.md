# Desktop homepage hero: gap list and redesign plan

Scope: planning only for `/franchise` (the root homepage redirects here). Current local page captured on 2026-09-08 at a reported 1280 × 720 viewport. Evidence: `desktop-hero-current-2026-09-08.png`. No application code changed; no tests/build run.

## Verdict

The hero communicates franchising, but its generic bakery scene, crowded text stack, and oversized competing actions weaken the product story and next step.

## Evidence and gaps

| Priority | Gap | Evidence | Proposed correction |
| --- | --- | --- | --- |
| P1 | Signature product lacks prominence | Photograph emphasizes storefront, baker, and trays; the distinctive Classic Roll is not clearly established | Use an approved photograph with the Classic Budda Roll dominant, real bakery context secondary |
| P1 | Copy and image intrude on each other | At 1280px, image starts at x531; copy and buttons extend to x609 | Give copy a protected cream column and image its own grid area |
| P1 | Vertical grouping is missing | Headline ends where paragraph starts (y277); paragraph ends where CTA begins (y333) | Explicit gaps: 16px eyebrow/title, 24px title/body, 28px body/actions, 24px actions/proof |
| P1 | Secondary CTA competes with primary | Both actions measure 576.5px wide; secondary is 68px tall versus primary 52px | Content-width 52–56px primary; secondary text link with 44px target, on next row when needed |
| P1 | Abstract description consumes valuable space | “bakery-led differentiation” describes strategy rather than explaining the restaurant | Use concrete category/product language and a short operator-fit sentence |
| P2 | Footprint proof is visually subordinate | Small text under two large buttons; generic map-pin badge adds surface | Compact text proof separated by a Table Line, using maintained location data |
| P2 | Contact labels vary | Header “Request Franchise Info”; hero “Start a Franchise Inquiry” | Prefer a consistent inquiry label; coordinate header change separately because it is shared |
| P2 | Hero media ownership is misleading | Shared media imports `content.mobile`; image classes also carry mobile names | Introduce shared media data and explicit desktop/mobile crop rules while retaining one responsive image |
| P2 | Heading semantics can be simpler | Desktop uses `div role=heading aria-level=1`; mobile uses native h1 | Prefer native h1; ensure only visible variant is exposed to accessibility tree |

## Recommended direction: The Roll & The Opportunity

Preserve Poppins, DM Sans, cream #FFF8E8, dark teal #1C5F56, cocoa #5A3A1F, and the official wordmark. Brand rules outrank generic skill suggestions to swap fonts or add decorative effects.

### Composition

- Desktop starts at the existing 67.25rem breakpoint (1076px at a 16px root).
- Use a real two-column CSS grid, approximately 44% copy / 56% image; protect 32–48px between readable text and the photograph.
- Container maximum 1440px; gutters 32px at compact desktop and 48–64px on wider desktop, aligned with navigation.
- Copy maximum approximately 480–520px. Use a 56–72px Poppins bold headline, line-height 1.02–1.06, tracking -0.02em. Keep two intentional lines where space permits.
- Body 18px/28px, approximately 42–48 characters per line. No text over photography.
- Begin with 48–64px vertical hero padding; let content determine height. At 1280×720 and 1440×900 keep actions and proof visible, and reveal useful context from the following section where feasible.
- Static photography. No carousel, parallax, autoplay video, or floating decorative cards.

### Proposed copy

Eyebrow: HAWAIIAN BAKERY & GRILL · FRANCHISING

Headline: Build the next Budda’s.

Description: A Hawaiian Bakery & Grill built around our signature Budda Roll. Explore ownership for experienced restaurant operators.

Primary action: Explore the Opportunity

Secondary action: Start a Franchise Inquiry

Secondary microcopy: 3-step initial inquiry

Proof: 2 Utah restaurants operating today. Optional supporting locations: Pleasant Grove · Salt Lake City, derived from current maintained data and verified before release.

### Photography brief

Choose an approved real product photograph before locking the final crop. The roll should be recognizable at normal laptop size, with its compact softly rectangular body, broad golden-brown crown, and true crumb. Natural light and bakery handling can provide hospitality context. Keep the food unobscured; no invented glaze, inflated portions, or cheese-like stretch. Verify image provenance before treating any scene as an operating-location photograph.

## Execution sequence

1. Lock the approved image, desktop crop, copy, and factual proof.
2. Produce one high-fidelity desktop composition at 1440×900, then adapt it at 1280×720. Compare product recognition, CTA hierarchy, and fit against the current capture before implementation.
3. Update the desktop component and tightly scoped hero styles. Simplify the spacer-column/absolute-media relationship. Isolate desktop copy if mobile wording is not being changed.
4. Retain the current CTA destinations, source parameter, analytics wrappers, and responsive image loading. Do not add dependencies.
5. Review 1076, 1280, 1440, and 1920px widths and either side of 1448px, where the existing column allocation changes. Check mobile 390px/768px for shared-media regressions.
6. Verify keyboard focus, 200% zoom, reflow, contrast, image crop, and one exposed primary heading. Confirm both CTA destinations and existing analytics events. Run automated checks only when authorized under project instructions.
7. Evaluate results against baseline using desktop hero-primary clicks, inquiry starts/completions, and qualified inquiries. Segment by viewport and traffic source; do not infer conversion improvement from visual polish alone.

## Acceptance criteria

- A short comprehension check establishes: what Budda’s sells, that this is a franchise opportunity, and the next action.
- No copy/image collisions or clipping at the reviewed desktop sizes.
- One clearly dominant primary action; secondary is readable and keyboard accessible.
- Text contrast at least 4.5:1 for normal text and 3:1 for qualifying large text; verify focus and control contrast separately.
- Retain a discoverable eager/high-priority hero image, correct sizes, and reserved dimensions. Target field p75 LCP ≤2.5s; the local screenshot does not establish production performance.
- Mobile remains intentional, with no double image download introduced by hidden variants.

## Files likely involved

- `src/components/public/homepage-hero-desktop.tsx`: layout, semantics, action hierarchy.
- `src/components/public/homepage-hero-media.tsx`: shared media ownership and crop.
- `src/features/franchise/home-hero-content.ts`: copy and media data.
- `src/app/globals.css`: scoped desktop grid and spacing.
- `src/app/franchise/page.tsx`: only if media composition requires a small wrapper adjustment.
- `src/components/public/navbar.tsx`: optional coordinated label consistency, not a prerequisite.

## Research used

- Nielsen Norman Group, homepage purpose and action clarity: https://www.nngroup.com/articles/homepage-design-principles/
- Paris Baguette franchising, clear category/ownership and distinct research/application routes: https://ownaparisbaguette.com/ . This was content research, not a visual competitor audit. Do not copy its scale claims or financial figures.
- W3C contrast minimum: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- Google web.dev LCP guidance: https://web.dev/articles/optimize-lcp
- Local `docs/DESIGN.md`: Food first, Protect the Roll, The Roll & Table, evidence before adjectives; Poppins/DM Sans and locked palette.

## Limits and risks

One current desktop viewport was visually audited; other sizes are planned checks. No full accessibility audit, production performance measurement, conversion analysis, or independent restaurant-count verification was performed. The workspace has substantial existing changes. Implementation must preserve them and scope shared CSS/media changes carefully.

Highest-leverage first step: select an approved, unmistakably Budda Roll photograph and compose the desktop hero around it.

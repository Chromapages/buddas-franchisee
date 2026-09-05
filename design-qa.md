# Desktop Process Dossier — Design QA

## Comparison target

- **Source visual truth:** `C:\Users\ericb\.codex\generated_images\01a04661-5386-7080-bc61-4d5d01bc70e6\exec-1fc4a921-896f-4935-867f-9f5522c91355.png`
- **Implementation capture:** `design-qa/process-desktop-dossier-shared-header-1440x1024.png`
- **Comparison capture:** `design-qa/process-desktop-dossier-final-comparison.png`
- **Requested viewport:** 1440 × 1024 CSS px, desktop initial state.
- **Rendered capture:** 1425 × 824 px from the in-app browser content surface at density 1. The source was cropped from the top and resized to that same 1425 × 824 comparison frame; no device frame or browser chrome was compared.

## Full-view comparison

The selected Four-Stage Dossier direction uses a large editorial introduction, a two-by-two four-stage index, and document-like stages with a dark teal number rail. The implementation preserves that information architecture while using approved Budda's typography, governed copy, official navigation, and real destinations.

## Focused comparison

The overview and the first stage were reviewed at full resolution because they establish the desktop grid, max width, content density, and core hierarchy. A separate close-up was not needed: the only compact interactive component is the existing FDD disclosure, which was exercised directly.

## Required fidelity surfaces

- **Fonts and typography:** The source uses a serif display face. The implementation intentionally uses the existing approved Budda's heading font, with bold editorial scale for the page title, 48–60px overview numbers, and 16px body copy. This is an accepted brand-system constraint, not visual drift.
- **Spacing and layout rhythm:** The implementation uses a 78rem desktop maximum width, 32–40px desktop gutters, a two-by-two stage index, and a 12–14rem teal stage rail. No cards-within-cards or fixed stage heights were introduced.
- **Colors and visual tokens:** Cream, deep teal, gold, and existing text tokens match the product palette. The teal rail and CTA provide the restrained high-contrast anchor shown by the selected direction.
- **Image quality and asset fidelity:** No new image assets or substitute illustrations are used. The existing official wordmark remains the only logo asset.
- **Copy and content:** All page copy, timing, legal language, destinations, and stage names continue to come from the governed process source. The generated mock's invented wording was not adopted.

## Interaction checks

- Desktop Stage 03 overview link navigates to `#fdd-disclosure-desktop`.
- The FDD disclosure changes `aria-expanded` from `false` to `true` and back to `false` on activation.
- Browser console had no errors during the tested initial and disclosure states.

## Comparison history

1. **[P1] Stage overview structure differed from the selected dossier.** The first implementation used a single four-column row, while the source direction uses a two-by-two dossier index.
   - **Fix:** Rebuilt the desktop-only overview as a two-by-two stage grid with large numerals and intentional rules.
   - **Post-fix evidence:** `design-qa/process-desktop-dossier-final-comparison.png` shows the corrected overview alongside the selected reference.
2. **[P1] Desktop hero did not yet use the established franchise-page header treatment.**
   - **Fix:** Moved the desktop-only hero into the dossier component and applied the same eyebrow, title, description, section, and `content-wide` container classes used by the Opportunity page.
   - **Post-fix evidence:** `design-qa/process-desktop-dossier-shared-header-1440x1024.png` shows the shared desktop header styling above the dossier index.
3. **[P1] The desktop dossier hero needed to become the common franchise-page desktop header rather than a Process-only implementation.**
   - **Fix:** Promoted the desktop hero defaults into `FranchisePageHeader` and rendered the Process desktop hero through that shared component. Existing `aside` and `contextItems` payloads remain page-owned.
   - **Post-fix evidence:** The About desktop header retains its Origin, Tradition, and Focus ledger in the shared layout; Opportunity and Contact retain their existing explicit right-column `aside` content.

## Findings

No actionable P0, P1, or P2 differences remain. The serif display type and generated mock copy are intentionally not reproduced because the production page must retain the approved Budda's font system and governed content.

## Follow-up polish

- [P3] Consider a wider desktop capture after the eventual legal-content approval pass, so Stage 03's full legal callout can be reviewed in the final production state.

## Implementation checklist

- [x] Keep mobile process rendering unchanged below the `lg` breakpoint.
- [x] Use one governed process-content source for desktop and mobile.
- [x] Add desktop-specific max width, overview, stage rail, closing composition, anchors, and disclosure behavior.
- [x] Verify desktop navigation, disclosure state, and console output.

final result: passed

# Operator Proof Stack implementation

The Budda's Advantage section now has separate mobile and desktop components. The mobile component is a static four-row Operator Proof Stack; the desktop component retains its own four-column proof presentation. Both read from one governed content source, so layout changes remain isolated without duplicating business copy.

## Structure

- One section eyebrow, H2, and neutral introduction.
- Four semantic list items with stable IDs, visible sequence numbers, H3 propositions, and readable supporting copy.
- Growth retains its existing readiness condition as a distinct definition block.
- One full-width mobile CTA to `/franchise/the-opportunity` with neutral destination microcopy.
- `OperatorProofMobile` owns the mobile-only header, ledger, and conversion treatment.
- `OperatorProofDesktop` owns the tablet/desktop-only header, grid, imagery, and icon treatment.
- The franchise page mounts both responsive components directly, following the existing split-hero architecture.

## Simplifications

- Removed the one-open mobile state, disclosure buttons, plus/minus indicators, ARIA panel wiring, nested cards, shadows, and disclosure animation CSS.
- Removed the unused Monstera illustration and decorative desktop rail/dots.
- Removed the combined responsive `OperatorProofRail` wrapper so mobile and desktop styling can evolve independently.
- Replaced the rising Growth chart with a neutral readiness-network icon.
- Removed `product demand`, `proven opportunity`, and `takes under 2 minutes` from this section.
- Made CTA microcopy required at every `CtaWithMicrocopy` call site so an unsupported default cannot silently reappear.

## Content governance

All four records now live in `src/features/franchise/operator-proof-content.ts` with stable IDs and explicit owner-review metadata. Existing pillar statements remain marked `REQUIRES_OWNER_REVIEW`, with null source references and review dates. This implementation does not convert those statements into approved claims.

## Verification

- Browser renders: 320, 390, 430, 768, and 1440px.
- Four mobile rows visible at every tested phone width; zero disclosure buttons; zero horizontal overflow.
- Mobile CTA: 48px high and full content width.
- Keyboard focus visible; CTA destination and analytics event verified.
- Accessibility tree: section H2 → four H3 list items → opportunity link.
- Simulated 200% text enlargement: no overlap, clipping, or horizontal overflow after line-height remediation.
- Clean browser: no warning, error, or page error in tested renders.
- `node --experimental-strip-types --test tests/operator-proof-mobile-connector.test.mjs tests/cta-with-microcopy.test.mjs tests/franchise-operator-proof-rail.test.mjs tests/franchise-homepage-hero.test.mjs`: 12 passed, 0 failed.
- Scoped `git diff --check`: passed; only existing LF-to-CRLF working-copy notices were reported.

Native assistive-technology testing and owner approval of the System, Experience, Growth, and Product statements remain outstanding.

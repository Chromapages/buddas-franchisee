# Mobile hero accessibility pass

Browser: bundled Playwright Chromium against localhost:3000/franchise. Command: `node scripts/audit-mobile-hero-a11y.mjs` (completed, exit 0). No dependencies installed.

## Results

| Condition | Result | Evidence |
| --- | --- | --- |
| 320×568, 360×800, 390×844, 393×852, 430×932, 667×375 landscape | PASS | Screenshots inspected; document and hero widths do not overflow. See results.json. |
| Primary target | PASS | 56px high at all six viewports; full mobile container width. |
| Secondary target | PASS | 44px high and 212.4px wide at normal text size. |
| Text enlargement | PASS | Original computed hero font sizes doubled at 320px; no horizontal overflow after remediation. Long brand word wraps. |
| Text spacing | PASS | 1.5 line height, .12em letter spacing, .16em word spacing, 2em paragraph margin at 320px; no overflow. |
| Keyboard | PASS | Tab order passes through header then opportunity and inquiry links. Enter navigates to the actual opportunity and inquiry URLs. |
| Focus | PASS | Both links have a computed solid 3px Dark Teal outline, 3px offset, and 80px scroll margin. Focus screenshots show controls clear of the sticky header. |
| Reduced motion | PASS for inspected interaction | Browser reduced-motion preference enabled; measured transitions 0.001s. No hero animation or hover-only content. |
| Reading structure | PASS in Chromium accessibility tree | Main → eyebrow text → H1 → explanation → footprint → opportunity link → inquiry link → meaningful image → next section H2. Decorative icons absent from accessible names. |
| Native VoiceOver/TalkBack | UNVERIFIED | No real device/screen-reader session available. Accessibility-tree inspection is not a substitute. |
| Native browser 200% zoom | UNVERIFIED | Tested 200% text enlargement via computed font-size overrides, not browser zoom UI. |
| Automated axe scan | UNVERIFIED | axe-core is not installed. |

## Contrast

Ratios calculated using sRGB relative luminance:

- Dark Teal / Cream: 7.04:1 — heading, eyebrow, secondary link, primary text/background, primary boundary, new focus outlines.
- Cocoa / Cream: 9.63:1 — supporting copy and footprint.
- Teal Ink / Cream: 9.62:1 — declared hover/press colors; primary pressed background observed.
- Base Teal / Cream: 2.12:1 — decorative location icon only, aria-hidden and redundant with footprint text; not used for meaningful control boundaries.
- Subtle footprint dividers are decorative; information does not depend on them.
- Secondary has no required enclosing border; its text and solid underline identify the link at 7.04:1.

## Fixes

Replaced the secondary translucent underline and unreliable focus treatment with solid colors. Added scoped focus outlines and sticky-header scroll margins. Changed fixed line heights to relative line heights and allowed emergency wrapping of the enlarged headline.

Production edits: src/components/public/homepage-hero-mobile.tsx and src/app/globals.css. Audit harness: scripts/audit-mobile-hero-a11y.mjs. Screenshots, measurements and accessibility tree are in this directory.

This scoped pass does not establish full-page WCAG conformance. Physical touch, native assistive technology and production-build behavior remain unverified.

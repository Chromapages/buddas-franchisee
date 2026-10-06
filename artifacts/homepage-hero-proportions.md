# Homepage hero proportions

Purpose: bring the existing reference-inspired hero into the homepage's section rhythm without changing content, actions, navbar, or other sections.

Measured baseline at 1440x900: hero 820px; following main sections 770, 677, 904, 568, 619, and 595px (median 648px). Hero headline 82.8px; section headlines 48px. The hero's viewport-dependent minimum causes it to grow with browser height regardless of content.

Plan: remove the viewport-height minimum; reuse the existing homepage hero and introduction type tokens, and shared section inset; reduce desktop icon scale and narrow the feature rail to keep labels on the cream panel; use a 16:9 stacked photograph below desktop. Keep the desktop curved split and existing image.

Success criteria: desktop height driven by content rather than viewport height, near the measured section median; two-line headline and all content visible without clipping; unchanged 56px/44px actions; no horizontal overflow at 390, 768, 1024, or 1440px; photograph and icon labels remain unobscured. Verify in the rendered browser. No build or automated checks requested.

## Verified result

At 1440px, height decreased from 820px to 658px (19.8%); heading decreased from 82.8px to the existing 64px hero token. Padding is 48px at both top and bottom, matching the shared section inset. Height remains 658px at both 900px and 1100px viewport heights, confirming removal of viewport-dependent sizing.

No horizontal overflow at 390, 768, 1024, or 1440px. The narrow desktop hero measures 649px tall. The tablet title uses the 56px hero token. Controls remain 56px and 44px tall. Minimum measured text contrast remains 4.94:1. The desktop photograph, plate, and icon rail remain visible; mobile uses a shallower 16:9 photograph.

Only implementation file changed in this task: src/app/franchise/homepage-hero.css. Simplification: removed the viewport minimum and independent font scaling, reused homepage tokens, reduced desktop icon size. Existing copy, image source, tracked links, other sections, and concurrent edits are preserved. No dependencies, build, lint, typecheck, automated tests, or static analysis. Remaining limitation: browser verification covers the listed widths, not every browser engine.

Screenshots: homepage-hero-compact-desktop.png, homepage-hero-compact-tablet.png, homepage-hero-compact-mobile.png. Visual verdict: 94/100 (qualitative design judgment).

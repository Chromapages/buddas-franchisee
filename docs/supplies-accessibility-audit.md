# Supplies accessibility pass — WCAG 2.2 AA

## Verified in authenticated browser automation

- Supplies has one H1 and a semantic `role="search"` form.
- Product detail navigation is an anchor; cart, quantity, filters, sort, sheet controls, and cart actions are buttons or inputs.
- Catalog quantity and PDP quantity controls expose explicit accessible labels, whole-pack instructions, and polite success/error messages.
- Product availability uses icon plus text; it is not conveyed by color alone.
- Product detail uses one H1; verified product images use identifying alt text and category placeholders are decorative while adjacent SKU/category/name text remains available.
- Catalog quick filters, toolbar controls, product add/stepper, cart action, drawer rows, close action, and Apply action meet or exceed 44px in the authenticated browser check.
- Catalog and PDP sticky docks reserve content/focus clearance above measured bottom navigation; product-row and PDP focus helpers scroll the active control clear of the dock.
- Category dialog is a native modal dialog with a visible label. Escape closes it and automation confirms focus returns to its trigger. Native modal behavior prevents background pointer/focus navigation while open.
- 320px, 430px, 1280px, and doubled root text-size checks showed no document horizontal overflow.
- Existing global `prefers-reduced-motion` rules disable functional decorative motion; Supplies does not require animation or drag gestures.

## Remediations completed in this pass

- Wrapped catalog lookup in a semantic search form.
- Raised purchasing/replenishment metadata from 11px to a 12px baseline where it conveys operational facts.
- Added PDP dock focused-control clearance, matching the catalog dock behavior.
- Added browser regression checks for search landmark, single H1, Escape dialog dismissal, focus restoration, and drawer target sizes.

## Manual-device limitation

VoiceOver and TalkBack were not available on this desktop host. Native dialog semantics, keyboard behavior, labels, and live regions were verified in the browser accessibility tree, but native mobile screen-reader rotor/swipe patterns still require a device pass before a formal compliance attestation.

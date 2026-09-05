# Operator cart redesign

## Design decisions

The cart is a review workspace for wholesale supplies assigned to the active franchise unit. The existing teal sidebar, cream canvas, Poppins headings, and DM Sans body typography remain the visual foundation.

The prior cart spread quantity, price, freight, and navigation across a large undifferentiated panel. Quantity edits had no pending/error feedback, and removal was announced before the server accepted it. Freight coverage was hard-coded despite no quote model.

Implemented structure:

1. Compact page heading and active receiving-unit context with unit ID.
2. Supply-item list with complete name and SKU, pack size, price per order unit, quantity editor, line subtotal, and explicit Remove.
3. Separate order summary with merchandise subtotal, unavailable shipping/tax information, receiving-unit reminder, and Review order destination.
4. Automatic typed-quantity saving, serialized requests, server-confirmed totals and badge counts, recoverable errors, and Undo following successful removal.

Container queries stack the summary below items when there is insufficient workspace width. Very narrow item rows stack quantity and subtotal. Sticky summary positioning is limited to sufficiently tall and wide viewports.

## Research

- [Baymard: quantity buttons with an editable field](https://baymard.com/blog/auto-update-users-quantity-changes): support efficient adjustments and direct entry for larger quantities; avoid a separate Update step.
- [Baymard: cart design benchmark](https://baymard.com/checkout-usability/benchmark/step-type/cart): clear order-cost presentation before continuing.
- [WCAG 2.2 target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): controls have generous 44px targets, exceeding the 24px AA minimum.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): short polite updates announce mutation results without making the whole cart a live region.

These are established usability principles still relevant in 2026, not claims of a new 2026-specific standard.

## Backend boundaries

The new mutation endpoint checks authenticated permission and the current unit, validates integer quantities and approved product availability, and returns resolved product data. Browser prices and totals are not accepted. Existing cart storage remains an HttpOnly unit-scoped cookie; this redesign does not introduce cross-device persistence.

Shipping/tax calculation and checkout quote-change detection remain absent in the existing ordering backend. The cart therefore labels the amount as an item subtotal and does not promise free freight or a locked final quote. Existing final checkout implementation needs a separate production readiness pass for quote changes, unavailable-item reconciliation, and dialog focus management.

No production orders or support requests are created during cart verification.

## Verification evidence

Authenticated desktop browser checks confirmed: one-case cart at $84.00; increment to two cases at $168.00; matching cart badge updates; remove-to-empty; Undo restored the one-case cart and cleared the recovery notice; Review order reached checkout with the same unit and $84.00 item subtotal. The original cart contents were restored. The existing fixed sidebar remained anchored.

The removal snapshot is retained for 30 minutes in an HttpOnly cookie scoped to the operator and active unit. Only SKU and quantity are retained with scope IDs; product names and prices are resolved again from the authorized catalog. This lets Undo survive the server refresh following a cookie write.

The visual check used the available desktop viewport (approximately 1467px). Exact-width matrix, 200% text enlargement, direct typed-entry and simulated network-failure interactions were not exercised in the browser. No build, lint or automated suite was run under the current working agreement. Diff whitespace checks passed.

Changed files: cart page, cart workspace, global cart styles, cart actions/storage, shared quantity policy, checkout cost wording, this report, and the saved visual verdict.

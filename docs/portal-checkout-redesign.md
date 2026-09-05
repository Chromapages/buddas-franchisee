# Location checkout redesign

## Direction and implementation

The checkout page is the final review step, preserving the existing teal sidebar and cream/white workspace. A wide two-column layout replaces the narrow nested panel and duplicate review modal. Receiving unit, supply items, and fulfillment information appear in the primary column. The secondary column contains costs, explicit unit confirmation, and one Place supply order action. At less than 58rem of available content width the sections stack in document order.

The item list exposes complete identifiers, pack size, quantity, unit price and line subtotal with semantic headings and definition lists. Edit cart and Back to cart preserve an obvious correction path. Shipping and tax are explicitly unknown rather than counted as zero. No billing provider, address, delivery date or payment workflow is invented.

Submission uses action state for pending and error feedback. The duplicate modal and its separate confirmation state were removed. A SHA-256 fingerprint of the reviewed unit and sorted item values is compared with freshly resolved server data before order acceptance. Changes to price, quantity or the available-item set reject submission and ask for a fresh review. The fingerprint detects change; it does not authorize access or supply accepted prices. Server permission checks, unit access and current catalog pricing remain authoritative.

## Sources

- [Baymard order review examples](https://baymard.com/checkout-usability/benchmark/step-type/order-review): distinguish review from completed confirmation.
- [Baymard checkout flow guidance](https://baymard.com/learn/checkout-flow-ux-optimization): make the final order action explicit and prominent.
- [W3C G98](https://www.w3.org/WAI/WCAG22/Techniques/general/G98): provide review and correction before consequential submission.

The redesign skill informed the separation of content, reduction of redundant containers and clear pending/error states. These are established usability practices applicable in 2026.

## Verification and boundaries

Observed the authenticated checkout at the available desktop viewport, with the existing one-unit $84.00 cart. Confirmed that checking the receiving-unit control enables the final button and unchecking disables it. Left it unchecked. No order was submitted. The new markup compiled in the running development server and diff whitespace checks passed.

No build, automated suite, exact viewport matrix or end-to-end order write was run. The snapshot comparison was inspected in source, not exercised through a real financial submission. It is not a database transaction or an idempotency mechanism; concurrent ordering and external price changes still require backend transaction/quote infrastructure. Shipping/tax quotation remains unavailable. The pre-existing durable confirmation route is retained.

## Changed files

- src/components/portal/checkout-form.tsx
- src/app/portal/checkout/page.tsx
- src/app/globals.css (checkout-scoped styles)
- src/features/portal/actions.ts (review validation and visible failure result)
- src/features/portal/checkout-review.ts (review fingerprint)
- docs/portal-checkout-redesign.md
- .omx/state/checkout-redesign/ralph-progress.json

# Supplies final mobile QA and procurement-integrity pass

Date: 2026-09-07
Scope: authenticated Operator Portal Supplies catalog at `/portal/supplies`, using the existing demo operator and its current authorized Firestore response.

## Release result

The verified path passes. This QA pass corrected two focus-obscuration defects: catalog controls reserve space for the mobile tab bar, and the shared portal focus guard scrolls the actual workspace container with a 16px clearance.

The live fixture exposes **one** authorized SKU. Scenarios whose product, inventory, role, or location data does not exist were not fabricated; they are marked source-verified or blocked instead of exercised.

## Evidence

- Authenticated browser regression: `python -u scripts/verify-demo-operator-login.py` — passed.
- Focused Node checks — 27 passing assertions across catalog seed isolation, analytics privacy and coverage, mobile state behavior, checkout/cart confirmation contracts, and private-route SEO policy.
- Final visual verdict: 95/100, pass; saved in `.omx/state/supplies-final-qa/ralph-progress.json`.

## Scenario results

| Area | Result | Evidence / limit |
| --- | --- | --- |
| Current catalog | Verified | One authorized product rendered; its missing SKU image used a class placeholder without distortion. |
| Empty catalog | Source-verified | `CatalogBrowser` has an explicit authorized-catalog empty state; no live zero-product unit exists. |
| 12, 30+, hundreds of products | Blocked | The live fixture has one product and no volume fixture or cursor API. |
| Long names, categories, SKUs | Source-verified | Product rows use constrained widths and wrapping; no live long-value record exists. |
| Search | Verified | Exact SKU, padded SKU, category term, no result, query clearing, and back-navigation state retention passed. Misspellings intentionally use normal substring matching; fuzzy correction is not implemented. |
| Filters and sort | Verified | Category, lead-time filter, apply, sort, filter removal, and Clear all passed. A valid multi-filter zero-result fixture is unavailable. |
| Available / unavailable | Verified / source-verified | Available state was exercised. `NOT_AVAILABLE_FOR_LOCATION` is server-rechecked and non-orderable in source; low stock, backorder, discontinued, replacements, and price/pack-change fixtures do not exist. |
| Cart | Verified / limited | Empty, add, direct integer entry, invalid negative recovery, quantity two, remove-last-unit, subtotal, and persistent summary passed. Multiple SKU, high quantity, API failure, stale inventory, cross-location switch, and session-expiry fixtures are unavailable. |
| Responsive | Verified | No document horizontal overflow at 320×568, 360×800, 366×898, 390×844, 393×852, 430×932, 568×320, 667×375, and 1280×844. A 200% root-text check at 320px passed. |
| Accessibility | Verified / device follow-up | One H1, semantic search, labelled modal sheets, Escape/focus restoration, current tab announcement, 44px-plus tested targets, keyboard focus, and fixed dock/tab-bar clearance passed. VoiceOver/TalkBack and OS high-contrast remain device-only checks. |
| Motion | Source-verified | Existing reduced-motion rules apply; no Supplies action requires a gesture or decorative motion. |
| Network and performance | Not measured | No production RUM or isolated production-like network fixture exists, so LCP/INP/CLS and slow/offline behavior are not reported as passing. |
| Authentication and indexing | Verified | An unauthenticated browser was redirected from `/portal/supplies`; private portal sitemap/robots/noindex tests passed. |
| Procurement integrity | Source-verified | Cart writes require the active session, `MANAGE_CART`, pricing permission, matching unit, integer quantity, approved available SKU, and server-side product/price lookup. Checkout reloads current products and validates the server review fingerprint. |
| Cross-location and restricted-role attacks | Source-verified / fixture gap | Client price is ignored and cart data is partitioned by authenticated user and active unit. The demo has no second authorized unit or restricted pricing role for a live negative test. |

## Changes made during QA

- `src/components/portal/catalog-browser.tsx` records the safe `operator_supply_product_opened` event and clears its fixed cart dock through the actual scroll owner.
- `src/components/portal/portal-shell.tsx` fixes shared mobile focus clearance above persistent navigation.
- `src/app/portal/operator-mobile.css` reserves functional tab-bar/cart-dock clearance for Supplies content.
- `scripts/verify-demo-operator-login.py` adds unauthenticated-route, viewport, navigation-target, focus-clearance, analytics-privacy, and screenshot checks.
- `tests/operator-dashboard-analytics.test.mjs` now covers the product-opened event.
- `tests/portal-consequence-confirmation.test.mjs` now points to the active cart, bulletin, and resource implementations.
- `docs/supplies-catalog-audit.md` now accurately describes user-and-unit cart partitioning.

No production component or API contract was created in this QA pass. It reused `CatalogBrowser`, `PortalShell`, native catalog sheets, the cart server action, and the existing analytics transport.

## Data limitations

The catalog model still only supplies name, SKU, category, pack size, price, boolean availability, lead time, and optional verified image metadata. It has no authoritative pagination, stock quantity/reason, replacement, substitute, barcode, fulfillment source, list/template, or recommendation data.

## Screenshots

After-state browser captures:

- `design-qa/supplies-scope-header-mobile.png`
- `design-qa/supplies-focus-clearance-mobile.png`
- `design-qa/supplies-category-drawer-mobile.png`
- `design-qa/supplies-filter-drawer-mobile.png`
- `design-qa/supplies-search-empty-mobile.png`
- `design-qa/supplies-quantity-stepper-mobile.png`
- `design-qa/supplies-product-detail-mobile.png`
- `design-qa/supplies-order-guide-mobile.png`

A clean pre-redesign checkout was not available in this workspace, so there is no reproducible automated before image. Historic user-provided screenshots remain outside the repository and are not presented as a controlled baseline.

## Follow-up work for a separate PR

1. Add authorized fixtures for zero/large catalogs, multi-unit membership, restricted roles, expired sessions, inventory failure, and product status variants.
2. Add server-side cursor pagination and catalog search only when real catalog volume warrants it.
3. Add authoritative inventory state, replacement/substitute, price-effective-date, and pack-change data before showing those states.
4. Run device VoiceOver/TalkBack, high-contrast, offline, and slow-network validation.
5. Establish production RUM and an agreed performance budget before reporting LCP, INP, or CLS.
6. Validate SKU imagery through the catalog publishing workflow before replacing the deliberate category placeholder.

# Supplies purchasing analytics

## Measurement Readiness & Signal Quality Index

**Score: 83/100 — Usable with Gaps**

| Category | Score |
| --- | ---: |
| Decision alignment | 23/25 |
| Event model clarity | 18/20 |
| Data accuracy and integrity | 17/20 |
| Conversion definition quality | 13/15 |
| Attribution and context | 6/10 |
| Governance and maintenance | 6/10 |

The model is suitable for product decisions once the existing `dataLayer`/`buddas:analytics` transport is connected to an approved analytics destination and validated there. The browser implementation and runtime allow-list are verified; downstream delivery, retention, consent, identity stitching, and production reporting are not.

## Event plan

| Event | Trigger | Decision supported |
| --- | --- | --- |
| `operator_supplies_viewed` | Authorized catalog mounts | Catalog reach and available result volume |
| `operator_supply_search_submitted` | Search settles for 650ms | Exact SKU/category/partial search behavior |
| `operator_supply_search_no_results` | Settled search has zero results | No-result frequency without collecting raw text |
| `operator_supply_category_selected` | Category changes | Useful taxonomy paths |
| `operator_supply_filter_applied` | Quick filter or filter sheet applies | Filter use and resulting catalog size |
| `operator_supply_filter_removed` | An individual category, availability, history, or lead-time filter is removed | Filter correction and over-filtering friction |
| `operator_supply_sort_changed` | Sort changes | Sort usefulness |
| `operator_supply_product_opened` | Authorized PDP mounts | Product inspection and unavailable-SKU engagement |
| `operator_supply_added` | Server confirms first cart quantity | Product ordering and repeat/discovery path |
| `operator_supply_quantity_changed` | Server confirms nonzero quantity update | Bulk-order adjustment behavior |
| `operator_supply_removed` | Server confirms quantity zero | Abandonment and correction behavior |
| `operator_supply_cart_update_failed` | A cart add, quick reorder, quantity update, or remove attempt fails | Add/update error rate by safe action and coarse failure category |
| `operator_supply_current_order_opened` | Operator explicitly opens Current order | Current-order review intent before the cart route |
| `operator_supply_cart_opened` | Authorized cart page mounts | Actual cart views, counted once per view |
| `operator_supply_checkout_started` | Checkout review mounts | Funnel entry and time-to-completion |
| `operator_supply_order_submitted` | Durable confirmation page mounts | Confirmed order completion, deduped per order per browser session |
| `operator_supply_order_failed` | Checkout returns a visible failure | Validation/provider funnel failures |

Scan, scan-match, and substitute events are intentionally absent because those features and data models do not exist.

## Safe properties

Runtime allow-listed properties include category, validated SKU, bounded result/filter/cart/product counts, sort, safe cart action, time to first confirmed add (capped at one hour), `active_unit` scope (never the unit ID), bounded quantity, availability state, lead-time bucket, safe search-match type, repeat/discovery path, route, role category, and coarse error category.

Raw search text, prices, totals, location IDs, emails, employee data, invoice/order identifiers, payment data, tokens, notes, and backend payloads are dropped. A successful exact SKU/name search may carry the validated catalog SKU. Partial multi-result and zero-result searches never carry the query.

## Interpretation limits

- Repeated product search can be measured reliably for exact recognized SKU/name matches. Raw no-result terms are deliberately unavailable; resolving those terms requires a separately approved privacy-safe search taxonomy, not general analytics collection.
- Repeat vs discovery uses the real current-unit order-history path.
- Time-to-order can be calculated between checkout start and deduped confirmed submission timestamps once downstream event delivery is configured.
- Unavailable SKU engagement is measured when the operator opens that product, not as a noisy impression event for every rendered row.

## Derived procurement-friction metrics

- **Time to first product added:** `operator_supply_added.time_to_first_product_added_ms` on the first confirmed add in a Supplies view.
- **Search usage / zero-result rate:** settled search events divided by Supplies views; no raw term is collected.
- **Quick reorder usage:** confirmed `operator_supply_added` events with `cart_action: quick_reorder`.
- **Add/update error rate:** `operator_supply_cart_update_failed` divided by confirmed cart mutations, segmented only by safe action and coarse failure category.
- **Products and packs per order:** `operator_supply_order_submitted.product_count` and `cart_item_count` at durable confirmation.
- **Review-order conversion:** `operator_supply_checkout_started` divided by `operator_supply_cart_opened`; completed conversion uses durable `operator_supply_order_submitted`.
- **Repeat versus browse:** confirmed add `purchase_path` distinguishes history-based repeat from discovery.
- **Filters before add:** `filter_count` attached to confirmed cart mutations; it excludes search text and sort state.

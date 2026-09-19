# Operator Dashboard analytics

## Measurement readiness

Before implementation: **61/100 — Unreliable**. The existing `dataLayer` / `buddas:analytics` transport and privacy boundary were useful, but Dashboard coverage was limited to two generic quick-action events and one general order-detail event.

After implementation: **82/100 — Usable with gaps**.

| Category | Score | Weight |
| --- | ---: | ---: |
| Decision alignment | 24/25 | 25 |
| Event model clarity | 18/20 | 20 |
| Data accuracy and integrity | 12/20 | 20 |
| Conversion definition quality | 15/15 | 15 |
| Attribution and context | 6/10 | 10 |
| Governance and maintenance | 7/10 | 10 |

The remaining accuracy gap is downstream validation: no configured vendor/debug view or production event dataset was available in this workspace. These events must not be treated as decision-grade until duplicate rate, delivery rate, consent behavior, and mobile-browser delivery are checked in the receiving analytics system.

## Tracking plan

| Event | Trigger | Safe properties | Decision supported |
| --- | --- | --- | --- |
| `operator_dashboard_viewed` | Resolved operator-status module, once per Dashboard mount | role category, authorized-location count, attention count, route | Dashboard use and time-to-action baseline |
| `operator_attention_items_presented` | Once per nonempty attention category on Dashboard view | attention type/count, role category, location-scope count, route | Which operational issues occur most often |
| `operator_attention_item_opened` | Full attention row selected | attention type, role category, location-scope count, destination route | Attention engagement and time-to-action |
| `operator_quick_action_selected` | Approved Quick Action selected | quick-action category, role category, location-scope count, route | Whether Quick Actions reduce navigation effort |
| `operator_location_switched` | Selected unit is confirmed as the active unit after redirect | role category, authorized-location count | Multi-unit switching use |
| `operator_order_opened` | Recent Dashboard order, attention order, or Orders workspace row opened | status lifecycle category, role category, location-scope count, route | Order-detail demand without order identifiers |
| `operator_orders_view_all` | Dashboard “All orders” selected | role category, location-scope count, route | Dashboard versus list entry behavior |
| `operator_support_opened` | Support attention item or mobile Support tab selected | role category, location-scope count, route | Support entry behavior |
| `operator_resource_center_opened` | Resource Center Quick Action selected | role category, location-scope count, route | Resource shortcut usefulness |
| `operator_bulletin_opened` | Dashboard bulletin or required-update attention row opened | role category, location-scope count, route | Bulletin engagement |
| `operator_dashboard_refreshed` | An accepted manual refresh request begins | role category, location-scope count, route | Manual refresh frequency |
| `operator_dashboard_fetch_failed` | Visible Dashboard enters partial failure, full failure, stale, or offline state | safe error category, role category, location-scope count, route | Data reliability and stale-state frequency |
| `operator_bottom_nav_selected` | A mobile primary destination is selected | role category, location-scope count, route | Orders and Support entry source |

`web_vital` now runs inside the authenticated Portal using the existing reporter. Portal paths are reduced to their stable route section before dispatch, preventing dynamic path segments from becoming analytics properties.

## Privacy and governance

`trackOperatorWorkspaceEvent` reconstructs every payload from an explicit runtime allow-list. Unknown values and properties are discarded. Counts are integer-normalized and capped at 100. The emitter accepts no user ID, email, unit ID/name, order ID, invoice ID, amount, SKU, bulletin title, support text, freeform note, token, or error message.

Location switching uses a one-minute same-tab marker to confirm that the selected target became active. The target identifier is removed before analytics dispatch and never leaves the browser through this event path.

No Dashboard click is designated as a conversion. These are navigation, exposure, intent, and system-state signals. Consequential completions such as accepted orders and created tickets retain their existing server-side audit trails and should only become analytics conversions under an approved product measurement policy.

## Analysis queries

- Quick Action usefulness: `operator_quick_action_selected / operator_dashboard_viewed`, segmented by quick-action and role category.
- Issue prevalence: sum `attention_count` on `operator_attention_items_presented`, grouped by attention type.
- Orders entry source: compare `operator_orders_view_all`, order-related `operator_quick_action_selected`, and `operator_bottom_nav_selected` where route is `/portal/orders`.
- Refresh reliance: `operator_dashboard_refreshed / operator_dashboard_viewed`.
- Data reliability: sessions or views with `operator_dashboard_fetch_failed`, grouped by error category.
- Attention time-to-action: elapsed analytics ingestion time from `operator_dashboard_viewed` to the first `operator_attention_item_opened` in the same session. Report distributions, not only averages.

## Validation performed and remaining

Unit validation covers runtime property filtering, count bounding, location-switch confirmation, and event wiring. Type checking reports no analytics errors; existing unrelated Corporate/resource-document/inquiry errors remain. Local protected routes compile and continue to reject invalid sessions with 307 responses.

Still required in the receiving analytics environment: confirm one event per action, mobile Safari/Chrome delivery, consent behavior where applicable, route reports, and time-to-action session stitching. The local `dataLayer` is only populated when an existing host integration provides it; no second vendor was installed.

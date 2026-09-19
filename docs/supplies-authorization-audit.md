# Supplies authorization audit

## Enforced server-side

| Capability | Current enforcement |
| --- | --- |
| View approved catalog | `VIEW_CATALOG` is required by catalog and product-detail server routes. Firestore catalog composition is scoped to the active unit. |
| View wholesale pricing | `VIEW_WHOLESALE_PRICING` is a dedicated portal capability. Current `franchisee` and `admin` roles possess it; future roles can omit it without changing shared Supplies components. |
| Add or change cart items | `MANAGE_CART` and `VIEW_WHOLESALE_PRICING` are required in the server action. The action compares the supplied location to the authenticated active unit, looks up the SKU in that unit’s current catalog, and rejects unavailable or invalid-price products. Client price is ignored. |
| Submit order | `CREATE_ORDER` and `VIEW_WHOLESALE_PRICING` are required server-side. Checkout reloads cart products from the current unit catalog, rejects unavailable lines, and requires a server-derived review fingerprint before acceptance. |
| View order history | `VIEW_ORDERS` gates Supplies replenishment history, the Orders route, and PDP purchase history. |

## Scope and integrity

- Product/price/availability reads are unit scoped in Firestore catalog composition and location-scoped in the SQL adapter.
- Cart cookies are now partitioned by authenticated user and unit; legacy unit-only cookie contents migrate into the current authenticated user’s envelope. A switch never transfers cart lines between units.
- Cart writes save the then-authoritative price and pack size. Cart UI warns if current catalog data changes; checkout still rechecks current availability and the server review fingerprint.
- Manually edited SKU, location, quantity, or price client state cannot select an unauthorized product or set a server order price.

## Not modeled; no UI or permission invented

- Uniform/signage-specific ordering permission
- High-value order approval threshold or approver workflow
- Saved lists, templates, favorites, or list management
- Fulfillment inventory allocation/warehouse authorization beyond current unit availability

These require explicit data ownership and permission assignments before being introduced.

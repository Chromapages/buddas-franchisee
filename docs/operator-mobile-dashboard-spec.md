# Operator mobile dashboard — design specification

September 7, 2026. This is a design handoff, not a change to the live application. It applies to `/portal` and the supplied Operator Workspace screenshot, not the ambient `/corporate` tab.

## 1. Screenshot audit

1. **Orientation consumes the first third of the screen.** Restaurant name/code appear in the app bar and again under the greeting. The large title, eyebrow, greeting, actions, refresh, and rules delay operational content until roughly 370px down the supplied 390px-wide screenshot.
2. **Zero-data summaries occupy too much height.** Three stacked pulse rows take approximately 220px while all values say there is no work. The operator must scroll before seeing a transaction.
3. **Frequently used navigation is hidden.** Menu conceals Orders and Support while the top-right Cart gets permanent placement. Supplies and support actions are above the natural resting area of the thumb.
4. **Summary and detail have similar visual weight.** Large rounded panels, repeated eyebrows, thin rules, chevrons, and nested order content compete. The first recent order starts near the bottom of the screenshot.
5. **Touch and reading hierarchy need verification.** Button targets are already often 44px, so the screenshot alone does not prove a size violation. However, small metadata and the text-shaped Updates link make targets difficult to recognize. No visible connection/freshness state explains whether the zeros are current. Text enlargement and contrast require measurement beyond screenshot inspection.

## 2. Proposed wireframe

Reference viewport: 390 × 844 CSS px, before system safe-area additions. The content column scrolls; navigation and its adjacent action remain reachable. Coordinates below are nominal, not fixed text heights.

```text
┌────────────────────────────────────┐
│ [official Budda’s mark]             │ A  Brand + one unit context
│ La’ie Origin Grill · HNL-014     ▾   │    Unit switch only for multi-unit access
├────────────────────────────────────┤
│ Home                     Refresh   │ B  Compact task heading
│                                    │
│ ┌──────────┐ ┌─────────┐ ┌────────┐ │ C  Current state; values from screenshot
│ │    0     │ │    0    │ │   0    │ │    Number + explicit operational label
│ │ Orders   │ │ Replies │ │Updates │ │    No fabricated trend arrows
│ └──────────┘ └─────────┘ └────────┘ │
│                                    │
│ [Needs your attention — IF NEEDED]  │ D  First real exception, then “View all”
│ [Action label + specific next step] │    Entire module absent when caught up
│                                    │
│ [Order progress — IF ACTIVE ORDERS] │ E  Counts by recorded state; no ETA inference
│ [Pending n · Processing n · ...]    │    Quiet status list, not a decorative chart
│                                    │
│ Recent orders               See all│ F  Up to 2 recent transactions
│ BD-6930                 Cancelled  │    Full identifier + status
│ 1 line item                $84.00 ›│    Complete details on tap
│                                    │
│ Operations updates                 │ G  Up to 2 informational bulletins
│ No current updates                 │    Required items appear in D
│                                    │
│ [content continues / bottom inset]  │
├────────────────────────────────────┤
│       Order supplies           →   │ H  Contextual primary link, 48px minimum
├────────────────────────────────────┤
│  ⌂      □       ◷      ?      …    │ I  Icon + visible label, each ≥44 × 44px
│ Home Supplies Orders Support More  │    Five direct destinations
└────────────────────────────────────┘
```

The conditional D and E blocks do not appear in the screenshot's caught-up state. Recent orders moves up immediately below C. The cancelled order never appears as an exception or upcoming shipment solely because it was cancelled.

**When action is pending:** keep A–C, insert D immediately after the KPI row, show at most two highest-priority actionable records and a count-based “View all actions” destination. Priority follows explicit recorded due dates and action-required flags, not invented urgency. A support response gets “Reply to ticket”; a mandatory update gets “Review update”; an order gets the action from the canonical order model. No generic “Resolve” action.

**Text enlargement:** the three KPI tiles may wrap to two or one column. No horizontal carousel or fixed-height text containers. The content order is unchanged. The wireframe is a hierarchy, not a requirement that all sections fit one screen.

## 3. Brand tokens and rationale

Authority: `F:/WORK/A-C/BUDDAS/BRANDING/BRAND BOOK/Buddas_Master_Brand_Guidelines_Brand_Book_v1.0.md`, sections 53–56 (color), 60–63 (type), 164–166 (accessible digital/ordering behavior). This uses the book's Bakery Counter utility mode and existing application tokens.

| Annotation | Treatment | Why |
|---|---|---|
| A | Approved logo asset; Dark Teal mark on Cream; preserve aspect ratio and brand clear space. Unit text in DM Sans. | Brand recognition and unit routing remain visible without duplicate orientation (problem 1). |
| B | Heading: Poppins Semibold 24/32px; Cocoa body; icon + “Refresh” in a 48px target. | Removes the hero-style introduction, keeping refresh discoverable (1, 5). |
| C | White tiles on Cream, Poppins Semibold 24px numbers, DM Sans 16px labels; no shadow by default. | Compresses current-state summaries while preserving genuine inspection destinations (2, 4). |
| D | Dark Teal title and Cocoa copy; Orange icon/rule only when action is recorded, paired with a text label. | Operational exceptions outrank routine history (4). |
| E | Text-labeled recorded states; Dark Teal/Cocoa on White. | Provides process comprehension without suggesting a historical trend that does not exist. |
| F/G | Poppins Semibold 20/28px section titles, DM Sans 16/24px body. Whitespace separates rows. | Summary content stays scannable; detail moves to its workspace (4, 5). |
| H | Dark Teal fill and Cream text; 48px minimum; Poppins Semibold 16px action label. | Puts the ordering workflow near the thumb (3). |
| I | White navigation surface; Dark Teal labels/icons. Current destination uses a Cream indicator and stronger icon shape plus `aria-current=page`. | Direct task navigation and a distinct current state (3, 5). |

Use warm, direct copy: “Order supplies,” “Reply to ticket,” “No current updates.” An optional brief “Aloha, [approved name]” may replace the Home heading, but must not introduce a fourth typography level or a second identity block. Do not fabricate a name. Script belongs only to the approved logo; do not use script headings or redraw the logo as text.

### Three type levels

| Level | Font | Size / line-height | Use |
|---|---|---|---|
| Heading | Poppins Semibold | 24 / 32px (`1.5rem / 2rem`) | Home title, KPI numerals; within brand mobile H3 range |
| Subheading | Poppins Semibold | 20 / 28px (`1.25rem / 1.75rem`) | Utility section headings, based on brand H4 utility scale |
| Body | DM Sans Regular/Medium | 16 / 24px (`1rem / 1.5rem`) | Values, dates, tab labels, instructions; button weight may use approved Poppins Semibold at the same size |

The 20px utility subheading is an application token based on the brand's smaller heading scale. It is not a new font family or a claim that the book's marketing H2 is 20px. Rem-based text must follow browser/system font scaling.

### Semantic colors

Five semantic roles reuse the locked palette; surfaces are separate from status meaning.

| Role | Brand mapping | Non-color cue |
|---|---|---|
| Success | Dark Teal `#1C5F56` on Cream `#FFF8E8` | Check + “Submitted” or “Completed,” only after confirmation |
| Warning/action | Cocoa `#5A3A1F` text; Orange `#D36200` icon/edge on White | Alert icon + “Action required” and specific action |
| Error | Cocoa text on Cream; Orange alert icon/edge | Error icon + explicit failed operation + Retry |
| Information | Dark Teal on White | Info/clock icon + clear status label |
| Neutral | Cocoa on White or Cream | Explicit state such as “Cancelled” or “No active orders” |

Calculated solid-color contrast: Dark Teal/Cream **7.04:1**, Cocoa/White **10.20:1**, Cocoa/Cream **9.63:1**. Orange/White is **3.81:1**: suitable for qualifying non-text indicators but not 16px body text. Dark Teal/Base Teal is **3.32:1**: do not use that pair for body text. Avoid opacity that reduces text contrast.

## 4. Data and navigation contracts

The inspected `dashboard-modules.tsx` and portal types support current order state, support response requirements, and required bulletin metadata. They do not contain historical KPI snapshots, a prior-period aggregate, or a dependable external synchronization timestamp.

| KPI | Exact meaning | Destination |
|---|---|---|
| Orders | Count where canonical `isOrderInMotion(status)` is true | Existing `/portal/orders?view=in-motion` |
| Replies | Unresolved support tickets with `operatorActionRequired === true` | Support with “Needs attention” selected; URL-to-filter initialization must be added before shipping this link |
| Updates | Currently targeted bulletins still requiring operator action/acknowledgment | Required-updates list; add a stable filtered destination or link to the actionable bulletin section |

Accessible metric names include meaning and purpose, e.g. “0 tickets awaiting your reply. View tickets needing attention.” Unknown/failing requests render “Unavailable,” never zero. The Updates count is not an unread count; verify that persisted acknowledgments are read back before relying on it.

**Trend request:** no prior-period indicator ships until timestamped snapshots exist. Required fields: `unitId`, metric ID/definition version, value, authoritative `asOf`, comparison value, comparison `asOf`, and source completeness. Compare like-for-like unit/time boundaries. Render “2 fewer than yesterday” with a labeled direction cue; fewer orders is not automatically good. Missing baseline means no comparison; baseline zero means a numeric difference, not an infinite percentage. Trend visualization is deferred until real history and an operator decision justify it.

**Middle visualization:** show a compact accessible status distribution using actual canonical order states. Use plain labeled counts, not a percentage completion bar. The backend does not prove historic stage completion or delivery timing. Hide this module when there are no active orders; do not render an empty chart.

**Details:** recent orders keep full order ID, state, line-item count, and currency-labeled total. Show accurate shipment timing only for nonterminal orders when present. Move invoice/reference, full line items, and placed/activity timestamps to order detail. Preserve selected order and list context on return. Never truncate IDs to indistinguishable prefixes. Informational bulletins show title and publication date; full text and attachments open on tap.

**Bottom navigation:** Home → `/portal`; Supplies → `/portal/supplies`; Orders → `/portal/orders`; Support → `/portal/support`; More → a new single-level secondary navigation page. More contains Cart, Resources, Growth Requests, Account, and Sign Out. It is a destination list, not nested flyout menus. Preserve each domain's location and filter context. The active unit control is only interactive when another authorized unit exists.

**Primary action:** “Order supplies” when the cart is empty; “Review cart” when a current unit-scoped cart exists. It is a navigation link, not an order-submit button. This repetition of Supplies navigation supports the immediate ordering task. Hide the action if ordering permission is absent. Actual checkout retains server-authoritative unit/price/availability review.

## 5. Implementation dimensions and component states

- Base spacing: **8px**. Page gutters **16px**, section gaps **24px**, card padding **16px**, related-control gaps **8px**. Do not use empty cards to fill vertical space.
- Radius: **12px** working surfaces, **8px** controls. No heavy shadow. If the action dock needs separation, use `0 -2px 8px rgba(28,95,86,.08)` and a subtle top rule.
- KPI layout at 390px: 358px usable width, 8px gaps, approximately 114px per tile. Minimum natural tile height **96px**, expandable. Use `auto-fit/minmax` with a rem-based minimum around 6.5rem so large text reflows.
- Primary link: **48px minimum height**, full available width. No fixed viewport percentage: locate it above the bottom navigation, in the lower screen region, while scrollable content remains reachable.
- Navigation: nominal **72px minimum** plus `env(safe-area-inset-bottom)`. All five destinations have at least **44 × 44px** hit areas. At enlarged text, wrap labels and allow the bar to grow; if five columns do not fit, use a 3+2 grid preserving order. Never shrink font sizes to retain the row.
- Main content bottom inset equals **measured nav + action-dock heights + safe area + 16px**. Recalculate on viewport/text changes. Use that value for scroll padding and focused-control clearance. With a software keyboard open, move the action/nav dock into normal flow rather than covering inputs.
- Default: quiet surfaces; only actionable rows have link/pressed styling. A noninteractive status surface has no pointer cursor.
- Hover: on hover-capable devices only, subtle Cream background or underline on links; no scale effect.
- Pressed: Dark Teal remains legible; a brief surface tint and icon/label feedback suffice. Do not shift row geometry.
- Focus: dual **3px Dark Teal outer / 2px White inner** indicator, offset **3px**, adapting light/dark ordering on teal surfaces. Keep focus different from the current-tab fill.
- Disabled: label the reason, prevent activation, keep readable contrast; do not rely on low opacity. Retry/submit controls show precise progress labels while pending.
- Motion: color/opacity transitions **120–160ms** for meaningful states only. No counter animation, shimmering skeletons, auto-cycling notices, or animated charts. Honor reduced motion.

## 6. Real states, cache behavior, and edge cases

| State | Presentation | Interaction |
|---|---|---|
| Initial loading | Shell/unit/nav remain; count-shaped static placeholders reserve space; label “Loading workspace” | Never temporarily display zero; keep navigation usable |
| Refreshing | Preserve last successful values; small “Refreshing” status near Refresh | Disable duplicate refresh; polite completion/error announcement only |
| Caught up | All three true zero counts; attention block entirely absent | Preserve the earlier requirement to hide Needs Your Attention when empty |
| No orders | “No orders for this unit yet” in Recent orders | Supplies remains available; no sample transactions |
| No bulletins | One quiet “No current updates” line | Resources accessible through More |
| Module failure | “Orders couldn’t load” in that module with Retry; other sections stay visible | Never assert “caught up” if attention data failed |
| Offline, loaded session | Banner: “Offline · showing data loaded at [actual fetch-completion time]” | Retain the last authorized in-memory snapshot; disable submit/acknowledge/switch-unit writes; Retry when online |
| Offline, cold start | “Connect to load your workspace” | Do not bypass session validation to reveal protected persisted data |
| Expired session | Return to sign-in and discard cached operator content | No usable Back-cache view; clear account/unit snapshots on sign-out |

The cached-view fallback is **new work**: current module boundaries do not implement it. Default to an in-memory cache for the already-loaded authenticated tab, keyed by user, unit, and permission version. Do not add a blanket service-worker cache over `/portal` or store sensitive account/financial/support data in localStorage. Discard on logout, unit change, or identity/scope change. Fetch-completion time means “loaded at,” not upstream synchronization. If an authenticated cache cannot be validated offline after a reload, fail closed with the cold-start state.

Long unit names wrap naturally. Four-digit counts expand without `999+` ambiguity; exact counts remain in accessible names. No relative-time-only ETAs. Missing dates and amounts have explicit unavailable labels. Cancellation is neutral and terminal; it must not trigger a delivery warning. Partial module failures do not become zeros. Required updates for another unit must never appear after switching. No offline operation silently queues an order or acknowledgment.

## 7. Components and acceptance checks

Change `src/components/portal/portal-shell.tsx` for mobile shell/tab navigation, `src/app/portal/page.tsx` for hierarchy, `src/components/portal/dashboard-modules.tsx` for metrics/action and detail density, `dashboard-refresh.tsx` for visible state, and `src/app/globals.css` for the mobile tokens. Add a scoped dashboard snapshot client component and single-level More route. Update support/bulletin filtered entry routes before linking KPI destinations. Reuse canonical order and bulletin models.

Acceptance: inspect 320, 360, 390, 430, and 768 CSS px; text at 200%; 400% browser zoom/reflow; VoiceOver/TalkBack and keyboard navigation; bottom safe area/keyboard; zero, one, many, long-ID, failed, offline, and session-expired states. Confirm one main landmark, semantic heading order, `aria-current` for nav, no color-only meaning, no horizontal text scrolling, no focused control hidden by either dock, and server rejection of unit/permission changes. These are proposed checks, not a completed WCAG certification.

References: [W3C Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [W3C Reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow.html), and [W3C Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum). The redesign guidance informed removal of duplicated context and reuse of existing brand components; it does not justify fake data, decorative texture, or speculative dashboards.

# Operator dashboard redesign — September 4, 2026

## Direction and sources

The dashboard uses the master brand book's **Bakery Counter** functional mode: fast, clear, and efficient. Dark Teal (`#1C5F56`) remains the authority/action color, Cream (`#FFF8E8`) the canvas, White the working surface, and Cocoa (`#5A3A1F`) readable body text. Existing Poppins and DM Sans typography is retained. No new fonts, dependencies, decorative charts, or synthetic operational content were added.

Brand authority: [Budda's Master Brand Guidelines](<F:/WORK/A-C/BUDDAS/BRANDING/BRAND BOOK/Buddas_Master_Brand_Guidelines_Brand_Book_v1.0.md>), functional-mode, palette, typography, digital UI, and accessibility sections.

The redesign skill guided reuse of the existing system, removal of nested containers, and a stronger hierarchy without changing brand identity. The visual-verdict skill provided a screenshot-based refinement check; its score is a design judgment, not an accessibility certification.

Research informed task-oriented drill-down and quieter information presentation: [NN/g complex application design](https://www.nngroup.com/articles/complex-application-design/), [NN/g dashboard perception](https://www.nngroup.com/articles/dashboards-preattentive/). Refresh feedback uses a small polite status region following [W3C status-message guidance](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html).

## Implemented changes

- Replaced the boxed greeting with a compact Dashboard title, personal greeting, supplies action, and secondary support link. A dark-teal rule anchors explicit working-unit name and ID. Account role remains in account context instead of repeating it in the dashboard heading.
- Operational Pulse summarizes real orders in motion, unresolved support tickets, and required updates. Removed the redundant cart summary; the existing shell cart destination remains available.
- Active orders link to `/portal/orders?view=in-motion`. Recent order rows link to `/portal/orders?orderId=…`, selecting that transaction while preserving the list/detail workspace. Query parameters only select/filter records already retrieved for the authenticated unit; they do not grant resource access.
- Attention remains absent when there are no recorded actions. It uses the canonical order action flag, support response-required flag, and actual required bulletins. Global unavailable catalog items and inferred date-based exceptions no longer populate this queue.
- Recent orders are capped at three, sorted by creation date. Rows retain complete order and invoice identifiers, placed date, line-item count, status, and USD total. Their accessible names include those transaction relationships.
- Canceled orders no longer imply future shipment timing. Dedicated order list/detail also suppress terminal-order ETAs and use the canonical fulfillment meaning.
- Bulletins have clear section hierarchy, a quiet empty state, and a Resource Center destination. Existing populated-bulletin and acknowledgment behavior is reused.
- The working grid gives more width to orders, stacks when actual content width is constrained, and caps at 90rem on ultrawide screens. Shared focus indicators are retained. Whole status tiles and order rows are navigation links.
- Refresh is disabled while pending and has no decorative icon animation. It does not fabricate a last-synchronized timestamp.

## Data and behavior boundaries

All operational values still come through the existing server storage adapter, scoped to the authenticated session. Bulletin audience/visibility evaluation remains in place. Existing environment-controlled notices, loading boundaries, and recoverable errors remain. No Firestore records were created, seeded, edited, or deleted for the redesign.

There is no authoritative synchronization timestamp on the current order model. “Refresh” requests the latest available server response, not proof of an upstream fulfillment synchronization. Likewise, no unsupported priority, unread count, acknowledgment workflow, shipping charge, or delivery promise was introduced.

## Changed files

- `src/app/portal/page.tsx` — composition, header, unit context, data requests.
- `src/components/portal/dashboard-modules.tsx` — pulse, attention, recent orders, bulletin layout.
- `src/components/portal/dashboard-refresh.tsx` — pending-state interaction and quiet feedback.
- `src/app/globals.css` — dashboard-scoped brand tokens, geometry, and container-query layout.
- `src/app/portal/orders/page.tsx` — validated initial view/selection from dashboard links.
- `src/components/portal/orders-workspace.tsx` — scoped initial selection and terminal fulfillment presentation.
- `.omx/state/dashboard-brandbook/ralph-progress.json` — visual refinement assessment.

## Verification and remaining limits

- Live authenticated dashboard inspected at approximately 1467px default width, 1024px, 640px, and 2539px. Narrow content stacks without clipping observed order identifiers; ultrawide content remains capped. The viewport override was reset afterward.
- Clicked the active-order summary: the In motion view was selected and excluded the canceled order.
- Clicked the recent transaction: its selected order detail opened alongside the list.
- Requested refresh: the control became disabled with a “Refreshing workspace data” status and returned to its available state. No operational actions were submitted.
- Build, lint, typecheck, and automated tests were not run, following the working agreement. This pass does not certify every loading/error state, assistive-technology combination, or populated/multi-unit dataset. Existing real data was sparse, with one canceled order and no current bulletins/support tickets.
- A repository-wide whitespace check encountered a pre-existing extra EOF blank line in `src/features/portal/schema.sql`; this unrelated file was left untouched.

Future production validation should exercise required bulletins, pending support responses, multiple long order identifiers, and failure/retry behavior using an isolated test dataset. The existing bulletin acknowledgment persistence and session infrastructure were not redesigned in this visual task.

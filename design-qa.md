# Design QA — Budda's Advantage outcomes

- Source visual truth: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-2af0d234-e919-4cfe-8b55-4a7df40b9d19.png`
- Source dimensions: 1883 × 765px.
- Implementation: `http://localhost:3000/franchise`, `#operator-proof-desktop`.
- Implementation visual evidence: Codex in-app browser capture at 1883 × 765 CSS px, 2026-09-17. The capture surface does not expose a file-backed screenshot path.
- State: desktop, operator-advantage section in view, default content.
- Density normalization: source and implementation compared at 1883px viewport width; no additional scaling applied.

## Full-view comparison

The surrounding heading, foundations, labels, Cream canvas, and centered CTA retain the source composition. The marked outcome strip now uses two equal-width outcome cards, retaining the same content and two-column relationship while increasing scanability and separation from the foundational model above.

## Focused outcome-region comparison

The source region has icon-and-copy pairs separated only by a central rule. The implementation gives each outcome a White utility surface, Dark Teal top keyline, high-contrast icon field, and content-led heading. Both cards remain aligned, use the existing outcome copy, and preserve the 8px spacing scale.

## Fidelity surfaces

- Typography: existing Poppins/DM Sans stack retained; outcome titles use sentence case to improve scan speed.
- Spacing and layout rhythm: 16px card gap, 24px card padding, equal grid tracks, and no negative CTA offset.
- Colors and visual tokens: existing Cream, White, Dark Teal, and Cocoa tokens only.
- Image quality and asset fidelity: no image or icon asset changed; existing Lucide icons retained.
- Copy and content: no outcome claim changed.

## Comparison history

1. Initial state: sparse icon-and-copy outcome strip in the supplied reference.
   - Finding: P2 — both outcomes read as secondary metadata instead of the model's result.
   - Fix: introduced two equal outcome cards with restrained White surfaces and stronger icon/title hierarchy.
2. Post-fix evidence: browser-rendered desktop capture at 1883 × 765 CSS px.
   - Result: no P0/P1/P2 differences remain for the requested outcome region.

## Follow-up polish

- P3: Revisit the card density only if outcome copy becomes materially longer.

final result: passed

# Latest pass — Operations Support workspace

- Source visual truth: `C:\Users\ericb\Downloads\Codex Image Sep 18, 2026, 05_48_22 PM.png`.
- Implementation: `http://localhost:3000/portal/support`.
- Implementation visual evidence: authenticated Chrome capture at 1910 × 860 CSS px, 2026-09-18.
- Data state: Salt Lake City #1 has no support requests, so the verified no-data state is shown.

## Full-view comparison

The page follows the reference hierarchy inside the existing operator shell: unit-aware heading, dominant request action, direct assistance card, four request-status metrics, request workspace, self-service resource routes, and final escalation guidance. The operator sidebar and current cart header are intentionally preserved.

## Findings

- No actionable P0/P1/P2 differences remain within the current no-request data state.
- Contact information uses the published Budda's phone number already configured in the repository; the mock number and unverified operating hours from the reference were not copied.

## Fidelity surfaces

- Typography: existing heading/body tokens establish the title, metric, section, and supporting-copy hierarchy.
- Spacing and layout rhythm: compact 44px minimum actions, four equal desktop metrics, contained request workspace, and three equal quick-answer cards.
- Colors and visual tokens: existing White, Cream, Dark Teal, Teal, Cocoa, Orange, and border tokens; blue/gray status accents are limited to semantic metrics.
- Accessibility: semantic headings and regions, visible token-based focus rings, non-color status labels, direct phone link, and a single actionable empty-state path.
- Copy and content: unit identity and request counts remain data-backed; existing ticket creation, search, saved views, replies, and resolution controls remain functional.

## Comparison history

1. Initial implementation retained the legacy generic ticket layout and omitted the reference's status overview and self-service hierarchy.
   - Fix: rebuilt the page frame around request creation, truthful status counts, contextual empty state, and resource categories.
2. First browser pass:
   - Finding: P2 — the immediate-assistance card overlapped the top edge of the status band at desktop width.
   - Fix: increased the reserved desktop header height until the surfaces no longer intersect.
3. Post-fix evidence: the create-ticket form opens and returns to the request workspace without submission; the page has no horizontal overflow at 1910px.

## Follow-up polish

- P3: Add dedicated resource-category query routes when the resource library exposes stable category filter parameters.

final result: passed

# Latest pass — Needs attention order dossier

- Source visual truth: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-67e96713-6c0d-4fbb-87f3-fc99670dcc8e.png`.
- Source dimensions: 1828 × 860px.
- Implementation: `http://localhost:3000/portal`.
- Implementation visual evidence: authenticated Chrome capture at 1903 × 856 CSS px, density 1, 2026-09-17. The capture surface does not expose a file-backed screenshot path.
- State: desktop portal with one delayed real order in Processing, an active three-unit cart, and expanded navigation.

## Full-view comparison

The implementation now follows the selected order-dossier hierarchy: stronger delayed-order introduction, explanatory support copy, four icon-led facts, a separated action rail, a connected fulfillment timeline, and an inline support panel. The surrounding current-order rail remains part of the production dashboard composition.

## Focused region comparison

The card retains the reference’s Cream utility surface, Orange exception edge, large warning symbol, four fact groups, three order-detail destinations, timeline divider, and bottom support block. The primary Review order action intentionally retains the project’s current Base Teal fill, per the user’s explicit direction, instead of adopting the reference’s darker treatment.

## Findings

- No actionable P0/P1/P2 differences remain at the verified desktop state.

## Fidelity surfaces

- Typography: Poppins and DM Sans remain the established portal fonts; title, labels, fact values, and support copy preserve the reference hierarchy without truncation.
- Spacing and layout rhythm: the card uses a content/action split, consistent fact dividers, a full-width lower divider, and a 2:0.9 timeline/support split.
- Colors and visual tokens: Cream, Cocoa, Dark Teal, Base Teal, Orange, and shared border tokens only; the Base Teal CTA is the requested intentional deviation.
- Image quality and asset fidelity: the card contains no raster imagery; all interface symbols use the project’s existing Lucide icon system.
- Copy and content: order ID, dates, price, item count, ETA, status, and links remain sourced from the live order and portal routes.

## Comparison history

1. Initial implementation retained the earlier compact card structure.
   - Finding: P1 — it lacked the reference’s explanatory copy, fact icons, action rail detail link, and in-card help panel.
   - Fix: rebuilt the card structure around the selected dossier composition and moved contextual fulfillment help into the card.
2. First browser comparison:
   - Finding: P2 — real-dashboard width caused the fact row and secondary action to wrap more aggressively than the wide isolated reference.
   - Fix: reduced action-rail width, tightened fact icon geometry, and reduced action-label spacing while preserving readable sizes.
3. Post-fix evidence: the authenticated desktop render shows all four facts, three order actions, four timeline stages, and the help panel without clipping or overlap. Browser console contains no application errors; observed errors originate from a Chrome extension.

## Follow-up polish

- P3: At substantially wider future dashboard containers, the fact row may be allowed to breathe closer to the isolated reference proportions.

final result: passed

# Latest pass — Supplies procurement workspace reference

- Source visual truth: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-8de068d4-35f3-42c9-9d84-5d11ce16f401.png`.
- Source dimensions: 1456 × 1086px.
- Intended implementation: `http://127.0.0.1:3000/portal/supplies`.
- Implementation screenshot: unavailable because the protected route redirects to the operator login and the local demo form reloads without establishing a session in both supported browser surfaces.
- Intended viewport: desktop, 1440px CSS width, density 1.
- State: one or more catalog products, current-order rail visible, default Browse mode.

## Full-view comparison

Blocked. Source image was opened at original resolution. No authenticated browser-rendered implementation capture was available for a valid side-by-side comparison.

## Focused region comparison

Blocked. Header, purchasing hero, product cards, and current-order rail cannot be judged from source code alone.

## Implemented fidelity surfaces

- Typography: existing Poppins and DM Sans design tokens retained; purchasing hero gains the reference's stronger headline scale.
- Spacing and layout rhythm: desktop uses horizontal portal chrome, a full-width hero, compact command and reorder bands, a three-column product grid, and a sticky current-order rail.
- Colors and visual tokens: existing Dark Teal, Teal, Cream, Gold, Cocoa, White, and shared border tokens only.
- Image quality and asset fidelity: existing verified SKU-image policy remains intact; existing bakery photography and logo assets are reused without fabricated product imagery.
- Copy and content: location, catalog, pricing, order, support, and product data remain production-sourced.

## Findings

- [P0] Authenticated visual capture unavailable.
  - Location: local operator login and `/portal/supplies`.
  - Evidence: the protected route returns the expected 307 redirect; submitting the supplied demo credentials reloads the login route instead of creating a session.
  - Impact: responsive layout, interaction states, console state, and reference fidelity cannot be verified in-browser.
  - Fix: restore the local demo authentication path or provide an authenticated local browser session, then capture 390px, 768px, and 1440px states and repeat design QA.

## Comparison history

1. Source reference opened and measured at 1456 × 1086px.
2. Desktop procurement layout implemented using the existing portal design tokens and catalog behavior.
3. Both in-app and Chrome preview attempts reached the operator login; neither established the supplied demo session.

## Follow-up polish

- None classified until authenticated visual comparison is possible.

final result: blocked

# Latest pass — Operator dashboard desktop redesign

- Source visual truth: `C:\Users\ericb\Downloads\Codex Image Sep 17, 2026, 05_49_09 PM.png`
- Source dimensions: 1536 × 941px.
- Implementation: `http://localhost:3000/portal`.
- Implementation visual evidence: authenticated Chrome capture at the live desktop workspace width, 2026-09-17. The browser capture surface does not expose a file-backed screenshot path.
- State checked: expanded desktop navigation with real portal order, cart, resource, and support data.

## Full-view comparison

The implementation follows the reference hierarchy: order-focused verdict and metrics, a single consolidated attention card, fulfillment progress, other active orders, contextual quick actions, and a compact right rail for the current order and operator support.

## Focused region comparison

The attention card uses the real overdue order `BD-5244`, its current total and status, existing review/support routes, and a four-stage progress summary. The current-order rail derives its count and previews from the real cart; because the live cart has one product line with quantity three, it truthfully shows one product preview rather than fabricating three distinct products.

## Fidelity surfaces

- Typography: existing Poppins/DM Sans portal hierarchy retained with a large skimmable verdict.
- Spacing and layout rhythm: two-column desktop workspace, compact metric row, consolidated alert card, and aligned action rail.
- Colors and visual tokens: existing Dark Teal, Cream, Cocoa, border, and attention tokens only.
- Image quality and asset fidelity: current-order previews use the existing catalog visual component and authorized product data.
- Copy and content: order, timing, totals, cart count, and route destinations all come from existing portal sources.

## Comparison history

1. Initial implementation established the reference composition using live order/cart integrations.
   - Finding: P2 — the current-order primary action inherited a global link color and became unreadable against its teal surface.
   - Fix: strengthened the component-scoped selector so the approved Cream-on-Dark-Teal treatment wins.
2. Post-fix evidence: the desktop dashboard visibly shows the complete order workflow, current-order rail, help/resources, and readable primary actions. The accessibility tree exposes all headings and links. Browser console contains no application errors; two observed errors originate from a Chrome extension.

## Follow-up polish

- P3: Additional cart thumbnails will appear automatically when the live cart contains more distinct product lines.

final result: passed

---

# Design QA — Why Budda's connected model

- Source visual truth: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-0c82e520-0ce7-49a4-b9d2-9dd4923e8828.png`.
- Source dimensions: 1673 × 941px.
- Implementation: `http://localhost:3000/franchise/why-buddas`, `#four-pillars`.
- Implementation visual evidence: Codex browser captures at the active 1895px CSS viewport, 2026-09-17. The capture surface does not expose a file-backed screenshot path.
- State: desktop, all four model pillars and the shared outcome visible.
- Density normalization: comparison used the implementation's 90rem max-width content region against the source's approximately 1360px content region.

## Full-view comparison

The implementation matches the source hierarchy: centered eyebrow, two-line heading, balanced supporting copy, four responsibilities surrounding a central Dark Teal model node, a restrained connector system, and one shared outcome band.

## Focused region comparison

The model diagram and outcome band were reviewed separately. Pillar order, icon scale, circular fields, central-node emphasis, divider placement, and the outcome's icon-copy relationship match the reference. The existing Poppins/DM Sans system replaces no source-specific font, and approved pillar copy remains data-driven.

## Fidelity surfaces

- Typography: Poppins/DM Sans hierarchy, weight, line height, and centered desktop wrapping closely match the source.
- Spacing and layout rhythm: 90rem container, symmetrical two-row diagram, 7rem icon fields, and a compact 138px outcome band preserve the reference proportions.
- Colors and visual tokens: Cream/White surfaces, Dark Teal hierarchy, Cocoa body text, and muted Teal connectors remain within the existing brand palette.
- Image quality and asset fidelity: the target contains no raster imagery; standard outline icons use the project's installed Lucide system.
- Copy and content: four governed pillar records remain the source of labels and explanations; the shared outcome copy follows the selected reference.

## Comparison history

1. Initial implementation used a desktop tab rail and exposed one pillar at a time.
   - Finding: P1 — structure did not match the selected connected-model reference.
   - Fix: replaced tabs with one semantic four-item overview and central model node.
2. First rendered comparison:
   - Finding: P2 — desktop content remained constrained to the older 75rem container.
   - Fix: moved the section to the established 90rem wide container.
3. Post-fix evidence: all four pillars are visible together, connector lines align to the central node, outcome band is present, hash anchors are preserved, and browser console reports no local errors.

## Follow-up polish

- P3: Replace the bakery wheat icon only if Brand supplies a preferred bread-roll icon within the approved icon set.

final result: passed

# Latest pass — Global footer reference implementation

- Source visual truth: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-eb7d5707-816f-452f-ba1f-3ca2207e477a.png`
- Source dimensions: 1979 × 793px.
- Implementation: `http://localhost:3000/franchise`, global `footer.site-footer`.
- Implementation visual evidence: Codex in-app browser desktop capture and rendered DOM review, 2026-09-17. The capture surface does not expose a file-backed screenshot path.
- States checked: desktop footer composition and the existing mobile accordion handoff.

## Full-view comparison

The desktop footer now uses the supplied five-part composition: official Budda's logo and opportunity statement, three separated navigation columns, a contact/sign-off column, and a distinct legal strip below. Existing navigation, contact routes, tracking, and responsive accordions remain intact.

## Focused region comparison

The desktop footer keeps five non-overflowing grid columns. At the available desktop viewport, the rendered shell is 1125px wide in a 1280px viewport; the widened desktop rule scales it up to 115rem at larger widths, matching the wide reference composition without horizontal overflow.

## Fidelity surfaces

- Typography: existing Poppins/DM Sans hierarchy remains, with uppercase navigational labels and readable body links.
- Spacing and layout rhythm: vertical column rules, logo breathing room, a full legal divider, and expanded desktop top spacing align the footer with the reference rhythm.
- Colors and visual tokens: existing Cream, White, Dark Teal, Cocoa, and action-teal tokens only.
- Image quality and asset fidelity: the footer reuses the official `/images/Logo.svg` brand asset; no recreated or substitute logo artwork was introduced.
- Copy and content: all governed destinations, phone, email, copyright, and legal disclaimer remain unchanged; the added visual sign-off reflects the approved brand phrase.

## Comparison history

1. Initial state: navigation and contact content existed, but the footer lacked a brand column and the reference's framed five-column hierarchy.
   - Finding: P1 — desktop information architecture and visual rhythm diverged materially from the supplied footer.
   - Fix: introduced the official-logo column, vertical dividers, preserved navigation columns, a contact/sign-off column, and a separated legal strip.
2. First desktop check:
   - Finding: P2 — the inherited global content container was too narrow for the selected wide desktop composition.
   - Fix: added the scoped `footer-desktop-shell` width rule, expanding only the footer to a 115rem desktop maximum.
3. Post-fix evidence: no horizontal document overflow at the inspected desktop viewport; the mobile presentation remains the existing accessible accordion flow.

## Follow-up polish

- P3: Consider a final 1979px capture when a stable wide viewport capture surface is available; the in-app capture session constrained its raster output to the desktop window.

final result: passed

# Latest pass — Operator Support reference implementation

- Source visual truth: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-9a7038de-f784-4d99-b988-3c8232c5c4a6.png`
- Source dimensions: 1672 × 941px.
- Implementation: `http://localhost:3000/franchise`, `#candidate-profile-desktop`.
- Implementation visual evidence: Codex in-app browser capture at 1672 × 941 CSS px, 2026-09-17. The capture surface does not expose a file-backed screenshot path.
- States checked: 1672px reference-width desktop, 1024px two-column fallback, 390px mobile handoff.

## Full-view comparison

The implementation matches the selected composition: left-aligned section introduction followed by two rows of three equal-height cards. Five support cards use large circular icons, small category labels, strong headings, body copy, and bottom-aligned detail links. The sixth card is the process CTA with Dark Teal copy treatment and bakery-process photography.

## Focused region comparison

At the 1672px reference width, implementation cards measure approximately 507 × 288 CSS px against the reference's approximately 510 × 290px cards. The section uses a 1536px content region, 8px card gaps, 24–32px internal spacing, and a 64px block inset.

## Fidelity surfaces

- Typography: existing Poppins/DM Sans implementation matches the reference hierarchy and wrap behavior.
- Spacing and layout rhythm: three equal columns at 1200px+, two columns at 1024px, and the existing dedicated mobile section below 1024px.
- Colors and visual tokens: existing Cream, White, Dark Teal, Base Teal tint, and Cocoa tokens only.
- Image quality and asset fidelity: the approved bakery-production image replaces the unavailable flour-sprinkling reference asset; no synthetic product proof was introduced.
- Copy and content: five support claims remain unchanged; all Learn More links and the process CTA resolve to the existing process route with descriptive accessible names.

## Comparison history

1. Initial implementation: split image-and-ledger composition did not match the selected six-card reference.
   - Finding: P1 — section structure, density, card hierarchy, and CTA placement diverged from the source.
   - Fix: rebuilt desktop presentation as five support cards plus a photographic process card.
2. First reference-width check:
   - Finding: P2 — standard 90rem container produced cards narrower than the source.
   - Fix: scoped the section to a 100rem container and reduced block padding using existing spacing tokens.
3. Post-fix evidence: 1672px cards are approximately 507 × 288px, the 1024px fallback has two equal columns, and 390px hands off to the existing mobile implementation. No overflow or browser console errors remain.

## Follow-up polish

- P3: Replace the CTA photograph only when an approved flour-sprinkling bakery asset becomes available.
- P3: Add the pale botanical/signature motif only when an approved transparent brand asset exists.

final result: passed

# Previous pass — Operator Support board

- Source visual truth: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-fac5714e-b53f-483b-bf3b-06a1fd74e0e8.png`
- Source dimensions: 1896 × 816px.
- Implementation: `http://localhost:3000/franchise`, `#candidate-profile-desktop`.
- Implementation visual evidence: Codex in-app browser capture at 1440 × 900 CSS px, 2026-09-17. The capture surface does not expose a file-backed screenshot path.
- States checked: 1440px desktop board, 1024px single-column ledger, 390px mobile fallback.

## Full-view comparison

The supplied view establishes the existing split composition: operational framing and production proof on the left, five support areas on the right. The implementation intentionally changes only the right-hand presentation at wide desktop widths. The existing copy, image, CTA, and section hierarchy remain intact.

## Focused region comparison

The original long ledger becomes a two-column support board at 1200px and above. Opening/training, standards, brand/marketing, and procurement occupy equal cells. Ongoing operations spans the final row to signal continued support rather than a sequential fifth step. At 1024px, the board returns to one column before the cell width becomes cramped. Mobile retains the existing vertical presentation.

## Fidelity surfaces

- Typography: existing Poppins/DM Sans hierarchy retained; support headings remain readable without truncation.
- Spacing and layout rhythm: 32px grid gap, 24px cell padding, 8px-based spacing tokens, and content-driven row heights.
- Colors and visual tokens: existing White, Dark Teal, Cream, and Cocoa tokens only.
- Image quality and asset fidelity: existing descriptive bakery-production image is preserved with its lazy responsive treatment.
- Copy and content: no support claim or CTA destination changed.

## Comparison history

1. Initial state: five long ledger rows created a tall, visually one-dimensional right column.
   - Finding: P2 — desktop scan speed and balance were weaker than the content hierarchy.
   - Fix: introduced a responsive two-column support board with a full-width ongoing-support row.
2. Post-fix evidence: browser-rendered checks at 1440px, 1024px, and 390px.
   - Result: no P0/P1/P2 layout, reflow, truncation, or overflow issue remains. Browser console has no errors.

## Follow-up polish

- P3: If one support description grows beyond its current measure, revisit the 1200px board threshold before reducing type size.

final result: passed

# Latest pass — Budda's Experience reference implementation

- Source visual truth: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-c8f282d9-6e2c-4687-a10d-ded72d4eff3e.png`
- Source dimensions: 1672 × 941px.
- Implementation: `http://localhost:3000/franchise`, `.homepage-experience-desktop`.
- Implementation visual evidence: Codex in-app browser capture at 1672 × 941 CSS px, 2026-09-17. The capture surface does not expose a file-backed screenshot path.
- States checked: 1672px reference-width desktop, 1024px two-column desktop fallback, 390px mobile handoff.

## Full-view comparison

The implementation matches the selected composition: split editorial header, 2:1:1 image gallery, food/craft/hospitality captions, circular arrow controls, and a full-width restaurant CTA band. Existing approved Roll, bakery-process, and hospitality assets occupy the same narrative roles as the source.

## Focused region comparison

At 1672px, the implementation section measures approximately 940px high against the 941px source. The gallery measures 1568 × 496px with 772/386/386px columns, closely matching the reference. The restaurant CTA measures 1568 × 152px and its primary target is 68px tall.

## Fidelity surfaces

- Typography: Poppins/DM Sans remain the site system; Georgia supplies the source's restrained editorial card and CTA titles.
- Spacing and layout rhythm: 32px section start, 48px section end, 32px major gaps, and 12px gallery gaps.
- Colors and visual tokens: Cream, Dark Teal, Cocoa, White, and existing translucent border treatments only.
- Image quality and asset fidelity: all three approved responsive images retain descriptive alt text and lazy loading.
- Copy and content: the CMS-controlled section title and description remain; source-specific image labels and CTA wording match the selected reference.

## Comparison history

1. Initial implementation: square social gallery and review/restaurant side panel diverged from the selected editorial grid.
   - Finding: P1 — page hierarchy, image ratios, captions, and CTA placement did not match the source.
   - Fix: created independent desktop and mobile presentations and rebuilt desktop as the selected Experience composition.
2. First reference-width check:
   - Finding: P2 — the standard frame was 32px narrow and the section was approximately 70px too tall.
   - Fix: scoped the desktop frame to 102rem, reduced display-title scale, and used asymmetric token-based section padding.
3. Post-fix evidence: 1672px section is approximately 940px high, cards and CTA align with the source, 1024px reflows without overflow, and 390px uses the unchanged mobile presentation. Browser console has no errors.

## Follow-up polish

- P3: Replace the solid lower image shade only if an approved pre-graded image treatment becomes available; no CSS gradient was introduced.
- P3: The source's decorative leaf is omitted because no approved transparent botanical asset exists.

final result: passed

# Latest pass — Budda's Advantage reference implementation

- Source visual truth: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-ebd466c2-5b63-453d-9e70-cb4b7d4d6f4d.png`
- Source dimensions: 1536 × 1024px.
- Implementation: `http://localhost:3000/franchise`, `#operator-proof-desktop`.
- Implementation visual evidence: Codex in-app browser capture at 1536 × 1024 CSS px, 2026-09-17. The capture surface does not expose a file-backed screenshot path.
- States checked: 1536px reference-width desktop, 1024px desktop threshold, 390px mobile handoff.

## Full-view comparison

The implementation matches the selected causal composition: centered Advantage introduction, four large numbered foundations, a bracketed “Together, this creates” connector, a unified two-outcome band, centered process CTA, and restrained brand signatures.

## Focused region comparison

At 1536px, the implementation section measures approximately 1026px high against the 1024px source. Foundation columns remain equal, the outcome band spans the full 1376px content width, outcome icons measure 112px, and the process CTA is 384px wide.

## Fidelity surfaces

- Typography: existing Poppins/DM Sans hierarchy retained; large tabular foundation numbers and uppercase labels match the source structure.
- Spacing and layout rhythm: 40px section start, 16px section end, 32–40px major transitions, and token-based internal spacing.
- Colors and visual tokens: Cream, Dark Teal, Cocoa, and existing Teal tint tokens only.
- Image quality and asset fidelity: no raster imagery belongs to this section; existing icon library supplies the result symbols and connector arrow.
- Copy and content: existing governed foundation, outcome, and process copy remains unchanged.

## Comparison history

1. Initial implementation: compact centered foundations and separate White outcome cards diverged from the source.
   - Finding: P1 — hierarchy, causal relationship, number treatment, outcome surface, and section rhythm did not match.
   - Fix: rebuilt the desktop presentation around numbered columns, a connector bracket, unified outcome band, and brand footer.
2. First reference-width check:
   - Finding: P2 — section was approximately 31px taller than the source.
   - Fix: reduced decorative footer height and bottom section padding using existing spacing tokens.
3. Post-fix evidence: 1536px section is approximately 1026px high, 1024px has no horizontal or content overflow, and 390px uses the unchanged mobile Advantage presentation. Browser console has no errors.

## Follow-up polish

- P3: Replace the Georgia italic signature with an approved script artwork if the exact handwritten brand asset becomes available.

final result: passed

# Latest pass — Global CTA reference implementation

- Source visual truth: `C:\Users\ericb\Downloads\Codex Image Sep 17, 2026, 03_21_55 PM.png`
- Source dimensions: 1672 × 442px.
- Implementation: `http://localhost:3000/franchise`, `#franchise-final-cta-desktop-title`.
- Implementation visual evidence: Codex in-app browser capture at 1672 × 442 CSS px, 2026-09-17. The capture surface does not expose a file-backed screenshot path.
- States checked: 1672px reference-width desktop, 1024px CTA reflow, 390px mobile handoff.

## Full-view comparison

The implementation matches the reference decision rail: franchise-partnership eyebrow, single-line headline, qualification proof columns, vertical action divider, full-width primary action, process link, and inquiry boundary. The previous boxed side panel and candidate-bullet presentation are removed from desktop only.

## Focused region comparison

At 1672px, the implementation measures approximately 437px high against the 442px source. The primary target is approximately 490px wide by 52px high, three qualification columns are semantic list items, and the action rail maintains distinct accessible destinations.

## Fidelity surfaces

- Typography: Poppins/DM Sans hierarchy and Cream/Dark Teal contrast treatment retained.
- Spacing and layout rhythm: 7:5 split, 80px desktop inset, 64px column separation, and compact action rail.
- Colors and visual tokens: Dark Teal, Cream, and White alpha borders only.
- Image quality and asset fidelity: no imagery belongs to the target CTA.
- Copy and content: approved inquiry boundary remains; qualification supporting language is concise and contextual.

## Comparison history

1. Initial implementation: candidate bullets and a boxed side panel did not match the source hierarchy.
   - Finding: P1 — visual grouping and decision sequence diverged from the reference.
   - Fix: introduced a desktop criteria rail and simplified action column.
2. First reference-width check:
   - Finding: P2 — the title wrapped to two lines, making the CTA approximately 55px too tall.
   - Fix: released the desktop title measure to the full left grid column.
3. Tablet check:
   - Finding: P2 — three criteria columns were too narrow at 1024px.
   - Fix: defer three-column criteria layout to 1200px; retain a non-overflowing stacked list below that threshold.
4. Post-fix evidence: desktop height is approximately 437px, desktop/tablet/mobile have no horizontal overflow, and browser console has no errors.

## Follow-up polish

- P3: Revisit criteria descriptions only after Franchise Development approves final operational language.

final result: passed

# Latest pass — Operator dashboard fulfillment timeline redesign

- Source visual truth: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-ac8e1115-88ac-4e5c-8166-e178da2dfa73.png`.
- Source dimensions: 1640 × 897px.
- Implementation: `http://localhost:3000/portal`.
- Implementation visual evidence: authenticated Chrome desktop capture at 1903 × 856 CSS px, density 1, 2026-09-17. The capture surface does not expose a file-backed screenshot path.
- State: expanded portal navigation, one delayed real order in Processing, no other active orders, and current order available.

## Full-view comparison

The redesign removes the row of competing white step cards within the alert surface. Fulfillment is now a compact, continuous timeline that retains all four states while making the delayed Processing state the visual focal point.

## Focused region comparison

The source’s marked region used four individually bordered blocks, introducing too many container edges inside an already bordered attention card. The revised view uses one quiet section divider, a visible “Fulfillment progress” label, a continuous two-pixel track, and clearly separated state markers. The real dates and status details are unchanged.

## Findings

- No actionable P0/P1/P2 findings remain for the redesigned timeline at the verified desktop state.

## Fidelity surfaces

- Typography: existing portal type scale is retained; the timeline label is uppercase utility text and stage names remain readable at a practical UI size.
- Spacing and layout rhythm: one 16px top transition replaces four nested-card boundaries; each stage receives a consistent grid track without adding a dense secondary panel.
- Colors and visual tokens: Dark Teal marks completed work, Orange marks the delayed current step, and muted border/Cocoa tokens distinguish upcoming states.
- Image quality and asset fidelity: the target region has no raster assets; existing Lucide state-marker icons remain in use.
- Copy and content: stage names, dates, and status language continue to derive from the real order state.

## Comparison history

1. Initial state: the fulfillment path rendered as four bordered mini-cards inside the attention card.
   - Finding: P1 — nested surfaces made the order journey read as unrelated cards rather than one progression.
   - Fix: replaced the legacy progress class with a dedicated semantic timeline, continuous track, and explicit current-step state.
2. Post-fix evidence: authenticated desktop capture shows one readable connected progression with all four stages, no nested-card visual clutter, and the Processing delay emphasized in Orange.

## Follow-up polish

- P3: If the desktop card is ever narrowed below the current intermediate breakpoint, review the stage-label wrapping before reducing the timeline type size.

final result: passed

# Latest pass — Supplies desktop rail repair

- Source visual truth: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-6e3e5def-9bc0-421b-84c6-4ec4fbbb1280.png`.
- Source dimensions: 1646 × 1797px.
- Implementation: `http://localhost:3000/portal/supplies`.
- Implementation visual evidence: authenticated Chrome capture at 1910 × 901 CSS px, density 1, 2026-09-18. The capture surface does not expose a file-backed screenshot path.
- State: expanded operator sidebar, Browse mode, one current-order product with quantity three.

## Full-view comparison

The broken capture compressed the 336px current-order rail into two inherited internal grid columns, leaving the order panel and brand card approximately 49px wide and forcing the support panel into a separate column. The repaired render keeps the shared 256px operator sidebar, a 1,070px catalog region, and a single-column 336px sticky order rail with no document-level horizontal overflow.

## Focused region comparison

The current-order panel, support card, and bakery image now stack vertically at full rail width. Order information, subtotal, quantity controls, support link, and photography remain readable without clipping. The remove action uses its existing X icon without a vertically wrapped duplicate label.

## Findings

- No actionable P0/P1/P2 differences remain for the reported desktop layout defect.

## Fidelity surfaces

- Typography: existing Poppins and DM Sans hierarchy remains intact with no new wrapping caused by the rail.
- Spacing and layout rhythm: sidebar, catalog, 16px gutter, and rail tracks remain aligned; the rail no longer contributes excess height to the left-side grid rows.
- Colors and visual tokens: existing Dark Teal, Teal, Cream, Gold, Cocoa, White, and border tokens remain unchanged.
- Image quality and asset fidelity: the existing verified product-image policy and bakery photography remain unchanged.
- Copy and content: catalog, order, support, and location data remain production-sourced.

## Comparison history

1. Initial evidence: current-order panel and brand card compressed to approximately 49px while support occupied the adjacent inherited column.
   - Finding: P1 — desktop rail content was unreadable and visually fragmented.
   - Fix: reset the desktop rail to one internal grid column, force children to full width, and add an intermediate two-card catalog layout for narrower desktop workspaces.
2. First repaired capture:
   - Finding: P2 — support link inherited a dark button background while retaining dark text; remove label wrapped vertically.
   - Fix: restored the support link treatment and reduced the rail remove action to its accessible icon.
3. Post-fix evidence: rail measures 336px throughout; order panel, support, and brand card stack at the same width. Browse and Quick Order both render without internal overflow. Browser console contains no application errors; observed errors originate from a Chrome extension.

## Follow-up polish

- P3: Replace category fallback illustrations only when exact SKU-approved images are available.

final result: passed

# Latest pass — Supplies hero simplification

- Source visual truth: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-3cd6b4e2-2080-40ec-b355-202d36374603.png`.
- Implementation: `http://localhost:3000/portal/supplies`.
- Implementation visual evidence: authenticated Chrome capture at 1910 × 901 CSS px, density 1, 2026-09-18. The capture surface does not expose a file-backed screenshot path.
- State: expanded operator sidebar, Browse mode, current order visible.

## Findings

- No actionable P0/P1/P2 differences remain for the annotated hero elements.

## Fidelity surfaces

- Typography: location-aware purchasing heading and supporting text remain unchanged.
- Spacing and layout rhythm: hero height and left alignment remain intact after removing decoration.
- Colors and visual tokens: Cream surface and established text tokens remain unchanged.
- Image quality and asset fidelity: removed non-essential decoration; no product imagery changed.
- Copy and content: removed the annotated slogan only.

## Comparison history

1. Initial capture: botanical motif and “Same standards. More tables.” lockup were marked for removal.
   - Fix: removed the hero pseudo-element and slogan markup.
2. Post-fix evidence: hero is a clean Cream surface with the purchasing heading as its sole focal point.

final result: passed

# Latest pass — Supplies full-width hero

- Source visual truth: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-3a71ee6f-5f68-4099-aa0f-ee8c338b18eb.png`.
- Implementation: `http://localhost:3000/portal/supplies`.
- Implementation visual evidence: authenticated Chrome capture at 1910 × 860 CSS px, density 1, 2026-09-18. The capture surface does not expose a file-backed screenshot path.
- State: expanded operator sidebar, Browse mode, current order visible.

## Findings

- No actionable P0/P1/P2 differences remain for the highlighted hero width.

## Fidelity surfaces

- Typography: heading and support copy retain their catalog alignment.
- Spacing and layout rhythm: hero expands from 1,518px to the full 1,639px workspace canvas while catalog controls retain their content inset.
- Colors and visual tokens: Cream surface and existing text colors unchanged.
- Image quality and asset fidelity: no imagery changed.
- Copy and content: no text changed.

## Comparison history

1. Initial evidence: hero left 64px of unused space on both sides of the workspace.
   - Fix: added a breakpoint-aware hero inset token, expanded the hero surface with negative inline margins, and preserved the existing content alignment through matching internal padding.
2. Post-fix evidence: hero starts at the workspace edge beside the 256px sidebar, matches the 1,639px main width, and produces no horizontal overflow.

final result: passed

# Latest pass — Orders & Shipments visual alignment

- Source visual truth: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-3a71ee6f-5f68-4099-aa0f-ee8c338b18eb.png` and the verified Supplies workspace it represents.
- Implementation: `http://localhost:3000/portal/orders`.
- Implementation visual evidence: authenticated Chrome capture at 1910 × 860 CSS px, density 1, 2026-09-18. The capture surface does not expose a file-backed screenshot path.
- State: expanded operator sidebar, All orders view, one Processing order.

## Full-view comparison

The Orders workspace now uses the same full-width Cream hero, location-aware headline scale, content inset, compact command surface, rounded White work panel, and Dark Teal hierarchy as the Supplies reference. The record area remains a data table because orders are indexed operational records rather than purchasable cards.

## Focused region comparison

The toolbar groups saved views, search, status, and sorting into one compact surface. The order row preserves order ID, invoice, unit, status, item count, fulfillment estimate, total, placed date, and preview action without introducing a second competing panel.

## Findings

- No actionable P0/P1/P2 differences remain for the requested visual alignment.

## Fidelity surfaces

- Typography: existing Poppins and DM Sans hierarchy now matches the Supplies hero and control scale.
- Spacing and layout rhythm: 1,654px hero aligns to the workspace edge; 1,526px controls and table share one content inset.
- Colors and visual tokens: existing Cream, White, Dark Teal, Teal, Cocoa, Gold, and border tokens only.
- Image quality and asset fidelity: the target workflow requires no raster imagery; no placeholders were introduced.
- Copy and content: location, order, invoice, status, fulfillment, and totals remain data-backed.

## Comparison history

1. Initial state: small title block and flat toolbar/table lacked the Supplies page’s branded page hierarchy.
   - Fix: added a full-width location-aware hero, supplies-aligned typography, and subtle table elevation while preserving workflow behavior.
2. Post-fix evidence: sidebar, hero, toolbar, and table align without horizontal overflow. Search empty state restores correctly, the preview drawer opens and closes, and the browser reports no application console errors.

## Follow-up polish

- P3: Revisit row density only when production locations have enough history to demonstrate ten or more simultaneous orders.

final result: passed

# Latest pass — Orders index and persistent preview rail

- Source visual truth: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-c5d4b87e-8419-4bc7-b4c7-c5852f9c36b2.png`.
- Source dimensions: 1680 × 944px.
- Implementation: `http://localhost:3000/portal/orders`.
- Implementation visual evidence: authenticated Chrome capture at 1910 × 901 CSS px, density 1, 2026-09-18. The capture surface does not expose a file-backed screenshot path.
- State: shared operator sidebar, All orders view, Processing order BD-5244 selected.

## Full-view comparison

The implementation matches the reference’s operational hierarchy: title and order CTA, four summary metrics, saved-view/search/filter command bar, dense order table, selected-row emphasis, and a persistent independently scrolling preview rail. The existing operator sidebar is intentionally retained as the established portal navigation instead of copying the reference’s horizontal header.

## Focused region comparison

The preview rail shows real order identity, invoice, placed time, unit, status, item count, total, fulfillment estimate, line items, activity, full-detail route, and order-scoped support route. Unknown shipping charges, street addresses, carrier tracking, and invoice documents are not fabricated.

## Findings

- No actionable P0/P1/P2 differences remain within the real-data constraints.

## Fidelity surfaces

- Typography: Poppins and DM Sans reproduce the reference hierarchy using existing portal tokens.
- Spacing and layout rhythm: 1,054px index and 448px rail sit on a 16px gutter; metrics, toolbar, and table use aligned keylines without rail-driven vertical gaps.
- Colors and visual tokens: existing White, Cream, Dark Teal, Teal, Cocoa, Orange, and border tokens only.
- Image quality and asset fidelity: no product photo is shown because the live order item lacks a verified SKU image; no placeholder image was fabricated.
- Copy and content: metrics, order row, preview, and activity are derived from the live order and centralized status mapping.

## Comparison history

1. Initial reference-aligned implementation placed the rail in the same grid as four left-side rows.
   - Finding: P1 — the tall rail inflated the header, metric, and toolbar row gaps.
   - Fix: split the index and rail into sibling columns so the rail remains sticky without participating in left-side row sizing.
2. Post-fix evidence: index measures 1,054px, rail 448px, and page width equals the 1,910px viewport with no horizontal overflow. Closing and reselecting the preview works; no application console errors were observed.

## Follow-up polish

- P3: Add verified product thumbnails, invoice actions, and carrier tracking only when those backend records exist.

final result: passed

# Latest pass — Orders controls simplification

- Source visual truth: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-b549538c-15e5-4ab8-a490-5690cde97c0b.png`.
- Implementation: `http://localhost:3000/portal/orders`.
- Implementation visual evidence: authenticated Chrome capture at 1910 × 860 CSS px, density 1, 2026-09-18. The capture surface does not expose a file-backed screenshot path.
- State: All orders selected, Processing order preview open.

## Findings

- No actionable P0/P1/P2 differences remain for the annotated controls.

## Fidelity surfaces

- Typography: removed secondary browse link without changing page hierarchy.
- Spacing and layout rhythm: three equal view buttons now occupy one compact control group; search, status, and sort retain a shared baseline.
- Colors and visual tokens: selected state uses existing Dark Teal; unselected states remain White with existing border tokens.
- Image quality and asset fidelity: no imagery changed.
- Copy and content: removed only the annotated “Browse approved supplies” link.

## Comparison history

1. Initial capture: the secondary browse link competed with the new-order CTA, while the view controls read as an underlined navigation fragment.
   - Fix: removed the secondary link and converted the view controls into equal pill buttons with persistent selected and count states.
2. Post-fix evidence: New supply order is the sole header action; all three view controls remain readable and aligned with search, status, and sort.

final result: passed

# Latest pass — Needs-attention filter fit

- Source visual truth: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-fd888569-af83-4815-9436-984194785118.png`.
- Implementation: `http://localhost:3000/portal/orders`.
- Implementation visual evidence: authenticated Chrome capture at 1910 × 860 CSS px, density 1, 2026-09-18. The capture surface does not expose a file-backed screenshot path.
- State: All orders selected, Needs attention filter available, Processing order preview open.

## Findings

- No actionable P0/P1/P2 differences remain for the circled filter.

## Fidelity surfaces

- Typography: full “Needs attention” label remains legible without truncation or wrapping.
- Spacing and layout rhythm: tab widths now follow content rather than a forced equal grid; the group retains an 8px gap and the shared toolbar baseline.
- Colors and visual tokens: selected state and count tokens remain unchanged.
- Image quality and asset fidelity: no imagery changed.
- Copy and content: no copy changed.

## Comparison history

1. Initial capture: the long label was constrained by equal third-width columns.
   - Fix: changed the desktop view group to content-sized flex pills.
2. Post-fix evidence: label and count remain in one pill, and search, status, and sort retain their positions without overflow.

final result: passed

# Latest pass — Compact sort controls

- Source visual truth: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-eacf0ebb-631a-4bbb-b0f3-d1a21d77564a.png`.
- Implementation: `http://localhost:3000/portal/orders`.
- Implementation visual evidence: authenticated Chrome capture at 1910 × 860 CSS px, density 1, 2026-09-18. The capture surface does not expose a file-backed screenshot path.

## Findings

- No actionable P0/P1/P2 differences remain for the circled controls.

## Fidelity surfaces

- Spacing and layout rhythm: Status is 128px and Sort is 160px; recovered width is allocated to the search field.
- Colors and visual tokens: unchanged.
- Copy and interaction: unchanged.

## Comparison history

1. Initial capture: status and sort stretched to their larger maximum tracks.
   - Fix: constrained the desktop tracks to content-appropriate fixed widths.
2. Post-fix evidence: both labels and chevrons remain visible with no horizontal overflow.

final result: passed

# Latest pass — Operator supply-status dashboard

- Source visual truth: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-19c801bb-e48d-4d6d-b70c-0228a2f981af.png`.
- Source dimensions: 1680 × 944px.
- Implementation: `http://localhost:3000/portal`.
- Implementation visual evidence: authenticated Chrome capture at 1910 × 860 CSS px, density 1, 2026-09-18. The capture surface does not expose a file-backed screenshot path.
- State: shared operator sidebar, one overdue Processing order, empty draft order in the current local session.

## Full-view comparison

The implementation follows the source hierarchy: one-line supply-status headline with freshness controls, three “Today” metrics, a single action-required order with fulfillment timeline, a two-column “What’s next” panel, recent activity with primary/secondary actions, and a draft-order/support rail. The established operator sidebar is intentionally retained instead of copying the source’s horizontal navigation.

## Focused region comparison

The action-required card uses the real order ID, placed timestamp, total, item count, fulfillment estimate, centralized Processing status, real order route, and order-scoped support route. The draft-order rail derives its lines and subtotal from the active cart and correctly presents an empty state when the cart is unavailable or empty.

## Findings

- No actionable P0/P1/P2 visual differences remain within the available data constraints.

## Fidelity surfaces

- Typography: Poppins/DM Sans scale now matches the source’s editorial headline and operational card hierarchy.
- Spacing and layout rhythm: 1,440px content area uses a 1,040px main column, 368px rail, and 32px gutter with aligned module keylines.
- Colors and visual tokens: existing White, Cream, Dark Teal, Teal, Cocoa, Orange, and border tokens only.
- Image quality and asset fidelity: verified catalog visuals render when present; missing SKU images remain semantic fallbacks rather than fabricated product photos.
- Copy and content: all counts, totals, order activity, cart lines, and fulfillment details remain data-backed.

## Comparison history

1. Initial state: generic “orders at a glance” summary, inline counts, other-active-orders panel, quick actions, thumbnail-only cart, and resource rail.
   - Fix: rebuilt the desktop composition around supply status, today metrics, actionable exception, next steps, activity, draft order, and support.
2. First browser pass:
   - Finding: P2 — the headline wrapped earlier than the reference beside the freshness controls.
   - Fix: widened the headline measure and reduced the maximum display size while preserving hierarchy.
3. Post-fix evidence: headline fits on one line at the verified viewport; all primary modules align without horizontal overflow. No application console errors were observed.

## Follow-up polish

- P3: Populate the draft rail with verified product photography only when the live cart includes approved SKU imagery.

final result: passed

# Latest pass — Status-adaptive order preview rail

- Source visual truth: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-1449dbe9-70ae-4934-998e-ede9e8d8335a.png`.
- Source dimensions: 1024 × 1536px.
- Implementation: `http://localhost:3000/portal/orders`.
- Implementation visual evidence: authenticated Chrome capture at 1910 × 860 CSS px, density 1, 2026-09-18. The capture surface does not expose a file-backed screenshot path.
- State: Processing order BD-5244 selected; no operator action required.

## Full-view comparison

The preview rail follows the source anatomy: sticky identity header, semantic status badge, contextual status callout with one primary action, support link, three fact tiles, guidance strip, prominent item detail, activity timeline, and sticky full-order/support actions. Rail width increased to 480px for readable side-panel content.

## Focused region comparison

The source depicts an unavailable-item exception. The implementation adapts that pattern to the real Processing state: it shows “Fulfillment is underway,” a fulfillment-details action, and a truthful no-action-required notice. Action-required backend statuses automatically switch the callout to the Orange warning treatment and centralized resolution label.

## Findings

- No actionable P0/P1/P2 differences remain within the live order-state constraints.

## Fidelity surfaces

- Typography: clear order identity, status heading, fact labels, item hierarchy, and timeline labels match the source density.
- Spacing and layout rhythm: 480px rail, 20px section insets, three equal fact tiles, independent scrolling, and sticky footer actions.
- Colors and visual tokens: existing White, Cream, Dark Teal, Teal, Cocoa, Orange, and shared border tokens only.
- Image quality and asset fidelity: the order item lacks a verified SKU image, so a semantic Package icon is used instead of fabricated product photography.
- Copy and content: identity, invoice, placement time, status, unit, total, fulfillment, item, support route, and activity remain data-backed.

## Comparison history

1. Initial preview: facts and line items were structurally correct but lacked the source’s contextual status callout, guidance, item focus, and persistent actions.
   - Fix: rebuilt the rail into source-aligned sections with conditional status treatment.
2. First browser pass:
   - Finding: P2 — Processing had no notification body, leaving the callout title unexplained.
   - Fix: fall back to the centralized status meaning when a notification body is absent.
3. Post-fix evidence: rail is 480px wide, scrolls independently, has no page overflow, and reports no application console errors.

## Follow-up polish

- P3: Render verified SKU photography when exact order-item image metadata becomes available.

final result: passed

# Latest pass — Preview fact value hierarchy

- Source visual truth: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-da320b25-c240-4366-9bbe-a9ad43f42b01.png`.
- Implementation: `http://localhost:3000/portal/orders`.
- Implementation visual evidence: authenticated Chrome capture at 1910 × 860 CSS px, density 1, 2026-09-18.

## Findings

- No actionable P0/P1/P2 differences remain for the fact values.

## Comparison history

1. Initial values rendered at 13px and did not separate strongly enough from their labels.
   - Fix: increased values to 17px, applied the established heading font, and retained the secondary unit ID at 10px.
2. Post-fix evidence: all values remain inside their fact tiles without overflow.

final result: passed

# Latest verification — Operations Support workspace

- Source: `C:\Users\ericb\Downloads\Codex Image Sep 18, 2026, 05_48_22 PM.png`.
- Live route: `http://localhost:3000/portal/support` at 1910 × 860 CSS px.
- Verified: source-aligned information hierarchy, existing sidebar retained, real unit data and support phone used, 44px primary actions, create/back interaction, and no horizontal overflow.
- Corrected during review: reserved desktop header space now prevents the immediate-assistance card from intersecting the status band.
- Remaining P3: resource cards share the library route until stable category query parameters exist.

final result: passed

# Latest verification — Support header spacing

- Source: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-5c0b72a7-f2a8-4404-a72a-a071f8e6323e.png`.
- Live route: `http://localhost:3000/portal/support` at 1910 × 860 CSS px.
- Corrected: the action cluster is top-aligned with the page heading, its right edge aligns exactly with the status and request panels, and the previous floating whitespace is removed.
- Measured result: 50px separation between the assistance card and status band, zero overlap, zero right-edge drift, and no horizontal overflow.
- No P0/P1/P2 layout differences remain in the marked region.

final result: passed

# Latest verification — Support description and unit emphasis

- Source: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-6fec45b8-aee0-4819-bce4-c9e6abec2fd1.png`.
- Live route: `http://localhost:3000/portal/support` at 1910 × 860 CSS px.
- Corrected: removed the heading container constraint, gave the description a 48rem readable measure, and promoted the active unit into a bordered 288 × 73px context card with a 32px icon and stronger type hierarchy.
- Measured result: description renders 768px wide on one line; unit card does not intersect the actions and retains 44px separation before the metric band; no horizontal overflow.
- No P0/P1/P2 differences remain in the marked region.

final result: passed

# Latest pass — Smart support intake

- Source visual truth: `C:\Users\ericb\Downloads\Codex Image Sep 18, 2026, 06_38_45 PM.png`.
- Live route: `http://localhost:3000/portal/support`, authenticated Chrome at 1910 × 860 CSS px.
- State: new support request intake, no form submission performed.

## Full-view comparison

The ticket-creation state now follows the reference structure inside the existing operator shell: dedicated back action, intake-specific title, four-stage orientation, large detail card, review summary rail, immediate-assistance block, next-step guidance, and resource route. Unsupported attachment and order-line controls were not fabricated.

## Findings

- No actionable P0/P1/P2 differences remain within the production data and server-action constraints.
- The reference's five-stage flow was simplified to four truthful stages because the production action persists topic, subject, description, and unit context in one transaction.

## Verification evidence

- Main form width: 1,020px; summary rail: 368px; no horizontal overflow.
- Empty submit exposes a focused error summary and marks all three required persisted fields invalid.
- Support area and operational impact selections update the summary rail immediately.
- Back to support returns to the request workspace without submitting or mutating external state.
- Existing server action, topic allowlist, character limits, unit validation, idempotency key, and success state remain intact.

## Follow-up polish

- P3: Add attachments only after storage, malware scanning, retention, and authorization policies are implemented end to end.

final result: passed

# Latest pass — Growth requests lifecycle board

- Source visual truth: `C:\Users\ericb\AppData\Local\Temp\codex-clipboard-1c2be81c-6566-4a84-9616-878edfb6e372.png`.
- Live route: `http://localhost:3000/portal/expansion`, authenticated Chrome at 1910 × 860 CSS px.
- Data state: Salt Lake City #1 currently has no growth requests; the verified board therefore renders truthful stage-level empty states.

## Full-view comparison

The page follows the reference composition inside the existing operator shell: growth heading, primary request action and process guidance, four lifecycle totals, search/stage/sort toolbar, stage-based active-request board, and separate closed-request table region. Existing request creation, disclosure details, administrator stage actions, and development-process routes remain intact.

## Findings

- No actionable P0/P1/P2 differences remain within the current zero-data state.
- The reference's “Information needed” lane was not copied because that state does not exist in the production lifecycle. Real statuses map to Submitted, In review, Next steps (Buildout), and Closed.

## Verification evidence

- Four summary metrics and three active lifecycle lanes render at desktop width without horizontal overflow.
- Search, stage selection, and updated-date sorting remain native labeled controls.
- Stage selection updates successfully; the Start growth request CTA navigates to `/portal/expansion/new` and the browser back path returns to the board.
- No application console errors were observed; captured errors originated from an unrelated browser extension.
- The operator sidebar, unit context, permissions, existing form, review-before-submit step, and data-backed status definitions are preserved.

## Follow-up polish

- P3: Re-run visual comparison with populated production-like records when the unit has representative requests in each lifecycle state.

final result: passed

# Latest verification — Shared lifecycle-total pattern

- Reference component: Operations Support request-summary metrics at `http://localhost:3000/portal/support`.
- Updated component: Growth Requests lifecycle totals at `http://localhost:3000/portal/expansion`.
- Standardized: four equal columns, 84px cell height, 36px numeric values, 52px value column, 20px horizontal padding, 12px gap, 12px radius, shared border treatment, and matching label/supporting-copy scale.
- Simplified: removed decorative icon circles so both pages use the same number-first hierarchy.
- Semantic differentiation remains in the numeric colors and descriptive labels; color is not the sole signal.
- Verified in authenticated Chrome at 1910 × 860 CSS px with no horizontal overflow.

final result: passed

# Latest verification — Lifecycle icons restored

- Updated Growth Requests lifecycle totals to use semantic icons in place of visible numeric values while retaining the shared Operations Support spacing, dimensions, borders, and typography.
- Verified four visible icons, zero visible number elements, no horizontal overflow, and accessible labels that preserve each data-backed count (for example, “0 submitted requests”).

final result: passed

# Latest pass — Account & Access workspace

- Source visual truth: `C:\Users\ericb\Downloads\Codex Image Sep 19, 2026, 09_10_55 AM.png`.
- Live route: `http://localhost:3000/portal/account`, authenticated Chrome at 1910 × 860 CSS px.

## Full-view comparison

The account page now follows the reference's three-column architecture inside the existing operator shell: sticky local account navigation, primary identity and record workspace, and contextual account/session rail. Authoritative entity, payment, statement, credential, sign-off, unit, delivery, document, and location-switching workflows remain present rather than being replaced by mock summaries.

## Findings

- No actionable P0/P1/P2 differences remain within the current account-data state.
- The reference's decorative account-navigation artwork was not copied; the production portal retains its existing global sidebar and uses a responsive in-page navigation rail.

## Verification evidence

- Desktop grid measured at 192px local navigation, 958px content, and 320px account rail with no horizontal overflow.
- Account avatar is a 72px circular dark-teal identity mark.
- Business & Billing anchor updates the hash and lands on the correct authoritative record section.
- Exactly one visible contextual sign-out action remains; it was not triggered during verification.
- No application console errors were observed; captured errors originated from an unrelated browser extension.

## Follow-up polish

- P3: Add richer status badges only when authoritative entity, payment, and compliance status fields are available instead of inferring them from missing data.

final result: passed

# Latest pass — Resource Center library

- Source visual truth: `C:\Users\ericb\Downloads\Codex Image Sep 19, 2026, 09_33_41 AM.png`.
- Live route: `http://localhost:3000/portal/resources`, authenticated Chrome at 1910 × 860 CSS px.
- Data state: the configured source currently returns zero authorized resources for Salt Lake City #1, so required and recently updated collections render truthful empty states.

## Full-view comparison

The page follows the reference's library architecture inside the existing operator shell: sticky local resource navigation, unit-aware heading, prominent active search, category switcher, required-resource section, recently updated structured list, category browsing, and contextual unit/support/guidelines rail. Download and acknowledgement/return actions remain connected to the existing resource endpoints when authorized records are supplied.

## Findings

- No actionable P0/P1/P2 differences remain within the current zero-resource state.
- Example resources from the visual reference were not fabricated because the authenticated storage source did not authorize any records for this unit.

## Verification evidence

- Desktop grid measured at 192px navigation, 966px library, and 320px context rail with no horizontal overflow.
- Category controls update their pressed state; search accepts and clears live queries; sort remains a labeled native select.
- Required actions remain conditional on real `requiredAction` metadata.
- A transient Next.js development-manifest read error appeared during hot reload and did not recur after reload; remaining captured errors originate from an unrelated browser extension.

## Follow-up polish

- P3: Re-run visual comparison with populated authorized resources to validate row density, required-action expansion, and download metadata against the source state.

final result: passed

# FAQ page reference plan

Reading this as a practical franchise information desk with a five-topic sidebar, searchable answers, and concise resource cards. Use the existing Next.js page, shared FranchisePageHeader, native disclosure accordions, FAQ reducer/search/copy utilities, Lucide, Poppins/DM Sans, and scoped CSS. Design dials: variance 4, motion 1, density 4. Omit the script slogan and background patterns.

1. Keep existing public FAQ text, stable IDs/slugs, answer links, helpfulness feedback, analytics, legal disclaimer, and canonical metadata. The real catalog contains six questions; display real topic counts rather than the reference's inconsistent repeated counts.
2. Group Supply & Ingredients into Concept & Operations for presentation only. Keep governed record categories unchanged. Show five topic buttons with icons, counts, and a selected state; start with Concept & Operations. Native disclosures remain readable without JavaScript.
3. Keep search above the desk, with a result count, show/hide-all control, and Print. Search the full catalog; selecting a topic clears the current search. Hash visits select the relevant topic, clear search, open the target, and retain focus/scroll behavior.
4. Place the contact card below the topic navigation with the existing inquiry disclaimer. Add the reference's topic heading and introduction above the answer list, and two topic-appropriate related resource cards below it.
5. Restyle answer cards with full-width content, teal edge on open cards, circle-chevron controls, horizontal three-item highlight strips, and answer/source copy-link actions. Preserve the existing feedback and clipboard failure fallback.
6. Add a small plain brand/value strip above the existing site footer. Preserve navbar and shared footer. Use a two-column desk on desktop and a stacked topic picker on smaller screens.
7. Add a focused native Node regression check for the presentation grouping. Per workspace instructions, do not execute automated tests, build, lint, typecheck, or static analysis. Browser-check all five topics, search/zero-results/clear, show/hide-all, canonical deep-link reveal, copy control, visible focus, and responsive overflow at 390, 768, and 1440px. Inspect print styling without completing a print job.

Scope: FAQ page header/copy, FaqExplorer presentation, FAQ stylesheet, a small grouping helper in the existing FAQ interaction module, and its existing test file. No new dependencies, fetched/generated images, fabricated answers, or new shared component abstractions. Risks: existing source/legal review status is preserved; this visual task does not approve the content. Main fidelity difference is existing site typography and retention of helpfulness feedback.

## Completed changes

- `src/app/franchise/faq/page.tsx`: reference introduction; retain shared header, canonical metadata, and public FAQ source.
- `src/app/franchise/faq/faq.css`: replace the old ledger styling with the reference desk, topic navigation, contact card, answer panels, horizontal highlights, resource cards, brand strip, and responsive/print rules.
- `src/components/public/faq-explorer.tsx`: five-topic browsing, selected topic copy/resources, global search presentation, reference controls, and sidebar contact placement. Reuse the existing search/reducer, native accordion, clipboard fallback, print lifecycle, and analytics. Preserve answer text, stable record IDs/slugs, and helpfulness feedback.
- `src/features/franchise/faq-interaction.ts`: one-line presentation grouping for Supply & Ingredients, without changing governed record categories.
- `tests/faq-interaction.test.mjs`: focused native Node regression check for grouping, real counts, unchanged source categories, and unknown-category passthrough. Added but not executed under workspace instructions.

No new dependencies, photo assets, shared component layers, or parallel mobile/desktop implementations. Script lettering and decorative patterns omitted. Correct counts are 2, 1, 1, 1, and 1; no answers were invented to match the reference's repeated counts.

## Verification evidence

Browser inspected at 390, 768, 1024, and 1440px with no horizontal overflow. All five topics show the correct questions and headings. Show/hide-all opens and closes the visible answers; native mouse and keyboard disclosure controls work, with a visible 3px focus outline.

Searching “grand opening” from Concept & Operations finds the Training & Support answer and expands it. An unmatched query displays the empty state; clearing restores the selected topic. Selecting a topic during search clears the query. A `#financial-qualifications` visit selects Investment & Capital, opens the financial answer, and focuses its summary. Copy answer link reports success and copies `https://buddasfranchise.com/franchise/faq#financial-qualifications`.

The support resource opens `/franchise/the-opportunity#support-runway`, whose anchor exists. Print-specific CSS was inspected from the rendered stylesheets; no print job was started. No localhost app errors were present in the browser console. Build, tests, lint, typecheck, and static analysis were not run.

Screenshots: `artifacts/faq-page-reference-390.png`, `artifacts/faq-page-reference-768.png`, and `artifacts/faq-page-reference-1440.png`. Final visual verdict: 93/100, a qualitative comparison, recorded in `.omx/state/faq-page-reference/ralph-progress.json`.

Remaining differences: existing fonts/icons and brand symbol are approximations; retained helpfulness feedback and source paragraph breaks make the open answer taller than the reference. Native/no-script structure and existing print lifecycle are preserved by implementation, but disabling JavaScript and completing print preview were not tested. Source/legal review status and existing source-link destinations were preserved.

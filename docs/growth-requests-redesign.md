# Growth Requests refinement — September 5, 2026

The Growth Requests page now uses a task-oriented two-column desktop layout: the form occupies the wider work column and Request status remains visible in a narrower side column. At compact widths the two regions stack in the same information order. The composition follows the master brand book's functional workspace direction with Cream and White surfaces, Dark Teal authority/actions, limited Orange, Poppins headings, and DM Sans form text.

The form is grouped into “Where you want to grow” and “How you’ll support another unit.” Every control has a visible associated label and persistent guidance. Review uses a check-answers list with an individual Change action for every answer. Change returns focus to the selected field. Client validation adds a focusable error summary with links to invalid fields and matching inline messages; the server remains authoritative.

Request status is a separate module. An empty entity receives a concise explanation. Populated records show the complete request ID, canonical status label and meaning, authoritative update time, and a disclosure for request details. Administrator controls remain available only in the admin branch.

The server now compares the unit reviewed in the browser with the authenticated working unit and revalidates operator-to-entity and unit scope in the Firestore transaction before writing. Operating-plan validation accepts normal paragraphs while rejecting unsupported control and bidirectional characters.

References: [Budda's Master Brand Guidelines](<F:/WORK/A-C/BUDDAS/BRANDING/BRAND BOOK/Buddas_Master_Brand_Guidelines_Brand_Book_v1.0.md>), [W3C form labels](https://www.w3.org/WAI/tutorials/forms/labels/), [W3C form instructions](https://www.w3.org/WAI/tutorials/forms/instructions/), and [GOV.UK check answers](https://design-system.service.gov.uk/patterns/check-answers/).

Live checks covered the default desktop render, 1024px, 640px, missing-field feedback and focus, multiline input, final review, and per-answer editing. Browser size was restored and local test values were cleared. No request was submitted. The authenticated dataset contained no request cards and did not expose the administrator branch, so those visual states were not exercised.

Changed files: `src/app/portal/expansion/page.tsx`, `src/components/portal/expansion-request-form.tsx`, `src/features/portal/expansion-schema.ts`, `src/features/portal/expansion-actions.ts`, `src/app/globals.css`, and `.omx/state/growth-redesign/ralph-progress.json`.

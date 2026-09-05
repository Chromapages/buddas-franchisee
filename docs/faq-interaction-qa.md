# FAQ interaction verification

## Implemented behavior

- The first published question is expanded in the server response and initial client state.
- Native details/summary is an opt-in mode on AccordionItem. Other button accordions retain their previous markup and behavior.
- Browse and search expansion are separate sets keyed by persisted record IDs.
- Changing the normalized query opens matching records; equivalent whitespace/case changes preserve user collapses. Clearing restores browse state and search focus.
- Literal all-token matching includes title, category, answer, details and structured highlights in editorial order.
- Expand/Collapse all only affects visible records. Zero matches omit bulk controls.
- Valid persisted slug fragments clear filters, open the record and move focus below the sticky header. Invalid encoding and unknown fragments are ignored. Toggle/search actions do not write history or alter query parameters.
- Copy link uses the canonical FAQ route and persisted answer fragment. Failed clipboard writes expose a labelled, selectable read-only URL.
- Native disclosure content and icon motion use 240ms where supported, with no transition under reduced motion. Older engines switch native content immediately.
- All published answer text stays in SSR. No answer fetch occurs on toggle.

## Automated tests run

`node --experimental-strip-types --test tests/faq-interaction.test.mjs tests/franchise-faq.test.mjs`

Nine tests passed covering initial/empty browse state, individual and bulk expansion, mixed state, details-only matches, normalized-query changes, collapse preservation, clear/restore, no results, whitespace, apostrophes, diacritics, literal punctuation, valid/invalid fragments, canonical link copying, rejected/missing clipboard API, SSR native fallback markup and backwards-compatible button accordions.

Actual HTTP response also contains six native details, six summaries, six answer panels, and exactly one initially open disclosure, plus no-script presentation rules hiding JavaScript-only actions.

## Browser checks run

- Started with first question open. Opened another question, searched grand opening, collapsed the result, changed only case/spacing, then cleared. Original two browse panels returned; search kept focus and unrelated source=test URL parameter remained.
- Expand all opened six; Collapse all closed six and kept the same initiating control focused.
- Space closed the first native disclosure; Tab skipped its closed answer links to the next question. Enter opened that question; Tab reached its source link.
- Copy link succeeded in the local preview.
- Zero results said No matching questions and omitted bulk expansion.
- A valid financial-qualifications fragment cleared a zero-result filter and revealed/focused the answer below the persistent header. A malformed fragment left the six-question page usable.
- At 1024, 1280, 1440 and 1920 CSS pixels, the reading frame and 48px search height stayed intact with no horizontal overflow. No accordion panel region landmarks are added in the FAQ mode.
- No browser console errors were observed during these checks.

## Verification limits

- Browser tooling does not expose a JavaScript-disable option. The actual no-script markup and native browser disclosure interaction were checked, but a fully JavaScript-disabled browser-context pass was not run.
- Clipboard rejection/absence is tested with mocked writes, not by changing real browser permissions.
- Reduced-motion rules are implemented; the current browser tool cannot emulate that media preference.
- Native print/PDF preview and full screen-reader combinations were not verified in this pass. Content approval metadata remains the responsibility of the recorded owners.

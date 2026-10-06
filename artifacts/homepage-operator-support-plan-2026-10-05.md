# Homepage operator support reference plan

Scope: replace only the homepage operator support presentation, preserving its heading ID, shared support content, and other in-progress edits.

Design read: franchise marketing for prospective operators, preserving Budda's identity and matching the supplied reference. Native CSS and installed Lucide icons. Dials: variance 4, motion 1, density 4. The reference explicitly authorizes its numbered stages, brand accent tints, cream surface, and script signoff.

| Change | Success criteria |
| --- | --- |
| Replace five stacked rows with four ordered stages: Open, Operate, Grow, Stay supported | Four columns at 1440px, two at 768px, one at 390px. Number and icon circles, connecting arrows on desktop, three checklist items per stage. |
| Match introductory copy and right-side brand signoff | Reference headline, supporting copy, script slogan, gold underline, and vertical desktop divider. Existing fonts and CSS color/spacing tokens. |
| Add pale teal workspace banner | Laptop image, workspace explanation including supplies, one working link to existing operator login, and reference tagline. |
| Keep accessibility and surrounding homepage behavior | Semantic ordered list and headings, decorative art hidden from assistive technology, readable contrast, visible keyboard focus, action at least 44px tall, no horizontal overflow at target widths. |

Implementation: edit `src/app/franchise/page.tsx`; replace obsolete homepage-only rules in `operator-support.css` while preserving the shared candidate-profile section rule. Reuse the tropical SVG and existing script-font pattern. Create only the laptop bitmap asset with image generation; no new dependencies, fake HTML device UI, or client state.

Verification: inspect the current rendered section first; compare each visual iteration with the supplied reference and save the verdict in `.omx/state/homepage-operator-support/ralph-progress.json`. Inspect 390px, 768px, and 1440px layouts, actual text contrast, CTA focus and destination. Automated tests, lint, typecheck, and build are not requested under workspace instructions.

Limitations: no connected design-token registry or dedicated contrast tool is available. Use the existing CSS tokens and computed browser styles with WCAG contrast calculations. Script lettering uses the existing system-font approximation. A design implementation plan is not an AI-agent prompt or model spec.

## Implementation and browser evidence

Implemented the four-stage sequence, matching introductory copy, two-line script signoff, pastel checklists, decorative tropical edges, and laptop workspace banner. Reused the existing brand palette, typography, icon library, and semantic heading ID. Kept the shared five-area content unchanged; procurement appears in the banner. Removed unused homepage row and CSS device-mockup styles. No dependencies or client components added.

Computed text/background pairs pass WCAG AA. Body text on the section surface measures 10.04:1; the workspace CTA measures 7.04:1. Number circles measure at least 6:1. Desktop CTA height is 60px; mobile CTA measures 310 x 60px, with no internal overflow. Keyboard focus is visible with a 3px outline and contrasting shadow.

Browser inspection confirms four columns at 1440px, two at 768px, and one at 390px. No page horizontal overflow at those widths. All four stages and twelve checklist entries render, and the laptop loads. Saved desktop, tablet, mobile, and mobile focus screenshots in `artifacts/homepage-operator-support-*.jpg`.

Clicking the workspace action opens `/franchise/login` and its operator sign-in heading. Mobile keyboard focus is unobscured below the persistent header. Final visual verdict: 92/100, a qualitative comparison rather than a measured fidelity percentage, persisted in `.omx/state/homepage-operator-support/ralph-progress.json`. Browser error records only showed unrelated extension errors from `share-modal.js`.

Remaining fidelity differences: existing brand teal is greener than the reference, system script lettering approximates the reference artwork, and the generated laptop is an illustration. Light presentation follows the supplied reference and existing homepage. No build, lint, typecheck, automated tests, Lighthouse, or performance certification performed.

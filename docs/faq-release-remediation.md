# FAQ release remediation plan

## 1. Content governance gate

- Franchise Development and Legal must update every public FAQ item's `lastReviewedAt`, `sourceDocument`, and review status in `faq-content.ts`.
- Financial, territory, supply, support, and timeline claims remain blocked until the relevant owner approves them.
- Run `npm run verify:faq-release`; a nonzero result is a release blocker.

## 2. Live mobile and accessibility QA

Use a production build to inspect 320×568, 360×640, 375×667, 390×844, 395×1579, 412×915, 430×932, and representative landscape viewports. Validate keyboard, screen reader, 200% zoom, text spacing, reduced motion, and touch targets.

## 3. Print QA

Print the current visible result set in portrait preview and Save as PDF. Confirm all answers appear without opening panels, deeper URLs are visible, controls and CTAs are absent, and legal footer appears once.

## 4. Performance QA

Measure production INP and CLS before release. Do not replace local search or accordion state with external services or dependencies unless measurement shows a concrete need.

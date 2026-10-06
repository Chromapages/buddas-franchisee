# Homepage franchise opportunity reference plan

Implement the supplied reference in the existing homepage qualification section.

1. Keep the semantic section heading ID, operator list, and candidate-profile destination. Replace introductory copy with “A strong fit works both ways.” and the supplied supporting copy.
2. Use a desktop split with a vertical divider, three numbered rows, circular Lucide icons, and fine horizontal rules. Reuse Poppins, DM Sans, and the installed icon library.
3. Add the handwritten slogan with a native script-font fallback and gold underline. Reuse the existing tropical pattern as a pale decorative mask.
4. Add the pale teal partnership strip: heading, four icon benefits, candidate-profile action, and supporting tagline.
5. Stack the introduction and criteria below 1024px; wrap the benefits and use a full-width action on phones. Check rendered layouts at 390px, 768px, 1024px, and 1440px, including overflow, focus, and navigation.

Design dials: variance 4, motion 1, density 4. Native CSS, no animation or new dependencies. The reference authorizes its copy, numbered labels, and two-line desktop action. Scope CSS to this section; preserve other in-progress homepage edits.

Verification: browser inspection and screenshot comparison using visual-verdict. No build, lint, typecheck, automated tests, or static analysis requested. Main fidelity limit: the handwritten font is a system-font approximation.

## Completed implementation and evidence

Changed `src/app/franchise/page.tsx` and added `src/app/franchise/homepage-opportunity.css`. Reused the existing fonts, Lucide icons, candidate criteria, navigation destination, and tropical pattern. No dependencies, extra client components, or animation code.

Browser inspection confirmed no horizontal overflow at 390, 768, 1024, and 1440px. The desktop headline occupies two lines at 1024 and 1440px. All three criteria and four benefits render. The phone action is 64px tall; keyboard focus is visible with a 3px outline. Clicking the action opens `/franchise/the-opportunity#mutual-operator-fit` and the matching section exists.

Screenshots: `homepage-opportunity-desktop-1440.png`, `homepage-opportunity-mobile-390.png`, and `homepage-opportunity-tablet-768.png`, all in `artifacts/`. Visual verdict: 92/100 (qualitative comparison), persisted in `.omx/state/homepage-opportunity/ralph-progress.json`.

Remaining fidelity differences: approximate script lettering and reused tropical pattern rather than the exact reference artwork. No build or automated checks were run under the workspace instructions. Browser error records contained an unrelated extension error from `share-modal.js`.

## Follow-up: match the homepage section scale

The user requested a smaller section after seeing it in page context. Browser measurements at 1440px showed an 829px section, a 57.6px headline, and a 22.32px introduction; most neighboring sections measured 568–677px with 48px headings. The cause was the section's independent viewport-based typography and larger internal spacing.

Changed only `src/app/franchise/homepage-opportunity.css`: reuse homepage heading, introduction, eyebrow, subheading, container, gutter, and section-inset tokens; reduce row padding, icon sizes, slogan spacing, partnership heading, and CTA text size. On phones, place icons and numbers alongside the copy rather than in a separate header row.

Verified rendered output at 390, 768, 1024, and 1440px with no horizontal overflow. At 1440px, height is now 710px (14% smaller), heading 48px, and introduction 18px. The phone section is 1550px and its action remains 64px tall. All three criteria and four benefits remain. Final screenshots: `homepage-opportunity-compact-desktop-1440.png` and `homepage-opportunity-compact-mobile-390.png`. Visual verdict: 93/100 against the revised request. No build or automated checks run. Existing script-font and artwork approximations remain the only known fidelity limits.

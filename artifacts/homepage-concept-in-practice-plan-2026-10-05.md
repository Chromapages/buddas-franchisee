# Bakery engine in practice reference plan

Scope: the homepage section labelled “The bakery engine in practice”. Match the supplied reference without its background pattern. Preserve the heading ID, existing restaurant destination, and all surrounding in-progress edits.

Design read: brand-preserving franchise marketing for prospective operators. Native CSS, existing Poppins/DM Sans fonts, installed Lucide icons. Dials: variance 4, motion 1, density 4. The reference authorizes three photo columns, numbered captions, pastel callouts, and the supplied copy. Maintain the existing light homepage presentation.

| Implementation | Success criteria |
| --- | --- |
| Narrower left column with a prominent two-line heading | At 1440px, copy occupies approximately 29% of the section; the three photo columns occupy the rest. |
| Complete the disciplined-growth block | Include the reference heading, supporting sentence, restaurant CTA, and values signoff. CTA stays on one line and opens the existing destination in a new tab. |
| Three portrait photo stories | Reuse the existing baker and kitchen photos. Create one guest-service image closer to the reference; preserve the original shared image. Overlap circular bakery, cutlery, and guest icons at photo bottoms. |
| Add numbered headings, descriptions, and callouts | Exactly three items, each with the reference's title, body copy, and mint/gold bottom callout. Align callout bottoms on desktop. Use readable number colors instead of the reference's very pale numerals. |
| Responsive and accessible layout | Tablet stacks intro above three stories; below 768px, stories stack vertically. No horizontal overflow at 390, 768, or 1440px; images load, text passes AA, keyboard focus is visible, CTA is at least 44px tall. |

Edit only `src/app/franchise/page.tsx` and `src/app/franchise/concept-in-practice.css`, plus the new guest photo. Replace obsolete section styles instead of adding overrides. Reuse existing semantic headings and figure/caption markup. No background pattern, new dependencies, client components, or animation code.

Verification: inspect the current rendered section first, compare screenshots with the reference using visual-verdict, and persist each iteration in `.omx/state/homepage-concept-in-practice/ralph-progress.json`. Check rendered geometry, computed text contrast, keyboard focus, image loading, and CTA destination. No build, lint, typecheck, automated tests, or static analysis are requested under workspace instructions.

Constraints: no connected design-token registry or dedicated contrast checker is available; use repository CSS tokens and computed browser styles with the WCAG contrast calculation. This is a human-readable implementation plan, not an AI-agent prompt. Exact photo identity and pale reference numerals are not accessibility or fidelity claims.

## Implementation evidence

Changed the two scoped source files and added `public/images/concept-guest-experience-reference.png`. Reused the baker and kitchen photos; generated only the guest-service photo. Replaced obsolete section CSS with the reference layout, badges, numbered titles, body copy, disciplined-growth copy, two-line callouts, and values signoff. No background pattern, new dependencies, or client state.

At 1440px the copy/gallery columns measure approximately 383px/938px. All three photo assets load and the callout bottoms align. At 768px the intro stacks above three approximately 221px gallery columns, with no heading or page overflow.

Computed text pairs pass WCAG AA: heading text 7.33:1, body text 10.04:1, CTA 7.04:1, and callout text at least 6.88:1. CTA height is 64px, its label stays on one line, and the existing restaurant URL, new-tab behavior, and `noopener noreferrer` attributes remain intact. Section pseudo-element inspection confirms no background pattern.

Remaining fidelity differences: existing brand teal is greener than the reference, existing bakery/kitchen crops and installed icon glyphs approximate it, and decorative numbers use readable dark colors. The guest photo is generated artwork. No build, lint, typecheck, automated tests, or Lighthouse run was requested.

Mobile inspection at 390px confirms a single-column gallery, all three images loaded, exactly three stories/callouts, no horizontal overflow, and a 350 x 64px CTA without internal overflow. Keyboard focus shows a 3px outline with a contrasting shadow, unobscured below the header. Final tablet callout measurements confirm exactly two lines per callout with aligned bottoms.

Final visual verdict: 93/100, a qualitative review rather than a measured fidelity percentage. Evidence is saved in `.omx/state/homepage-concept-in-practice/ralph-progress.json` and `artifacts/homepage-concept-in-practice-*.jpg`.

Follow-up whitespace fix: added `align-self: start` to the gallery in `concept-in-practice.css`. The taller left column no longer stretches the gallery and pushes its callouts down. At the reported 1877px width, gaps shrink from 135-164px to 16-45px while callout bottoms remain aligned. Checked 1440, 768, and 390px with no horizontal overflow; mobile gaps are 16px. One CSS declaration, no new layout overrides. Final gap-focused visual verdict: 95/100. Screenshot: `artifacts/homepage-concept-gap-fixed-1877.jpg`.

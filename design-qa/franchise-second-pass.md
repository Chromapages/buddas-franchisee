# Franchise second-round preservation pass

Reading: franchise landing page for experienced restaurant operators; preserve the warm Budda's brand system. DESIGN_VARIANCE 6, MOTION_INTENSITY 2, VISUAL_DENSITY 4. No new dependencies, brand tokens, claims, or photography.

## Severity-ordered plan

| Severity | Problem and user consequence | Files / components | Minimal change | Verification |
| --- | --- | --- | --- | --- |
| Blocker | Timeline and numerical FAQ claims have no recorded approval; promotion could mislead candidates. | `homepage-faq.tsx`, `docs/faq-content-approval.md` | Reuse the six existing answered homepage questions; remove only the form-length sentence. Hold new timeline wording for the client. | Compare each answer with baseline; no new financial, territory, or timing claim. |
| High | Topic selectors hide answered questions and add a second navigation task. | `homepage-faq.tsx`, `homepage-faq.css` | One accordion using native buttons, stable IDs, expanded state, and the existing brand styling. | Six nonempty answers, Enter/Space toggling, Tab order, visible focus, non-color expansion glyph, 44x44px mobile targets. |
| High | Hero inquiry is styled as a secondary link, competing with another filled action. | `page.tsx`, existing hero CSS | Promote the unchanged inquiry label and destination to the existing filled button style. | Primary inquiry visible at 1440x900 and 390x844; exact label and contact route. |
| High | Five support descriptions are repeated by 16 bullets plus four workspace features. | `page.tsx`, `operator-support.css` | Keep the existing sentences, not bullets. Fold workspace into supply/procurement; remove the aside and close the unused grid column. | Exactly five support items, one description per title, no nested lists or separate workspace block. |
| Medium | Repeated slogans, an actionless fit prompt, and layered photo captions lengthen scanning. | `page.tsx`, FAQ, final CTA, footer | Keep only the existing line "Good food brings people together." in closing. Remove divider slogans and the actionless prompt; captions use only existing labels. | One tagline; no orphan link or empty layout column; legal copy unchanged. |
| Medium | Form length and process count compete; the operating footprint appears late. | `page.tsx`, `process-content.ts` | Intro: "Four steps from inquiry to Discovery Day." Move the existing dynamic footprint fact beside the hero. | Four sourced stages in existing order; footprint once; fit check stays immediately below hero. |
| Medium | Operator login competes with the franchise inquiry in top navigation. | `navbar.tsx`, existing footer | Filter login from top navigation; preserve footer access and all primary navigation labels. | Desktop and expanded mobile menu omit login; footer retains login. |
| Optional | Gmail and richer operator proof need client input. | Existing footer / proof content | Flag branded address, operator quote, or opening plan; publish no replacements. | Email unchanged; no invented quote, plan, opening, or attribution. |

## Baseline captured before edits

- Browser: local `/franchise` at port 3003; reviewed all sections in the rendered desktop page and hero at 390x844.
- The hero was changed concurrently during inspection. Preserve the new composition, typography, and image; make only requested CTA, fact, and tagline changes.
- Eight decision sections: hero, fit, why, support, process, proof, FAQ, closing. Fit stays directly below hero.
- Six answered homepage FAQs existed behind three topic selectors. Preserve their wording; the post-inquiry answer loses its form-length sentence only.
- Process source has Initial Inquiry, Discovery Call, FDD Disclosure, Discovery Day (stages 1-4).
- Footer Gmail: `buddasbakery@gmail.com`. Footer login exists. Closing and registration-state disclaimers are recorded in existing content sources and must remain unchanged.
- Hero inquiry target at 390px: 242.44x44px, visible in the initial viewport, but styled as secondary. Primary was "Explore the Opportunity".
- No mobile horizontal overflow detected. Collapsed mobile controls measured at least 44x44px, excluding the visually hidden skip link, which requires a focused-state check.
- Baseline mobile text measurement: 176 rendered text elements, no contrast failures, minimum 4.94:1. Computed foreground/background colors were composited and evaluated using the WCAG sRGB formula. Text over imagery and gradient-specific pixels require separate visual review.
- Connected token registry and named contrast/element inspection tools are unavailable. Used the live page's CSS custom properties and computed styles instead. Colors: teal `#54BFA5`, dark teal `#1C5F56`, ink `#154942`, cream `#FFF8E8`, gold `#E9C559`, orange `#D36200`, cocoa `#5A3A1F`. Fonts: Poppins / DM Sans. Spacing tokens: 4, 8, 12, 16, 20, 24, 28, 32, 40px.

## Client decisions

1. Tagline: confirm "Good food brings people together." or supply a preferred existing brand line.
2. FAQ answers: approve existing wording, especially the cost/territory pointer and support claims; supply an approved timeline answer. Do not promote the unreviewed financial, territory, or timeline claims in the separate governed FAQ.
3. Proof: recommend a real operator quote with approved wording and attribution, or a verified opening plan. Neither is available for this pass.
4. Email: supply the branded replacement for `buddasbakery@gmail.com`; no address is guessed.

## Success criteria

- One tagline, in closing only.
- No more than five support items and no duplicate bullets.
- One accordion with at least five existing, answered questions; requested timeline topic remains explicitly pending client wording.
- Visible primary hero inquiry button at 1440px and 390px.
- All primary inquiries use "Request Franchise Information" and `/franchise/contact`.
- Existing section order, Opportunity links, brand identity, contact details, and both disclaimers preserved.
- Rendered checks cover text contrast, controls, keyboard, headings, and 390px layout. Automated suites, lint, typecheck, and build are not run under the standing workspace instruction.

## Implemented files

| File | Change |
| --- | --- |
| `src/app/franchise/page.tsx` | Remove divider slogans and actionless fit prompt; promote inquiry to the filled hero button; move sourced footprint beside hero; retain five support sentences and merge workspace into supply/procurement; clarify four-stage intro; use three existing proof labels as single-line captions. Preserve concurrently changed hero composition and assets. |
| `src/components/public/homepage-faq.tsx` | Replace topic navigation with six existing answered disclosures, real buttons, announced expanded state, associated hidden answer panels, and H3 question headings. |
| `src/app/franchise/homepage-faq.css` | Delete obsolete topic/brand/duplicate-resource styles; retain token-based colors, typography, and spacing; support mobile collapse, visible focus, and non-color expansion glyph. |
| `src/app/franchise/operator-support.css` | Scope the five-row, two-column icon/copy layout to the homepage; close the deleted aside/bullet columns. Preserve shared styles for other surfaces. |
| `src/app/franchise/concept-in-practice.css` | Style the existing photo labels as single-line captions. |
| `src/components/public/navbar.tsx` | Filter login from desktop and mobile top navigation, including CMS-supplied utility entries. |
| `src/components/public/footer.tsx` | Suppress the repeated tagline only on `/franchise`; retain contacts, legal text, and operator login. |
| `src/components/public/franchise-final-cta.tsx` | Place the existing brand line in simplified closing; use the canonical contact destination. Other CTA presentations retain their attribution behavior. |

## Rendered verification results

| Check | Evidence | Result |
| --- | --- | --- |
| Decision flow | Hero, fit, Why, support, process, proof, FAQ, closing in that order; zero empty sections | Pass |
| Hero at 390x844 | Inquiry button 334x56px, top 349.78px, bottom 405.78px, nowrap | Pass: visible in first viewport |
| Hero at 1440x900 | Inquiry button 349.41x56px, top 508.44px, bottom 564.44px | Pass: visible in first viewport |
| Primary CTA consistency | Five DOM anchor instances, each exactly `Request Franchise Information` and `/franchise/contact` | Pass |
| Slogans and proof fact | One closing tagline; footprint occurs once beside hero | Pass |
| Support | Five top-level rows; zero nested bullet lists; zero workspace asides | Pass |
| FAQ | Six nonempty original answers, zero topic tabs; first answer open initially; all six activated with keyboard | Pass; new timeline answer still needs approval |
| Keyboard | Enter collapses; Space reopens; Tab advances; opening another question closes the preceding panel; `aria-expanded` and panel visibility agree | Pass |
| Focus | Six FAQ triggers show 3px dark teal outline with 3px offset; all 24 visible mobile controls visited in Tab order retain visible outline/shadow | Pass |
| Mobile target sizes | Visible controls at least 44x44px, including expanded menu and footer operator links; FAQ buttons 350px wide and 58-80px tall; settled focused skip link 192.14x44px | Pass |
| Contrast at 390px | 106 rendered text elements; minimum 4.94:1; hero CTA 9.62:1; closing CTA 7.04:1 | Pass |
| Contrast at 768px | 110 rendered text elements; minimum 4.94:1 | Pass |
| Contrast at 1440px | 124 rendered text elements; minimum 4.94:1 | Pass |
| UI state contrast | FAQ outline / page 7.20:1; FAQ state icon uses same dark teal; menu glyph and primary control text use existing high-contrast tokens | Pass for inspected controls |
| Responsive layout | No horizontal overflow at 390, 768, or 1440px; inspected mobile hero/FAQ, tablet full page, desktop hero/support; all four main images loaded | Pass |
| Proof captions / navigation | Three desktop captions each 24px high on a 24px line-height; desktop primary nav links share the same top coordinate | Pass: single line |
| Login and trust | No top-bar login; expanded mobile footer login 350x44px; Gmail unchanged; both disclaimers unchanged | Pass |

Evidence files: `franchise-second-pass/measurements.json`, `skip-link.json`, `desktop-hero.png`, `mobile-hero.png`, `mobile-faq-focus.png`, and `tablet-page.png`. Keyboard focus and disclosure state were inspected in the rendered browser, not inferred from source alone. A browser extension interrupted the first review tab; a fresh review tab recovered the final evidence capture. No application console errors appeared in the final review tab; the only recorded error came from an unrelated browser extension's share panel.

Limits: no client approval is implied by retaining existing answers. No new timeline answer, quote, opening plan, or branded email was published. A live token registry, named design-verification services, full assistive-technology session, Lighthouse, build, lint, typecheck, and automated regression suites were not run. Preserve existing legal em-dashes verbatim as required by the keep-list, despite the frontend skill's general stylistic ban.

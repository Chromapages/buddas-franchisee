# Homepage vertical-spacing audit

Route: `/franchise`. Audit date: September 29, 2026.

Only vertical spacing changed. Copy, colors, typography, content, section order, horizontal widths, and photograph dimensions were preserved.

## Current-state inventory

Values are computed outer padding in pixels, shown as **top / bottom**. Existing 1px dividers are excluded from whitespace totals. All inspected section margins were zero.

| Section | 320px | 375px | 768px | 1024px | 1440px | 1920px |
|---|---:|---:|---:|---:|---:|---:|
| Hero | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| Qualification | 56 / 56 | 56 / 56 | 64 / 64 | 80 / 80 | 80 / 80 | 80 / 80 |
| Why Budda’s | 64 / 64 | 64 / 64 | 80 / 80 | 80 / 80 | 80 / 80 | 80 / 80 |
| Operator support | 64 / 64 | 64 / 64 | 64 / 64 | 64 / 64 | 86.4 / 86.4 | 96 / 96 |
| Process | 64 / 64 | 64 / 64 | 64 / 64 | 64 / 64 | 86.4 / 86.4 | 96 / 96 |
| Concept in practice | 64 / 64 | 64 / 64 | 64 / 64 | 64 / 64 | 86.4 / 86.4 | 96 / 96 |
| FAQ | 64 / 64 | 64 / 64 | 64 / 64 | 64 / 64 | 86.4 / 86.4 | 96 / 96 |
| Final CTA | 64 / 64 | 64 / 64 | 80 / 80 | 80 / 80 | 80 / 80 | 80 / 80 |
| Footer navigation | 20 / 8 | 20 / 8 | 20 / 8 | 64 / 32 | 64 / 32 | 64 / 32 |
| Footer legal | 12 / 8 | 12 / 8 | 12 / 8 | 28 / 28 | 28 / 28 | 28 / 28 |

The hero intentionally has zero outer padding to keep its photograph flush. Its text column previously added 56px per side at 320/375px, 80px at 768px, and 96px at 1024/1440/1920px. The qualification heading column also had an extra 40px per side on wide screens. The footer added another 24px below its legal section, plus the safe-area inset.

Outliers: qualification, Why Budda’s, and the final CTA used different section-edge rules. Support, process, proof, and FAQ combined matching top/bottom padding into 128–192px topic gaps. The footer navigation/legal handoff was the tightest transition at 20px on mobile, while its desktop gap reached 60px.

## Boundary findings

| Section boundary | Breakpoint | Current value | New value (token) | Reason |
|---|---:|---:|---|---|
| Hero → Qualification | 320px | 56px | 24px (`--home-space-related`) | Related introduction and qualification; use the smaller step. |
| Hero → Qualification | 375px | 56px | 24px (`--home-space-related`) | Related introduction and qualification; use the smaller step. |
| Hero → Qualification | 768px | 64px | 32px (`--home-space-related`) | Related introduction and qualification; use the smaller step. |
| Hero → Qualification | 1024px | 80px | 40px (`--home-space-related`) | Related introduction and qualification; use the smaller step. |
| Hero → Qualification | 1440px | 80px | 48px (`--home-space-related`) | Related introduction and qualification; use the smaller step. |
| Hero → Qualification | 1920px | 80px | 48px (`--home-space-related`) | Related introduction and qualification; use the smaller step. |
| Qualification → Why Budda’s | 320px | 120px | 48px (`--home-space-topic`) | Outlier below the dominant topic spacing; normalize from the scale. |
| Qualification → Why Budda’s | 375px | 120px | 48px (`--home-space-topic`) | Outlier below the dominant topic spacing; normalize from the scale. |
| Qualification → Why Budda’s | 768px | 144px | 64px (`--home-space-topic`) | Outlier below the dominant topic spacing; normalize from the scale. |
| Qualification → Why Budda’s | 1024px | 160px | 80px (`--home-space-topic`) | Outlier below the dominant topic spacing; normalize from the scale. |
| Qualification → Why Budda’s | 1440px | 160px | 96px (`--home-space-topic`) | Outlier below the dominant topic spacing; normalize from the scale. |
| Qualification → Why Budda’s | 1920px | 160px | 96px (`--home-space-topic`) | Outlier below the dominant topic spacing; normalize from the scale. |
| Why Budda’s → Operator support | 320px | 128px | 48px (`--home-space-topic`) | Loose stacked padding and viewport-driven drift. |
| Why Budda’s → Operator support | 375px | 128px | 48px (`--home-space-topic`) | Loose stacked padding and viewport-driven drift. |
| Why Budda’s → Operator support | 768px | 144px | 64px (`--home-space-topic`) | Loose stacked padding and viewport-driven drift. |
| Why Budda’s → Operator support | 1024px | 144px | 80px (`--home-space-topic`) | Loose stacked padding and viewport-driven drift. |
| Why Budda’s → Operator support | 1440px | 166.4px | 96px (`--home-space-topic`) | Loose stacked padding and viewport-driven drift. |
| Why Budda’s → Operator support | 1920px | 176px | 96px (`--home-space-topic`) | Loose stacked padding and viewport-driven drift. |
| Operator support → Process | 320px | 128px | 48px (`--home-space-topic`) | Loose double padding; same rhythm as equivalent topic pairs. |
| Operator support → Process | 375px | 128px | 48px (`--home-space-topic`) | Loose double padding; same rhythm as equivalent topic pairs. |
| Operator support → Process | 768px | 128px | 64px (`--home-space-topic`) | Loose double padding; same rhythm as equivalent topic pairs. |
| Operator support → Process | 1024px | 128px | 80px (`--home-space-topic`) | Loose double padding; same rhythm as equivalent topic pairs. |
| Operator support → Process | 1440px | 172.8px | 96px (`--home-space-topic`) | Loose double padding; same rhythm as equivalent topic pairs. |
| Operator support → Process | 1920px | 192px | 96px (`--home-space-topic`) | Loose double padding; same rhythm as equivalent topic pairs. |
| Process → Concept in practice | 320px | 128px | 48px (`--home-space-topic`) | Loose double padding; same rhythm as equivalent topic pairs. |
| Process → Concept in practice | 375px | 128px | 48px (`--home-space-topic`) | Loose double padding; same rhythm as equivalent topic pairs. |
| Process → Concept in practice | 768px | 128px | 64px (`--home-space-topic`) | Loose double padding; same rhythm as equivalent topic pairs. |
| Process → Concept in practice | 1024px | 128px | 80px (`--home-space-topic`) | Loose double padding; same rhythm as equivalent topic pairs. |
| Process → Concept in practice | 1440px | 172.8px | 96px (`--home-space-topic`) | Loose double padding; same rhythm as equivalent topic pairs. |
| Process → Concept in practice | 1920px | 192px | 96px (`--home-space-topic`) | Loose double padding; same rhythm as equivalent topic pairs. |
| Concept in practice → FAQ | 320px | 128px | 48px (`--home-space-topic`) | Loose double padding; same rhythm as equivalent topic pairs. |
| Concept in practice → FAQ | 375px | 128px | 48px (`--home-space-topic`) | Loose double padding; same rhythm as equivalent topic pairs. |
| Concept in practice → FAQ | 768px | 128px | 64px (`--home-space-topic`) | Loose double padding; same rhythm as equivalent topic pairs. |
| Concept in practice → FAQ | 1024px | 128px | 80px (`--home-space-topic`) | Loose double padding; same rhythm as equivalent topic pairs. |
| Concept in practice → FAQ | 1440px | 172.8px | 96px (`--home-space-topic`) | Loose double padding; same rhythm as equivalent topic pairs. |
| Concept in practice → FAQ | 1920px | 192px | 96px (`--home-space-topic`) | Loose double padding; same rhythm as equivalent topic pairs. |
| FAQ → Final CTA | 320px | 128px | 48px (`--home-space-topic`) | Final CTA used a different edge rule; normalize the boundary. |
| FAQ → Final CTA | 375px | 128px | 48px (`--home-space-topic`) | Final CTA used a different edge rule; normalize the boundary. |
| FAQ → Final CTA | 768px | 144px | 64px (`--home-space-topic`) | Final CTA used a different edge rule; normalize the boundary. |
| FAQ → Final CTA | 1024px | 144px | 80px (`--home-space-topic`) | Final CTA used a different edge rule; normalize the boundary. |
| FAQ → Final CTA | 1440px | 166.4px | 96px (`--home-space-topic`) | Final CTA used a different edge rule; normalize the boundary. |
| FAQ → Final CTA | 1920px | 176px | 96px (`--home-space-topic`) | Final CTA used a different edge rule; normalize the boundary. |
| Final CTA → Footer navigation | 320px | 84px | 48px (`--home-space-topic`) | Normalize the handoff to the existing footer without changing its content. |
| Final CTA → Footer navigation | 375px | 84px | 48px (`--home-space-topic`) | Normalize the handoff to the existing footer without changing its content. |
| Final CTA → Footer navigation | 768px | 100px | 64px (`--home-space-topic`) | Normalize the handoff to the existing footer without changing its content. |
| Final CTA → Footer navigation | 1024px | 144px | 80px (`--home-space-topic`) | Normalize the handoff to the existing footer without changing its content. |
| Final CTA → Footer navigation | 1440px | 144px | 96px (`--home-space-topic`) | Normalize the handoff to the existing footer without changing its content. |
| Final CTA → Footer navigation | 1920px | 144px | 96px (`--home-space-topic`) | Normalize the handoff to the existing footer without changing its content. |
| Footer navigation → Footer legal | 320px | 20px | 24px (`--home-space-related`) | Related footer groups; increase the tight mobile gap and reduce the loose desktop gap. |
| Footer navigation → Footer legal | 375px | 20px | 24px (`--home-space-related`) | Related footer groups; increase the tight mobile gap and reduce the loose desktop gap. |
| Footer navigation → Footer legal | 768px | 20px | 32px (`--home-space-related`) | Related footer groups; increase the tight mobile gap and reduce the loose desktop gap. |
| Footer navigation → Footer legal | 1024px | 60px | 40px (`--home-space-related`) | Related footer groups; increase the tight mobile gap and reduce the loose desktop gap. |
| Footer navigation → Footer legal | 1440px | 60px | 48px (`--home-space-related`) | Related footer groups; increase the tight mobile gap and reduce the loose desktop gap. |
| Footer navigation → Footer legal | 1920px | 60px | 48px (`--home-space-related`) | Related footer groups; increase the tight mobile gap and reduce the loose desktop gap. |
| Footer legal → page end | 320px | 32px | 24px (`--home-section-inset`) | Remove stacked legal/footer bottom padding; retain the device safe-area inset. |
| Footer legal → page end | 375px | 32px | 24px (`--home-section-inset`) | Remove stacked legal/footer bottom padding; retain the device safe-area inset. |
| Footer legal → page end | 768px | 32px | 32px (`--home-section-inset`) | Remove stacked legal/footer bottom padding; retain the device safe-area inset. |
| Footer legal → page end | 1024px | 52px | 40px (`--home-section-inset`) | Remove stacked legal/footer bottom padding; retain the device safe-area inset. |
| Footer legal → page end | 1440px | 52px | 48px (`--home-section-inset`) | Remove stacked legal/footer bottom padding; retain the device safe-area inset. |
| Footer legal → page end | 1920px | 52px | 48px (`--home-section-inset`) | Remove stacked legal/footer bottom padding; retain the device safe-area inset. |

## Proposed and implemented scale

`R = --section-rhythm`, an existing responsive token. The named scale has a constant **1:2 related-to-topic ratio**. Topic boundaries use `R / 2` on each adjacent edge, so the combined gap is `R`, rather than `2R`.

| Width | Existing R | Related (`--home-space-related`) | Topic (`--home-space-topic`) | Section edge (`--home-section-inset`) |
|---|---:|---:|---:|---:|
| 320px | 48px | 24px | 48px | 24px |
| 375px | 48px | 24px | 48px | 24px |
| 768px | 64px | 32px | 64px | 32px |
| 1024px | 80px | 40px | 80px | 40px |
| 1440px | 96px | 48px | 96px | 48px |
| 1920px | 96px | 48px | 96px | 48px |

The hero/qualification transition is a related gap: the flush hero contributes zero outer padding and qualification contributes one shared inset. Footer navigation/legal is also related: each side contributes `R / 4`. All other main section pairs use the topic gap. The existing intermediate 480px token continues to produce a 56px topic gap; no new breakpoint values were introduced.

Shared `.home-section` spacing replaces the one-off section padding utilities and viewport-based clamps. The homepage remains a flex column; margins are zero and nonzero section padding contains child margins. The footer overrides are scoped to the presence of `.franchise-home`, so other routes retain their footer spacing.

The `operator-support-section` class is also used by the candidate-profile surface. Its legacy padding is retained only when `.home-section` is absent, keeping that separate surface out of this homepage spacing change.

Using a small token scale follows the [USWDS spacing-token approach](https://designsystem.digital.gov/design-tokens/spacing-units/). Stronger separation between topics and tighter spacing inside related groups follows [USWDS whitespace guidance](https://designsystem.digital.gov/components/typography/). Flex layout and padded edges avoid the margin-collapse cases described by [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Box_model/Margin_collapsing). The exact values are page-specific design choices derived from the existing tokens.

## Final section-edge inventory

| Section | 320px | 375px | 768px | 1024px | 1440px | 1920px |
|---|---:|---:|---:|---:|---:|---:|
| Hero | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| Qualification | 24 / 24 | 24 / 24 | 32 / 32 | 40 / 40 | 48 / 48 | 48 / 48 |
| Why Budda’s | 24 / 24 | 24 / 24 | 32 / 32 | 40 / 40 | 48 / 48 | 48 / 48 |
| Operator support | 24 / 24 | 24 / 24 | 32 / 32 | 40 / 40 | 48 / 48 | 48 / 48 |
| Process | 24 / 24 | 24 / 24 | 32 / 32 | 40 / 40 | 48 / 48 | 48 / 48 |
| Concept in practice | 24 / 24 | 24 / 24 | 32 / 32 | 40 / 40 | 48 / 48 | 48 / 48 |
| FAQ | 24 / 24 | 24 / 24 | 32 / 32 | 40 / 40 | 48 / 48 | 48 / 48 |
| Final CTA | 24 / 24 | 24 / 24 | 32 / 32 | 40 / 40 | 48 / 48 | 48 / 48 |
| Footer navigation | 24 / 12 | 24 / 12 | 32 / 16 | 40 / 20 | 48 / 24 | 48 / 24 |
| Footer legal | 12 / 24 | 12 / 24 | 16 / 32 | 20 / 40 | 24 / 48 | 24 / 48 |

Hero text padding now uses the shared inset: 24 / 24px on phones, 32 / 32px at 768px, 40 / 40px at 1024px, and 48 / 48px on desktop. The qualification column’s extra vertical padding is removed. Footer safe-area padding remains; the duplicate fixed 24px footer bottom padding is removed on this route.

## Verification

- Checked 320, 375, 768, 1024, 1440, and 1920px.
- Every equivalent topic pair resolves to the same token at each width.
- No horizontal page overflow or clipped headings was found.
- Repeated section-position measurements stayed stable at all six widths; no layout shift was observed.
- Computed copy/type/foreground colors, section backgrounds, and figure dimensions matched the pre-edit audit. Intermediate background-alpha values on the existing animated footer contact links were normalized when comparing styles.
- Visual checks covered the mobile hero/qualification transition, mobile proof/FAQ transition, tablet support/process transition, desktop topic boundaries, and final CTA/footer handoff.
- Existing internal card padding and content-group spacing were retained.
- No lint, typecheck, build, or automated test suite was run, following the repository instruction for this task. Verification used the running local browser.

## Source files changed

- `src/app/franchise/homepage-spacing.css`
- `src/app/franchise/page.tsx`
- `src/app/franchise/operator-support.css`
- `src/app/franchise/development-path.css`
- `src/app/franchise/concept-in-practice.css`
- `src/app/franchise/homepage-faq.css`
- `src/components/public/homepage-faq.tsx`
- `src/components/public/franchise-final-cta.tsx`

Audit artifacts: `design-qa/homepage-spacing-audit.md`, `design-qa/homepage-spacing-audit.json`, and `.omx/state/franchise-spacing/ralph-progress.json`.

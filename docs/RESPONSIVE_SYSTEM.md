# Responsive System Governance

This document is the enforceable responsive reference for the franchise site.
The source of truth is `responsive.tokens.js`; Tailwind screens import
that registry, and `npm run verify:responsive` protects shell compliance.

## Canonical tiers

| Tier | Range | Gutters | Section block | Primary layout |
| --- | --- | --- | --- | --- |
| base | 0–479px | 16px | 48px | one column |
| phone | 480–639px | 24px | 56px | one column |
| compact | 640–767px | 24px | 56px | one or two columns |
| tablet | 768–1023px | 32px | 64px | fluid two-column collections |
| laptop | 1024–1279px | 32px | 80px | two/three columns or intentional spans |
| desktop | 1280–1447px | 32px plus container margin | 96px | three/four columns or intentional spans |
| wide | 1448px+ | 32px plus container margin | 96px | capped wide compositions |

Semantic container caps are invariant: form/narrow `40rem`, reading `48rem`,
detail `64rem`, default `75rem`, and wide `90rem`.

## Approved component-fit exceptions

| Exception | Threshold | Owner | Reason |
| --- | --- | --- | --- |
| hero | 67.25rem / 1076px | Franchise hero | First two-line desktop heading fit |
| nav | 77.8125rem / 1245px | Public navbar | First one-line navigation fit |
| hero-wide | 90.5rem / 1448px | Franchise hero | First 5/7-column heading fit |
| candidate actions | 36.375rem / 582px container | Candidate profile | First action-row fit |
| hero actions | 42.5rem / 680px container | Franchise hero | Keeps desktop actions stable |
| catalog | 48rem / 64rem container | Portal catalog | Product card reflow |
| portal split | 60rem container | Portal dashboard | Main-column, not viewport, fit |

No other raw responsive threshold is permitted without adding it to this table
and the registry.

## Enforcement

- Use `content-narrow`, `content-default`, `content-wide`, `section-standard`,
  and `page-rhythm` for page shells.
- Use `workspace-form`, `workspace-reading`, and `workspace-detail` for portal
  page widths.
- Use component primitives such as `surface-legal`, `portal-shell-main`, and
  future `cta-band` primitives instead of duplicating padding ladders.
- Use `fluid-card-grid`, `operator-proof-grid`, `process-meta-grid`, and
  `financial-card-grid` for repeatable collections.
- Run `npm run verify:responsive` before merging responsive changes.
- Raw dimensions are allowed only for documented component geometry and the
  approved exceptions above.

## Token naming

Follow the primitive → semantic → component structure documented in
`docs/DESIGN.md`. Token names use the `--bds-` prefix in CSS and DTCG-style
paths in the registry, for example `breakpoint.hero`, `container.detail`,
`grid.card.min`, and `component.portal.railWidth`.

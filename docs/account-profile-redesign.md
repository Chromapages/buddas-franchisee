# Account profile redesign

The profile uses an identity header, authorized-unit summary list, current-session area, and account-help footer. The redesign skill informed the separation of account context and actions, readable typography and removal of four nested generic tiles. Budda's existing teal, cream, gold, and fonts are preserved.

Unit details are retrieved only for IDs already authorized in the session. Each unit shows its available name, code, city/state and franchisee entity. The working unit is explicitly marked. Failed unit detail reads have a local reload affordance instead of discarding the entire profile. Session expiration uses the existing unit-timezone formatter and semantic time markup. The sign-out button uses the existing server action and adds pending feedback.

No self-service edit, password-change, multi-device session list, or role-management control was added: the inspected profile update action does not persist changes. Account corrections link to the existing support workspace. Existing authentication and logout implementation were not audited or changed in this visual task.

Reference: [GOV.UK summary list](https://design-system.service.gov.uk/components/summary-list/) for labeled, semantic key/value presentation. This established pattern is applicable in 2026.

## Verification

The authenticated desktop render displayed the approved name, email, role, authorized HNL-014 unit, city/state, franchisee entity, and formatted expiry. Contact support navigated to Operations Support. No logout or profile mutation was executed. Diff whitespace checks passed. No build, automated tests, exact-width matrix, or simulated unit-data failure was run.

Changed files: src/app/portal/account/page.tsx, src/components/portal/account-sign-out.tsx, src/app/globals.css (account-scoped styles), this report, and .omx/state/account-redesign/ralph-progress.json.

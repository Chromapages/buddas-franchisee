# Franchise homepage funnel analytics

## Measurement readiness

**73 / 100 — Usable with gaps.**

The event model now directly supports the requested franchise funnel questions, events use meaningful state changes, and browser verification confirms non-sensitive payloads. The score remains below measurement-ready because the repository exposes only an optional `dataLayer` bridge: no configured collector, consent configuration, dashboard, retention policy, or field delivery evidence is available here.

| Category | Score | Rationale |
| --- | ---: | --- |
| Decision alignment | 24 / 25 | Each event answers a stated funnel question. |
| Event model clarity | 18 / 20 | Views, intent, start, validated steps, and completion are distinct. |
| Data accuracy and integrity | 13 / 20 | Browser flow verified; production delivery and deduplication remain unverified. |
| Conversion definition | 14 / 15 | Completion fires only after the server action returns success. |
| Attribution and context | 7 / 10 | Sanitized UTM source/campaign and entry path persist per tab; no cross-device attribution is implemented. |
| Governance and maintenance | 7 / 10 | Events are typed, allow-listed, and documented; collector ownership and consent remain unverified. |

## Events

| Event | Trigger | Properties | Decision supported |
| --- | --- | --- | --- |
| `franchise_home_viewed` | Franchise homepage client mount | `viewport_group`, `entry_page`, optional sanitized `traffic_source`, `campaign` | Landing demand by width and source. |
| `franchise_hero_primary_clicked` | Explore the Opportunity link | Same context | Whether visitors explore before inquiry. |
| `franchise_hero_inquiry_clicked` | Start the 3-Step Inquiry link | Same context | Direct high-intent movement after the quieter secondary CTA. |
| `franchise_opportunity_viewed` | Opportunity-page client mount | Same context | Confirms opportunity exploration after hero intent. |
| `franchise_inquiry_started` | First user edit in the form | Context plus form version | Inquiry-start rate. |
| `franchise_inquiry_step_completed` | A step validates and the form advances | Context, form version, completed step number | Step abandonment by viewport group. |
| `franchise_inquiry_completed` | Server action returns success | Context and form version | Completed inquiry conversion. |

`cta_variant` is intentionally omitted because no active experiment is implemented. Add it only with a real experiment assignment.

## Privacy boundary

The franchise helper permits only viewport bucket, URL path, sanitized UTM source/campaign, form version, and step number. It never reads or emits names, email, phone, freeform answers, market interest, investment range, liquid capital, net worth, consent state, or any other applicant response.

UTM values are lowercased and accepted only when they match a 64-character `[a-z0-9._-]` token. This prevents raw query strings from becoming analytics payloads.

## How to use the data

- **Explore before inquiry:** measure ordered sessions where `franchise_hero_primary_clicked` and `franchise_opportunity_viewed` precede `franchise_inquiry_started`.
- **Secondary CTA simplification:** compare direct `franchise_hero_inquiry_clicked` rate and downstream inquiry starts by release cohort. This is directional only; causal attribution requires an actual experiment.
- **Photography placement:** compare opportunity-view and inquiry-start rates before and after a dated image-position release, segmented by viewport. Treat this as observational unless an experiment exists.
- **Abandonment by width:** within each vendor-provided session, calculate `franchise_inquiry_step_completed` and `franchise_inquiry_completed` divided by `franchise_inquiry_started`, grouped by `viewport_group`.
- **Completion rate:** `franchise_inquiry_completed / franchise_inquiry_started`, deduplicated by the existing analytics platform's session or user-pseudonymous identifier. No new identifier is created by this implementation.

## Verification

- Browser flow at 390px: homepage view → primary click → opportunity view → hero inquiry click → inquiry start → Step 1 completion.
- Confirmed payloads included `viewport_group: mobile`, `entry_page: /franchise`, `traffic_source: google`, and `campaign: next_buddas`.
- Confirmed payloads excluded the test name, email, phone, investment fields, net worth, and liquidity.
- `node --experimental-strip-types --test tests/franchise-inquiry-funnel.test.mjs tests/franchise-homepage-hero.test.mjs` passed: 7 tests, 0 failures.

Production analytics delivery, consent behavior, and field reports remain unverified until the existing host dataLayer collector is confirmed in its receiving environment.

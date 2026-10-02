# Franchise homepage hero claims audit

Audit date: 2026-09-07. Scope: `/franchise`, its hero, adjacent homepage sections, immediate conversion surfaces, and the primary opportunity destination. This is a source and rendered-output review, not legal advice.

## Release verdict

**DO NOT SHIP**

The hero contains no rendered financial-performance representation or artificial-urgency claim. Shipping is blocked by unapproved financial qualification figures and multiple dynamic, operating, qualification, process, and service claims without current source or completed review metadata.

## Release blockers

1. **Unapproved financial qualification figures render on the homepage.** `FranchiseFinalCta` imports `PUBLISHED_FINANCIAL_THRESHOLDS`, which is a deprecated alias of `UNAPPROVED_FINANCIAL_THRESHOLDS`, and unconditionally displays `$150K` minimum liquid capital and `$400K` minimum net worth. The governing record has no FDD edition, effective date, reviewer, review date, expiry, or approved placement. Its `approvedPlacements` array is empty.
2. **The two-store footprint is not backed by a reviewed public source.** The hero derives `2 Utah restaurants operating today` from a static list. The related seed script cites a public site but writes `verificationStatus: UNVERIFIED` and `verification.status: NOT_REVIEWED`. The count must not be treated as current production evidence until the records and operating status are reviewed.
3. **Qualification criteria are published without completed approval.** `FRANCHISE_CANDIDATE_CRITERIA.reviewedAt` is null and its status is `REQUIRES_LEGAL_AND_FRANCHISE_DEVELOPMENT_REVIEW`. Operate and Steward criteria, partnership duties, and the support-side summary still render. The Capitalize section correctly withholds its numbers, but the final CTA reintroduces them.
4. **Timing and response promises are unsupported.** `No obligation — takes under 2 minutes`, `Takes 2 minutes`, `Response in 48 hrs.`, and `In-House Corporate Review` render without durable approval evidence. The opportunity claims register explicitly lists the response SLA as `UNVERIFIED`.
5. **The homepage process summary conflicts with the governed process.** The final CTA presents `Inquiry / Review / Diligence / Onboarding`, while the governed public pre-award process is Initial Inquiry / Discovery Call / FDD & Diligence / Discovery Day. `Onboarding` also appears in `Direct leadership and operational onboarding throughout the evaluation`, an unverified support commitment.
6. **The adjacent advantage section overstates evidence.** `proven opportunity` and `product demand` render without a source record. Claims about training, ordering, consistent execution, teachable hospitality, support, and readiness-led growth require Brand, Operations, and Franchise Development confirmation before release.
7. **Hero image evidence is not approved.** The content matrix marks `buddas-about-storefront.png` and operating-location imagery as requiring source, date, location, rights, current-appearance, and Product Truth review.

## Claim-by-claim result

| Claim or representation | Category | Result | Evidence / required owner |
| --- | --- | --- | --- |
| `Build the Next Budda's.` | Brand positioning | REVIEW REQUIRED | No approval metadata in the homepage content source; does not promise a particular market. Brand and Franchise Development. |
| Hawaiian Bakery & Grill built around the Budda Roll | Product/concept | REVIEW REQUIRED | Qualitative, not financial; Product Truth and Brand approval are not attached. |
| `bakery-led differentiation` | Comparative positioning | REVIEW REQUIRED | No comparative evidence or review record is attached. |
| `2 Utah restaurants operating today` | Dynamic operating fact | FAIL | Static array; related source records remain UNVERIFIED/NOT_REVIEWED. |
| `Explore the Opportunity` | Navigation | PASS | Ordinary link to the informational opportunity route; no application or territory promise in the label. |
| `Start the 3-Step Inquiry` | Process fact | PASS for step count | The destination form implements Step 1, Step 2, and Step 3 and labels progress as `Step {step} of 3`. |
| `No obligation — takes under 2 minutes` | Legal/process/timing | FAIL | No timing study or legal approval record found. |
| `product demand` | Demand claim | FAIL | No current demand evidence or owner approval found. It is not an Item 19 claim as written, but it is unsupported business reasoning. |
| `proven opportunity` | Business validation | FAIL | No evidence record; can imply substantiated commercial validation. |
| Consistency, training, ordering, teachable hospitality | Operating/support | FAIL | No current operating specification, training record, or owner approval attached. |
| Ready-first growth language | Development policy | REVIEW REQUIRED | No approved readiness policy is attached; no revenue or return outcome is stated. |
| Multi-unit/high-volume experience criterion | Candidate qualification | FAIL | Candidate criteria status requires Legal and Franchise Development review; reviewedAt is null. |
| Product, standards, operating systems, and support supplied by Budda's | Support commitment | FAIL | No approved support-program source attached. |
| `$150K` liquid capital / `$400K` net worth | Financial qualification | FAIL | Values are explicitly unapproved and rendered outside the approved-placement gate. They are not financial-performance representations, but publication is not authorized by the current governance record. |
| 48-hour response and in-house review | Operating SLA/process | FAIL | Opportunity evidence register marks the response SLA UNVERIFIED. |
| Inquiry is not an application, territory reservation, or offer | Legal boundary | REVIEW REQUIRED | Meaning is consistently present in the conversion flow, but the evidence register still requires Franchise Legal and Development approval. |
| Artificial scarcity or urgency | Urgency | PASS | None found in the hero or adjacent homepage conversion content. |

## Financial-performance controls

- **PASS:** The `/franchise` hero and homepage do not render AUV, revenue, gross sales, earnings, profit, margin, ROI, return, payback, or high-return language.
- **PASS:** The linked opportunity page calculates `showItem19` through `isApprovedPublicFinancialPlacement(ITEM_19_GOVERNANCE, "item19")`. With the current empty approval metadata, AUV and margin data are not rendered.
- **PASS:** The linked opportunity page also withholds public Item 7 amounts while its placement approval is absent.
- **FAIL:** The final homepage CTA bypasses the same approval mechanism for candidate financial thresholds.
- **REVIEW REQUIRED outside this homepage scope:** `ITEM_19_FPR_DATA` contains raw AUV/revenue/margin figures, `faq-content.ts` contains `high-margin dayparts`, and the Why Budda's page states `strong unit economics`. These must remain blocked from unapproved publication and reviewed in their own release scopes.

## Dynamic-fact status

- Store count: **FAIL — current status unverified.**
- Territory availability: **PASS in the hero — no availability claim is made.** The linked opportunity page explicitly separates state offering status from specific market availability and says selection does not confirm or reserve a territory. Its broader release gate still fails.
- Inquiry-process step count: **PASS — three implemented steps verified.**
- Qualification criteria: **FAIL — review status incomplete.**
- Four-stage evaluation summary: **FAIL — homepage summary does not match the governed stage sequence.**

## Disclaimer preservation

- **PASS:** The footer still displays the informational, non-offer, registration-state/exemption disclaimer.
- **PASS:** The inquiry form states that it is an inquiry, not an application or franchise offer, and that it does not reserve a territory.
- The hero remains free of a legal-text block; the disclaimer stays discoverable in the footer and conversion flow.

## Evidence and commands

- `npm run verify:opportunity-release` — FAIL: 16 governed opportunity records are unverified and missing source records.
- `npm run verify:process-release` — FAIL: public process and legal fields lack required review dates/effective dates and remain under required review.
- Rendered `/franchise` inspection — confirmed store count, timing/SLA statements, `$150K`, `$400K`, `proven opportunity`, and onboarding/support wording are public.
- Rendered `/franchise/the-opportunity` inspection — confirmed Item 19/AUV/margin values are withheld and the inactive investment-disclosure presentation is shown.
- Source inspection — confirmed the footer and inquiry non-offer language remain present.

## Required approvals before release

- Franchise Legal and Franchise Development: financial qualification figures, inquiry boundary, timing language, and all governed opportunity/process records.
- Operations and Brand: Budda Roll/product differentiation, demand, consistency, training, hospitality, systems, and support statements.
- Business/location owner: current store list, operating status, source date, and public placement approval.
- Brand/Product Truth/rights owner: operating photograph source, location, date, rights, and current-product accuracy.

No public copy was changed during this audit.

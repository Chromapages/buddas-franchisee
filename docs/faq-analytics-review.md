# FAQ analytics review workflow

Review aggregated FAQ events monthly with Franchise Development and Legal. Do not use
engagement to personalize FAQ content or automatically reorder financial, legal, or
territory information.

## Inputs

- `faq_search`: approved search-topic ID, result count, and no-result status.
- `faq_search_cleared`: search abandonment signal without query text.
- `faq_filter_applied`: selected filter ID and resulting count when filtering is enabled.
- `faq_open`, `faq_close`, `faq_open_all`, `faq_close_all`: FAQ ID, category, position, and result count.
- `faq_deep_link_click`: FAQ ID and destination ID.
- `faq_helpfulness_feedback`: FAQ ID, category, position, and Yes/No response.
- `faq_print` and `faq_inquiry_cta_click`: visible-result count and destination context.

## Review questions

1. Which approved search-topic IDs repeatedly produce no results?
2. Which questions are frequently opened or followed to deeper pages?
3. Which answers receive disproportionately negative helpfulness feedback?
4. Does any high-engagement answer have `REQUIRES_LEGAL_AND_FRANCHISE_DEVELOPMENT_REVIEW` governance?

## Guardrails

- Never collect raw searches, answer text, financial data, or inquiry responses in FAQ events.
- Treat `other` no-result searches as an aggregate gap signal; do not attempt to reconstruct user queries.
- Content additions, changes, and legal/financial promotion require the documented content-owner review.

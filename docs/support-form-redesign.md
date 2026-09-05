# Operations support form

The ticket card now separates entry fields from unit context and writing guidance. It retains Budda's teal, cream and white workspace styling. The previous duplicate Open New Ticket control is removed while composing. Topic options are shared between the UI and server validation and require an intentional choice.

Subject and description are controlled inputs so failed submissions retain entered text. Visible hints remain present while typing. Topic selection adjusts the description hint. Required-field validation focuses an error summary and associates specific messages with the affected fields. Limits are 160 characters for subject and 5,000 for description, checked on the server as well as the browser. The submit action verifies the form's unit against the authenticated active unit. Ticket payload text is no longer copied into success audit metadata.

The success state contains a ticket reference, unit, subject and a View ticket link to the existing scoped conversation workspace. Pending state disables repeat submission. No new priority, attachment, response-time promise or routing workflow was introduced.

## References

- [GOV.UK textarea guidance](https://design-system.service.gov.uk/components/textarea/): visible labels, associated hints and errors.
- [W3C form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/): clear correction guidance and success feedback.

The redesign skill informed hierarchy and removal of repeated controls. These established form practices remain applicable in 2026.

## Verification

Rendered in the authenticated in-app browser. An empty submission produced the error summary and individual topic/subject/description errors without creating a ticket. Selecting Equipment & oven maintenance changed the hint and cleared the topic error. No successful ticket write was exercised, and no build or automated suite was run under the working agreement. Exact viewport/zoom matrix and simulated provider failure remain unverified. Diff whitespace check passed.

Changed files: support-form.tsx, support-workspace.tsx, globals.css (support-scoped styles), support-form-options.ts, actions.ts (support creation validation and audit metadata), this report and the saved visual verdict.

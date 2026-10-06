# Replace opportunity slogan with useful actions

Design read: preserve the franchise opportunity section and replace only its crossed-out left-column slogan with practical next steps. Dials: variance 4, motion 1, density 4. Use existing typography, section palette, button radius, spacing tokens, and navigation destinations.

| Change | Success criteria |
| --- | --- |
| Remove the script slogan and accompanying tagline from the opportunity introduction | Neither string remains in this introduction; shared script styles remain available to operator support. |
| Add a primary inquiry CTA | “Request Franchise Information” links to the existing `/franchise/contact` route and uses the established inquiry label. |
| Add an outlined process CTA | Use the existing “Explore the full development process” label and `/franchise/process` destination. Give it lower visual emphasis than inquiry. |
| Stack actions in the left column | Use the existing divider and spacing tokens; labels stay on one line, targets are at least 44px tall, and phone actions fill available width. |
| Verify the scoped change | Browser inspection at 390, 768, and 1440px: no overflow, both destinations correct, text contrast at least 4.5:1, visible keyboard focus, candidate-profile CTA and all three criteria preserved. |

Implementation: edit `src/app/franchise/page.tsx` and `src/app/franchise/homepage-opportunity.css`. Use native Next.js links; do not reuse the hero-only analytics component for another section. Delete obsolete signoff-only styles; retain shared script/tagline rules. No new dependencies, images, client components, or form logic. Loading/disabled states are not applicable to these navigation links.

Verification uses rendered DOM, computed styles, WCAG contrast calculations, and screenshots. No connected token registry or dedicated contrast checker is available; repository CSS tokens are the source. No build, lint, typecheck, automated tests, or static analysis requested. This implementation plan is not an AI-facing prompt/spec.

## Completed implementation and evidence

Updated the two scoped source files. Replaced the signoff with stacked primary/outlined links and deleted three obsolete signoff-only CSS rules. Shared script styles remain because operator support still uses them. No dependencies, image generation, client components, or new analytics events.

Browser inspection confirms no horizontal or button overflow at 390, 768, and 1440px. Both buttons are 56px tall and labels remain on one line. All three numbered criteria and the candidate-profile action remain. Both buttons show a visible 3px keyboard outline with a contrasting shadow.

Default text contrast: primary 7.39:1 and secondary 7.68:1. Hover contrast calculated from the declared states and live token values: primary 9.62:1 and secondary 6.73:1. Actual clicks open `/franchise/contact` (franchise inquiry page) and `/franchise/process` (pre-award mutual evaluation process). No form data entered or submitted.

Screenshots: `artifacts/homepage-opportunity-ctas-desktop-1440.jpg` and `artifacts/homepage-opportunity-ctas-mobile-390.jpg`. Visual verdict: 95/100, qualitative review, stored in `.omx/state/opportunity-intro-ctas/ralph-progress.json`. No remaining scoped issues found; automated checks were not run.

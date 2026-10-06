# Homepage FAQ reference plan

Reading this as a warm, practical franchise FAQ with a highlighted open answer and clear onward links. Reuse existing Next Link, React accordion state, Lucide icons, site fonts, homepage sizing tokens, and six existing questions. Design dials: variance 4, motion 1, density 4.

1. Add “Answers for what's next” above the left heading; keep the existing introduction and shared heading scale. Omit the reference's script slogan, associated decorative signoff, and background foliage.
2. Give the investment/territory card its small label, document icon, and outlined “View opportunity details” link to the existing opportunity page.
3. Highlight the expanded question with pale teal fill, rounded corners, and a teal left border. Keep collapsed rows separated by fine rules and plus-circle controls. Preserve button/panel IDs, ARIA state, single-open behavior, and the initially open fit answer.
4. Use the supplied expanded fit copy and add its candidate-profile link to the verified `/franchise/the-opportunity#mutual-operator-fit` destination. Keep other answers unchanged.
5. Add the bottom conversation icon, short inquiry prompt, and filled Request Franchise Information action. Stack appropriately on smaller screens and keep controls accessible.
6. Browser-check desktop, tablet, laptop, and phone widths; inspect overflow, keyboard focus, accordion switching/collapse, and the three link destinations. Save screenshots and a visual verdict. No build, lint, typecheck, automated tests, or static analysis requested.

Write scope: `src/components/public/homepage-faq.tsx` and `src/app/franchise/homepage-faq.css`. No new dependencies, photos, abstractions, or state. Main fidelity limit: existing site fonts rather than exact reference lettering. Preserve unrelated homepage changes.

## Completed implementation and evidence

Changed the two scoped files. Reused the existing accordion state and ID/ARIA relationships. Added the supplied candidate copy, profile link, card label and outline action, open-panel styling, and inquiry row. No script text, foliage, new dependencies, or duplicated mobile/desktop components.

Browser checks confirmed six questions, only one visible answer when switching, all answers hidden when collapsing, keyboard Enter opening, and a visible 3px focus outline. No horizontal overflow at 390, 768, 1024, or 1440px; phone question buttons measure at least 60px tall. Desktop heading remains 48px and section height is 727px.

All three links were opened and verified: the opportunity page, its `#mutual-operator-fit` section, and the contact page with the inquiry form. No form was submitted. Final desktop screenshot: `artifacts/homepage-faq-reference-1440.png`. Visual verdict: 92/100, a qualitative comparison, persisted under `.omx/state/homepage-faq-reference/ralph-progress.json`.

No build or automated checks run under workspace instructions. Phone and tablet responsive geometry was verified through rendered DOM measurements; full phone-section screenshot capture exceeded the browser tool's capture deadline on the long homepage. Existing fonts, scale, and Lucide icon shapes are the remaining visual differences from the reference.

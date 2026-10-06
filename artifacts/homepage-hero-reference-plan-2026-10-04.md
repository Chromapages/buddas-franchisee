# Homepage hero reference implementation

Mode: DESIGN. Scoped visual redesign, preserving the navbar and every subsequent section.

Reading this as: a franchise landing page for prospective restaurant operators, with warm bakery photography, bold teal typography, and a curved cream panel.

## Design approach

Use the existing Next.js, Tailwind 3, Poppins, DM Sans, Lucide icons, and tracked hero links. No dependencies. Dials: DESIGN_VARIANCE 7, MOTION_INTENSITY 3, VISUAL_DENSITY 3. No automatic animation.

Use existing CSS color and spacing tokens, including brand sand for the reference's cream, teal ink for the headline and CTA, cocoa for body text, and clay for supporting text. Verify rendered contrast before accepting pairings. No connected design-token registry is exposed; local CSS tokens and browser computed styles are the available sources.

The user's reference explicitly authorizes its hero copy, icon rail, bottom tagline, and light theme. These override the skill's default hero text limit and dual-theme requirement for this narrowly scoped reproduction. Keep these additions compact on smaller screens. Reuse the existing decorative palm asset if suitable.

## Implementation sequence

1. Audit the rendered hero, existing CSS tokens, font setup, image, and tracked link components.
2. Prepare a photo-only bakery asset from the provided reference. Keep actual heading, buttons, and labels in HTML.
3. Replace only the rendered homepage hero markup and introduce a hero-scoped stylesheet. Use a curved CSS panel over a full-bleed photograph on desktop. Preserve the heading ID and tracked links.
4. Below 1024px, stack copy and an uncropped product photograph. At 390px and 768px, ensure readable typography and accessible actions.
5. Inspect rendered output, contrast, control dimensions, keyboard focus, image loading, and navigation destinations at 390px, 768px, and 1440px. Compare screenshots to the supplied reference and persist a Visual Verdict.

## Evaluation / success criteria

| Area | Acceptance |
| --- | --- |
| Scope | Navbar and all following homepage sections remain unchanged. |
| Desktop | Two-line uppercase headline; curved cream/photo split; full product visible; pill primary action; underlined secondary action; three icon labels and bottom tagline. |
| Responsive | No horizontal overflow at 390px, 768px, or 1440px. Desktop actions fit within the initial viewport at 1440x900. |
| Accessibility | One semantic h1; useful image alt text; decorative icons hidden from assistive technology; visible keyboard focus; actions at least 44x44px; text contrast at least 4.5:1. |
| Engineering | Next Image with priority and reserved geometry; existing tracked navigation wrappers; no dependencies or scroll listeners. |
| Verification | Browser evidence and a recorded visual comparison. No lint, typecheck, automated tests, or static analysis after edits per workspace instructions; no build requested. |

## Risks and exclusions

The photograph is generated visual material, not documentary evidence of an operating location. Matching the reference font exactly would require a different font; retain the site's existing fonts. The unchanged navbar prevents reproducing the reference's combined navbar/hero silhouette. Lighthouse and formal WCAG certification are outside the authorized verification scope.

## Final evidence

The merged hero was inspected at 390x844, 768x1024, 1024x900, and 1440x900. No horizontal overflow. Primary and secondary controls measure 56px and 44px high. Primary action contrast: 9.62:1. Body text: 9.47:1. Supporting accent text: 4.94:1. Keyboard navigation produces a 3px visible outline with a 3px offset and contrasting surrounding shadow. A semantic h1 and successfully loaded hero photograph were confirmed in the rendered DOM.

Evidence: `homepage-hero-reference-desktop-1440.png`, `homepage-hero-reference-mobile-390.png`, `homepage-hero-reference-tablet-768.png`, and `homepage-hero-reference-keyboard-focus.png` in this directory. Visual comparison score: 92/100, a qualitative design judgment, not a performance measurement. No build, automated tests, lint, typecheck, static analysis, or Lighthouse was run.

Concurrent edits from a separate content task promoted Request Franchise Information to the filled primary action, added the existing operating-footprint fact, and removed the hero tagline. These edits were preserved and the merged hero was rechecked. Changes elsewhere on the homepage belong to that separate task. This implementation did not edit the navbar.

Simplifications: native CSS clipping instead of SVG or animation dependencies; existing tracked links, fonts, and icons; one optimized 214KB WebP photo; no duplicated desktop/mobile hero components. The unsuitable photographic palm decoration was omitted.

## Image generation record

Saved asset: `public/images/homepage-hero-bakery-reference.webp`. Created with built-in image generation using the user-supplied reference, then encoded as WebP with the already-installed Sharp package. The original generated PNG remains in its original location.

Prompt:

> Use case: precise-object-edit. Edit target: supplied Budda's homepage reference. Produce only a photorealistic bakery food photograph to use behind a coded website hero. Remove all website UI, all cream graphic panels, all headings, all navigation, all buttons, all vector icons, all labels, and all decorative leaf graphics. Fill those removed areas with continuation of the same warm Hawaiian bakery café and wooden tabletop. Preserve as closely as possible the reference's exact signature Hawaiian roll with glossy golden-brown top and fluffy open crumb on a white ceramic plate, warm natural window light, softly blurred woven pendant lamps, green tropical plants and a white Budda's coffee mug behind the roll toward upper right. Keep the entire roll and plate visible. No front-end layout or text overlays. No text on café wall. A subtle Budda's mark on mug is allowed as in reference. Make a landscape photograph 3:2, with the roll on the center-right, roll top around 35 percent from top, plate at 80 percent from top, and generous café context above. Left 25 percent is background only and will sit under a CSS cream overlay. Strong realistic food texture, natural lighting, not artificial rendering. This should look like the reference photographic right panel extended into a full photo, not a newly styled scene.

# Homepage development path reference plan

Reading this as a warm franchise process overview for prospective operators, using a four-stage photographic timeline. Use native CSS, existing Poppins/DM Sans, Lucide, Next Image, and the governed four-stage process source. Design dials: variance 4, motion 1, density 4.

1. Keep the existing semantic section heading, ordered stages, public titles, descriptions, and `/franchise/process` destination.
2. Extend homepage presentation metadata with the reference's short stage labels, illustrative photos, and outcome statements. No application state or new timing promises.
3. Use large pale numbers beside icon circles, small labels above titles, landscape photos, descriptions, and alternating pale teal/gold outcome panels. Add arrows between stages on desktop.
4. Add a bottom divider with a small existing leaf icon, “Same values. Brighter tomorrows.” and “Explore the full development process.” Do not render the script slogan or background foliage.
5. Match shared homepage heading, introduction, container, and section-padding tokens. Four columns at desktop, two on tablets, one on phones. Preserve useful photo framing and a full-width phone action.
6. Inspect screenshots and rendered image loading, overflow, and the action destination at 390, 768, 1024, and 1440px. Persist visual-verdict evidence. No build, lint, typecheck, automated tests, or static analysis requested.

Assets: generate the missing laptop-inquiry, phone-call, and disclosure-document illustrations with the built-in imagegen tool; reuse an appropriate existing Discovery Day image. Store web-sized assets in `public/images`. Generated scenes illustrate stages rather than documenting actual prospects or a legal document.

Scope: `src/app/franchise/page.tsx`, `src/app/franchise/development-path.css`, and required image assets. Keep unrelated in-progress changes intact. Main fidelity differences will be shared site fonts and illustrative photo variations from the reference.

## Implementation and verification

Implemented the four photographic stages, pale numbers, icon circles, stage labels, descriptions, equal-height outcome panels, connecting arrows, and footer action. Omitted the script text and background foliage. Reused existing components, process data, fonts, icons, CSS tokens, and Discovery Day image; no dependencies or client-side state added.

Browser-verified at 390, 768, 1024, and 1440px: no horizontal overflow; one, two, two, and four stage columns respectively. All four images load and all four outcomes render. At desktop, the 48px heading matches the homepage scale and the four 88px outcome panels align. The phone action is 67px tall, keyboard focus is visible, and the link opens `/franchise/process`, headed “Budda's Pre-Award Mutual Evaluation Process.” No build or automated checks run. Screenshot evidence is stored in `artifacts/homepage-development-path-desktop-1440.png`, `artifacts/homepage-development-path-390.png`, and `artifacts/homepage-development-path-768.png`. Visual verdict: 92/100, a qualitative judgment.

Known limits: images illustrate the stages and vary from the reference. Discovery Day reuses the existing bakery-window scene rather than the reference's sign. The generated disclosure cover is illustrative artwork, not the actual legal document.

## Image-generation record

Built-in imagegen was used. Final project assets, encoded with the already-installed Sharp package at 960px wide, WebP quality 82:

- `public/images/development-path-inquiry.webp` (42,186 bytes)
- `public/images/development-path-call.webp` (43,326 bytes)
- `public/images/development-path-disclosure.webp` (50,458 bytes)

Original generated PNGs were retained in `C:/Users/ericb/.codex/generated_images/01a10d10-b184-7c90-bca6-21382cce992b/`.

Final prompts:

**Inquiry:** Use case: photorealistic-natural. Create a single landscape editorial photo for a Hawaiian bakery franchise website's Initial Inquiry stage. Tight side-on composition: hands of an adult wearing dark sleeves typing on a slim silver laptop on a warm wooden table, a white ceramic coffee mug with a small elegant dark teal Budda's wordmark in the foreground at right. Natural warm window light, shallow depth of field, blurred green plant at left, restrained cream and teal brand palette, real skin and material texture. Subject centered so both the hands, keyboard, and mug remain clear in a 2:1 website crop. No webpage UI, no overlays, no captions, no frames or collage. Landscape 3:2 photo.

**Call:** Use case: photorealistic-natural. Create a single landscape editorial photo for a Hawaiian bakery franchise website's Discovery Call stage. Tight side profile crop of an adult prospective restaurant operator wearing a dark charcoal casual shirt, holding a black smartphone to their ear with their right hand. Face mostly outside the frame; focus on realistic fingers, phone, ear, neck and shoulder. Warm softly lit interior, blurred green plants and tan wood in background, natural window light, shallow depth of field, calm professional mood. Subject centered to work in a 2:1 website crop. No text, no webpage UI, no overlays, no captions, no frames or collage. Landscape 3:2 photo.

**Disclosure:** Use case: product-mockup. Create a single landscape editorial photograph illustrating reviewing a franchise disclosure document, not a reproduction of a legal document. A neat stack of white pages on a warm wooden table, angled gently diagonally from lower left to upper right. On the upper center of the cover a small elegant dark teal Budda's wordmark, with smaller dark teal HAWAIIAN beneath it. Near the lower center, only the title FRANCHISE DISCLOSURE DOCUMENT in small dark teal uppercase letters. No other text, no seal, no signature, no financial figures. Warm natural light, blurred green plant in background, realistic paper texture, soft shadows and shallow depth of field. Keep the cover title and wordmark visible within a central 2:1 website crop. No webpage UI, no overlays, no captions, no frames or collage. Landscape 3:2 photo.

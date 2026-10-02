# Budda's franchise homepage SEO audit

Audit scope: local rendered `/franchise` page and its repository implementation on 2026-09-07.

## Result

The homepage now has one canonical indexable route, one HTML H1, equivalent primary mobile and desktop copy, page-specific social metadata, safe Organization/WebSite structured data, and crawlable internal links. No unsupported financial, review, rating, market-availability, or franchise-specific schema was added.

## Verified implementation

| Area | Result | Evidence |
| --- | --- | --- |
| Title | PASS | Rendered title: `Budda's Franchise Opportunity | Hawaiian Bakery & Grill`. |
| Meta description | PASS | Rendered description names the Hawaiian Bakery & Grill, Budda Roll, and franchise opportunity without performance or territory claims. |
| Canonical | PASS | `/franchise` renders `https://buddasfranchise.com/franchise`; query state does not enter the canonical. |
| Duplicate homepage | PASS | `/` now returns a permanent 308 redirect to `/franchise` instead of rendering a second copy. |
| Robots metadata | PASS | Rendered page emits `index, follow`. Production robots configuration excludes private routes and does not disallow `/franchise`; preview environments deliberately disallow crawling. |
| Sitemap | PASS | `/franchise` is present; the duplicate root homepage entry is absent. |
| H1 | PASS | Rendered HTML contains exactly one `<h1>`. Desktop and mobile both expose the same level-one heading to the accessibility tree. |
| Responsive content | PASS | Both presentations read from `PRIMARY_HERO_COPY`; the eyebrow and support remain HTML text. There is no mobile-specific URL. |
| Open Graph | PASS technically | Page-specific title, description, canonical URL and 1200×630 PNG render. Image alt accurately identifies the wordmark preview. |
| Twitter | PASS | `summary_large_image` renders with matching page-specific title, description, image and alt. |
| Structured data | PASS for inspected source | One JSON-LD script renders Organization and WebSite nodes. No invented franchise, review, rating, financial, FAQPage, QAPage, or HowTo type is present on this page. |
| Hero actions | PASS | The opportunity and inquiry destinations are ordinary descriptive links. Decorative arrows are hidden from assistive technology. |
| Internal routes | PASS | Opportunity, process, FAQ, qualification-anchor route, and inquiry route each returned HTTP 200 locally. |
| Images | PASS for markup | Mobile operating photo uses explicit dimensions, responsive `sizes`, and meaningful alt text. Desktop illustration is decorative and contains no unique copy. All primary meaning is equivalent HTML text. |

## Changes made

- Replaced inherited social copy that referred to `territory clearance` with the page's accurate description.
- Added page-specific Open Graph and Twitter metadata.
- Added explicit public indexing directives and preserved the self-referencing canonical.
- Consolidated desktop and mobile primary hero copy and changed the desktop visual heading to an accessible level-one role, leaving one HTML H1.
- Permanently redirected the duplicate `/` rendering to `/franchise` and removed the duplicate root sitemap entry.
- Removed `iconic`, `scalable`, and `high-yield` language from inherited public metadata and schema descriptions.

## Remaining verification

- **UNVERIFIED:** Google Search Console indexing, sitemap submission status, coverage, search performance, and live production headers.
- **UNVERIFIED:** social-platform cache previews after deployment.
- **UNVERIFIED:** rights and final brand approval for `public/images/og-image.png`; the repository content matrix marks its approval record as required.
- The desktop and mobile hero images are visually different but carry no unique textual claims. A future asset change should preserve that semantic equivalence and existing approval governance.

## Tests run

- `node --experimental-strip-types --test tests/franchise-homepage-hero.test.mjs tests/portal-security-anti-seo.test.mjs` — 15 passed, 0 failed.
- Rendered-head inspection with `Invoke-WebRequest http://localhost:3000/franchise` — one H1, one JSON-LD script, correct title, description, canonical, robots, Open Graph, and Twitter tags.
- `Invoke-WebRequest` for opportunity, process, FAQ, qualifications, and contact destinations — all HTTP 200.
- `git diff --check` for the scoped implementation files — passed; Git reported only existing LF-to-CRLF working-copy notices.

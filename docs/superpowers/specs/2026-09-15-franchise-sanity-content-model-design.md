# Franchise Sanity Content Model

## Purpose

Make the existing franchise homepage and shared franchise-site settings editable in the embedded Sanity Studio at `/studio`, without allowing editors to alter page composition or bypass current runtime safeguards.

## Scope

Two singleton documents are the editorial source of truth:

- `homepage`: the fixed `/franchise` sections—SEO, hero, current footprint, advantage/proof, candidate profile, and closing CTA.
- `siteSettings`: organization data, navigation, global inquiry CTA, footer contact/legal/navigation, default SEO, and the data used by structured data.

The existing TypeScript modules remain the fallback when either Sanity query fails or a document is unpublished. The design does not add a page builder, Visual Editing, Draft Mode, or content management for unrelated franchise routes.

## Content and runtime model

`src/features/cms` owns GROQ queries, schema-shaped TypeScript types, defensive parsers, image URL creation, and merge functions. Server components read the published singleton documents, merge only valid Sanity fields into their equivalent fallback data, and pass resolved props into the current responsive presentational components. Client analytics, routes, CSS classes, and accessibility semantics stay unchanged.

`homepage` stores responsive and shared fields separately only where the current UI already differs by breakpoint. Images are Sanity image fields with hotspot support and required alt text. `siteSettings` owns both primary and utility navigation, footer groups, contact/legal values, and organization/SEO values; URL fields are constrained to safe internal paths, `mailto:`, `tel:`, or HTTPS destinations.

The Studio structure presents the two singletons as fixed document IDs. It prevents a second Home Page or Site Settings document from being created. The initial Studio documents are created with the current approved hard-coded content so publishing them does not change the live page.

## Cache and publishing

The Next.js server fetch layer uses `next-sanity` with public, published-content reads and stable tags. It has no hard dependency on a token. The app serves fallback content if environment configuration or Content Lake access is unavailable. A protected webhook endpoint can be added later for instant revalidation; this first implementation uses a bounded time-based revalidation interval to avoid introducing an unpublished secret or external webhook configuration.

## Acceptance criteria

1. `/studio` lists exactly one Home Page and one Site Settings editor.
2. Each schema enforces required copy, image alternative text, link labels, and supported URL shapes at publish time.
3. The published Sanity documents resolve to `/franchise` and the franchise layout without changing the existing section order, analytics event names, route destinations, or mobile/desktop component split.
4. With missing environment configuration, no published documents, malformed data, or a failed Sanity request, the website uses the present hard-coded content without an exception.
5. Homepage and site settings documents contain current approved copy at creation time.
6. The existing Next build/typecheck remains green after the integration.

## Risks and mitigations

- **Content drift:** use one named field model and a seed source derived from current content; leave fallback as a deliberate emergency path.
- **Unsafe editor-entered links:** validate URL shapes both in Studio and at runtime, retaining fallback values for invalid data.
- **Incomplete publishing:** mandatory schema fields prevent publishing sparse singleton documents; runtime merge remains field-level defensive.
- **Cache lag:** use short, explicit server revalidation and reserve signed webhook revalidation for a follow-up that can safely configure a secret.

## Out of scope

- Page section reordering or arbitrary blocks.
- CMS ownership of all franchise subpages.
- Draft previews and visual editing.
- Automated external-image migration.

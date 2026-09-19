# Franchise Sanity Content Model Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the fixed franchise homepage and shared franchise-site settings editable from the embedded Sanity Studio while preserving current runtime behavior as a fallback.

**Architecture:** Add two singleton Studio schemas and a typed, server-side `next-sanity` content boundary. The boundary reads published documents, validates and merges them into existing fallback data, and supplies the existing responsive homepage, header, footer, metadata, and structured-data components through props.

**Tech Stack:** Next.js App Router, TypeScript, Sanity Studio 6, next-sanity, GROQ, Zod.

---

### Task 1: Define the Studio content contract

**Files:**

- Create: `sanity/schemaTypes/homepage.ts`
- Create: `sanity/schemaTypes/siteSettings.ts`
- Create: `sanity/schemaTypes/objects.ts`
- Modify: `sanity/schemaTypes/index.ts`
- Modify: `sanity.config.ts`

**Step 1:** Define reusable `link`, image-with-alt, SEO, nav, and footer object fields with required labels and URL validation.

**Step 2:** Define the `homepage` and `siteSettings` document types, grouped editor fields, required validation, and previews.

**Step 3:** Configure the Structure tool so each document opens at its fixed singleton ID and cannot be duplicated.

### Task 2: Add a defensive published-content boundary

**Files:**

- Create: `src/features/cms/client.ts`
- Create: `src/features/cms/queries.ts`
- Create: `src/features/cms/types.ts`
- Create: `src/features/cms/content.ts`
- Test: `tests/sanity-content-fallback.test.mjs`

**Step 1:** Write failing assertions for unavailable, malformed, and valid CMS values resolving to the expected fallback/override output.

**Step 2:** Configure a no-token public `next-sanity` client and the two singleton GROQ queries.

**Step 3:** Parse data with Zod, permit only safe link protocols, build Sanity image URLs, and deep-merge valid values over existing fallback content.

**Step 4:** Run the focused test and confirm it passes.

### Task 3: Supply CMS content to existing franchise UI

**Files:**

- Modify: `src/app/franchise/layout.tsx`
- Modify: `src/app/franchise/page.tsx`
- Modify: `src/app/franchise/page.tsx`
- Modify: `src/components/public/navbar.tsx`
- Modify: `src/components/public/footer.tsx`
- Modify: homepage section components that currently import hard-coded content directly
- Modify: `src/components/public/structured-data.tsx`

**Step 1:** Refactor presentational components to accept resolved content props, leaving client-side analytics and interactions intact.

**Step 2:** Fetch and resolve site settings in the franchise layout, and homepage content in the homepage server component.

**Step 3:** Generate title/description/OG and JSON-LD from resolved site settings and homepage SEO fields, with existing metadata as fallback.

### Task 4: Seed and document the singleton content

**Files:**

- Create: `scripts/seed-sanity-franchise-content.ts`
- Modify: `.env.example`
- Modify: `README.md` or `docs/`

**Step 1:** Build idempotent seed payloads from the current approved hard-coded content.

**Step 2:** Document optional public read configuration and the authenticated seed command; do not put a Sanity write token in source control.

### Task 5: Verify the integration

**Files:**

- Test: `tests/sanity-content-fallback.test.mjs`

**Step 1:** Run focused content-boundary tests.

**Step 2:** Run `npm run typecheck` and `npm run build`.

**Step 3:** Open `/studio`, `/franchise`, and a Studio subroute; verify singleton visibility, fallback behavior, navigation/footer rendering, and no section-order changes.

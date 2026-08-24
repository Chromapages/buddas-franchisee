# Build and operate the Budda’s franchise platform

This repository contains Budda’s public franchise recruitment site and a protected demonstration portal for franchise operators. The app presents the franchise opportunity, accepts qualified inquiries through an approved webhook, and demonstrates location-scoped ordering, resources, account context, and support workflows.

The implementation is production-shaped but not production-ready. Authentication, portal data, cart state, checkout, and support requests use demonstration adapters. Review [Production boundaries](#production-boundaries) before deploying.

## Key features

- Public franchise marketing site with evidence-led content and legal disclosures
- Franchise inquiry form with server validation and delivery protections
- Signed demonstration sessions with franchisee and administrator roles
- Location-scoped operator portal
- Seeded supply catalog, cart, checkout, orders, resources, and support
- Search-engine controls for protected routes
- Brand tokens, responsive layouts, and accessibility-focused components
- Node test suite for inquiry security and page contracts
- Lighthouse performance budgets

## Table of contents

- [Project status](#project-status)
- [Technology](#technology)
- [Prerequisites](#prerequisites)
- [Run the app locally](#run-the-app-locally)
- [Environment variables](#environment-variables)
- [Application routes](#application-routes)
- [Architecture](#architecture)
- [Franchise inquiry flow](#franchise-inquiry-flow)
- [Operator portal](#operator-portal)
- [Design system](#design-system)
- [Available commands](#available-commands)
- [Testing](#testing)
- [Performance audits](#performance-audits)
- [Deployment](#deployment)
- [Production boundaries](#production-boundaries)
- [Security notes](#security-notes)
- [Troubleshooting](#troubleshooting)
- [Standards and references](#standards-and-references)
- [Project documents](#project-documents)
- [Contributing](#contributing)

## Project status

The app currently supports two experiences:

1. **Public franchise experience**: `/franchise` and its child routes explain the concept, process, qualifications, and inquiry path
2. **Operator demonstration portal**: `/franchise/login` and `/portal` demonstrate authenticated, location-scoped operator workflows

The current release uses the following demonstration boundaries:

- Hard-coded operator accounts
- Signed cookie sessions without an external identity provider
- Seeded portal products, locations, orders, and resources
- Signed cookie cart and checkout receipt state
- Simulated checkout and support submission
- Direct inquiry delivery to an external HTTPS webhook
- Process-local duplicate, retry, and rate-limit state
- No application database, content management system, payment provider, or fulfillment integration

Do not present the portal as a production franchisee system until the replacements in [Production boundaries](#production-boundaries) are complete.

## Technology

| Area | Current implementation |
| --- | --- |
| Runtime | Node.js 20.9 or newer |
| Framework | Next.js 16.3 App Router |
| UI | React 19.2 |
| Language | TypeScript 5.9 with strict mode |
| Validation | Zod 4.4 |
| Icons | Lucide React 1.29 |
| Styling | CSS modules, global CSS, and custom design tokens |
| Authentication | Signed demonstration cookies |
| Data | Seeded TypeScript objects and signed cookies |
| Inquiry delivery | Server Action to approved HTTPS webhook |
| Tests | Node test runner |
| Performance | Lighthouse with repository budgets |
| Package manager | npm with `package-lock.json` |

Tailwind CSS is not installed in the current application. The app uses the canonical variables in `src/app/design-tokens.css` and styles in `src/app/globals.css`.

The app uses Server Components for page rendering and Client Components only where browser state or interaction requires them. This follows the current [Next.js App Router guidance](https://nextjs.org/docs/app) and [Server and Client Component guidance](https://nextjs.org/docs/app/getting-started/server-and-client-components).

## Prerequisites

Install the following tools:

- Node.js 20.9 or newer
- npm, included with Node.js
- Git for version control
- A Chromium-based browser for Lighthouse audits
- An approved HTTPS webhook receiver if you need to test franchise inquiry delivery

Confirm your versions:

```bash
node --version
npm --version
git --version
```

Next.js 16.3 declares Node.js 20.9 as its minimum supported version in the installed package metadata.

## Run the app locally

### 1. Open the application directory

```powershell
Set-Location "F:\WORK\A-C\BUDDAS\FRANCHISE\franchise-website"
```

### 2. Install dependencies

```bash
npm ci
```

Use npm for this repository because `package-lock.json` is the committed lockfile.

### 3. Create a local environment file

On PowerShell:

```powershell
Copy-Item .env.example .env.local
```

On macOS or Linux:

```bash
cp .env.example .env.local
```

Replace the demonstration secrets before sharing a preview or accepting form submissions.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to [http://localhost:3000/franchise](http://localhost:3000/franchise).

### 5. Review the operator portal

Open [http://localhost:3000/franchise/login](http://localhost:3000/franchise/login). The page lists the seeded demonstration accounts.

These accounts are public demonstration fixtures. Never reuse their passwords or authentication model in production.

### 6. Test inquiry delivery when needed

The inquiry form remains unavailable unless `INQUIRY_WEBHOOK_URL` points to an approved HTTPS receiver. Configure the webhook variables in `.env.local`, restart the development server, submit one inquiry, and confirm the receiver creates one record.

## Environment variables

The example file is `.env.example`. Keep real values in `.env.local` or the deployment platform’s encrypted environment settings.

### Application and session variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `SESSION_SECRET` | Production | Signs portal sessions, cart state, and checkout receipts |
| `NEXT_PUBLIC_APP_URL` | Recommended | Defines the canonical application origin for metadata |
| `INQUIRY_FORM_TOKEN_SECRET` | Production | Signs server-issued inquiry form tokens |

Use at least 32 random characters for each signing secret. Use separate values for `SESSION_SECRET` and `INQUIRY_FORM_TOKEN_SECRET` in production.

Generate a secret with Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### Inquiry delivery variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `INQUIRY_WEBHOOK_URL` | To accept inquiries | Approved HTTPS endpoint for inquiry payloads |
| `INQUIRY_WEBHOOK_ALLOWED_HOSTS` | Production | Comma-separated allowlist for webhook hostnames |
| `INQUIRY_WEBHOOK_TOKEN` | Receiver-dependent | Bearer token sent to the webhook |
| `INQUIRY_SOURCE_IP_HEADER` | Production inquiry delivery | One trusted proxy header used for source throttling |

The webhook receiver must:

- Accept JSON by HTTPS
- Return a `2xx` response only after accepting the inquiry
- Honor the `Idempotency-Key` request header
- Encode field values before HTML, CSV, spreadsheet, or log output
- Reject unauthorized requests
- Avoid redirects
- Complete within the 10-second application timeout

Set `INQUIRY_SOURCE_IP_HEADER` only when the deployment proxy overwrites that header. A client-controlled header defeats the source-throttling control.

### Example local values

```dotenv
SESSION_SECRET=replace_with_48_random_characters_or_more
NEXT_PUBLIC_APP_URL=http://localhost:3000
INQUIRY_FORM_TOKEN_SECRET=replace_with_another_random_secret
INQUIRY_WEBHOOK_URL=https://approved_receiver.example/inquiries
INQUIRY_WEBHOOK_ALLOWED_HOSTS=approved_receiver.example
INQUIRY_WEBHOOK_TOKEN=replace_with_receiver_issued_secret
INQUIRY_SOURCE_IP_HEADER=
```

The example values are placeholders. Do not commit real secrets.

## Application routes

### Public routes

| Route | Purpose |
| --- | --- |
| `/` | Redirects to `/franchise` |
| `/franchise` | Franchise homepage |
| `/franchise/about` | Brand and origin context |
| `/franchise/why-buddas` | Concept differentiation and operating proof |
| `/franchise/the-opportunity` | Opportunity, investment disclosures, and qualifications |
| `/franchise/process` | Franchise evaluation process |
| `/franchise/faq` | Accessible franchise FAQ |
| `/franchise/contact` | Franchise inquiry form |
| `/franchise/login` | Demonstration operator login |
| `/privacy` | Privacy notice |
| `/terms` | Terms |
| `/accessibility` | Accessibility statement |

`/franchisee-login` permanently redirects to `/franchise/login`.

### Protected portal routes

| Route | Purpose |
| --- | --- |
| `/portal` | Location-scoped dashboard |
| `/portal/supplies` | Supply catalog |
| `/portal/supplies/[slug]` | Supply detail |
| `/portal/store` | Alternate catalog route |
| `/portal/store/[slug]` | Alternate product detail route |
| `/portal/cart` | Signed cookie cart |
| `/portal/checkout` | Demonstration checkout review |
| `/portal/checkout/confirmation` | Signed receipt confirmation |
| `/portal/orders` | Seeded order history |
| `/portal/resources` | Shared and location-scoped resources |
| `/portal/support` | Demonstration support intake |
| `/portal/account` | Session and location context |

`proxy.ts` protects `/portal/:path*`. Unauthenticated requests redirect to `/franchise/login` with a sanitized return path.

Portal responses include `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: private, no-store`.

## Architecture

The application is one Next.js App Router deployment with separate public and protected layouts.

### Directory map

```text
src/app/                    Route layouts and pages
src/components/public/      Franchise-site components
src/components/portal/      Operator-portal components
src/features/auth/          Demo sessions and login actions
src/features/inquiry/       Validation, tokens, protection, delivery
src/features/portal/        Scoped portal data and actions
lib/                        Seeded data and formatters
public/                     Brand and food assets
tests/                      Node contract and security tests
scripts/                    Lighthouse budget assertion
docs/                       Brand and design references
```

### Public request lifecycle

1. A request enters the App Router
2. The root layout loads fonts and global design tokens
3. The franchise layout checks whether a portal session exists
4. Server Components render public content
5. Client Components add navigation, accordion, carousel, or form interaction

### Protected request lifecycle

1. `proxy.ts` checks for the session cookie
2. The portal layout verifies the signed session
3. The data layer calculates accessible locations from the session
4. Page queries receive the selected, authorized location
5. Server Actions repeat the session and location checks before mutations

### Current state model

The portal does not use a database:

- `lib/data.ts` contains seeded products, locations, orders, announcements, and resources
- `src/features/portal/data.ts` scopes seeded records to the signed session
- Cart state is stored in an HMAC-signed, HTTP-only cookie
- Checkout confirmation is stored in a short-lived signed cookie
- Support submission returns a generated demonstration reference

Hash-based message authentication code (HMAC) signatures detect cookie changes. They do not provide durable storage, encryption, revocation, or production identity.

## Franchise inquiry flow

The public inquiry uses a Server Action and follows this sequence:

1. Render a server-signed form token
2. Reject honeypot values and malformed duplicate fields
3. Verify token integrity and expiry
4. Normalize and validate all accepted fields with Zod
5. Confirm an approved HTTPS destination exists
6. Apply process-local duplicate, retry, contact, and source limits
7. Send JSON with an idempotency key and 10-second timeout
8. Return distinct success, duplicate, expired, retry, and failure states

The form validates:

- Contact information
- Market interest
- Restaurant or hospitality experience
- Self-reported investment range
- Preferred timeline
- Optional message
- Contact consent

The form does not write to a local database. The webhook receiver must persist the inquiry before returning success.

### Protection limits

The current process-local controls include:

- 15-minute duplicate window
- Three contact submissions per hour
- Eight source submissions per 10 minutes
- Three bounded timeout retries with exponential delay
- 2,000-entry bounds on in-memory tracking collections
- Payload fingerprinting with hashed contact data

These controls reset when the Node.js process restarts and do not coordinate across server instances. Production requires shared, atomic rate limiting and replay protection at the edge or in a durable store.

### Delivery failure behavior

The application fails closed when:

- The webhook URL is missing or invalid
- Production lacks a webhook hostname allowlist
- Production lacks a trusted source-address header
- The webhook redirects
- The receiver returns a non-success status
- The request exceeds 10 seconds

When delivery is unavailable, the page shows the configured direct phone and email contact path.

## Operator portal

### Demonstration authentication

`src/features/auth/session.ts` contains three seeded accounts:

- Two franchisee accounts scoped to one location each
- One administrator account scoped to multiple locations

Successful login creates a signed, HTTP-only session cookie with:

- 10-hour lifetime
- `SameSite=Lax`
- `Secure` in production
- User, role, and location claims

The current credentials are intentionally visible on the login page. Replace the entire demonstration authentication adapter before production.

### Tenant and location scoping

Portal queries derive accessible locations from the verified session. Franchisee sessions receive one location. The administrator session receives the seeded managed locations.

Server Actions call `requirePortalSession()` and `getPortalContext()` before accessing location data. Preserve this server-side boundary when replacing seeded data.

### Demonstration commerce

The supply catalog, cart, checkout, and order history demonstrate the intended operator experience:

- Location-specific price lists
- Signed cart state
- Availability labels
- Demonstration confirmation numbers
- Seeded order and invoice references

No payment, tax, inventory, invoice, fulfillment, or order-management provider receives these actions.

## Design system

Read `AGENTS.md` and `design.md` before changing visual components.

The locked implementation rules include:

- Use variables from `src/app/design-tokens.css`
- Do not introduce raw colors, spacing, type sizes, font families, or radii
- Record necessary deviations in `docs/design-system-exceptions.md` before implementation
- Preserve visible focus, readable contrast, and responsive behavior
- Use approved Budda’s brand and Product Truth assets

The public site and operator portal share brand foundations but use separate layout densities. The franchise site prioritizes appetite and evidence. The portal prioritizes tasks, status, and location context.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build and run framework checks |
| `npm run start` | Serve the production build |
| `npm test` | Run all Node tests in `tests/*.test.mjs` |
| `npm run audit:lighthouse` | Audit `/franchise/why-buddas` and enforce budgets |
| `npm run audit:lighthouse:process` | Audit `/franchise/process` and enforce budgets |

No separate lint or type-check script is defined. `npm run build` performs the framework’s production compilation and type validation.

## Testing

### Run the test suite

```bash
npm test
```

The current tests cover:

- Inquiry schema normalization and boundary validation
- Phone and select-field validation
- Form-token verification
- Duplicate and token-conflict protection
- Attempt limits and timeout retry budget
- Stable content identities and page structure
- Reusable call-to-action accessibility identifiers

### Run one test file

```bash
node --experimental-strip-types --test tests/inquiry-schema.test.mjs
```

### Build verification

```bash
npm run build
```

Run the production build before a release. Resolve all type, route, and build failures before deployment.

## Performance audits

Start the app before running a local Lighthouse command:

```bash
npm run dev
```

In a second terminal:

```bash
npm run audit:lighthouse
npm run audit:lighthouse:process
```

The assertion script enforces:

| Metric | Budget |
| --- | ---: |
| Largest Contentful Paint | 2,500 ms |
| Cumulative Layout Shift | 0.1 |
| Total Blocking Time | 200 ms |

For release decisions, also measure Interaction to Next Paint with real-user monitoring. Lighthouse does not provide field data for that metric.

Run audits against a deployed preview before release. Local hardware, browser extensions, and development mode can distort results.

## Deployment

The repository does not contain a committed provider-specific deployment file. Vercel is the reference target because the application uses the Next.js App Router, Server Actions, route headers, and server-side cookies.

Vercel separates Local, Preview, and Production environments. Configure secrets independently in each environment, as described in the [Vercel environments documentation](https://vercel.com/docs/deployments/environments).

### Production build

```bash
npm ci
npm run build
npm run start
```

### Vercel deployment outline

1. Import the repository into Vercel
2. Confirm the root directory points to `franchise-website`
3. Add the production environment variables
4. Configure the canonical domain through `NEXT_PUBLIC_APP_URL`
5. Confirm the trusted source-address header before enabling inquiry delivery
6. Deploy a preview
7. Run tests, build verification, accessibility review, and Lighthouse audits
8. Submit one sandbox inquiry and confirm exactly one receiver record
9. Promote only after legal, privacy, security, and brand approval

Do not enable the inquiry webhook until the receiver and source-header trust boundary pass review.

## Production boundaries

Replace or complete each area before production use:

### Identity and access

- Approved identity provider
- Persistent, revocable sessions
- Password reset and account lifecycle
- Multi-factor authentication where required
- Role and tenant administration
- Audit logs

### Data and tenancy

- Tenant-scoped PostgreSQL or equivalent durable store
- Database-enforced tenant boundaries
- Migrations, backups, recovery, and retention
- Durable carts, orders, resources, and support requests
- Concurrency and idempotency controls

### Inquiry operations

- Durable inquiry persistence before external delivery
- Shared rate limiting and replay protection
- Customer relationship management adapter
- Retry queue and dead-letter handling
- Consent record retention
- Monitoring and response-time reporting

### Commerce and fulfillment

- Approved supply catalog source
- Inventory and availability
- Tax and invoice rules
- Payment or approved internal billing
- Fulfillment and shipment status
- Refund, cancellation, and reconciliation workflows

### Content and legal governance

- Approved content-management workflow
- Franchise Disclosure Document controls
- Counsel-approved investment and financial-performance language
- State availability rules
- Versioned disclosures and consent copy
- Review and expiry dates

### Operations

- Centralized logs and metrics
- Alert routing
- Backups and restore tests
- Incident response
- Dependency and secret scanning
- Real-user performance monitoring

## Security notes

- Do not expose server secrets through variables prefixed with `NEXT_PUBLIC_`
- Do not deploy the fallback demonstration session secret
- Do not treat a cookie’s presence as authorization; keep server verification in protected layouts and actions
- Do not trust forwarded headers unless the platform overwrites them
- Do not log full inquiry payloads or credentials
- Do not remove webhook hostname validation or redirect blocking
- Do not replace the process-local controls with a non-atomic distributed implementation
- Do not make franchise financial-performance claims outside approved disclosure processes

The app sets these response headers:

- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- A restrictive camera, geolocation, and microphone `Permissions-Policy`

A production security review should also define a Content Security Policy, data-retention controls, provider-specific network boundaries, and incident procedures.

## Troubleshooting

### The inquiry form says it is unavailable

Confirm:

1. `INQUIRY_WEBHOOK_URL` uses HTTPS
2. The hostname appears in `INQUIRY_WEBHOOK_ALLOWED_HOSTS`
3. Production sets a trusted `INQUIRY_SOURCE_IP_HEADER`
4. The receiver accepts the bearer token when configured
5. The development server restarted after environment changes

### Inquiry delivery times out

The application stops the delivery request after 10 seconds. Confirm that the receiver persists the record and returns a `2xx` response before that deadline.

Do not submit repeatedly after an ambiguous timeout. The form token and retry controls retain a bounded retry state for the current process.

### Portal login fails

Use the credentials displayed on `/franchise/login`. Delete the `buddas_portal_session` cookie if an old signed session conflicts with a changed local secret.

### Portal redirects to login

The session cookie may be missing, expired, or signed with a different `SESSION_SECRET`. Sign in again after changing the secret.

### A product or order appears under the wrong location

Confirm the requested `locationId` is included in the signed session’s accessible locations. Keep all data access behind `getPortalContext()` when adding portal features.

### Lighthouse cannot connect

Start the app on port 3000 before running the audit scripts. If another process uses that port, stop it or run Lighthouse manually against the correct URL.

### Production metadata uses an unexpected origin

Set `NEXT_PUBLIC_APP_URL` to the canonical HTTPS origin and rebuild the application.

## Standards and references

Use these primary references when updating framework behavior, accessibility requirements, deployment settings, or franchise-facing claims:

- [Next.js App Router documentation](https://nextjs.org/docs/app)
- [Next.js form and Server Action guidance](https://nextjs.org/docs/app/guides/forms)
- [Vercel deployment environments](https://vercel.com/docs/deployments/environments)
- [Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/)
- [Federal Trade Commission Franchise Rule](https://www.ftc.gov/legal-library/browse/rules/franchise-rule)

The installed Next.js version also generates repository-specific guidance in `AGENTS.md`. Read that file and the matching documentation in `node_modules/next/dist/docs/` before changing framework behavior.

## Project documents

- [Franchise platform technical and launch checklist](Buddas_Franchise_Platform_Technical_and_Launch_Checklist_v1.0.md)
- [Franchise platform UX/UI direction brief](Buddas_Franchise_Platform_UX_UI_Direction_Brief_v1.0.md)
- [Franchise platform content matrix](Buddas_Franchise_Platform_Content_Matrix_v1.0.md)
- [Franchise platform sitemap and user flows](Buddas_Franchise_Platform_Sitemap_and_User_Flows_v1.0.md)
- [Franchise platform scope and requirements](Buddas_Franchise_Platform_Scope_and_Requirements_v1.0.md)
- [Franchise platform discovery brief](Buddas_Franchise_Platform_Discovery_Brief_v1.0.md)
- [Approved franchise website PRD](Buddas_Franchise_Website_PRD_v1.0.md)
- [Platform build plan](../../franchise-website/buddas-franchise-platform.md)
- [Design system](../../franchise-website/design.md)
- [Brand foundations](../../franchise-website/docs/brand-foundations.md)
- [Brand evidence](../../franchise-website/docs/brand-evidence.md)
- [Design exceptions](../../franchise-website/docs/design-system-exceptions.md)
- [Agent instructions](../../franchise-website/AGENTS.md)

The Product Requirements Document (PRD) defines the approved franchise recruitment direction. This repository also contains a demonstration operator portal that extends beyond the public-site MVP. Treat the portal’s production integrations as a separate readiness workstream.

## Contributing

Before editing:

1. Read `AGENTS.md`
2. Read `design.md`
3. Check `docs/design-system-exceptions.md`
4. Inspect the relevant route and feature boundary
5. Preserve server-side authorization and inquiry protections
6. Add or update tests for changed behavior
7. Run the repository’s required verification

Keep changes focused. Reuse existing tokens, components, data boundaries, and validation patterns before introducing new abstractions or dependencies.

## License

This is a private Budda’s project. No public open-source license is declared.

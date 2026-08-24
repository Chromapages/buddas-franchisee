# Launch the Budda’s franchise platform safely

**Document:** Technical and launch checklist  
**Product:** Budda’s franchise recruitment site and operator portal  
**Version:** 1.0  
**Date:** August 21, 2026  
**Status:** Proposed launch baseline  
**Primary audience:** Product, engineering, brand, franchise development, operations, legal, privacy, analytics, quality assurance, and support  
**Source documents:** PRD, Discovery Brief, Scope and Requirements, Sitemap and User Flows, Content Matrix, UX/UI Direction Brief, platform README  

This checklist defines the platform, content management system, analytics, domains, environments, integrations, quality gates, launch process, rollback criteria, and ownership handoff for the Budda’s franchise platform.

## 1. Executive launch decision

### 1.1 Release included

Launch:

- Public franchise qualified-interest site
- Approved legal and accessibility pages
- Durable franchise inquiry
- Customer relationship management delivery
- Transactional acknowledgment
- Public funnel analytics
- Content governance
- Monitoring and rollback

### 1.2 Release excluded

Do not launch:

- Active franchise offering
- Public territory reservation
- Franchise fee or financial-performance claims without approved Item 19 content
- Public booking calendar
- Public account creation
- Production operator portal
- Portal checkout with real billing or payment
- Demo credentials or seeded franchisee data

### 1.3 Conditional pilot

The operator portal may launch only as a controlled pilot after:

- Discovery Gate 3 approval
- Production identity provider
- Durable tenant data
- Database-enforced location access
- Systems-of-record integration
- Portal security review
- Operator support and incident plan

### 1.4 Go or no-go authority

Required launch approvals:

| Domain | Approver |
| --- | --- |
| Product scope | Executive sponsor and product owner |
| Franchise claims | Franchise counsel |
| Privacy and consent | Privacy owner and counsel |
| Brand and Product Truth | Brand owner |
| Operating claims | Operations owner |
| Technical readiness | Engineering owner |
| Accessibility | Accessibility owner |
| Analytics | Analytics owner |
| Follow-up capacity | Franchise-development owner |

Any approver may block launch within their controlled domain.

## 2. Recommended technical platform

### 2.1 Application

| Area | Decision |
| --- | --- |
| Framework | Next.js 16.3 App Router |
| Language | TypeScript strict mode |
| Runtime | Node.js 20.9 or newer |
| UI | React 19.2 |
| Validation | Zod |
| Styling | Existing CSS token system |
| Package manager | npm with locked dependencies |
| Architecture | Modular monolith |
| Hosting | Vercel |
| Database | Managed PostgreSQL, Neon or approved equivalent |
| CMS | Sanity Studio |
| Analytics | GA4 plus first-party operational events |
| Monitoring | OpenTelemetry-compatible instrumentation and approved error service |

### 2.2 Rendering boundaries

- Use Server Components for public content, metadata, evidence, legal copy, and portal reads
- Use Client Components only for interaction, form state, menus, accordion behavior, and browser APIs
- Use Server Actions for form mutations when they fit the flow
- Use Route Handlers for provider webhooks and explicit service endpoints
- Treat Server Actions and Route Handlers as public security boundaries
- Keep inquiry, session, database, and provider secrets server-only

The [Next.js production checklist](https://nextjs.org/docs/app/guides/production-checklist) recommends production error pages, server-side validation, environment control, metadata, image optimization, and Core Web Vitals review.

### 2.3 Runtime choice

Use Node.js runtime for:

- Inquiry persistence
- PostgreSQL
- Cryptography
- Customer relationship management delivery
- Transactional email
- Identity callbacks
- Provider webhooks

Do not move these operations to Edge runtime without verifying library support, timeout behavior, database connectivity, and observability.

### 2.4 Database

Release 1 database domains:

- Prospect
- Inquiry
- Consent record
- Routing classification
- Lifecycle state
- Attribution
- Delivery attempt
- Human follow-up timestamp
- Audit event

Requirements:

- Separate development, preview, and production data
- Encrypted transport and storage
- Automated backups
- Point-in-time recovery when available
- Migration process
- Restore test
- Least-privilege application role
- Separate administrative role
- Connection pooling appropriate to serverless runtime
- No production personal data in preview

### 2.5 Current-code gaps

The current implementation:

- Sends the inquiry directly to a webhook
- Uses process-local duplicate and retry state
- Uses demo authentication
- Uses seeded portal data
- Stores cart and receipt in signed cookies

Release 1 must replace direct-delivery-as-storage with:

```text
Validate
→ Persist inquiry
→ Classify
→ Acknowledge user
→ Queue delivery
→ Deliver to CRM
→ Retry or manual recovery
```

Success appears only after durable platform persistence.

## 3. Content management system

### 3.1 CMS decision

Use Sanity Studio for:

- Public page content
- FAQ
- Evidence records
- Support capabilities
- Market-interest status
- Legal disclosure blocks
- Metadata
- Asset records
- Review and expiry dates

Do not use Sanity as:

- Inquiry database
- Authentication system
- Portal order database
- Payment system
- Audit-log replacement

### 3.2 Why Sanity

- Structured content
- Next.js App Router support
- Secure Draft Mode
- Visual Editing
- Role and permission controls
- Content versions and releases
- Webhooks and revalidation

Sanity’s Draft Mode guidance uses a secure preview handshake and disables normal content caching while previewing unpublished content. [Sanity Draft Mode](https://www.sanity.io/docs/visual-editing/implementing-draft-mode).

Sanity Content Releases can group, preview, validate, schedule, and publish related documents together. Availability depends on the selected plan and must be confirmed before relying on it. [Sanity Content Releases](https://www.sanity.io/docs/studio/content-releases).

### 3.3 CMS content types

- Page
- Section
- Evidence item
- Claim
- FAQ
- Market rule
- Support capability
- Process stage
- Location evidence
- Asset record
- Legal document
- Metadata

### 3.4 CMS workflow

Required statuses:

1. Draft
2. Brand review
3. Operations or finance review
4. Legal review when required
5. Approved
6. Expired
7. Withdrawn

Required fields:

- Owner
- Reviewers
- Claim category
- Evidence IDs
- Version
- Effective date
- Review date
- Expiry
- Approved channels

### 3.5 CMS permission model

Minimum roles:

- Editor
- Brand reviewer
- Operations reviewer
- Legal reviewer
- Publisher
- Administrator

Rules:

- Editors cannot approve their own controlled claims
- Legal approval is required for financial, territory, offer, consent, and legal content
- Publisher can publish only approved records
- Mode B cannot be enabled in CMS
- Production publishing requires multi-factor authentication
- Preview and production datasets remain separate

Sanity roles require permissions for drafts and release documents in addition to ordinary content types. [Sanity roles](https://www.sanity.io/docs/user-guides/roles).

### 3.6 CMS technical checklist

- [ ] Sanity project created
- [ ] Development dataset created
- [ ] Production dataset created
- [ ] Preview origin allowlisted
- [ ] Production origin allowlisted
- [ ] Secure preview secret configured
- [ ] Draft Mode route protected
- [ ] Public queries filter approved, effective content
- [ ] Legal claim schema validated
- [ ] Asset metadata required
- [ ] Role matrix implemented
- [ ] Publish permissions tested
- [ ] Withdrawal invalidates cached content
- [ ] Preview is noindex
- [ ] Content backup/export process documented
- [ ] CMS outage behavior documented
- [ ] CMS owner trained

### 3.7 CMS fallback

If Sanity cannot launch in time:

- Keep content code-managed
- Require pull-request approval from Brand and Legal
- Keep claims register in version control
- Block nontechnical production editing
- Do not create an ungoverned admin form
- Schedule CMS migration after launch

This fallback requires explicit executive and legal approval.

## 4. Analytics and measurement

### 4.1 Measurement Readiness and Signal Quality Index

Current estimated score:

| Category | Score |
| --- | ---: |
| Decision alignment | 19 / 25 |
| Event-model clarity | 14 / 20 |
| Data accuracy and integrity | 5 / 20 |
| Conversion-definition quality | 12 / 15 |
| Attribution and context | 5 / 10 |
| Governance and maintenance | 4 / 10 |
| **Total** | **59 / 100** |

**Verdict:** Unreliable.

The documentation defines useful events, but the repository does not show a complete production analytics implementation, validation record, consent behavior, or governance owner. Do not use launch analytics for optimization decisions until the measurement QA gate passes.

### 4.2 Analytics stack

Use:

- Google Analytics 4 for public acquisition and funnel analysis
- First-party PostgreSQL events for inquiry persistence, routing, delivery, and response
- Vercel or approved real-user performance monitoring
- Error and trace monitoring for technical operations

Do not send portal operational data to public marketing analytics unless a separate privacy and product decision approves it.

### 4.3 Public event model

| Event | Trigger | Required context | Decision |
| --- | --- | --- | --- |
| `franchise_page_view` | Public page rendered | Page, content version, source | Entry quality |
| `franchise_evidence_view` | Evidence threshold viewed | Page, section, evidence type | Content usefulness |
| `franchise_cta_click` | Primary or secondary CTA | Page, section, label | Journey movement |
| `franchise_form_view` | Contact form rendered | Form version | Form exposure |
| `franchise_form_start` | First meaningful field action | Form version, device | Start rate |
| `franchise_form_error` | Validation error shown | Field ID, error code, step | Friction |
| `franchise_form_submit_attempt` | Final submit | Form version | Attempt rate |
| `generate_lead` | Durable inquiry persisted | Routing class, market region, source | Real conversion |
| `franchise_delivery_state` | CRM delivery changes | State, adapter version | Operations |
| `franchise_followup_started` | Human first response | Routing class, elapsed time | Service level |
| `franchise_booking_invited` | Private invitation created | Routing class, host pool | Qualification |

Google Analytics documents `generate_lead` as the recommended event when a lead is generated. [GA4 recommended events](https://developers.google.com/analytics/devguides/collection/ga4/reference/events).

### 4.4 Conversion definitions

Primary conversion:

- `generate_lead` after durable persistence

Secondary operational conversions:

- Qualified review
- Booking invitation
- Booking completed
- Human response within target

Not conversions:

- Page view
- CTA click
- Form view
- Form start
- Submit button click before persistence

### 4.5 Analytics properties

Allowed:

- Page
- Section
- CTA label
- Form version
- Content version
- Legal version
- Device class
- Routing classification
- Market region at approved granularity
- Source and UTM values
- Delivery state
- Time bucket

Prohibited:

- Name
- Email
- Phone
- Full address
- Free-text message
- Exact financial data
- Authentication token
- Portal tenant identifiers in public analytics

### 4.6 Consent

Legal and privacy owners must choose:

- Basic consent mode
- Advanced consent mode
- No Google tags before consent
- Jurisdiction-specific behavior

Google Consent Mode requires the site to obtain a user choice, communicate it to Google, and ensure tags respect the choice. [Google Consent Mode](https://developers.google.com/tag-platform/security/concepts/consent-mode).

Checklist:

- [ ] Consent owner assigned
- [ ] Consent-management platform selected or custom implementation approved
- [ ] Default consent states defined
- [ ] Analytics storage behavior defined
- [ ] Advertising storage disabled unless approved
- [ ] Consent state tested by region
- [ ] Tag behavior tested before and after choice
- [ ] Privacy notice updated
- [ ] Withdrawal works
- [ ] Global Privacy Control behavior reviewed
- [ ] Retention setting approved
- [ ] User deletion process documented

### 4.7 UTM standard

Use lowercase values and underscores:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`

Maintain:

- Campaign naming guide
- Approved source list
- Owner
- Start and end dates
- Landing route
- First-touch and latest-touch values

Never overwrite first-touch attribution.

### 4.8 Analytics QA checklist

- [ ] Analytics property created
- [ ] Development traffic filtered or separated
- [ ] Preview traffic separated
- [ ] Consent behavior verified
- [ ] Events fire once
- [ ] `generate_lead` fires only after persistence
- [ ] No personal data in payloads
- [ ] UTMs persist through inquiry
- [ ] Cross-domain behavior tested if subdomain is used
- [ ] Mobile Safari tested
- [ ] Chromium tested
- [ ] Firefox tested
- [ ] Ad-blocked flow remains functional
- [ ] Real-time events verified
- [ ] Debug mode disabled in production
- [ ] Dashboard owner assigned
- [ ] Event dictionary versioned

## 5. Domains and DNS

### 5.1 Preferred canonical topology

Public:

- `https://www.buddashawaiian.com/franchise`

Portal pilot:

- `https://operators.buddashawaiian.com/portal`

CMS:

- `https://studio.buddashawaiian.com` or approved managed Studio URL

Preview:

- Vercel-generated preview URL with deployment protection and noindex

### 5.2 Public-domain decision

Preferred:

- Serve `/franchise` from the primary consumer domain
- Preserve one brand authority
- Avoid cross-domain public funnel tracking
- Use one canonical URL

Implementation options:

1. Consumer site owns `/franchise*` and rewrites to the franchise Vercel project
2. Next.js Multi-Zones or reverse proxy routes the path
3. Consumer site and franchise app become one deployment

Fallback:

- `https://franchise.buddashawaiian.com`

Use the fallback only when primary-domain path routing cannot meet launch timing or reliability. Document the future migration and permanent redirects before launch.

### 5.3 Portal hostname

Use a separate operator hostname for:

- Host-only session cookies
- Clear trust boundary
- Independent Content Security Policy
- Independent deployment protection and monitoring
- Reduced public-route confusion

The codebase may remain shared. The host must route only approved portal and login paths.

### 5.4 Domain checklist

- [ ] Domain owner identified
- [ ] DNS provider identified
- [ ] Current DNS exported
- [ ] Existing consumer-site routing documented
- [ ] Preferred canonical topology approved
- [ ] Fallback topology approved
- [ ] Vercel project linked
- [ ] Custom domain added
- [ ] Required DNS records verified
- [ ] SSL certificate active
- [ ] `www` and apex redirect rule confirmed
- [ ] Canonical metadata uses production origin
- [ ] HTTP redirects to HTTPS
- [ ] Legacy franchise URLs mapped
- [ ] Portal hostname mapped
- [ ] Preview URLs noindex
- [ ] Search Console property verified
- [ ] Analytics cross-domain behavior tested if needed
- [ ] Cookie scope reviewed
- [ ] DNS rollback documented
- [ ] Low DNS time-to-live scheduled before cutover when provider permits

Vercel recommends choosing one canonical domain and redirecting its counterpart to avoid duplication. [Vercel domain setup](https://vercel.com/docs/domains/set-up-custom-domain).

### 5.5 Domain cutover verification

Verify:

- DNS resolution from multiple networks
- SSL chain
- Canonical link
- Open Graph URL
- Sitemap host
- Robots host
- Redirect chains
- Portal noindex
- Form action origin
- Server Action origin policy
- Customer relationship management webhook callback host
- Consent cookie domain
- Session cookie domain

## 6. Environments and secrets

### 6.1 Environment model

Use:

- Local
- Preview
- Production
- Optional staging custom environment

Vercel distinguishes Local, Preview, and Production and supports environment-specific variables. [Vercel environments](https://vercel.com/docs/deployments/environments).

### 6.2 Isolation requirements

| Resource | Local | Preview | Production |
| --- | --- | --- | --- |
| Database | Local/dev | Preview database or branch | Production database |
| CMS dataset | Development | Development or preview | Production |
| CRM | Stub/sandbox | Sandbox | Production |
| Email | Captured/sandbox | Sandbox allowlist | Production |
| Analytics | Debug property | Test property or filtered stream | Production |
| Identity | Demo/dev tenant | Test tenant | Production tenant |
| Storage | Development | Preview | Production |

Preview must not use production personal data.

### 6.3 Current environment variables

- `SESSION_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `INQUIRY_FORM_TOKEN_SECRET`
- `INQUIRY_WEBHOOK_URL`
- `INQUIRY_WEBHOOK_ALLOWED_HOSTS`
- `INQUIRY_WEBHOOK_TOKEN`
- `INQUIRY_SOURCE_IP_HEADER`

### 6.4 Required new variables

Names may change during implementation, but responsibilities must remain:

- `DATABASE_URL`
- `DATABASE_DIRECT_URL` when migrations require it
- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_VERSION`
- `SANITY_READ_TOKEN` when private preview requires it
- `SANITY_PREVIEW_SECRET`
- `CRM_PROVIDER`
- `CRM_API_URL`
- `CRM_API_TOKEN`
- `EMAIL_PROVIDER`
- `EMAIL_API_TOKEN`
- `EMAIL_FROM_ADDRESS`
- `GA_MEASUREMENT_ID`
- `CONSENT_MODE`
- `ERROR_MONITOR_DSN`
- `MODE_B_ENABLED`, server-only and false by default

### 6.5 Secrets checklist

- [ ] No secret uses `NEXT_PUBLIC_`
- [ ] Secrets differ across environments
- [ ] Preview cannot access production database
- [ ] Secret owners recorded
- [ ] Rotation schedule recorded
- [ ] Revocation procedure tested
- [ ] Old credentials removed
- [ ] Logs redact tokens and personal data
- [ ] Build logs inspected
- [ ] Local environment files ignored
- [ ] Production fallback session secret removed

Vercel environment-variable changes apply only to new deployments. Redeploy after changing a production secret or configuration. [Vercel environment variables](https://vercel.com/docs/environment-variables).

## 7. Integrations

### 7.1 Required Release 1 integrations

- Managed PostgreSQL
- Sanity CMS
- Customer relationship management
- Transactional email
- Analytics
- Consent
- Error monitoring
- Real-user performance

### 7.2 Integration acceptance contract

Each integration needs:

- Owner
- Vendor
- Sandbox
- Production account
- Authentication method
- Data classification
- Schema
- Version
- Timeout
- Idempotency
- Retry
- Rate limit
- Error mapping
- Monitoring
- Service-level objective
- Support contact
- Rollback
- Contract test

### 7.3 Inquiry pipeline

Checklist:

- [ ] Inquiry validates server-side
- [ ] Signed form token works
- [ ] Honeypot works
- [ ] Shared rate limiting configured
- [ ] Inquiry persists before success
- [ ] Public reference generated
- [ ] Routing classification assigned
- [ ] CRM delivery queued
- [ ] CRM idempotency verified
- [ ] Retry policy verified
- [ ] Dead-letter alert verified
- [ ] Acknowledgment email sent after persistence
- [ ] CRM outage tested
- [ ] Database outage tested
- [ ] Duplicate submit tested
- [ ] Timeout recovery tested
- [ ] Personal data absent from general logs

### 7.4 Email

Required templates:

- Inquiry received
- Internal qualified-lead notification
- Internal delivery-failure notification
- Booking invitation, when enabled
- Privacy or data-request response, owned by Legal

Email checklist:

- [ ] Sending domain verified
- [ ] SPF configured
- [ ] DKIM configured
- [ ] DMARC policy reviewed
- [ ] From and reply-to approved
- [ ] Templates accessibility tested
- [ ] Plain-text version included
- [ ] No unsupported franchise claim
- [ ] Suppression behavior tested
- [ ] Bounce and complaint handling defined

## 8. Repository and continuous integration

### 8.1 Branch policy

- `main` is production
- Pull requests create preview deployments
- Direct production pushes are restricted
- Required reviews include Engineering and controlled-domain owners
- High-risk changes require Legal, Privacy, Brand, or Operations review

### 8.2 Required checks

Current:

- `npm test`
- `npm run build`
- `npm run audit:lighthouse`
- `npm run audit:lighthouse:process`

Add before production:

- Explicit lint check or documented waiver
- Dedicated type check when not covered by build
- Accessibility automation
- Secret scanning
- Dependency scanning
- Link checking
- Metadata and structured-data checking
- CMS schema validation
- Database migration verification
- Contract tests
- Preview smoke tests

### 8.3 Continuous integration checklist

- [ ] `npm ci` uses lockfile
- [ ] Node version pinned
- [ ] Tests pass
- [ ] Production build passes
- [ ] Type checks pass
- [ ] Lint policy passes
- [ ] No high-severity dependency issue without approved exception
- [ ] Secret scan passes
- [ ] Accessibility automation passes
- [ ] Requirement traceability updated
- [ ] Preview deployment succeeds
- [ ] Preview smoke tests pass
- [ ] Required reviewers approve

## 9. Quality assurance

### 9.1 Functional QA

Public:

- [ ] Every canonical route loads
- [ ] Redirects work
- [ ] Header and footer links work
- [ ] Mobile navigation works
- [ ] FAQ works without losing semantic content
- [ ] Contact form validates
- [ ] No-JavaScript form works
- [ ] Durable persistence works
- [ ] Duplicate handling works
- [ ] Failure recovery works
- [ ] Direct fallback contact works

Portal:

- [ ] Demo-only label visible in nonproduction
- [ ] Production portal inaccessible until pilot approval
- [ ] Portal remains noindex
- [ ] Demo credentials absent from production

### 9.2 Content and legal QA

- [ ] Canonical brand spelling approved
- [ ] Product Truth review complete
- [ ] Claims register reconciled
- [ ] Every public claim has evidence
- [ ] Opportunity metadata no longer promises unpublished cost information
- [ ] Contact metadata uses inquiry language
- [ ] Territory language approved
- [ ] Investment language approved
- [ ] Support maturity labels approved
- [ ] FAQ reviewed
- [ ] Privacy matches actual data flow
- [ ] Terms match actual product
- [ ] Accessibility statement has owner and contact
- [ ] Footer disclosure approved
- [ ] Email templates reviewed

### 9.3 Accessibility QA

- [ ] WCAG 2.2 AA automated scan
- [ ] Complete keyboard journey
- [ ] Visible and unobscured focus
- [ ] Desktop screen-reader test
- [ ] Mobile screen-reader test
- [ ] 200% text zoom
- [ ] 320 CSS pixel reflow
- [ ] Forced-colors test
- [ ] Reduced-motion test
- [ ] Target-size test
- [ ] Form-error test
- [ ] Provider-widget accessibility review
- [ ] Accessibility defects triaged by user impact

### 9.4 Responsive and visual QA

Review:

- 320
- 375
- 480
- 768
- 1,024
- 1,280
- 1,440
- 1,536 CSS pixels

Checklist:

- [ ] Navigation never collides
- [ ] Section numbers remain intact
- [ ] Hero food remains dominant
- [ ] Product crop is approved
- [ ] No clipped copy
- [ ] No horizontal page scroll
- [ ] Forms remain one column on mobile
- [ ] Sticky actions do not hide focus
- [ ] Typography matches approved roles
- [ ] Arc and Table Line use official geometry
- [ ] Visual-verdict score reaches 90

### 9.5 Performance QA

- [ ] Production build tested
- [ ] Hero media optimized
- [ ] Correct `sizes` on responsive images
- [ ] Likely Largest Contentful Paint image prioritized
- [ ] Layout dimensions reserved
- [ ] Font weights limited
- [ ] Third-party scripts reviewed
- [ ] Lighthouse budgets pass
- [ ] Deployed preview audited
- [ ] Real-user monitoring configured
- [ ] Largest Contentful Paint target 2.5 seconds
- [ ] Interaction to Next Paint target 200 milliseconds
- [ ] Cumulative Layout Shift target 0.1

### 9.6 Security QA

- [ ] Threat model reviewed
- [ ] Session design reviewed
- [ ] Server Action authorization reviewed
- [ ] Route Handler authorization reviewed
- [ ] Rate limiting distributed and atomic
- [ ] Webhook host allowlist enforced
- [ ] Redirects blocked for inquiry delivery
- [ ] Database permissions reviewed
- [ ] Content Security Policy tested
- [ ] Security headers tested
- [ ] Personal-data logging reviewed
- [ ] Backup and restore tested
- [ ] Incident plan exercised
- [ ] Cross-tenant tests pass before portal pilot

### 9.7 Search QA

- [ ] Titles unique
- [ ] Descriptions accurate
- [ ] Canonical URLs correct
- [ ] Open Graph metadata correct
- [ ] `robots.txt` correct
- [ ] Sitemap correct
- [ ] Portal noindex
- [ ] Preview noindex
- [ ] Structured data matches visible content
- [ ] Redirects have one hop
- [ ] Search Console verified
- [ ] Production crawl requested after launch

### 9.8 Analytics QA

- [ ] Measurement score recalculated
- [ ] Event dictionary approved
- [ ] Events fire once
- [ ] Conversions use durable state
- [ ] No personal data
- [ ] Consent tested
- [ ] Attribution tested
- [ ] Ad blockers do not break the site
- [ ] Dashboards use production events
- [ ] Owners can explain each metric

## 10. Launch environments

### 10.1 Local

Purpose:

- Development
- Unit tests
- Component work

Rules:

- Synthetic data
- No production webhook
- No production personal data

### 10.2 Preview

Purpose:

- Pull-request review
- Content review
- Accessibility
- Integration sandbox
- Visual QA

Rules:

- Deployment protection
- Noindex
- Preview database
- CRM sandbox
- Email allowlist
- Test analytics

### 10.3 Staging

Purpose:

- Production-like final validation
- Domain and provider integration
- Legal and executive acceptance

Rules:

- Production schema
- Nonproduction data
- Production-like secrets
- Manual promotion

### 10.4 Production

Purpose:

- Public traffic
- Real inquiries

Rules:

- Production database
- Production CMS
- Production CRM
- Production email
- Production analytics
- Monitoring and support staffed

## 11. Launch timeline checklist

### T minus 14 days

- [ ] Scope frozen
- [ ] Launch owner named
- [ ] Domain topology approved
- [ ] CMS owner trained
- [ ] Claims register complete
- [ ] Legal review scheduled
- [ ] Follow-up staff confirmed
- [ ] Support escalation confirmed
- [ ] Production accounts created
- [ ] DNS inventory exported
- [ ] Rollback plan drafted

### T minus 7 days

- [ ] Production content approved
- [ ] Database production-ready
- [ ] CRM sandbox test passed
- [ ] Email authentication configured
- [ ] Analytics implementation complete
- [ ] Consent implementation complete
- [ ] Accessibility test complete
- [ ] Security review complete
- [ ] Performance review complete
- [ ] Staging deployment complete

### T minus 2 days

- [ ] Final content freeze
- [ ] Production environment variables verified
- [ ] Domain records prepared
- [ ] DNS time-to-live lowered when appropriate
- [ ] Backup complete
- [ ] Rollback deployment identified
- [ ] Smoke-test script prepared
- [ ] Launch communications prepared
- [ ] Monitoring dashboard open

### T minus 1 day

- [ ] Final staging signoff
- [ ] Inquiry end-to-end test passed
- [ ] One CRM sandbox record confirmed
- [ ] One acknowledgment email confirmed
- [ ] Analytics real-time test passed
- [ ] Search metadata verified
- [ ] No critical defect open
- [ ] Go or no-go meeting complete

### Launch

- [ ] Production deployment created
- [ ] Deployment reviewed before domain assignment
- [ ] Domain promoted
- [ ] DNS and SSL verified
- [ ] Public routes smoke-tested
- [ ] Inquiry submitted
- [ ] Durable record verified
- [ ] CRM record verified
- [ ] Acknowledgment verified
- [ ] Analytics event verified
- [ ] Logs and errors reviewed
- [ ] Legal copy spot-checked
- [ ] Team notified

### T plus 15 minutes

- [ ] Error rate normal
- [ ] Inquiry pipeline healthy
- [ ] No redirect loop
- [ ] No certificate issue
- [ ] No personal-data logging
- [ ] Core routes available

### T plus 1 hour

- [ ] Performance normal
- [ ] Analytics events plausible
- [ ] CRM delivery latency acceptable
- [ ] No critical accessibility regression
- [ ] No support incident
- [ ] Confirm or rollback decision recorded

### T plus 1 day

- [ ] Search Console inspected
- [ ] Consent behavior inspected
- [ ] Inquiries reconciled platform to CRM
- [ ] Follow-up service level inspected
- [ ] Errors triaged
- [ ] Launch summary sent

### T plus 7 days

- [ ] Funnel baseline reviewed
- [ ] Content questions collected
- [ ] Search queries reviewed
- [ ] Accessibility feedback reviewed
- [ ] Operational incidents reviewed
- [ ] Backlog reprioritized

### T plus 30 days

- [ ] Measurement Readiness Index recalculated
- [ ] Content and claims reviewed
- [ ] Inquiry quality reviewed
- [ ] Follow-up capacity reviewed
- [ ] Performance field data reviewed
- [ ] Retention and privacy reviewed
- [ ] Portal pilot decision revisited

## 12. Deployment procedure

### 12.1 Prepare

- Freeze scope
- Verify commit and approvals
- Verify tests and build
- Verify environment matrix
- Verify backup
- Verify rollback
- Notify owners

### 12.2 Stage

- Build production deployment without assigning public domain
- Run final smoke tests
- Verify production environment values
- Verify database migration
- Verify CMS content
- Verify providers

### 12.3 Promote

- Assign production domain to the staged deployment
- Monitor deployment and traffic
- Do not leave the launch unattended

Vercel supports staged production deployments, preview promotion, and instant rollback by reassigning domains to a prior deployment. Environment-variable differences still require care because rollback does not rebuild the old deployment. [Vercel deployment promotion](https://vercel.com/docs/deployments/promoting-a-deployment).

### 12.4 Verify

Test:

- Health
- Routes
- Inquiry
- Persistence
- CRM
- Email
- Analytics
- Consent
- Search
- Performance
- Logs

### 12.5 Confirm or rollback

Record:

- Decision
- Time
- Approver
- Evidence
- Known defects
- Next review

## 13. Rollback

### 13.1 Immediate rollback triggers

- Public site unavailable
- Inquiry persistence failure
- Duplicate or lost inquiry
- Personal-data exposure
- Incorrect legal or financial claim
- Cross-tenant access
- Authentication bypass
- Severe redirect or domain failure
- Critical accessibility blocker in the primary journey

### 13.2 Conditional rollback triggers

- Error rate materially above baseline
- Largest Contentful Paint degrades by more than 50%
- CRM delivery backlog exceeds recovery target
- Consent mechanism fails
- Search canonical or indexing error affects the full site

### 13.3 Rollback steps

1. Stop domain promotion or reassign prior deployment
2. Disable inquiry acceptance when persistence cannot be trusted
3. Preserve database and delivery records
4. Notify owners
5. Verify prior deployment health
6. Reconcile any in-flight inquiry
7. Investigate after stability

### 13.4 Database rollback

Do not automatically reverse a destructive migration.

Require:

- Backward-compatible migrations
- Expand and contract pattern
- Backup
- Tested restore
- Reconciliation plan
- Data owner approval

## 14. Handoff

### 14.1 Product handoff

- [ ] Scope and release boundaries
- [ ] Requirement traceability
- [ ] User flows
- [ ] Content matrix
- [ ] Success metrics
- [ ] Backlog
- [ ] Decision log

### 14.2 Design handoff

- [ ] UX/UI direction
- [ ] Figma or equivalent source
- [ ] Design tokens
- [ ] Component inventory
- [ ] Responsive annotations
- [ ] Accessibility annotations
- [ ] Motion and reduced motion
- [ ] Asset IDs and rights
- [ ] Visual QA baseline

### 14.3 Content handoff

- [ ] CMS schemas
- [ ] Page owners
- [ ] Claims register
- [ ] Evidence records
- [ ] Copy statuses
- [ ] Asset statuses
- [ ] Review calendar
- [ ] Publishing guide
- [ ] Legal escalation

### 14.4 Engineering handoff

- [ ] Architecture diagram
- [ ] Environment matrix
- [ ] Database schema
- [ ] Migration guide
- [ ] Integration contracts
- [ ] API and webhook docs
- [ ] Event dictionary
- [ ] Error catalog
- [ ] Runbooks
- [ ] Dependency owners
- [ ] Security model

### 14.5 Operations handoff

- [ ] Inquiry routing
- [ ] CRM workflow
- [ ] Response service level
- [ ] Manual recovery
- [ ] Dead-letter process
- [ ] Support contacts
- [ ] Monitoring dashboard
- [ ] Escalation tree
- [ ] Weekend and after-hours ownership

### 14.6 Access handoff

Create an access matrix for:

- Git provider
- Vercel
- DNS
- Database
- Sanity
- CRM
- Email
- Analytics
- Search Console
- Consent manager
- Error monitoring
- Password manager

For each:

- Owner
- Administrator
- Backup administrator
- Least-privilege roles
- Multi-factor status
- Recovery method
- Offboarding process

### 14.7 Documentation handoff

Deliver:

- README
- PRD
- Discovery Brief
- Scope and Requirements
- Sitemap and User Flows
- Content Matrix
- UX/UI Direction Brief
- Technical and Launch Checklist
- Architecture decision records
- Incident runbook
- Rollback runbook
- Content publishing guide
- Analytics dictionary

## 15. Launch evidence package

Archive:

- Approved commit
- Deployment URL
- Build output
- Test output
- Accessibility report
- Performance report
- Security review
- Content and legal approval
- Environment verification
- Database backup and restore evidence
- Inquiry smoke-test reference
- CRM record reference
- Analytics debug evidence
- Domain and SSL evidence
- Go or no-go record
- Rollback target

Do not store passwords, tokens, or unnecessary personal data in the package.

## 16. Final launch gate

### Platform

- [ ] Production architecture complete
- [ ] Demo adapters removed from production
- [ ] Durable inquiry storage active
- [ ] Backups and restore tested
- [ ] Monitoring active

### CMS

- [ ] Content model complete
- [ ] Roles tested
- [ ] Preview secure
- [ ] Approved-only publishing enforced
- [ ] Withdrawal and cache invalidation tested

### Analytics

- [ ] Measurement score at least 70
- [ ] Events validated
- [ ] No personal data
- [ ] Consent validated
- [ ] Dashboard owner assigned

### Domains

- [ ] Canonical topology approved
- [ ] DNS and SSL verified
- [ ] Redirects verified
- [ ] Search Console verified
- [ ] Cookie scope verified

### QA

- [ ] Functional pass
- [ ] Content and legal pass
- [ ] Accessibility pass
- [ ] Visual pass
- [ ] Performance pass
- [ ] Security and privacy pass
- [ ] Search pass
- [ ] Analytics pass

### Handoff

- [ ] Owners trained
- [ ] Access transferred
- [ ] Runbooks approved
- [ ] Escalation staffed
- [ ] Rollback tested
- [ ] Evidence archived

Launch only when every required checkbox is complete or has a named, dated, risk-accepted exception.

## 17. Immediate next actions

1. Approve Vercel, managed PostgreSQL, Sanity, and GA4 as the reference stack
2. Approve primary-domain path routing or the subdomain fallback
3. Select the customer relationship management and email providers
4. Assign technical, CMS, analytics, domain, and launch owners
5. Implement durable inquiry storage
6. Configure separate preview and production resources
7. Implement CMS schemas and approval controls
8. Implement and validate analytics
9. Close copy, asset, and legal launch blockers
10. Schedule staging, go or no-go, and rollback rehearsal

## 18. Primary references

### Internal

- [UX/UI Direction Brief v1.0](Buddas_Franchise_Platform_UX_UI_Direction_Brief_v1.0.md)
- [Content Matrix v1.0](Buddas_Franchise_Platform_Content_Matrix_v1.0.md)
- [Sitemap and User Flows v1.0](Buddas_Franchise_Platform_Sitemap_and_User_Flows_v1.0.md)
- [Scope and Requirements v1.0](Buddas_Franchise_Platform_Scope_and_Requirements_v1.0.md)
- [Discovery Brief v1.0](Buddas_Franchise_Platform_Discovery_Brief_v1.0.md)
- [Platform README](README.md)
- [Current application](../../franchise-website/)

### External

- [Next.js production checklist](https://nextjs.org/docs/app/guides/production-checklist)
- [Next.js instrumentation](https://nextjs.org/docs/app/guides/instrumentation)
- [Vercel environments](https://vercel.com/docs/deployments/environments)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Vercel domain setup](https://vercel.com/docs/domains/set-up-custom-domain)
- [Vercel deployment promotion](https://vercel.com/docs/deployments/promoting-a-deployment)
- [Sanity Draft Mode](https://www.sanity.io/docs/visual-editing/implementing-draft-mode)
- [Sanity Content Releases](https://www.sanity.io/docs/studio/content-releases)
- [Sanity roles](https://www.sanity.io/docs/user-guides/roles)
- [GA4 recommended events](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [Google Consent Mode](https://developers.google.com/tag-platform/security/concepts/consent-mode)

> **Prepare, stage, verify, promote, watch, and roll back before uncertainty becomes harm.**

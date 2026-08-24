# Define the scope and requirements for the Budda’s franchise platform

**Document:** Scope and requirements  
**Product:** Budda’s franchise recruitment site and operator portal  
**Version:** 1.0  
**Date:** August 21, 2026  
**Status:** Proposed release baseline  
**Primary audience:** Product, franchise development, operations, brand, legal, design, engineering, and quality assurance  
**Source documents:** Discovery Brief v1.0, Franchise Website PRD v1.0, platform README, brand strategy, and design system  

This document defines the pages, features, integrations, exclusions, and acceptance criteria for the Budda’s franchise platform. It distinguishes committed production scope from conditional pilot scope and future franchise-offering capability.

## 1. Executive summary

The platform contains two related products:

1. **Public franchise recruitment:** An evidence-led website that explains Budda’s, helps prospects assess fit, and captures qualified interest
2. **Operator portal:** A protected workspace for franchise operations, supplies, orders, resources, support, and account context

Release 1 commits to the public qualified-interest experience and its production inquiry pipeline. The operator portal may enter a controlled pilot only after discovery validates operator jobs and the required identity, data, tenancy, and integration foundations.

Active franchise-offering features remain outside Release 1. Budda’s may enable them only after leadership and franchise counsel approve operational readiness, the Franchise Disclosure Document, state rules, qualification thresholds, and any financial-performance representations.

### Definition of done

Release 1 is done when:

- Every committed public page is complete and approved
- A prospect can understand the concept, evaluate fit, and submit an inquiry
- The application stores every accepted inquiry durably before displaying success
- Every inquiry receives one routing state and an auditable delivery outcome
- Legal, privacy, accessibility, security, search, and performance gates pass
- Portal demonstration routes remain clearly labeled and isolated from production claims
- No excluded active-offering feature can render through ordinary content editing

## 2. Release scope model

### 2.1 Release 1: Qualified-interest production site

**Status:** Committed

Release 1 includes:

- Public franchise pages
- Public legal and accessibility pages
- Approved evidence and disclosure content
- Franchise inquiry form
- Durable inquiry persistence
- Lead classification and delivery
- Acknowledgment and failure recovery
- Analytics without personally identifying information
- Content approval and expiry controls
- Search, accessibility, performance, privacy, and security requirements

Release 1 does not represent that Budda’s is offering franchises in every market.

### 2.2 Release 1P: Operator portal pilot

**Status:** Conditional

Release 1P may begin only after Discovery Gate 3 confirms:

- At least three validated operator jobs
- A production identity provider
- A durable tenant data model
- Database-enforced location access
- Known systems of record
- Operational owners for catalog, orders, resources, and support
- A pilot support and incident plan

Until this gate passes, `/portal` remains a demonstration environment and may not contain production franchise data.

### 2.3 Release 2: Active franchise offering

**Status:** Excluded from Release 1

Release 2 may add:

- Approved territories
- Published financial qualification thresholds
- Franchise fees and estimated initial investment
- Item 19 financial-performance representations
- State-aware offer controls
- Franchise Disclosure Document delivery and receipt evidence
- Agreement and payment timing controls
- Broker or franchise-sales organization routing

Release 2 requires a separate legal acceptance matrix. The Federal Trade Commission states that financial-performance claims must have a reasonable basis and appear in Item 19, subject to narrow exceptions. [FTC consumer guide](https://www.ftc.gov/business-guidance/resources/consumers-guide-buying-franchise).

## 3. Requirements and assumptions

### 3.1 Product requirements

- **REQ-001:** Budda’s remains the master brand
- **REQ-002:** The Budda Roll remains the primary product icon
- **REQ-003:** Release 1 uses qualified-interest language
- **REQ-004:** Public claims require source, owner, status, and review date
- **REQ-005:** Planned capabilities must not appear as current support
- **REQ-006:** Every accepted inquiry must be durable, classified, attributable, and auditable
- **REQ-007:** Protected portal data must be role-scoped and location-scoped on the server
- **REQ-008:** The platform must meet WCAG 2.2 AA
- **REQ-009:** The platform must define failure, retry, empty, stale, and unavailable states
- **REQ-010:** Active-offering content must require a protected release gate
- **REQ-011:** Analytics must exclude direct inquiry identifiers
- **REQ-012:** Production secrets must remain server-only

### 3.2 Approved assumptions

- The initial market is the United States
- International submissions route to future interest or manual review
- The primary prospect is an experienced owner-operator or emerging multi-unit group
- The public site remains under `/franchise`
- Existing public route names remain canonical for Release 1
- The operator portal shares the application but uses separate navigation and access controls
- Server Components remain the default rendering model
- Server Actions or Route Handlers handle mutations
- The platform remains a modular monolith for Release 1
- No artificial intelligence feature is required

### 3.3 Controlled variables

These values require accountable approval before configuration:

- Available and restricted markets
- Operator experience threshold
- Capital and net-worth threshold
- Franchise fees and investment range
- Item 19 content
- Franchise support commitments
- Human response service level
- Customer relationship management destination
- Identity provider
- Portal systems of record
- Email, phone, and text consent language
- Data-retention periods

The conservative Release 1 behavior applies when a controlled variable lacks approval.

## 4. Information architecture

### 4.1 Canonical route tree

```text
Root (/)
└── Franchise (/franchise)
    ├── About (/franchise/about)
    ├── Why Budda's (/franchise/why-buddas)
    ├── The Opportunity (/franchise/the-opportunity)
    ├── Process (/franchise/process)
    ├── FAQ (/franchise/faq)
    ├── Contact (/franchise/contact)
    └── Login (/franchise/login)

Legal
├── Privacy (/privacy)
├── Terms (/terms)
└── Accessibility (/accessibility)

Protected portal (/portal)
├── Dashboard (/portal)
├── Supplies (/portal/supplies)
│   └── Supply detail (/portal/supplies/[slug])
├── Cart (/portal/cart)
├── Checkout (/portal/checkout)
│   └── Confirmation (/portal/checkout/confirmation)
├── Orders (/portal/orders)
├── Resources (/portal/resources)
├── Support (/portal/support)
└── Account (/portal/account)
```

### 4.2 Redirect requirements

- **IA-001:** `/` permanently or framework-directly redirects to `/franchise`
- **IA-002:** `/franchisee-login` permanently redirects to `/franchise/login`
- **IA-003:** `/portal/store` redirects to `/portal/supplies`
- **IA-004:** `/portal/store/[slug]` redirects to the matching `/portal/supplies/[slug]`
- **IA-005:** Redirects preserve safe query parameters required for location context
- **IA-006:** Redirects must not allow an external destination

The `/portal/store` routes are compatibility aliases. They must not remain duplicate canonical pages.

### 4.3 Public header

The public header includes:

1. Why Budda’s
2. The Opportunity
3. Process
4. FAQ
5. Contact
6. Operator login

Requirements:

- **NAV-001:** Budda’s logo links to `/franchise`
- **NAV-002:** The primary call to action is `Request franchise information` or approved equivalent
- **NAV-003:** Operator login is visually secondary to the inquiry action
- **NAV-004:** The mobile menu preserves the same information order
- **NAV-005:** The current route has a non-color-only active state
- **NAV-006:** Keyboard focus remains visible and unobscured

### 4.4 Portal navigation

The portal navigation includes:

- Dashboard
- Supplies
- Cart
- Orders
- Resources
- Support
- Account
- Location switcher when the session permits multiple locations
- Sign out

Requirements:

- **NAV-101:** Portal navigation never links to data outside the verified session
- **NAV-102:** Location changes preserve only valid route state
- **NAV-103:** The cart count includes only accessible locations
- **NAV-104:** Sign out invalidates the current session
- **NAV-105:** Protected navigation is not indexed

### 4.5 Internal linking

- **IA-101:** Every public child page receives at least one contextual link from another public page
- **IA-102:** The homepage links to every primary public section
- **IA-103:** Every page with an inquiry call to action links to `/franchise/contact`
- **IA-104:** The process and opportunity pages cross-link
- **IA-105:** Legal and accessibility pages appear in the footer
- **IA-106:** No committed public page is orphaned

## 5. Public page requirements

### 5.1 Franchise homepage

**Route:** `/franchise`  
**Requirement prefix:** HOME

Purpose: Explain the concept, show approved operating evidence, and move a relevant prospect toward fit and inquiry.

Required features:

- **HOME-001:** Budda’s identity and Hawaiian Bakery & Grill descriptor
- **HOME-002:** Home of the Budda Roll positioning
- **HOME-003:** Product Truth hero media
- **HOME-004:** One primary educational call to action
- **HOME-005:** One high-intent inquiry call to action
- **HOME-006:** Guest-demand and occasion story
- **HOME-007:** Verified restaurant or operating proof
- **HOME-008:** Current support summary
- **HOME-009:** Opportunity summary with disclosure treatment
- **HOME-010:** Process preview
- **HOME-011:** FAQ preview
- **HOME-012:** Final inquiry call to action with non-offer language

Acceptance criteria:

- A new participant can identify the brand, category, product icon, and franchise purpose after ten seconds
- Every numeric or operating claim maps to the claims register
- The hero action is visible at 320, 375, 768, 1,024, and 1,440 CSS pixels
- Product media matches the Product Truth Master
- Planned support does not appear as available
- The final call to action does not imply approval, territory reservation, or offer

### 5.2 About

**Route:** `/franchise/about`  
**Requirement prefix:** ABOUT

Purpose: Explain the origin, people, growth doctrine, and cultural responsibilities.

Required features:

- **ABOUT-001:** Family butter-roll origin
- **ABOUT-002:** La‘ie and Hawai‘i context
- **ABOUT-003:** Growth from roll to restaurant
- **ABOUT-004:** Generosity and hospitality evidence
- **ABOUT-005:** Growth doctrine
- **ABOUT-006:** Cultural guardrail
- **ABOUT-007:** Link to opportunity and inquiry

Acceptance criteria:

- The page distinguishes verified history from aspiration
- Hawai‘i appears through specific story, people, food, and place
- The page contains no generic tiki, surf, hibiscus, or tourism framing
- Founder and community claims have approved sources
- A reader can explain why the origin matters to operations

### 5.3 Why Budda’s

**Route:** `/franchise/why-buddas`  
**Requirement prefix:** WHY

Purpose: Explain the concept’s product, occasion, and hospitality differentiation.

Required features:

- **WHY-001:** Budda Roll product identity
- **WHY-002:** Bakery-led Hawaiian comfort position
- **WHY-003:** Daypart and occasion utility
- **WHY-004:** Guest-experience and hospitality model
- **WHY-005:** Verified locations
- **WHY-006:** Evidence hierarchy
- **WHY-007:** Inquiry call to action

Acceptance criteria:

- The page does not frame Budda’s as another plate-lunch chain
- Evidence follows real restaurant, real product, real system, support, process, disclosure, next-step order
- Locations show current name and address
- No unsupported superlative appears
- Content contracts have stable, testable identifiers

### 5.4 The opportunity

**Route:** `/franchise/the-opportunity`  
**Requirement prefix:** OPP

Purpose: Explain fit, readiness, support, and the current investment-information boundary.

Required features:

- **OPP-001:** Ideal operator profile
- **OPP-002:** Experience expectations
- **OPP-003:** Market-interest explanation
- **OPP-004:** Current support categories
- **OPP-005:** Public investment-process facts
- **OPP-006:** Unpublished or pending fields clearly withheld
- **OPP-007:** Readable legal disclosure
- **OPP-008:** Inquiry action

Acceptance criteria:

- Release 1 presents interest and mutual evaluation, not active market availability
- The page does not publish fee, net-worth, liquidity, projected return, profit, or payback information without legal approval
- Any financial-performance representation matches the current Item 19 content and required context
- Qualifications do not imply guaranteed approval
- Disclosure text meets the same readable type and contrast standards as body content

### 5.5 Process

**Route:** `/franchise/process`  
**Requirement prefix:** PROC

Purpose: Explain the current mutual-evaluation process and separate it from future franchise-award stages.

Required features:

- **PROC-001:** Release 1 inquiry stages
- **PROC-002:** Internal review explanation
- **PROC-003:** Introductory conversation stage
- **PROC-004:** Future diligence boundary
- **PROC-005:** Current-versus-future stage labels
- **PROC-006:** Frequently asked process questions
- **PROC-007:** Inquiry action

Acceptance criteria:

- Every stage has an owner, input, outcome, and status
- Release 1 does not promise a Franchise Disclosure Document, interview, approval, or opening
- The sequence remains understandable without animation
- Mobile and screen-reader order matches the visual order
- Future stages cannot render as current through ordinary content changes

### 5.6 FAQ

**Route:** `/franchise/faq`  
**Requirement prefix:** FAQ

Purpose: Answer material questions without bypassing claims or disclosure controls.

Required topics:

- **FAQ-001:** What Budda’s is
- **FAQ-002:** What makes the concept different
- **FAQ-003:** Current franchise-program status
- **FAQ-004:** Ideal operator
- **FAQ-005:** Market-interest process
- **FAQ-006:** Support
- **FAQ-007:** Inquiry follow-up
- **FAQ-008:** Difference between inquiry, application, and offer
- **FAQ-009:** Legal and privacy links

Acceptance criteria:

- Every question and answer is available in semantic HTML
- Accordion triggers expose expanded state
- The complete FAQ remains usable when JavaScript is unavailable
- Answers containing claims follow the same approval rules as page copy
- No material limitation appears only inside a collapsed footnote

### 5.7 Contact and inquiry

**Route:** `/franchise/contact`  
**Requirement prefix:** INQ

Purpose: Collect enough information for a useful, compliant internal review.

Required fields:

- **INQ-001:** First name
- **INQ-002:** Last name
- **INQ-003:** Email
- **INQ-004:** Optional phone
- **INQ-005:** City and state
- **INQ-006:** Market of interest
- **INQ-007:** Relevant business or hospitality experience
- **INQ-008:** Self-reported capital-readiness band using approved non-financial wording
- **INQ-009:** Preferred timeline
- **INQ-010:** Optional message
- **INQ-011:** Consent to respond

Submission requirements:

- **INQ-020:** Server-issued signed form token
- **INQ-021:** Honeypot
- **INQ-022:** Duplicate field rejection
- **INQ-023:** Server-side schema validation
- **INQ-024:** Normalization before persistence
- **INQ-025:** Durable persistence before success
- **INQ-026:** Idempotency key
- **INQ-027:** Shared contact and source throttling
- **INQ-028:** Customer relationship management delivery
- **INQ-029:** Retry and dead-letter state
- **INQ-030:** Reference number
- **INQ-031:** Versioned consent and form context
- **INQ-032:** Approved direct-contact fallback

Acceptance criteria:

- Valid submission creates one durable inquiry
- Repeated submission with the same idempotency key returns the original reference
- Invalid input preserves safe field values and identifies corrections
- Success does not depend on immediate customer relationship management availability
- Personally identifying form values do not enter analytics
- A receiver timeout does not create an uncontrolled retry loop
- Every inquiry records form, content, legal, and consent versions
- Production throttling coordinates across instances and restarts
- The form remains operable without client JavaScript
- Errors are announced and focus moves to the summary

### 5.8 Operator login

**Route:** `/franchise/login`  
**Requirement prefix:** LOGIN

Purpose: Authenticate approved portal users.

Release 1 requirements:

- **LOGIN-001:** Demo environment label
- **LOGIN-002:** Noindex metadata
- **LOGIN-003:** Safe return path limited to `/portal`
- **LOGIN-004:** Accessible validation
- **LOGIN-005:** Signed, HTTP-only demonstration session

Release 1P production requirements:

- **LOGIN-101:** Approved OpenID Connect or equivalent identity provider
- **LOGIN-102:** Revocable server-side session
- **LOGIN-103:** Multi-factor authentication policy
- **LOGIN-104:** Account lifecycle
- **LOGIN-105:** Role and location provisioning
- **LOGIN-106:** Login, logout, failure, and privilege audit
- **LOGIN-107:** Recovery without knowledge-based authentication

Acceptance criteria:

- Demo credentials never appear in a production environment
- An unauthenticated portal request redirects to login
- An invalid return path redirects to `/portal`
- Session identifiers are generated, validated, rotated, expired, and revoked through the approved identity design
- Session responses are private and not stored by shared caches

OWASP recommends treating session identifiers as untrusted input and using strict, server-validated session management. [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

### 5.9 Legal and accessibility pages

**Routes:** `/privacy`, `/terms`, `/accessibility`  
**Requirement prefix:** LEG

- **LEG-001:** Privacy notice describes actual data practices
- **LEG-002:** Terms distinguish informational content from an offer
- **LEG-003:** Accessibility statement names the standard and contact path
- **LEG-004:** Each document shows owner, effective date, and review date
- **LEG-005:** Updates preserve version history
- **LEG-006:** Collection points link to the relevant notice

Acceptance criteria:

- Legal owners approve current content
- No template language describes technology or data not in use
- Users can access legal pages without authentication
- Documents remain readable at 200% zoom and 320 CSS pixels

## 6. Cross-cutting public features

### 6.1 Content governance

- **CONT-001:** Content statuses include draft, brand review, legal review, approved, expired, and withdrawn
- **CONT-002:** Public pages render only approved, effective content
- **CONT-003:** High-risk claims require named legal approval
- **CONT-004:** Evidence records include source, period, geography, owner, and expiry
- **CONT-005:** Withdrawn content triggers cache invalidation
- **CONT-006:** Preview content remains authenticated and noindexed
- **CONT-007:** Mode B content requires a protected deployment flag

### 6.2 Brand and product truth

- **BRAND-001:** Use official wordmark and descriptor assets
- **BRAND-002:** Use Product Truth-approved Budda Roll media
- **BRAND-003:** Use canonical design tokens
- **BRAND-004:** Poppins, DM Sans, and approved brand artwork follow defined roles
- **BRAND-005:** Hawai‘i appears through specific story and behavior
- **BRAND-006:** Concept imagery never appears as current product or operating proof
- **BRAND-007:** Franchise pages do not create a separate corporate identity

### 6.3 Search and metadata

- **SEO-001:** Unique title and description per public page
- **SEO-002:** Canonical URL per page
- **SEO-003:** Open Graph image and metadata
- **SEO-004:** `robots.txt` allows public franchise pages
- **SEO-005:** Portal and login routes are noindex
- **SEO-006:** XML sitemap includes only approved public pages
- **SEO-007:** Structured data matches visible content
- **SEO-008:** Redirects prevent duplicate route indexing
- **SEO-009:** Stale territory content cannot remain indexed

### 6.4 Analytics

- **ANA-001:** Page view
- **ANA-002:** Call-to-action click
- **ANA-003:** Evidence-section exposure
- **ANA-004:** Form start
- **ANA-005:** Step and field error
- **ANA-006:** Submission attempt
- **ANA-007:** Durable inquiry accepted
- **ANA-008:** Routing classification
- **ANA-009:** Delivery state
- **ANA-010:** Time to first response

Analytics payloads must exclude name, email, phone, full free text, raw address, and financial details.

## 7. Conditional operator portal scope

Release 1P requirements apply only after the portal gate passes.

### 7.1 Dashboard

**Route:** `/portal`  
**Prefix:** PORT-DASH

Features:

- Current location context
- Open order count
- Approved supply count
- Current resources
- Announcements
- Cart status
- Primary operational actions

Acceptance criteria:

- Metrics come from production systems of record
- Every metric names its freshness timestamp
- A franchisee cannot request another tenant’s data
- Empty and unavailable states identify the owner and next action

### 7.2 Supplies

**Routes:** `/portal/supplies` and `/portal/supplies/[slug]`  
**Prefix:** PORT-SUP

Features:

- Search and category filter
- Location-specific assortment
- Current price
- Pack size
- Availability
- Order restrictions
- Product specification
- Quantity selection
- Add to cart

Acceptance criteria:

- Price and availability identify their system and freshness
- Unavailable items cannot enter checkout
- Quantity limits enforce on server
- Location assortment enforces on server
- Product details meet accessibility and mobile requirements

### 7.3 Cart and checkout

**Routes:** `/portal/cart`, `/portal/checkout`, `/portal/checkout/confirmation`  
**Prefix:** PORT-CHECK

Features:

- Cart review and quantity update
- Location lock
- Subtotal
- Tax, fees, invoice, or payment treatment
- Delivery or fulfillment expectation
- Submission review
- Idempotent order creation
- Confirmation and reference

Acceptance criteria:

- Production cart is durable across sessions according to policy
- Checkout revalidates price, availability, authorization, and location
- Double submission creates one order
- Failure does not clear the cart
- Confirmation appears only after durable order acceptance
- Money uses `Intl.NumberFormat` and approved currency rules
- Tax and payment behavior matches the selected operating model

### 7.4 Orders

**Route:** `/portal/orders`  
**Prefix:** PORT-ORD

Features:

- Current and historical orders
- Status
- Dates and expected delivery
- Line items and totals
- Invoice reference
- Support action

Acceptance criteria:

- Orders are tenant-scoped in the database query
- Status comes from the system of record
- Users can distinguish submitted, accepted, processing, shipped, delivered, canceled, and failed
- Stale status identifies the last successful update

### 7.5 Resources

**Route:** `/portal/resources`  
**Prefix:** PORT-RES

Features:

- Governed resource catalog
- Category and search
- Version and effective date
- Audience and location scope
- Download or view
- Replacement and expiry state

Acceptance criteria:

- Users see only authorized resources
- Current version is unambiguous
- Withdrawn resources cannot be downloaded
- Files use authenticated storage
- Downloads create audit events when required

### 7.6 Support

**Route:** `/portal/support`  
**Prefix:** PORT-SUPT

Features:

- Topic selection
- Subject and detail
- Location context
- Optional order, resource, or product reference
- Case creation
- Reference number
- Status and response expectation

Acceptance criteria:

- Submission creates one durable case
- Routing uses topic and location
- User receives a reference
- Sensitive data instructions appear before free text
- Case state is visible if the chosen support system permits it

### 7.7 Account

**Route:** `/portal/account`  
**Prefix:** PORT-ACC

Features:

- User profile
- Role
- Accessible locations
- Contact settings
- Security settings
- Legal and policy acknowledgments
- Sign out

Acceptance criteria:

- The account page does not expose internal authorization claims beyond user need
- Role and location changes require an approved provisioning workflow
- Security events are auditable
- Contact preference changes persist and propagate to the correct system

## 8. Integration requirements

### 8.1 Integration priority

| ID | Integration | Release | Direction | Failure policy |
| --- | --- | --- | --- | --- |
| INT-001 | Durable PostgreSQL or equivalent | R1 | Internal | Inquiry success blocked if persistence fails |
| INT-002 | Customer relationship management | R1 | Outbound and status callback where available | Queue and retry after persistence |
| INT-003 | Transactional email | R1 | Outbound | Do not fail accepted inquiry |
| INT-004 | Analytics | R1 | Outbound | Never block user flow |
| INT-005 | Error and performance monitoring | R1 | Outbound | Buffer or degrade without exposing data |
| INT-006 | Consent and privacy control | R1 | Bidirectional | Disable nonessential tracking when unavailable |
| INT-007 | Content management | R1 | Inbound | Serve last approved content; alert on stale data |
| INT-101 | Identity provider | R1P | Bidirectional | Fail closed |
| INT-102 | Catalog and pricing | R1P | Inbound | Show unavailable/stale state; block checkout when unsafe |
| INT-103 | Order or enterprise resource planning | R1P | Bidirectional | Preserve idempotency; queue or stop based on state |
| INT-104 | Payment or invoicing | R1P | Bidirectional | Fail closed; never infer payment success |
| INT-105 | Tax | R1P | Bidirectional | Block financial submission if required result is unavailable |
| INT-106 | Fulfillment | R1P | Bidirectional | Show last update and degraded status |
| INT-107 | Authenticated file storage | R1P | Bidirectional | Fail closed for protected files |
| INT-108 | Support case management | R1P | Bidirectional | Persist request and retry delivery |

### 8.2 Common integration contract

Every production integration must define:

- **INT-C01:** Accountable owner
- **INT-C02:** System of record
- **INT-C03:** Authentication and authorization
- **INT-C04:** Request and response schema
- **INT-C05:** Versioning policy
- **INT-C06:** Timeout
- **INT-C07:** Retry policy with jitter and maximum attempts
- **INT-C08:** Idempotency behavior
- **INT-C09:** Rate limits
- **INT-C10:** Data classification
- **INT-C11:** Logging and redaction
- **INT-C12:** Health and service-level objective
- **INT-C13:** Degraded behavior
- **INT-C14:** Alert and escalation
- **INT-C15:** Contract tests
- **INT-C16:** Sandbox
- **INT-C17:** Migration and rollback

### 8.3 Inquiry delivery

The current direct webhook remains an adapter, not the durable source of truth.

Requirements:

- **INT-I01:** Persist inquiry before outbound delivery
- **INT-I02:** Use HTTPS
- **INT-I03:** Allowlist receiver host
- **INT-I04:** Authenticate the receiver
- **INT-I05:** Block redirects
- **INT-I06:** Send idempotency key
- **INT-I07:** Enforce bounded timeout
- **INT-I08:** Separate retryable and terminal failure
- **INT-I09:** Dead-letter exhausted deliveries
- **INT-I10:** Store delivery attempts without raw sensitive payload logs

OWASP recommends encrypted transport, schema validation, content validation, and resource limits for web services. [OWASP Web Service Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Web_Service_Security_Cheat_Sheet.html).

### 8.4 Identity and tenancy

- **INT-A01:** Identity uses a production provider, not hard-coded accounts
- **INT-A02:** Application authorization remains server-side
- **INT-A03:** Database queries require tenant and location context
- **INT-A04:** Administrators receive explicit managed-location grants
- **INT-A05:** Privilege changes revoke or refresh sessions
- **INT-A06:** Sensitive actions may require reauthentication
- **INT-A07:** Authentication and authorization events are audited

### 8.5 Content management

- **INT-CMS01:** Support preview and approved publication
- **INT-CMS02:** Support claim metadata and expiry
- **INT-CMS03:** Support legal and brand approvers
- **INT-CMS04:** Trigger targeted cache revalidation
- **INT-CMS05:** Prevent editor activation of Mode B
- **INT-CMS06:** Preserve content version shown with each inquiry

## 9. Data requirements

### 9.1 Inquiry records

Store:

- Prospect identifier
- Normalized contact information
- Market interest
- Experience and readiness
- Message
- Consent version and timestamp
- Source and campaign
- Form, content, and legal version
- Classification
- Lifecycle state
- Delivery attempts
- Human follow-up timestamps

### 9.2 Portal records

Conditional Release 1P data domains:

- Users
- Roles and grants
- Franchise organizations
- Locations
- Products
- Location assortment
- Prices
- Availability
- Carts
- Orders and lines
- Invoices
- Resources and versions
- Support cases
- Audit events

### 9.3 Data controls

- **DATA-001:** Encrypt transport and storage
- **DATA-002:** Apply least-privilege access
- **DATA-003:** Define retention by record type
- **DATA-004:** Support access, correction, deletion, and suppression where applicable
- **DATA-005:** Redact secrets and personal data from logs
- **DATA-006:** Back up durable records
- **DATA-007:** Test restoration
- **DATA-008:** Record auditable changes to high-risk data
- **DATA-009:** Prevent cross-tenant queries through database and application controls
- **DATA-010:** Use synthetic data outside production when possible

## 10. Non-functional requirements

### 10.1 Accessibility

- **NFR-A01:** Meet WCAG 2.2 AA
- **NFR-A02:** Keyboard-complete navigation and forms
- **NFR-A03:** Visible, unobscured focus
- **NFR-A04:** Programmatic labels and error relationships
- **NFR-A05:** Status announcements
- **NFR-A06:** 200% text zoom
- **NFR-A07:** Reflow at 320 CSS pixels
- **NFR-A08:** Reduced-motion support
- **NFR-A09:** Captions for meaningful video
- **NFR-A10:** Product target size of 44 by 44 CSS pixels where practical
- **NFR-A11:** Never fall below WCAG 2.5.8 minimum or spacing exceptions

WCAG 2.2 adds AA criteria for Focus Not Obscured and Target Size Minimum. [W3C WCAG 2.2 changes](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/).

### 10.2 Performance

- **NFR-P01:** Largest Contentful Paint no greater than 2.5 seconds at the 75th percentile
- **NFR-P02:** Interaction to Next Paint no greater than 200 milliseconds at the 75th percentile
- **NFR-P03:** Cumulative Layout Shift no greater than 0.1 at the 75th percentile
- **NFR-P04:** Reserved media dimensions
- **NFR-P05:** Responsive images
- **NFR-P06:** No autoplay hero video in Release 1
- **NFR-P07:** Load noncritical interactions after primary content
- **NFR-P08:** Monitor real-user performance by route and device

### 10.3 Reliability

- **NFR-R01:** Public content remains available during noncritical integration outages
- **NFR-R02:** Inquiry success requires durable persistence
- **NFR-R03:** Accepted inquiries survive process restart
- **NFR-R04:** Outbound delivery retries are bounded
- **NFR-R05:** Integration failure exposes a safe user state
- **NFR-R06:** Backups have a tested restore objective
- **NFR-R07:** Production changes have rollback procedures

### 10.4 Security

- **NFR-S01:** Transport Layer Security everywhere
- **NFR-S02:** Content Security Policy
- **NFR-S03:** Secure response headers
- **NFR-S04:** Server-side validation
- **NFR-S05:** Origin and cross-site request protections
- **NFR-S06:** Shared rate limiting
- **NFR-S07:** Secret management
- **NFR-S08:** Dependency and secret scanning
- **NFR-S09:** Audit events
- **NFR-S10:** Incident response
- **NFR-S11:** No production demo credentials
- **NFR-S12:** Protected responses use private, no-store caching

### 10.5 Privacy

- **NFR-PR01:** Notice at collection
- **NFR-PR02:** Purpose limitation
- **NFR-PR03:** Data minimization
- **NFR-PR04:** Retention and deletion
- **NFR-PR05:** Contact suppression
- **NFR-PR06:** Consent evidence
- **NFR-PR07:** Global Privacy Control handling when applicable
- **NFR-PR08:** No direct identifiers in analytics

### 10.6 Observability

- **NFR-O01:** Structured logs with correlation IDs
- **NFR-O02:** Personal-data redaction
- **NFR-O03:** Inquiry persistence and delivery metrics
- **NFR-O04:** Integration rate, error, and duration metrics
- **NFR-O05:** Content expiry alerts
- **NFR-O06:** Portal authorization-denial monitoring
- **NFR-O07:** Performance monitoring
- **NFR-O08:** Alert ownership and response instructions

## 11. Exclusions

### 11.1 Release 1 exclusions

- Active franchise offer
- Public territory reservation
- Public territory map marked available
- Item 19 financial-performance claims without approved Release 2 content
- Franchise fee or royalty publication
- Profit, return, break-even, or payback calculator
- Franchise agreement execution
- Payment or deposit collection
- Franchise award automation
- Broker marketplace
- International franchise sales
- Artificial intelligence chatbot
- Artificial intelligence qualification or rejection
- Automated legal advice
- Consumer ordering, rewards, or menu commerce
- Franchisee production data in the demo portal

### 11.2 Release 1P exclusions

Unless separately approved:

- Dynamic menu management
- Point-of-sale replacement
- Workforce scheduling
- Payroll
- Accounting general ledger
- Full learning management system
- Real-estate pipeline
- Construction project management
- Field-inspection platform
- Marketing automation suite
- Franchise relationship management suite
- Offline-first mobile application

The portal should integrate with systems that already own these jobs instead of recreating them.

### 11.3 Explicit non-requirements

- Tailwind CSS is not required; the current application uses CSS tokens
- Microservices are not required
- GraphQL is not required
- WebSockets are not required
- Native mobile apps are not required
- Dark mode is not required
- User-selectable themes are not required
- Public user accounts are not required

## 12. Consolidated acceptance criteria

### 12.1 Public release gate

- **AC-PUB-001:** All canonical routes return expected content or approved redirects
- **AC-PUB-002:** No committed public page is orphaned
- **AC-PUB-003:** Header, footer, and mobile navigation pass keyboard testing
- **AC-PUB-004:** Every claim has an approved evidence record
- **AC-PUB-005:** Expired or withdrawn claims do not render
- **AC-PUB-006:** Public metadata and canonical URLs validate
- **AC-PUB-007:** Portal and login routes remain noindex
- **AC-PUB-008:** Product Truth and brand review pass
- **AC-PUB-009:** Legal and privacy review pass
- **AC-PUB-010:** No Release 2 feature can be activated by a content editor

### 12.2 Inquiry gate

- **AC-INQ-001:** Valid form persists one inquiry
- **AC-INQ-002:** Invalid form identifies every correction without clearing valid fields
- **AC-INQ-003:** Duplicate idempotency key returns the original result
- **AC-INQ-004:** Customer relationship management outage does not lose an accepted inquiry
- **AC-INQ-005:** Exhausted delivery enters dead-letter or manual-review state
- **AC-INQ-006:** Every inquiry has one classification
- **AC-INQ-007:** Every inquiry records consent and content versions
- **AC-INQ-008:** Direct identifiers do not appear in analytics
- **AC-INQ-009:** Shared throttling survives restart and multiple instances
- **AC-INQ-010:** Form submission completes successfully when client JavaScript is unavailable
- **AC-INQ-011:** Screen reader announces error and success states
- **AC-INQ-012:** Human follow-up time is measurable

### 12.3 Portal pilot gate

- **AC-PORT-001:** Production identity replaces demo accounts
- **AC-PORT-002:** Every protected route verifies the session
- **AC-PORT-003:** Every data query enforces tenant and location
- **AC-PORT-004:** Attempted cross-tenant access fails and creates an audit event
- **AC-PORT-005:** Core jobs pass usability testing with pilot operators
- **AC-PORT-006:** Systems of record and freshness are visible
- **AC-PORT-007:** Order and support writes are durable and idempotent
- **AC-PORT-008:** Protected files require authorization
- **AC-PORT-009:** Portal pages remain private and no-store
- **AC-PORT-010:** Pilot monitoring, support, backup, and incident plans are staffed

### 12.4 Accessibility gate

- **AC-A11Y-001:** Zero critical automated accessibility violations
- **AC-A11Y-002:** Complete keyboard journey passes
- **AC-A11Y-003:** Desktop and mobile screen-reader journeys pass
- **AC-A11Y-004:** 200% zoom and 320-pixel reflow pass
- **AC-A11Y-005:** Focus remains visible and unobscured
- **AC-A11Y-006:** Reduced-motion mode preserves content and actions
- **AC-A11Y-007:** Form labels, instructions, errors, and status messages pass

### 12.5 Performance gate

- **AC-PERF-001:** Production build passes
- **AC-PERF-002:** Lighthouse repository budgets pass on primary routes
- **AC-PERF-003:** Deployed-preview audits pass
- **AC-PERF-004:** Real-user monitoring is active before production promotion
- **AC-PERF-005:** Core Web Vitals meet targets after sufficient field traffic

### 12.6 Security and privacy gate

- **AC-SEC-001:** Threat model reviewed
- **AC-SEC-002:** Dependency and secret scans pass
- **AC-SEC-003:** No fallback or demo secret in production
- **AC-SEC-004:** Webhook trust boundary verified
- **AC-SEC-005:** Content Security Policy tested
- **AC-SEC-006:** Logs inspected for personal-data leakage
- **AC-SEC-007:** Backup restore tested
- **AC-SEC-008:** Privacy notice matches actual data flow
- **AC-SEC-009:** Retention, deletion, and suppression workflows tested
- **AC-SEC-010:** Incident and rollback runbooks approved

## 13. Edge cases and non-happy paths

### Public content

- No markets are available
- A support capability loses approval
- A location closes or changes address
- A legal review expires
- Content management is unavailable
- Cached content outlives approval

Required behavior: Serve the last currently approved content, remove invalid claims, invalidate caches, and alert the owner.

### Inquiry

- JavaScript unavailable
- Form token expired
- Honeypot populated
- Duplicate form keys
- Unsupported file value
- Invalid Unicode control characters
- Double submission
- Persistence unavailable
- Customer relationship management timeout
- Receiver accepts but response is lost
- Retry budget exhausted
- Trusted proxy header unavailable

Required behavior: Preserve safe user input, avoid duplicate records, fail closed before persistence, and route accepted but undelivered records to recovery.

### Portal

- Session expires during checkout
- User loses location access
- Price changes after cart creation
- Item becomes unavailable
- Order system times out
- Resource is withdrawn
- Support provider unavailable
- Multi-location administrator changes location mid-task
- User requests a cross-tenant identifier

Required behavior: Revalidate authorization and business state before each mutation. Never infer success from an ambiguous provider response.

### Device and accessibility

- 320 CSS pixel viewport
- 200% text zoom
- Forced colors
- Reduced motion
- Keyboard-only
- Screen reader
- Slow network
- Large data list
- Browser back and refresh during form

Required behavior: Preserve task meaning, focus, state, and recovery without horizontal page scrolling or hidden controls.

## 14. Dependencies and risks

### Dependencies

- Executive release owner
- Franchise-development process owner
- Franchise counsel
- Claims and evidence register
- Content owner
- Privacy owner
- Production hosting
- Durable database
- Customer relationship management destination
- Follow-up staffing
- Identity provider for portal pilot
- Systems of record for portal data
- Monitoring and incident ownership

### Key risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Public site outruns franchise readiness | Legal and brand harm | Release 1 language and protected Mode B |
| Inquiry succeeds before durable storage | Lost prospects | Persist before delivery |
| Demo portal mistaken for production | Operational and security harm | Environment label and portal gate |
| Cross-tenant access | Severe data exposure | Database and server authorization |
| Unsupported financial claim | Franchise-law exposure | Claim register and legal approval |
| Integration lock-in | High migration cost | Adapter contracts |
| Stale prices or resources | Operator error | Freshness and system-of-record labels |
| Excessive scope | Delayed value | Public R1, conditional R1P, excluded R2 |

## 15. Required artifacts

- Page content inventory
- Route and redirect map
- Claims and evidence register
- Public-page wireframes
- Form schema
- Inquiry data model
- Classification and routing rubric
- Consent register
- Integration contracts
- Customer relationship management field map
- Identity and tenancy model
- Portal system-of-record map
- Analytics measurement plan
- Accessibility test plan
- Threat model
- Release test matrix
- Legal acceptance matrix for Release 2
- Launch and rollback runbook

## 16. Next actions

1. Approve the Release 1, Release 1P, and Release 2 boundaries
2. Reconcile current pages against the page requirements
3. Assign owners to controlled variables
4. Complete the claims and evidence register
5. Select durable inquiry storage and customer relationship management destination
6. Define the production inquiry contract
7. Decide whether Discovery Gate 3 permits a portal pilot
8. Select identity and portal systems of record if the pilot proceeds
9. Convert requirement IDs into the implementation traceability matrix
10. Build the test-first implementation plan

## 17. Primary references

### Internal

- [Discovery Brief v1.0](Buddas_Franchise_Platform_Discovery_Brief_v1.0.md)
- [Franchise Website PRD v1.0](Buddas_Franchise_Website_PRD_v1.0.md)
- [Platform README](README.md)
- [Platform build plan](../../franchise-website/buddas-franchise-platform.md)
- [Design system](../../franchise-website/design.md)

### External

- [Next.js production checklist](https://nextjs.org/docs/app/guides/production-checklist)
- [Next.js backend-for-frontend guidance](https://nextjs.org/docs/app/guides/backend-for-frontend)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WCAG 2.2 changes](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP Web Service Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Web_Service_Security_Cheat_Sheet.html)
- [FTC Franchise Rule](https://www.ftc.gov/legal-library/browse/rules/franchise-rule)
- [FTC consumer guide](https://www.ftc.gov/business-guidance/resources/consumers-guide-buying-franchise)

> **Build the public truth first. Pilot operator tools only after the jobs, data, and ownership are real.**

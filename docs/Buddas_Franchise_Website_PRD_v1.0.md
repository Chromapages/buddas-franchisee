# Budda's Franchise Website PRD v1.0

**Product:** Budda's Franchise Recruitment Hub  
**Brand:** Budda's Hawaiian Bakery & Grill  
**Status:** Approved product direction / implementation-ready requirements  
**Date:** August 21, 2026  
**Owner:** Budda's Brand + Franchise Development  
**Primary launch mode:** Qualified interest  
**Future launch mode:** Active franchise offering  

This document governs the first release of Budda's franchise recruitment website. It translates the approved brand strategy, identity system, franchise research, conversion design, and compliance requirements into one product specification.

---

# 1. Executive Summary

## 1.1 Problem Statement

Budda's has a distinctive product, a credible Hawaiian-rooted origin, and an emerging multi-unit business, but it does not have a dedicated digital experience for prospective operators. Its consumer website cannot adequately explain the growth opportunity, establish operator fit, control regulated claims, or route qualified franchise interest.

At the same time, Budda's strategy classifies franchising as an option that must follow repeatable operations rather than lead them. A conventional "own one now" franchise site would therefore overstate readiness and conflict with the doctrine:

> Franchise the system, not the idea.

## 1.2 Proposed Solution

Build a dedicated franchise recruitment hub at:

**buddashawaiian.com/franchise**

The hub will use a distinct franchise navigation and funnel while remaining inside the Budda's master brand and primary domain. It will launch in two controlled modes:

### Mode A — Qualified Interest

The initial release will:

- explain why Budda's is distinctive;
- establish the ideal operator profile;
- show only approved evidence of product, restaurants, systems, and support;
- collect structured interest from prospective operators;
- classify and route every inquiry;
- avoid implying that franchises are available in every market;
- exclude financial-performance, investment, fee, territory, and opening-timeline claims unless specifically approved.

### Mode B — Active Offering

The same product architecture will later support:

- approved available territories;
- approved qualification thresholds;
- FDD-consistent investment and fee information;
- Item 19 financial-performance representations, if adopted;
- state-aware offer restrictions;
- versioned FDD delivery and receipt evidence;
- legally approved process milestones.

Mode B cannot be enabled by ordinary content editing. It requires a documented launch gate from Budda's leadership and franchise counsel.

## 1.3 Product Position

The website will present Budda's as:

**Budda's Hawaiian Bakery & Grill**  
**Home of the Budda Roll**

The business case begins with a differentiated product and proceeds toward evidence of a disciplined operating system. The narrative must never reduce Budda's to another Hawaiian plate-lunch concept or generic restaurant investment.

## 1.4 Experience Thesis

> **A distinctive product. A disciplined system. A generous way to grow.**

The experience must be:

> **Serious enough for diligence. Distinctive enough to remain Budda's.**

## 1.5 Success Criteria

The first 90 days after public launch will be considered successful when all of the following are true:

1. **Compliance integrity:** 100% of published franchise pages, claims, testimonials, market statements, downloads, and form-consent language have an approved content status and named approver.
2. **Lead durability:** At least 99.5% of accepted inquiry submissions are persisted before any CRM or email delivery is attempted.
3. **Delivery reliability:** At least 95% of persisted inquiries reach the configured CRM or franchise-development destination within five minutes; all remaining deliveries enter a visible retry or manual-review state.
4. **Funnel performance:** At least 3% of eligible franchise sessions start an inquiry and at least 45% of inquiry starts produce a valid completed submission.
5. **Lead usefulness:** 100% of completed inquiries contain the required routing fields and receive one routing status; at least 80% also include the optional context needed for a well-prepared first conversation.
6. **Response standard:** Qualified and manual-review leads receive human follow-up within one business day at the 90th percentile.
7. **Accessibility:** The primary journey has no critical automated accessibility violations and passes manual keyboard, focus, zoom, and screen-reader checks against WCAG 2.2 AA.
8. **Performance:** At the 75th percentile of real mobile visits, LCP is no greater than 2.5 seconds, INP no greater than 200 milliseconds, and CLS no greater than 0.1.
9. **Brand comprehension:** In moderated first-impression testing, at least 8 of 10 participants can identify Budda's as a Hawaiian Bakery & Grill known for the Budda Roll after viewing the opening screen for ten seconds.

Targets 4 and 5 are initial product benchmarks, not financial-performance representations. They should be reviewed after the first 30 days of statistically usable traffic without weakening the compliance, reliability, accessibility, or performance criteria.

## 1.6 Requirements and Assumptions

### Requirements

- The first public release is a qualified-interest experience, not an unrestricted franchise offer.
- Budda's remains the master brand; no franchise sub-brand will be created.
- The Budda Roll is the primary product icon and opening source of distinction.
- Real product, restaurant, people, and operating evidence outrank promotional claims.
- The website must support content approval, lead routing, consent evidence, analytics, and future compliance expansion.
- The experience must work on mobile, keyboard, screen reader, slow network, and reduced-motion settings.
- No ordinary CMS editor can publish an unapproved regulated claim or enable active-offering mode.

### Approved assumptions

- The initial geographic scope is the United States.
- International inquiries may be captured only as future interest and route to manual review.
- The primary audience is experienced owner-operators and emerging multi-unit restaurant groups.
- Large area developers and first-time entrepreneurs may inquire, but receive separate qualification paths.
- The launch URL is a subdirectory on the primary domain, not a separate public brand domain.
- The CRM vendor is not allowed to dictate the website data model. A CRM adapter will protect the product from vendor lock-in.
- No AI feature is required for v1.

### Validation-gated business variables

These are controlled inputs rather than open product ambiguity:

- approved states and markets;
- operator experience requirements;
- capital and net-worth thresholds;
- franchise fees and estimated initial investment;
- Item 19 claims;
- support commitments;
- response-time promise shown to prospects;
- CRM destination;
- whether phone or SMS marketing follow-up is enabled;
- FDD delivery channel.

Until an input is approved, the interface must use the conservative Mode A behavior defined in this PRD.

---

# 2. User Experience & Functionality

## 2.1 Primary Personas

### Persona A — Experienced Owner-Operator

An operator with meaningful restaurant or hospitality experience who expects to participate in the business. They need to understand the concept, standards, support, market path, and mutual evaluation process.

**Primary questions**

- What makes Budda's defensible?
- Is this a real operating concept rather than a story and logo?
- What will Budda's require of me?
- What support can Budda's prove today?
- What happens after I inquire?

### Persona B — Emerging Multi-Unit Group

A small or mid-sized operating group evaluating an additional brand. They prioritize repeatability, menu and supply-chain discipline, real-estate fit, training, reporting, and territory strategy.

**Primary questions**

- Can the concept scale across more than one location?
- What is standardized?
- Where is there local flexibility?
- Which systems already exist, and which are still being proven?

### Persona C — Qualified Future Prospect

A strong brand fan, entrepreneur, or hospitality professional who may become viable later but does not yet demonstrate immediate operating readiness.

### Persona D — Franchise Development Team

The internal team receiving, qualifying, and following up with inquiries. They need complete records, source attribution, deterministic routing, duplicate detection, consent evidence, failure visibility, and context for the first conversation.

### Persona E — Legal and Brand Approver

The reviewers accountable for truthful franchise language, brand consistency, and cultural integrity. They need controlled publishing, traceable approvals, dated claims, and withdrawal controls.

## 2.2 Jobs to Be Done

Prospective operators are hiring the website to:

1. determine whether Budda's is meaningfully different;
2. assess whether the concept and their operating profile fit each other;
3. understand what is proven, what support exists, and what remains part of diligence;
4. express interest without navigating a generic contact process;
5. know what will happen next.

Budda's is hiring the website to:

1. create qualified conversations rather than maximize raw form volume;
2. protect the truth while the franchise system matures;
3. make product and brand distinction visible before economics;
4. collect useful lead information without excessive friction;
5. preserve a compliant upgrade path from future interest to active offerings.

## 2.3 User Journey

### Stage 1 — Discovery

The prospect arrives through direct navigation, organic search, brand PR, franchise directories, operator outreach, a consumer-site link, or paid media.

The opening screen must answer within ten seconds:

- Who is this?
- What is Budda's known for?
- Is this a franchise or operator-interest experience?
- What should I do next?

### Stage 2 — Distinction

The prospect learns that Budda's began with the roll, the Budda Roll is the icon, the broader business is bakery-led Hawaiian comfort, and hospitality and cultural roots are operating responsibilities rather than decoration.

### Stage 3 — Evidence

The prospect sees approved evidence in this order:

1. real restaurants;
2. real product;
3. real operating system;
4. support;
5. process;
6. disclosures;
7. next step.

### Stage 4 — Self-Selection

The site explains the ideal operator and makes clear that inquiry is the beginning of mutual evaluation, not an approval or award.

### Stage 5 — Inquiry

The prospect completes a progressive, three-step form.

### Stage 6 — Confirmation

The site confirms receipt, describes the next step truthfully, and offers a relevant secondary action without implying approval.

### Stage 7 — Qualification and Follow-Up

The record is classified, stored, delivered, acknowledged, and assigned according to approved routing rules.

## 2.4 Information Architecture

### Sitemap

~~~text
Franchise Home                  /franchise
├── Why Budda's                 /franchise/why-buddas
├── The Budda Roll              /franchise/the-roll
├── What It Takes               /franchise/what-it-takes
├── Support                     /franchise/support
├── Process                     /franchise/process
├── FAQ                         /franchise/faq
├── Start Your Inquiry          /franchise/apply
└── Legal + Disclosures         /franchise/legal
~~~

### Header navigation

1. Why Budda's
2. The Roll
3. What It Takes
4. Support
5. Process
6. FAQ
7. Start Your Inquiry — primary CTA

The header must include a clearly labeled route back to the consumer site. Ordering, rewards, menu, and restaurant-location controls must not compete with the franchise CTA inside the franchise header.

### Footer

**Opportunity:** Why Budda's, What It Takes, Support, Process, Start Your Inquiry  
**Brand:** The Budda Roll, Budda's Story, Consumer Website  
**Legal:** Franchise Disclosures, Privacy, Terms, Accessibility, privacy choices when required

### Breadcrumbs

Every page below /franchise must include semantic breadcrumbs and BreadcrumbList structured data. Breadcrumbs should reflect the typical user path rather than merely repeat the URL.

## 2.5 Page Requirements

### Franchise Home — /franchise

**Purpose:** Establish product distinction, credibility, fit, and the primary route to inquiry.

**Required modules**

1. **Hero**
   - official Budda's wordmark or approved lockup;
   - "Home of the Budda Roll" product position;
   - approved product-truth hero image;
   - concise franchise-interest headline;
   - primary CTA: Explore the Opportunity;
   - high-intent CTA: Start Your Inquiry;
   - Mode A status language.

2. **Evidence Ledger**
   - concise, sourced facts about origins, current restaurants, product system, and approved operating proof;
   - no unsupported metric tiles;
   - each numerical claim includes context, date, source, and approval status.

3. **The Roll That Started Everything**
   - family butter-roll origin;
   - Budda Roll as signature product;
   - link to /franchise/the-roll.

4. **Bakery-Led Hawaiian Comfort**
   - bakery as the competitive wedge;
   - broader all-day restaurant permission;
   - no "Hawaiian grill" commodity framing.

5. **Why Operators Look Twice**
   - differentiated icon product;
   - daypart and occasion breadth;
   - shareable product and catering potential;
   - disciplined hospitality and brand system;
   - all statements restricted to approved evidence.

6. **Ideal Partner Preview**
   - experience and operating orientation;
   - values and cultural responsibility;
   - link to /franchise/what-it-takes.

7. **Support Preview**
   - only support capabilities that Budda's can currently deliver;
   - link to /franchise/support.

8. **Mutual Evaluation Process**
   - clear stage summary;
   - no gamification or implication that completion guarantees approval.

9. **FAQ Preview**
   - five highest-value questions;
   - link to complete FAQ.

10. **Final CTA**
    - Start Your Inquiry;
    - secondary future-interest option;
    - adjacent legal-status language.

### Why Budda's — /franchise/why-buddas

**Purpose:** Explain the brand and business distinction without becoming an investor hype page.

Required content:

- brand origin;
- bakery-led competitive position;
- strategic triangle: icon, meaning, occasion;
- current business evidence;
- "special enough to seek out, easy enough to repeat" customer tension;
- growth doctrine: make it loved, repeatable, then bigger;
- honest separation of established capability from future ambition.

### The Budda Roll — /franchise/the-roll

**Purpose:** Establish the signature product as an ownable demand and memory asset.

Required content:

- product origin and role;
- Classic, Sticky, Coconut, and Taro references only when current and approved;
- product-truth photography;
- product hierarchy;
- shareability and packaging role;
- Budda Roll quality standard;
- no recipe, trade-secret, or proprietary process disclosure.

### What It Takes — /franchise/what-it-takes

**Purpose:** Let prospects self-select before starting a form.

Required content:

- ideal operator characteristics;
- accepted inquiry types;
- owner involvement expectations when approved;
- restaurant/franchise experience expectations;
- cultural and hospitality responsibility;
- capital-readiness language only at the approved level;
- "not a fit" conditions stated respectfully;
- future-interest path.

Mode A must describe fit qualitatively and use readiness bands. Exact capital, net-worth, unit-commitment, and development thresholds require counsel-approved Mode B content.

### Support — /franchise/support

**Purpose:** Show the support Budda's can prove rather than the support a generic franchisor is expected to claim.

Each support capability must be labeled Available now, In pilot, Planned before franchise award, or Not publicly disclosed.

Potential categories:

- onboarding and training;
- site and real-estate guidance;
- restaurant opening support;
- operations and quality;
- menu and product standards;
- supply-chain guidance;
- technology stack;
- local marketing;
- brand and creative resources;
- hospitality and cultural standards;
- ongoing field support.

The site may publish a category only when its status and description are approved.

### Process — /franchise/process

**Purpose:** Set truthful expectations and reduce ambiguity.

**Mode A process**

1. Explore Budda's.
2. Submit an inquiry.
3. Internal fit review.
4. Introductory conversation when appropriate.
5. Future updates, diligence, or hold based on program status.

**Mode B process**

1. Inquiry.
2. Qualification.
3. Introductory conversation.
4. FDD delivery and applicable waiting period.
5. Diligence and validation.
6. Mutual approval.
7. Site, training, development, and opening stages.

Exact stages must match the adopted franchise sales process and current FDD.

### FAQ — /franchise/faq

Required topics:

- What is Budda's?
- What makes the concept different?
- Is Budda's currently awarding franchises?
- Who is Budda's looking for?
- Which markets are being considered?
- What experience is preferred?
- What support exists?
- What happens after an inquiry?
- How is an inquiry different from an application or franchise offer?
- Where can a prospect review legal disclosures?

All answers use visible text; no answer may hide material context exclusively inside a tooltip or footnote.

### Apply — /franchise/apply

The form must be a dedicated page. It may also open from a non-blocking drawer or modal on large screens, but the full URL remains the canonical, accessible route.

### Legal — /franchise/legal

Required content:

- current franchise-program status;
- non-offer language;
- state availability or restriction language when applicable;
- relationship between site content and the FDD;
- financial-performance representation policy;
- contact path for legal or disclosure questions;
- last legal-review date;
- link to privacy and consent information.

## 2.6 CTA System

### Primary educational CTA

**Explore the Opportunity**

Use in the hero for Mode A. It scrolls or links to the first evidence section rather than pretending the visitor is ready to apply.

### High-intent CTA

**Start Your Inquiry**

Use after sufficient evidence and fit information.

### Market CTA

**Tell Us About Your Market**

Use when territory availability is not yet public.

### Secondary CTA

**See What It Takes**

### Prohibited patterns

- Get Rich With Budda's
- Own Your Dream
- Guaranteed Opportunity
- Claim Your Territory, unless inventory and legal availability are current
- Apply Now, when the form is only an expression of interest

## 2.7 Inquiry Form Specification

The form uses three progressive steps with a visible progress indicator, back navigation, retained values, persistent labels, and a single-column mobile layout.

### Step 1 — You and Your Market

Required:

- Full name
- Email
- Country
- State or province
- City
- Market or territory of interest
- Inquiry type:
  - Owner-operator
  - Multi-unit operator
  - Area development or strategic growth
  - Future interest
  - International future interest

Phone is optional in Mode A. If phone, voice, or SMS marketing is enabled later, the interface must show and store the approved consent language applicable to the chosen communication.

### Step 2 — Operating Experience

Required:

- Currently own or operate restaurants: Yes / No
- Restaurant operating experience:
  - None
  - Less than 3 years
  - 3–5 years
  - 6–10 years
  - More than 10 years
- Franchise experience:
  - None
  - Single-unit
  - Multi-unit
  - Multi-brand
- Units currently operated:
  - 0
  - 1
  - 2–5
  - 6–15
  - 16+
- Expected role:
  - Active owner-operator
  - Operating partner
  - Multi-unit leadership
  - Financial partner with operating team
  - Not yet sure

Optional:

- Brands or concepts currently operated

### Step 3 — Readiness and Motivation

Required:

- Desired timeline:
  - 0–6 months
  - 6–12 months
  - 12–24 months
  - Exploring beyond 24 months
- Capital readiness:
  - Ready to discuss
  - Building toward readiness
  - Need more information
  - Prefer not to say
- Why Budda's? Maximum 600 characters.
- Agreement that submission is an inquiry and does not constitute an offer, approval, or award.
- Consent to receive a direct response to the inquiry.

Optional:

- Consent to receive future franchise-development updates.
- Referral source.

### Fields prohibited in Mode A

- Social Security number;
- tax identifier;
- bank or brokerage documents;
- exact liquid assets;
- exact net worth;
- full residential street address;
- credit authorization;
- business-plan upload;
- mandatory long essay;
- sensitive demographic information.

### Form behavior

- Validate fields on blur and again on the server.
- Do not validate aggressively on every keystroke.
- Preserve values after validation, network, or CRM errors.
- Announce errors through an accessible error summary and field messages.
- Focus the error summary after a failed step transition.
- Prevent duplicate submits while showing a clear pending state.
- Generate an idempotency key for every final submission attempt.
- Treat submission as successful only after durable first-party persistence.
- Fire generate_lead only after successful persistence.
- Never reveal internal qualification scores or rejection logic.

### Success state

The success page must:

- confirm receipt;
- display a reference number;
- explain that submission begins a review rather than guaranteeing contact or approval;
- state the approved response window;
- provide a path to the brand story or consumer site;
- avoid FDD delivery unless the prospect has entered the approved Mode B workflow.

### Form Health & Friction Index

| Category | Score |
|---|---:|
| Field Necessity & Efficiency | 23 / 30 |
| Value–Effort Balance | 16 / 20 |
| Cognitive Load & Clarity | 16 / 20 |
| Error Handling & Recovery | 12 / 15 |
| Trust & Friction Reduction | 7 / 10 |
| Mobile Usability | 4 / 5 |
| **Total** | **78 / 100** |

**Verdict:** Usable with Friction.

The form is intentionally longer than a consumer lead form because qualification usefulness matters more than raw volume. The first optimization target is business-rule clarity, followed by field abandonment—not indiscriminate field deletion.

## 2.8 Lead Classification

Every accepted submission must receive exactly one classification:

### Sales-qualified

The prospect is in an approved or reviewable market, demonstrates relevant operating capacity or a credible team, and has a non-exploratory timeline.

### Nurture

The prospect shows plausible future fit but is early in experience, timing, market, or readiness.

### Future-market hold

The prospect is otherwise relevant, but the market is unavailable or not yet approved.

### Manual review

The record contains strong but ambiguous signals, an international request, a strategic-development request, or conflicting data.

### Out of scope

The inquiry is for employment, vendors, consumer support, real estate without operator interest, or unrelated purposes.

Classification rules must be versioned. Changing them requires franchise-development approval and an analytics annotation.

## 2.9 Routing and Follow-Up

- Persist the lead first.
- Normalize email, optional phone, market, and attribution.
- Check duplicates by normalized email and phone when present.
- Preserve first-touch and latest-touch attribution separately.
- Create or update the CRM record through the adapter.
- Assign classification and lifecycle status.
- Create the correct follow-up task.
- Send only approved acknowledgment messages.
- Log delivery and retry failures.

Lifecycle statuses:

- New
- Delivery pending
- Delivered
- Attempted contact
- Introductory call booked
- Qualified
- Nurture
- Future-market hold
- Declined
- Closed won
- Closed lost

## 2.10 Analytics Requirements

### Funnel events

- franchise_page_view
- franchise_cta_click
- franchise_evidence_view
- franchise_fit_view
- franchise_process_view
- franchise_form_start
- franchise_form_step_view
- franchise_form_step_complete
- franchise_form_error
- franchise_form_submit_attempt
- generate_lead
- franchise_thank_you_view
- franchise_market_interest_select
- franchise_out_of_scope_redirect

### Event parameters

- page_path
- form_version
- content_version
- legal_version
- step_name
- CTA label and position
- inquiry_type
- country, state, and market_region
- experience, unit_count, timeline, and capital_readiness bands
- routing_classification
- first-touch and latest-touch source
- UTM source, medium, campaign, content, and term

Analytics must not transmit full name, email, phone, motivation text, or other directly identifying data.

### Reporting

The launch dashboard must show sessions, CTA click-through, form starts, completion by step, field abandonment and errors, classification distribution, duplicates, CRM delivery success and latency, response speed, and lead-to-call rate.

## 2.11 Visual and Interaction Requirements

The franchise experience inherits the existing Budda's design constitution.

### Required mode mix

- **Roll Signature:** opening product moment;
- **Island Ledger:** origin, evidence, and operational story;
- **Bakery Counter:** navigation, forms, FAQ, disclosures, and dense information;
- **Roll & Table:** final conversion and brand integration.

### Color

- Cream and White: 55–65%;
- Dark Teal and Base Teal: 20–30%;
- Gold and Orange: 5–10%;
- Sunset Orange is temporary attention, not the default CTA color;
- Dark Teal with Cream is the preferred primary action.

### Typography

- Official Budda's script: brand artwork only;
- Poppins: display and hierarchy;
- DM Sans: reading and function;
- minimum 16 CSS pixels for body text;
- no invented serif or script substitute.

### Photography

Recommended mix:

- approximately 40% Product Truth;
- approximately 25% Bakery Engine and process;
- approximately 20% restaurant and hospitality;
- approximately 15% origin, community, and operator context.

Use real photography for evidence claims. Concept art and AI-assisted imagery must be labeled internally and cannot imply current capability.

### Composition and motion

- one dominant idea per frame;
- real food normally outranks decoration;
- information follows the grid;
- the Roll Arc invites and the Table Line grounds;
- patterns remain atmospheric;
- avoid generic card grids when editorial evidence works better;
- motion grammar: Reveal → Land → Share;
- no bounce, loops, appetite distortion, or delayed controls;
- all motion has a reduced-motion equivalent;
- content and actions cannot be withheld behind animation.

## 2.12 Accessibility Acceptance Criteria

- WCAG 2.2 AA is the product standard.
- Navigation and form actions are keyboard complete.
- Focus is visible and not obscured.
- Touch targets are at least 44 by 44 CSS pixels where practical and never below the applicable WCAG minimum.
- Fields have persistent labels, instructions, and descriptive errors.
- Errors are not communicated by color alone.
- Status and error messages use appropriate live-region behavior.
- Text supports 200% zoom.
- Layout reflows at 320 CSS pixels without horizontal scrolling, except for genuinely two-dimensional content.
- Meaningful images have useful alternative text; decorative geometry is hidden.
- Videos include captions and do not autoplay with sound.
- The form is tested with keyboard and desktop and mobile screen readers.

## 2.13 SEO and Discoverability

- Every page has a unique title, description, canonical URL, and share image.
- URLs are human-readable and lowercase.
- BreadcrumbList structured data is included on child pages.
- Organization data references canonical Budda's rather than a franchise sub-brand.
- FAQ content is semantic and visible without assuming rich-result eligibility.
- The XML sitemap includes only public, approved pages.
- Gated documents are excluded from indexing unless legal and SEO owners approve.
- No territory page remains indexed with stale status.
- Prior franchise URLs receive permanent redirects.

## 2.14 User Stories and Acceptance Criteria

### Story 1 — Understand the concept

As a prospective operator, I want to understand what Budda's is known for so I can decide whether deeper evaluation is worthwhile.

**Acceptance criteria**

- The opening screen names Budda's, Hawaiian Bakery & Grill, and the Budda Roll.
- One primary action is visible without scrolling on common mobile and desktop sizes.
- Ten-second comprehension testing meets Section 1.5.

### Story 2 — Evaluate distinction

As a prospective operator, I want evidence of product and brand differentiation so I can determine whether Budda's is more than another Hawaiian restaurant.

**Acceptance criteria**

- Product, bakery, hospitality, and origin evidence appears before the form.
- Every factual or numerical claim has a source and approval record.
- No generic tropical or stock-investor imagery is used as evidence.

### Story 3 — Assess fit

As a prospective operator, I want to understand what Budda's expects so I can self-select before sharing personal information.

**Acceptance criteria**

- What It Takes is in the primary navigation.
- Mode A uses qualitative fit and readiness bands.
- Unapproved financial thresholds never render.
- A future-interest route exists.

### Story 4 — Understand support

As a prospective operator, I want to know what support is real today so I can distinguish current capability from future ambition.

**Acceptance criteria**

- Every support category has an approved maturity status.
- Planned support is not presented as available.
- Support copy is versioned.

### Story 5 — Submit an inquiry

As a qualified prospect, I want to submit useful information without completing a full franchise application.

**Acceptance criteria**

- The form follows the three-step specification.
- Back navigation preserves values.
- Server validation is authoritative.
- The record is durable before success.
- Success returns a reference number.

### Story 6 — Recover from failure

As a prospect, I want to recover from errors without losing work.

**Acceptance criteria**

- Errors identify the field and correction.
- Network and CRM errors do not clear input.
- CRM failure after persistence does not ask the user to resubmit.
- A retry and alert process exists.

### Story 7 — Route the lead

As a franchise-development representative, I want every inquiry classified and attributed so I can prioritize follow-up.

**Acceptance criteria**

- Every accepted lead has one classification.
- First-touch and latest-touch attribution are preserved.
- Duplicates follow the CRM adapter contract.
- Delivery status and latency are reportable.

### Story 8 — Control regulated content

As legal counsel, I want only approved franchise claims and disclosures to publish.

**Acceptance criteria**

- Public queries return only approved content.
- Financial and availability claims require named legal approval.
- Active-offering mode requires a protected feature flag.
- Withdrawing approval removes content and triggers revalidation.

## 2.15 Non-Goals

- consumer ordering, rewards, or account login;
- franchisee operations portal;
- agreement signing;
- fee or payment collection;
- automated franchise award decisions;
- AI chatbot or lead scoring;
- ROI calculator or profitability projection;
- national territory-claim map;
- international franchise sales;
- broker marketplace;
- real-estate portal;
- training LMS;
- downloadable FDD without the adopted delivery workflow;
- custom multi-tenant CMS for franchisees.

---

# 3. AI System Requirements

## 3.1 v1 Decision

No AI system is required for v1. Franchise claims, cultural content, product imagery, qualification, and legal disclosures require accountable human review. AI would add risk without solving a launch-critical problem.

## 3.2 Permitted Internal Assistance

AI may assist internal teams with draft summaries, analytics exploration, duplicate-content detection, accessibility-description suggestions, and claim-risk keyword flagging.

AI output cannot move content into approved status or send prospect communications without approved templates.

## 3.3 Prohibited AI Behavior

- generating or modifying financial-performance claims;
- answering legal, territory, fee, investment, FDD, or qualification questions directly to prospects;
- automatically rejecting a prospect;
- inventing support capabilities or store evidence;
- altering Budda Roll product truth;
- generating cultural shorthand or themed Hawai'i imagery;
- publishing without accountable human approval.

## 3.4 Future Evaluation Gate

Any future AI feature requires a separate PRD defining the user problem, authoritative sources, refusal boundaries, human escalation, evaluation dataset, accuracy and citation targets, privacy, monitoring, and rollback.

---

# 4. Technical Specifications

## 4.1 Chosen Architecture

Use a lean modular monolith:

- Next.js App Router with TypeScript;
- Server Components by default;
- Client Components only for the form, interactive navigation, territory selection, and purposeful motion;
- Tailwind CSS v4 with CSS-first theme variables mapped to existing Budda's tokens;
- lightweight headless CMS with approval metadata;
- PostgreSQL as the durable inquiry and delivery-audit store;
- server-side CRM adapter;
- GA4 plus a first-party operational event log;
- Vercel deployment with managed Postgres and scheduled retries.

The reference implementation uses Sanity for managed content, Neon PostgreSQL for durable records, and Vercel for hosting. A substitute may be selected during Phase 0 only if it satisfies the same approval, preview, revalidation, persistence, audit, and deployment contracts without changing the public product requirements.

This avoids premature microservices while preserving boundaries between public content, lead intake, compliance rules, and external delivery.

## 4.2 Architecture Flow

~~~text
CMS approved content
        ↓
Next.js Server Components
        ↓
Public franchise pages
        ↓
Progressive inquiry form
        ↓
Server Action / Route Handler
        ↓
Validation + anti-abuse + idempotency
        ↓
PostgreSQL durable lead record
        ↓
Classification + state/program rules
        ↓
CRM adapter + acknowledgment
        ↓
Delivery audit, retries, alerts, analytics
~~~

## 4.3 Recommended Project Structure

~~~text
app/
├── (franchise)/franchise/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── why-buddas/page.tsx
│   ├── the-roll/page.tsx
│   ├── what-it-takes/page.tsx
│   ├── support/page.tsx
│   ├── process/page.tsx
│   ├── faq/page.tsx
│   ├── apply/page.tsx
│   ├── legal/page.tsx
│   └── thank-you/page.tsx
├── api/franchise-inquiries/route.ts
├── sitemap.ts
└── robots.ts

components/
├── franchise/
├── forms/
└── ui/

lib/
├── brand/
├── cms/
├── compliance/
├── franchise/
├── analytics/
├── crm/
├── email/
├── security/
└── validation/

tests/
├── unit/
├── integration/
├── contract/
├── accessibility/
└── e2e/
~~~

Exact repository paths will be confirmed in the implementation plan after the application workspace is selected.

## 4.4 Server and Client Boundaries

### Server Components

Use for page layouts, ordinary content, CMS fetching, metadata, evidence, legal content, support, process, structured data, and non-interactive FAQ rendering.

### Client Components

Use only for form state and steps, field interaction, mobile menu behavior, optional market selection, consent controls, reduced-motion-aware enhancement, and browser-only analytics interactions.

Do not place "use client" at page or franchise-layout level.

## 4.5 Content Model

### Page

- slug, title, description, hero, modules, and SEO metadata;
- status: draft / legal-review / brand-review / approved / withdrawn;
- content and legal versions;
- brand and legal approvers;
- effective, expiry, review, and publish dates.

### Evidence Item

- statement and evidence type;
- source URL or internal source;
- period and geography;
- owner and claim category;
- approval status and approver;
- effective and expiry dates;
- required visible context.

### Claim Category

- brand fact;
- operating fact;
- customer proof;
- award or recognition;
- territory or availability;
- investment or fee;
- financial-performance representation;
- timeline;
- support capability.

The final five categories require legal approval. Financial-performance representations also require confirmation that the exact representation and context are supported by the current FDD and Item 19.

### Market Rule

- country, state, and market;
- status: interest-only / reviewable / available / unavailable / sold / restricted;
- effective and expiry dates;
- legal note;
- routing destination;
- approved public label;
- approver.

### Support Capability

- category and description;
- maturity: available / pilot / required-before-award / not-public;
- evidence reference;
- approver.

### FAQ

- question and answer;
- audience;
- claim categories;
- status and legal version;
- review date.

## 4.6 Inquiry Data Model

### Prospect

- prospect ID;
- normalized full name and email;
- optional normalized phone;
- country, state/province, and city;
- consent records;
- created and updated timestamps.

### Inquiry

- inquiry ID and public reference number;
- prospect ID;
- inquiry type and market interest;
- experience and readiness bands;
- operating brands and unit count;
- expected role and motivation;
- referral and attribution;
- content, form, and legal versions shown;
- routing classification and lifecycle status;
- created timestamp.

### Consent Record

- consent type;
- exact language version;
- affirmative value;
- timestamp, page URL, and form version;
- IP or user-agent evidence only if privacy and counsel review approve collection.

### Delivery Attempt

- inquiry ID;
- destination and adapter version;
- attempt number and status;
- correlation ID;
- response code and redacted error;
- next retry and completed timestamps.

Sensitive form values must not appear in general application logs.

## 4.7 Submission API Contract

### Success

- HTTP 201;
- public reference number;
- received timestamp;
- safe next-step message key.

### Validation failure

- HTTP 400;
- form version;
- field-error map;
- non-sensitive summary.

### Idempotent replay

- HTTP 200;
- original reference and received timestamp.

### Rate limited

- HTTP 429;
- safe retry guidance.

### Unexpected failure before persistence

- HTTP 503;
- no success analytics;
- input preserved;
- alternate contact guidance.

CRM failure after persistence must not turn a successful user response into a failure.

## 4.8 Validation and Anti-Abuse

- Zod or equivalent server schema is authoritative.
- Native HTML constraints provide progressive enhancement.
- Use a honeypot.
- Use Cloudflare Turnstile or equivalent at final submission.
- Rate-limit using privacy-reviewed characteristics.
- Sanitize free text for storage and rendering.
- Escape output by default.
- Reject unsupported form versions.
- Cap text fields.
- Use idempotency keys.
- Protect origins and same-site behavior.
- Never expose CRM credentials to the browser.

## 4.9 CRM Adapter

The adapter must support prospect upsert, inquiry create/update, classification, attribution, follow-up task creation, content/legal version storage, destination ID return, and retryable versus terminal errors.

The persisted inquiry is canonical. The CRM is the operating destination, not the only copy.

## 4.10 Publishing Controls

- Public queries filter for approved, effective records.
- Draft previews require authenticated, non-indexed preview mode.
- Expired claims cannot render.
- Approval withdrawal invalidates caches.
- Active-offering modules require a protected deployment flag and approved Mode B content for the prospect's state.
- The CMS cannot change the deployment flag.
- Publish actions record content version and approval identity.

## 4.11 Compliance Architecture

### Mode A

- accept qualified interest;
- show status-safe disclosures;
- use readiness bands;
- route market interest without representing availability;
- do not deliver an FDD through the site;
- do not present Item 19 or investment claims.

### Mode B

Adds current state eligibility, approved markets, FDD-consistent claims, state disclosures, FDD delivery and evidence, receipt tracking where required, and prevention of agreement or payment workflow before the applicable waiting period.

Mode B requires a separate legal acceptance matrix. This PRD defines its boundary but does not authorize franchise sales.

## 4.12 Privacy and Consent

- Link privacy notice at collection.
- Collect only data required for qualification, routing, response, and measurement.
- Define retention before launch.
- Support deletion, correction, access, suppression, and do-not-contact workflows.
- Honor applicable privacy signals and opt-outs.
- Load non-essential technology according to approved consent policy.
- Do not share leads with brokers or sellers unless disclosed and approved.
- Phone and SMS follow-up uses counsel-approved consent and suppression rules based on actual technology and jurisdiction.

## 4.13 Security Requirements

- TLS everywhere;
- deployment secret manager;
- least-privilege credentials;
- separate preview and production access;
- Content Security Policy and security headers;
- appropriate CSRF and origin protection;
- rate limiting and bot defense;
- parameterized database access;
- encrypted storage and backups;
- PII redaction in logs and alerts;
- audit records for content and delivery;
- dependency and secret scanning;
- incident response for leaked, misrouted, or unavailable inquiry data.

## 4.14 Performance Requirements

- Server-render and cache public content.
- Use tag-based revalidation.
- Use responsive images with reserved dimensions.
- Prioritize the actual LCP image only.
- No autoplay hero video in v1.
- Load only approved Poppins and DM Sans weights.
- Keep base franchise-page interactive JavaScript below 150 KB compressed, excluding analytics and challenge code.
- Dynamically load non-critical maps and media.
- Provide explicit loading and error states.
- Track real-user Core Web Vitals.

## 4.15 Observability

### Logs

- structured request and submission logs;
- correlation ID through CRM delivery;
- personal-data redaction;
- content and adapter version references.

### Metrics

- rate, errors, and duration;
- persistence success;
- validation and abuse rejection;
- delivery latency and failures;
- retry backlog;
- email delivery;
- Core Web Vitals;
- approval expiry.

### Alerts

- persistence failure;
- delivery failure above threshold;
- stale retry backlog;
- expired legal content;
- sudden completion collapse;
- unusual volume or bot pattern;
- missing acknowledgment.

## 4.16 Testing Strategy

### Unit

- validation, classification, market rules, approval filters, consent selection, claim restrictions, normalization, and analytics redaction.

### Integration

- persistence, idempotent replay, validation, challenge success/failure, CRM success/failure, email acknowledgment, approval withdrawal, and cache revalidation.

### Contract

- CMS types, CRM adapter, email provider, and analytics schema.

### End-to-end

- navigate routes;
- complete Mode A form;
- recover from errors;
- use back navigation;
- retry pre-persistence failure;
- confirm success during CRM outage;
- exercise every routing class;
- prove Mode B cannot render while disabled.

### Accessibility

- automated axe checks;
- keyboard journey;
- focus;
- zoom and reflow;
- desktop and mobile screen readers;
- reduced motion;
- error announcement.

### Visual and brand

- product-truth review;
- mobile and desktop screenshots;
- official identity assets;
- no cultural cliché or franchise stock;
- no concept assets presented as current.

### Performance

- Lighthouse CI budgets;
- image and layout-shift checks;
- real-user monitoring;
- high-latency form submission;
- paid-campaign readiness.

### Compliance

- no unapproved claims in public responses;
- no expired market or legal records;
- financial-claim lint across copy, metadata, alt text, downloads, testimonials, email, and FAQ;
- exact consent and legal versions stored;
- Mode B state matrix when implemented.

## 4.17 Integration Points

- primary domain and consumer navigation;
- headless CMS;
- PostgreSQL;
- CRM;
- transactional email;
- approved analytics;
- bot defense;
- Next.js hosting;
- consent manager when required;
- error and performance monitoring.

## 4.18 Artifacts to Produce

- implementation plan;
- content inventory and claims register;
- sitemap and page-level content outline;
- wireframes and responsive designs;
- franchise component inventory;
- CMS schema;
- market and routing matrices;
- form schema and consent register;
- CRM field map and adapter contract;
- analytics plan;
- accessibility plan;
- legal review checklist;
- launch and rollback runbook.

---

# 5. Risks & Roadmap

## 5.1 Phased Rollout

### Phase 0 — Readiness and Governance

Appoint product, franchise-development, brand, legal, and engineering owners; create the claims register; confirm Mode A language; define operator and routing rules; define market source of truth; choose the operational stack; approve privacy and contact practices; audit photography and evidence.

**Exit gate:** No implementation-critical rule lacks an owner or conservative default.

### Phase 1 — Qualified-Interest MVP

Build all public pages, approved content, three-step inquiry, durable persistence, classification, CRM adapter, acknowledgment, analytics, approval workflow, and quality controls.

**Exit gate:** All non-traffic acceptance criteria pass and counsel approves the public experience.

### Phase 1.1 — Optimization

Potential work:

- field-level optimization;
- form architecture experiment;
- operator-profile refinement;
- territory-interest visualization without availability claims;
- ungated overview;
- nurture sequence;
- source-quality reporting;
- stronger evidence modules.

Optimize qualified-submit and lead-to-conversation rates, not raw clicks.

### Phase 2 — Active Offering

Potential work:

- approved states and territories;
- qualification thresholds;
- FDD-consistent fees and investment;
- Item 19 representations, if adopted;
- FDD delivery and audit;
- state disclosures;
- qualified scheduling;
- broker routing, if used.

**Exit gate:** Leadership approves franchise readiness, counsel approves the state/FDD matrix, and Mode B tests pass.

### Phase 3 — Franchisee Platform

Not part of this PRD. Onboarding, training, documents, operations, reporting, local marketing, and support require separate discovery.

## 5.2 Work Breakdown

| ID | Work item | Layer | Depends on | Owner |
|---|---|---|---|---|
| F0 | Confirm owners and Mode A authority | Governance | None | Executive sponsor |
| F1 | Build claims and evidence register | Content/legal | F0 | Brand + legal |
| F2 | Define operator, market, and routing rules | Domain | F0 | Franchise development |
| F3 | Finalize page content architecture | Content/IA | F1, F2 | Product + content |
| F4 | Produce wireframes and responsive direction | Design | F3 | Product designer |
| F5 | Define CMS schemas and approvals | Platform | F1, F3 | Engineering + content |
| F6 | Define inquiry, consent, and delivery contracts | Data/domain | F2 | Backend engineer |
| F7 | Scaffold Next.js and brand tokens | Foundation | F4 | Frontend engineer |
| F8 | Implement routes and metadata | Presentation | F5, F7 | Frontend engineer |
| F9 | Implement form and validation | Application | F6, F7 | Full-stack engineer |
| F10 | Implement persistence and classification | Backend | F6, F9 | Backend engineer |
| F11 | Implement CRM, email, retry, and audit | Integration | F10 | Backend engineer |
| F12 | Implement analytics and privacy controls | Analytics | F6, F9 | Analytics engineer |
| F13 | Complete QA and approval | Verification | F8–F12 | QA + legal + brand |
| F14 | Launch and establish baseline | Operations | F13 | Product + engineering |

The implementation plan will decompose these into test-first, bite-sized tasks with exact paths and commands after the application repository is selected.

## 5.3 Dependencies

- franchise-development owner and follow-up capacity;
- franchise counsel;
- adopted Mode A posture;
- approved brand and product assets;
- evidence of current systems and support;
- CMS ownership;
- selected lead destination;
- privacy and consent policy;
- primary-domain deployment access.

## 5.4 Key Risks and Mitigations

### Website outruns readiness

**Mitigation:** Mode A only; protected Mode B; current evidence over future promises.

### Financial or timeline claim escapes review

**Mitigation:** Claim categories, approval workflow, keyword linting, versioned evidence, legal QA.

### Generic Hawaiian positioning

**Mitigation:** Budda Roll-led narrative, bakery-first hierarchy, specific origin, real people and food.

### Weak operating evidence

**Mitigation:** Do not fill gaps with hype. Label maturity honestly and update evidence as systems are proven.

### Low-quality inquiries

**Mitigation:** Self-selection content, structured experience fields, deterministic routing, source-quality reporting.

### Form friction

**Mitigation:** Progressive steps, readiness bands, optional phone, no exact financial data, retained values, field analytics.

### CRM outage or lock-in

**Mitigation:** Persist first, adapter boundary, idempotency, retries, alerts, first-party audit trail.

### Stale territory or legal content

**Mitigation:** Effective and expiry dates, required reviews, withdrawal behavior, monitoring, protected Mode B.

### Privacy overcollection

**Mitigation:** Data minimization, banded readiness, no sensitive financial documents, retention, redacted logs.

### Visual system harms performance

**Mitigation:** No autoplay video, responsive media budgets, server rendering, limited client code, real-user monitoring.

## 5.5 Edge Cases and Non-Happy Paths

### Program and market

- No markets are available.
- A visitor selects a restricted state.
- A market changes status during form completion.
- An international prospect uses the U.S. path.

**Behavior:** Preserve the inquiry as interest and route to future-market hold or manual review without implying availability.

### User intent

- Job seeker, vendor, broker, landlord, consumer-support request, or fan without an operating plan.

**Behavior:** Classify or redirect without exposing internal rules or presenting a false franchise rejection.

### Form

- JavaScript is slow or unavailable.
- Refresh, back navigation, country change, long organization name, multiple errors, challenge outage, double submit, request timeout, or lost response after persistence.

**Behavior:** Progressive enhancement where practical, retained state, idempotent replay, clear recovery, and no duplicate records.

### Integrations

- CRM outage, partial success, email failure, duplicate retry, field-mapping change, or blocked analytics.

**Behavior:** First-party record remains authoritative, failures are visible and retryable, contract tests detect drift, analytics never blocks submission.

### Content and compliance

- Approval expires, FDD changes, testimonial implies earnings, metric lacks context, metadata contains a claim, stale cache survives withdrawal, or Mode B lacks state approval.

**Behavior:** Block or withdraw publication, invalidate caches, alert owners, and fail release verification.

### Accessibility and device

- 320-pixel viewport, 200% zoom, keyboard, screen reader, reduced motion, forced colors, slow network, or large text.

**Behavior:** Preserve information, order, focus, recovery, and primary action access.

## 5.6 Launch Checklist

### Product and content

- Required pages complete.
- No placeholders or speculative claims.
- Mode A language consistent across site, form, email, and metadata.
- Claims register reconciled.
- Every page has an owner and review date.

### Brand

- Official assets and typography.
- Product Truth approval for hero food.
- Bakery-led hierarchy.
- No cultural costuming or generic franchise stock.

### Legal and privacy

- Counsel approves pages and disclosures.
- State-interest behavior approved.
- Consent, privacy, retention, and deletion approved.
- No unapproved Item 19, investment, fee, availability, or timeline claim.

### Engineering

- Production environment, backups, rate limit, bot defense, retry, secrets, and scanning verified.
- Logs contain no prohibited personal data.

### Quality

- All test suites pass.
- Accessibility and mobile visual reviews pass.
- Performance budgets pass.
- Structured data, links, redirects, sitemap, robots, and canonicals validate.

### Operations

- Follow-up owner and SLA staffed.
- Alerts monitored.
- Dashboard available.
- Rollback documented.
- Seven-day and 30-day reviews scheduled.

## 5.7 Completion Definition

The qualified-interest hub is complete only when:

- functional requirements pass;
- no critical or high-severity defects remain;
- content and legal gates pass;
- persistence and routing are verified end to end;
- accessibility and performance pass;
- the franchise-development team can act on inquiries;
- rollback and monitoring work;
- the live product does not imply more readiness than Budda's can prove.

## 5.8 Source of Truth

### Internal

- Budda's Strategy 01–10
- Budda's Hawaiian Brand Strategy v1.0
- Budda's Design System v2.0
- Classic Budda Roll Product Truth Master
- Identity 01–10

### External

- FTC Franchise Rule: https://www.ftc.gov/legal-library/browse/rules/franchise-rule
- 16 CFR Part 436: https://www.ecfr.gov/current/title-16/chapter-I/subchapter-D/part-436
- FTC Consumer Guide: https://www.ftc.gov/business-guidance/resources/consumers-guide-buying-franchise
- DOJ Web Accessibility: https://www.ada.gov/resources/web-guidance/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Next.js App Router: https://nextjs.org/docs/app
- Next.js Forms: https://nextjs.org/docs/app/guides/forms
- Tailwind Theme Variables: https://tailwindcss.com/docs/theme
- Google Breadcrumb Data: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- Google Organization Data: https://developers.google.com/search/docs/appearance/structured-data/organization

### Comparative inspiration

- Hawaiian Bros: https://www.hawaiianbros.com/franchising
- Crumbl: https://crumblcookies.com/franchising
- Chick-fil-A: https://www.chick-fil-a.com/franchise
- Tropical Smoothie Cafe: https://www.tropicalsmoothiefranchise.com/
- Cinnabon: https://www.cinnabon.com/franchising

These examples inform architecture and diligence patterns. They do not authorize Budda's to reuse another system's claims, thresholds, or process.

---

## Final Product Principle

> **Protect the Roll. Protect the truth. Build the system. Then invite the right people to grow it.**

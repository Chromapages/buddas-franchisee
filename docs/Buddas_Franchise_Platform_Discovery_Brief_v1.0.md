# Discover what Budda’s must prove before scaling the franchise platform

**Document:** Product discovery brief  
**Product:** Budda’s franchise recruitment site and operator portal  
**Version:** 1.0  
**Date:** August 21, 2026  
**Status:** Ready for discovery kickoff  
**Primary audience:** Budda’s leadership, franchise development, operations, brand, legal, design, and engineering  
**Decision owner:** Budda’s executive sponsor  

This brief defines the questions, evidence, research methods, decision gates, and outputs required to validate the Budda’s franchise platform. It separates what the team knows from what it assumes, and it treats public recruitment and franchisee operations as related but distinct products.

## Executive summary

Budda’s has a strong brand foundation, a signature product, a working public franchise website, and a demonstration operator portal. The team has not yet established enough first-party evidence to treat every product assumption as validated.

Discovery must answer one central question:

> Can Budda’s recruit, select, enable, and support the right operators without overstating franchise readiness or weakening the product, hospitality, and cultural standards that make the brand distinctive?

The discovery has two tracks:

1. **Recruitment track:** Validate the target operator, evidence hierarchy, inquiry experience, qualification logic, legal posture, and handoff process
2. **Operator track:** Validate the daily jobs, data boundaries, ordering, resources, support, identity, and operational integrations required for a production portal

The current implementation is evidence, not validation. It shows what the product could do and provides a testable prototype. Research must determine which workflows solve real operator and internal-team problems.

The recommended discovery lasts four weeks and ends with explicit decisions:

- Proceed, revise, or pause the qualified-interest recruitment experience
- Define the primary operator segment and disqualifying conditions
- Lock the claims and evidence that can appear publicly
- Decide whether the portal should enter production planning
- Prioritize production integrations by operator value and business risk
- Confirm the readiness gate for any active franchise offering

## Background

### Brand foundation

Budda’s is a Hawaiian Bakery & Grill positioned as the home of the Budda Roll. The brand strategy defines the competitive territory as bakery-led Hawaiian comfort and protects these principles:

- The Budda Roll remains the icon
- Hawai‘i is root, not decoration
- Generosity remains the experience standard
- Product truth outranks promotion
- The system must be repeatable before it scales
- Growth must make Budda’s stronger rather than more generic

The franchise experience must translate these principles into operator selection, training, standards, support, and public claims.

### Business context

The restaurant market offers growth but places sustained pressure on unit economics and execution. The National Restaurant Association projects US restaurant and foodservice sales of $1.55 trillion in 2026, with 1.3% inflation-adjusted growth. Its operator research also highlights uneven traffic, rising costs, workforce development, digital ordering, automation, and data analytics as current priorities. [2026 State of the Restaurant Industry](https://restaurant.org/research-and-media/research/research-reports/state-of-the-industry/).

Franchising also continues to expand. The International Franchise Association projects 845,000 franchise establishments in 2026, a 1.5% increase, with Utah among its ten fastest-growing states. [2026 Franchising Economic Outlook](https://www.franchise.org/franchising-economic-outlook/).

Market growth does not establish Budda’s readiness. Discovery must focus on repeatable unit operations, operator support, management capacity, supply chain, technology, and brand governance.

### Product context

The current Next.js application includes:

- A public franchise marketing experience
- Brand, opportunity, process, FAQ, and inquiry routes
- A secured demonstration login
- Location-scoped portal navigation
- Seeded supplies, cart, checkout, orders, resources, account, and support workflows
- Server-validated inquiry delivery to an approved HTTPS webhook
- Process-local duplicate, retry, and throttling controls

The application does not yet include:

- Production identity and access management
- Durable tenant data
- Customer relationship management integration
- Durable inquiry storage
- Shared rate limiting
- Payment, tax, invoice, inventory, or fulfillment systems
- Production support case management
- Approved content workflow
- Franchise Disclosure Document delivery
- State-aware offer controls

## Discovery purpose

The discovery will reduce the risk of building a polished recruitment and portal system around unvalidated users, workflows, claims, and integrations.

### Goal

Produce enough evidence to make five decisions:

1. Who Budda’s should recruit first
2. What Budda’s can credibly promise and prove
3. Which recruitment journey creates useful, compliant conversations
4. Which operator jobs deserve production software
5. What must be operationally true before active franchise sales or portal launch

### Desired outcome

At the end of discovery, each major product requirement will have:

- An owner
- A user or business problem
- Supporting evidence
- A confidence level
- A decision
- A measurable acceptance condition
- A next action

## Problem statement

Budda’s needs a franchise growth system that can attract qualified operators and preserve the brand across locations. The team does not yet have sufficient direct research to confirm the ideal operator profile, the evidence prospects require, the operational support Budda’s can reliably provide, or the portal workflows operators will use.

Without discovery, the project risks:

- Optimizing form volume instead of operator quality
- Publishing claims that exceed the current Franchise Disclosure Document or legal posture
- Selecting operators who cannot reproduce the Budda’s experience
- Building portal features around internal assumptions
- Underestimating tenant isolation, data ownership, and integration complexity
- Turning warmth into inconsistent operations
- Scaling a product icon without a reproducible quality standard

## Decisions in scope

### Recruitment decisions

- Qualified-interest mode versus active-offering mode
- Primary operator segment
- Secondary and nurture segments
- Markets eligible for interest, review, or offer
- Evidence required before an inquiry
- Public qualification language
- Inquiry fields and progression
- Routing and response standards
- Customer relationship management destination
- Claims, disclosures, consent, and retention

### Operator-platform decisions

- Jobs that belong in the portal
- Jobs that belong in existing third-party systems
- Role and location model
- Ordering and approval workflows
- Catalog, pricing, availability, tax, payment, and fulfillment ownership
- Resource governance and document access
- Support intake and case routing
- Reporting and operational alerts
- Identity provider and session requirements
- Tenant data model and audit requirements

### Franchise-readiness decisions

- Minimum evidence for repeatable unit economics
- Budda Roll and menu consistency standards
- Training readiness
- Supply-chain readiness
- Technology and reporting readiness
- Real-estate model
- Quality-assurance process
- Leadership depth
- Brand and cultural governance

## Decisions outside this discovery

The following decisions require separate legal, financial, or operational work:

- Final franchise agreement terms
- Final Franchise Disclosure Document
- Franchise fee, royalty, marketing fee, or Item 19 representation
- Securities, tax, accounting, or financing advice
- Final state registration strategy
- Final real-estate prototype
- Final supply contracts
- Production vendor procurement
- National expansion schedule

Discovery may identify dependencies and questions for these workstreams. It will not replace qualified counsel or financial analysis.

## Discovery principles

### Evidence before adjectives

Use current operating evidence, source context, dates, and owners. Do not substitute polished copy for missing capability.

### Problems before features

Ask operators how they work today, where failures occur, and what outcomes matter. Do not begin interviews by presenting the current portal as the answer.

### Past behavior before future intent

Prioritize examples of recent decisions, workflows, costs, failures, and workarounds. Treat statements about what someone “would use” as low-confidence until behavior supports them.

### Mutual evaluation

The recruitment experience must help Budda’s and the prospect assess fit. Form completion does not imply approval or territory availability.

### Product truth

Research and prototypes cannot alter the Budda Roll, overstate current restaurants, or present planned operating support as available.

### Cultural responsibility

Test whether the platform explains the obligations attached to Hawai‘i roots and hospitality without turning culture into a screening slogan or decorative theme.

### Compliance by design

Franchise claims, financial-performance representations, consent, state availability, and disclosure delivery are product constraints. They are not footer copy added after design.

## Current evidence baseline

### High-confidence internal evidence

| Evidence | What it supports | Confidence |
| --- | --- | --- |
| Brand Strategy 01–10 | Position, product hierarchy, growth doctrine, guardrails | High |
| Design System v2.0 | Visual, interaction, accessibility, and brand implementation | High |
| Product Truth Master | Budda Roll visual and product constraints | High |
| Franchise Website PRD v1.0 | Approved qualified-interest product direction | High |
| Current Next.js prototype | Technical feasibility and testable workflows | High for feasibility, low for demand |
| Existing public business evidence | Current locations, menu breadth, origin, and community behavior | Medium to high by claim |

### High-confidence external evidence

| Evidence | Discovery implication | Confidence |
| --- | --- | --- |
| FTC Franchise Rule and guidance | Claims and Franchise Disclosure Document boundaries require traceable control | High |
| National Restaurant Association 2026 research | Operators face cost, labor, traffic, and technology pressure | High |
| International Franchise Association 2026 outlook | Franchise activity is growing, including in Utah | Medium to high |
| Official competitor franchise sites | Mature systems lead with operator fit, evidence, process, and support | Medium |
| WCAG 2.2 | Accessibility criteria should shape research and acceptance tests | High |

### Low-confidence or missing evidence

- No completed first-party interviews with prospective Budda’s operators
- No recorded interviews with current location managers about system repeatability
- No franchisee cohort using the portal in daily operations
- No field analytics from a production inquiry funnel
- No validated lead-quality rubric
- No approved state availability matrix
- No approved financial qualification threshold
- No approved Item 19 claim set
- No measured support volume or support service-level agreement
- No production integration inventory
- No evidence that portal ordering should replace an existing procurement tool

## Audience hypotheses

These are provisional segments. Do not treat them as personas until research includes at least five independent data points per segment.

### Segment A: Experienced owner-operator

**Hypothesis:** A hands-on restaurant operator values product distinction, operating clarity, support quality, and community fit more than broad investment language.

**Current confidence:** Medium

**Evidence:** Budda’s strategy prioritizes hospitality and product consistency. Chick-fil-A’s operator experience demonstrates the value of explicit hands-on expectations, while its legal flow separates expression of interest from an offer. [Chick-fil-A franchise information](https://www.chick-fil-a.com/franchise), [Chick-fil-A franchise legal notice](https://www.chick-fil-a.com/legal/franchise/franchise-legal).

**Validation need:** Interview at least five experienced owner-operators who have evaluated a restaurant franchise in the last two years.

### Segment B: Emerging multi-unit group

**Hypothesis:** A multi-unit group will require evidence of repeatability, training, technology, supply chain, real estate, and management depth before brand story affects the decision.

**Current confidence:** Medium

**Evidence:** Hawaiian Bros publicly specifies multi-unit experience, development commitments, financial requirements, training, opening support, and technology support. These are useful diligence categories, not Budda’s requirements. [Hawaiian Bros franchising](https://www.hawaiianbros.com/franchising).

**Validation need:** Interview at least five multi-unit operators or development leaders who have added a brand within the last three years.

### Segment C: Qualified future prospect

**Hypothesis:** Some brand fans and hospitality leaders have long-term potential but need education and nurture rather than immediate qualification.

**Current confidence:** Low

**Validation need:** Analyze actual inquiry data after launch and interview high-intent prospects who do not meet the initial operating profile.

### Segment D: Franchise-development team

**Hypothesis:** The internal team needs fewer, better-qualified inquiries with complete source, market, experience, consent, and follow-up context.

**Current confidence:** Medium

**Validation need:** Map the current lead workflow, response capacity, qualification steps, data fields, handoffs, and failure modes with every person who will handle inquiries.

### Segment E: Franchise operator using the portal

**Hypothesis:** Operators will prioritize supply ordering, current resources, order status, account context, and support routing.

**Current confidence:** Low

**Evidence:** These workflows exist in the prototype but have not been validated with production operators.

**Validation need:** Conduct contextual interviews with operators or restaurant managers using their current tools. Test workflows rather than isolated screens.

## Core hypotheses

### H1: Product distinction earns attention

**Belief:** Leading with the Budda Roll will improve comprehension and qualified interest.

**Test:** Run ten-second comprehension sessions and compare a Budda Roll-led opening with a generic opportunity-led opening.

**Success signal:** At least 8 of 10 participants identify the brand, category, product icon, and franchise purpose without prompting.

**Decision:** Keep, revise, or reduce the Budda Roll opening role.

### H2: Evidence before inquiry improves lead quality

**Belief:** Prospects who review product, operating, support, and fit evidence before the form will submit more useful inquiries.

**Test:** Compare source path, evidence-section exposure, form starts, completions, and downstream qualification.

**Success signal:** Evidence-exposed sessions produce a higher qualified-inquiry rate without a material increase in abandonment among qualified prospects.

**Decision:** Set the final page and call-to-action sequence.

### H3: Progressive qualification balances effort and usefulness

**Belief:** A staged inquiry form will outperform a single long form on qualified completions.

**Test:** Usability-test both patterns, then run a controlled experiment after sufficient traffic.

**Success signal:** The staged form improves completed, routable inquiries and does not increase field-error rate or time beyond the accepted threshold.

**Decision:** Choose the production form architecture.

### H4: Operator fit should be explicit

**Belief:** Clear operating, leadership, capital-readiness, and cultural expectations will reduce out-of-scope inquiries.

**Test:** Show alternative fit-language prototypes to owner-operators and franchise-development stakeholders.

**Success signal:** Prospects can explain who is a fit, who is not, and why, without interpreting the criteria as guaranteed approval.

**Decision:** Lock the public fit model and internal routing rubric.

### H5: The portal should start with a small set of daily jobs

**Belief:** Ordering, current resources, order visibility, and support represent the highest-value initial operator jobs.

**Test:** Interview operators in context and map frequency, severity, workarounds, systems, and data dependencies.

**Success signal:** At least three jobs show repeated evidence across five or more operators, occur at least monthly, and have a clear owner and integration path.

**Decision:** Define the production portal MVP or pause portal investment.

### H6: A shared brand system can support two densities

**Belief:** The public site can remain expressive while the portal remains task-focused without creating two brands.

**Test:** Conduct brand-recognition, task-completion, accessibility, and visual-consistency reviews across both experiences.

**Success signal:** Participants recognize both experiences as Budda’s and complete core portal tasks without decorative interference.

**Decision:** Lock shared tokens and channel-specific component rules.

### H7: Budda’s needs a formal readiness gate before Mode B

**Belief:** Active-offering content should remain disabled until operational, financial, legal, and support evidence is complete.

**Test:** Build a readiness scorecard with accountable owners and review it with leadership and counsel.

**Success signal:** Every required capability has evidence, an owner, a review date, and an approved state.

**Decision:** Enable Mode B, continue qualified-interest mode, or pause recruitment.

## Research questions

### Franchise readiness

1. Which unit-level results are stable across current restaurants?
2. Which results depend on a founder or a specific manager?
3. Can a new manager reproduce the Budda Roll standard from documented systems?
4. Which menu items and dayparts must remain core?
5. Which vendors, ingredients, and specifications create supply risk?
6. What training exists, and what training remains tribal knowledge?
7. What quality checks are measurable today?
8. Which site formats have evidence?
9. Who can train and support another operating team?
10. Which readiness failures would stop franchise recruitment?

### Target operator

1. What operating background predicts success with Budda’s?
2. Does Budda’s want an owner-operator, multi-unit group, area developer, or staged mix?
3. How much hands-on involvement is required?
4. Which leadership behaviors matter?
5. Which cultural and hospitality responsibilities must be demonstrated?
6. Which financial-readiness information belongs in the first inquiry?
7. Which signals justify a conversation?
8. Which signals require nurture, hold, or decline?
9. How should first-time entrepreneurs be handled?
10. Which markets match the operating model and support radius?

### Recruitment experience

1. What does a serious prospect need before sharing contact information?
2. Which evidence creates confidence?
3. Which claims create skepticism?
4. How do prospects compare franchise opportunities?
5. Where do they expect fees, investment, territory, and performance information?
6. Which inquiry fields feel premature?
7. What response time do they expect?
8. What should the confirmation explain?
9. Which content should remain ungated?
10. Which sources bring qualified prospects?

### Franchise operations

1. Which tasks consume operator or manager time each week?
2. Which information becomes outdated or difficult to find?
3. How are supplies ordered today?
4. How are prices, availability, substitutions, and approvals managed?
5. How are invoices and delivery issues resolved?
6. How are training and campaign materials distributed?
7. How are support cases submitted and tracked?
8. Which work occurs on mobile during service?
9. Which roles need access to which locations?
10. Which systems already solve these jobs?

### Legal, privacy, and trust

1. Is Budda’s collecting interest or making an active offer in each state?
2. Which Franchise Disclosure Document version governs each prospect?
3. Does Item 19 contain approved financial-performance representations?
4. Which public claims require source context?
5. What consent supports email, phone, or text follow-up?
6. How long should inquiry data be retained?
7. Who may access prospect data?
8. Which brokers or outside sellers receive data?
9. How are deletion, correction, suppression, and disclosure requests handled?
10. What must the website record for audit?

### Technical and operational feasibility

1. Which system owns prospect records?
2. Which system owns franchisee identity?
3. Which system owns location, catalog, price, inventory, order, invoice, and support data?
4. What service-level agreements exist for each integration?
5. What happens when an integration fails?
6. Which workflows require durable idempotency?
7. What is the tenant-isolation model?
8. Which audit events are required?
9. Which production environments and owners exist?
10. What is the launch rollback plan?

## Research plan

### Track 1: Internal readiness audit

**Participants**

- Founders and executive sponsor
- Franchise-development owner
- Operations leader
- Current restaurant managers
- Training owner
- Supply-chain owner
- Finance owner
- Brand and cultural reviewer
- Legal counsel
- Technology owner

**Methods**

- Semi-structured interviews
- Documentation audit
- Store and workflow observation
- Claims and evidence inventory
- System and vendor inventory
- Readiness scorecard workshop

**Minimum sample**

- One interview with every accountable function
- Two current restaurant managers
- Two frontline workflow observations across different locations or dayparts

**Outputs**

- Readiness scorecard
- Claims register
- Operating-system gap map
- Dependency inventory
- Decision-owner matrix

### Track 2: Prospective operator research

**Participants**

- Five experienced owner-operators
- Five multi-unit operators or development leaders
- Three qualified future prospects if available
- Three franchise advisors, brokers, attorneys, or development professionals for process context

**Recruiting criteria**

- Evaluated or acquired a restaurant franchise within the last three years
- Can describe a real diligence process
- Mix of accepted, declined, and abandoned opportunities
- No participant treated as representative of a segment without at least five independent data points

**Methods**

- 45-minute problem interviews
- Franchise-evaluation journey mapping
- Evidence and claims comprehension
- Prototype walkthrough
- Inquiry-form usability test

**Outputs**

- Jobs-to-be-done map
- Trigger, pain, objection, and outcome themes
- Operator-segment evidence
- Diligence content hierarchy
- Form and routing recommendations

### Track 3: Operator workflow research

**Participants**

- Five to eight restaurant operators or general managers
- At least two multi-location leaders
- Internal support, procurement, finance, and training owners

**Methods**

- Contextual inquiry using current tools
- Task and frequency inventory
- Service blueprint
- Data-source mapping
- Prototype task testing

**Target tasks**

- Order approved supplies
- Find a current operating resource
- Review order or invoice status
- Submit and track support
- Change location or role context
- Review account and compliance requirements

**Outputs**

- Prioritized operator jobs
- Current-state workflow maps
- System-of-record map
- Portal MVP recommendation
- Integration and data-contract backlog

### Track 4: Market and competitor scan

Review mature franchise recruitment experiences for patterns, not claims to copy.

**Reference set**

- Hawaiian Bros
- Crumbl
- Chick-fil-A
- Tropical Smoothie Cafe
- Cinnabon
- One regional emerging restaurant brand
- One non-restaurant operator portal

**Evaluation criteria**

- Operator segment clarity
- Product or concept distinction
- Evidence hierarchy
- Qualification transparency
- Support specificity
- Process clarity
- Form effort
- Legal and state-language treatment
- Accessibility
- Mobile performance

**Output**

- Pattern library
- Avoid list
- Budda’s differentiation implications

### Track 5: Analytics and funnel baseline

Instrument the public experience before optimizing it.

**Required measures**

- Source and campaign
- Landing route
- Evidence-section exposure
- Call-to-action clicks
- Form start
- Step completion
- Field errors
- Final submission
- Routing classification
- Delivery status
- Time to first response
- Qualified conversation

Do not send personally identifying inquiry values to analytics.

## Interview guides

### Prospective operator interview

Ask about one recent, real franchise evaluation:

1. What changed that made you evaluate a new concept?
2. Where did you first learn about it?
3. What did you need to know before contacting the franchisor?
4. Which evidence did you trust?
5. Which claims created skepticism?
6. What did you compare across brands?
7. What caused you to continue, pause, or leave?
8. When did you discuss capital, territory, and operating experience?
9. What did the franchisor ask too early or too late?
10. What support mattered most?
11. Which part of diligence consumed the most time?
12. What would have disqualified the opportunity?

Then test the Budda’s prototype:

1. Explain what Budda’s is in your own words.
2. What appears proven?
3. What appears planned?
4. Who seems to be a fit?
5. What information is missing?
6. What would you do next?

Avoid asking whether they “like” the site until after comprehension and task questions.

### Current operator or manager interview

1. Walk through your last supply order.
2. Where did the product, price, and availability information come from?
3. What went wrong?
4. How did you resolve it?
5. Walk through the last resource you needed during a shift.
6. How did you know it was current?
7. Walk through the last support request.
8. Who owned the response?
9. Which task do you repeat that should not require manual coordination?
10. Which existing tool should Budda’s not replace?
11. Which data would be harmful if shown to the wrong location?
12. What must work on a phone during service?

### Internal stakeholder interview

1. Which decision are you accountable for?
2. What evidence do you use today?
3. Which information is missing or unreliable?
4. Where does a founder or expert compensate for a missing system?
5. Which process fails when volume doubles?
6. Which promise can Budda’s make consistently today?
7. Which promise must remain private or future-facing?
8. What would stop franchise expansion?
9. What would make this discovery successful for you?
10. Which decision must the team make at the end?

## Research operations

### Consent and privacy

- Obtain recording permission
- Explain how notes and recordings will be used
- Avoid collecting unnecessary financial details
- Remove identifying details from research synthesis where appropriate
- Store recordings and transcripts in approved systems
- Define deletion dates before sessions begin
- Do not reuse franchise inquiry consent as research consent

### Evidence repository

Every observation should include:

- Research source
- Participant segment
- Date
- Method
- Exact quote or observed behavior
- Context
- Theme
- Confidence
- Product implication
- Decision affected

### Confidence scale

| Confidence | Standard |
| --- | --- |
| High | Appears in at least three independent sources, occurs without prompting, and is consistent across relevant segments |
| Medium | Appears in two sources or one segment, or requires prompting |
| Low | One source, proxy evidence, future intent, or internal assumption |

### Synthesis rules

- Separate frequency from severity
- Separate operator segments
- Flag contradictory evidence
- Do not average across owner-operators and multi-unit groups
- Do not convert a feature request directly into a requirement
- Trace every recommendation to evidence
- Preserve negative evidence

## Opportunity map

### Outcome

Recruit and enable operators who can reproduce a genuine Budda’s experience.

### Opportunity 1: Prospects cannot judge readiness

Potential solutions:

- Evidence ledger
- Current-versus-planned support labels
- Readiness disclosures
- Diligence content

### Opportunity 2: Budda’s cannot distinguish fit consistently

Potential solutions:

- Operator profile
- Structured inquiry
- Versioned routing rubric
- Manual-review path

### Opportunity 3: Operators cannot find current operating information

Potential solutions:

- Governed resource library
- Role and location context
- Review and expiry dates
- Search and alerts

### Opportunity 4: Supply ordering relies on fragmented systems

Potential solutions:

- Approved catalog
- Location pricing
- Availability and substitutions
- Order and invoice status

### Opportunity 5: Support loses operational context

Potential solutions:

- Location-scoped support intake
- Topic routing
- Service-level visibility
- Case history

Do not prioritize a solution until discovery validates the underlying opportunity.

## Readiness scorecard

Leadership and counsel must review each category before enabling active-offering mode.

| Category | Evidence required | Owner | Gate |
| --- | --- | --- | --- |
| Unit economics | Repeatable, reviewed store-level economics | Finance | Required |
| Budda Roll standard | Documented specification and quality verification | Product/operations | Required |
| Menu discipline | Approved core menu and change control | Operations | Required |
| Supply chain | Approved vendors, specifications, and contingencies | Supply chain | Required |
| Training | Teachable curriculum and assessed completion | Training | Required |
| Hospitality | Documented, observable service standards | Operations/brand | Required |
| Technology | Supported stack, ownership, and reporting | Technology | Required |
| Quality assurance | Inspection, remediation, and audit process | Operations | Required |
| Real estate | Evidence-backed site criteria | Development | Required |
| Leadership | Capacity to train and support another operator | Executive | Required |
| Brand governance | One source of truth and approval workflow | Brand | Required |
| Franchise legal | Current Franchise Disclosure Document and state strategy | Counsel | Required |

Allowed states:

- **Not started:** No owner or evidence
- **In progress:** Owner and plan exist
- **Pilot evidence:** Tested in limited conditions
- **Ready for review:** Evidence package complete
- **Approved:** Accountable owner and reviewer accept the evidence
- **Blocked:** Known failure prevents progression

Mode B requires every required category to be approved. Leadership may not average scores to override a blocked category.

## Prioritization approach

Use a value, evidence, risk, and effort matrix after research:

| Factor | Question |
| --- | --- |
| User value | Does this solve a repeated, consequential operator or prospect problem? |
| Business value | Does it improve operator quality, readiness, support, or risk control? |
| Evidence | How many independent sources support the need? |
| Risk reduction | Does it reduce legal, security, financial, or brand exposure? |
| Effort | What delivery and operating capacity does it require? |
| Dependency | Which system, owner, or policy must exist first? |

Do not use RICE scoring until the team has credible reach and effort inputs. Early numeric precision would disguise uncertainty.

## Success metrics

### Discovery metrics

- At least 90% of planned interviews completed
- At least five independent data points for each retained operator segment
- Every priority recommendation linked to at least two sources
- Every major assumption assigned a confidence level
- Every readiness category assigned an owner and state
- Zero unresolved high-risk legal or data assumptions presented as product requirements
- Stakeholder decision meeting ends with proceed, revise, pause, or stop for each track

### Recruitment product metrics

- Ten-second brand and opportunity comprehension
- Evidence-section engagement
- Inquiry start and completion
- Required-field completion
- Routing completeness
- Qualified-inquiry rate
- Time to first human response
- Lead-to-conversation rate
- Source quality
- Out-of-scope inquiry rate

### Operator product metrics

Define targets only after current-state baselines:

- Task completion
- Time on task
- Error and rework
- Support contact rate
- Resource freshness
- Order accuracy
- Integration failure
- Weekly active operators by role
- Satisfaction after consequential tasks

Portal usage is not a success metric by itself. A lower login rate may be positive if the platform removes unnecessary work.

## Deliverables

Discovery will produce:

1. Research plan and participant screener
2. Interview and observation guides
3. Evidence repository
4. Operator-segment synthesis
5. Jobs-to-be-done map
6. Prospect diligence journey
7. Operator service blueprint
8. Claims and evidence register
9. Franchise-readiness scorecard
10. System-of-record and integration map
11. Recruitment funnel recommendation
12. Portal MVP or pause recommendation
13. Prioritized opportunity backlog
14. Updated Product Requirements Document
15. Executive decision memo

## Roles and decision rights

| Role | Responsibility |
| --- | --- |
| Executive sponsor | Owns proceed, pause, and investment decisions |
| Product lead | Owns discovery plan, synthesis, and recommendations |
| Franchise development | Owns operator profile, routing, and follow-up process |
| Operations | Owns repeatability, training, quality, and support evidence |
| Finance | Owns unit-economics evidence |
| Brand | Owns product truth, brand claims, and cultural review |
| Legal counsel | Owns franchise, disclosure, state, consent, and claims approval |
| Design/research | Owns interviews, prototypes, usability, and accessibility research |
| Engineering | Owns feasibility, system boundaries, security, and integration analysis |
| Data/analytics | Owns event definitions, baseline, and reporting quality |

No single function may approve its own high-risk claim without the required independent review.

## Recommended four-week cadence

### Week 1: Align and audit

- Kickoff
- Stakeholder interviews
- Readiness evidence inventory
- Claims and system audit
- Research recruiting
- Baseline analytics plan

### Week 2: Research

- Prospective operator interviews
- Current manager and operator observation
- Competitor pattern scan
- Current-state workflow maps

### Week 3: Test

- Synthesis
- Recruitment concept testing
- Inquiry-form usability
- Portal task prototypes
- Technical and legal feasibility review

### Week 4: Decide

- Opportunity prioritization
- Readiness workshop
- Updated requirements
- Executive decision memo
- Proceed, revise, pause, or stop decisions

The cadence is a planning baseline. Participant availability and legal review may change the duration.

## Risks and mitigations

### Recruiting only brand fans

**Risk:** Feedback overstates emotional appeal and understates operating diligence.

**Mitigation:** Recruit operators who evaluated other concepts, including people who declined an opportunity.

### Interviewing one operator segment

**Risk:** The product becomes incoherent for owner-operators and multi-unit groups.

**Mitigation:** Analyze segments separately and select a primary segment.

### Letting the prototype lead interviews

**Risk:** Participants react to proposed screens rather than reveal real problems.

**Mitigation:** Complete problem and workflow questions before showing the product.

### Treating internal opinion as customer evidence

**Risk:** Team confidence hides market uncertainty.

**Mitigation:** Label source and confidence on every insight.

### Publishing financial-performance language during research

**Risk:** Prototype testing creates an unapproved claim.

**Mitigation:** Use counsel-approved or clearly neutral test content. The Federal Trade Commission states that financial-performance claims must have a reasonable basis and appear in Item 19 subject to narrow exceptions. [FTC consumer guide](https://www.ftc.gov/business-guidance/resources/consumers-guide-buying-franchise).

### Exposing sensitive prospect or tenant data

**Risk:** Research and prototypes create privacy or security harm.

**Mitigation:** Minimize data, use synthetic portal records, separate research consent, and restrict access.

### Confusing prototype feasibility with product readiness

**Risk:** A functioning screen becomes evidence that the operation can support it.

**Mitigation:** Require system owners, service levels, data contracts, and failure handling before production approval.

## Decision gates

### Gate 1: Research sufficiency

Pass when:

- Minimum samples are complete
- Segment evidence is separated
- Major contradictions are documented
- No priority recommendation relies on one source

### Gate 2: Qualified-interest product

Choose:

- Proceed
- Revise and retest
- Pause until evidence exists

Pass requires:

- Clear primary operator
- Approved evidence hierarchy
- Tested comprehension
- Useful form and routing model
- Legal and privacy approval
- Staffed follow-up process

### Gate 3: Operator portal

Choose:

- Plan production MVP
- Run a narrower pilot
- Integrate existing systems instead
- Pause

Pass requires:

- Three or more validated operator jobs
- Known systems of record
- Tenant and role model
- Accountable operational owners
- Feasible integration and support plan

### Gate 4: Active offering

Choose:

- Enable by approved state and market
- Continue interest-only mode
- Pause recruitment

Pass requires:

- Approved readiness scorecard
- Current Franchise Disclosure Document
- Approved state strategy
- Approved claims and consent
- Operational capacity to select, train, open, and support operators

## Definition of discovery complete

Discovery is complete when:

- The team can name the primary operator and cite supporting evidence
- The team can explain the operator’s real evaluation journey
- Every public claim has a source, owner, status, and review rule
- The inquiry experience has tested comprehension and usability
- The routing rubric and follow-up process are staffed
- The portal recommendation traces to observed operator work
- Production integrations have owners and system boundaries
- The readiness scorecard has no ownerless category
- Leadership records proceed, revise, pause, or stop decisions
- The Product Requirements Document reflects the decisions

## Reader test

A reader with no project history should be able to answer:

1. What decision is this discovery trying to make?
2. Why are the public site and portal separate tracks?
3. What is known, and what remains a hypothesis?
4. Who must participate?
5. What research samples are required?
6. What prevents active franchise offering?
7. What evidence allows portal production planning?
8. Who owns final decisions?

If the document cannot answer one of these questions, revise it before kickoff.

## Primary references

### Internal

- [Franchise Website PRD v1.0](Buddas_Franchise_Website_PRD_v1.0.md)
- [Franchise platform README](README.md)
- [Platform build plan](../../franchise-website/buddas-franchise-platform.md)
- [Design system](../../franchise-website/design.md)
- [Brand foundations](../../franchise-website/docs/brand-foundations.md)
- [Brand evidence](../../franchise-website/docs/brand-evidence.md)

### External

- [Federal Trade Commission Franchise Rule](https://www.ftc.gov/legal-library/browse/rules/franchise-rule)
- [Federal Trade Commission consumer guide](https://www.ftc.gov/business-guidance/resources/consumers-guide-buying-franchise)
- [National Restaurant Association 2026 report](https://restaurant.org/research-and-media/research/research-reports/state-of-the-industry/)
- [International Franchise Association 2026 outlook](https://www.franchise.org/franchising-economic-outlook/)
- [Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/)
- [Hawaiian Bros franchising](https://www.hawaiianbros.com/franchising)
- [Crumbl franchising](https://crumblcookies.com/franchising)
- [Chick-fil-A franchising](https://www.chick-fil-a.com/franchise)
- [Chick-fil-A franchise legal notice](https://www.chick-fil-a.com/legal/franchise/franchise-legal)

## Immediate next actions

1. Name the executive sponsor and product discovery lead
2. Confirm the primary discovery decisions
3. Approve participant segments and recruiting criteria
4. Assign readiness-category owners
5. Build the claims and evidence register
6. Configure research consent and storage
7. Schedule stakeholder interviews
8. Recruit operator participants
9. Confirm analytics and prototype readiness
10. Book the end-of-discovery decision workshop

> **Protect the Roll. Protect the truth. Validate the system before scaling it.**

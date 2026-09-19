# Corporate operations workspace

The corporate experience extends the existing operator portal with scoped work ownership and processing. `/corporate` is the corporate workspace; `/portal` remains the operator workspace. Public prospective-franchise inquiries remain a separate process. A corporate URL, job title, operator `admin` flag, or assignment is not an access grant.

## Operating boundaries

- Support work requires a responsible intake team, a handler, public replies that reach the operator, private notes that never reach the operator, and a recorded resolution/reopening path.
- Growth intake is an existing operator's request for another location. Review does not reserve territory, execute a franchise agreement, verify financial qualification, or provision a unit by itself.
- Supply coordination requires an agreed supplier, commercial source, destination and cancellation policy. Payment, supplier acceptance, shipment, delivery and cancellation are separate facts. Unknown tax, freight or payment state must remain unknown.
- Catalog publication is a separate location-scoped action. Publishing an approved item makes it visible in one franchise store's supplies catalog; it does not create an order, allocate stock, change inventory, or prove supplier fulfillment.
- Access changes must persist and be effective on server requests. Removing a person's access must not discard the work they owned.
- Approved resources, financial references and credential records are not evidence of a complete CMS, accounting integration or compliance program. Sensitive uploads require private retrieval and an accountable reviewer before activation.

The discovery plan is `.omx/plans/corporate-admin-discovery-2026-09-05.md`. Its recommended future capabilities should not be read as claims that every dependency is connected.

## Authentication and configuration

`src/features/corporate/session.ts` reads the existing Firebase session cookie with revocation checking. Real corporate sessions require verified email, an `ACTIVE` server-owned `corporateStaff/{firebaseUid}` record and at least one active, well-formed membership. Outside development the Firebase token must also carry `firebase.sign_in_second_factor` evidence. An employee who cannot satisfy these conditions is sent to the existing login entry point; this does not enroll a second factor for them.

Firebase Admin uses the existing `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` configuration, or `GOOGLE_APPLICATION_CREDENTIALS`. Configure secrets server-side. Do not put service account credentials in browser environment variables or source control.

Example **shape only**, to be provisioned through an authorized server process after identity and scope verification:

```json
{
  "status": "ACTIVE",
  "displayName": "Approved staff name",
  "email": "verified-staff@example.invalid",
  "memberships": [
    {
      "id": "support-local-grant",
      "bundle": "support_handler",
      "status": "ACTIVE",
      "scope": { "type": "locations", "locationIds": ["VERIFIED_UNIT_ID"] }
    }
  ]
}
```

Corporate staff use the `CORPORATE` identity class; franchisees remain `OPERATOR` identities in the existing portal and cannot be provisioned through the corporate script. Available bundles are `operations_lead`, `support_handler`, `order_coordinator`, `request_approver`, `access_steward`, `leadership`, `content_publisher`, `finance_reviewer`, and `platform_administrator`. Their capability lists live in `src/features/corporate/authorization.ts`; do not infer permission from these labels. A membership can have `startsAt`/`expiresAt` timestamps and can be suspended. Scopes are explicitly `locations`, `regions`, `organizations`, or `corporate`; missing scope never means all records. A regional grant requires a server-owned `regionId` on the target record and a matching `corporateRegions` record. A location grant does not permit entity-level growth decisions.

Keep the staff record's email aligned with the verified provider identity: current assignee resolution requires it even though the signed-in user's session obtains email from the verified token.

For isolated local preview, set `CORPORATE_USE_SEED_DATA=true` while `NODE_ENV=development` and sign in through the existing portal. Both conditions are required. Preview grants and fictional records are marked as such, reset on server restart and must not be represented as live operations. Setting the flag in production or test does not enable seed mode. Remove the flag to return to configured real identity/storage behavior.

## Data and security contract

The corporate storage selector currently supports configured Firestore, explicitly enabled local preview, or an unavailable adapter that rejects reads and writes. It does not automatically use the portal's PostgreSQL adapter. Confirm this distinction before activating either workspace.

## Store catalog publication

`/corporate/catalog` lets a staff member with `MANAGE_CATALOG` publish an approved supply item to a selected authorized franchise location. The default Operations lead bundle includes this permission; the server still checks the selected location's organization and region scope before writing. A published record contains the SKU, approved name and description, category, pack size, lead time, wholesale price, availability, actor, and time. Reusing an existing SKU at that location is rejected rather than silently overwriting its catalog entry.

In configured Firebase, products live at `units/{locationId}/products/{productId}`, which is the same server-rendered catalog source used by the franchise portal. The action writes an idempotent corporate command and an audit event in the same Firestore transaction. It does not configure a supplier, inventory system, price synchronization, tax, payment, or fulfillment integration. Those remain separate operating sources.

Bulk catalog publications create a server-owned batch with one result per selected store. Active authorized locations are eligible; other stored location statuses remain visible but cannot be selected. Immediate batches publish each destination independently, so partial failures remain retryable without repeating completed stores. A successful immediate batch records its prior catalog entries for a ten-minute restore window and refuses to overwrite a later catalog change during rollback.

Scheduled batches are stored with their effective time and processed by `/api/internal/catalog-publications/execute`. `vercel.json` runs that endpoint every five minutes. Configure `CATALOG_PUBLICATION_CRON_SECRET` (or Vercel's `CRON_SECRET`) before deployment; the route rejects unauthenticated scheduler calls. The runner rechecks a location's current status before it writes the item, then records `PUBLISHED`, `FAILED`, or `NOT_ELIGIBLE` for that destination.

## Franchise inquiry routing

Public franchise inquiries are prospective-candidate records, not operator growth requests. The public form stores the candidate inquiry durably before webhook delivery, calculates a server-owned routing result from the **target market**, and exposes the record only through `/corporate/inquiries` to staff with the `franchise_development` bundle and a matching inquiry scope.

Define franchise-development routing separately from operating-store regions:

```text
franchiseDevelopmentRegions/{regionId}
  status: ACTIVE | INACTIVE
  teamId: franchise-development team identifier
  ruleVersion: routing-rule version
  stateCodes: ["AZ", "NV"]
  marketAliases: ["phoenix", "las vegas"]
```

The resolver prefers a unique market-alias match, then a unique target-state selection or state code in the target market. Ambiguous or absent matches route to `franchise-development-intake` with `NEEDS_REVIEW` or `UNROUTABLE` status. Current residence supplies candidate context only; it does not override the target-market route. A manual override requires the current scope and the destination region scope, a configured active destination region, a version match, and a recorded reason.

Inquiry routing, workflow/ownership, human decision, and webhook/CRM delivery are separate fields. Every corporate routing, claim, hold, advance, and closure appends a staff-attributed activity entry within the protected inquiry record. Classification is a triage suggestion based on the existing form, not an automated qualification, decline, territory award, or account-creation decision. Candidate PII requires `VIEW_INQUIRY_PII`; regional routing and ownership do not automatically grant it.

| Record | Current storage boundary |
|---|---|
| Corporate membership | `corporateStaff/{uid}`; independently reloaded for the corporate session |
| Directory location/entity | `units` and `franchiseEntities`; optional fields remain unavailable/unverified |
| Generic corporate work record | `corporateWorkRecords`; domain work must not acquire a contradictory second state authority |
| Generic command receipt/audit/delivery | `corporateCommands`, `corporateAuditEvents`, `corporateDeliveryIntents`; committed together by the generic command path |
| Existing access status changes | `corporateStaff`, assigned `corporateWorkRecords`, related support ownership, central audit, and delivery intent; committed transactionally before provider-session revocation is attempted |
| Operator support ticket | `units/{unitId}/supportTickets/{caseId}`; existing operator-facing record |
| Support conversation/private notes | Ticket `publicMessages` and `privateNotes` subcollections; operator projection allowlists public fields |
| Support command evidence | Ticket `events` and `commandReceipts`; committed together with the support change |
| Corporate resource metadata | `corporateResources`; this metadata collection alone does not publish or protect a downloadable file |

Generic corporate commands and ticket commands keep distinct domain receipts, while support changes also project their audit and safe delivery intent into the central corporate collections. The presence of a delivery-intent record does not prove email or another transport is wired. Existing support actions revalidate corporate and operator routes after a successful command. Do not claim external delivery or downstream synchronization based on cache revalidation.

Access stewards can suspend or reinstate an existing reviewed identity. The command rejects self-changes, stale versions, out-of-scope grants, missing replacement stewards, and identities with too much unreassigned work for one safe transaction. It returns owned work to accountable teams, records the change, and surfaces provider-revocation failure for recovery. New grants and invitation delivery remain dry-run-first provisioning work because no approval authority or mail provider is configured.

The corporate order and growth-request readers project existing authorized portal records without rewriting them. Order details intentionally mark supplier, fulfillment, payment, integration, and cancellation evidence as unknown when the portal record lacks an authoritative source. Growth milestones are shown as milestones, not independent approval evidence.

Corporate identity is authenticated by the selected server session provider, then checked against current corporate membership. Authorization combines an explicit capability with the target organization's or location's scope. Scope comes from the actual stored record. Browser fields and the selected portfolio filter may narrow a query; they cannot enlarge permission.

Each consequential command must use a stable operation key, expected record version and validated transition. A successful response follows the committed business record. Retrying the same operation and payload must return the same result; reusing a key for a different payload is a conflict. Conflicting decisions must ask for a renewed review. Append messages rather than replacing a conversation array with a stale copy.

Public messages and corporate notes have separate visibility boundaries. The operator projection, browser SDK, notifications, search results and exports must all exclude internal notes and their files. File metadata authorization alone does not protect a publicly accessible asset URL.

Audit history records actor, time, action, target scope, safe changed fields, outcome and command reference. Delivery intent belongs beside the committed work; failed email or provider delivery is owned and recoverable, and never proof that the business operation failed or succeeded.

## Pilot activation checklist

1. Confirm the deployed identity and operational datastore configuration. Existing portal adapters are not assumed to have equal feature guarantees.
2. Reconcile actual users, legal entities and location IDs. An entity automatically linked during intake is not a verified legal entity.
3. Give the first staff cohort explicit capability and scope grants. Establish a recovery access owner before suspending or removing the final steward.
4. Name support intake coverage, handlers, closure rules and escalation contacts. Do not publish an SLA or urgent-contact promise without staffing approval.
5. Exercise a support issue through operator submission, corporate assignment, public information request, operator reply, resolution and reopening using isolated records.
6. Verify denied cross-location and cross-entity requests, private-note exclusion, concurrent claims/replies, duplicate commands and failed storage/delivery behavior.
7. Enable ordering only after supplier, pricing, availability, finance and fulfillment owners are known and an acknowledgment/reconciliation process has been demonstrated.
8. Enable sensitive attachments only after access, type/signature, size, scanning/quarantine and removal policies have been exercised.

No production record should be fabricated to populate an empty queue. Empty authorized results and unavailable dependencies must be distinguishable.

## Verification and known limits

Corporate tests live in `tests/corporate-*.test.mjs` and use the repository's existing Node test runner. `corporate-foundation` checks permission/scope and command invariants; `corporate-storage-contracts` exercises the actual server storage against an isolated transaction double; `corporate-route-contracts` protects response headers, route guards and presentation boundaries. Support and request/order tests are maintained with their domain modules. The transaction double models atomic commit and serial contention for command verification; it is not a Firebase emulator or evidence of deployed Firestore behavior. Source-contract tests do not certify browser accessibility, external provider behavior or restart durability.

The implementation coordinator records the final build/test result. A local or in-memory pass is not evidence that supplier acknowledgments, email delivery, privileged-session revocation, private asset delivery or production backup restoration work. Those require the corresponding configured provider and isolated end-to-end verification.

Recommended simplifications are one corporate shell, typed domain workspaces and reusable scoped commands. There is no requirement to add a workflow engine, event bus, microservices, a new CRM or a new help desk for the first closed support loop.

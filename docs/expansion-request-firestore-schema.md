# Additional-unit request records

The authenticated flow lives at `/portal/expansion`. It replaces the need for an existing franchisee to use the anonymous public inquiry, but it does not replace legal disclosure, diligence, agreement execution, or unit provisioning.

## Entity relationship

The server reads `operators/{firebaseUid}.franchiseEntityId`. If an existing operator has no entity link, the first submitted request creates `franchiseEntities/entity-{firebaseUid}` and links the operator using Firebase Admin. The legal name is copied only when the active unit already contains an authoritative `franchiseeName`; otherwise it remains unset.

## Application document

```yaml
franchiseEntities/{entityId}/expansionApplications/{applicationId}
  applicantOperatorId: firebaseUid
  applicantName: Approved display name
  applicantEmail: operator@example.com
  originatingUnitId: HNL-014
  targetMarket: North Shore, Oʻahu
  normalizedTargetMarket: north shore, oʻahu
  preferredTimeline: 12 - 24 months
  investmentRange: Canonical inquiry range
  siteReadiness: EXPLORING # EXPLORING | MARKET_IDENTIFIED | SITE_IDENTIFIED | LOI_OR_CONTROL
  operatingPlan: Operator-provided narrative
  status: SUBMITTED
  submittedAt: ISO-8601 timestamp
  updatedAt: ISO-8601 timestamp
  provisionedUnitId: HNL-015 # added only when entering BUILDOUT
  activatedAt: ISO-8601 timestamp # added only when entering ACTIVE
```

The canonical status sequence is defined in `src/features/portal/expansion-status.ts`. Server actions reject skipped or reversed transitions. Declined, withdrawn, and active records are terminal.

## Provisioning boundary

An administrator may move an application to Buildout only after `units/{unitId}` exists. The validated unit ID is stored on the application. Moving Buildout to Active runs a Firestore transaction that updates the application and appends the validated unit ID to the applicant operator's `managedUnitIds`. The active working unit is not changed automatically.

The application collection remains inaccessible to the Firebase browser SDK under the default-deny `firestore.rules`. Reads and writes go through authenticated server code using Firebase Admin. Audit records include application reference, stage, actor, outcome, and provisioned unit where applicable; they exclude the operating plan and investment range.

## Known integration boundaries

This implementation does not send CRM notifications, reserve a territory, create a Firestore unit, issue an FDD, collect a franchise-agreement signature, or automate site approval. Those remain explicit operational handoffs. The administrator must create the approved `units/{unitId}` record before selecting Buildout.

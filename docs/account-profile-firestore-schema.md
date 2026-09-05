# Account-profile Firestore records

The Operator Workspace reads the authenticated user's own `operators/{uid}` record and only shows franchise units listed in `managedUnitIds`. The new account profile fields are optional. Missing fields render as unavailable; the application does not invent legal, licensing, territory, manager, inspection, or renewal data.

## Operator document

Add a non-sensitive `franchiseEntityId` to the existing operator document when the operator should see corporate records:

```yaml
operators/{firebaseUid}
  role: franchisee
  activeUnitId: HNL-014
  activeUnitName: La'ie Origin Grill
  managedUnitIds: [HNL-014, OAH-207]
  displayName: Operator Name
  franchiseEntityId: keahi-leilani-akana
```

The unit switch is server-authorized. It checks that the selected unit remains in `managedUnitIds`, writes only the active unit fields on this authenticated operator document, records the existing `UNIT_CHANGED` audit event, and redirects to the workspace.

## Private entity record

Store corporate data in `franchiseEntities/{franchiseEntityId}`. Firestore's existing catch-all rule denies browser access to this collection; the account page reads it through Firebase Admin only after authenticating the operator and resolving that operator's own entity ID.

```yaml
franchiseEntities/keahi-leilani-akana
  legalName: Keahi & Leilani Akana
  taxIdLast4: "1234" # Store last four only; never store a full EIN/Tax ID here.
  franchiseAgreementRenewalAt: "2027-09-30T00:00:00.000Z"
  businessLicenses:
    - number: HI-BL-000000
      issuingAuthority: State of Hawaii
      expiresAt: "2027-06-30T00:00:00.000Z"
```

Business-license numbers are rendered only into the server-rendered profile for the authorized operator. Tax IDs display as `••-••••1234` and full values are deliberately unsupported.

## Unit record additions

Add these optional fields to an authorized `units/{unitId}` document:

```yaml
units/HNL-014
  address:
    line1: "123 Example Street"
    line2: "Suite 100" # optional
    city: "La'ie"
    state: "HI"
    postalCode: "96762" # optional
  storeStatus: ACTIVE # ACTIVE | BUILDOUT | REMODEL
  designatedGeneralManager: "Approved manager name"
  healthInspectionCycle: "Annual" # optional operator-visible cycle label
  healthInspectionRenewalAt: "2027-04-15T00:00:00.000Z"
  territoryStatus: EXCLUSIVE # EXCLUSIVE | NON_EXCLUSIVE | PENDING_REVIEW
  deliveryProfile:
    dockInstructions: "Provide only verified receiving instructions"
    forkliftRequired: true
    liftgateRequired: false
    receivingHours: "Mon–Fri, 8:00 AM–2:00 PM HST"
    emergencyDeliveryContact:
      name: "Approved receiving contact"
      phone: "+1-555-000-0000" # optional
```

The existing `isOpen`, `launchStage: PRE_OPENING`, and `launchStage: REMODEL` fields provide a limited truthful fallback for the store-status badge. No fallback is used for addresses, managers, health-inspection cycles, territory status, licenses, or renewal dates.

## Payment and statement records

Payment references and financial documents remain in the private entity document. Store token/provider IDs and the final four digits only; do not store ACH routing/account numbers, card PANs, CVVs, payment tokens, or raw account credentials in Firestore.

```yaml
franchiseEntities/keahi-leilani-akana
  storedAchAccounts:
    - id: ach-profile-id
      label: Primary operating account
      last4: "1234"
  businessCreditCards:
    - id: card-profile-id
      label: Purchasing card
      network: Visa
      last4: "5678"
  franchiseCreditLines:
    - id: wholesale-net-30
      label: Wholesale franchise credit
      terms: Net 30
      availableBalance: 0 # server-authoritative number; omit when unavailable
      currency: USD
      availableBalanceAsOf: "2027-04-15T00:00:00.000Z"

franchiseEntities/keahi-leilani-akana/financialDocuments/{documentId}
  type: WHOLESALE_INVOICE # ROYALTY_FEE | MARKETING_FUND | WHOLESALE_INVOICE
  title: April wholesale supply invoice
  period: April 2027
  referenceId: INV-000000
  unitId: HNL-014 # optional; enforced against managedUnitIds when present
  issuedAt: "2027-04-30T00:00:00.000Z"
  downloadUrl: "https://cdn.sanity.io/..." # HTTPS only, preferably a short-lived authorized URL
```

The account page lists at most 24 newest documents. Downloads go through `/portal/account/documents/{documentId}`: the server verifies the signed-in operator, entity membership, and any unit scope before redirecting to a stored HTTPS URL. A successful download writes the `FINANCIAL_DOCUMENT_DOWNLOADED` audit event without logging the payment data or URL.

## Food safety credentials and brand sign-offs

Credential files upload to Sanity only after the server validates the authenticated active unit. Firestore contains status and Sanity asset metadata, never the file body. Set `SANITY_PROJECT_ID`, `SANITY_DATASET`, and a server-only `SANITY_API_TOKEN` before enabling uploads. The upload accepts PDF, JPEG, and PNG files up to 10 MB.

```yaml
units/HNL-014/foodSafetyCredentials/{credentialId}
  type: SERVSAFE # SERVSAFE | STATE_HEALTH_CERTIFICATION | FOOD_HANDLER_CARD
  holderName: Approved credential holder
  status: SUBMITTED # SUBMITTED | VERIFIED | EXPIRING_SOON | EXPIRED | REJECTED
  expiresAt: "2027-04-15T00:00:00.000Z" # optional
  sanityAssetId: file-asset-id
  documentUrl: https://cdn.sanity.io/files/...
  submittedByUserId: firebaseUid
  submittedAt: "2027-03-01T00:00:00.000Z"

units/HNL-014/brandSignoffRequirements/{signoffId}
  type: BRAND_STANDARD_MANUAL # BRAND_STANDARD_MANUAL | SEASONAL_RECIPE | SUPPLY_PROTOCOL_AUDIT
  title: Approved material title
  version: "2027.1" # optional
  effectiveAt: "2027-04-01T00:00:00.000Z" # optional
  sourceUrl: https://... # optional approved source material
  mode: DIGITAL_SIGNATURE # DIGITAL_SIGNATURE | ACKNOWLEDGEMENT
```

Each completed sign-off is server-written to the requirement's `acknowledgements/{firebaseUid}` subcollection with the operator ID, working unit, timestamp, sign-off mode, requirement version, and—only for a digital-signature requirement—the typed legal name. The action requires a clear authorization attestation and writes `BRAND_STANDARD_SIGNED` to the audit store. Credential upload writes `FOOD_SAFETY_CREDENTIAL_SUBMITTED` without logging the file, personal credential content, or Sanity URL.

Firestore rules deny direct browser reads of credential and sign-off collections. This prevents raw compliance files and signer data from being retrieved through the Firebase client SDK; the account page renders the allowed status information through the authenticated server.

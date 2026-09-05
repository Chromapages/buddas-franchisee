import Link from "next/link";
import type { ReactNode } from "react";
import { Building2, CreditCard, Download, FileCheck2, ShieldCheck, Store, ArrowRight, Clock, Truck } from "lucide-react";
import { defaultPortalStorage } from "@/src/features/portal/storage-adapter";
import { logoutAction, switchPortalLocationAction } from "@/src/features/auth/actions";
import { requirePortalPermission } from "@/src/features/portal/authorization-server";
import { formatPortalDateTime } from "@/src/features/portal/date-time";
import { AccountSignOut } from "@/src/components/portal/account-sign-out";
import type { PortalLocation, PortalStoreStatus, PortalTerritoryStatus } from "@/src/features/portal/types";
import { getAccountEntityRecord, getFinancialDocuments } from "@/src/features/portal/account-private-records";
import { getBrandSignoffs, getFoodSafetyCredentials } from "@/src/features/portal/compliance-records";
import { FoodSafetyCredentialUpload } from "@/src/components/portal/food-safety-credential-upload";
import { BrandSignoffForm } from "@/src/components/portal/brand-signoff-form";
import { isSanityCredentialUploadConfigured } from "@/src/lib/sanity/credential-upload";

const storeStatusLabel: Record<PortalStoreStatus, string> = {
  ACTIVE: "Active",
  BUILDOUT: "Buildout",
  REMODEL: "Remodel",
};

const territoryStatusLabel: Record<PortalTerritoryStatus, string> = {
  EXCLUSIVE: "Exclusive",
  NON_EXCLUSIVE: "Non-exclusive",
  PENDING_REVIEW: "Pending review",
};

const getStoreStatus = (location: PortalLocation | null): PortalStoreStatus | null => {
  if (!location) return null;
  if (location.storeStatus) return location.storeStatus;
  if (location.isOpen) return "ACTIVE";
  if (location.launchStage === "REMODEL") return "REMODEL";
  if (location.launchStage === "PRE_OPENING") return "BUILDOUT";
  return null;
};

const formatLocation = (location: PortalLocation): string => {
  if (location.address) {
    return [location.address.line1, location.address.line2, [location.address.city, location.address.state, location.address.postalCode].filter(Boolean).join(" ")]
      .filter(Boolean)
      .join(", ");
  }
  return [location.city, location.state].filter(Boolean).join(", ");
};

const dateLabel = (value: string | undefined, locationId: string): ReactNode => {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? <time dateTime={date.toISOString()}>{formatPortalDateTime(date.toISOString(), locationId)}</time> : "Not available";
};

const moneyLabel = (value: number, currency: string): string => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency,
  maximumFractionDigits: 2,
}).format(value);

const financialDocumentLabel = {
  ROYALTY_FEE: "Royalty fee",
  MARKETING_FUND: "Marketing fund",
  WHOLESALE_INVOICE: "Wholesale invoice",
} as const;

const credentialTypeLabel = {
  SERVSAFE: "ServSafe",
  STATE_HEALTH_CERTIFICATION: "State health certification",
  FOOD_HANDLER_CARD: "Food handler card",
} as const;

const credentialStatusLabel = {
  SUBMITTED: "Submitted for review",
  VERIFIED: "Verified",
  EXPIRING_SOON: "Expiring soon",
  EXPIRED: "Expired",
  REJECTED: "Needs correction",
} as const;

const signoffTypeLabel = {
  BRAND_STANDARD_MANUAL: "Brand standards manual",
  SEASONAL_RECIPE: "Seasonal recipe",
  SUPPLY_PROTOCOL_AUDIT: "Supply protocol audit",
} as const;

export default async function AccountPage() {
  const session = await requirePortalPermission("VIEW_ACCOUNT");
  const unitIds = [...new Set(session.managedLocationIds)];
  const [units, corporateEntity, credentials, signoffs] = await Promise.all([Promise.all(unitIds.map(async (id) => {
    try { return { id, location: await defaultPortalStorage.getLocationById(id), unavailable: false }; }
    catch { return { id, location: null, unavailable: true }; }
  })), getAccountEntityRecord(session), getFoodSafetyCredentials(session), getBrandSignoffs(session)]);
  const financialDocuments = await getFinancialDocuments(session, corporateEntity?.entityId);
  const credentialUploadConfigured = isSanityCredentialUploadConfigured();
  const roleLabel = session.role === "admin" ? "Administrator" : "Franchisee";
  const identity = session.displayName || "Operator account";
  const initials = session.displayName
    ? session.displayName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
    : session.email.slice(0, 1).toUpperCase();
  const expiry = new Date(session.expiresAt);
  const hasExpiry = Number.isFinite(expiry.getTime()) && session.expiresAt > 0;
  const workingLocation = units.find((unit) => unit.id === session.locationId)?.location ?? null;
  const legalEntityName = corporateEntity?.legalName ?? workingLocation?.franchiseeName;

  return (
    <div className="account-page portal-page-stack">
      <div className="portal-page-header">
        <span className="portal-page-eyebrow">Your workspace account</span>
        <h1 className="portal-page-title">Account profile</h1>
        <p className="text-sm text-bds-cocoa/80">Your identity, unit access, and current session.</p>
      </div>

      <article className="account-profile" aria-labelledby="account-identity-title">
        <header className="account-identity">
          <div className="account-avatar" aria-hidden="true">{initials}</div>
          <div className="account-identity-copy"><h2 id="account-identity-title">{identity}</h2><p>{session.email}</p></div>
          <div className="account-role"><span>Workspace role</span><strong>{roleLabel}</strong></div>
        </header>

        <section className="account-corporate" aria-labelledby="account-corporate-title">
          <div className="account-section-heading"><Building2 size={20} aria-hidden="true" /><h3 id="account-corporate-title">Corporate &amp; entity verification</h3></div>
          <p className="account-description">Entity records are shown from the authorized account record. Tax IDs are intentionally masked.</p>
          <dl className="account-corporate-data">
            <div><dt>Legal entity</dt><dd>{legalEntityName || "Not available"}</dd></div>
            <div><dt>EIN / Tax ID</dt><dd>{corporateEntity?.taxIdLast4 ? `••-••••${corporateEntity.taxIdLast4}` : "Not available"}</dd></div>
            <div><dt>Franchise agreement renewal</dt><dd>{dateLabel(corporateEntity?.franchiseAgreementRenewalAt, session.locationId)}</dd></div>
            <div><dt>Business licenses</dt><dd>{corporateEntity?.businessLicenses.length ? <ul className="account-license-list">{corporateEntity.businessLicenses.map((license) => <li key={`${license.number}-${license.expiresAt || ""}`}><strong>{license.number}</strong>{license.issuingAuthority ? <span>{license.issuingAuthority}</span> : null}{license.expiresAt ? <span>Renews {dateLabel(license.expiresAt, session.locationId)}</span> : null}</li>)}</ul> : "Not available"}</dd></div>
          </dl>
          {!corporateEntity ? <p className="account-record-note">The legal entity is from the authorized unit record. Add a private corporate record to make Tax ID, licensing, and franchise-renewal records available here.</p> : null}
        </section>

        <section className="account-financial" aria-labelledby="account-financial-title">
          <div className="account-section-heading"><CreditCard size={20} aria-hidden="true" /><h3 id="account-financial-title">Payment methods &amp; credit lines</h3></div>
          <p className="account-description">Only masked payment references and authoritative credit terms are shown here. Payment details cannot be edited in the Operator Workspace.</p>
          {corporateEntity?.storedPaymentMethods.length || corporateEntity?.creditLines.length ? <div className="account-financial-grid">
            <section aria-labelledby="account-payment-methods-title"><h4 id="account-payment-methods-title">Stored payment methods</h4><ul className="account-financial-list">{corporateEntity?.storedPaymentMethods.map((method) => <li key={method.id}><strong>{method.kind === "ACH" ? "ACH account" : `${method.network || "Business card"}`}</strong><span>{method.label ? `${method.label} · ` : ""}•••• {method.last4}</span></li>)}</ul></section>
            <section aria-labelledby="account-credit-lines-title"><h4 id="account-credit-lines-title">Franchise credit</h4><ul className="account-financial-list">{corporateEntity?.creditLines.map((line) => <li key={line.id}><strong>{line.label}</strong><span>{line.terms || "Terms not available"}</span>{typeof line.availableBalance === "number" ? <span>Available {moneyLabel(line.availableBalance, line.currency)}{line.availableBalanceAsOf ? ` as of ${formatPortalDateTime(line.availableBalanceAsOf, session.locationId)}` : ""}</span> : null}</li>)}</ul></section>
          </div> : <p className="account-record-note">No authorized payment method or franchise credit record is available for this entity.</p>}
        </section>

        <section className="account-statements" aria-labelledby="account-statements-title">
          <div className="account-section-heading"><Download size={20} aria-hidden="true" /><h3 id="account-statements-title">Invoice &amp; statement archive</h3></div>
          <p className="account-description">Monthly royalty fees, marketing fund contributions, and wholesale supply invoices available to your entity appear here.</p>
          {financialDocuments.length ? <ul className="account-statement-list">{financialDocuments.map((document) => <li key={document.id}><div><strong>{document.title}</strong><p>{financialDocumentLabel[document.type]}{document.period ? ` · ${document.period}` : ""}{document.referenceId ? ` · Reference ${document.referenceId}` : ""}{document.unitId ? ` · Unit ${document.unitId}` : ""}{document.issuedAt ? ` · Issued ${formatPortalDateTime(document.issuedAt, document.unitId || session.locationId)}` : ""}</p></div><a href={`/portal/account/documents/${encodeURIComponent(document.id)}`} className="account-document-download">Download <Download size={16} aria-hidden="true" /></a></li>)}</ul> : <p className="account-record-note">No authorized statements or invoices are available to download.</p>}
        </section>

        <section className="account-compliance" aria-labelledby="account-credentials-title">
          <div className="account-section-heading"><ShieldCheck size={20} aria-hidden="true" /><h3 id="account-credentials-title">Food safety &amp; manager credentials</h3></div>
          <p className="account-description">Credentials are tied to the working unit and remain pending until a qualified reviewer verifies their status.</p>
          {credentialUploadConfigured ? <FoodSafetyCredentialUpload unitId={session.locationId} /> : <p className="account-record-note">Credential upload is not configured. Add the Sanity credential-upload settings before operators can submit ServSafe, health-department, or food-handler documents.</p>}
          {credentials.length ? <ul className="account-credential-list">{credentials.map((credential) => <li key={credential.id}><div><strong>{credentialTypeLabel[credential.type]} · {credential.holderName}</strong><p>{credential.expiresAt ? <>Expires {dateLabel(credential.expiresAt, session.locationId)}</> : "No expiration date recorded"}</p></div><span className="account-compliance-status" data-status={credential.status}>{credentialStatusLabel[credential.status]}</span></li>)}</ul> : <p className="account-record-note">No food-safety or manager credentials have been submitted for this working unit.</p>}
        </section>

        <section className="account-compliance" aria-labelledby="account-signoffs-title">
          <div className="account-section-heading"><FileCheck2 size={20} aria-hidden="true" /><h3 id="account-signoffs-title">Franchise agreement &amp; brand-standard sign-offs</h3></div>
          <p className="account-description">Required brand standards, seasonal recipes, and supply-protocol audits are listed only when Operations has assigned them to this working unit.</p>
          {signoffs.length ? <ul className="account-signoff-list">{signoffs.map((signoff) => {
            const completeAt = signoff.signedAt || signoff.acknowledgedAt;
            return <li key={signoff.id}><div className="account-signoff-summary"><p>{signoffTypeLabel[signoff.type]}{signoff.version ? ` · Version ${signoff.version}` : ""}</p><h4>{signoff.title}</h4>{signoff.effectiveAt ? <p>Effective {dateLabel(signoff.effectiveAt, session.locationId)}</p> : null}{signoff.sourceUrl ? <a href={signoff.sourceUrl} target="_blank" rel="noreferrer">Open assigned material <ArrowRight size={15} aria-hidden="true" /></a> : null}</div>{completeAt ? <p className="account-signoff-complete">{signoff.mode === "DIGITAL_SIGNATURE" ? "Signed" : "Acknowledged"} {dateLabel(completeAt, session.locationId)}</p> : <BrandSignoffForm unitId={session.locationId} signoffId={signoff.id} mode={signoff.mode} defaultName={session.displayName} />}</li>;
          })}</ul> : <p className="account-record-note">No franchise-agreement or brand-standard sign-offs are currently assigned to this working unit.</p>}
        </section>

        <div className="account-grid">
          <section className="account-units" aria-labelledby="account-units-title">
            <div className="account-section-heading"><Store size={20} aria-hidden="true" /><h3 id="account-units-title">Your franchise units</h3></div>
            <p className="account-description">Your account has access to {unitIds.length} franchise unit{unitIds.length === 1 ? "" : "s"}. Orders and support requests use your working unit.</p>
            <ul className="account-unit-list">
              {units.map(({ id, location, unavailable }) => (
                <li key={id}>
                  <div className="account-unit-heading"><h4>{location?.name || (id === session.locationId ? session.locationName : id)}</h4>{id === session.locationId ? <span className="account-active-unit">Working unit</span> : null}</div>
                  <dl className="account-unit-data">
                    <div><dt>Unit code</dt><dd>{id}</dd></div>
                    {location ? <div><dt>{location.address?.line1 ? "Physical address" : "Location"}</dt><dd>{formatLocation(location)}</dd></div> : null}
                    {location?.franchiseeName ? <div><dt>Franchisee entity</dt><dd>{location.franchiseeName}</dd></div> : null}
                  </dl>
                  {location ? <div className="account-unit-metadata" aria-label={`${location.name} store metadata`}>
                    {getStoreStatus(location) ? <span><b>Store status</b> {storeStatusLabel[getStoreStatus(location)!]}</span> : null}
                    {location.designatedGeneralManager ? <span><b>General manager</b> {location.designatedGeneralManager}</span> : null}
                    {location.healthInspectionCycle || location.healthInspectionRenewalAt ? <span><b>Health inspection</b> {location.healthInspectionCycle || "Renewal"}{location.healthInspectionRenewalAt ? <> · {dateLabel(location.healthInspectionRenewalAt, id)}</> : null}</span> : null}
                    {location.territoryStatus ? <span><b>Territory</b> {territoryStatusLabel[location.territoryStatus]}</span> : null}
                  </div> : null}
                  {location?.deliveryProfile ? <section className="account-delivery-profile" aria-labelledby={`delivery-profile-${id}`}><div className="account-section-heading"><Truck size={18} aria-hidden="true" /><h5 id={`delivery-profile-${id}`}>Delivery &amp; freight profile</h5></div><dl>{location.deliveryProfile.dockInstructions ? <div><dt>Dock instructions</dt><dd>{location.deliveryProfile.dockInstructions}</dd></div> : null}{location.deliveryProfile.forkliftRequired !== undefined ? <div><dt>Forklift</dt><dd>{location.deliveryProfile.forkliftRequired ? "Required" : "Not required"}</dd></div> : null}{location.deliveryProfile.liftgateRequired !== undefined ? <div><dt>Liftgate</dt><dd>{location.deliveryProfile.liftgateRequired ? "Required" : "Not required"}</dd></div> : null}{location.deliveryProfile.receivingHours ? <div><dt>Receiving hours</dt><dd>{location.deliveryProfile.receivingHours}</dd></div> : null}{location.deliveryProfile.emergencyDeliveryContact ? <div><dt>Emergency delivery contact</dt><dd>{location.deliveryProfile.emergencyDeliveryContact.name}{location.deliveryProfile.emergencyDeliveryContact.phone ? <> · <a href={`tel:${location.deliveryProfile.emergencyDeliveryContact.phone}`}>{location.deliveryProfile.emergencyDeliveryContact.phone}</a></> : null}</dd></div> : null}</dl></section> : null}
                  {unitIds.length > 1 && id !== session.locationId && location ? <form action={switchPortalLocationAction} className="account-unit-switch"><input type="hidden" name="locationId" value={id} /><button type="submit">Switch to this unit <ArrowRight size={16} aria-hidden="true" /></button></form> : null}
                  {unavailable ? <p className="account-description">Unit details are temporarily unavailable. <a href="/portal/account">Reload profile</a></p> : null}
                </li>
              ))}
            </ul>
          </section>

          <section className="account-session" aria-labelledby="account-session-title">
            <div className="account-section-heading"><Clock size={20} aria-hidden="true" /><h3 id="account-session-title">Current session</h3></div>
            <dl className="account-session-data">
              <div><dt>Signed in as</dt><dd>{session.email}</dd></div>
              <div><dt>Session expires</dt><dd>{hasExpiry ? <time dateTime={expiry.toISOString()}>{formatPortalDateTime(expiry.toISOString(), session.locationId)}</time> : "Unavailable"}</dd></div>
            </dl>
            <p className="account-description">Time is shown in the working unit’s time zone. Save your work before signing out.</p>
            <form action={logoutAction}><AccountSignOut /></form>
          </section>
        </div>

        <footer className="account-help">
          <div><h3>Need to correct your profile or unit access?</h3><p>Contact Operations Support for help with your account details.</p></div>
          <div className="account-help-actions"><Link href="/portal/expansion" className="account-support-link">{session.role === "admin" ? "Review growth requests" : "Request another location"} <ArrowRight size={17} aria-hidden="true" /></Link><Link href="/portal/support" className="account-support-link">Contact support <ArrowRight size={17} aria-hidden="true" /></Link></div>
        </footer>
      </article>
    </div>
  );
}

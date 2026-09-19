"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, type FormEvent } from "react";
import { runLocationAction, type LocationActionState } from "@/src/features/corporate/locations/actions";
import type { CorporateLocation, CorporateOrganization, CorporateRegion } from "@/src/features/corporate/types";

const initial: LocationActionState = { status: "idle", message: "" };
const countries = [{ code: "US", name: "United States" }, { code: "CA", name: "Canada" }];
const timeZones = ["America/Anchorage", "America/Denver", "America/Los_Angeles", "America/New_York", "America/Phoenix", "America/Chicago", "Pacific/Honolulu"];
type Step = 1 | 2 | 3;
type Operator = { id: string; displayName: string; email: string };

const generateStoreCode = (name: string) => {
  const number = name.match(/#\s*(\d{1,3})\s*$/)?.[1] || "1";
  const words = name.replace(/#\s*\d{1,3}\s*$/g, "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").match(/[A-Za-z0-9]+/g) || [];
  const prefix = words.map((word) => word[0]).join("").toUpperCase().slice(0, 3);
  return prefix ? `${prefix}-${number.padStart(3, "0")}` : "";
};

export function LocationForm({ location, organizations, regions, operators = [], canVerify }: { location?: CorporateLocation; organizations: CorporateOrganization[]; regions: CorporateRegion[]; operators?: Operator[]; canVerify: boolean }) {
  const isAlreadyActive = location?.operatingStatus === "ACTIVE";
  const initialRegion = location?.regionId || regions.find((region) => region.id === "utah-silicon-slopes-region")?.id || regions[0]?.id || "";
  const [result, submit, pending] = useActionState(runLocationAction, initial);
  const [step, setStep] = useState<Step>(location?.verificationStatus === "VERIFIED" ? 3 : location ? 2 : 1);
  const [name, setName] = useState(location?.name || "");
  const [code, setCode] = useState(location?.code || "");
  const [codeManual, setCodeManual] = useState(Boolean(location?.code));
  const [organizationId, setOrganizationId] = useState(location?.organizationId || organizations.find((organization) => organization.id === "buddas-hawaiian-bakery-grill")?.id || organizations[0]?.id || "");
  const [regionId, setRegionId] = useState(initialRegion);
  const [market, setMarket] = useState(location?.market || "");
  const [line1, setLine1] = useState(location?.address?.line1 || "");
  const [line2, setLine2] = useState(location?.address?.line2 || "");
  const [city, setCity] = useState(location?.address?.city || "");
  const [stateValue, setStateValue] = useState(location?.address?.state || "UT");
  const [postalCode, setPostalCode] = useState(location?.address?.postalCode || "");
  const [country, setCountry] = useState(location?.address?.country || "US");
  const [timeZone, setTimeZone] = useState(location?.timeZone || "America/Denver");
  const [reason, setReason] = useState(location?.verificationReason || "");
  const [operatorId, setOperatorId] = useState("");
  const [error, setError] = useState("");
  const effectiveId = result.locationId || location?.id || "";
  const effectiveVersion = result.version ?? location?.version ?? "";

  useEffect(() => {
    if (result.status !== "success") return;
    if (result.nextStep === "VERIFY") setStep(2);
    if (result.nextStep === "ACTIVATE") setStep(3);
  }, [result]);

  const inferRegion = (nextCity: string) => {
    const value = nextCity.toLowerCase();
    const sought = /st\.? george/.test(value) ? "utah-southern-region" : /salt lake|ogden/.test(value) ? "utah-wasatch-region" : /lehi|american fork|pleasant grove|provo|orem/.test(value) ? "utah-silicon-slopes-region" : "";
    if (sought && regions.some((region) => region.id === sought)) setRegionId(sought);
    if (nextCity.trim()) setMarket(`${nextCity.trim()} / ${sought === "utah-southern-region" ? "Southern Utah" : sought === "utah-wasatch-region" ? "Wasatch Front" : "North Utah County"}`);
  };
  const updateName = (value: string) => { setName(value); if (!codeManual) setCode(generateStoreCode(value)); };
  const validateBasics = (event: FormEvent<HTMLFormElement>) => {
    if (step !== 1) return;
    const missing = !name.trim() || !line1.trim() || !city.trim() || !stateValue.trim() || !postalCode.trim() || !code || !organizationId || !regionId;
    if (!missing) { setError(""); return; }
    event.preventDefault(); setError("Complete the store name and physical address before continuing. Your entries are preserved.");
  };
  const hiddenValues = <><input type="hidden" name="name" value={name} /><input type="hidden" name="code" value={code} /><input type="hidden" name="organizationId" value={organizationId} /><input type="hidden" name="regionId" value={regionId} /><input type="hidden" name="market" value={market} /><input type="hidden" name="line1" value={line1} /><input type="hidden" name="line2" value={line2} /><input type="hidden" name="city" value={city} /><input type="hidden" name="state" value={stateValue} /><input type="hidden" name="postalCode" value={postalCode} /><input type="hidden" name="country" value={country} /><input type="hidden" name="timeZone" value={timeZone} /><input type="hidden" name="reason" value={reason} /></>;

  return <form action={submit} onSubmit={validateBasics} className="corporate-support-form corporate-location-form" noValidate>
    <input type="hidden" name="locationId" value={effectiveId} /><input type="hidden" name="expectedVersion" value={effectiveVersion} />{step !== 1 ? hiddenValues : null}
    <ol className="location-lifecycle-stepper" aria-label="Store setup progress"><li className={step === 1 ? "is-current" : "is-complete"}><button type="button" onClick={() => setStep(1)}><span>1</span><strong>Store basics</strong></button></li><li className={step === 2 ? "is-current" : step > 2 ? "is-complete" : ""}><button type="button" disabled={!effectiveId} onClick={() => setStep(2)}><span>2</span><strong>Confirm details</strong></button></li><li className={step === 3 ? "is-current" : ""}><button type="button" disabled={location?.verificationStatus !== "VERIFIED" && result.nextStep !== "ACTIVATE"} onClick={() => setStep(3)}><span>3</span><strong>{isAlreadyActive ? "Assign operator" : "Assign & activate"}</strong></button></li></ol>
    {step === 1 ? <><fieldset className="corporate-catalog-group"><legend>Store basics</legend><label className="corporate-field"><span>Store name *</span><input value={name} onChange={(event) => updateName(event.target.value)} placeholder="e.g. Orem #1" /></label><div className="corporate-field"><label htmlFor="simple-store-code">Store code</label><input id="simple-store-code" value={code} onChange={(event) => { setCode(event.target.value.toUpperCase()); setCodeManual(true); }} /><small>Generated automatically from the store name.</small><button type="button" className="corporate-button-secondary location-code-generator" onClick={() => { setCode(generateStoreCode(name)); setCodeManual(false); }}>Regenerate code</button></div></fieldset><fieldset className="corporate-catalog-group"><legend>Physical address</legend><label className="corporate-field"><span>Address line 1 *</span><input value={line1} onChange={(event) => setLine1(event.target.value)} /></label><label className="corporate-field"><span>Address line 2</span><input value={line2} onChange={(event) => setLine2(event.target.value)} /></label><label className="corporate-field"><span>City *</span><input value={city} onChange={(event) => { setCity(event.target.value); inferRegion(event.target.value); }} /></label><label className="corporate-field"><span>State *</span><input value={stateValue} onChange={(event) => setStateValue(event.target.value)} /></label><label className="corporate-field"><span>Postal code *</span><input value={postalCode} onChange={(event) => setPostalCode(event.target.value)} /></label></fieldset>{hiddenValues}<div className="location-form-actions"><Link href={location ? `/corporate/directory/locations/${location.id}` : "/corporate/directory?tab=locations"} className="corporate-text-link">Cancel</Link><button className="corporate-button" type="submit" name="action" value={effectiveId ? "SAVE_DETAILS" : "CREATE_DRAFT"} disabled={pending}>{pending ? "Saving…" : "Save and continue"}</button></div></> : null}
    {step === 2 ? <><section className="location-review-summary" aria-labelledby="location-review-heading"><h3 id="location-review-heading">Confirm store details</h3><dl><div><dt>Store</dt><dd>{name} · {code}</dd></div><div><dt>Address</dt><dd>{line1}{line2 ? `, ${line2}` : ""}, {city}, {stateValue} {postalCode}</dd></div><div><dt>Brand / franchise group</dt><dd>{organizations.find((organization) => organization.id === organizationId)?.name}</dd></div><div><dt>Corporate support region</dt><dd>{regions.find((region) => region.id === regionId)?.name}</dd></div><div><dt>Local trade area</dt><dd>{market || `${city} local market`}</dd></div><div><dt>Time zone</dt><dd>{timeZone}</dd></div></dl><details className="corporate-catalog-description"><summary>Advanced details</summary><label className="corporate-field"><span>Brand / franchise group</span><select value={organizationId} onChange={(event) => setOrganizationId(event.target.value)}>{organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}</select></label><label className="corporate-field"><span>Corporate support region</span><select value={regionId} onChange={(event) => setRegionId(event.target.value)}>{regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}</select></label><label className="corporate-field"><span>Local trade area</span><input value={market} onChange={(event) => setMarket(event.target.value)} /></label><label className="corporate-field"><span>Country</span><select value={country} onChange={(event) => setCountry(event.target.value)}>{countries.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label><label className="corporate-field"><span>Time zone</span><select value={timeZone} onChange={(event) => setTimeZone(event.target.value)}>{timeZones.map((zone) => <option key={zone}>{zone}</option>)}</select></label></details>{canVerify ? <label className="corporate-field"><span>Internal review note</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Optional source or review note" /></label> : null}</section><div className="location-form-actions"><button type="button" className="corporate-text-link" onClick={() => setStep(1)}>Back to edit</button><button className="corporate-button" type="submit" name="action" value="VERIFY" disabled={pending || !canVerify}>{pending ? "Confirming…" : "Confirm details and continue"}</button></div></> : null}
    {step === 3 ? <><section className="location-activation"><h3>{isAlreadyActive ? "Assign store operator" : "Assign and activate"}</h3><p>{isAlreadyActive ? "This store is active and verified. Choose the person responsible for its operator workspace." : "Choose the person responsible for this store. Activation opens the store workspace and makes verified catalog publishing possible."}</p><label className="corporate-field"><span>Store operator *</span><select name="operatorId" value={operatorId} onChange={(event) => setOperatorId(event.target.value)}><option value="">Select an enabled operator</option>{operators.map((operator) => <option key={operator.id} value={operator.id}>{operator.displayName} · {operator.email}</option>)}</select></label></section><div className="location-form-actions"><button type="button" className="corporate-text-link" onClick={() => setStep(2)}>Back to details</button><button className="corporate-button" type="submit" name="action" value={isAlreadyActive ? "ASSIGN_OPERATOR" : "ACTIVATE"} disabled={pending || !operatorId}>{pending ? (isAlreadyActive ? "Assigning…" : "Activating…") : isAlreadyActive ? "Assign operator" : `Activate ${name || "store"}`}</button></div></> : null}
    {error ? <p role="alert" className="corporate-form-message corporate-form-message-error">{error}</p> : null}{result.message ? <p role={result.status === "error" ? "alert" : "status"} className={`corporate-form-message corporate-form-message-${result.status}`}>{result.message}</p> : null}
  </form>;
}

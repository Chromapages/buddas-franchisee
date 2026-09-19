import type { CorporateLocation, CorporateMembership, CorporateOrganization, CorporatePerson, CorporateRegion, CorporateResource, WorkRecord } from "./types.ts";

/** Fictional local preview data. This module never seeds a remote database. */
export const corporateSeedLocations: CorporateLocation[] = [
  { id: "PG-001", organizationId: "buddas-hawaiian-bakery-grill", regionId: "utah-silicon-slopes-region", name: "Pleasant Grove #1", code: "PG-001", market: "Utah Silicon Slopes", status: "ACTIVE", operatingStatus: "ACTIVE", verificationStatus: "NOT_REVIEWED", address: { line1: "205 E 700 S", city: "Pleasant Grove", state: "UT", postalCode: "84062", country: "US" }, timeZone: "America/Denver", version: 1 },
  { id: "SLC-001", organizationId: "buddas-hawaiian-bakery-grill", regionId: "utah-wasatch-region", name: "Salt Lake City #1", code: "SLC-001", market: "Utah Wasatch Front", status: "ACTIVE", operatingStatus: "ACTIVE", verificationStatus: "NOT_REVIEWED", address: { line1: "1465 S State St #12", city: "Salt Lake City", state: "UT", postalCode: "84115", country: "US" }, timeZone: "America/Denver", version: 1 },
];

export const corporateSeedRegions: CorporateRegion[] = [
  { id: "utah-wasatch-region", name: "The Wasatch Front", locationIds: ["SLC-001"], status: "ACTIVE" },
  { id: "utah-silicon-slopes-region", name: "The Silicon Slopes", locationIds: ["PG-001"], status: "ACTIVE" },
  { id: "utah-southern-region", name: "St. George / Southern Utah", locationIds: [], status: "ACTIVE" },
];

export const corporateSeedOrganizations: CorporateOrganization[] = [
  { id: "buddas-hawaiian-bakery-grill", name: "Budda's Hawaiian Bakery & Grill", verificationStatus: "UNVERIFIED", locationIds: corporateSeedLocations.map((location) => location.id) },
];

export const getCorporatePreviewMemberships = (): CorporateMembership[] => [
  "operations_lead", "request_approver", "access_steward", "content_publisher", "franchise_development",
].map((bundle, index) => ({ id: `preview-grant-${index + 1}`, bundle: bundle as CorporateMembership["bundle"], status: "ACTIVE", scope: bundle === "franchise_development" ? { type: "corporate" } : { type: "organizations", organizationIds: ["buddas-hawaiian-bakery-grill"] } }));

export const corporateSeedPeople: CorporatePerson[] = [
  { id: "preview-support-jordan", email: "jordan@preview.invalid", displayName: "Jordan · Preview support", identityClass: "CORPORATE", status: "ACTIVE", memberships: [{ id: "preview-jordan", bundle: "support_handler", status: "ACTIVE", scope: { type: "regions", regionIds: ["preview-islands"] } }], version: 1, updatedAt: "2026-09-01T16:00:00.000Z" },
  { id: "preview-operations-alex", email: "alex@preview.invalid", displayName: "Alex · Preview operations", identityClass: "CORPORATE", status: "ACTIVE", memberships: [{ id: "preview-alex", bundle: "operations_lead", status: "ACTIVE", scope: { type: "organizations", organizationIds: ["preview-organization"] } }], version: 1, updatedAt: "2026-09-01T16:00:00.000Z" },
];

export const corporateSeedWorkRecords: WorkRecord[] = [];

export const corporateSeedResources: CorporateResource[] = [
  { id: "preview-receiving-guide", organizationId: "preview-organization", title: "Receiving guide · preview record", category: "Operations", version: "1.0", state: "DRAFT", ownerName: "Preview operations", updatedAt: "2026-09-01T16:00:00.000Z" },
];

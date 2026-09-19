import { randomUUID } from "node:crypto";
import { firebaseAdminAuth, firebaseDb } from "../src/lib/firebase/admin.ts";
import { CORPORATE_BUNDLE_PERMISSIONS, parseCorporateMemberships } from "../src/features/corporate/authorization.ts";
import type { CorporateMembership, CorporateScope } from "../src/features/corporate/types.ts";

const args = process.argv.slice(2);
const value = (key: string): string | undefined => {
  const index = args.indexOf(key);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith("--") ? args[index + 1] : undefined;
};

async function main() {
  if (args.includes("--help")) {
    console.log("Corporate provisioning (dry run by default): --uid UID or --email EMAIL --identity-class CORPORATE --bundles support_handler,operations_lead --scope organizations|regions|locations|corporate --scope-ids ID,ID --reason TEXT [--allow-corporate-wide] [--apply]. Existing memberships are preserved; existing matches are not duplicated. Corporate-wide grants require the explicit flag.");
    return;
  }
  const uid = value("--uid");
  const email = value("--email");
  const bundles = (value("--bundles") || "").split(",").filter(Boolean);
  const identityClass = value("--identity-class") || "CORPORATE";
  const scopeType = value("--scope");
  const ids = (value("--scope-ids") || "").split(",").map((id) => id.trim()).filter(Boolean);
  const reason = value("--reason")?.trim();
  if ((!uid && !email) || (uid && email)) throw new Error("Specify exactly one explicit target: --uid or --email.");
  if (!bundles.length || bundles.some((bundle) => !Object.hasOwn(CORPORATE_BUNDLE_PERMISSIONS, bundle))) throw new Error("Specify valid explicit --bundles. See corporate authorization.ts for the available bundles.");
  if (identityClass !== "CORPORATE") throw new Error("This script provisions only CORPORATE staff. Use operator provisioning for franchisee identities.");
  if (!reason || reason.length < 8 || reason.length > 500) throw new Error("Provide a reviewed --reason of 8–500 characters.");
  if (scopeType !== "organizations" && scopeType !== "regions" && scopeType !== "locations" && scopeType !== "corporate") throw new Error("Choose an explicit --scope: organizations, regions, locations or corporate.");
  if (scopeType === "corporate" && !args.includes("--allow-corporate-wide")) throw new Error("Corporate-wide access requires --allow-corporate-wide after scope review.");
  if (scopeType !== "corporate" && (!ids.length || ids.some((id) => !/^[A-Za-z0-9_-]{1,128}$/.test(id)))) throw new Error("Provide valid --scope-ids for every authorized organization or location.");
  if (!firebaseAdminAuth || !firebaseDb) throw new Error("Firebase Admin is not configured.");
  const user = uid ? await firebaseAdminAuth.getUser(uid) : await firebaseAdminAuth.getUserByEmail(email!);
  if (user.disabled || !user.email || !user.emailVerified) throw new Error("The target must be an enabled Firebase identity with verified email.");
  if (scopeType !== "corporate") {
    for (const id of ids) {
      if (scopeType === "regions") {
        const [operatingRegion, developmentRegion] = await Promise.all([
          firebaseDb.collection("corporateRegions").doc(id).get(),
          firebaseDb.collection("franchiseDevelopmentRegions").doc(id).get(),
        ]);
        if (!operatingRegion.exists && !developmentRegion.exists) throw new Error(`Requested region scope does not exist: ${id}`);
      } else {
        const collection = scopeType === "organizations" ? "franchiseEntities" : "units";
        const record = await firebaseDb.collection(collection).doc(id).get();
        if (!record.exists) throw new Error(`Requested ${scopeType} scope does not exist: ${id}`);
      }
    }
  }
  const scope: CorporateScope = scopeType === "corporate" ? { type: "corporate" }
    : scopeType === "organizations" ? { type: "organizations", organizationIds: ids }
      : scopeType === "regions" ? { type: "regions", regionIds: ids } : { type: "locations", locationIds: ids };
  const grants = bundles.map((bundle): CorporateMembership => ({ id: `grant-${randomUUID()}`, bundle: bundle as CorporateMembership["bundle"], status: "ACTIVE", scope }));
  console.log(`Reviewed target UID ${user.uid}: ${bundles.join(", ")} / ${scopeType}${ids.length ? ` (${ids.join(", ")})` : ""}. ${args.includes("--apply") ? "Applying." : "Dry run: no records changed. Add --apply only after reviewing this scope."}`);
  if (!args.includes("--apply")) return;
  const ref = firebaseDb.collection("corporateStaff").doc(user.uid);
  const auditRef = firebaseDb.collection("corporateAuditEvents").doc();
  const occurredAt = new Date().toISOString();
  await firebaseDb.runTransaction(async (transaction) => {
    const existing = await transaction.get(ref);
    const data = existing.data();
    if (data?.status === "SUSPENDED") throw new Error("This account is suspended. Use the reviewed reinstatement process rather than provisioning over a suspension.");
    const memberships = parseCorporateMemberships(data?.memberships);
    for (const grant of grants) {
      if (!memberships.some((prior) => prior.bundle === grant.bundle && prior.status === "ACTIVE" && JSON.stringify(prior.scope) === JSON.stringify(grant.scope))) memberships.push(grant);
    }
    const priorVersion = typeof data?.version === "number" ? data.version : 0;
    transaction.set(ref, { email: user.email, displayName: user.displayName || user.email, identityClass, status: "ACTIVE", memberships,
      version: priorVersion + 1, updatedAt: occurredAt, provisionedBy: "corporate-provisioning-cli", provisioningReason: reason }, { merge: true });
    transaction.create(auditRef, { id: auditRef.id, recordId: user.uid, recordType: "membership", actorId: "corporate-provisioning-cli",
      actorName: "Authorized provisioning CLI", action: "CORPORATE_MEMBERSHIPS_PROVISIONED", occurredAt, commandId: auditRef.id,
      previousVersion: priorVersion, nextVersion: priorVersion + 1,
      changes: { membershipCount: { before: parseCorporateMemberships(data?.memberships).length, after: memberships.length } },
      ...(scope.type === "organizations" && scope.organizationIds.length === 1 ? { organizationId: scope.organizationIds[0] } : {}),
      ...(scope.type === "regions" && scope.regionIds.length === 1 ? { regionId: scope.regionIds[0] } : {}),
      ...(scope.type === "locations" && scope.locationIds.length === 1 ? { locationId: scope.locationIds[0] } : {}) });
  });
  console.log("Corporate memberships and audit recorded. Nondevelopment sign-in also requires Firebase second-factor authentication. No email invitation was sent.");
}

main().catch((error) => {
  // Firebase provider diagnostics can contain configuration; do not dump SDK errors.
  console.error(error instanceof Error && !('code' in error) ? error.message : "Corporate provisioning failed. Check provider access and target identity without exposing credentials.");
  process.exitCode = 1;
});

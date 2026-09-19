import { firebaseDb } from "../src/lib/firebase/admin.ts";

type Finding = { id: string; codes: string[] };

async function main() {
  if (!firebaseDb) throw new Error("Firebase Admin is not configured.");
  const snapshot = await firebaseDb.collection("units").get();
  const findings: Finding[] = [];
  const codes = new Map<string, string[]>();
  for (const document of snapshot.docs) {
    const data = document.data();
    const issues: string[] = [];
    if (!["DRAFT", "PRE_OPENING", "ACTIVE", "SUSPENDED", "CLOSED"].includes(String(data.operatingStatus))) issues.push("MISSING_OR_LEGACY_OPERATING_STATUS");
    if (!["NOT_REVIEWED", "IN_REVIEW", "VERIFIED", "CHANGES_REQUIRED"].includes(String(data.verification?.status))) issues.push("MISSING_VERIFICATION_STATE");
    if (!data.organizationId) issues.push("MISSING_ORGANIZATION");
    if (!data.regionId) issues.push("MISSING_REGION");
    if (!data.address?.line1 || !data.address?.city || !data.address?.state || !data.address?.country) issues.push("INCOMPLETE_ADDRESS");
    if (typeof data.timeZone !== "string") issues.push("MISSING_TIME_ZONE");
    const code = typeof data.code === "string" ? data.code.toUpperCase() : "";
    if (!code) issues.push("MISSING_CODE");
    else codes.set(code, [...(codes.get(code) || []), document.id]);
    if (issues.length) findings.push({ id: document.id, codes: issues });
  }
  for (const [code, ids] of codes) if (ids.length > 1) findings.push({ id: ids.join(","), codes: [`DUPLICATE_CODE:${code}`] });
  console.log(`Reviewed ${snapshot.size} units. ${findings.length} records need lifecycle review.`);
  for (const finding of findings) console.log(`${finding.id}: ${finding.codes.join(", ")}`);
  console.log("Dry run only. This script does not update, verify, or activate any store.");
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "Store lifecycle inventory failed."); process.exitCode = 1; });

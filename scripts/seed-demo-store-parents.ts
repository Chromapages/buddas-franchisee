import { firebaseDb } from "../src/lib/firebase/admin.ts";

const now = new Date().toISOString();

async function main() {
  if (!firebaseDb) throw new Error("Firebase Admin is not configured.");
  const organization = firebaseDb.collection("franchiseEntities").doc("demo-franchise-organization");
  const islands = firebaseDb.collection("corporateRegions").doc("demo-islands-region");
  const mainland = firebaseDb.collection("corporateRegions").doc("demo-mainland-region");
  const batch = firebaseDb.batch();
  batch.set(organization, {
    legalName: "Budda's Demo Franchise Organization",
    verificationStatus: "VERIFIED",
    isDemoRecord: true,
    updatedAt: now,
    createdBy: "demo-store-parent-seed",
  }, { merge: true });
  batch.set(islands, {
    name: "Demo Islands Region",
    status: "ACTIVE",
    locationIds: [],
    isDemoRecord: true,
    updatedAt: now,
    createdBy: "demo-store-parent-seed",
  }, { merge: true });
  batch.set(mainland, {
    name: "Demo Mainland Region",
    status: "ACTIVE",
    locationIds: [],
    isDemoRecord: true,
    updatedAt: now,
    createdBy: "demo-store-parent-seed",
  }, { merge: true });
  await batch.commit();
  console.log("Seeded demo franchise organization and two active operating regions.");
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "Demo store parent seed failed."); process.exitCode = 1; });

import { firebaseDb } from "../src/lib/firebase/admin.ts";

const mockLocationIds = ["HNL-014", "OAH-207", "SLC-302"];

async function main() {
  if (!firebaseDb) throw new Error("Firebase Admin is not configured.");
  const batch = firebaseDb.batch();
  const now = new Date().toISOString();
  for (const id of mockLocationIds) {
    batch.set(firebaseDb.collection("units").doc(id), {
      hiddenFromCorporateDirectory: true,
      directoryHiddenAt: now,
      directoryHiddenReason: "Superseded by current Budda's Hawaiian Bakery & Grill locations",
    }, { merge: true });
  }
  await batch.commit();
  console.log(`Hidden ${mockLocationIds.length} mock locations from the corporate Directory.`);
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "Mock location cleanup failed."); process.exitCode = 1; });

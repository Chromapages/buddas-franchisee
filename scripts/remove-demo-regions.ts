import { firebaseDb } from "../src/lib/firebase/admin.ts";

const demoRegionIds = ["demo-islands-region", "demo-mainland-region"];

async function main() {
  if (!firebaseDb) throw new Error("Firebase Admin is not configured.");
  const units = await firebaseDb.collection("units").get();
  const references = units.docs.filter((document) => demoRegionIds.includes(document.data().regionId)).map((document) => document.id);
  if (references.length) throw new Error(`Refusing to remove demo regions still referenced by: ${references.join(", ")}`);
  const batch = firebaseDb.batch();
  for (const id of demoRegionIds) batch.delete(firebaseDb.collection("corporateRegions").doc(id));
  await batch.commit();
  console.log("Removed the two unused demo operating regions.");
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "Demo region removal failed."); process.exitCode = 1; });

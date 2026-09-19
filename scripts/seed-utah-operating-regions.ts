import { firebaseDb } from "../src/lib/firebase/admin.ts";

const now = new Date().toISOString();

const regions = [
  {
    id: "utah-wasatch-region",
    name: "The Wasatch Front",
    description: "Ogden, Salt Lake City, and Provo corridor. Salt Lake County anchors diversified consumer and B2B demand; Davis and Weber counties support value-oriented and military-adjacent operations.",
    markets: ["Ogden", "Salt Lake City", "Provo", "Davis County", "Weber County"],
    locationIds: ["SLC-001"],
  },
  {
    id: "utah-silicon-slopes-region",
    name: "The Silicon Slopes",
    description: "Lehi, American Fork, and Provo technology corridor with dense, white-collar and family-oriented demand.",
    markets: ["Lehi", "American Fork", "Pleasant Grove", "Provo"],
    locationIds: ["PG-001"],
  },
  {
    id: "utah-southern-region",
    name: "St. George / Southern Utah",
    description: "St. George market shaped by retiree demographics, outdoor tourism, senior-care needs, and downtown local demand.",
    markets: ["St. George", "Southern Utah"],
    locationIds: [],
  },
];

async function main() {
  if (!firebaseDb) throw new Error("Firebase Admin is not configured.");
  const batch = firebaseDb.batch();
  for (const region of regions) batch.set(firebaseDb.collection("corporateRegions").doc(region.id), { ...region, status: "ACTIVE", updatedAt: now, source: "Utah operating-region definition" }, { merge: true });
  batch.set(firebaseDb.collection("units").doc("SLC-001"), { regionId: "utah-wasatch-region", updatedAt: now, updatedBy: "utah-region-seed" }, { merge: true });
  batch.set(firebaseDb.collection("units").doc("PG-001"), { regionId: "utah-silicon-slopes-region", updatedAt: now, updatedBy: "utah-region-seed" }, { merge: true });
  await batch.commit();
  console.log("Seeded three Utah operating regions and assigned the two current stores.");
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "Utah region seed failed."); process.exitCode = 1; });

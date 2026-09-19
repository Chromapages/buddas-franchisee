import { firebaseDb } from "../src/lib/firebase/admin.ts";

const now = new Date().toISOString();
const source = "https://buddashawaiian.com/";

const stores = [
  { id: "PG-001", code: "PG-001", name: "Pleasant Grove #1", line1: "205 E 700 S", city: "Pleasant Grove", postalCode: "84062" },
  { id: "SLC-001", code: "SLC-001", name: "Salt Lake City #1", line1: "1465 S State St #12", city: "Salt Lake City", postalCode: "84115" },
];

async function main() {
  if (!firebaseDb) throw new Error("Firebase Admin is not configured.");
  const organizationId = "buddas-hawaiian-bakery-grill";
  const regionId = "utah-wasatch-region";
  const batch = firebaseDb.batch();
  batch.set(firebaseDb.collection("franchiseEntities").doc(organizationId), {
    legalName: "Budda's Hawaiian Bakery & Grill",
    verificationStatus: "UNVERIFIED",
    sourceReference: source,
    sourceNote: "Public website identifies this brand; legal-entity verification remains pending.",
    updatedAt: now,
  }, { merge: true });
  batch.set(firebaseDb.collection("corporateRegions").doc(regionId), {
    name: "Utah Wasatch Region",
    status: "ACTIVE",
    locationIds: stores.map((store) => store.id),
    sourceReference: source,
    updatedAt: now,
  }, { merge: true });
  for (const store of stores) {
    batch.set(firebaseDb.collection("units").doc(store.id), {
      id: store.id,
      code: store.code,
      name: store.name,
      organizationId,
      regionId,
      market: "Utah Wasatch Front",
      address: { line1: store.line1, city: store.city, state: "UT", postalCode: store.postalCode, country: "US" },
      timeZone: "America/Denver",
      operatingStatus: "ACTIVE",
      storeStatus: "ACTIVE",
      verification: { status: "NOT_REVIEWED", sourceReference: source, sourceNote: "Operating address imported from the public brand website; corporate record review remains pending." },
      assignedOperatorIds: [],
      schemaVersion: 1,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: "current-store-public-source-seed",
      updatedBy: "current-store-public-source-seed",
    }, { merge: true });
  }
  await batch.commit();
  console.log(`Seeded ${stores.length} current Budda's Hawaiian Bakery & Grill locations from ${source}`);
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "Current store seed failed."); process.exitCode = 1; });

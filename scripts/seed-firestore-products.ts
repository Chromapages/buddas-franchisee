import { firebaseDb } from "../src/lib/firebase/admin.ts";
import { portalProducts, portalLocations } from "../src/features/portal/data.ts";

const seedFirestoreProducts = async () => {
  if (!firebaseDb) {
    throw new Error(
      "Firebase Admin is not configured. Please ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY or GOOGLE_APPLICATION_CREDENTIALS are set.",
    );
  }

  console.log(`Starting Firestore catalog sync across ${portalLocations.length} locations...`);

  for (const location of portalLocations) {
    console.log(`\nSyncing ${portalProducts.length} supplies to unit: ${location.name} (${location.id})...`);
    
    // Ensure unit document exists
    await firebaseDb.collection("units").doc(location.id).set(
      {
        id: location.id,
        name: location.name,
        code: location.code,
        city: location.city,
        state: location.state,
        franchiseeName: location.franchiseeName,
        isOpen: location.isOpen,
        market: location.market || "General",
        equipmentConfig: location.equipmentConfig || [],
        launchStage: location.launchStage || "STABILIZED",
        storeFormat: location.storeFormat || "in-line",
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    // Seed products in batches
    const batch = firebaseDb.batch();
    for (const product of portalProducts) {
      const docRef = firebaseDb
        .collection("units")
        .doc(location.id)
        .collection("products")
        .doc(product.id);

      batch.set(docRef, { ...product }, { merge: true });
    }

    await batch.commit();
    console.log(`Successfully synced ${portalProducts.length} products to ${location.id}.`);
  }

  console.log("\nAll supplies catalog items successfully synced to Firestore!");
};

seedFirestoreProducts().catch((error) => {
  console.error("Firestore catalog seed failed:", error);
  process.exit(1);
});

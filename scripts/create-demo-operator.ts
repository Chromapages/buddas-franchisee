import { firebaseAdminAuth, firebaseDb, isFirebaseAdminConfigured } from "../src/lib/firebase/admin.ts";

interface DemoOperatorConfig {
  email: string;
  password: string;
  displayName: string;
  unitId: string;
  unitName: string;
  role: "franchisee" | "admin";
}

const DEFAULT_CONFIG: DemoOperatorConfig = {
  email: "demo.operator@buddasbakery.com",
  password: "BuddaDemo2026!",
  displayName: "Demo Operator",
  unitId: "SLC-001",
  unitName: "Salt Lake City #1",
  role: "franchisee",
};

const runProvisioning = async (): Promise<void> => {
  if (!isFirebaseAdminConfigured() || !firebaseAdminAuth || !firebaseDb) {
    throw new Error("Firebase Admin is not configured. Check your .env file credentials.");
  }

  const [, , argEmail, argPassword, argDisplayName, argUnitId, argUnitName] = process.argv;

  const config: DemoOperatorConfig = {
    email: (argEmail || DEFAULT_CONFIG.email).trim().toLowerCase(),
    password: argPassword || DEFAULT_CONFIG.password,
    displayName: (argDisplayName || DEFAULT_CONFIG.displayName).trim(),
    unitId: (argUnitId || DEFAULT_CONFIG.unitId).trim(),
    unitName: (argUnitName || DEFAULT_CONFIG.unitName).trim(),
    role: DEFAULT_CONFIG.role,
  };

  let uid: string;

  try {
    const existingUser = await firebaseAdminAuth.getUserByEmail(config.email);
    uid = existingUser.uid;
    await firebaseAdminAuth.updateUser(uid, {
      password: config.password,
      displayName: config.displayName,
      emailVerified: true,
      disabled: false,
    });
    console.log(`Updated existing Firebase Auth user: ${config.email} (UID: ${uid})`);
  } catch (error: unknown) {
    const firebaseError = error as { code?: string };
    if (firebaseError.code !== "auth/user-not-found") {
      throw error;
    }

    const newUser = await firebaseAdminAuth.createUser({
      email: config.email,
      password: config.password,
      displayName: config.displayName,
      emailVerified: true,
      disabled: false,
    });
    uid = newUser.uid;
    console.log(`Created new Firebase Auth user: ${config.email} (UID: ${uid})`);
  }

  const operatorDocRef = firebaseDb.collection("operators").doc(uid);
  const operatorRecord = {
    email: config.email,
    displayName: config.displayName,
    role: config.role,
    activeUnitId: config.unitId,
    activeUnitName: config.unitName,
    managedUnitIds: [config.unitId],
    status: "ACTIVE",
    isDemoAccount: true,
    updatedAt: new Date().toISOString(),
  };

  await operatorDocRef.set(operatorRecord, { merge: true });
  console.log(`Provisioned Firestore profile: operators/${uid}`);

  const verifiedDoc = await operatorDocRef.get();
  if (!verifiedDoc.exists) {
    throw new Error(`Failed to verify Firestore document for operator ${uid}`);
  }

  console.log("\n=========================================");
  console.log("Demo Operator Account Successfully Ready");
  console.log("=========================================");
  console.log(`Email:       ${config.email}`);
  console.log(`Password:    ${config.password}`);
  console.log(`Name:        ${config.displayName}`);
  console.log(`Role:        ${config.role}`);
  console.log(`Unit ID:     ${config.unitId}`);
  console.log(`Unit Name:   ${config.unitName}`);
  console.log(`Auth UID:    ${uid}`);
  console.log("=========================================\n");
};

runProvisioning().catch((error: unknown) => {
  console.error("Failed to provision demo operator account:", error);
  process.exitCode = 1;
});

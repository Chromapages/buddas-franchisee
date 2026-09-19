import { randomUUID } from "node:crypto";
import { firebaseAdminAuth, firebaseDb, isFirebaseAdminConfigured } from "../src/lib/firebase/admin.ts";
import type { CorporateBundle, CorporateMembership, CorporateScope } from "../src/features/corporate/types.ts";

interface DemoCorporateConfig {
  email: string;
  password: string;
  displayName: string;
}

const DEFAULT_CONFIG: DemoCorporateConfig = {
  email: "demo.corporate@buddasbakery.com",
  password: "BuddaDemo2026!",
  displayName: "Demo Corporate Lead",
};

const CORPORATE_BUNDLES: CorporateBundle[] = [
  "operations_lead",
  "order_coordinator",
  "request_approver",
  "access_steward",
  "finance_reviewer",
  "content_publisher",
  "location_steward",
];

const runProvisioning = async (): Promise<void> => {
  if (!isFirebaseAdminConfigured() || !firebaseAdminAuth || !firebaseDb) {
    throw new Error("Firebase Admin is not configured. Check your .env credentials.");
  }

  const [, , argEmail, argPassword, argDisplayName] = process.argv;

  const config: DemoCorporateConfig = {
    email: (argEmail || DEFAULT_CONFIG.email).trim().toLowerCase(),
    password: argPassword || DEFAULT_CONFIG.password,
    displayName: (argDisplayName || DEFAULT_CONFIG.displayName).trim(),
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

  const corporateScope: CorporateScope = { type: "corporate" };
  const memberships: CorporateMembership[] = CORPORATE_BUNDLES.map((bundle) => ({
    id: `grant-${randomUUID()}`,
    bundle,
    status: "ACTIVE",
    scope: corporateScope,
  }));

  const staffRef = firebaseDb.collection("corporateStaff").doc(uid);
  const auditRef = firebaseDb.collection("corporateAuditEvents").doc();
  const occurredAt = new Date().toISOString();

  await firebaseDb.runTransaction(async (transaction) => {
    const existingDoc = await transaction.get(staffRef);
    const existingData = existingDoc.data();
    const priorVersion = typeof existingData?.version === "number" ? existingData.version : 0;

    transaction.set(
      staffRef,
      {
        email: config.email,
        displayName: config.displayName,
        status: "ACTIVE",
        memberships,
        version: priorVersion + 1,
        isDemoAccount: true,
        provisionedBy: "corporate-demo-provisioning-cli",
        provisioningReason: "Demo corporate operations account",
        updatedAt: occurredAt,
      },
      { merge: true }
    );

    transaction.create(auditRef, {
      id: auditRef.id,
      recordId: uid,
      recordType: "membership",
      actorId: "corporate-demo-provisioning-cli",
      actorName: "Authorized Demo Provisioning CLI",
      action: "CORPORATE_MEMBERSHIPS_PROVISIONED",
      occurredAt,
      commandId: auditRef.id,
      previousVersion: priorVersion,
      nextVersion: priorVersion + 1,
      changes: {
        membershipCount: {
          before: Array.isArray(existingData?.memberships) ? existingData.memberships.length : 0,
          after: memberships.length,
        },
      },
    });
  });

  console.log(`Provisioned corporateStaff record: corporateStaff/${uid}`);

  const verifiedStaff = await staffRef.get();
  if (!verifiedStaff.exists) {
    throw new Error(`Failed to verify corporateStaff record for ${uid}`);
  }

  console.log("\n=========================================");
  console.log("Demo Corporate Account Successfully Ready");
  console.log("=========================================");
  console.log(`Email:       ${config.email}`);
  console.log(`Password:    ${config.password}`);
  console.log(`Name:        ${config.displayName}`);
  console.log(`Scope:       Corporate-wide (all units & organizations)`);
  console.log(`Bundles:     ${CORPORATE_BUNDLES.join(", ")}`);
  console.log(`Auth UID:    ${uid}`);
  console.log("=========================================\n");
};

runProvisioning().catch((error: unknown) => {
  console.error("Failed to provision demo corporate account:", error);
  process.exitCode = 1;
});

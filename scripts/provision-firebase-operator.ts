import { firebaseDb } from "../src/lib/firebase/admin";

const [uid, email, role, unitId, unitName, displayName] = process.argv.slice(2);
if (!firebaseDb || !uid || !email || !unitId || !unitName || !displayName || (role !== "admin" && role !== "franchisee")) {
  throw new Error("Usage: npm run firebase:provision-operator -- <uid> <email> <admin|franchisee> <unitId> <unitName> <displayName>");
}
await firebaseDb.collection("operators").doc(uid).set({ email, role, activeUnitId: unitId, activeUnitName: unitName, managedUnitIds: [unitId], displayName, updatedAt: new Date().toISOString() }, { merge: true });
console.log(`Provisioned operator ${uid}.`);

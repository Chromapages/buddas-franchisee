import "server-only";
import { firebaseDb } from "../../../lib/firebase/admin.ts";

export async function getAssignableLocationOperators(): Promise<Array<{ id: string; displayName: string; email: string }>> {
  if (!firebaseDb) return [];
  const snapshot = await firebaseDb.collection("operators").where("status", "==", "ACTIVE").get();
  const records = await Promise.all(snapshot.docs.map(async (document) => {
    const corporate = await firebaseDb.collection("corporateStaff").doc(document.id).get();
    if (corporate.exists && corporate.data()?.status === "ACTIVE") return null;
    const data = document.data();
    return { id: document.id, displayName: typeof data.displayName === "string" ? data.displayName : document.id, email: typeof data.email === "string" ? data.email : "" };
  }));
  return records.filter((record): record is { id: string; displayName: string; email: string } => Boolean(record));
}

import { firebaseDb } from "../../../lib/firebase/admin.ts";
import { isCorporateSeedMode } from "../environment.ts";
import { FirestoreSupportRepository, MemorySupportRepository, type SupportRepository } from "./repository.ts";

const globalSupport = globalThis as typeof globalThis & { corporateSupportPreview?: MemorySupportRepository };
export function getCorporateSupportRepository(): SupportRepository {
  if (isCorporateSeedMode()) {
    if (!globalSupport.corporateSupportPreview) {
      const now = new Date().toISOString();
      const units = ["HNL-014", "OAH-207", "SLC-302"].map((locationId, index) => ({ locationId, organizationId: "preview-organization", regionId: index < 2 ? "preview-islands" : "preview-mainland", name: `Training unit ${String(index + 1).padStart(2, "0")}` }));
      globalSupport.corporateSupportPreview = new MemorySupportRepository(units, [{
        id: "SUP-PREVIEW-001", locationId: "HNL-014", subject: "Training scenario: delivery reconciliation", topic: "Supply Logistics & Freight", details: "Fictional training case. Please reconcile the training delivery reference before resolving.", userEmail: "operator@example.invalid", submittedByUserId: "preview-operator", status: "Open", version: 0, operatorActionRequired: false, createdAt: now, updatedAt: now, messages: [],
      }]);
    }
    return globalSupport.corporateSupportPreview;
  }
  if (!firebaseDb) throw new Error("Corporate support storage is not configured.");
  return new FirestoreSupportRepository(firebaseDb);
}

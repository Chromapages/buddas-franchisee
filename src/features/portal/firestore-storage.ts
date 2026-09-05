import { firebaseDb } from "../../lib/firebase/admin.ts";
import type { IPortalStorage } from "./storage-adapter.ts";
import type {
  PortalBulletin,
  PortalLocation,
  PortalOrder,
  PortalProduct,
  PortalResource,
  PortalRole,
  PortalSupportCase,
  TargetingEvaluation,
} from "./types.ts";
import { getVisibleBulletins } from "./bulletins.ts";
import { buildAudienceContext, evaluateAudienceTargeting } from "./targeting.ts";
import type { PortalSession } from "../../lib/auth/auth-provider.ts";

const db = () => { if (!firebaseDb) throw new Error("Firestore is not configured."); return firebaseDb; };
const records = <T>(snapshot: { docs: Array<{ id: string; data: () => Record<string, unknown> }> }): T[] => snapshot.docs.map((document) => ({ id: document.id, ...document.data() }) as T);

export class FirestorePortalStorage implements IPortalStorage {
  async getLocations(): Promise<PortalLocation[]> { return records<PortalLocation>(await db().collection("units").get()); }
  async getLocationById(id: string): Promise<PortalLocation | null> { const document = await db().collection("units").doc(id).get(); return document.exists ? ({ id: document.id, ...document.data() } as PortalLocation) : null; }
  async getProductsByLocation(locationId: string): Promise<PortalProduct[]> { return records<PortalProduct>(await db().collection("units").doc(locationId).collection("products").get()); }
  async getOrdersByLocation(locationId: string): Promise<PortalOrder[]> { return records<PortalOrder>(await db().collection("units").doc(locationId).collection("orders").orderBy("createdAt", "desc").get()); }
  async getOrderById(orderId: string): Promise<PortalOrder | null> {
    const units = await this.getLocations();
    for (const unit of units) {
      const doc = await db().collection("units").doc(unit.id).collection("orders").doc(orderId).get();
      if (doc.exists) return { id: doc.id, ...doc.data() } as PortalOrder;
    }
    return null;
  }
  async createOrder(order: PortalOrder): Promise<void> { await db().collection("units").doc(order.locationId).collection("orders").doc(order.id).set(order); }
  async cancelOrder(orderId: string, _reason?: string): Promise<PortalOrder | null> {
    const order = await this.getOrderById(orderId);
    if (!order) return null;
    await db().collection("units").doc(order.locationId).collection("orders").doc(orderId).update({ status: "CANCELLED" });
    return { ...order, status: "CANCELLED" };
  }
  async getResourcesByLocation(locationId: string): Promise<PortalResource[]> { return records<PortalResource>(await db().collection("units").doc(locationId).collection("resources").get()); }
  async getSupportCasesByLocation(locationId: string): Promise<PortalSupportCase[]> { return records<PortalSupportCase>(await db().collection("units").doc(locationId).collection("supportTickets").orderBy("updatedAt", "desc").get()); }
  async getSupportCaseById(caseId: string, locationId: string): Promise<PortalSupportCase | null> {
    const doc = await db().collection("units").doc(locationId).collection("supportTickets").doc(caseId).get();
    return doc.exists ? ({ id: doc.id, ...doc.data() } as PortalSupportCase) : null;
  }
  async createSupportCase(ticket: { id: string; locationId: string; userEmail: string; submittedByUserId?: string; subject: string; topic: string; details: string }): Promise<void> {
    const now = new Date().toISOString();
    const initialMessage = {
      id: `msg-${Date.now()}`,
      caseId: ticket.id,
      locationId: ticket.locationId,
      authorEmail: ticket.userEmail,
      authorRole: "OPERATOR",
      message: ticket.details,
      createdAt: now,
    };
    await db().collection("units").doc(ticket.locationId).collection("supportTickets").doc(ticket.id).set({
      ...ticket,
      status: "Open",
      operatorActionRequired: false,
      createdAt: now,
      updatedAt: now,
      messages: [initialMessage],
    });
  }
  async updateSupportCaseStatus(caseId: string, status: "Open" | "In Review" | "Resolved", locationId?: string): Promise<void> {
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = { status, updatedAt: now };
    if (status === "Resolved") {
      updates.resolvedAt = now;
      updates.operatorActionRequired = false;
    }
    if (locationId) {
      await db().collection("units").doc(locationId).collection("supportTickets").doc(caseId).update(updates);
      return;
    }
    const units = await this.getLocations();
    for (const unit of units) {
      const docRef = db().collection("units").doc(unit.id).collection("supportTickets").doc(caseId);
      const doc = await docRef.get();
      if (doc.exists) {
        await docRef.update(updates);
        return;
      }
    }
  }
  async replySupportCase(caseId: string, locationId: string, message: { authorEmail: string; authorRole: "OPERATOR" | "SUPPORT" | "ADMIN"; authorName?: string; message: string }): Promise<PortalSupportCase | null> {
    const docRef = db().collection("units").doc(locationId).collection("supportTickets").doc(caseId);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    const now = new Date().toISOString();
    const existing = doc.data() as PortalSupportCase;
    const messages = existing.messages || [];
    const newMessage = {
      id: `msg-${Date.now()}`,
      caseId,
      locationId,
      authorEmail: message.authorEmail,
      authorRole: message.authorRole,
      authorName: message.authorName,
      message: message.message,
      createdAt: now,
    };
    messages.push(newMessage);
    const updates: Record<string, unknown> = { messages, updatedAt: now };
    if (message.authorRole === "OPERATOR") updates.operatorActionRequired = false;
    await docRef.update(updates);
    return { ...existing, ...updates } as PortalSupportCase;
  }
  async closeSupportCase(caseId: string, locationId: string, note?: string): Promise<PortalSupportCase | null> {
    const docRef = db().collection("units").doc(locationId).collection("supportTickets").doc(caseId);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    const now = new Date().toISOString();
    const existing = doc.data() as PortalSupportCase;
    const messages = existing.messages || [];
    if (note && note.trim()) {
      messages.push({
        id: `msg-${Date.now()}`,
        caseId,
        locationId,
        authorEmail: existing.userEmail,
        authorRole: "OPERATOR",
        message: `Resolved: ${note.trim()}`,
        createdAt: now,
      });
    }
    const updates = { status: "Resolved" as const, resolvedAt: now, updatedAt: now, operatorActionRequired: false, messages };
    await docRef.update(updates);
    return { ...existing, ...updates };
  }
  async reopenSupportCase(caseId: string, locationId: string, reason: string): Promise<PortalSupportCase | null> {
    const docRef = db().collection("units").doc(locationId).collection("supportTickets").doc(caseId);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    const now = new Date().toISOString();
    const existing = doc.data() as PortalSupportCase;
    const messages = existing.messages || [];
    messages.push({
      id: `msg-${Date.now()}`,
      caseId,
      locationId,
      authorEmail: existing.userEmail,
      authorRole: "OPERATOR",
      message: `Reopened: ${reason.trim()}`,
      createdAt: now,
    });
    const updates = { status: "Open" as const, reopenedAt: now, updatedAt: now, operatorActionRequired: false, messages };
    await docRef.update(updates);
    return { ...existing, ...updates };
  }
  async getBulletinsForSession(session: PortalSession): Promise<PortalBulletin[]> {
    const raw = await records<PortalBulletin>(await db().collection("bulletins").get());
    const locDoc = await db().collection("units").doc(session.locationId).get();
    const location = locDoc.exists ? ({ id: locDoc.id, ...locDoc.data() } as PortalLocation) : undefined;
    const context = location
      ? buildAudienceContext(location, session.role)
      : { unitId: session.locationId, role: session.role };
    return getVisibleBulletins(raw, context);
  }
  async acknowledgeBulletin(bulletinId: string, userId: string): Promise<void> {
    await db().collection("bulletins").doc(bulletinId).collection("acknowledgements").doc(userId).set({ acknowledgedAt: new Date().toISOString() });
  }
  async explainBulletinForUnit(bulletinId: string, locationId: string, role: PortalRole = "franchisee"): Promise<TargetingEvaluation | null> {
    const doc = await db().collection("bulletins").doc(bulletinId).get();
    if (!doc.exists) return null;
    const bulletin = { id: doc.id, ...doc.data() } as PortalBulletin;
    const locDoc = await db().collection("units").doc(locationId).get();
    const location = locDoc.exists ? ({ id: locDoc.id, ...locDoc.data() } as PortalLocation) : undefined;
    const context = location ? buildAudienceContext(location, role) : { unitId: locationId, role };
    return evaluateAudienceTargeting(bulletin.audience, context);
  }
  async explainResourceForUnit(resourceId: string, locationId: string, role: PortalRole = "franchisee"): Promise<TargetingEvaluation | null> {
    const doc = await db().collection("units").doc(locationId).collection("resources").doc(resourceId).get();
    if (!doc.exists) return null;
    const resource = { id: doc.id, ...doc.data() } as PortalResource;
    const locDoc = await db().collection("units").doc(locationId).get();
    const location = locDoc.exists ? ({ id: locDoc.id, ...locDoc.data() } as PortalLocation) : undefined;
    const context = location ? buildAudienceContext(location, role) : { unitId: locationId, role };
    return evaluateAudienceTargeting(resource.audience, context);
  }
}


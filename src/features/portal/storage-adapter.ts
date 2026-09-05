import type {
  PortalBulletin,
  PortalLocation,
  PortalOrder,
  PortalProduct,
  PortalResource,
  PortalRole,
  PortalSupportCase,
  PortalSupportMessage,
  TargetingEvaluation,
} from "./types.ts";
import {
  portalBulletins,
  portalLocations,
  portalOrders,
  portalProducts,
  portalResources,
} from "./data.ts";
import { DatabasePortalStorage } from "./db-storage.ts";
import { FirestorePortalStorage } from "./firestore-storage.ts";
import { firebaseDb } from "../../lib/firebase/admin.ts";
import { canUseSeedPortalData } from "./environment.ts";
import { getVisibleBulletins } from "./bulletins.ts";
import { buildAudienceContext, evaluateAudienceTargeting } from "./targeting.ts";
import type { PortalSession } from "../../lib/auth/auth-provider.ts";

export interface IPortalStorage {
  getLocations(): Promise<PortalLocation[]>;
  getLocationById(id: string): Promise<PortalLocation | null>;
  getProductsByLocation(locationId: string): Promise<PortalProduct[]>;
  getOrdersByLocation(locationId: string): Promise<PortalOrder[]>;
  getOrderById(orderId: string): Promise<PortalOrder | null>;
  createOrder(order: PortalOrder): Promise<void>;
  cancelOrder(orderId: string, reason?: string): Promise<PortalOrder | null>;
  getResourcesByLocation(locationId: string, role?: PortalRole): Promise<PortalResource[]>;
  getSupportCasesByLocation(locationId: string): Promise<PortalSupportCase[]>;
  getSupportCaseById(caseId: string, locationId: string): Promise<PortalSupportCase | null>;
  createSupportCase(ticket: {
    id: string;
    locationId: string;
    userEmail: string;
    submittedByUserId?: string;
    subject: string;
    topic: string;
    details: string;
  }): Promise<void>;
  updateSupportCaseStatus(
    caseId: string,
    status: "Open" | "In Review" | "Resolved",
    locationId?: string,
  ): Promise<void>;
  replySupportCase(
    caseId: string,
    locationId: string,
    message: {
      authorEmail: string;
      authorRole: "OPERATOR" | "SUPPORT" | "ADMIN";
      authorName?: string;
      message: string;
    },
  ): Promise<PortalSupportCase | null>;
  closeSupportCase(
    caseId: string,
    locationId: string,
    note?: string,
  ): Promise<PortalSupportCase | null>;
  reopenSupportCase(
    caseId: string,
    locationId: string,
    reason: string,
  ): Promise<PortalSupportCase | null>;
  getBulletinsForSession(session: PortalSession): Promise<PortalBulletin[]>;
  acknowledgeBulletin(bulletinId: string, userId: string): Promise<void>;
  explainBulletinForUnit(
    bulletinId: string,
    locationId: string,
    role?: PortalRole,
  ): Promise<TargetingEvaluation | null>;
  explainResourceForUnit(
    resourceId: string,
    locationId: string,
    role?: PortalRole,
  ): Promise<TargetingEvaluation | null>;
}

const initialSupportCases: PortalSupportCase[] = [
  {
    id: "SUP-102941",
    locationId: "loc-honolulu",
    userEmail: "honolulu.operator@buddas-test.local",
    submittedByUserId: "usr-hono-op-1",
    subject: "Steam deck gasket replacement needed",
    topic: "Equipment & Steam Deck Oven Maintenance",
    details: "Deck #2 lower right door gasket has deteriorated, causing steam loss during initial bake cycle.",
    status: "In Review",
    operatorActionRequired: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    messages: [
      {
        id: "msg-101",
        caseId: "SUP-102941",
        locationId: "loc-honolulu",
        authorEmail: "honolulu.operator@buddas-test.local",
        authorRole: "OPERATOR",
        authorName: "Store Operator",
        message: "Deck #2 lower right door gasket has deteriorated, causing steam loss during initial bake cycle.",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "msg-102",
        caseId: "SUP-102941",
        locationId: "loc-honolulu",
        authorEmail: "ops-support@buddas.local",
        authorRole: "SUPPORT",
        authorName: "Budda's Field Operations",
        message: "Aloha Team, we have replacement seal kits in stock at the Honolulu depot. Could you please confirm the exact serial number on the oven nameplate so we dispatch the correct model revision?",
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ],
  },
  {
    id: "SUP-102942",
    locationId: "loc-honolulu",
    userEmail: "honolulu.operator@buddas-test.local",
    submittedByUserId: "usr-hono-op-1",
    subject: "Inquiry on gluten-free poi flour blend shipment timing",
    topic: "Supply Logistics & Freight",
    details: "Checking on container vessel ETA for bulk flour restock scheduled for next Tuesday.",
    status: "Open",
    operatorActionRequired: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    messages: [
      {
        id: "msg-103",
        caseId: "SUP-102942",
        locationId: "loc-honolulu",
        authorEmail: "honolulu.operator@buddas-test.local",
        authorRole: "OPERATOR",
        authorName: "Store Operator",
        message: "Checking on container vessel ETA for bulk flour restock scheduled for next Tuesday.",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  },
  {
    id: "SUP-102940",
    locationId: "loc-honolulu",
    userEmail: "honolulu.operator@buddas-test.local",
    submittedByUserId: "usr-hono-op-1",
    subject: "POS Bluetooth barcode scanner pairing guide",
    topic: "POS & Inventory Systems",
    details: "Requesting pairing instructions for new Zebra CS60 scanner with front checkout terminal.",
    status: "Resolved",
    operatorActionRequired: false,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    resolvedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    messages: [
      {
        id: "msg-104",
        caseId: "SUP-102940",
        locationId: "loc-honolulu",
        authorEmail: "honolulu.operator@buddas-test.local",
        authorRole: "OPERATOR",
        authorName: "Store Operator",
        message: "Requesting pairing instructions for new Zebra CS60 scanner with front checkout terminal.",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: "msg-105",
        caseId: "SUP-102940",
        locationId: "loc-honolulu",
        authorEmail: "ops-support@buddas.local",
        authorRole: "SUPPORT",
        authorName: "Budda's Field Operations",
        message: "Standard pairing barcode has been linked in Resource Center under POS SOP v2.4. Let us know if you encounter any issue.",
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
    ],
  },
  {
    id: "SUP-203811",
    locationId: "loc-maui",
    userEmail: "maui.operator@buddas-test.local",
    submittedByUserId: "usr-maui-op-1",
    subject: "Maui Kahului Store Signage Lighting Check",
    topic: "Equipment & Steam Deck Oven Maintenance",
    details: "Exterior pylon signage ballast inspection requested.",
    status: "Open",
    operatorActionRequired: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    messages: [
      {
        id: "msg-201",
        caseId: "SUP-203811",
        locationId: "loc-maui",
        authorEmail: "maui.operator@buddas-test.local",
        authorRole: "OPERATOR",
        message: "Exterior pylon signage ballast inspection requested.",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ],
  },
];

export class InMemoryPortalStorage implements IPortalStorage {
  private locations: PortalLocation[] = [...portalLocations];
  private products: PortalProduct[] = [...portalProducts];
  private orders: PortalOrder[] = [...portalOrders];
  private resources: PortalResource[] = [...portalResources];
  private bulletins: PortalBulletin[] = [...portalBulletins];
  private supportCases: PortalSupportCase[] = initialSupportCases.map((c) => ({
    ...c,
    messages: c.messages ? [...c.messages] : [],
  }));

  public async getLocations(): Promise<PortalLocation[]> {
    return [...this.locations];
  }

  public async getLocationById(id: string): Promise<PortalLocation | null> {
    const loc = this.locations.find((l) => l.id === id);
    return loc ? { ...loc } : null;
  }

  public async getProductsByLocation(_locationId: string): Promise<PortalProduct[]> {
    return [...this.products];
  }

  public async getOrdersByLocation(locationId: string): Promise<PortalOrder[]> {
    return this.orders.filter((o) => o.locationId === locationId);
  }

  public async getOrderById(orderId: string): Promise<PortalOrder | null> {
    const order = this.orders.find((o) => o.id === orderId);
    return order ? { ...order } : null;
  }

  public async createOrder(order: PortalOrder): Promise<void> {
    this.orders.unshift({ ...order });
  }

  public async cancelOrder(orderId: string, _reason?: string): Promise<PortalOrder | null> {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.status = "CANCELLED";
    return { ...order };
  }

  public async getResourcesByLocation(
    locationId: string,
    role: PortalRole = "franchisee",
  ): Promise<PortalResource[]> {
    const location = this.locations.find((l) => l.id === locationId);
    const context = location
      ? buildAudienceContext(location, role)
      : { unitId: locationId, role };

    return this.resources.filter((r) => {
      if (r.locationScope && !r.locationScope.includes(locationId)) {
        return false;
      }
      return evaluateAudienceTargeting(r.audience, context).isTargeted;
    });
  }

  public async getSupportCasesByLocation(locationId: string): Promise<PortalSupportCase[]> {
    return this.supportCases
      .filter((supportCase) => supportCase.locationId === locationId)
      .map((c) => ({ ...c, messages: c.messages ? [...c.messages] : [] }));
  }

  public async getSupportCaseById(caseId: string, locationId: string): Promise<PortalSupportCase | null> {
    const supportCase = this.supportCases.find(
      (c) => c.id === caseId && c.locationId === locationId,
    );
    if (!supportCase) return null;
    return { ...supportCase, messages: supportCase.messages ? [...supportCase.messages] : [] };
  }

  public async createSupportCase(ticket: {
    id: string;
    locationId: string;
    userEmail: string;
    submittedByUserId?: string;
    subject: string;
    topic: string;
    details: string;
  }): Promise<void> {
    const now = new Date().toISOString();
    const initialMessage: PortalSupportMessage = {
      id: `msg-${Date.now()}`,
      caseId: ticket.id,
      locationId: ticket.locationId,
      authorEmail: ticket.userEmail,
      authorRole: "OPERATOR",
      message: ticket.details,
      createdAt: now,
    };

    this.supportCases.unshift({
      ...ticket,
      status: "Open",
      submittedByUserId: ticket.submittedByUserId,
      operatorActionRequired: false,
      createdAt: now,
      updatedAt: now,
      messages: [initialMessage],
    });
  }

  public async updateSupportCaseStatus(
    caseId: string,
    status: "Open" | "In Review" | "Resolved",
    locationId?: string,
  ): Promise<void> {
    const supportCase = this.supportCases.find(
      (c) => c.id === caseId && (!locationId || c.locationId === locationId),
    );
    if (supportCase) {
      supportCase.status = status;
      supportCase.updatedAt = new Date().toISOString();
      if (status === "Resolved") {
        supportCase.resolvedAt = new Date().toISOString();
        supportCase.operatorActionRequired = false;
      }
    }
  }

  public async replySupportCase(
    caseId: string,
    locationId: string,
    message: {
      authorEmail: string;
      authorRole: "OPERATOR" | "SUPPORT" | "ADMIN";
      authorName?: string;
      message: string;
    },
  ): Promise<PortalSupportCase | null> {
    const supportCase = this.supportCases.find(
      (c) => c.id === caseId && c.locationId === locationId,
    );
    if (!supportCase) return null;

    const now = new Date().toISOString();
    const newMessage: PortalSupportMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      caseId,
      locationId,
      authorEmail: message.authorEmail,
      authorRole: message.authorRole,
      authorName: message.authorName,
      message: message.message,
      createdAt: now,
    };

    if (!supportCase.messages) {
      supportCase.messages = [];
    }
    supportCase.messages.push(newMessage);
    supportCase.updatedAt = now;

    // Operator replying clears pending operator action
    if (message.authorRole === "OPERATOR") {
      supportCase.operatorActionRequired = false;
    }

    return { ...supportCase, messages: [...supportCase.messages] };
  }

  public async closeSupportCase(
    caseId: string,
    locationId: string,
    note?: string,
  ): Promise<PortalSupportCase | null> {
    const supportCase = this.supportCases.find(
      (c) => c.id === caseId && c.locationId === locationId,
    );
    if (!supportCase) return null;

    const now = new Date().toISOString();
    supportCase.status = "Resolved";
    supportCase.resolvedAt = now;
    supportCase.updatedAt = now;
    supportCase.operatorActionRequired = false;

    if (note && note.trim()) {
      if (!supportCase.messages) supportCase.messages = [];
      supportCase.messages.push({
        id: `msg-${Date.now()}`,
        caseId,
        locationId,
        authorEmail: supportCase.userEmail,
        authorRole: "OPERATOR",
        message: `Resolved: ${note.trim()}`,
        createdAt: now,
      });
    }

    return { ...supportCase, messages: supportCase.messages ? [...supportCase.messages] : [] };
  }

  public async reopenSupportCase(
    caseId: string,
    locationId: string,
    reason: string,
  ): Promise<PortalSupportCase | null> {
    const supportCase = this.supportCases.find(
      (c) => c.id === caseId && c.locationId === locationId,
    );
    if (!supportCase) return null;

    const now = new Date().toISOString();
    supportCase.status = "Open";
    supportCase.reopenedAt = now;
    supportCase.updatedAt = now;
    supportCase.operatorActionRequired = false;

    if (!supportCase.messages) supportCase.messages = [];
    supportCase.messages.push({
      id: `msg-${Date.now()}`,
      caseId,
      locationId,
      authorEmail: supportCase.userEmail,
      authorRole: "OPERATOR",
      message: `Reopened: ${reason.trim()}`,
      createdAt: now,
    });

    return { ...supportCase, messages: [...supportCase.messages] };
  }

  public async getBulletinsForSession(session: PortalSession): Promise<PortalBulletin[]> {
    const location = this.locations.find((l) => l.id === session.locationId);
    const context = location
      ? buildAudienceContext(location, session.role)
      : { unitId: session.locationId, role: session.role };
    return getVisibleBulletins(this.bulletins, context);
  }

  public async acknowledgeBulletin(bulletinId: string, _userId: string): Promise<void> {
    const bulletin = this.bulletins.find((b) => b.id === bulletinId);
    if (bulletin) {
      bulletin.currentUserState = {
        ...bulletin.currentUserState,
        acknowledgedAt: new Date().toISOString(),
      };
    }
  }

  public async explainBulletinForUnit(
    bulletinId: string,
    locationId: string,
    role: PortalRole = "franchisee",
  ): Promise<TargetingEvaluation | null> {
    const bulletin = this.bulletins.find((b) => b.id === bulletinId);
    if (!bulletin) return null;
    const location = this.locations.find((l) => l.id === locationId);
    const context = location
      ? buildAudienceContext(location, role)
      : { unitId: locationId, role };
    return evaluateAudienceTargeting(bulletin.audience, context);
  }

  public async explainResourceForUnit(
    resourceId: string,
    locationId: string,
    role: PortalRole = "franchisee",
  ): Promise<TargetingEvaluation | null> {
    const resource = this.resources.find((r) => r.id === resourceId);
    if (!resource) return null;
    const location = this.locations.find((l) => l.id === locationId);
    const context = location
      ? buildAudienceContext(location, role)
      : { unitId: locationId, role };

    if (resource.locationScope && !resource.locationScope.includes(locationId)) {
      return {
        isTargeted: false,
        isUniversal: false,
        summary: `Excluded: Unit ${locationId} not in legacy locationScope.`,
        reasons: [`Unit ${locationId} is not in allowed locationScope [${resource.locationScope.join(", ")}].`],
        matchedRules: [],
        unmatchedRules: [{ dimension: "unit", criteria: resource.locationScope, actual: locationId }],
      };
    }

    return evaluateAudienceTargeting(resource.audience, context);
  }
}

class UnconfiguredPortalStorage implements IPortalStorage {
  private fail(): never {
    throw new Error("Portal storage must be configured in production.");
  }

  public async getLocations(): Promise<PortalLocation[]> { return this.fail(); }
  public async getLocationById(): Promise<PortalLocation | null> { return this.fail(); }
  public async getProductsByLocation(): Promise<PortalProduct[]> { return this.fail(); }
  public async getOrdersByLocation(): Promise<PortalOrder[]> { return this.fail(); }
  public async getOrderById(): Promise<PortalOrder | null> { return this.fail(); }
  public async createOrder(): Promise<void> { return this.fail(); }
  public async cancelOrder(): Promise<PortalOrder | null> { return this.fail(); }
  public async getResourcesByLocation(): Promise<PortalResource[]> { return this.fail(); }
  public async getSupportCasesByLocation(): Promise<PortalSupportCase[]> { return this.fail(); }
  public async getSupportCaseById(): Promise<PortalSupportCase | null> { return this.fail(); }
  public async createSupportCase(): Promise<void> { return this.fail(); }
  public async updateSupportCaseStatus(): Promise<void> { return this.fail(); }
  public async replySupportCase(): Promise<PortalSupportCase | null> { return this.fail(); }
  public async closeSupportCase(): Promise<PortalSupportCase | null> { return this.fail(); }
  public async reopenSupportCase(): Promise<PortalSupportCase | null> { return this.fail(); }
  public async getBulletinsForSession(): Promise<PortalBulletin[]> { return this.fail(); }
  public async acknowledgeBulletin(): Promise<void> { return this.fail(); }
  public async explainBulletinForUnit(): Promise<TargetingEvaluation | null> { return this.fail(); }
  public async explainResourceForUnit(): Promise<TargetingEvaluation | null> { return this.fail(); }
}

const hasDatabaseStorage = Boolean(process.env.DATABASE_URL);

export const defaultPortalStorage: IPortalStorage = hasDatabaseStorage
  ? (new DatabasePortalStorage() as unknown as IPortalStorage)
  : firebaseDb
    ? new FirestorePortalStorage()
    : process.env.PORTAL_USE_SEED_DATA === "true" && canUseSeedPortalData()
    ? new InMemoryPortalStorage()
    : new UnconfiguredPortalStorage();

export const isUsingInMemoryPortalStorage = !hasDatabaseStorage && canUseSeedPortalData();

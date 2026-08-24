import type {
  PortalAnnouncement,
  PortalLocation,
  PortalOrder,
  PortalProduct,
  PortalResource,
  PortalSupportCase,
} from "./types.ts";
import {
  portalAnnouncements,
  portalLocations,
  portalOrders,
  portalProducts,
  portalResources,
} from "./data.ts";
import { DatabasePortalStorage } from "./db-storage.ts";

export interface IPortalStorage {
  getLocations(): Promise<PortalLocation[]>;
  getLocationById(id: string): Promise<PortalLocation | null>;
  getProductsByLocation(locationId: string): Promise<PortalProduct[]>;
  getOrdersByLocation(locationId: string): Promise<PortalOrder[]>;
  createOrder(order: PortalOrder): Promise<void>;
  getResourcesByLocation(locationId: string): Promise<PortalResource[]>;
  createSupportCase(ticket: {
    id: string;
    locationId: string;
    userEmail: string;
    subject: string;
    topic: string;
    details: string;
  }): Promise<void>;
  getAnnouncements(): Promise<PortalAnnouncement[]>;
}

export class InMemoryPortalStorage implements IPortalStorage {
  private locations: PortalLocation[] = [...portalLocations];
  private products: PortalProduct[] = [...portalProducts];
  private orders: PortalOrder[] = [...portalOrders];
  private resources: PortalResource[] = [...portalResources];
  private announcements: PortalAnnouncement[] = [...portalAnnouncements];
  private supportCases: PortalSupportCase[] = [];

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

  public async createOrder(order: PortalOrder): Promise<void> {
    this.orders.unshift({ ...order });
  }

  public async getResourcesByLocation(locationId: string): Promise<PortalResource[]> {
    return this.resources.filter(
      (r) => !r.locationScope || r.locationScope.includes(locationId),
    );
  }

  public async createSupportCase(ticket: {
    id: string;
    locationId: string;
    userEmail: string;
    subject: string;
    topic: string;
    details: string;
  }): Promise<void> {
    this.supportCases.unshift({
      ...ticket,
      status: "Open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  public async getAnnouncements(): Promise<PortalAnnouncement[]> {
    return [...this.announcements];
  }
}

export const defaultPortalStorage: IPortalStorage = process.env.DATABASE_URL
  ? (new DatabasePortalStorage() as unknown as IPortalStorage)
  : new InMemoryPortalStorage();

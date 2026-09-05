import type { FddReceipt, IFddStorage } from "./types.ts";
import { DatabaseFddStorage } from "./db-storage.ts";
import { canUseDevelopmentSeedData } from "../portal/environment.ts";

export class InMemoryFddStorage implements IFddStorage {
  private receipts = new Map<string, FddReceipt>();

  constructor() {
    // Seed a demo candidate receipt for testing
    const demoReceipt: FddReceipt = {
      id: "FDD-DEMO-001",
      token: "demo-fdd-candidate-token-2026",
      inquiryId: "INQ-DEMO-2026",
      prospectName: "Koa & Maya Lindqvist",
      prospectEmail: "candidate@buddasdemo.com",
      fddVersion: "2026.1",
      issuedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      status: "PENDING",
    };
    this.receipts.set(demoReceipt.token, demoReceipt);
  }

  public async createReceipt(
    receipt: Omit<FddReceipt, "status">,
  ): Promise<FddReceipt> {
    const newRecord: FddReceipt = {
      ...receipt,
      status: "PENDING",
    };
    this.receipts.set(receipt.token, newRecord);
    return { ...newRecord };
  }

  public async getReceiptByToken(token: string): Promise<FddReceipt | null> {
    const record = this.receipts.get(token);
    if (!record) return null;
    return { ...record };
  }

  public async recordSignature(
    token: string,
    legalName: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<FddReceipt | null> {
    const record = this.receipts.get(token);
    if (!record || record.status !== "PENDING") return null;

    record.status = "SIGNED";
    record.signedAt = new Date().toISOString();
    record.signatureLegalName = legalName;
    record.ipAddress = ipAddress;
    record.userAgent = userAgent;

    this.receipts.set(token, record);
    return { ...record };
  }
}

class UnconfiguredFddStorage implements IFddStorage {
  private fail(): never {
    throw new Error("FDD storage must be configured outside local development.");
  }

  public async createReceipt(): Promise<FddReceipt> { return this.fail(); }
  public async getReceiptByToken(): Promise<FddReceipt | null> { return this.fail(); }
  public async recordSignature(): Promise<FddReceipt | null> { return this.fail(); }
}

export const defaultFddStorage: IFddStorage = process.env.DATABASE_URL
  ? (new DatabaseFddStorage() as unknown as IFddStorage)
  : canUseDevelopmentSeedData()
    ? new InMemoryFddStorage()
    : new UnconfiguredFddStorage();

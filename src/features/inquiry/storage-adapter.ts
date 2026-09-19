import type {
  IInquiryStorage,
  InquiryClassification,
  InquiryDeliveryStatus,
  InquiryRouting,
  InquiryWorkflow,
  StoredInquiry,
} from "./types.ts";
import type { InquiryValues } from "./schema.ts";
import { DatabaseInquiryStorage } from "./db-storage.ts";
import { evaluateTerritory } from "../territory/territory-rules.ts";
import { isActiveOfferingEnabled } from "../../lib/flags.ts";
import { FRANCHISE_INVESTMENT_DISCLOSURE } from "../financials/financial-data.ts";

export class InMemoryInquiryStorage implements IInquiryStorage {
  private inquiries = new Map<string, StoredInquiry>();

  public async save(inquiry: StoredInquiry): Promise<void> {
    this.inquiries.set(inquiry.id, { ...inquiry });
  }

  public async updateStatus(
    id: string,
    status: InquiryDeliveryStatus,
    error?: string,
  ): Promise<void> {
    const existing = this.inquiries.get(id);
    if (existing) {
      existing.deliveryStatus = status;
      if (error) existing.lastError = error;
      this.inquiries.set(id, existing);
    }
  }

  public async getById(id: string): Promise<StoredInquiry | null> {
    const record = this.inquiries.get(id);
    if (!record) return null;
    return { ...record };
  }

  public async getAll(): Promise<StoredInquiry[]> {
    return Array.from(this.inquiries.values());
  }

  public async updateRouting(id: string, expectedVersion: number, routing: InquiryRouting): Promise<StoredInquiry | null> {
    const existing = this.inquiries.get(id);
    if (!existing || existing.version !== expectedVersion) return null;
    const next = { ...existing, routing, version: existing.version + 1 };
    this.inquiries.set(id, next);
    return { ...next };
  }

  public async updateWorkflow(id: string, expectedVersion: number, workflow: InquiryWorkflow): Promise<StoredInquiry | null> {
    const existing = this.inquiries.get(id);
    if (!existing || existing.version !== expectedVersion) return null;
    const next = { ...existing, workflow, version: existing.version + 1 };
    this.inquiries.set(id, next);
    return { ...next };
  }
}

class UnavailableInquiryStorage implements IInquiryStorage {
  private unavailable(): never { throw new Error("Durable franchise inquiry storage is not configured."); }
  async save(): Promise<void> { return this.unavailable(); }
  async updateStatus(): Promise<void> { return this.unavailable(); }
  async updateRouting(): Promise<StoredInquiry | null> { return this.unavailable(); }
  async updateWorkflow(): Promise<StoredInquiry | null> { return this.unavailable(); }
  async getById(): Promise<StoredInquiry | null> { return this.unavailable(); }
  async getAll(): Promise<StoredInquiry[]> { return this.unavailable(); }
}

export const defaultInquiryStorage: IInquiryStorage = process.env.DATABASE_URL
  ? new DatabaseInquiryStorage()
  : process.env.NODE_ENV === "development"
    ? new InMemoryInquiryStorage()
    : new UnavailableInquiryStorage();

export const classifyInquiry = (
  inquiry: InquiryValues,
): InquiryClassification => {
  // Check Broker referral
  if (inquiry.brokerId && inquiry.brokerId.trim().length > 0) {
    return "BROKER_REFERRAL";
  }

  // Check Release 2 Territory evaluation
  if (isActiveOfferingEnabled()) {
    const territory = evaluateTerritory(inquiry.marketInterest || inquiry.cityState);
    if (territory.status === "RESTRICTED" || territory.status === "PENDING_REGISTRATION") {
      return "RESTRICTED_TERRITORY";
    }
  }

  const exp = inquiry.experience.toLowerCase();
  const hasFoodExperience =
    exp.includes("restaurant") ||
    exp.includes("multi-unit") ||
    exp.includes("franchise") ||
    exp.includes("food") ||
    exp.includes("bakery") ||
    exp.includes("kitchen") ||
    exp.includes("general manager") ||
    exp.includes("operator");

  const hasSufficientCapital =
    inquiry.investmentRange === FRANCHISE_INVESTMENT_DISCLOSURE.inquiryOptions[1] ||
    inquiry.investmentRange === FRANCHISE_INVESTMENT_DISCLOSURE.inquiryOptions[2];

  if (hasFoodExperience && hasSufficientCapital) {
    return "QUALIFIED_CANDIDATE";
  }

  if (hasFoodExperience && !hasSufficientCapital) {
    return "GENERAL_INQUIRY";
  }

  if (!hasFoodExperience && hasSufficientCapital) {
    return "UNQUALIFIED_EXPERIENCE";
  }

  return "FUTURE_MARKET";
};

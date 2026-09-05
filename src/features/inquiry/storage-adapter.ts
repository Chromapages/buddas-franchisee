import type {
  IInquiryStorage,
  InquiryClassification,
  InquiryDeliveryStatus,
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
}

export const defaultInquiryStorage: IInquiryStorage = process.env.DATABASE_URL
  ? new DatabaseInquiryStorage()
  : new InMemoryInquiryStorage();

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

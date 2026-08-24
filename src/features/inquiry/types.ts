export type InquiryClassification =
  | "QUALIFIED_CANDIDATE"
  | "FUTURE_MARKET"
  | "RESTRICTED_TERRITORY"
  | "UNQUALIFIED_EXPERIENCE"
  | "BROKER_REFERRAL"
  | "GENERAL_INQUIRY";

export type InquiryDeliveryStatus =
  | "PENDING"
  | "DELIVERED"
  | "RETRYING"
  | "FAILED";

export type StoredInquiry = {
  id: string;
  submittedAt: string;
  classification: InquiryClassification;
  deliveryStatus: InquiryDeliveryStatus;
  payload: Record<string, unknown>;
  attempts: number;
  lastError?: string;
  brokerId?: string;
};

export interface IInquiryStorage {
  save(inquiry: StoredInquiry): Promise<void>;
  updateStatus(
    id: string,
    status: InquiryDeliveryStatus,
    error?: string,
  ): Promise<void>;
  getById(id: string): Promise<StoredInquiry | null>;
  getAll(): Promise<StoredInquiry[]>;
}

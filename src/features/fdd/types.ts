export type FddReceiptStatus = "PENDING" | "SIGNED" | "EXPIRED";

export type FddReceipt = {
  id: string;
  token: string;
  inquiryId: string;
  prospectName: string;
  prospectEmail: string;
  fddVersion: string;
  issuedAt: string;
  expiresAt: string;
  signedAt?: string;
  signatureLegalName?: string;
  ipAddress?: string;
  userAgent?: string;
  status: FddReceiptStatus;
};

export interface IFddStorage {
  createReceipt(receipt: Omit<FddReceipt, "status">): Promise<FddReceipt>;
  getReceiptByToken(token: string): Promise<FddReceipt | null>;
  recordSignature(
    token: string,
    legalName: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<FddReceipt | null>;
}

import "server-only";

import type { PortalSession } from "@/src/lib/auth/auth-provider";
import { firebaseDb } from "@/src/lib/firebase/admin";

export type CorporateLicense = {
  number: string;
  issuingAuthority?: string;
  expiresAt?: string;
};

export type StoredPaymentMethod = {
  id: string;
  kind: "ACH" | "CARD";
  last4: string;
  label?: string;
  network?: string;
};

export type FranchiseCreditLine = {
  id: string;
  label: string;
  terms?: string;
  availableBalance?: number;
  currency: string;
  availableBalanceAsOf?: string;
};

export type FinancialDocumentType = "ROYALTY_FEE" | "MARKETING_FUND" | "WHOLESALE_INVOICE";

export type FinancialDocument = {
  id: string;
  type: FinancialDocumentType;
  title: string;
  issuedAt?: string;
  period?: string;
  referenceId?: string;
  unitId?: string;
  downloadUrl: string;
};

export type AccountEntityRecord = {
  entityId: string;
  legalName?: string;
  taxIdLast4?: string;
  franchiseAgreementRenewalAt?: string;
  businessLicenses: CorporateLicense[];
  storedPaymentMethods: StoredPaymentMethod[];
  creditLines: FranchiseCreditLine[];
};

const readText = (record: Record<string, unknown>, key: string): string | undefined => {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
};

const readDate = (record: Record<string, unknown>, key: string): string | undefined => {
  const value = readText(record, key);
  return value && Number.isFinite(new Date(value).getTime()) ? value : undefined;
};

const readLast4 = (record: Record<string, unknown>, key: string): string | undefined => {
  const value = readText(record, key);
  return value && /^\d{4}$/.test(value) ? value : undefined;
};

const readRecords = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    : [];

export const getAuthorizedEntityId = async (session: PortalSession): Promise<string | null> => {
  if (!firebaseDb) return null;
  const operator = await firebaseDb.collection("operators").doc(session.userId).get();
  const data = operator.data() as Record<string, unknown> | undefined;
  return data ? readText(data, "franchiseEntityId") ?? null : null;
};

export const getAccountEntityRecord = async (session: PortalSession): Promise<AccountEntityRecord | null> => {
  const entityId = await getAuthorizedEntityId(session);
  if (!entityId || !firebaseDb) return null;

  const entity = await firebaseDb.collection("franchiseEntities").doc(entityId).get();
  const data = entity.data() as Record<string, unknown> | undefined;
  if (!data) return null;

  const businessLicenses = readRecords(data.businessLicenses).flatMap((license): CorporateLicense[] => {
    const number = readText(license, "number");
    return number ? [{ number, issuingAuthority: readText(license, "issuingAuthority"), expiresAt: readDate(license, "expiresAt") }] : [];
  });
  const achAccounts = readRecords(data.storedAchAccounts).flatMap((account): StoredPaymentMethod[] => {
    const id = readText(account, "id");
    const last4 = readLast4(account, "last4");
    return id && last4 ? [{ id, kind: "ACH", last4, label: readText(account, "label") }] : [];
  });
  const cards = readRecords(data.businessCreditCards).flatMap((card): StoredPaymentMethod[] => {
    const id = readText(card, "id");
    const last4 = readLast4(card, "last4");
    return id && last4 ? [{ id, kind: "CARD", last4, label: readText(card, "label"), network: readText(card, "network") }] : [];
  });
  const creditLines = readRecords(data.franchiseCreditLines).flatMap((line): FranchiseCreditLine[] => {
    const id = readText(line, "id");
    const label = readText(line, "label");
    const availableBalance = line.availableBalance;
    return id && label ? [{
      id,
      label,
      terms: readText(line, "terms"),
      availableBalance: typeof availableBalance === "number" && Number.isFinite(availableBalance) ? availableBalance : undefined,
      currency: readText(line, "currency") || "USD",
      availableBalanceAsOf: readDate(line, "availableBalanceAsOf"),
    }] : [];
  });

  return {
    entityId,
    legalName: readText(data, "legalName"),
    taxIdLast4: readLast4(data, "taxIdLast4"),
    franchiseAgreementRenewalAt: readDate(data, "franchiseAgreementRenewalAt"),
    businessLicenses,
    storedPaymentMethods: [...achAccounts, ...cards],
    creditLines,
  };
};

const parseFinancialDocument = (id: string, data: Record<string, unknown>): FinancialDocument | null => {
  const type = readText(data, "type");
  const downloadUrl = readText(data, "downloadUrl");
  const title = readText(data, "title");
  if (!title || !downloadUrl || (type !== "ROYALTY_FEE" && type !== "MARKETING_FUND" && type !== "WHOLESALE_INVOICE")) return null;
  try {
    if (new URL(downloadUrl).protocol !== "https:") return null;
  } catch {
    return null;
  }
  return {
    id,
    type,
    title,
    issuedAt: readDate(data, "issuedAt"),
    period: readText(data, "period"),
    referenceId: readText(data, "referenceId"),
    unitId: readText(data, "unitId"),
    downloadUrl,
  };
};

export const getFinancialDocuments = async (session: PortalSession, entityId?: string): Promise<FinancialDocument[]> => {
  const resolvedEntityId = entityId ?? await getAuthorizedEntityId(session);
  if (!resolvedEntityId || !firebaseDb) return [];
  const snapshot = await firebaseDb.collection("franchiseEntities").doc(resolvedEntityId).collection("financialDocuments").orderBy("issuedAt", "desc").limit(24).get();
  return snapshot.docs.flatMap((document): FinancialDocument[] => {
    const financialDocument = parseFinancialDocument(document.id, document.data() as Record<string, unknown>);
    if (!financialDocument || (financialDocument.unitId && !session.managedLocationIds.includes(financialDocument.unitId))) return [];
    return [financialDocument];
  });
};

export const getFinancialDocument = async (session: PortalSession, documentId: string): Promise<FinancialDocument | null> => {
  const entityId = await getAuthorizedEntityId(session);
  if (!entityId || !firebaseDb) return null;
  const document = await firebaseDb.collection("franchiseEntities").doc(entityId).collection("financialDocuments").doc(documentId).get();
  if (!document.exists) return null;
  const financialDocument = parseFinancialDocument(document.id, document.data() as Record<string, unknown>);
  if (!financialDocument || (financialDocument.unitId && !session.managedLocationIds.includes(financialDocument.unitId))) return null;
  return financialDocument;
};

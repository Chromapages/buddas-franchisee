import "server-only";

import type { PortalSession } from "@/src/lib/auth/auth-provider";
import { firebaseDb } from "@/src/lib/firebase/admin";

export type FoodSafetyCredentialType = "SERVSAFE" | "STATE_HEALTH_CERTIFICATION" | "FOOD_HANDLER_CARD";
export type FoodSafetyCredentialStatus = "SUBMITTED" | "VERIFIED" | "EXPIRING_SOON" | "EXPIRED" | "REJECTED";
export type BrandSignoffType = "BRAND_STANDARD_MANUAL" | "SEASONAL_RECIPE" | "SUPPLY_PROTOCOL_AUDIT";
export type BrandSignoffMode = "DIGITAL_SIGNATURE" | "ACKNOWLEDGEMENT";

export type FoodSafetyCredential = {
  id: string;
  type: FoodSafetyCredentialType;
  holderName: string;
  status: FoodSafetyCredentialStatus;
  expiresAt?: string;
  sanityAssetId: string;
  documentUrl: string;
  submittedAt: string;
};

export type BrandSignoff = {
  id: string;
  type: BrandSignoffType;
  title: string;
  version?: string;
  effectiveAt?: string;
  sourceUrl?: string;
  mode: BrandSignoffMode;
  signedAt?: string;
  acknowledgedAt?: string;
};

const text = (record: Record<string, unknown>, key: string): string | undefined => {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
};

const date = (record: Record<string, unknown>, key: string): string | undefined => {
  const value = text(record, key);
  return value && Number.isFinite(new Date(value).getTime()) ? value : undefined;
};

const httpsUrl = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  try { return new URL(value).protocol === "https:" ? value : undefined; } catch { return undefined; }
};

export const getFoodSafetyCredentials = async (session: PortalSession): Promise<FoodSafetyCredential[]> => {
  if (!firebaseDb) return [];
  const snapshot = await firebaseDb.collection("units").doc(session.locationId).collection("foodSafetyCredentials").orderBy("submittedAt", "desc").limit(24).get();
  return snapshot.docs.flatMap((document): FoodSafetyCredential[] => {
    const data = document.data() as Record<string, unknown>;
    const type = text(data, "type");
    const status = text(data, "status");
    const holderName = text(data, "holderName");
    const sanityAssetId = text(data, "sanityAssetId");
    const documentUrl = httpsUrl(text(data, "documentUrl"));
    const submittedAt = date(data, "submittedAt");
    if ((type !== "SERVSAFE" && type !== "STATE_HEALTH_CERTIFICATION" && type !== "FOOD_HANDLER_CARD") || (status !== "SUBMITTED" && status !== "VERIFIED" && status !== "EXPIRING_SOON" && status !== "EXPIRED" && status !== "REJECTED") || !holderName || !sanityAssetId || !documentUrl || !submittedAt) return [];
    return [{ id: document.id, type, status, holderName, sanityAssetId, documentUrl, submittedAt, expiresAt: date(data, "expiresAt") }];
  });
};

export const getBrandSignoffs = async (session: PortalSession): Promise<BrandSignoff[]> => {
  if (!firebaseDb) return [];
  const requirements = await firebaseDb.collection("units").doc(session.locationId).collection("brandSignoffRequirements").orderBy("effectiveAt", "desc").limit(24).get();
  return Promise.all(requirements.docs.map(async (requirement): Promise<BrandSignoff | null> => {
    const data = requirement.data() as Record<string, unknown>;
    const type = text(data, "type");
    const title = text(data, "title");
    const mode = text(data, "mode");
    if ((type !== "BRAND_STANDARD_MANUAL" && type !== "SEASONAL_RECIPE" && type !== "SUPPLY_PROTOCOL_AUDIT") || !title || (mode !== "DIGITAL_SIGNATURE" && mode !== "ACKNOWLEDGEMENT")) return null;
    const acknowledgement = await requirement.ref.collection("acknowledgements").doc(session.userId).get();
    const acknowledgementData = acknowledgement.data() as Record<string, unknown> | undefined;
    return {
      id: requirement.id,
      type,
      title,
      mode,
      version: text(data, "version"),
      effectiveAt: date(data, "effectiveAt"),
      sourceUrl: httpsUrl(text(data, "sourceUrl")),
      signedAt: acknowledgementData ? date(acknowledgementData, "signedAt") : undefined,
      acknowledgedAt: acknowledgementData ? date(acknowledgementData, "acknowledgedAt") : undefined,
    };
  })).then((results) => results.filter((item): item is BrandSignoff => Boolean(item)));
};

export const getBrandSignoffRequirement = async (session: PortalSession, signoffId: string): Promise<BrandSignoff | null> => {
  if (!firebaseDb) return null;
  const requirement = await firebaseDb.collection("units").doc(session.locationId).collection("brandSignoffRequirements").doc(signoffId).get();
  if (!requirement.exists) return null;
  const data = requirement.data() as Record<string, unknown>;
  const type = text(data, "type");
  const title = text(data, "title");
  const mode = text(data, "mode");
  if ((type !== "BRAND_STANDARD_MANUAL" && type !== "SEASONAL_RECIPE" && type !== "SUPPLY_PROTOCOL_AUDIT") || !title || (mode !== "DIGITAL_SIGNATURE" && mode !== "ACKNOWLEDGEMENT")) return null;
  return { id: requirement.id, type, title, mode, version: text(data, "version"), effectiveAt: date(data, "effectiveAt"), sourceUrl: httpsUrl(text(data, "sourceUrl")) };
};

import "server-only";

import { firebaseDb } from "@/src/lib/firebase/admin";
import type { PortalSession } from "@/src/lib/auth/auth-provider";
import { getAuthorizedEntityId } from "./account-private-records";
import { EXPANSION_STATUS, isExpansionStatus, type ExpansionApplicationStatus } from "./expansion-status";

export type ExpansionSiteReadiness = "EXPLORING" | "MARKET_IDENTIFIED" | "SITE_IDENTIFIED" | "LOI_OR_CONTROL";

export type ExpansionApplication = {
  id: string;
  entityId: string;
  applicantOperatorId: string;
  applicantName: string;
  applicantEmail: string;
  originatingUnitId: string;
  targetMarket: string;
  preferredTimeline: string;
  investmentRange: string;
  siteReadiness: ExpansionSiteReadiness;
  operatingPlan: string;
  status: ExpansionApplicationStatus;
  submittedAt: string;
  updatedAt: string;
  provisionedUnitId?: string;
};

const text = (record: Record<string, unknown>, key: string): string | undefined => {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
};

const parseApplication = (id: string, entityId: string, data: Record<string, unknown>): ExpansionApplication | null => {
  const status = data.status;
  const siteReadiness = data.siteReadiness;
  const applicantOperatorId = text(data, "applicantOperatorId");
  const applicantName = text(data, "applicantName");
  const applicantEmail = text(data, "applicantEmail");
  const originatingUnitId = text(data, "originatingUnitId");
  const targetMarket = text(data, "targetMarket");
  const preferredTimeline = text(data, "preferredTimeline");
  const investmentRange = text(data, "investmentRange");
  const operatingPlan = text(data, "operatingPlan");
  const submittedAt = text(data, "submittedAt");
  const updatedAt = text(data, "updatedAt");
  if (!isExpansionStatus(status) || (siteReadiness !== "EXPLORING" && siteReadiness !== "MARKET_IDENTIFIED" && siteReadiness !== "SITE_IDENTIFIED" && siteReadiness !== "LOI_OR_CONTROL") || !applicantOperatorId || !applicantName || !applicantEmail || !originatingUnitId || !targetMarket || !preferredTimeline || !investmentRange || !operatingPlan || !submittedAt || !updatedAt) return null;
  return { id, entityId, status, siteReadiness, applicantOperatorId, applicantName, applicantEmail, originatingUnitId, targetMarket, preferredTimeline, investmentRange, operatingPlan, submittedAt, updatedAt, provisionedUnitId: text(data, "provisionedUnitId") };
};

export const getExpansionApplications = async (session: PortalSession): Promise<ExpansionApplication[]> => {
  if (!firebaseDb) return [];
  if (session.role === "admin") {
    const snapshot = await firebaseDb.collectionGroup("expansionApplications").orderBy("submittedAt", "desc").limit(100).get();
    return snapshot.docs.flatMap((document): ExpansionApplication[] => {
      const entityId = document.ref.parent.parent?.id;
      const application = entityId ? parseApplication(document.id, entityId, document.data() as Record<string, unknown>) : null;
      return application ? [application] : [];
    });
  }
  const entityId = await getAuthorizedEntityId(session);
  if (!entityId) return [];
  const snapshot = await firebaseDb.collection("franchiseEntities").doc(entityId).collection("expansionApplications").orderBy("submittedAt", "desc").limit(50).get();
  return snapshot.docs.flatMap((document): ExpansionApplication[] => {
    const application = parseApplication(document.id, entityId, document.data() as Record<string, unknown>);
    return application ? [application] : [];
  });
};

export const getExpansionApplication = async (entityId: string, applicationId: string): Promise<ExpansionApplication | null> => {
  if (!firebaseDb) return null;
  const document = await firebaseDb.collection("franchiseEntities").doc(entityId).collection("expansionApplications").doc(applicationId).get();
  return document.exists ? parseApplication(document.id, entityId, document.data() as Record<string, unknown>) : null;
};

export const hasOpenMarketRequest = async (entityId: string, normalizedTargetMarket: string): Promise<boolean> => {
  if (!firebaseDb) return false;
  const snapshot = await firebaseDb.collection("franchiseEntities").doc(entityId).collection("expansionApplications").where("normalizedTargetMarket", "==", normalizedTargetMarket).limit(10).get();
  return snapshot.docs.some((document) => {
    const status = document.data().status;
    return isExpansionStatus(status) && !EXPANSION_STATUS[status].terminal;
  });
};

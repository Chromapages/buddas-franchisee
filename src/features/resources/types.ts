import type { CorporateTarget } from "@/src/features/corporate/types";

export const RESOURCE_CATEGORIES = [
  "Operations Manuals",
  "Brand & Marketing",
  "Recipes & Prep",
  "Equipment Guides",
] as const;

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

export const RESOURCE_REQUIRED_ACTIONS = ["NONE", "ACKNOWLEDGE", "RETURN_DOCUMENT"] as const;

export type ResourceRequiredAction = (typeof RESOURCE_REQUIRED_ACTIONS)[number];

export type ResourcePublicationState = "DRAFT" | "PUBLISHED" | "WITHDRAWN";

export type ResourceDeliveryState = "PUBLISHED" | "ACKNOWLEDGED" | "RETURN_SUBMITTED" | "CHANGES_REQUESTED" | "ACCEPTED";

export type ResourceDocument = {
  sanityAssetId: string;
  url: string;
  mimeType: string;
  size: number;
  filename: string;
};

export type CorporateResourcePublication = {
  id: string;
  title: string;
  category: ResourceCategory;
  version: string;
  state: ResourcePublicationState;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
  requiredAction: ResourceRequiredAction;
  instructions?: string;
  dueAt?: string;
  locationIds: string[];
  scopeTargets: CorporateTarget[];
  recipientCount: number;
  document?: ResourceDocument;
};

export type ResourceDelivery = CorporateTarget & {
  locationId: string;
  locationName: string;
  locationCode: string;
  state: ResourceDeliveryState;
  publishedAt: string;
  acknowledgedAt?: string;
  returnedAt?: string;
  reviewedAt?: string;
  reviewedByName?: string;
  reviewNote?: string;
};

export type ResourceReturn = {
  id: string;
  submittedAt: string;
  submittedByName: string;
  submittedByUserId: string;
  document: ResourceDocument;
  state: "SUBMITTED" | "ACCEPTED" | "CHANGES_REQUESTED";
  reviewedAt?: string;
  reviewedByName?: string;
  reviewNote?: string;
};

export const RESOURCE_REQUIRED_ACTION_LABELS: Record<ResourceRequiredAction, string> = {
  NONE: "Reference only",
  ACKNOWLEDGE: "Acknowledgement required",
  RETURN_DOCUMENT: "Completed document required",
};

export const RESOURCE_DELIVERY_LABELS: Record<ResourceDeliveryState, string> = {
  PUBLISHED: "Waiting for response",
  ACKNOWLEDGED: "Confirmed read",
  RETURN_SUBMITTED: "Received",
  CHANGES_REQUESTED: "Changes requested",
  ACCEPTED: "Accepted",
};

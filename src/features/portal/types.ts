import type { PortalOrderStatus } from "./order-status";

export type PortalRole = "admin" | "franchisee";

export type PortalLaunchStage =
  | "PRE_OPENING"
  | "TRAINING"
  | "GRAND_OPENING"
  | "STABILIZED"
  | "REMODEL";

export type PortalStoreFormat =
  | "in-line"
  | "drive-thru"
  | "kiosk"
  | "end-cap";

export type PortalStoreStatus = "ACTIVE" | "BUILDOUT" | "REMODEL";

export type PortalTerritoryStatus = "EXCLUSIVE" | "NON_EXCLUSIVE" | "PENDING_REVIEW";

export type PortalAddress = {
  line1?: string;
  line2?: string;
  city: string;
  state: string;
  postalCode?: string;
};

export type PortalDeliveryProfile = {
  dockInstructions?: string;
  forkliftRequired?: boolean;
  liftgateRequired?: boolean;
  receivingHours?: string;
  emergencyDeliveryContact?: {
    name: string;
    phone?: string;
  };
};

export type OperationalAudience = {
  unitIds?: string[];
  markets?: string[];
  roles?: PortalRole[];
  equipmentConfigs?: string[];
  launchStages?: PortalLaunchStage[];
  storeFormats?: PortalStoreFormat[];
};

export type AudienceContext = {
  unitId: string;
  market?: string;
  role: PortalRole;
  equipmentConfig?: string[];
  launchStage?: PortalLaunchStage;
  storeFormat?: PortalStoreFormat;
};

export type TargetingRuleMatch = {
  dimension: "unit" | "market" | "role" | "equipment" | "launchStage" | "storeFormat";
  criteria: string[];
  actual?: string | string[];
};

export type TargetingEvaluation = {
  isTargeted: boolean;
  isUniversal: boolean;
  summary: string;
  reasons: string[];
  matchedRules: TargetingRuleMatch[];
  unmatchedRules: TargetingRuleMatch[];
};

export type PortalLocation = {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  franchiseeName: string;
  isOpen: boolean;
  market?: string;
  equipmentConfig?: string[];
  launchStage?: PortalLaunchStage;
  storeFormat?: PortalStoreFormat;
  address?: PortalAddress;
  storeStatus?: PortalStoreStatus;
  designatedGeneralManager?: string;
  healthInspectionCycle?: string;
  healthInspectionRenewalAt?: string;
  territoryStatus?: PortalTerritoryStatus;
  deliveryProfile?: PortalDeliveryProfile;
};

export type PortalProduct = {
  id: string;
  sku: string;
  name: string;
  category: "Bakery & Dough" | "Packaging" | "Signage & Uniforms" | "Equipment";
  description: string;
  packSize: string;
  leadTimeDays: number;
  isAvailable: boolean;
  price: number;
  slug: string;
  imageUrl?: string;
};

export type PortalOrderItem = {
  sku: string;
  name: string;
  quantity: number;
  price: number;
};

export type PortalOrder = {
  id: string;
  locationId: string;
  createdAt: string;
  status: PortalOrderStatus;
  eta: string;
  total: number;
  invoiceId: string;
  items: PortalOrderItem[];
};

export type PortalResource = {
  id: string;
  title: string;
  category: "Operations Manuals" | "Brand & Marketing" | "Recipes & Prep" | "Equipment Guides";
  version: string;
  updatedAt: string;
  fileSize: string;
  downloadUrl: string;
  locationScope?: string[];
  audience?: OperationalAudience;
};

export type PortalSupportMessage = {
  id: string;
  caseId: string;
  locationId: string;
  authorEmail: string;
  authorRole: "OPERATOR" | "SUPPORT" | "ADMIN";
  authorName?: string;
  message: string;
  createdAt: string;
};

export type PortalSupportCase = {
  id: string;
  locationId: string;
  userEmail: string;
  subject: string;
  topic: string;
  details: string;
  status: "Open" | "In Review" | "Resolved";
  createdAt: string;
  updatedAt: string;
  submittedByUserId?: string;
  operatorActionRequired: boolean;
  assignedToUserId?: string;
  resolvedAt?: string;
  reopenedAt?: string;
  messages?: PortalSupportMessage[];
};

export type PortalBulletinPriority = "ACTION_REQUIRED";

export type PortalBulletinType = "OPERATIONS" | "SUPPLY" | "BRAND" | "TRAINING";

export type PortalBulletinAttachment = {
  label: string;
  href: string;
  resourceId?: string;
};

export type PortalBulletin = {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  effectiveAt?: string;
  audience?: OperationalAudience;
  priority?: PortalBulletinPriority;
  type?: PortalBulletinType;
  attachments?: PortalBulletinAttachment[];
  acknowledgement?: {
    required: true;
    dueAt?: string;
  };
  currentUserState?: {
    readAt?: string;
    acknowledgedAt?: string;
  };
  expiresAt?: string;
  supersededById?: string;
  sourceOwner?: string;
};

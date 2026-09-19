export type CorporateBundle =
  | "operations_lead"
  | "support_handler"
  | "order_coordinator"
  | "request_approver"
  | "access_steward"
  | "leadership"
  | "content_publisher"
  | "finance_reviewer"
  | "platform_administrator"
  | "franchise_development"
  | "location_steward";

export type IdentityClass = "CORPORATE" | "OPERATOR";

export type CorporatePermission =
  | "VIEW_WORK" | "VIEW_SUPPORT" | "MANAGE_SUPPORT" | "ASSIGN_SUPPORT"
  | "VIEW_INTERNAL_NOTES" | "WRITE_INTERNAL_NOTES"
  | "VIEW_REQUESTS" | "MANAGE_REQUESTS" | "APPROVE_REQUESTS"
  | "VIEW_ORDERS" | "COORDINATE_ORDERS"
  | "VIEW_DIRECTORY" | "MANAGE_ACCESS"
  | "VIEW_RESOURCES" | "PUBLISH_RESOURCES"
  | "VIEW_AUDIT" | "VIEW_RECOVERY" | "MANAGE_RECOVERY"
  | "VIEW_FINANCIAL_REFERENCES" | "EXPORT_SUMMARIES" | "VIEW_REPORTS"
  | "MANAGE_PLATFORM_SETTINGS" | "MANAGE_CATALOG"
  | "MANAGE_LOCATIONS" | "VERIFY_LOCATIONS" | "MANAGE_LOCATION_ASSIGNMENTS"
  | "VIEW_INQUIRIES" | "ASSIGN_INQUIRIES" | "MANAGE_INQUIRIES"
  | "RECORD_INQUIRY_DECISION" | "VIEW_INQUIRY_PII" | "EXPORT_INQUIRIES";

/** An omitted scope never means corporate-wide access. */
export type CorporateScope =
  | { type: "corporate" }
  | { type: "organizations"; organizationIds: string[] }
  | { type: "regions"; regionIds: string[] }
  | { type: "locations"; locationIds: string[] };

export type CorporateTarget = { organizationId?: string; regionId?: string; locationId?: string };

export type CorporateMembership = {
  id: string;
  bundle: CorporateBundle;
  status: "ACTIVE" | "SUSPENDED";
  scope: CorporateScope;
  startsAt?: string;
  expiresAt?: string;
};

export type CorporateSession = {
  userId: string;
  email: string;
  displayName: string;
  identityClass: "CORPORATE";
  expiresAt: number;
  memberships: CorporateMembership[];
  isDevelopmentPreview: boolean;
};

export type CorporatePerson = {
  id: string;
  email: string;
  displayName: string;
  identityClass: IdentityClass;
  status: "ACTIVE" | "INVITED" | "SUSPENDED";
  memberships: CorporateMembership[];
  version: number;
  updatedAt: string;
};

export type CorporateOrganization = {
  id: string;
  name: string;
  verificationStatus: "VERIFIED" | "UNVERIFIED";
  locationIds: string[];
};

export type CorporateLocation = {
  id: string;
  organizationId?: string;
  regionId?: string;
  name: string;
  code: string;
  market?: string;
  status: string;
  operatingStatus?: "UNKNOWN" | "DRAFT" | "PRE_OPENING" | "ACTIVE" | "SUSPENDED" | "CLOSED";
  verificationStatus?: "NOT_REVIEWED" | "IN_REVIEW" | "VERIFIED" | "CHANGES_REQUIRED";
  verificationReason?: string;
  address?: { line1: string; line2?: string; city: string; state: string; postalCode?: string; country: string };
  timeZone?: string;
  openingDate?: string;
  version?: number;
};

export type CorporateRegion = {
  id: string;
  name: string;
  locationIds: string[];
  status: "ACTIVE" | "INACTIVE";
};

export type WorkRecordType = "support" | "request" | "order" | "access" | "inquiry";
export type WorkPriority = "NORMAL" | "HIGH" | "URGENT";

/** Shared queue fields only; each domain retains its own authoritative state. */
export type WorkRecord = {
  id: string;
  reference: string;
  type: WorkRecordType;
  subject: string;
  organizationId?: string;
  regionId?: string;
  locationId?: string;
  locationName?: string;
  state: string;
  isClosed: boolean;
  teamId: string;
  assignedToUserId?: string;
  assignedToName?: string;
  priority: WorkPriority;
  nextAction: string;
  waitingReason?: string;
  followUpAt?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  href: string;
};

export type CorporatePublicMessage = {
  id: string;
  recordId: string;
  authorId: string;
  authorName: string;
  authorType: "OPERATOR" | "CORPORATE";
  text: string;
  createdAt: string;
};

export type CorporatePrivateNote = {
  id: string;
  recordId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
};

export type CorporateAuditEvent = CorporateTarget & {
  scopeTargets?: CorporateTarget[];
  id: string;
  recordId: string;
  recordType: WorkRecordType | "membership" | "resource" | "catalog";
  actorId: string;
  actorName: string;
  action: string;
  occurredAt: string;
  commandId: string;
  previousVersion: number | null;
  nextVersion: number;
  changes: Record<string, { before: string | number | boolean | null; after: string | number | boolean | null }>;
};

export type DeliveryIntent = CorporateTarget & {
  scopeTargets?: CorporateTarget[];
  id: string;
  recordId: string;
  eventId: string;
  recipientId: string;
  channel: "IN_APP" | "EMAIL" | "EXTERNAL";
  status: "PENDING" | "DELIVERED" | "RETRY_DUE" | "UNKNOWN_OUTCOME" | "NEEDS_REVIEW";
  attempts: number;
  createdAt: string;
  nextAttemptAt?: string;
  lastError?: string;
  ownerTeamId: string;
  /** Minimal notification text only. Never include internal notes or private files. */
  summary: string;
  href: string;
};

export type CorporateResource = CorporateTarget & {
  id: string;
  title: string;
  category: string;
  version: string;
  state: "DRAFT" | "APPROVED" | "PUBLISHED" | "WITHDRAWN";
  ownerName: string;
  updatedAt: string;
};

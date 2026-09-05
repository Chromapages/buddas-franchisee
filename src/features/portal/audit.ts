import type { PortalSession } from "../../lib/auth/auth-provider.ts";
import { firebaseDb } from "../../lib/firebase/admin.ts";

export type PortalAuditAction =
  | "SUPPLY_ORDER_ACCEPTED"
  | "ORDER_CANCELLED"
  | "UNIT_CHANGED"
  | "SUPPORT_TICKET_CREATED"
  | "SUPPORT_TICKET_UPDATED"
  | "BULLETIN_ACKNOWLEDGED"
  | "ROLE_PERMISSION_CHANGED"
  | "ACCOUNT_CHANGED"
  | "PASSWORD_RESET_REQUESTED"
  | "OPERATOR_LOGGED_IN"
  | "OPERATOR_LOGGED_OUT"
  | "FINANCIAL_DOCUMENT_DOWNLOADED"
  | "FOOD_SAFETY_CREDENTIAL_SUBMITTED"
  | "BRAND_STANDARD_SIGNED"
  | "EXPANSION_APPLICATION_SUBMITTED"
  | "EXPANSION_APPLICATION_STAGE_CHANGED"
  | "EXPANSION_UNIT_PROVISIONED";

export type PortalAuditOutcome = "SUCCESS" | "DENIED" | "FAILURE";

export type PortalAuditActor = {
  userId: string;
  email?: string;
  role?: string;
  locationId?: string;
};

export type PortalAuditRecord = {
  id?: string;
  actor: PortalAuditActor;
  unitId?: string;
  resourceType: string;
  resourceId?: string;
  action: PortalAuditAction;
  outcome: PortalAuditOutcome;
  timestamp: string;
  metadata?: Record<string, unknown>;
};

export type RecordPortalAuditParams = {
  actor: PortalSession | PortalAuditActor;
  action: PortalAuditAction;
  outcome: PortalAuditOutcome;
  unitId?: string;
  resourceType?: string;
  resourceId?: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
};

const SENSITIVE_KEY_REGEX = /(password|secret|token|cookie|credential|authorization|bearer|card|cvv|hash|key|ssn)/i;

export const sanitizeAuditPayload = <T>(payload: T): T => {
  if (payload === null || payload === undefined) {
    return payload;
  }

  if (typeof payload === "string") {
    if (payload.length > 500) {
      return (payload.slice(0, 497) + "...") as unknown as T;
    }
    return payload;
  }

  if (typeof payload !== "object") {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizeAuditPayload(item)) as unknown as T;
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (SENSITIVE_KEY_REGEX.test(key)) {
      sanitized[key] = "[REDACTED]";
      continue;
    }
    sanitized[key] = sanitizeAuditPayload(value);
  }
  return sanitized as T;
};

const inMemoryAuditLog: PortalAuditRecord[] = [];

export const getPortalAuditTrail = async (): Promise<readonly PortalAuditRecord[]> => {
  return inMemoryAuditLog.map((entry) => Object.freeze({ ...entry }));
};

export const clearPortalAuditTrailForTesting = (): void => {
  inMemoryAuditLog.length = 0;
};

export const recordPortalAudit = async ({
  actor,
  action,
  outcome,
  unitId,
  resourceType,
  resourceId,
  referenceId,
  metadata,
}: RecordPortalAuditParams): Promise<PortalAuditRecord> => {
  const actorObj: PortalAuditActor = {
    userId: actor.userId,
    email: actor.email,
    role: actor.role,
    locationId: actor.locationId,
  };
  const effectiveUnitId = unitId ?? actor.locationId;
  const effectiveResourceId = resourceId ?? referenceId;
  const effectiveResourceType = resourceType ?? "operator_workspace";
  const timestamp = new Date().toISOString();
  const sanitizedMetadata = metadata ? sanitizeAuditPayload(metadata) : undefined;

  const record: PortalAuditRecord = {
    id: `audit-${inMemoryAuditLog.length + 1}`,
    actor: actorObj,
    unitId: effectiveUnitId,
    resourceType: effectiveResourceType,
    resourceId: effectiveResourceId,
    action,
    outcome,
    timestamp,
    metadata: sanitizedMetadata,
  };

  inMemoryAuditLog.push(record);

  if (firebaseDb) {
    try {
      await firebaseDb.collection("auditEvents").add({
        actorId: actorObj.userId,
        actorEmail: actorObj.email || null,
        actorRole: actorObj.role || null,
        unitId: effectiveUnitId || null,
        resourceType: effectiveResourceType,
        resourceId: effectiveResourceId || null,
        action,
        outcome,
        referenceId: effectiveResourceId || null,
        metadata: sanitizedMetadata || null,
        createdAt: timestamp,
      });
      return record;
    } catch (error) {
      console.error("Firebase audit write failed", { action, outcome, effectiveResourceId });
      return record;
    }
  }

  if (!process.env.DATABASE_URL) return record;

  try {
    const dynamicImport = new Function("specifier", "return import(specifier)");
    const pg = await dynamicImport("pg");
    const Pool = pg.default?.Pool || pg.Pool;
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query(
      `INSERT INTO portal_audit_log (actor_id, actor_email, actor_role, unit_id, resource_type, resource_id, action, outcome, reference_id, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        actorObj.userId,
        actorObj.email || null,
        actorObj.role || null,
        effectiveUnitId || null,
        effectiveResourceType,
        effectiveResourceId || null,
        action,
        outcome,
        effectiveResourceId || null,
        sanitizedMetadata ? JSON.stringify(sanitizedMetadata) : null,
        timestamp,
      ],
    );
  } catch (error) {
    console.error("Portal audit write failed", { action, outcome, effectiveResourceId });
  }

  return record;
};

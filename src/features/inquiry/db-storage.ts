import type { IInquiryStorage, StoredInquiry, InquiryDeliveryStatus, InquiryRouting, InquiryWorkflow } from "./types.ts";
import type { InquiryValues } from "./schema.ts";

const normalizeStoredInquiry = (row: unknown): StoredInquiry => {
  const record = row as Partial<StoredInquiry>;
  const routing = (record.routing && typeof record.routing === "object" ? record.routing : {}) as Partial<InquiryRouting>;
  const workflow = (record.workflow && typeof record.workflow === "object" ? record.workflow : {}) as Partial<InquiryWorkflow>;
  return {
    ...record,
    id: String(record.id || ""),
    submittedAt: String(record.submittedAt || ""),
    classification: record.classification || "GENERAL_INQUIRY",
    deliveryStatus: record.deliveryStatus || "PENDING",
    payload: record.payload && typeof record.payload === "object" ? record.payload : {},
    attempts: Number.isSafeInteger(record.attempts) ? record.attempts : 1,
    version: Number.isSafeInteger(record.version) ? record.version : 1,
    routing: {
      status: routing.status === "ROUTED" ? "ROUTED" : routing.status === "NEEDS_REVIEW" ? "NEEDS_REVIEW" : "UNROUTABLE",
      teamId: typeof routing.teamId === "string" ? routing.teamId : "franchise-development-intake",
      ruleId: typeof routing.ruleId === "string" ? routing.ruleId : "legacy-unrouted",
      ruleVersion: typeof routing.ruleVersion === "string" ? routing.ruleVersion : "0",
      reason: typeof routing.reason === "string" ? routing.reason : "This existing inquiry needs franchise-development routing review.",
      routedAt: typeof routing.routedAt === "string" ? routing.routedAt : String(record.submittedAt || ""),
      ...(typeof routing.regionId === "string" ? { regionId: routing.regionId } : {}),
      ...(typeof routing.overriddenByUserId === "string" ? { overriddenByUserId: routing.overriddenByUserId } : {}),
      ...(typeof routing.overrideReason === "string" ? { overrideReason: routing.overrideReason } : {}),
      history: Array.isArray(routing.history) ? routing.history.filter((item): item is InquiryRouting["history"][number] => Boolean(item) && typeof item === "object" && typeof (item as { id?: unknown }).id === "string" && typeof (item as { action?: unknown }).action === "string" && typeof (item as { occurredAt?: unknown }).occurredAt === "string") : [],
    },
    workflow: {
      status: ["NEW", "ASSIGNED", "CONTACTING", "ENGAGED", "ON_HOLD", "CLOSED"].includes(String(workflow.status)) ? workflow.status as StoredInquiry["workflow"]["status"] : "NEW",
      decision: ["PENDING", "ADVANCE", "HOLD", "NOT_PROCEEDING"].includes(String(workflow.decision)) ? workflow.decision as StoredInquiry["workflow"]["decision"] : "PENDING",
      nextAction: typeof workflow.nextAction === "string" ? workflow.nextAction : "Review routing and assign an owner",
      updatedAt: typeof workflow.updatedAt === "string" ? workflow.updatedAt : String(record.submittedAt || ""),
      ...(typeof workflow.decisionNote === "string" ? { decisionNote: workflow.decisionNote } : {}),
      ...(typeof workflow.decidedByUserId === "string" ? { decidedByUserId: workflow.decidedByUserId } : {}),
      ...(typeof workflow.decidedByName === "string" ? { decidedByName: workflow.decidedByName } : {}),
      ...(typeof workflow.assignedToUserId === "string" ? { assignedToUserId: workflow.assignedToUserId } : {}),
      ...(typeof workflow.assignedToName === "string" ? { assignedToName: workflow.assignedToName } : {}),
      ...(typeof workflow.followUpAt === "string" ? { followUpAt: workflow.followUpAt } : {}),
      history: Array.isArray(workflow.history) ? workflow.history.filter((item): item is InquiryWorkflow["history"][number] => Boolean(item) && typeof item === "object" && typeof (item as { id?: unknown }).id === "string" && typeof (item as { action?: unknown }).action === "string" && typeof (item as { occurredAt?: unknown }).occurredAt === "string") : [],
    },
  };
};

export type ParameterizedQuery = {
  text: string;
  values: unknown[];
};

export const buildInsertInquiryQuery = (
  inquiry: StoredInquiry,
): ParameterizedQuery => {
  const payload = inquiry.payload as unknown as InquiryValues;

  const text = `
    INSERT INTO franchise_inquiries (
      id, submitted_at, classification, delivery_status,
      first_name, last_name, email, phone, city_state, target_state,
      market_interest, investment_range, preferred_timeline,
      experience, message, broker_id, attribution, payload, attempts, last_error,
      version, routing, workflow
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
    ON CONFLICT (id) DO UPDATE SET
      attempts = franchise_inquiries.attempts + 1,
      updated_at = NOW()
  `.trim();

  const values = [
    inquiry.id,
    inquiry.submittedAt,
    inquiry.classification,
    inquiry.deliveryStatus,
    payload?.firstName || null,
    payload?.lastName || null,
    payload?.email || null,
    payload?.phone || null,
    payload?.cityState || null,
    payload?.targetState || null,
    payload?.marketInterest || null,
    payload?.investmentRange || null,
    payload?.preferredTimeline || null,
    payload?.experience || null,
    payload?.message || null,
    inquiry.brokerId || null,
    Object.keys(inquiry.attribution || {}).length ? JSON.stringify(inquiry.attribution) : null,
    JSON.stringify(inquiry.payload),
    inquiry.attempts || 1,
    inquiry.lastError || null,
    inquiry.version,
    JSON.stringify(inquiry.routing),
    JSON.stringify(inquiry.workflow),
  ];

  return { text, values };
};

export const buildUpdateInquiryStatusQuery = (
  id: string,
  status: InquiryDeliveryStatus,
  error?: string,
): ParameterizedQuery => {
  const text = `
    UPDATE franchise_inquiries
    SET delivery_status = $1,
        last_error = $2,
        updated_at = NOW()
    WHERE id = $3
  `.trim();

  return { text, values: [status, error || null, id] };
};

export const buildSelectInquiryByIdQuery = (id: string): ParameterizedQuery => {
  const text = `
    SELECT id, submitted_at as "submittedAt", classification,
           delivery_status as "deliveryStatus", payload, attribution, attempts,
           last_error as "lastError", broker_id as "brokerId", version, routing, workflow
    FROM franchise_inquiries
    WHERE id = $1
  `.trim();

  return { text, values: [id] };
};

export class DatabaseInquiryStorage implements IInquiryStorage {
  private connectionString?: string;

  constructor(connectionString?: string) {
    this.connectionString = connectionString || process.env.DATABASE_URL;
  }

  private async getPool(): Promise<{ query: (text: string, values?: unknown[]) => Promise<{ rows: unknown[] }> } | null> {
    if (!this.connectionString) return null;
    try {
      const dynamicImport = new Function('specifier', 'return import(specifier)');
      const pg = await dynamicImport("pg");
      const Pool = pg.default?.Pool || pg.Pool;
      return new Pool({ connectionString: this.connectionString });
    } catch {
      return null;
    }
  }

  public async save(inquiry: StoredInquiry): Promise<void> {
    const pool = await this.getPool();
    if (!pool) throw new Error("Durable franchise inquiry storage is unavailable.");
    const query = buildInsertInquiryQuery(inquiry);
    await pool.query(query.text, query.values);
  }

  public async updateStatus(
    id: string,
    status: InquiryDeliveryStatus,
    error?: string,
  ): Promise<void> {
    const pool = await this.getPool();
    if (!pool) throw new Error("Durable franchise inquiry storage is unavailable.");
    const query = buildUpdateInquiryStatusQuery(id, status, error);
    await pool.query(query.text, query.values);
  }

  public async getById(id: string): Promise<StoredInquiry | null> {
    const pool = await this.getPool();
    if (!pool) throw new Error("Durable franchise inquiry storage is unavailable.");
    const query = buildSelectInquiryByIdQuery(id);
    const result = await pool.query(query.text, query.values);
    if (!result.rows[0]) return null;
    return normalizeStoredInquiry(result.rows[0]);
  }

  public async getAll(): Promise<StoredInquiry[]> {
    const pool = await this.getPool();
    if (!pool) throw new Error("Durable franchise inquiry storage is unavailable.");
    const result = await pool.query(
      `SELECT id, submitted_at as "submittedAt", classification, delivery_status as "deliveryStatus", payload, attribution, attempts, last_error as "lastError", broker_id as "brokerId", version, routing, workflow FROM franchise_inquiries ORDER BY submitted_at DESC LIMIT 100`,
    );
    return result.rows.map(normalizeStoredInquiry);
  }

  public async updateRouting(id: string, expectedVersion: number, routing: InquiryRouting): Promise<StoredInquiry | null> {
    return this.updateVersionedRecord(id, expectedVersion, "routing", routing);
  }

  public async updateWorkflow(id: string, expectedVersion: number, workflow: InquiryWorkflow): Promise<StoredInquiry | null> {
    return this.updateVersionedRecord(id, expectedVersion, "workflow", workflow);
  }

  private async updateVersionedRecord(id: string, expectedVersion: number, field: "routing" | "workflow", value: InquiryRouting | InquiryWorkflow): Promise<StoredInquiry | null> {
    const pool = await this.getPool();
    if (!pool) throw new Error("Durable franchise inquiry storage is unavailable.");
    const result = await pool.query(
      `UPDATE franchise_inquiries SET ${field} = $1, version = version + 1, updated_at = NOW() WHERE id = $2 AND version = $3 RETURNING id, submitted_at as "submittedAt", classification, delivery_status as "deliveryStatus", payload, attribution, attempts, last_error as "lastError", broker_id as "brokerId", version, routing, workflow`,
      [JSON.stringify(value), id, expectedVersion],
    );
    return result.rows[0] ? normalizeStoredInquiry(result.rows[0]) : null;
  }
}

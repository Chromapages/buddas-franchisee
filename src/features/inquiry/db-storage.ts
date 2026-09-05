import type { IInquiryStorage, StoredInquiry, InquiryDeliveryStatus } from "./types.ts";
import type { InquiryValues } from "./schema.ts";

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
      first_name, last_name, email, phone, city_state,
      market_interest, investment_range, preferred_timeline,
      experience, message, broker_id, attribution, payload, attempts, last_error
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
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
           last_error as "lastError", broker_id as "brokerId"
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
    if (!pool) return;
    const query = buildInsertInquiryQuery(inquiry);
    await pool.query(query.text, query.values);
  }

  public async updateStatus(
    id: string,
    status: InquiryDeliveryStatus,
    error?: string,
  ): Promise<void> {
    const pool = await this.getPool();
    if (!pool) return;
    const query = buildUpdateInquiryStatusQuery(id, status, error);
    await pool.query(query.text, query.values);
  }

  public async getById(id: string): Promise<StoredInquiry | null> {
    const pool = await this.getPool();
    if (!pool) return null;
    const query = buildSelectInquiryByIdQuery(id);
    const result = await pool.query(query.text, query.values);
    if (!result.rows[0]) return null;
    return result.rows[0] as StoredInquiry;
  }

  public async getAll(): Promise<StoredInquiry[]> {
    const pool = await this.getPool();
    if (!pool) return [];
    const result = await pool.query(
      `SELECT id, submitted_at as "submittedAt", classification, delivery_status as "deliveryStatus", payload, attribution, attempts, last_error as "lastError", broker_id as "brokerId" FROM franchise_inquiries ORDER BY submitted_at DESC LIMIT 100`,
    );
    return result.rows as StoredInquiry[];
  }
}

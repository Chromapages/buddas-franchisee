import type { FddReceipt } from "./types.ts";

export type ParameterizedQuery = {
  text: string;
  values: unknown[];
};

export const buildInsertFddReceiptQuery = (
  receipt: Omit<FddReceipt, "status">,
): ParameterizedQuery => {
  const text = `
    INSERT INTO fdd_receipts (
      receipt_id, token, inquiry_id, prospect_name, prospect_email,
      fdd_version, status, issued_at, expires_at
    ) VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7, $8)
  `.trim();

  return {
    text,
    values: [
      receipt.id,
      receipt.token,
      receipt.inquiryId || null,
      receipt.prospectName,
      receipt.prospectEmail,
      receipt.fddVersion,
      receipt.issuedAt,
      receipt.expiresAt,
    ],
  };
};

export const buildSelectFddReceiptByTokenQuery = (
  token: string,
): ParameterizedQuery => {
  const text = `
    SELECT receipt_id as "id", token, inquiry_id as "inquiryId",
           prospect_name as "prospectName", prospect_email as "prospectEmail",
           fdd_version as "fddVersion", status,
           signature_legal_name as "signatureLegalName",
           signed_at as "signedAt", issued_at as "issuedAt",
           expires_at as "expiresAt", ip_address as "ipAddress",
           user_agent as "userAgent"
    FROM fdd_receipts
    WHERE token = $1
  `.trim();

  return { text, values: [token] };
};

export const buildSignFddReceiptQuery = (
  token: string,
  legalName: string,
  ipAddress?: string,
  userAgent?: string,
): ParameterizedQuery => {
  const text = `
    UPDATE fdd_receipts
    SET status = 'SIGNED',
        signature_legal_name = $2,
        signed_at = NOW(),
        ip_address = $3,
        user_agent = $4,
        updated_at = NOW()
    WHERE token = $1 AND status = 'PENDING'
    RETURNING receipt_id as "id", token, inquiry_id as "inquiryId",
              prospect_name as "prospectName", prospect_email as "prospectEmail",
              fdd_version as "fddVersion", status,
              signature_legal_name as "signatureLegalName",
              signed_at as "signedAt", issued_at as "issuedAt",
              expires_at as "expiresAt", ip_address as "ipAddress",
              user_agent as "userAgent"
  `.trim();

  return {
    text,
    values: [token, legalName, ipAddress || null, userAgent || null],
  };
};

export class DatabaseFddStorage {
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

  public async createReceipt(
    receipt: Omit<FddReceipt, "status">,
  ): Promise<FddReceipt> {
    const pool = await this.getPool();
    if (!pool) {
      return { ...receipt, status: "PENDING" };
    }
    const query = buildInsertFddReceiptQuery(receipt);
    await pool.query(query.text, query.values);
    return { ...receipt, status: "PENDING" };
  }

  public async getReceiptByToken(token: string): Promise<FddReceipt | null> {
    const pool = await this.getPool();
    if (!pool) return null;
    const query = buildSelectFddReceiptByTokenQuery(token);
    const result = await pool.query(query.text, query.values);
    return (result.rows[0] as FddReceipt) || null;
  }

  public async recordSignature(
    token: string,
    legalName: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<FddReceipt | null> {
    const pool = await this.getPool();
    if (!pool) return null;
    const query = buildSignFddReceiptQuery(token, legalName, ipAddress, userAgent);
    const result = await pool.query(query.text, query.values);
    return (result.rows[0] as FddReceipt) || null;
  }
}

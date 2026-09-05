import type {
  PortalBulletin,
  PortalLocation,
  PortalOrder,
  PortalOrderItem,
  PortalProduct,
  PortalResource,
  PortalRole,
  PortalSupportCase,
  PortalSupportMessage,
  TargetingEvaluation,
} from "./types.ts";
import { normalizeOrderStatus, serializeOrderStatus } from "./order-status.ts";
import { buildAudienceContext, evaluateAudienceTargeting } from "./targeting.ts";
import type { PortalSession } from "../../lib/auth/auth-provider.ts";

export type ParameterizedQuery = {
  text: string;
  values: unknown[];
};

export const buildSelectLocationsQuery = (): ParameterizedQuery => {
  const text = `
    SELECT location_id as "id", name, address, phone,
           franchisee_name as "franchiseeName", tier,
           delivery_address as "deliveryAddress", is_active as "isActive"
    FROM portal_locations
    WHERE is_active = true
    ORDER BY name ASC
  `.trim();
  return { text, values: [] };
};

export const buildSelectLocationByIdQuery = (id: string): ParameterizedQuery => {
  const text = `
    SELECT location_id as "id", name, address, phone,
           franchisee_name as "franchiseeName", tier,
           delivery_address as "deliveryAddress", is_active as "isActive"
    FROM portal_locations
    WHERE location_id = $1
  `.trim();
  return { text, values: [id] };
};

export const buildSelectProductsByLocationQuery = (
  locationId: string,
): ParameterizedQuery => {
  const text = `
    SELECT p.sku, p.name, p.category, p.description,
           p.pack_size as "packSize", p.lead_time_days as "leadTimeDays",
           p.slug, pp.price
    FROM portal_products p
    JOIN portal_product_prices pp ON p.sku = pp.sku
    WHERE pp.location_id = $1 AND p.is_active = true
    ORDER BY p.category ASC, p.name ASC
  `.trim();
  return { text, values: [locationId] };
};

export const buildSelectOrdersByLocationQuery = (
  locationId: string,
): ParameterizedQuery => {
  const text = `
    SELECT o.order_id as "id", o.location_id as "locationId",
           o.created_at as "createdAt", o.status, o.eta,
           o.total, o.invoice_id as "invoiceId",
           COALESCE(
             json_agg(
               json_build_object(
                 'sku', oi.sku,
                 'name', oi.name,
                 'quantity', oi.quantity,
                 'price', oi.price
               )
             ) FILTER (WHERE oi.sku IS NOT NULL), '[]'
           ) as items
    FROM portal_orders o
    LEFT JOIN portal_order_items oi ON o.order_id = oi.order_id
    WHERE o.location_id = $1
    GROUP BY o.order_id, o.location_id, o.created_at, o.status, o.eta, o.total, o.invoice_id
    ORDER BY o.created_at DESC
  `.trim();
  return { text, values: [locationId] };
};

export const buildSelectOrderByIdQuery = (
  orderId: string,
): ParameterizedQuery => {
  const text = `
    SELECT o.order_id as "id", o.location_id as "locationId",
           o.created_at as "createdAt", o.status, o.eta,
           o.total, o.invoice_id as "invoiceId",
           COALESCE(
             json_agg(
               json_build_object(
                 'sku', oi.sku,
                 'name', oi.name,
                 'quantity', oi.quantity,
                 'price', oi.price
               )
             ) FILTER (WHERE oi.sku IS NOT NULL), '[]'
           ) as items
    FROM portal_orders o
    LEFT JOIN portal_order_items oi ON o.order_id = oi.order_id
    WHERE o.order_id = $1
    GROUP BY o.order_id, o.location_id, o.created_at, o.status, o.eta, o.total, o.invoice_id
  `.trim();
  return { text, values: [orderId] };
};

export const buildCancelOrderQuery = (
  orderId: string,
): ParameterizedQuery => {
  const text = `
    UPDATE portal_orders
    SET status = 'CANCELLED'
    WHERE order_id = $1
    RETURNING order_id as "id", location_id as "locationId", created_at as "createdAt", status, eta, total, invoice_id as "invoiceId"
  `.trim();
  return { text, values: [orderId] };
};

export const buildInsertOrderQuery = (
  order: PortalOrder,
): ParameterizedQuery => {
  const text = `
    INSERT INTO portal_orders (
      order_id, location_id, created_at, status, eta, total, invoice_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  `.trim();
  return {
    text,
    values: [
      order.id,
      order.locationId,
      order.createdAt,
      serializeOrderStatus(order.status),
      order.eta,
      order.total,
      order.invoiceId,
    ],
  };
};

export const buildInsertOrderItemQuery = (
  orderId: string,
  item: PortalOrderItem,
): ParameterizedQuery => {
  const text = `
    INSERT INTO portal_order_items (
      order_id, sku, name, quantity, price
    ) VALUES ($1, $2, $3, $4, $5)
  `.trim();
  return {
    text,
    values: [orderId, item.sku, item.name, item.quantity, item.price],
  };
};

export const buildSelectResourcesByLocationQuery = (
  locationId: string,
): ParameterizedQuery => {
  const text = `
    SELECT resource_id as "id", title, category, version,
           updated_at as "updatedAt", download_url as "downloadUrl",
           file_size as "fileSize", location_scope as "locationScope"
    FROM portal_resources
    WHERE location_scope IS NULL OR $1 = ANY(location_scope)
    ORDER BY category ASC, title ASC
  `.trim();
  return { text, values: [locationId] };
};

export const buildInsertSupportCaseQuery = (ticket: {
  id: string;
  locationId: string;
  userEmail: string;
  subject: string;
  topic: string;
  details: string;
  submittedByUserId?: string;
}): ParameterizedQuery => {
  const text = `
    INSERT INTO portal_support_cases (
      case_id, location_id, user_email, submitted_by_user_id, subject, topic, details, status, operator_action_required, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Open', FALSE, NOW(), NOW())
  `.trim();
  return {
    text,
    values: [
      ticket.id,
      ticket.locationId,
      ticket.userEmail,
      ticket.submittedByUserId || null,
      ticket.subject,
      ticket.topic,
      ticket.details,
    ],
  };
};

export const buildSelectSupportCasesByLocationQuery = (
  locationId: string,
): ParameterizedQuery => {
  const text = `
    SELECT c.case_id as "id", c.location_id as "locationId", c.user_email as "userEmail",
           c.submitted_by_user_id as "submittedByUserId", c.subject, c.topic, c.details,
           c.status, c.operator_action_required as "operatorActionRequired",
           c.assigned_to_user_id as "assignedToUserId",
           c.created_at as "createdAt", c.updated_at as "updatedAt",
           c.resolved_at as "resolvedAt", c.reopened_at as "reopenedAt"
    FROM portal_support_cases c
    WHERE c.location_id = $1
    ORDER BY c.updated_at DESC
  `.trim();
  return { text, values: [locationId] };
};

export const buildSelectSupportCaseByIdQuery = (
  caseId: string,
  locationId: string,
): ParameterizedQuery => {
  const text = `
    SELECT c.case_id as "id", c.location_id as "locationId", c.user_email as "userEmail",
           c.submitted_by_user_id as "submittedByUserId", c.subject, c.topic, c.details,
           c.status, c.operator_action_required as "operatorActionRequired",
           c.assigned_to_user_id as "assignedToUserId",
           c.created_at as "createdAt", c.updated_at as "updatedAt",
           c.resolved_at as "resolvedAt", c.reopened_at as "reopenedAt"
    FROM portal_support_cases c
    WHERE c.case_id = $1 AND c.location_id = $2
  `.trim();
  return { text, values: [caseId, locationId] };
};

export const buildSelectSupportMessagesQuery = (
  caseId: string,
  locationId: string,
): ParameterizedQuery => {
  const text = `
    SELECT message_id as "id", case_id as "caseId", location_id as "locationId",
           author_email as "authorEmail", author_role as "authorRole",
           author_name as "authorName", message, created_at as "createdAt"
    FROM portal_support_messages
    WHERE case_id = $1 AND location_id = $2
    ORDER BY created_at ASC
  `.trim();
  return { text, values: [caseId, locationId] };
};

export const buildInsertSupportMessageQuery = (
  messageId: string,
  caseId: string,
  locationId: string,
  authorEmail: string,
  authorRole: "OPERATOR" | "SUPPORT" | "ADMIN",
  authorName: string | undefined,
  message: string,
): ParameterizedQuery => {
  const text = `
    INSERT INTO portal_support_messages (
      message_id, case_id, location_id, author_email, author_role, author_name, message, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
  `.trim();
  return {
    text,
    values: [
      messageId,
      caseId,
      locationId,
      authorEmail,
      authorRole,
      authorName || null,
      message,
    ],
  };
};

export const buildUpdateSupportCaseStatusQuery = (
  caseId: string,
  status: "Open" | "In Review" | "Resolved",
  locationId?: string,
): ParameterizedQuery => {
  if (locationId) {
    const text = `
      UPDATE portal_support_cases
      SET status = $2,
          updated_at = NOW(),
          operator_action_required = CASE WHEN $2 = 'Resolved' THEN FALSE ELSE operator_action_required END,
          resolved_at = CASE WHEN $2 = 'Resolved' THEN NOW() ELSE resolved_at END
      WHERE case_id = $1 AND location_id = $3
    `.trim();
    return { text, values: [caseId, status, locationId] };
  }
  const text = `
    UPDATE portal_support_cases
    SET status = $2,
        updated_at = NOW(),
        operator_action_required = CASE WHEN $2 = 'Resolved' THEN FALSE ELSE operator_action_required END,
        resolved_at = CASE WHEN $2 = 'Resolved' THEN NOW() ELSE resolved_at END
    WHERE case_id = $1
  `.trim();
  return { text, values: [caseId, status] };
};

export const buildSelectBulletinsQuery = (session: Pick<PortalSession, "managedLocationIds" | "role">): ParameterizedQuery => {
  const text = `
    SELECT announcement_id as "id", title, body as "summary",
           published_at as "publishedAt",
           effective_at as "effectiveAt", audience_unit_ids as "audienceUnitIds",
           audience_roles as "audienceRoles", expires_at as "expiresAt",
           superseded_by_id as "supersededById", source_owner as "sourceOwner",
           CASE WHEN is_urgent THEN 'ACTION_REQUIRED' END as "priority"
    FROM portal_announcements
    WHERE (audience_unit_ids IS NULL OR audience_unit_ids && $1::text[])
      AND (audience_roles IS NULL OR $2 = ANY(audience_roles))
      AND (expires_at IS NULL OR expires_at >= NOW())
      AND superseded_by_id IS NULL
    ORDER BY published_at DESC
  `.trim();
  return { text, values: [session.managedLocationIds, session.role] };
};

export class DatabasePortalStorage {
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

  public async getLocations(): Promise<PortalLocation[]> {
    const pool = await this.getPool();
    if (!pool) return [];
    const query = buildSelectLocationsQuery();
    const result = await pool.query(query.text, query.values);
    return result.rows as PortalLocation[];
  }

  public async getLocationById(id: string): Promise<PortalLocation | null> {
    const pool = await this.getPool();
    if (!pool) return null;
    const query = buildSelectLocationByIdQuery(id);
    const result = await pool.query(query.text, query.values);
    return (result.rows[0] as PortalLocation) || null;
  }

  public async getProductsByLocation(locationId: string): Promise<PortalProduct[]> {
    const pool = await this.getPool();
    if (!pool) return [];
    const query = buildSelectProductsByLocationQuery(locationId);
    const result = await pool.query(query.text, query.values);
    return result.rows as PortalProduct[];
  }

  public async getOrdersByLocation(locationId: string): Promise<PortalOrder[]> {
    const pool = await this.getPool();
    if (!pool) return [];
    const query = buildSelectOrdersByLocationQuery(locationId);
    const result = await pool.query(query.text, query.values);
    return (result.rows as Array<Omit<PortalOrder, "status"> & { status: unknown }>).map((order) => ({
      ...order,
      status: normalizeOrderStatus(order.status),
    }));
  }

  public async getOrderById(orderId: string): Promise<PortalOrder | null> {
    const pool = await this.getPool();
    if (!pool) return null;
    const query = buildSelectOrderByIdQuery(orderId);
    const result = await pool.query(query.text, query.values);
    const row = result.rows[0] as (Omit<PortalOrder, "status"> & { status: unknown }) | undefined;
    if (!row) return null;
    return {
      ...row,
      status: normalizeOrderStatus(row.status),
    };
  }

  public async createOrder(order: PortalOrder): Promise<void> {
    const pool = await this.getPool();
    if (!pool) return;
    const orderQuery = buildInsertOrderQuery(order);
    await pool.query(orderQuery.text, orderQuery.values);
    for (const item of order.items) {
      const itemQuery = buildInsertOrderItemQuery(order.id, item);
      await pool.query(itemQuery.text, itemQuery.values);
    }
  }

  public async cancelOrder(orderId: string, _reason?: string): Promise<PortalOrder | null> {
    const pool = await this.getPool();
    if (!pool) return null;
    const query = buildCancelOrderQuery(orderId);
    const result = await pool.query(query.text, query.values);
    const row = result.rows[0] as (Omit<PortalOrder, "status"> & { status: unknown }) | undefined;
    if (!row) return null;
    return {
      ...row,
      status: normalizeOrderStatus(row.status),
    };
  }

  public async getResourcesByLocation(locationId: string): Promise<PortalResource[]> {
    const pool = await this.getPool();
    if (!pool) return [];
    const query = buildSelectResourcesByLocationQuery(locationId);
    const result = await pool.query(query.text, query.values);
    return result.rows as PortalResource[];
  }

  public async createSupportCase(ticket: {
    id: string;
    locationId: string;
    userEmail: string;
    subject: string;
    topic: string;
    details: string;
    submittedByUserId?: string;
  }): Promise<void> {
    const pool = await this.getPool();
    if (!pool) return;
    const query = buildInsertSupportCaseQuery(ticket);
    await pool.query(query.text, query.values);
  }

  public async updateSupportCaseStatus(
    caseId: string,
    status: "Open" | "In Review" | "Resolved",
    locationId?: string,
  ): Promise<void> {
    const pool = await this.getPool();
    if (!pool) return;
    const query = buildUpdateSupportCaseStatusQuery(caseId, status, locationId);
    await pool.query(query.text, query.values);
  }

  public async getSupportCasesByLocation(locationId: string): Promise<PortalSupportCase[]> {
    const pool = await this.getPool();
    if (!pool) return [];
    const query = buildSelectSupportCasesByLocationQuery(locationId);
    const result = await pool.query(query.text, query.values);
    const cases = result.rows as PortalSupportCase[];

    for (const c of cases) {
      const msgQuery = buildSelectSupportMessagesQuery(c.id, locationId);
      const msgResult = await pool.query(msgQuery.text, msgQuery.values);
      c.messages = msgResult.rows as PortalSupportMessage[];
    }
    return cases;
  }

  public async getSupportCaseById(caseId: string, locationId: string): Promise<PortalSupportCase | null> {
    const pool = await this.getPool();
    if (!pool) return null;
    const query = buildSelectSupportCaseByIdQuery(caseId, locationId);
    const result = await pool.query(query.text, query.values);
    const supportCase = result.rows[0] as PortalSupportCase | undefined;
    if (!supportCase) return null;

    const msgQuery = buildSelectSupportMessagesQuery(caseId, locationId);
    const msgResult = await pool.query(msgQuery.text, msgQuery.values);
    supportCase.messages = msgResult.rows as PortalSupportMessage[];
    return supportCase;
  }

  public async replySupportCase(
    caseId: string,
    locationId: string,
    message: {
      authorEmail: string;
      authorRole: "OPERATOR" | "SUPPORT" | "ADMIN";
      authorName?: string;
      message: string;
    },
  ): Promise<PortalSupportCase | null> {
    const pool = await this.getPool();
    if (!pool) return null;

    const existing = await this.getSupportCaseById(caseId, locationId);
    if (!existing) return null;

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const msgQuery = buildInsertSupportMessageQuery(
      messageId,
      caseId,
      locationId,
      message.authorEmail,
      message.authorRole,
      message.authorName,
      message.message,
    );
    await pool.query(msgQuery.text, msgQuery.values);

    // Operator replying clears operatorActionRequired
    const updateText = `
      UPDATE portal_support_cases
      SET updated_at = NOW(),
          operator_action_required = CASE WHEN $3 = 'OPERATOR' THEN FALSE ELSE operator_action_required END
      WHERE case_id = $1 AND location_id = $2
    `.trim();
    await pool.query(updateText, [caseId, locationId, message.authorRole]);

    return this.getSupportCaseById(caseId, locationId);
  }

  public async closeSupportCase(
    caseId: string,
    locationId: string,
    note?: string,
  ): Promise<PortalSupportCase | null> {
    const pool = await this.getPool();
    if (!pool) return null;

    const existing = await this.getSupportCaseById(caseId, locationId);
    if (!existing) return null;

    const updateText = `
      UPDATE portal_support_cases
      SET status = 'Resolved',
          resolved_at = NOW(),
          updated_at = NOW(),
          operator_action_required = FALSE
      WHERE case_id = $1 AND location_id = $2
    `.trim();
    await pool.query(updateText, [caseId, locationId]);

    if (note && note.trim()) {
      const messageId = `msg-${Date.now()}`;
      const msgQuery = buildInsertSupportMessageQuery(
        messageId,
        caseId,
        locationId,
        existing.userEmail,
        "OPERATOR",
        undefined,
        `Resolved: ${note.trim()}`,
      );
      await pool.query(msgQuery.text, msgQuery.values);
    }

    return this.getSupportCaseById(caseId, locationId);
  }

  public async reopenSupportCase(
    caseId: string,
    locationId: string,
    reason: string,
  ): Promise<PortalSupportCase | null> {
    const pool = await this.getPool();
    if (!pool) return null;

    const existing = await this.getSupportCaseById(caseId, locationId);
    if (!existing) return null;

    const updateText = `
      UPDATE portal_support_cases
      SET status = 'Open',
          reopened_at = NOW(),
          updated_at = NOW(),
          operator_action_required = FALSE
      WHERE case_id = $1 AND location_id = $2
    `.trim();
    await pool.query(updateText, [caseId, locationId]);

    const messageId = `msg-${Date.now()}`;
    const msgQuery = buildInsertSupportMessageQuery(
      messageId,
      caseId,
      locationId,
      existing.userEmail,
      "OPERATOR",
      undefined,
      `Reopened: ${reason.trim()}`,
    );
    await pool.query(msgQuery.text, msgQuery.values);

    return this.getSupportCaseById(caseId, locationId);
  }

  public async getBulletinsForSession(session: PortalSession): Promise<PortalBulletin[]> {
    const pool = await this.getPool();
    if (!pool) return [];
    const query = buildSelectBulletinsQuery(session);
    const result = await pool.query(query.text, query.values);
    return (result.rows as Array<PortalBulletin & { audienceUnitIds?: string[]; audienceRoles?: PortalSession["role"][] }>).map(({ audienceUnitIds, audienceRoles, ...bulletin }) => ({
      ...bulletin,
      audience: audienceUnitIds || audienceRoles ? { unitIds: audienceUnitIds, roles: audienceRoles } : undefined,
    }));
  }

  public async acknowledgeBulletin(_bulletinId: string, _userId: string): Promise<void> {
    // Bulletin acknowledgement persistence in database is operational/read state
    return;
  }

  public async explainBulletinForUnit(
    bulletinId: string,
    locationId: string,
    role: PortalRole = "franchisee",
  ): Promise<TargetingEvaluation | null> {
    const bulletins = await this.getBulletinsForSession({
      sessionId: "diag-session",
      locationId,
      locationName: "Diagnostics Unit",
      role,
      managedLocationIds: [locationId],
      userId: "diag-user",
      email: "diagnostics@buddas.local",
      expiresAt: Date.now() + 3600000,
    });
    const bulletin = bulletins.find((b) => b.id === bulletinId);
    if (!bulletin) return null;
    const location = await this.getLocationById(locationId);
    const context = location
      ? buildAudienceContext(location, role)
      : { unitId: locationId, role };
    return evaluateAudienceTargeting(bulletin.audience, context);
  }

  public async explainResourceForUnit(
    resourceId: string,
    locationId: string,
    role: PortalRole = "franchisee",
  ): Promise<TargetingEvaluation | null> {
    const resources = await this.getResourcesByLocation(locationId);
    const resource = resources.find((r) => r.id === resourceId);
    if (!resource) return null;
    const location = await this.getLocationById(locationId);
    const context = location
      ? buildAudienceContext(location, role)
      : { unitId: locationId, role };
    return evaluateAudienceTargeting(resource.audience, context);
  }
}

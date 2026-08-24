import type {
  PortalAnnouncement,
  PortalLocation,
  PortalOrder,
  PortalOrderItem,
  PortalProduct,
  PortalResource,
  PortalSupportCase,
} from "./types.ts";

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
      order.status,
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
}): ParameterizedQuery => {
  const text = `
    INSERT INTO portal_support_cases (
      case_id, location_id, user_email, subject, topic, details, status, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, 'Open', NOW(), NOW())
  `.trim();
  return {
    text,
    values: [
      ticket.id,
      ticket.locationId,
      ticket.userEmail,
      ticket.subject,
      ticket.topic,
      ticket.details,
    ],
  };
};

export const buildSelectAnnouncementsQuery = (): ParameterizedQuery => {
  const text = `
    SELECT announcement_id as "id", title, body,
           published_at as "publishedAt", priority
    FROM portal_announcements
    ORDER BY published_at DESC
  `.trim();
  return { text, values: [] };
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
    return result.rows as PortalOrder[];
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
  }): Promise<void> {
    const pool = await this.getPool();
    if (!pool) return;
    const query = buildInsertSupportCaseQuery(ticket);
    await pool.query(query.text, query.values);
  }

  public async getAnnouncements(): Promise<PortalAnnouncement[]> {
    const pool = await this.getPool();
    if (!pool) return [];
    const query = buildSelectAnnouncementsQuery();
    const result = await pool.query(query.text, query.values);
    return result.rows as PortalAnnouncement[];
  }
}

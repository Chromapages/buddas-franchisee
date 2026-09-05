-- Locations Table
CREATE TABLE IF NOT EXISTS portal_locations (
  location_id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  code VARCHAR(16) NOT NULL UNIQUE,
  city VARCHAR(64) NOT NULL,
  state VARCHAR(32) NOT NULL,
  franchisee_name VARCHAR(128) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products Catalog
CREATE TABLE IF NOT EXISTS portal_products (
  product_id VARCHAR(64) PRIMARY KEY,
  sku VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  category VARCHAR(64) NOT NULL,
  description TEXT NOT NULL,
  pack_size VARCHAR(64) NOT NULL,
  lead_time_days INTEGER NOT NULL DEFAULT 3,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  slug VARCHAR(128) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Location Product Pricing
CREATE TABLE IF NOT EXISTS portal_product_prices (
  product_id VARCHAR(64) REFERENCES portal_products(product_id) ON DELETE CASCADE,
  location_id VARCHAR(32) REFERENCES portal_locations(location_id) ON DELETE CASCADE,
  price NUMERIC(10, 2) NOT NULL,
  PRIMARY KEY (product_id, location_id)
);

-- Orders
CREATE TABLE IF NOT EXISTS portal_orders (
  order_id VARCHAR(64) PRIMARY KEY,
  location_id VARCHAR(32) REFERENCES portal_locations(location_id),
  status VARCHAR(32) NOT NULL DEFAULT 'PROCESSING',
  eta VARCHAR(64) NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  invoice_id VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS portal_order_items (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(64) REFERENCES portal_orders(order_id) ON DELETE CASCADE,
  sku VARCHAR(32) NOT NULL,
  name VARCHAR(128) NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL
);

-- Resources
CREATE TABLE IF NOT EXISTS portal_resources (
  resource_id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(128) NOT NULL,
  category VARCHAR(64) NOT NULL,
  version VARCHAR(32) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  file_size VARCHAR(32) NOT NULL,
  download_url TEXT NOT NULL,
  location_scope TEXT[] DEFAULT NULL
);

-- Support Cases
CREATE TABLE IF NOT EXISTS portal_support_cases (
  case_id VARCHAR(64) PRIMARY KEY,
  location_id VARCHAR(32) REFERENCES portal_locations(location_id),
  user_email VARCHAR(256) NOT NULL,
  subject VARCHAR(256) NOT NULL,
  topic VARCHAR(128) NOT NULL,
  details TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'Open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE portal_support_cases ADD COLUMN IF NOT EXISTS submitted_by_user_id VARCHAR(128);
ALTER TABLE portal_support_cases ADD COLUMN IF NOT EXISTS operator_action_required BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE portal_support_cases ADD COLUMN IF NOT EXISTS assigned_to_user_id VARCHAR(128);
ALTER TABLE portal_support_cases ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE portal_support_cases ADD COLUMN IF NOT EXISTS reopened_at TIMESTAMPTZ;

-- Support Case Messages (Chronological thread with tenant isolation)
CREATE TABLE IF NOT EXISTS portal_support_messages (
  message_id VARCHAR(64) PRIMARY KEY,
  case_id VARCHAR(64) NOT NULL REFERENCES portal_support_cases(case_id) ON DELETE CASCADE,
  location_id VARCHAR(32) NOT NULL REFERENCES portal_locations(location_id),
  author_email VARCHAR(256) NOT NULL,
  author_role VARCHAR(32) NOT NULL DEFAULT 'OPERATOR',
  author_name VARCHAR(128),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_support_messages_case ON portal_support_messages(case_id, location_id, created_at ASC);

-- Announcements
CREATE TABLE IF NOT EXISTS portal_announcements (
  announcement_id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(256) NOT NULL,
  body TEXT NOT NULL,
  is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE portal_announcements ADD COLUMN IF NOT EXISTS effective_at TIMESTAMPTZ;
ALTER TABLE portal_announcements ADD COLUMN IF NOT EXISTS audience_unit_ids TEXT[];
ALTER TABLE portal_announcements ADD COLUMN IF NOT EXISTS audience_roles TEXT[];
ALTER TABLE portal_announcements ADD COLUMN IF NOT EXISTS audience_markets TEXT[];
ALTER TABLE portal_announcements ADD COLUMN IF NOT EXISTS audience_equipment_configs TEXT[];
ALTER TABLE portal_announcements ADD COLUMN IF NOT EXISTS audience_launch_stages TEXT[];
ALTER TABLE portal_announcements ADD COLUMN IF NOT EXISTS audience_store_formats TEXT[];
ALTER TABLE portal_announcements ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE portal_announcements ADD COLUMN IF NOT EXISTS superseded_by_id VARCHAR(64);
ALTER TABLE portal_announcements ADD COLUMN IF NOT EXISTS source_owner VARCHAR(128);

ALTER TABLE portal_locations ADD COLUMN IF NOT EXISTS market VARCHAR(64);
ALTER TABLE portal_locations ADD COLUMN IF NOT EXISTS equipment_config TEXT[];
ALTER TABLE portal_locations ADD COLUMN IF NOT EXISTS launch_stage VARCHAR(32);
ALTER TABLE portal_locations ADD COLUMN IF NOT EXISTS store_format VARCHAR(32);

ALTER TABLE portal_resources ADD COLUMN IF NOT EXISTS audience_markets TEXT[];
ALTER TABLE portal_resources ADD COLUMN IF NOT EXISTS audience_equipment_configs TEXT[];
ALTER TABLE portal_resources ADD COLUMN IF NOT EXISTS audience_launch_stages TEXT[];
ALTER TABLE portal_resources ADD COLUMN IF NOT EXISTS audience_store_formats TEXT[];

CREATE TABLE IF NOT EXISTS portal_audit_log (
  audit_id BIGSERIAL PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  actor_email VARCHAR(256),
  actor_role VARCHAR(64),
  unit_id VARCHAR(32),
  resource_type VARCHAR(64) NOT NULL,
  resource_id VARCHAR(128),
  action VARCHAR(64) NOT NULL,
  outcome VARCHAR(16) NOT NULL,
  reference_id VARCHAR(128),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE portal_audit_log ADD COLUMN IF NOT EXISTS actor_email VARCHAR(256);
ALTER TABLE portal_audit_log ADD COLUMN IF NOT EXISTS actor_role VARCHAR(64);
ALTER TABLE portal_audit_log ADD COLUMN IF NOT EXISTS resource_id VARCHAR(128);
ALTER TABLE portal_audit_log ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Audit records are operational and security infrastructure: strictly append-only
REVOKE UPDATE, DELETE ON portal_audit_log FROM PUBLIC;


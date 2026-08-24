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
  status VARCHAR(32) NOT NULL DEFAULT 'Processing',
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

-- Announcements
CREATE TABLE IF NOT EXISTS portal_announcements (
  announcement_id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(256) NOT NULL,
  body TEXT NOT NULL,
  is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

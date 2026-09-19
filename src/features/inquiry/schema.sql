CREATE TABLE IF NOT EXISTS franchise_inquiries (
  id VARCHAR(64) PRIMARY KEY,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  classification VARCHAR(64) NOT NULL,
  delivery_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  first_name VARCHAR(128) NOT NULL,
  last_name VARCHAR(128) NOT NULL,
  email VARCHAR(256) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  city_state VARCHAR(256) NOT NULL,
  target_state VARCHAR(2),
  market_interest VARCHAR(256) NOT NULL,
  investment_range VARCHAR(64) NOT NULL,
  preferred_timeline VARCHAR(64) NOT NULL,
  experience TEXT NOT NULL,
  message TEXT,
  broker_id VARCHAR(64),
  attribution JSONB,
  payload JSONB NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  last_error TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  routing JSONB NOT NULL DEFAULT '{}'::jsonb,
  workflow JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_franchise_inquiries_email ON franchise_inquiries(email);
CREATE INDEX IF NOT EXISTS idx_franchise_inquiries_status ON franchise_inquiries(delivery_status);
CREATE INDEX IF NOT EXISTS idx_franchise_inquiries_classification ON franchise_inquiries(classification);

ALTER TABLE franchise_inquiries ADD COLUMN IF NOT EXISTS attribution JSONB;
ALTER TABLE franchise_inquiries ADD COLUMN IF NOT EXISTS target_state VARCHAR(2);
ALTER TABLE franchise_inquiries ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE franchise_inquiries ADD COLUMN IF NOT EXISTS routing JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE franchise_inquiries ADD COLUMN IF NOT EXISTS workflow JSONB NOT NULL DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_franchise_inquiries_routing_region ON franchise_inquiries ((routing->>'regionId'));

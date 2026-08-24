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
  market_interest VARCHAR(256) NOT NULL,
  investment_range VARCHAR(64) NOT NULL,
  preferred_timeline VARCHAR(64) NOT NULL,
  experience TEXT NOT NULL,
  message TEXT,
  broker_id VARCHAR(64),
  payload JSONB NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_franchise_inquiries_email ON franchise_inquiries(email);
CREATE INDEX IF NOT EXISTS idx_franchise_inquiries_status ON franchise_inquiries(delivery_status);
CREATE INDEX IF NOT EXISTS idx_franchise_inquiries_classification ON franchise_inquiries(classification);

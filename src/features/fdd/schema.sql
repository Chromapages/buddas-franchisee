CREATE TABLE IF NOT EXISTS fdd_receipts (
  id VARCHAR(64) PRIMARY KEY,
  token VARCHAR(128) NOT NULL UNIQUE,
  inquiry_id VARCHAR(64) NOT NULL,
  prospect_name VARCHAR(128) NOT NULL,
  prospect_email VARCHAR(256) NOT NULL,
  fdd_version VARCHAR(32) NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  signed_at TIMESTAMPTZ,
  signature_legal_name VARCHAR(128),
  ip_address VARCHAR(64),
  user_agent TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fdd_receipts_token ON fdd_receipts(token);
CREATE INDEX IF NOT EXISTS idx_fdd_receipts_email ON fdd_receipts(prospect_email);

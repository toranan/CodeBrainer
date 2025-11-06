-- Bridge migration to satisfy baseline at version 1
-- Create minimal problems table so subsequent migrations (e.g., V2) can reference it.

CREATE TABLE IF NOT EXISTS problems (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL DEFAULT 'Untitled',
    tier VARCHAR(32),
    level INT,
    categories JSONB,
    visibility VARCHAR(32) DEFAULT 'PUBLIC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);



-- Create submissions table if it does not exist (safe to run multiple times)
CREATE TABLE IF NOT EXISTS submissions (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    problem_id  VARCHAR(255) NOT NULL,
    language    VARCHAR(50),
    status      VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    runtime_ms  INT,
    memory_kb   INT,
    code        TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);



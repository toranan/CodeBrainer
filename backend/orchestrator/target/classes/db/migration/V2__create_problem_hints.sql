CREATE TABLE problem_hints (
    id BIGSERIAL PRIMARY KEY,
    problem_id BIGINT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    tier VARCHAR(16) NOT NULL,
    stage SMALLINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content_md TEXT NOT NULL,
    lang VARCHAR(8) DEFAULT 'ko',
    is_active BOOLEAN DEFAULT TRUE,
    version INT DEFAULT 1,
    source VARCHAR(32) DEFAULT 'manual',
    reviewer_id BIGINT,
    wait_seconds INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_problem_hints_pid_stage_lang
    ON problem_hints(problem_id, stage, lang);


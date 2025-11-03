CREATE TABLE problems (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tier VARCHAR(32) NOT NULL,
    level INT NOT NULL,
    time_ms INT NOT NULL,
    mem_mb INT NOT NULL,
    statement_path VARCHAR(255) NOT NULL,
    visibility VARCHAR(32) NOT NULL,
    version INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE problem_tests (
    id BIGSERIAL PRIMARY KEY,
    problem_id BIGINT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    case_no INT NOT NULL,
    in_path VARCHAR(255) NOT NULL,
    out_path VARCHAR(255) NOT NULL,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE submissions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    problem_id BIGINT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    lang_id VARCHAR(32) NOT NULL,
    code_path VARCHAR(512) NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE submission_results (
    id BIGSERIAL PRIMARY KEY,
    submission_id BIGINT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    compile_ok BOOLEAN NOT NULL,
    compile_msg TEXT,
    summary_json JSONB NOT NULL,
    tests_json JSONB NOT NULL
);

CREATE INDEX idx_problem_tests_problem_case ON problem_tests(problem_id, case_no);
CREATE INDEX idx_submissions_problem ON submissions(problem_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE UNIQUE INDEX idx_submission_results_submission ON submission_results(submission_id);


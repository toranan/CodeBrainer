-- Create problem_tests table if it does not exist (runs safely multiple times)
CREATE TABLE IF NOT EXISTS problem_tests (
    id          BIGSERIAL PRIMARY KEY,
    problem_id  BIGINT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    input       TEXT   NOT NULL,
    expected    TEXT   NOT NULL,
    is_sample   BOOLEAN DEFAULT FALSE,
    score       INT     DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_problem_tests_problem_id ON problem_tests(problem_id);



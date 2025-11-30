-- 문제별 정답 코드 저장 테이블
CREATE TABLE problem_solutions (
    id BIGSERIAL PRIMARY KEY,
    problem_id BIGINT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    language VARCHAR(32) NOT NULL,
    code TEXT NOT NULL,
    explanation TEXT,
    time_complexity VARCHAR(100),
    space_complexity VARCHAR(100),
    is_optimal BOOLEAN DEFAULT TRUE,
    source VARCHAR(32) DEFAULT 'manual',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 문제별 언어당 하나의 정답 코드만 저장
CREATE UNIQUE INDEX uq_problem_solutions_problem_lang
    ON problem_solutions(problem_id, language);

CREATE INDEX idx_problem_solutions_problem
    ON problem_solutions(problem_id);

COMMENT ON TABLE problem_solutions IS '문제별 정답 코드 저장';
COMMENT ON COLUMN problem_solutions.language IS '언어: PYTHON, JAVA, JAVASCRIPT, CPP, C';
COMMENT ON COLUMN problem_solutions.code IS '정답 코드 전체';
COMMENT ON COLUMN problem_solutions.explanation IS '코드 설명 (마크다운)';
COMMENT ON COLUMN problem_solutions.time_complexity IS '시간 복잡도 (예: O(N log N))';
COMMENT ON COLUMN problem_solutions.space_complexity IS '공간 복잡도 (예: O(N))';
COMMENT ON COLUMN problem_solutions.is_optimal IS '최적 솔루션 여부';
COMMENT ON COLUMN problem_solutions.source IS '출처: manual, ai_generated, community';


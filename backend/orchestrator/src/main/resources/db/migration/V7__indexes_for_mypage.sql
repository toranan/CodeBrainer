-- 마이페이지 성능 최적화를 위한 인덱스

-- categories JSONB GIN 인덱스 (카테고리 검색용)
CREATE INDEX IF NOT EXISTS idx_problems_categories_gin ON problems USING GIN (categories);

-- submissions 테이블 인덱스 (테이블이 있을 때만 생성)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'submissions'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_submissions_user_created ON submissions(user_id, created_at DESC)';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_submissions_user_status ON submissions(user_id, status)';
    END IF;
END
$$ LANGUAGE plpgsql;

-- 필요 시: submissions(problem_id, status) 인덱스도 조건부 생성
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'submissions'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_submissions_problem_status ON submissions(problem_id, status)';
    END IF;
END
$$ LANGUAGE plpgsql;

-- problems 테이블 복합 인덱스 (visibility, tier, level)
CREATE INDEX IF NOT EXISTS idx_problems_vis_tier_level ON problems(visibility, tier, level);


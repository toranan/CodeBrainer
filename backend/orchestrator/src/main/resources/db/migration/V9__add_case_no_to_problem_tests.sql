-- Ensure problem_tests.case_no column exists and is NOT NULL (idempotent)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'problem_tests'
    ) THEN
        -- 1) 컬럼이 없으면 먼저 nullable로 추가
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'problem_tests' AND column_name = 'case_no'
        ) THEN
            EXECUTE 'ALTER TABLE problem_tests ADD COLUMN case_no INTEGER';
        END IF;

        -- 2) 기본값 설정
        EXECUTE 'ALTER TABLE problem_tests ALTER COLUMN case_no SET DEFAULT 0';

        -- 3) NULL 값 메우기
        EXECUTE 'UPDATE problem_tests SET case_no = 0 WHERE case_no IS NULL';

        -- 4) NOT NULL 강제
        EXECUTE 'ALTER TABLE problem_tests ALTER COLUMN case_no SET NOT NULL';
    END IF;
END
$$ LANGUAGE plpgsql;



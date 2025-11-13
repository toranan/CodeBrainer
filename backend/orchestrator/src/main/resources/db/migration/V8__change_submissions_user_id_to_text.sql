-- submissions 테이블의 user_id 컬럼을 BIGINT에서 VARCHAR(36)으로 변경
-- Prisma User 테이블의 UUID (TEXT)와 호환되도록 수정

-- 기존 인덱스 삭제 (user_id가 포함된 경우)
DROP INDEX IF EXISTS idx_submissions_user_problem;

-- user_id 컬럼 타입 변경
ALTER TABLE submissions 
    ALTER COLUMN user_id TYPE VARCHAR(36) USING user_id::text;

-- 인덱스 재생성 (필요한 경우)
CREATE INDEX IF NOT EXISTS idx_submissions_user_problem ON submissions(user_id, problem_id);


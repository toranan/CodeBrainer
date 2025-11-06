-- 1) 컬럼 없으면 추가 (여러 번 실행돼도 안전)
ALTER TABLE problems
    ADD COLUMN IF NOT EXISTS categories JSONB;

-- 2) 이미 존재하는데 타입이 jsonb가 아니라면 안전하게 변환
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'problems'
          AND column_name  = 'categories'
          AND udt_name    <> 'jsonb'
    ) THEN
        EXECUTE $SQL$
            ALTER TABLE problems
            ALTER COLUMN categories TYPE JSONB
            USING CASE
                WHEN categories IS NULL OR categories = '' THEN '[]'::jsonb
                ELSE categories::jsonb
            END
        $SQL$;
    END IF;
END
$$ LANGUAGE plpgsql;

-- 3) 기본값/NOT NULL 적용 (이미 있으면 영향 없음)
ALTER TABLE problems
    ALTER COLUMN categories SET DEFAULT '[]'::jsonb;

UPDATE problems
SET categories = '[]'::jsonb
WHERE categories IS NULL;

ALTER TABLE problems
    ALTER COLUMN categories SET NOT NULL;

-- 4) 검색 최적화용 인덱스 (여러 번 실행돼도 안전)
CREATE INDEX IF NOT EXISTS idx_problems_categories_gin
    ON problems USING GIN (categories);


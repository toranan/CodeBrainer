-- 문제에 입출력 형식 추가
ALTER TABLE problems ADD COLUMN IF NOT EXISTS input_format TEXT;
ALTER TABLE problems ADD COLUMN IF NOT EXISTS output_format TEXT;

-- 테스트케이스에 설명 추가
ALTER TABLE IF EXISTS problem_tests
    ADD COLUMN IF NOT EXISTS explanation TEXT;


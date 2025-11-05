-- 문제에 입출력 형식 추가
ALTER TABLE problems ADD COLUMN input_format TEXT;
ALTER TABLE problems ADD COLUMN output_format TEXT;

-- 테스트케이스에 설명 추가
ALTER TABLE problem_tests ADD COLUMN explanation TEXT;


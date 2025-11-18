-- 크롤링한 문제들을 problems 테이블에 추가
-- 주의: tier와 level은 임시값이므로 수동으로 조정 필요

INSERT INTO problems (
    title, slug, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    'Hashing',
    'problem-15829',
    'BRONZE',
    2,
    1000,
    512,
    'problems/problem-15829/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 1, 
    'problems/problem-15829/1.in',
    'problems/problem-15829/1.out',
    FALSE
FROM problems
WHERE slug = 'problem-15829';

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 2, 
    'problems/problem-15829/2.in',
    'problems/problem-15829/2.out',
    FALSE
FROM problems
WHERE slug = 'problem-15829';

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 3, 
    'problems/problem-15829/3.in',
    'problems/problem-15829/3.out',
    FALSE
FROM problems
WHERE slug = 'problem-15829';

INSERT INTO problems (
    title, slug, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    '가장 긴 문자열',
    'problem-3033',
    'BRONZE',
    2,
    1000,
    256,
    'problems/problem-3033/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 1, 
    'problems/problem-3033/1.in',
    'problems/problem-3033/1.out',
    FALSE
FROM problems
WHERE slug = 'problem-3033';

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 2, 
    'problems/problem-3033/2.in',
    'problems/problem-3033/2.out',
    FALSE
FROM problems
WHERE slug = 'problem-3033';

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 3, 
    'problems/problem-3033/3.in',
    'problems/problem-3033/3.out',
    FALSE
FROM problems
WHERE slug = 'problem-3033';

INSERT INTO problems (
    title, slug, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    '반복 부분문자열',
    'problem-1605',
    'BRONZE',
    2,
    2000,
    128,
    'problems/problem-1605/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 1, 
    'problems/problem-1605/1.in',
    'problems/problem-1605/1.out',
    FALSE
FROM problems
WHERE slug = 'problem-1605';

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 2, 
    'problems/problem-1605/2.in',
    'problems/problem-1605/2.out',
    FALSE
FROM problems
WHERE slug = 'problem-1605';

INSERT INTO problems (
    title, slug, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    'if 3',
    'problem-15551',
    'BRONZE',
    2,
    2000,
    512,
    'problems/problem-15551/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 1, 
    'problems/problem-15551/1.in',
    'problems/problem-15551/1.out',
    FALSE
FROM problems
WHERE slug = 'problem-15551';

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 2, 
    'problems/problem-15551/2.in',
    'problems/problem-15551/2.out',
    FALSE
FROM problems
WHERE slug = 'problem-15551';

INSERT INTO problems (
    title, slug, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    'Hidden Anagrams',
    'problem-13402',
    'BRONZE',
    2,
    10000,
    512,
    'problems/problem-13402/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 1, 
    'problems/problem-13402/1.in',
    'problems/problem-13402/1.out',
    FALSE
FROM problems
WHERE slug = 'problem-13402';

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 2, 
    'problems/problem-13402/2.in',
    'problems/problem-13402/2.out',
    FALSE
FROM problems
WHERE slug = 'problem-13402';

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 3, 
    'problems/problem-13402/3.in',
    'problems/problem-13402/3.out',
    FALSE
FROM problems
WHERE slug = 'problem-13402';

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 4, 
    'problems/problem-13402/4.in',
    'problems/problem-13402/4.out',
    FALSE
FROM problems
WHERE slug = 'problem-13402';

INSERT INTO problems (
    title, slug, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    'Palindromic Partitions',
    'problem-15250',
    'BRONZE',
    2,
    10000,
    128,
    'problems/problem-15250/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 1, 
    'problems/problem-15250/1.in',
    'problems/problem-15250/1.out',
    FALSE
FROM problems
WHERE slug = 'problem-15250';

INSERT INTO problems (
    title, slug, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    '코드 절도',
    'problem-5044',
    'BRONZE',
    2,
    1000,
    128,
    'problems/problem-5044/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 1, 
    'problems/problem-5044/1.in',
    'problems/problem-5044/1.out',
    FALSE
FROM problems
WHERE slug = 'problem-5044';

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 2, 
    'problems/problem-5044/2.in',
    'problems/problem-5044/2.out',
    FALSE
FROM problems
WHERE slug = 'problem-5044';

INSERT INTO problems (
    title, slug, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    'Walk Swapping',
    'problem-30863',
    'BRONZE',
    2,
    1000,
    2048,
    'problems/problem-30863/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 1, 
    'problems/problem-30863/1.in',
    'problems/problem-30863/1.out',
    FALSE
FROM problems
WHERE slug = 'problem-30863';

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 2, 
    'problems/problem-30863/2.in',
    'problems/problem-30863/2.out',
    FALSE
FROM problems
WHERE slug = 'problem-30863';

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 3, 
    'problems/problem-30863/3.in',
    'problems/problem-30863/3.out',
    FALSE
FROM problems
WHERE slug = 'problem-30863';

INSERT INTO problems (
    title, slug, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    '괄호',
    'problem-9012',
    'BRONZE',
    2,
    1000,
    128,
    'problems/problem-9012/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 1, 
    'problems/problem-9012/1.in',
    'problems/problem-9012/1.out',
    FALSE
FROM problems
WHERE slug = 'problem-9012';

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 2, 
    'problems/problem-9012/2.in',
    'problems/problem-9012/2.out',
    FALSE
FROM problems
WHERE slug = 'problem-9012';

INSERT INTO problems (
    title, slug, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    '제로',
    'problem-10773',
    'BRONZE',
    2,
    1000,
    256,
    'problems/problem-10773/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 1, 
    'problems/problem-10773/1.in',
    'problems/problem-10773/1.out',
    FALSE
FROM problems
WHERE slug = 'problem-10773';

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 2, 
    'problems/problem-10773/2.in',
    'problems/problem-10773/2.out',
    FALSE
FROM problems
WHERE slug = 'problem-10773';

INSERT INTO problems (
    title, slug, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    '균형잡힌 세상',
    'problem-4949',
    'BRONZE',
    2,
    1000,
    128,
    'problems/problem-4949/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 1, 
    'problems/problem-4949/1.in',
    'problems/problem-4949/1.out',
    FALSE
FROM problems
WHERE slug = 'problem-4949';

INSERT INTO problems (
    title, slug, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    '에디터',
    'problem-1406',
    'BRONZE',
    2,
    300,
    512,
    'problems/problem-1406/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 1, 
    'problems/problem-1406/1.in',
    'problems/problem-1406/1.out',
    FALSE
FROM problems
WHERE slug = 'problem-1406';

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 2, 
    'problems/problem-1406/2.in',
    'problems/problem-1406/2.out',
    FALSE
FROM problems
WHERE slug = 'problem-1406';

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 3, 
    'problems/problem-1406/3.in',
    'problems/problem-1406/3.out',
    FALSE
FROM problems
WHERE slug = 'problem-1406';

INSERT INTO problems (
    title, slug, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    '단어순서 뒤집기',
    'problem-12605',
    'BRONZE',
    2,
    5000,
    512,
    'problems/problem-12605/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 1, 
    'problems/problem-12605/1.in',
    'problems/problem-12605/1.out',
    FALSE
FROM problems
WHERE slug = 'problem-12605';

INSERT INTO problems (
    title, slug, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    'Brainf**k 인터프리터',
    'problem-3954',
    'BRONZE',
    2,
    7000,
    128,
    'problems/problem-3954/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 1, 
    'problems/problem-3954/1.in',
    'problems/problem-3954/1.out',
    FALSE
FROM problems
WHERE slug = 'problem-3954';

INSERT INTO problems (
    title, slug, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    '돌 던지기',
    'problem-3025',
    'BRONZE',
    2,
    1000,
    128,
    'problems/problem-3025/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 1, 
    'problems/problem-3025/1.in',
    'problems/problem-3025/1.out',
    FALSE
FROM problems
WHERE slug = 'problem-3025';

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 2, 
    'problems/problem-3025/2.in',
    'problems/problem-3025/2.out',
    FALSE
FROM problems
WHERE slug = 'problem-3025';

INSERT INTO problems (
    title, slug, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    '최소 힙',
    'problem-1927',
    'BRONZE',
    2,
    1000,
    128,
    'problems/problem-1927/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 1, 
    'problems/problem-1927/1.in',
    'problems/problem-1927/1.out',
    FALSE
FROM problems
WHERE slug = 'problem-1927';

INSERT INTO problems (
    title, slug, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    '절댓값 힙',
    'problem-11286',
    'BRONZE',
    2,
    1000,
    256,
    'problems/problem-11286/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 1, 
    'problems/problem-11286/1.in',
    'problems/problem-11286/1.out',
    FALSE
FROM problems
WHERE slug = 'problem-11286';

INSERT INTO problems (
    title, slug, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    '보석 도둑',
    'problem-1202',
    'BRONZE',
    2,
    1000,
    256,
    'problems/problem-1202/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 1, 
    'problems/problem-1202/1.in',
    'problems/problem-1202/1.out',
    FALSE
FROM problems
WHERE slug = 'problem-1202';

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 2, 
    'problems/problem-1202/2.in',
    'problems/problem-1202/2.out',
    FALSE
FROM problems
WHERE slug = 'problem-1202';

INSERT INTO problems (
    title, slug, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    'Prosjek',
    'problem-15577',
    'BRONZE',
    2,
    1000,
    64,
    'problems/problem-15577/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 1, 
    'problems/problem-15577/1.in',
    'problems/problem-15577/1.out',
    FALSE
FROM problems
WHERE slug = 'problem-15577';

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 2, 
    'problems/problem-15577/2.in',
    'problems/problem-15577/2.out',
    FALSE
FROM problems
WHERE slug = 'problem-15577';

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 3, 
    'problems/problem-15577/3.in',
    'problems/problem-15577/3.out',
    FALSE
FROM problems
WHERE slug = 'problem-15577';

INSERT INTO problems (
    title, slug, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    '교육적인 트리 문제',
    'problem-30108',
    'BRONZE',
    2,
    1000,
    1024,
    'problems/problem-30108/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problem_tests (
    problem_id, case_no, in_path, out_path, is_hidden
)
SELECT id, 1, 
    'problems/problem-30108/1.in',
    'problems/problem-30108/1.out',
    FALSE
FROM problems
WHERE slug = 'problem-30108';
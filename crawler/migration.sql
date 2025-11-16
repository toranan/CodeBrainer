-- 크롤링한 문제들을 problems 테이블에 추가
-- 주의: tier와 level은 임시값이므로 수동으로 조정 필요

INSERT INTO problems (
    title, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    'Hashing',
    'BRONZE',
    2,
    1000,
    512,
    'problems/hashing/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problems (
    title, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    '가장 긴 문자열',
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

INSERT INTO problems (
    title, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    '반복 부분문자열',
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

INSERT INTO problems (
    title, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    'if 3',
    'BRONZE',
    2,
    2000,
    512,
    'problems/if-3/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problems (
    title, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    'Hidden Anagrams',
    'BRONZE',
    2,
    10000,
    512,
    'problems/hidden-anagrams/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problems (
    title, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    'Palindromic Partitions',
    'BRONZE',
    2,
    10000,
    128,
    'problems/palindromic-partitions/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);

INSERT INTO problems (
    title, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    '코드 절도',
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

INSERT INTO problems (
    title, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    'Walk Swapping',
    'BRONZE',
    2,
    1000,
    2048,
    'problems/walk-swapping/statement.md',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);
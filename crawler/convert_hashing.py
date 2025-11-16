"""
Hashing 문제만 Markdown + SQL로 변환
"""

import json
import os
from pathlib import Path
import re

def create_slug(title):
    """문제 제목을 slug로 변환"""
    slug = re.sub(r'[^a-zA-Z0-9\s-]', '', title)
    slug = re.sub(r'\s+', '-', slug.strip())
    slug = slug.lower()
    slug = re.sub(r'-+', '-', slug)
    return slug or f"problem"

def create_markdown(problem):
    """문제 데이터를 Markdown 형식으로 변환"""
    md = f"""# {problem['title']}

## 문제 설명

{problem['description']}

## 입력

{problem['input_format']}

## 출력

{problem['output_format']}

## 제한

- 시간 제한: {problem['time_limit']}
- 메모리 제한: {problem['memory_limit']}

## 예제

"""
    
    for sample in problem['samples']:
        input_lines = sample['input'].replace('\r\n', '\n').replace('\r', '\n')
        output_lines = sample['output'].replace('\r\n', '\n').replace('\r', '\n')
        
        md += f"""### 예제 {sample['case_no']}

**입력:**
```
{input_lines}
```

**출력:**
```
{output_lines}
```

"""
    
    md += f"""## 출처

백준 온라인 저지: [{problem['id']}번 - {problem['title']}]({problem['source_url']})
"""
    
    return md

# 경로 설정
script_dir = Path(__file__).parent
project_root = script_dir.parent
storage_path = project_root / "backend" / "orchestrator" / "storage" / "problems"

print("🚀 Hashing 문제 변환 시작!\n")
print(f"📂 Storage 경로: {storage_path}\n")

# storage 폴더 생성
storage_path.mkdir(parents=True, exist_ok=True)

# JSON 읽기
json_file = script_dir / "crawled_problems_hashing.json"
with open(json_file, 'r', encoding='utf-8') as f:
    problems = json.load(f)

print(f"📝 총 {len(problems)}개 문제 처리 시작\n")
print("="*60)

sql_statements = []

for i, problem in enumerate(problems, 1):
    problem_id = problem['id']
    title = problem['title']
    slug = create_slug(title)
    
    print(f"\n[{i}/{len(problems)}] 처리 중: {problem_id}번 - {title}")
    print(f"     Slug: {slug}")
    
    # Markdown 생성
    markdown_content = create_markdown(problem)
    
    # 폴더 생성
    problem_dir = storage_path / slug
    problem_dir.mkdir(parents=True, exist_ok=True)
    
    # Markdown 파일 저장
    md_file = problem_dir / "statement.md"
    with open(md_file, 'w', encoding='utf-8') as f:
        f.write(markdown_content)
    
    print(f"     ✅ Markdown 저장: {md_file.relative_to(project_root)}")
    
    # SQL INSERT 문 생성
    time_ms = 1000  # 기본값
    mem_mb = 512    # 기본값
    statement_path = f"problems/{slug}/statement.md"
    
    # 작은따옴표 이스케이프
    safe_title = title.replace("'", "''")
    
    sql = f"""INSERT INTO problems (title, tier, level, time_ms, mem_mb, statement_path, visibility, version, created_at, updated_at)
VALUES ('{safe_title}', 'BRONZE', 2, {time_ms}, {mem_mb}, '{statement_path}', 'PUBLIC', 1, NOW(), NOW());"""
    
    sql_statements.append(sql)
    print(f"     ✅ SQL 생성 완료")

print("\n" + "="*60)

# SQL 파일 저장
sql_file = script_dir / "migration.sql"
with open(sql_file, 'w', encoding='utf-8') as f:
    f.write("-- 크롤링한 Hashing 문제들을 problems 테이블에 추가\n")
    f.write("-- 주의: tier와 level은 임시값(BRONZE, 2)입니다. 나중에 수정하세요!\n\n")
    f.write("\n\n".join(sql_statements))

print(f"\n✅ SQL 파일 생성: {sql_file.name}")

print("\n" + "="*60)
print("🎉 변환 완료!")
print("="*60)
print(f"\n📊 결과:")
print(f"   - 변환된 문제: {len(problems)}개")
print(f"   - Markdown 위치: backend/orchestrator/storage/problems/")
print(f"   - SQL 파일: crawler/migration.sql")

print(f"\n📝 다음 단계:")
print(f"   1. migration.sql 파일을 Supabase SQL Editor에서 실행")
print(f"   2. git add backend/orchestrator/storage")
print(f"   3. git commit -m 'Add hashing problems'")
print(f"   4. git push")
print()


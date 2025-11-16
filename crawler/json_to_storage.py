"""
크롤링한 JSON을 Markdown + SQL로 변환하는 스크립트
"""

import json
import os
from pathlib import Path
import re

def create_slug(title):
    """문제 제목을 slug로 변환"""
    # 한글, 특수문자 제거하고 영문만 남김
    slug = re.sub(r'[^a-zA-Z0-9\s-]', '', title)
    # 공백을 하이픈으로 변환
    slug = re.sub(r'\s+', '-', slug.strip())
    # 소문자로 변환
    slug = slug.lower()
    # 연속된 하이픈 제거
    slug = re.sub(r'-+', '-', slug)
    return slug or f"problem-{title[:10]}"

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
    
    # 예제 추가
    for sample in problem['samples']:
        md += f"""### 예제 {sample['case_no']}

**입력:**
```
{sample['input']}
```

**출력:**
```
{sample['output']}
```

"""
    
    md += f"""## 출처

백준 온라인 저지: [{problem['id']}번 - {problem['title']}]({problem['source_url']})
"""
    
    return md

def parse_time_limit(time_str):
    """시간 제한 문자열을 밀리초로 변환"""
    # "1 초", "2초", "0.5 초" 등을 처리
    time_str = time_str.strip()
    if '초' in time_str:
        time_str = time_str.replace('초', '').strip()
        try:
            return int(float(time_str) * 1000)
        except:
            return 1000
    return 1000

def parse_memory_limit(mem_str):
    """메모리 제한 문자열을 MB로 변환"""
    # "512 MB", "128MB", "256 MB" 등을 처리
    mem_str = mem_str.strip().upper()
    if 'MB' in mem_str:
        mem_str = mem_str.replace('MB', '').strip()
        try:
            return int(mem_str)
        except:
            return 128
    return 128

def determine_tier_and_level(problem_id):
    """문제 번호로 임시 난이도 설정 (나중에 수동 조정)"""
    # 실제로는 solved.ac API를 사용하거나 수동 설정이 필요
    # 임시로 모두 BRONZE 2로 설정
    return "BRONZE", 2

def process_json_file(json_file, category_name, base_path):
    """JSON 파일을 처리하여 Markdown과 SQL 생성"""
    
    print(f"\n{'='*60}")
    print(f"처리 중: {json_file}")
    print(f"카테고리: {category_name}")
    print(f"{'='*60}\n")
    
    # JSON 읽기
    with open(json_file, 'r', encoding='utf-8') as f:
        problems = json.load(f)
    
    if not problems:
        print(f"⚠️  {json_file}에 문제가 없습니다.")
        return []
    
    sql_statements = []
    
    for problem in problems:
        problem_id = problem['id']
        title = problem['title']
        slug = create_slug(title)
        
        print(f"📝 처리 중: {problem_id}번 - {title}")
        print(f"   Slug: {slug}")
        
        # Markdown 생성
        markdown_content = create_markdown(problem)
        
        # 저장 경로 생성
        problem_dir = base_path / "problems" / slug
        problem_dir.mkdir(parents=True, exist_ok=True)
        
        # Markdown 파일 저장
        md_file = problem_dir / "statement.md"
        with open(md_file, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        print(f"   ✅ 저장: {md_file}")
        
        # SQL INSERT 문 생성
        tier, level = determine_tier_and_level(problem_id)
        time_ms = parse_time_limit(problem['time_limit'])
        mem_mb = parse_memory_limit(problem['memory_limit'])
        statement_path = f"problems/{slug}/statement.md"
        
        sql = f"""INSERT INTO problems (title, tier, level, time_ms, mem_mb, statement_path, visibility, version, created_at, updated_at)
VALUES ('{title.replace("'", "''")}', '{tier}', {level}, {time_ms}, {mem_mb}, '{statement_path}', 'PUBLIC', 1, NOW(), NOW());"""
        
        sql_statements.append(sql)
        print(f"   ✅ SQL 생성 완료\n")
    
    return sql_statements

def main():
    # 기본 경로 설정
    crawler_path = Path(__file__).parent
    orchestrator_path = crawler_path.parent / "backend" / "orchestrator"
    storage_path = orchestrator_path / "storage"
    
    # storage 폴더 생성
    storage_path.mkdir(parents=True, exist_ok=True)
    (storage_path / "problems").mkdir(parents=True, exist_ok=True)
    
    print("🚀 JSON → Markdown + SQL 변환 시작!")
    print(f"📂 Storage 경로: {storage_path}")
    
    # 처리할 JSON 파일들
    json_files = [
        ("crawled_problems_hashing.json", "해싱"),
        ("crawled_problems_stack.json", "스택"),
        ("crawled_problems_heap.json", "힙"),
        ("crawled_problems_queue.json", "큐"),
    ]
    
    all_sql_statements = []
    
    for json_file, category in json_files:
        json_path = crawler_path / json_file
        if json_path.exists():
            sql_statements = process_json_file(json_path, category, storage_path)
            all_sql_statements.extend(sql_statements)
        else:
            print(f"⚠️  {json_file} 파일이 없습니다. 건너뜁니다.\n")
    
    # SQL 파일 저장
    if all_sql_statements:
        sql_file = crawler_path / "migration.sql"
        with open(sql_file, 'w', encoding='utf-8') as f:
            f.write("-- 크롤링한 문제들을 problems 테이블에 추가\n\n")
            f.write("\n\n".join(all_sql_statements))
        
        print(f"\n{'='*60}")
        print(f"✅ SQL 파일 생성 완료: {sql_file}")
        print(f"{'='*60}\n")
    
    print(f"\n{'='*60}")
    print("🎉 변환 완료!")
    print(f"{'='*60}")
    print(f"\n📊 통계:")
    print(f"   - 생성된 문제: {len(all_sql_statements)}개")
    print(f"   - Storage 경로: {storage_path}")
    print(f"   - SQL 파일: {crawler_path / 'migration.sql'}")
    print(f"\n📝 다음 단계:")
    print(f"   1. migration.sql 파일을 Supabase SQL Editor에서 실행")
    print(f"   2. git add backend/orchestrator/storage")
    print(f"   3. git commit -m 'Add crawled problems'")
    print(f"   4. git push")
    print()

if __name__ == "__main__":
    main()


"""
크롤링한 JSON 데이터를 Markdown 파일과 SQL INSERT 문으로 변환
"""

import json
import os
import re
from pathlib import Path

def create_slug(title, problem_id):
    """문제 제목을 slug로 변환"""
    # 한글/영문 제목을 영문 소문자로 변환
    slug = re.sub(r'[^a-zA-Z0-9가-힣\s-]', '', title)
    slug = slug.lower().strip()
    slug = re.sub(r'[\s]+', '-', slug)
    
    # 너무 길면 자르기
    if len(slug) > 50:
        slug = slug[:50]
    
    # 한글이 포함되어 있으면 문제 번호를 앞에 추가
    if re.search(r'[가-힣]', slug):
        slug = f"problem-{problem_id}"
    
    return slug

def create_markdown_content(problem):
    """JSON 데이터를 Markdown 형식으로 변환"""
    md_content = f"""# {problem['title']}

## 문제 설명

{problem['description']}

## 입력

{problem['input_format']}

## 출력

{problem['output_format']}

## 제한 사항

- **시간 제한**: {problem['time_limit']}
- **메모리 제한**: {problem['memory_limit']}

## 예제

"""
    
    # 예제 입출력 추가
    for sample in problem['samples']:
        md_content += f"""### 예제 {sample['case_no']}

**입력**
```
{sample['input']}
```

**출력**
```
{sample['output']}
```

"""
    
    # 출처 추가
    md_content += f"""---

**출처**: [{problem['source_url']}]({problem['source_url']})
"""
    
    return md_content

def parse_time_limit(time_str):
    """시간 제한을 밀리초로 변환 (예: '1 초' → 1000)"""
    match = re.search(r'(\d+(?:\.\d+)?)', time_str)
    if match:
        seconds = float(match.group(1))
        return int(seconds * 1000)
    return 1000

def parse_memory_limit(mem_str):
    """메모리 제한을 MB로 변환 (예: '512 MB' → 512)"""
    match = re.search(r'(\d+)', mem_str)
    if match:
        return int(match.group(1))
    return 128

def determine_tier_and_level(problem_id):
    """문제 번호로 임시 난이도 결정 (나중에 수동 조정 필요)"""
    # 기본값: BRONZE 2
    # 실제로는 solved.ac API나 수동으로 설정해야 함
    return "BRONZE", 2

def process_json_file(json_file, category, storage_base_path):
    """JSON 파일을 처리하여 MD 파일과 SQL을 생성"""
    with open(json_file, 'r', encoding='utf-8') as f:
        problems = json.load(f)
    
    sql_statements = []
    created_files = []
    
    for problem in problems:
        # Slug 생성
        slug = create_slug(problem['title'], problem['id'])
        
        # Markdown 파일 경로
        problem_dir = storage_base_path / slug
        problem_dir.mkdir(parents=True, exist_ok=True)
        
        md_file = problem_dir / "statement.md"
        
        # Markdown 파일 생성
        md_content = create_markdown_content(problem)
        with open(md_file, 'w', encoding='utf-8') as f:
            f.write(md_content)
        
        created_files.append(str(md_file))
        
        # SQL INSERT 문 생성
        tier, level = determine_tier_and_level(problem['id'])
        time_ms = parse_time_limit(problem['time_limit'])
        mem_mb = parse_memory_limit(problem['memory_limit'])
        statement_path = f"problems/{slug}/statement.md"
        
        sql = f"""INSERT INTO problems (
    title, tier, level, time_ms, mem_mb, 
    statement_path, visibility, version, 
    created_at, updated_at
) VALUES (
    '{problem['title'].replace("'", "''")}',
    '{tier}',
    {level},
    {time_ms},
    {mem_mb},
    '{statement_path}',
    'PUBLIC',
    1,
    NOW(),
    NOW()
);"""
        
        sql_statements.append(sql)
    
    return sql_statements, created_files

def main():
    """메인 실행 함수"""
    # 경로 설정
    crawler_dir = Path(__file__).parent
    project_root = crawler_dir.parent
    storage_base_path = project_root / "backend" / "orchestrator" / "storage" / "problems"
    
    # JSON 파일 목록
    json_files = {
        'crawled_problems_hashing.json': 'HASHING',
        'crawled_problems_stack.json': 'STACK',
        'crawled_problems_heap.json': 'HEAP',
        'crawled_problems_queue.json': 'QUEUE',
    }
    
    all_sql = []
    all_files = []
    
    print("=" * 60)
    print("JSON -> Markdown + SQL 변환 시작")
    print("=" * 60)
    
    for json_file, category in json_files.items():
        json_path = crawler_dir / json_file
        
        if not json_path.exists():
            print(f"[WARN] {json_file} 파일이 없습니다. 건너뜁니다.")
            continue
        
        print(f"\n[처리 중] {json_file} ({category})")
        
        try:
            sql_statements, created_files = process_json_file(
                json_path, category, storage_base_path
            )
            
            all_sql.extend(sql_statements)
            all_files.extend(created_files)
            
            print(f"   [OK] {len(created_files)}개 문제 처리 완료!")
            
        except Exception as e:
            print(f"   [ERROR] 오류 발생: {e}")
            continue
    
    # SQL 파일 생성
    if all_sql:
        sql_file = crawler_dir / "migration.sql"
        with open(sql_file, 'w', encoding='utf-8') as f:
            f.write("-- 크롤링한 문제들을 problems 테이블에 추가\n")
            f.write("-- 주의: tier와 level은 임시값이므로 수동으로 조정 필요\n\n")
            f.write("\n\n".join(all_sql))
        
        print(f"\n[OK] SQL 파일 생성 완료: {sql_file}")
    
    # 결과 요약
    print("\n" + "=" * 60)
    print("변환 완료!")
    print("=" * 60)
    print(f"생성된 Markdown 파일: {len(all_files)}개")
    print(f"생성된 SQL INSERT 문: {len(all_sql)}개")
    print(f"저장 경로: {storage_base_path}")
    print(f"SQL 파일: {crawler_dir / 'migration.sql'}")
    
    print("\n다음 단계:")
    print("1. migration.sql 내용을 Supabase SQL Editor에 붙여넣기")
    print("2. tier와 level 값 확인 및 수정 (solved.ac 참고)")
    print("3. Git에 storage 폴더 커밋 & 푸시")
    print("   git add backend/orchestrator/storage")
    print("   git commit -m 'Add crawled problems'")
    print("   git push")

if __name__ == "__main__":
    main()


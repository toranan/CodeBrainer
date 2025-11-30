#!/usr/bin/env python3
"""
크롤링한 문제 MD 파일을 파싱해서 Supabase 테이블에 맞게 변환하는 스크립트
- 티어와 레벨은 수정하지 않음 (사용자가 직접 수정한 값 유지)
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime
import psycopg2
from psycopg2.extras import Json

# Supabase 연결 정보
SUPABASE_URL = "postgresql://postgres.sqwobsmtrgjuhgymfwtl:qpwoe1234@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"

# 경로 설정
PROBLEMS_DIR = Path("/Users/anseung-won/Desktop/동국대학교/3-2/CodeBrainer/problems")
STORAGE_DIR = Path("/Users/anseung-won/Desktop/동국대학교/3-2/CodeBrainer/backend/orchestrator/storage")

def parse_markdown(content):
    """MD 파일을 파싱해서 섹션별로 분리"""

    # 문제 제목 추출
    title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else "제목 없음"

    # 문제 설명 추출 (## 문제 설명 부분)
    description_match = re.search(r'##\s+문제\s+설명\s*\n(.*?)(?=\n##|\Z)', content, re.DOTALL)
    description = description_match.group(1).strip() if description_match else ""

    # 입력 추출
    input_match = re.search(r'##\s+입력\s*\n(.*?)(?=\n##|\Z)', content, re.DOTALL)
    input_format = input_match.group(1).strip() if input_match else ""

    # 출력 추출
    output_match = re.search(r'##\s+출력\s*\n(.*?)(?=\n##|\Z)', content, re.DOTALL)
    output_format = output_match.group(1).strip() if output_match else ""

    # 제한 사항 추출
    constraints_match = re.search(r'##\s+제한\s*사항\s*\n(.*?)(?=\n##|\Z)', content, re.DOTALL)
    constraints = constraints_match.group(1).strip() if constraints_match else ""

    # 시간/메모리 제한 파싱
    time_ms = 1000  # 기본값 1초
    mem_mb = 512    # 기본값 512MB

    if constraints:
        time_match = re.search(r'시간\s+제한.*?(\d+)\s*초', constraints)
        if time_match:
            time_ms = int(time_match.group(1)) * 1000

        mem_match = re.search(r'메모리\s+제한.*?(\d+)\s*MB', constraints)
        if mem_match:
            mem_mb = int(mem_match.group(1))

    # 예제 추출 (모든 예제)
    examples = []
    example_pattern = r'###\s+예제\s+(\d+)\s*\n.*?\*\*입력\*\*\s*\n```\s*\n(.*?)\n```\s*\n.*?\*\*출력\*\*\s*\n```\s*\n(.*?)\n```'
    for match in re.finditer(example_pattern, content, re.DOTALL):
        examples.append({
            'case_no': int(match.group(1)),
            'input': match.group(2).strip(),
            'output': match.group(3).strip()
        })

    return {
        'title': title,
        'description': description,
        'input_format': input_format,
        'output_format': output_format,
        'constraints': constraints,
        'time_ms': time_ms,
        'mem_mb': mem_mb,
        'examples': examples
    }

def create_clean_markdown(title, description):
    """문제 설명만 포함한 깨끗한 MD 파일 생성"""
    return f"# {title}\n\n{description}\n"

def process_problem(problem_dir, conn):
    """하나의 문제 폴더 처리"""
    problem_name = problem_dir.name
    statement_file = problem_dir / "statement.md"

    if not statement_file.exists():
        print(f"⚠️  {problem_name}: statement.md 없음")
        return False

    print(f"\n📁 처리 중: {problem_name}")

    # MD 파일 읽기
    with open(statement_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 파싱
    parsed = parse_markdown(content)

    print(f"   제목: {parsed['title']}")
    print(f"   예제 개수: {len(parsed['examples'])}")

    # slug 생성
    slug = problem_name

    # 저장 경로
    storage_problem_dir = STORAGE_DIR / "problems" / slug
    storage_problem_dir.mkdir(parents=True, exist_ok=True)

    tests_dir = storage_problem_dir / "tests"
    tests_dir.mkdir(exist_ok=True)

    # 깨끗한 MD 파일 생성
    clean_md = create_clean_markdown(parsed['title'], parsed['description'])
    statement_path = f"problems/{slug}/statement.md"

    with open(storage_problem_dir / "statement.md", 'w', encoding='utf-8') as f:
        f.write(clean_md)

    # 테스트 파일 복사 또는 생성
    test_files = list(problem_dir.glob("*.in"))

    if test_files:
        # 기존 파일 복사
        for in_file in test_files:
            case_no = in_file.stem  # 1, 2, 3, ...
            out_file = problem_dir / f"{case_no}.out"

            if in_file.exists():
                with open(in_file, 'r', encoding='utf-8') as f:
                    (tests_dir / f"{case_no}.in").write_text(f.read(), encoding='utf-8')

            if out_file.exists():
                with open(out_file, 'r', encoding='utf-8') as f:
                    (tests_dir / f"{case_no}.out").write_text(f.read(), encoding='utf-8')
    else:
        # MD의 예제로부터 생성
        for ex in parsed['examples']:
            case_no = ex['case_no']
            (tests_dir / f"{case_no}.in").write_text(ex['input'], encoding='utf-8')
            (tests_dir / f"{case_no}.out").write_text(ex['output'], encoding='utf-8')

    # Supabase에 INSERT
    cur = conn.cursor()

    try:
        # 기존 문제가 있는지 확인
        cur.execute("SELECT id, tier, level FROM problems WHERE slug = %s", (slug,))
        existing = cur.fetchone()

        if existing:
            # 기존 문제 업데이트 (티어/레벨 유지)
            problem_id, tier, level = existing
            cur.execute("""
                UPDATE problems SET
                    title = %s,
                    statement_path = %s,
                    constraints = %s,
                    input_format = %s,
                    output_format = %s,
                    time_ms = %s,
                    mem_mb = %s,
                    updated_at = %s
                WHERE id = %s
            """, (
                parsed['title'],
                statement_path,
                parsed['constraints'],
                parsed['input_format'],
                parsed['output_format'],
                parsed['time_ms'],
                parsed['mem_mb'],
                datetime.now(),
                problem_id
            ))
            print(f"   ✅ problems 테이블 업데이트 완료 (ID: {problem_id}, 티어/레벨 유지)")
        else:
            # 새 문제 INSERT
            cur.execute("""
                INSERT INTO problems (
                    title, slug, tier, level, time_ms, mem_mb,
                    statement_path, constraints, input_format, output_format,
                    categories, languages, visibility, version,
                    created_at, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s,
                    %s, %s, %s, %s,
                    %s, %s
                )
                RETURNING id
            """, (
                parsed['title'],
                slug,
                'BRONZE',  # 기본값
                5,         # 기본값
                parsed['time_ms'],
                parsed['mem_mb'],
                statement_path,
                parsed['constraints'],
                parsed['input_format'],
                parsed['output_format'],
                Json(['알고리즘']),  # 기본 카테고리
                Json(['PYTHON', 'JAVA', 'CPP']),  # 기본 언어
                'PUBLIC',
                1,
                datetime.now(),
                datetime.now()
            ))

            problem_id = cur.fetchone()[0]
            print(f"   ✅ problems 테이블 INSERT 완료 (ID: {problem_id})")

        # 2. problem_tests 테이블에 INSERT
        # 기존 테스트 삭제
        cur.execute("DELETE FROM problem_tests WHERE problem_id = %s", (problem_id,))

        # 테스트 파일 찾기
        test_in_files = sorted(tests_dir.glob("*.in"), key=lambda x: int(x.stem) if x.stem.isdigit() else 999)

        for in_file in test_in_files:
            case_no = int(in_file.stem) if in_file.stem.isdigit() else 999
            out_file = tests_dir / f"{in_file.stem}.out"

            if out_file.exists():
                cur.execute("""
                    INSERT INTO problem_tests (
                        problem_id, case_no, in_path, out_path, is_hidden
                    ) VALUES (%s, %s, %s, %s, %s)
                """, (
                    problem_id,
                    case_no,
                    f"problems/{slug}/tests/{in_file.stem}.in",
                    f"problems/{slug}/tests/{in_file.stem}.out",
                    case_no > 3  # 3번까지는 예시, 4번부터는 히든
                ))

        print(f"   ✅ problem_tests INSERT 완료 ({len(test_in_files)}개)")

        conn.commit()
        return True

    except Exception as e:
        print(f"   ❌ 에러: {e}")
        conn.rollback()
        return False

def main():
    """메인 함수"""
    print("=" * 60)
    print("문제 Import 스크립트 시작")
    print("=" * 60)

    # Supabase 연결
    try:
        conn = psycopg2.connect(SUPABASE_URL)
        print("✅ Supabase 연결 성공\n")
    except Exception as e:
        print(f"❌ Supabase 연결 실패: {e}")
        return

    # 모든 문제 폴더 탐색
    problem_dirs = [d for d in PROBLEMS_DIR.iterdir() if d.is_dir() and not d.name.startswith('.')]

    print(f"총 {len(problem_dirs)}개 문제 발견\n")

    success_count = 0
    fail_count = 0

    for problem_dir in sorted(problem_dirs):
        if process_problem(problem_dir, conn):
            success_count += 1
        else:
            fail_count += 1

    conn.close()

    print("\n" + "=" * 60)
    print(f"완료: {success_count}개 성공, {fail_count}개 실패")
    print("=" * 60)

if __name__ == "__main__":
    main()

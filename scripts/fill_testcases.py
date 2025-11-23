#!/usr/bin/env python3
"""
테스트케이스가 5개 미만인 문제들에 대해:
1. 원본 MD 파일에서 예제를 추출
2. 기존 테스트케이스와 합쳐서 5개로 맞춤
3. 파일 생성 및 DB 업데이트
"""

import os
import re
import psycopg2
import json

SUPABASE_URL = "postgresql://postgres.sqwobsmtrgjuhgymfwtl:qpwoe1234@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"
PROBLEMS_DIR = "/app/problems"  # 원본 MD 파일
STORAGE_DIR = "/app/backend/orchestrator/storage/problems"  # 실제 저장 경로

def parse_examples_from_md(md_path):
    """MD 파일에서 예제 입출력 추출"""
    examples = []

    try:
        with open(md_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return examples

    # 예제 섹션 찾기 (다양한 패턴 지원)
    # 패턴 1: ### 예제 1 ... **입력** ```...``` **출력** ```...```
    example_pattern = r'###?\s*예제\s*(\d+)[\s\S]*?\*\*입력\*\*\s*```([^`]*)```[\s\S]*?\*\*출력\*\*\s*```([^`]*)```'
    matches = re.findall(example_pattern, content, re.MULTILINE)

    for match in matches:
        example_num, input_data, output_data = match
        input_data = input_data.strip()
        output_data = output_data.strip()
        if input_data and output_data:
            examples.append({
                'case_no': int(example_num),
                'input': input_data,
                'output': output_data
            })

    # 패턴 2: 예제 입력 / 예제 출력 (테이블 형식)
    if not examples:
        input_pattern = r'예제\s*입력\s*(\d+)?[\s\S]*?```([^`]*)```'
        output_pattern = r'예제\s*출력\s*(\d+)?[\s\S]*?```([^`]*)```'

        inputs = re.findall(input_pattern, content)
        outputs = re.findall(output_pattern, content)

        for i, (inp, out) in enumerate(zip(inputs, outputs)):
            input_data = inp[1].strip() if len(inp) > 1 else inp[0].strip()
            output_data = out[1].strip() if len(out) > 1 else out[0].strip()
            if input_data and output_data:
                examples.append({
                    'case_no': i + 1,
                    'input': input_data,
                    'output': output_data
                })

    return examples

def get_existing_testcases(cursor, problem_id):
    """DB에서 기존 테스트케이스 조회"""
    cursor.execute("""
        SELECT case_no, in_path, out_path
        FROM problem_tests
        WHERE problem_id = %s
        ORDER BY case_no
    """, (problem_id,))
    return cursor.fetchall()

def read_file_content(file_path):
    """파일 내용 읽기"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read().strip()
    except:
        return None

def write_file_content(file_path, content):
    """파일 내용 쓰기"""
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    conn = psycopg2.connect(SUPABASE_URL)
    cursor = conn.cursor()

    # 5개 미만 테스트케이스를 가진 문제 조회
    cursor.execute("""
        SELECT p.id, p.slug, p.title, COUNT(pt.id) as test_count
        FROM problems p
        LEFT JOIN problem_tests pt ON p.id = pt.problem_id
        GROUP BY p.id, p.slug, p.title
        HAVING COUNT(pt.id) < 5
        ORDER BY p.slug
    """)

    problems = cursor.fetchall()
    print(f"Found {len(problems)} problems with < 5 test cases\n")

    updated_count = 0

    for problem_id, slug, title, test_count in problems:
        print(f"[{slug}] {title} - current: {test_count} tests")

        # 1. 원본 MD 파일에서 예제 추출
        md_path = os.path.join(PROBLEMS_DIR, slug, 'statement.md')
        md_examples = parse_examples_from_md(md_path)

        # 2. 기존 테스트케이스 + MD 예제 합치기
        existing = get_existing_testcases(cursor, problem_id)
        existing_case_nos = {row[0] for row in existing}

        # 기존 테스트케이스 내용 읽기
        all_testcases = {}
        for case_no, in_path, out_path in existing:
            full_in_path = os.path.join(STORAGE_DIR, slug, 'tests', f'{case_no}.in')
            full_out_path = os.path.join(STORAGE_DIR, slug, 'tests', f'{case_no}.out')

            input_content = read_file_content(full_in_path)
            output_content = read_file_content(full_out_path)

            if input_content and output_content:
                all_testcases[case_no] = {
                    'input': input_content,
                    'output': output_content
                }

        # MD 예제 추가 (중복 체크)
        for ex in md_examples:
            case_no = ex['case_no']
            # 이미 있는 case_no는 건너뛰기
            if case_no in all_testcases:
                continue
            # 내용이 같은 테스트케이스가 있는지 체크
            is_duplicate = False
            for tc in all_testcases.values():
                if tc['input'] == ex['input'] and tc['output'] == ex['output']:
                    is_duplicate = True
                    break
            if not is_duplicate:
                # 빈 case_no 찾기
                new_case_no = 1
                while new_case_no in all_testcases:
                    new_case_no += 1
                all_testcases[new_case_no] = {
                    'input': ex['input'],
                    'output': ex['output']
                }

        # 3. 파일 저장 및 DB 업데이트
        tests_dir = os.path.join(STORAGE_DIR, slug, 'tests')
        os.makedirs(tests_dir, exist_ok=True)

        added_count = 0
        for case_no, tc in sorted(all_testcases.items()):
            in_path = os.path.join(tests_dir, f'{case_no}.in')
            out_path = os.path.join(tests_dir, f'{case_no}.out')

            # 파일 쓰기
            write_file_content(in_path, tc['input'])
            write_file_content(out_path, tc['output'])

            # DB에 없으면 추가
            if case_no not in existing_case_nos:
                rel_in_path = f"problems/{slug}/tests/{case_no}.in"
                rel_out_path = f"problems/{slug}/tests/{case_no}.out"

                cursor.execute("""
                    INSERT INTO problem_tests (problem_id, case_no, in_path, out_path, is_hidden)
                    VALUES (%s, %s, %s, %s, %s)
                """, (problem_id, case_no, rel_in_path, rel_out_path, False))
                added_count += 1

        if added_count > 0:
            print(f"  -> Added {added_count} test cases (now: {len(all_testcases)} total)")
            updated_count += 1
        else:
            print(f"  -> No new test cases to add (total: {len(all_testcases)})")

    conn.commit()
    cursor.close()
    conn.close()

    print(f"\n=== Summary ===")
    print(f"Problems updated: {updated_count}")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
MD 파일을 분석해서 Supabase의 problems 테이블에
languages, constraints, input_format, output_format 등을 업데이트하는 스크립트
"""

import os
import re
import psycopg2
import json

# Supabase 연결 정보
SUPABASE_URL = "postgresql://postgres.sqwobsmtrgjuhgymfwtl:qpwoe1234@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"

# 원본 MD 파일 경로 (Docker 컨테이너 내부 경로)
PROBLEMS_DIR = "/app/problems"

def parse_md_file(md_path):
    """MD 파일을 파싱해서 각 섹션 추출"""
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    result = {
        'title': None,
        'description': None,
        'input_format': None,
        'output_format': None,
        'constraints': None,
        'time_limit': None,
        'memory_limit': None,
    }

    # 제목 추출 (# 으로 시작)
    title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    if title_match:
        result['title'] = title_match.group(1).strip()

    # 문제 설명 추출
    desc_match = re.search(r'##\s*문제\s*설명\s*\n([\s\S]*?)(?=##|$)', content)
    if desc_match:
        result['description'] = desc_match.group(1).strip()

    # 입력 형식 추출
    input_match = re.search(r'##\s*입력\s*\n([\s\S]*?)(?=##|$)', content)
    if input_match:
        result['input_format'] = input_match.group(1).strip()

    # 출력 형식 추출
    output_match = re.search(r'##\s*출력\s*\n([\s\S]*?)(?=##|$)', content)
    if output_match:
        result['output_format'] = output_match.group(1).strip()

    # 제한 사항 추출
    constraints_match = re.search(r'##\s*제한\s*사항\s*\n([\s\S]*?)(?=##|$)', content)
    if constraints_match:
        constraints_text = constraints_match.group(1).strip()
        result['constraints'] = constraints_text

        # 시간 제한 파싱
        time_match = re.search(r'시간\s*제한[:\s]*(\d+(?:\.\d+)?)\s*초', constraints_text)
        if time_match:
            result['time_limit'] = int(float(time_match.group(1)) * 1000)  # ms로 변환

        # 메모리 제한 파싱
        mem_match = re.search(r'메모리\s*제한[:\s]*(\d+)\s*MB', constraints_text)
        if mem_match:
            result['memory_limit'] = int(mem_match.group(1))

    return result

def get_slug_from_folder(folder_name):
    """폴더 이름에서 slug 생성"""
    return folder_name

def main():
    conn = psycopg2.connect(SUPABASE_URL)
    cursor = conn.cursor()

    # 기본 언어 설정
    default_languages = json.dumps(["PYTHON", "CPP", "JAVA"])

    updated_count = 0
    error_count = 0

    # problems 폴더의 각 문제 처리
    if os.path.exists(PROBLEMS_DIR):
        folders = sorted(os.listdir(PROBLEMS_DIR))
        for folder in folders:
            if folder.startswith('.'):
                continue

            folder_path = os.path.join(PROBLEMS_DIR, folder)
            if not os.path.isdir(folder_path):
                continue

            md_path = os.path.join(folder_path, 'statement.md')
            if not os.path.exists(md_path):
                print(f"[SKIP] {folder}: statement.md not found")
                continue

            slug = get_slug_from_folder(folder)

            try:
                parsed = parse_md_file(md_path)

                # 해당 slug의 문제가 DB에 있는지 확인
                cursor.execute("SELECT id, title FROM problems WHERE slug = %s", (slug,))
                row = cursor.fetchone()

                if not row:
                    print(f"[SKIP] {slug}: not found in DB")
                    continue

                problem_id = row[0]

                # 업데이트 쿼리
                update_parts = []
                params = []

                if parsed['input_format']:
                    update_parts.append("input_format = %s")
                    params.append(parsed['input_format'])

                if parsed['output_format']:
                    update_parts.append("output_format = %s")
                    params.append(parsed['output_format'])

                if parsed['constraints']:
                    update_parts.append("constraints = %s")
                    params.append(parsed['constraints'])

                if parsed['time_limit']:
                    update_parts.append("time_ms = %s")
                    params.append(parsed['time_limit'])

                if parsed['memory_limit']:
                    update_parts.append("mem_mb = %s")
                    params.append(parsed['memory_limit'])

                # languages 업데이트 (비어있거나 null인 경우)
                cursor.execute("SELECT languages FROM problems WHERE id = %s", (problem_id,))
                current_langs = cursor.fetchone()[0]
                if not current_langs or current_langs == '[]':
                    update_parts.append("languages = %s")
                    params.append(default_languages)

                if update_parts:
                    params.append(problem_id)
                    update_query = f"UPDATE problems SET {', '.join(update_parts)} WHERE id = %s"
                    cursor.execute(update_query, params)

                    print(f"[OK] {slug}: updated (input_format, output_format, constraints, etc.)")
                    updated_count += 1
                else:
                    print(f"[SKIP] {slug}: no fields to update")

            except Exception as e:
                print(f"[ERROR] {slug}: {e}")
                error_count += 1

    conn.commit()
    cursor.close()
    conn.close()

    print(f"\n=== Summary ===")
    print(f"Updated: {updated_count}")
    print(f"Errors: {error_count}")

if __name__ == "__main__":
    main()

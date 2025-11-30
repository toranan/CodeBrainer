#!/usr/bin/env python3
"""문제 파일 검증 스크립트"""

import os
from pathlib import Path

PROBLEMS_DIR = Path("/Users/anseung-won/Desktop/동국대학교/3-2/CodeBrainer/problems")

def check_korean(text):
    """한글이 포함되어 있는지 확인"""
    return any('\uac00' <= char <= '\ud7a3' for char in text)

def main():
    problem_dirs = [d for d in PROBLEMS_DIR.iterdir() if d.is_dir() and not d.name.startswith('.')]

    print(f"총 {len(problem_dirs)}개 문제 검사 중...\n")

    valid = []
    invalid = []

    for problem_dir in sorted(problem_dirs):
        statement_file = problem_dir / "statement.md"

        if not statement_file.exists():
            invalid.append((problem_dir.name, "statement.md 없음"))
            continue

        try:
            with open(statement_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # 한글 체크
            if not check_korean(content):
                invalid.append((problem_dir.name, "한글 없음 (영어 문제로 추정)"))
                continue

            # 너무 짧은 파일
            if len(content) < 100:
                invalid.append((problem_dir.name, f"파일이 너무 짧음 ({len(content)}자)"))
                continue

            # 테스트 파일 확인
            test_files = list(problem_dir.glob("*.in"))
            if len(test_files) == 0:
                # MD에서 예제 찾기
                if "예제" not in content and "입력" not in content:
                    invalid.append((problem_dir.name, "예제 없음"))
                    continue

            valid.append(problem_dir.name)
            print(f"✅ {problem_dir.name}")

        except Exception as e:
            invalid.append((problem_dir.name, f"읽기 에러: {e}"))

    print(f"\n" + "=" * 60)
    print(f"검증 완료: {len(valid)}개 유효, {len(invalid)}개 무효")

    if invalid:
        print(f"\n⚠️  무효 문제들:")
        for name, reason in invalid:
            print(f"   - {name}: {reason}")

    print(f"\n" + "=" * 60)

if __name__ == "__main__":
    main()

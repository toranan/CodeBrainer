#!/usr/bin/env python3
"""
Supabase Storage 정리 스크립트
constraints가 NULL인 문제들의 Storage 파일 삭제
"""

import requests
import sys

# Supabase 설정
SUPABASE_URL = "https://sqwobsmtrgjuhgymfwtl.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4"
BUCKET = "codebrainer-problems"

# 보존할 폴더 목록 (CSV에서)
KEEP_FOLDERS = {
    "hashing",
    "if-3",
    "minimum-wallet-size",
    "problem-1010", "problem-10773", "problem-10815", "problem-11047",
    "problem-11279", "problem-11286", "problem-11399", "problem-11403",
    "problem-1149", "problem-11724", "problem-1202", "problem-12605",
    "problem-12738", "problem-1406", "problem-15551", "problem-15829",
    "problem-1605", "problem-1697", "problem-1920", "problem-1927",
    "problem-2178", "problem-2220", "problem-24444", "problem-24445",
    "problem-24479", "problem-24480", "problem-2750", "problem-2751",
    "problem-2839", "problem-2864", "problem-30108", "problem-3025",
    "problem-3033", "problem-4949", "problem-7453", "problem-7889",
    "problem-9012", "problem-9095", "remove-consecutive-duplicates"
}

def delete_folder(folder_path):
    """폴더 내 모든 파일 삭제"""
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{folder_path}"
    headers = {
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.delete(url, headers=headers)
        return response.status_code in [200, 204]
    except Exception as e:
        print(f"   ❌ 에러: {e}")
        return False

def main():
    print("📋 Supabase Storage 정리 시작...")
    print(f"✅ 보존할 폴더: {len(KEEP_FOLDERS)}개")
    print()
    
    # 수동으로 삭제할 폴더 목록 (Storage에서 확인한 것)
    # 이 목록은 사용자가 Dashboard에서 확인 후 입력
    print("⚠️  이 스크립트는 individual file deletion을 수행합니다.")
    print("   Supabase Dashboard에서 수동으로 삭제하는 것을 권장합니다.")
    print()
    
    # 예시: 삭제할 폴더
    folders_to_delete = [
        "palindromic-partitions",
        "problem-1000",
        "problem-10000",
        # ... 더 많은 폴더
    ]
    
    confirm = input(f"{len(folders_to_delete)}개 폴더를 삭제하시겠습니까? (yes/no): ")
    if confirm.lower() != 'yes':
        print("취소되었습니다.")
        return
    
    deleted = 0
    failed = 0
    
    for folder in folders_to_delete:
        if folder in KEEP_FOLDERS:
            print(f"✅ 보존: {folder}")
            continue
            
        print(f"🗑️  삭제 중: problems/{folder}/statement.md")
        if delete_folder(f"problems/{folder}/statement.md"):
            deleted += 1
            print(f"   ✅ 삭제 완료")
        else:
            failed += 1
            print(f"   ❌ 실패")
    
    print()
    print("=" * 50)
    print(f"✅ 삭제: {deleted}개")
    print(f"❌ 실패: {failed}개")
    print("=" * 50)

if __name__ == "__main__":
    main()

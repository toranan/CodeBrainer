#!/usr/bin/env python3
import requests
import time

# Supabase 설정
SUPABASE_URL = "https://sqwobsmtrgjuhgymfwtl.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4"
BUCKET = "codebrainer-problems"

# 보존할 폴더 (42개)
KEEP = {
    "hashing", "if-3", "minimum-wallet-size",
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

def delete_file(path):
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{path}"
    headers = {
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "apikey": SERVICE_ROLE_KEY
    }
    try:
        response = requests.delete(url, headers=headers)
        return response.status_code
    except Exception as e:
        print(f"   ❌ 에러: {e}")
        return 0

print("🗑️  Supabase Storage 대량 정리 시작...")
print(f"✅ 보존할 폴더: {len(KEEP)}개")
print()

confirm = input("problem-1 부터 problem-20000 까지 삭제 시도하시겠습니까? (y/n): ")
if confirm.lower() != 'y':
    print("취소되었습니다.")
    exit(0)

print("\n삭제 중... (시간이 걸릴 수 있습니다)\n")

deleted = 0
not_found = 0
kept = 0
errors = 0

# problem-1 부터 problem-20000 까지
for i in range(1, 20001):
    folder = f"problem-{i}"
    
    # 보존 목록 확인
    if folder in KEEP:
        kept += 1
        continue
    
    # statement.md 삭제
    http_code = delete_file(f"problems/{folder}/statement.md")
    
    if http_code == 200:
        deleted += 1
        print(f"✅ {deleted}: problems/{folder}/statement.md")
    elif http_code == 404:
        not_found += 1
    else:
        errors += 1
        if errors < 10:  # 처음 10개만 출력
            print(f"⚠️  문제: {folder} (HTTP {http_code})")
    
    # 100개마다 진행상황 출력
    if i % 100 == 0:
        print(f"진행: {i} / 20000 (삭제: {deleted}, 없음: {not_found}, 보존: {kept}, 에러: {errors})")
    
    # Rate limit 방지
    time.sleep(0.05)

# 특수 이름 폴더도 삭제
print("\n특수 이름 폴더 삭제 중...")
special_folders = [
    "palindromic-partitions",
]

for folder in special_folders:
    if folder in KEEP:
        continue
    
    http_code = delete_file(f"problems/{folder}/statement.md")
    if http_code == 200:
        deleted += 1
        print(f"✅ problems/{folder}/statement.md")

print()
print("=" * 50)
print(f"✅ 삭제 완료: {deleted}개")
print(f"⚠️  파일 없음: {not_found}개")
print(f"✅ 보존: {kept}개")
print(f"❌ 에러: {errors}개")
print("=" * 50)

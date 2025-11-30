#!/bin/bash

# Supabase 설정
SUPABASE_URL="https://sqwobsmtrgjuhgymfwtl.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4"
BUCKET="codebrainer-problems"

# 보존할 문제 번호 (42개)
declare -A KEEP
KEEP["hashing"]=1
KEEP["if-3"]=1
KEEP["minimum-wallet-size"]=1
KEEP["problem-1010"]=1
KEEP["problem-10773"]=1
KEEP["problem-10815"]=1
KEEP["problem-11047"]=1
KEEP["problem-11279"]=1
KEEP["problem-11286"]=1
KEEP["problem-11399"]=1
KEEP["problem-11403"]=1
KEEP["problem-1149"]=1
KEEP["problem-11724"]=1
KEEP["problem-1202"]=1
KEEP["problem-12605"]=1
KEEP["problem-12738"]=1
KEEP["problem-1406"]=1
KEEP["problem-15551"]=1
KEEP["problem-15829"]=1
KEEP["problem-1605"]=1
KEEP["problem-1697"]=1
KEEP["problem-1920"]=1
KEEP["problem-1927"]=1
KEEP["problem-2178"]=1
KEEP["problem-2220"]=1
KEEP["problem-24444"]=1
KEEP["problem-24445"]=1
KEEP["problem-24479"]=1
KEEP["problem-24480"]=1
KEEP["problem-2750"]=1
KEEP["problem-2751"]=1
KEEP["problem-2839"]=1
KEEP["problem-2864"]=1
KEEP["problem-30108"]=1
KEEP["problem-3025"]=1
KEEP["problem-3033"]=1
KEEP["problem-4949"]=1
KEEP["problem-7453"]=1
KEEP["problem-7889"]=1
KEEP["problem-9012"]=1
KEEP["problem-9095"]=1
KEEP["remove-consecutive-duplicates"]=1

delete_file() {
    local path="$1"
    curl -s -o /dev/null -w "%{http_code}" -X DELETE \
        "${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}" \
        -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
        -H "apikey: ${SERVICE_ROLE_KEY}"
}

echo "🗑️  Supabase Storage 대량 정리 시작..."
echo "✅ 보존할 폴더: ${#KEEP[@]}개"
echo ""

read -p "problem-1 부터 problem-20000 까지 삭제 시도하시겠습니까? (y/n): " confirm
if [[ "$confirm" != "y" ]]; then
    echo "취소되었습니다."
    exit 0
fi

deleted=0
not_found=0
kept=0

echo ""
echo "삭제 중... (시간이 걸릴 수 있습니다)"

# problem-1 부터 problem-20000 까지
for i in {1..20000}; do
    folder="problem-$i"
    
    # 보존 목록 확인
    if [[ -n "${KEEP[$folder]}" ]]; then
        ((kept++))
        continue
    fi
    
    # statement.md 삭제
    http_code=$(delete_file "problems/${folder}/statement.md")
    
    if [[ "$http_code" == "200" ]]; then
        ((deleted++))
        echo "✅ $deleted: problems/$folder/statement.md"
    elif [[ "$http_code" == "404" ]]; then
        ((not_found++))
    else
        echo "⚠️  문제: $folder (HTTP $http_code)"
    fi
    
    # 100개마다 진행상황 출력
    if (( i % 100 == 0 )); then
        echo "진행: $i / 20000 (삭제: $deleted, 없음: $not_found, 보존: $kept)"
    fi
    
    # Rate limit 방지
    sleep 0.05
done

# palindromic-partitions 같은 특수 이름도 삭제
echo ""
echo "특수 이름 폴더 삭제 중..."
special_folders=(
    "palindromic-partitions"
)

for folder in "${special_folders[@]}"; do
    if [[ -n "${KEEP[$folder]}" ]]; then
        continue
    fi
    
    http_code=$(delete_file "problems/${folder}/statement.md")
    if [[ "$http_code" == "200" ]]; then
        ((deleted++))
        echo "✅ problems/$folder/statement.md"
    fi
done

echo ""
echo "=========================================="
echo "✅ 삭제 완료: $deleted 개"
echo "⚠️  파일 없음: $not_found 개"
echo "✅ 보존: $kept 개"
echo "=========================================="

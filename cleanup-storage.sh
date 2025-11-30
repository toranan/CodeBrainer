#!/bin/bash

# Supabase 설정
SUPABASE_URL="https://sqwobsmtrgjuhgymfwtl.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4"
BUCKET="codebrainer-problems"

echo "📋 Supabase Storage에서 문제 폴더 목록 가져오는 중..."

# Storage API로 problems/ 폴더 내의 모든 폴더 목록 가져오기
all_folders=$(curl -s "${SUPABASE_URL}/storage/v1/object/list/${BUCKET}?prefix=problems/&delimiter=/" \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" | \
    jq -r '.[].name' | grep -v '^problems/$' || echo "")

if [ -z "$all_folders" ]; then
    echo "❌ Storage 폴더 목록을 가져올 수 없습니다."
    exit 1
fi

echo "✅ 총 $(echo "$all_folders" | wc -l) 개 폴더 발견"
echo ""

# 살려야 할 폴더 목록 (CSV에서 추출)
keep_folders=(
    "hashing"
    "if-3"
    "minimum-wallet-size"
    "problem-1010"
    "problem-10773"
    "problem-10815"
    "problem-11047"
    "problem-11279"
    "problem-11286"
    "problem-11399"
    "problem-11403"
    "problem-1149"
    "problem-11724"
    "problem-1202"
    "problem-12605"
    "problem-12738"
    "problem-1406"
    "problem-15551"
    "problem-15829"
    "problem-1605"
    "problem-1697"
    "problem-1920"
    "problem-1927"
    "problem-2178"
    "problem-2220"
    "problem-24444"
    "problem-24445"
    "problem-24479"
    "problem-24480"
    "problem-2750"
    "problem-2751"
    "problem-2839"
    "problem-2864"
    "problem-30108"
    "problem-3025"
    "problem-3033"
    "problem-4949"
    "problem-7453"
    "problem-7889"
    "problem-9012"
    "problem-9095"
    "remove-consecutive-duplicates"
)

# 살려야 할 폴더인지 확인하는 함수
should_keep() {
    local folder_name="$1"
    for keep in "${keep_folders[@]}"; do
        if [[ "$folder_name" == "problems/$keep" ]]; then
            return 0
        fi
    done
    return 1
}

deleted_count=0
kept_count=0

echo "🗑️  불필요한 폴더 삭제 시작..."
echo ""

while IFS= read -r folder; do
    # 빈 줄 건너뛰기
    if [ -z "$folder" ]; then
        continue
    fi
    
    if should_keep "$folder"; then
        echo "✅ 보존: $folder"
        ((kept_count++))
    else
        echo "🗑️  삭제 중: $folder"
        
        # 폴더 내 모든 파일 삭제
        response=$(curl -s -w "\n%{http_code}" -X DELETE \
            "${SUPABASE_URL}/storage/v1/object/${BUCKET}/${folder}" \
            -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
            -H "Content-Type: application/json" \
            -d "{\"prefixes\":[\"${folder}\"]}")
        
        http_code=$(echo "$response" | tail -n1)
        
        if [[ "$http_code" == "200" || "$http_code" == "204" ]]; then
            ((deleted_count++))
            echo "   ✅ 삭제 완료"
        else
            echo "   ⚠️  실패 (HTTP $http_code)"
        fi
        
        sleep 0.2  # Rate limit 방지
    fi
done <<< "$all_folders"

echo ""
echo "=========================================="
echo "✅ 보존: $kept_count 개"
echo "🗑️  삭제: $deleted_count 개"
echo "=========================================="
echo ""
echo "완료! Supabase Storage 정리 완료."

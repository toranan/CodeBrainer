#!/bin/bash

# Supabase 설정
SUPABASE_URL="https://sqwobsmtrgjuhgymfwtl.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4"
BUCKET="codebrainer-problems"

# 삭제할 파일 경로를 SQL에서 가져온 후 여기에 붙여넣기
# 예: paths.txt 파일에서 읽기
if [ ! -f "paths.txt" ]; then
    echo "Error: paths.txt 파일이 없습니다."
    echo "Supabase SQL Editor에서 다음 쿼리 결과를 paths.txt에 저장하세요:"
    echo "SELECT statement_path FROM problems WHERE constraints IS NULL AND statement_path IS NOT NULL;"
    exit 1
fi

echo "Supabase Storage에서 파일 삭제 시작..."
deleted_count=0
error_count=0

while IFS= read -r path; do
    # 빈 줄이나 헤더 건너뛰기
    if [[ -z "$path" || "$path" == "statement_path" ]]; then
        continue
    fi
    
    echo "삭제 중: $path"
    
    response=$(curl -s -w "\n%{http_code}" -X DELETE \
        "${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}" \
        -H "Authorization: Bearer ${SERVICE_ROLE_KEY}")
    
    http_code=$(echo "$response" | tail -n1)
    
    if [[ "$http_code" == "200" || "$http_code" == "204" ]]; then
        ((deleted_count++))
        echo "  ✅ 삭제 완료"
    elif [[ "$http_code" == "404" ]]; then
        echo "  ⚠️  파일 없음 (이미 삭제됨)"
    else
        ((error_count++))
        echo "  ❌ 실패 (HTTP $http_code)"
    fi
    
    # API rate limit 방지
    sleep 0.1
done < "paths.txt"

echo ""
echo "=========================================="
echo "삭제 완료: $deleted_count 개"
echo "에러: $error_count 개"
echo "=========================================="

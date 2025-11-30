#!/bin/bash

# Supabase 설정
SUPABASE_URL="https://sqwobsmtrgjuhgymfwtl.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4"
BUCKET="codebrainer-problems"

# 보존할 문제 (공백으로 구분)
KEEP="problem-24444 problem-24445 problem-24479 problem-24480 problem-30108"

should_keep() {
    local folder="$1"
    for keep_name in $KEEP; do
        if [[ "$folder" == "$keep_name" ]]; then
            return 0
        fi
    done
    return 1
}

delete_file() {
    local path="$1"
    curl -s -o /dev/null -w "%{http_code}" -X DELETE \
        "${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}" \
        -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
        -H "apikey: ${SERVICE_ROLE_KEY}"
}

echo "🗑️  Supabase Storage 정리 (20001-30000)"
echo

read -p "problem-20001 부터 problem-30000 까지 삭제 시도하시겠습니까? (y/n): " confirm
if [[ "$confirm" != "y" ]]; then
    echo "취소되었습니다."
    exit 0
fi

echo
echo "삭제 중..."
echo

deleted=0
not_found=0
kept=0

for i in {20001..30000}; do
    folder="problem-$i"
    
    # 보존 확인
    if should_keep "$folder"; then
        ((kept++))
        continue
    fi
    
    # 삭제
    http_code=$(delete_file "problems/${folder}/statement.md")
    
    if [[ "$http_code" == "200" ]]; then
        ((deleted++))
        echo "✅ $deleted: problems/$folder/statement.md"
    elif [[ "$http_code" == "404" ]]; then
        ((not_found++))
    fi
    
    # 100개마다 진행상황
    if (( i % 100 == 0 )); then
        echo ">>> 진행: $i / 30000 (삭제: $deleted, 없음: $not_found, 보존: $kept)"
    fi
    
    sleep 0.05
done

echo
echo "=========================================="
echo "✅ 삭제: $deleted 개"
echo "⚠️  없음: $not_found 개"
echo "✅ 보존: $kept 개"
echo "=========================================="

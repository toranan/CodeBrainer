#!/bin/bash

# Supabase 설정
SUPABASE_URL="https://sqwobsmtrgjuhgymfwtl.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4"
BUCKET="codebrainer-problems"

# 보존할 폴더 (42개)
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

# Supabase Dashboard에서 확인한 삭제 대상 폴더들 (보이는 모든 폴더)
DELETE_FOLDERS=(
    "palindromic-partitions"
    "problem-1000"
    "problem-10000"
    "problem-1001"
    "problem-1002"
    "problem-10026"
    "problem-10039"
    "problem-1004"
    "problem-1005"
    "problem-1006"
    "problem-1007"
    "problem-1008"
    "problem-1009"
)

echo "🗑️  Supabase Storage 정리 시작..."
echo "✅ 보존할 폴더: ${#KEEP[@]}개"
echo "🗑️  삭제 예정: ${#DELETE_FOLDERS[@]}개 (예시, 더 있을 수 있음)"
echo ""

read -p "계속하시겠습니까? (y/n): " confirm
if [[ "$confirm" != "y" ]]; then
    echo "취소되었습니다."
    exit 0
fi

deleted=0
kept=0
failed=0

for folder in "${DELETE_FOLDERS[@]}"; do
    # 보존 목록 확인
    if [[ -n "${KEEP[$folder]}" ]]; then
        echo "✅ 보존: $folder"
        ((kept++))
        continue
    fi
    
    echo "🗑️  삭제 중: problems/$folder/statement.md"
    
    response=$(curl -s -w "\n%{http_code}" -X DELETE \
        "${SUPABASE_URL}/storage/v1/object/${BUCKET}/problems/${folder}/statement.md" \
        -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
        -H "apikey: ${SERVICE_ROLE_KEY}")
    
    http_code=$(echo "$response" | tail -n1)
    
    if [[ "$http_code" == "200" ]]; then
        ((deleted++))
        echo "   ✅ 삭제 완료"
    elif [[ "$http_code" == "404" ]]; then
        echo "   ⚠️  파일 없음"
    else
        ((failed++))
        echo "   ❌ 실패 (HTTP $http_code)"
        echo "$response" | head -n1
    fi
    
    sleep 0.1
done

echo ""
echo "=========================================="
echo "✅ 보존: $kept 개"
echo "🗑️  삭제: $deleted 개"
echo "❌ 실패: $failed 개"
echo "=========================================="
echo ""
echo "⚠️  주의: 이 스크립트는 예시 폴더만 삭제합니다."
echo "   전체 삭제를 위해서는 DELETE_FOLDERS 배열을 수정하세요."

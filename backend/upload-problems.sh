#!/bin/bash

# Seed 문제: 같은 숫자는 싫어
curl -X POST http://localhost:8080/internal/problems \
  -H "Content-Type: application/json" \
  -d '{
  "slug": "remove-consecutive-duplicates",
  "title": "같은 숫자는 싫어",
  "tier": "bronze",
  "level": 1,
  "timeMs": 1000,
  "memMb": 128,
  "statement": "배열 arr가 주어집니다. 배열 arr의 각 원소는 숫자 0부터 9까지로 이루어져 있습니다. 이때, 배열 arr에서 연속적으로 나타나는 숫자는 하나만 남기고 전부 제거하려고 합니다. 단, 제거된 후 남은 수들을 반환할 때는 배열 arr의 원소들의 순서를 유지해야 합니다.\n\narr = [1, 1, 3, 3, 0, 1, 1] 이면 [1, 3, 0, 1] 을 return 합니다.\narr = [4, 4, 4, 3, 3] 이면 [4, 3] 을 return 합니다.\n배열 arr에서 연속적으로 나타나는 숫자는 제거하고 남은 수들을 return 하는 solution 함수를 완성해 주세요.",
  "categories": ["완전탐색"],
  "languages": ["javascript"],
  "constraints": "- 1 ≤ arr.length ≤ 1,000,000\n- 0 ≤ arr[i] ≤ 9",
  "visibility": "public",
  "version": 1,
  "tests": [
    {"caseNo": 1, "input": "[1,1,3,3,0,1,1]", "output": "[1,3,0,1]", "hidden": false},
    {"caseNo": 2, "input": "[4,4,4,3,3]", "output": "[4,3]", "hidden": false},
    {"caseNo": 3, "input": "[7]", "output": "[7]", "hidden": true},
    {"caseNo": 4, "input": "[0,0,0,0,0]", "output": "[0]", "hidden": true},
    {"caseNo": 5, "input": "[1,2,3,4,5]", "output": "[1,2,3,4,5]", "hidden": true}
  ],
  "hints": [
    {"stage": 1, "title": "덩어리를 찾아라", "contentMd": "이 문제는 \"같은 값이 연속해서 붙은 구간\"을 한 덩어리로 보고, 각 덩어리에서 첫 번째 값만 남긴다고 생각해 보자. 그러면 무엇을 기준으로 덩어리의 시작을 알아볼 수 있을까?", "waitSeconds": 60},
    {"stage": 2, "title": "한 번의 순회", "contentMd": "배열을 왼쪽에서 오른쪽으로 한 번 훑는 동안, 방금 결과에 넣었던 값(또는 바로 직전 값)과 현재 값을 비교하면 덩어리의 시작인지 아닌지를 구분할 수 있다. 맨 처음 원소는 어떤 경우에 결과에 포함되어야 할까?", "waitSeconds": 120},
    {"stage": 3, "title": "엣지 케이스", "contentMd": "입력이 최대 10^6개이므로 한 번 순회(O(n))로 끝나는 방법이 바람직하다. \"모두 같은 값\", \"하나만 있는 경우\", \"값이 번갈아 나오는 경우\" 같은 엣지 케이스에서 네가 생각한 규칙이 항상 맞게 동작하는지 머릿속으로 시뮬레이션해 보자.", "waitSeconds": 180}
  ]
}'

echo ""
echo "========================================="
echo ""

# 최소 지갑 크기 문제
curl -X POST http://localhost:8080/internal/problems \
  -H "Content-Type: application/json" \
  -d '{
  "slug": "minimum-wallet-size",
  "title": "최소 지갑 크기",
  "tier": "bronze",
  "level": 1,
  "timeMs": 1000,
  "memMb": 128,
  "statement": "당신은 동전을 수집하는 취미를 가지고 있습니다. 동전은 종류별로 크기가 다르며, 당신은 동전을 지갑에 보관하려고 합니다.\n\n지갑은 일렬로 공간이 배치되어 있으며, 각 공간에는 동전 하나를 넣을 수 있습니다. 동전을 지갑에 넣을 때 다음과 같은 규칙을 따라야 합니다:\n\n1. 동전은 크기 순서대로 정렬되어야 합니다 (오름차순)\n2. 같은 크기의 동전은 연속해서 배치해야 합니다\n3. 동전은 원래 순서를 유지할 필요는 없습니다\n\n주어진 동전들을 모두 수용할 수 있는 **최소 지갑 크기**를 구하는 프로그램을 작성하세요.",
  "categories": ["완전탐색"],
  "languages": ["javascript"],
  "constraints": "- 1 ≤ N ≤ 1,000\n- 1 ≤ 동전 크기 ≤ 1,000",
  "inputFormat": "첫 번째 줄에 동전의 개수 N이 주어집니다.\n두 번째 줄에 N개의 동전 크기가 공백으로 구분되어 주어집니다.",
  "outputFormat": "필요한 최소 지갑 크기를 한 줄에 출력합니다.",
  "visibility": "public",
  "version": 1,
  "tests": [
    {"caseNo": 1, "input": "5\n3 1 2 1 3", "output": "5", "hidden": false, "explanation": "동전을 크기 순으로 정렬하면 [1, 1, 2, 3, 3]이 되므로 5개의 공간이 필요합니다."},
    {"caseNo": 2, "input": "3\n5 5 5", "output": "3", "hidden": false, "explanation": "모든 동전이 같은 크기이므로 3개의 공간이 필요합니다."},
    {"caseNo": 3, "input": "1\n10", "output": "1", "hidden": true},
    {"caseNo": 4, "input": "7\n1 2 3 4 5 6 7", "output": "7", "hidden": true},
    {"caseNo": 5, "input": "6\n10 10 5 5 1 1", "output": "6", "hidden": true}
  ],
  "hints": [
    {"stage": 1, "title": "문제 이해하기", "contentMd": "이 문제는 결국 동전을 정렬했을 때 필요한 공간의 개수를 구하는 것입니다. 동전을 크기 순서대로 배치하면 몇 개의 공간이 필요할까요?", "waitSeconds": 60},
    {"stage": 2, "title": "접근 방법", "contentMd": "동전을 크기 순으로 정렬하면, 정렬된 배열의 길이가 곧 필요한 지갑의 크기입니다. JavaScript의 sort() 함수를 사용하여 배열을 정렬할 수 있습니다.", "waitSeconds": 120},
    {"stage": 3, "title": "구현 팁", "contentMd": "1. 입력을 받아 배열로 변환합니다\n2. 배열을 오름차순으로 정렬합니다\n3. 정렬된 배열의 길이를 출력합니다\n\n주의: sort()를 사용할 때는 비교 함수를 제공해야 숫자가 올바르게 정렬됩니다.", "waitSeconds": 180}
  ]
}'

echo ""
echo "========================================="
echo "문제 업로드 완료!"


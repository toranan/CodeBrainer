# CodeBrainer API 명세서

## 문제 등록 API

### 엔드포인트
```
POST /internal/problems
```

### 설명
새로운 문제를 등록하거나 기존 문제를 수정합니다. (slug를 기준으로 upsert)

### Request Body
```json
{
  "title": "두 수의 합",
  "slug": "sum-of-two-numbers",
  "tier": "BRONZE",
  "level": 5,
  "timeMs": 1000,
  "memMb": 128,
  "visibility": "PUBLIC",
  "version": 1,
  "categories": ["구현", "사칙연산"],
  "languages": ["JAVA", "PYTHON", "JAVASCRIPT"],
  "constraints": "1 ≤ A, B ≤ 1000",
  "inputFormat": "첫째 줄에 두 정수 A와 B가 주어진다.",
  "outputFormat": "A+B를 출력한다.",
  "statement": "# 문제\n\n두 정수 A와 B를 입력받은 다음, A+B를 출력하는 프로그램을 작성하시오.\n\n## 입력\n\n첫째 줄에 A와 B가 주어진다. (0 < A, B < 10)\n\n## 출력\n\n첫째 줄에 A+B를 출력한다.",
  "tests": [
    {
      "caseNo": 1,
      "input": "1 2",
      "output": "3",
      "hidden": false,
      "explanation": "1 + 2 = 3"
    },
    {
      "caseNo": 2,
      "input": "5 7",
      "output": "12",
      "hidden": false,
      "explanation": "5 + 7 = 12"
    },
    {
      "caseNo": 3,
      "input": "100 200",
      "output": "300",
      "hidden": true,
      "explanation": "숨겨진 테스트케이스"
    }
  ],
  "hints": [
    {
      "stage": 1,
      "title": "첫 번째 힌트",
      "contentMd": "입력을 받을 때는 Scanner나 BufferedReader를 사용하세요.",
      "waitSeconds": 30
    },
    {
      "stage": 2,
      "title": "두 번째 힌트",
      "contentMd": "두 수를 더한 결과를 출력하면 됩니다. `System.out.println(a + b);`",
      "waitSeconds": 60
    }
  ]
}
```

### Request Fields

| 필드 | 타입 | 필수 | 설명 | 예시 |
|------|------|------|------|------|
| `title` | String | ✅ | 문제 제목 | "두 수의 합" |
| `slug` | String | ✅ | 문제 URL용 고유 식별자 (영문, 숫자, 하이픈만) | "sum-of-two-numbers" |
| `tier` | String | ✅ | 난이도 티어 | "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND" |
| `level` | Integer | ✅ | 티어 내 레벨 (1~5) | 5 |
| `timeMs` | Integer | ✅ | 시간 제한 (밀리초) | 1000 (1초) |
| `memMb` | Integer | ✅ | 메모리 제한 (MB) | 128 |
| `visibility` | String | ✅ | 공개 여부 | "PUBLIC", "PRIVATE" |
| `version` | Integer | ✅ | 문제 버전 | 1 |
| `categories` | String[] | ✅ | 문제 카테고리 목록 | ["구현", "사칙연산"] |
| `languages` | String[] | ✅ | 지원 언어 목록 | ["JAVA", "PYTHON", "JAVASCRIPT"] |
| `constraints` | String | ❌ | 제약 조건 | "1 ≤ A, B ≤ 1000" |
| `inputFormat` | String | ❌ | 입력 형식 설명 | "첫째 줄에 두 정수 A와 B가 주어진다." |
| `outputFormat` | String | ❌ | 출력 형식 설명 | "A+B를 출력한다." |
| `statement` | String | ✅ | 문제 설명 (Markdown) | "# 문제\n\n..." |
| `tests` | ProblemTestDto[] | ❌ | 테스트케이스 목록 | 아래 참조 |
| `hints` | ProblemHintDto[] | ❌ | 힌트 목록 | 아래 참조 |

#### ProblemTestDto

| 필드 | 타입 | 필수 | 설명 | 예시 |
|------|------|------|------|------|
| `caseNo` | Integer | ✅ | 테스트케이스 번호 | 1 |
| `input` | String | ✅ | 입력 데이터 | "1 2" |
| `output` | String | ✅ | 정답 출력 | "3" |
| `hidden` | Boolean | ❌ | 숨김 여부 (기본: false) | true |
| `explanation` | String | ❌ | 테스트케이스 설명 | "1 + 2 = 3" |

#### ProblemHintDto

| 필드 | 타입 | 필수 | 설명 | 예시 |
|------|------|------|------|------|
| `stage` | Short | ✅ | 힌트 단계 (순서) | 1 |
| `title` | String | ✅ | 힌트 제목 | "첫 번째 힌트" |
| `contentMd` | String | ✅ | 힌트 내용 (Markdown) | "Scanner를 사용하세요." |
| `waitSeconds` | Integer | ❌ | 힌트 오픈 대기 시간 (초) | 30 |

### Response
```json
{
  "status": 200,
  "body": 1
}
```

- `body`: 생성/수정된 문제의 ID (Long)

### 지원 언어 목록
```
JAVA
PYTHON
JAVASCRIPT
CPP
C
KOTLIN
GO
RUST
```

### 난이도 티어
```
BRONZE (브론즈)
SILVER (실버)
GOLD (골드)
PLATINUM (플래티넘)
DIAMOND (다이아몬드)
```

### 공개 여부
```
PUBLIC (공개)
PRIVATE (비공개)
```

### 예시 cURL 요청

```bash
curl -X POST http://localhost:8080/internal/problems \
  -H "Content-Type: application/json" \
  -d '{
    "title": "두 수의 합",
    "slug": "sum-of-two-numbers",
    "tier": "BRONZE",
    "level": 5,
    "timeMs": 1000,
    "memMb": 128,
    "visibility": "PUBLIC",
    "version": 1,
    "categories": ["구현", "사칙연산"],
    "languages": ["JAVA", "PYTHON", "JAVASCRIPT"],
    "constraints": "1 ≤ A, B ≤ 1000",
    "inputFormat": "첫째 줄에 두 정수 A와 B가 주어진다.",
    "outputFormat": "A+B를 출력한다.",
    "statement": "# 문제\n\n두 정수 A와 B를 입력받은 다음, A+B를 출력하는 프로그램을 작성하시오.\n\n## 입력\n\n첫째 줄에 A와 B가 주어진다. (0 < A, B < 10)\n\n## 출력\n\n첫째 줄에 A+B를 출력한다.",
    "tests": [
      {
        "caseNo": 1,
        "input": "1 2",
        "output": "3",
        "hidden": false,
        "explanation": "1 + 2 = 3"
      }
    ],
    "hints": [
      {
        "stage": 1,
        "title": "첫 번째 힌트",
        "contentMd": "입력을 받을 때는 Scanner를 사용하세요.",
        "waitSeconds": 30
      }
    ]
  }'
```

### 주의사항

1. **slug는 고유해야 합니다**
   - 영문 소문자, 숫자, 하이픈(-)만 사용
   - 예: `two-sum`, `binary-search-tree`

2. **같은 slug로 재요청하면 기존 문제를 덮어씁니다**
   - version을 증가시켜 버전 관리 가능

3. **statement는 Markdown 형식**
   - HTML 태그도 사용 가능
   - 수식은 LaTeX 문법 지원

4. **tests는 최소 1개 이상 권장**
   - hidden: true인 테스트케이스는 사용자에게 보이지 않음

5. **timeMs는 밀리초 단위**
   - 1000 = 1초
   - 2000 = 2초

6. **memMb는 메가바이트 단위**
   - 128 = 128MB
   - 256 = 256MB

---

## 기타 API

### 문제 목록 조회
```
GET /problems?page=0&size=20&sort=createdAt,desc
```

### 문제 상세 조회
```
GET /problems/{slug}
```

### 문제 제출
```
POST /submissions
```

더 자세한 API가 필요하면 말씀해주세요!


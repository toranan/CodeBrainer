# 문제 목록이 안 보이는 문제 디버깅

## 1단계: 브라우저에서 API 응답 확인

1. 브라우저에서 `localhost:3000/problems` 페이지를 엽니다
2. `F12`를 눌러 개발자 도구를 엽니다
3. `Network` 탭으로 이동
4. 페이지를 새로고침 (`Ctrl + F5`)
5. `/api/problems` 또는 `problems` 요청을 찾아서 클릭
6. `Response` 탭에서 응답 확인

**예상되는 결과:**
```json
{
  "problems": [
    {
      "id": "...",
      "title": "Hashing",
      "slug": "problem-15829",
      "categories": ["해시"],
      ...
    }
  ]
}
```

**만약 빈 배열이거나 에러가 나면:**
- 백엔드가 Supabase와 연결되지 않았거나
- Supabase에 데이터가 없는 것입니다

---

## 2단계: Supabase에서 데이터 직접 확인

Supabase SQL Editor에서 다음 쿼리 실행:

```sql
-- 1. 문제가 들어갔는지 확인
SELECT id, title, slug, categories, visibility 
FROM problems 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. 카테고리가 제대로 들어갔는지 확인
SELECT slug, title, categories 
FROM problems 
WHERE slug LIKE 'problem-%';
```

**예상 결과:**
- `categories`가 `["해시"]`, `["스택/큐"]`, `["힙"]` 등으로 **한국어**로 되어 있어야 함
- `visibility`가 `PUBLIC`이어야 함

---

## 3단계: 백엔드 로그 확인

백엔드 콘솔에서 에러 메시지를 확인합니다.

---

## 4단계: 백엔드 API 직접 호출

브라우저나 Postman에서:
```
http://localhost:8081/api/problems
```

이 URL로 직접 접속해서 응답을 확인합니다.

---

## 문제별 해결 방법

### 케이스 1: Supabase에 데이터가 없음
→ SQL을 Supabase SQL Editor에서 실행해야 합니다

### 케이스 2: categories가 영어로 되어 있음
→ UPDATE 문을 다시 실행해야 합니다

### 케이스 3: 백엔드가 Supabase에 연결되지 않음
→ application.yml의 DB 연결 정보 확인

### 케이스 4: 프론트엔드가 백엔드 API를 못 찾음
→ 백엔드가 8081 포트에서 실행 중인지 확인





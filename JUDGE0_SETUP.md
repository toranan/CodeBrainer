# Judge0 채점 시스템 설정 가이드

CodeBrainer는 Judge0를 사용하여 다양한 프로그래밍 언어의 코드를 안전하게 실행하고 채점합니다.

## 지원 언어

- C (GCC 9.2.0)
- C++ (GCC 9.2.0)
- Java (OpenJDK 13.0.1)
- Python (3.8.1)
- JavaScript (Node.js 12.14.0)
- Go (1.13.5)
- Rust (1.40.0)
- C# (Mono 6.6.0)
- Ruby (2.7.0)
- Swift (5.2.3)
- Kotlin (1.3.70)

## 설치 및 실행

### 1. Judge0 Docker 컨테이너 시작

```bash
docker-compose -f docker-compose.judge0.yml up -d
```

### 2. 컨테이너 상태 확인

```bash
docker-compose -f docker-compose.judge0.yml ps
```

모든 컨테이너가 `Up` 상태여야 합니다:
- judge0-server (포트 2358)
- judge0-workers
- judge0-db (PostgreSQL)
- judge0-redis

### 3. Judge0 API 테스트

```bash
curl http://localhost:2358/languages
```

정상적으로 응답하면 설정이 완료된 것입니다.

## 환경 변수

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```env
JUDGE0_BASE_URL=http://localhost:2358
```

프로덕션 환경에서는 Judge0 서버 URL을 변경하세요.

## 채점 제한

현재 설정된 제한:
- CPU 시간: 최대 15초
- Wall 시간: 최대 30초
- 메모리: 최대 512MB
- 파일 크기: 최대 1MB

제한을 변경하려면 `docker-compose.judge0.yml` 파일의 환경 변수를 수정하세요:
- `MAX_CPU_TIME_LIMIT`: CPU 시간 제한 (초)
- `MAX_WALL_TIME_LIMIT`: Wall 시간 제한 (초)
- `MAX_MEMORY_LIMIT`: 메모리 제한 (KB)
- `MAX_FILE_SIZE`: 파일 크기 제한 (KB)

## API 사용법

### 코드 실행 요청

```bash
POST /api/judge/run
Content-Type: application/json

{
  "problemId": "minimum-wallet-size",
  "language": "PYTHON",
  "code": "def solution(prices, money):\n    return sum(1 for p in prices if p <= money)",
  "mode": "run"  // 또는 "submit"
}
```

### 응답 형식

```json
{
  "status": "AC",  // AC, WA, TLE, RE, CE
  "results": [
    {
      "testcaseId": "tc-1",
      "verdict": "AC",
      "timeMs": 150,
      "memoryKb": 8192,
      "stderr": null,
      "stdout": "result output"
    }
  ],
  "compileLog": null
}
```

## 문제 해결

### Judge0 서버가 시작되지 않을 때

1. 포트 충돌 확인:
```bash
lsof -i :2358
```

2. 로그 확인:
```bash
docker-compose -f docker-compose.judge0.yml logs judge0-server
```

3. 컨테이너 재시작:
```bash
docker-compose -f docker-compose.judge0.yml restart
```

### 채점이 실패할 때

1. Judge0 workers가 실행 중인지 확인:
```bash
docker-compose -f docker-compose.judge0.yml ps judge0-workers
```

2. Redis 연결 확인:
```bash
docker-compose -f docker-compose.judge0.yml exec judge0-redis redis-cli ping
```

3. 데이터베이스 연결 확인:
```bash
docker-compose -f docker-compose.judge0.yml exec judge0-db psql -U judge0 -c "SELECT 1;"
```

## 컨테이너 중지 및 제거

```bash
# 중지
docker-compose -f docker-compose.judge0.yml stop

# 중지 및 제거
docker-compose -f docker-compose.judge0.yml down

# 볼륨까지 완전 제거 (주의: 데이터 삭제됨)
docker-compose -f docker-compose.judge0.yml down -v
```

## 보안 고려사항

1. **프로덕션 환경**에서는 반드시 다음을 변경하세요:
   - PostgreSQL 비밀번호 (`POSTGRES_PASSWORD`)
   - Judge0 API 접근 제한 설정

2. 방화벽 설정:
   - Judge0 API 포트(2358)는 내부 네트워크에서만 접근 가능하도록 설정
   - 외부에서는 Next.js 서버를 통해서만 채점 요청

3. 리소스 제한:
   - Docker 컨테이너별 CPU/메모리 제한 설정 권장
   - 동시 제출 수 제한 (`MAX_QUEUE_SIZE`)

## 참고 자료

- [Judge0 공식 문서](https://github.com/judge0/judge0)
- [Judge0 API 문서](https://ce.judge0.com/)
- [지원 언어 전체 목록](https://github.com/judge0/judge0/blob/master/CHANGELOG.md#additional-languages)

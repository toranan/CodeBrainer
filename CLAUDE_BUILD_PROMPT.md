# Claude Code 자동 빌드 프롬프트

새로운 Claude 세션에서 아래 프롬프트를 복사하여 붙여넣으면 전체 프로젝트가 자동으로 빌드됩니다.

---

## 붙여넣을 프롬프트:

```
CodeBrainer 프로젝트를 처음부터 빌드하고 실행해줘. 다음 단계를 순서대로 진행해:

프로젝트 경로: /Users/anseung-won/Desktop/동국대학교/3-2/CodeBrainer

1. Docker Desktop이 실행 중인지 확인하고, 안 되어 있으면 실행해줘
2. backend 디렉토리로 이동해서 docker-compose로 모든 백엔드 서비스 시작
3. Judge0 데이터베이스 마이그레이션 실행 (docker exec -it backend-judge0-1 rails db:migrate)
4. Judge0 서비스 재시작 후 정상 작동 확인 (curl http://localhost:2358/about)
5. 프로젝트 루트에서 npm install 실행
6. npx prisma generate로 Prisma 클라이언트 생성
7. npx prisma db push로 데이터베이스 스키마 적용
8. npx prisma db seed로 초기 데이터 시딩 (4개 문제)
9. npm run dev로 Frontend 개발 서버 시작 (백그라운드)
10. 모든 서비스가 정상 작동하는지 확인:
    - Frontend: http://localhost:3000 (또는 3001)
    - Backend Orchestrator: http://localhost:8080/api/problems
    - Judge0: http://localhost:2358/about

각 단계마다 결과를 확인하고, 에러가 발생하면 해결한 후 다음 단계로 진행해줘.
```

---

## 예상 소요 시간
- 첫 실행: 약 5-10분 (Docker 이미지 다운로드 포함)
- 재실행: 약 2-3분

## 예상 결과
- PostgreSQL, RabbitMQ, Redis, Judge0, Orchestrator 서비스 실행
- Next.js 개발 서버 실행
- 데이터베이스에 4개의 문제 로드됨
- Frontend에서 문제 목록 확인 가능

## 문제 해결
만약 에러가 발생하면 다음과 같이 요청:
```
에러가 발생했어. 로그를 확인하고 문제를 해결해줘.
```

## 서비스 중지
작업이 끝나면 다음과 같이 요청:
```
모든 서비스를 중지해줘 (Docker 컨테이너와 npm 프로세스 모두)
```

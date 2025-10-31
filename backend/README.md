# CodeBrainer Backend API

Spring Boot 기반 백엔드 API 서버

## 기술 스택

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security** (BCryptPasswordEncoder)
- **Spring Data JPA**
- **PostgreSQL**
- **Lombok**

## 프로젝트 구조

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/codebrainer/
│   │   │   ├── CodeBrainerApplication.java   # 메인 애플리케이션
│   │   │   ├── config/
│   │   │   │   └── SecurityConfig.java        # Security 설정 (BCryptPasswordEncoder 빈)
│   │   │   ├── controller/
│   │   │   │   └── AuthController.java        # 인증 API 컨트롤러
│   │   │   ├── dto/
│   │   │   │   ├── SignUpRequest.java         # 회원가입 요청 DTO
│   │   │   │   ├── SignUpResponse.java        # 회원가입 응답 DTO
│   │   │   │   └── ErrorResponse.java         # 에러 응답 DTO
│   │   │   ├── entity/
│   │   │   │   └── User.java                  # 사용자 엔티티
│   │   │   ├── repository/
│   │   │   │   └── UserRepository.java        # 사용자 Repository
│   │   │   └── service/
│   │   │       └── UserService.java           # 사용자 Service (create 메서드)
│   │   └── resources/
│   │       └── application.yml                # 애플리케이션 설정
│   └── test/
├── build.gradle
└── settings.gradle
```

## 환경 설정

### 1. 데이터베이스 설정

PostgreSQL 데이터베이스를 생성하고 환경변수를 설정하세요.

```bash
# 환경변수 설정 (Windows PowerShell)
$env:DATABASE_URL="jdbc:postgresql://localhost:5432/codebrainer"
$env:DATABASE_USERNAME="postgres"
$env:DATABASE_PASSWORD="your_password"
```

또는 `application.yml` 파일을 직접 수정하세요.

### 2. 애플리케이션 실행

#### Gradle을 사용하여 실행

```bash
# Windows
.\gradlew.bat bootRun

# Linux/Mac
./gradlew bootRun
```

#### JAR 파일 빌드 및 실행

```bash
# 빌드
.\gradlew.bat build

# 실행
java -jar build/libs/codebrainer-backend-0.0.1-SNAPSHOT.jar
```

서버는 기본적으로 `http://localhost:8080`에서 실행됩니다.

## API 엔드포인트

### 회원가입

**POST** `/api/auth/signup`

#### 요청 본문

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동"
}
```

#### 성공 응답 (201 Created)

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "홍길동",
  "role": "USER",
  "createdAt": "2025-10-30T13:25:00"
}
```

#### 실패 응답 (400 Bad Request)

```json
{
  "status": 400,
  "message": "이메일은 필수입니다",
  "timestamp": "2025-10-30T13:25:00"
}
```

#### 실패 응답 (409 Conflict) - 이메일 중복

```json
{
  "status": 409,
  "message": "이미 존재하는 이메일입니다: user@example.com",
  "timestamp": "2025-10-30T13:25:00"
}
```

### 이메일 중복 체크

**GET** `/api/auth/check-email?email=user@example.com`

#### 성공 응답 (200 OK)

```json
{
  "available": true,
  "message": "사용 가능한 이메일입니다"
}
```

## 주요 기능

### 1. BCryptPasswordEncoder를 사용한 비밀번호 암호화

`SecurityConfig`에서 `BCryptPasswordEncoder`를 빈으로 등록하여 사용:

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

`UserService`의 `create` 메서드에서 비밀번호를 자동으로 암호화:

```java
String encodedPassword = passwordEncoder.encode(password);
```

### 2. 데이터 유효성 검증

- 이메일 형식 검증
- 비밀번호 최소 길이 8자
- 이름 2~50자
- 이메일 중복 체크

### 3. CORS 설정

Next.js 프론트엔드(`http://localhost:3000`)와 통신할 수 있도록 CORS 설정이 되어 있습니다.

## Next.js 프론트엔드와 연동

프론트엔드에서 회원가입 API 호출 예시:

```typescript
const response = await fetch('http://localhost:8080/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: '홍길동',
  }),
});

const data = await response.json();
```

## 트러블슈팅

### 포트 충돌

다른 애플리케이션이 8080 포트를 사용 중이라면:

```bash
$env:SERVER_PORT="8081"
.\gradlew.bat bootRun
```

### 데이터베이스 연결 오류

1. PostgreSQL이 실행 중인지 확인
2. 데이터베이스가 생성되었는지 확인
3. `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` 확인

## 개발자 정보

- Package: `com.codebrainer`
- Base URL: `/api`
- Default Port: `8080`


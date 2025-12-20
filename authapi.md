# 🔐 100원마켓 Auth API 문서

> 인증 관련 REST API 명세서

---

## 📡 기본 정보

| 항목            | 값                                  |
| --------------- | ----------------------------------- |
| Base URL (개발) | `http://localhost:3000/api`         |
| Base URL (운영) | `https://api.100won-market.com/api` |
| Content-Type    | `application/json`                  |
| 인증 방식       | Bearer Token (JWT)                  |

---

## 🔑 인증 헤더

인증이 필요한 API는 헤더에 JWT 토큰을 포함해야 합니다.

```
Authorization: Bearer {accessToken}

```

---

# API 목록

| 메서드 | 엔드포인트     | 설명     | 인증 필요 |
| ------ | -------------- | -------- | --------- |
| POST   | `/auth/signup` | 회원가입 | ❌        |
| POST   | `/auth/login`  | 로그인   | ❌        |
|        |                |          |           |
| POST   | `/auth/logout` | 로그아웃 | ✅        |
|        |                |          |           |
|        |                |          |           |
|        |                |          |           |

---

# 📝 API 상세

## POST `/auth/signup`

회원가입. 가입 성공 시 초기 포인트 1000 지급.

### Request

**Headers**

```
Content-Type: application/json

```

**Body**

```json
{
  "email": "string (required)",
  "password": "string (required, min 8자)",
  "nickname": "string (required, 예: 10기김시연)"
}
```

**Body 예시**

```json
{
  "email": "kimsy@example.com",
  "password": "password123!",
  "nickname": "10기김시연"
}
```

### Response

**200 OK**

```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "user": {
      "id": "uuid-1234",
      "email": "kimsy@example.com",
      "nickname": "10기김시연",
      "points": 1000,
      "createdAt": "2025-01-15T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**400 Bad Request - 유효성 검사 실패**

```json
{
  "success": false,
  "message": "유효성 검사에 실패했습니다.",
  "errors": [
    {
      "field": "email",
      "message": "올바른 이메일 형식이 아닙니다."
    },
    {
      "field": "password",
      "message": "비밀번호는 8자 이상이어야 합니다."
    }
  ]
}
```

**409 Conflict - 이메일 중복**

```json
{
  "success": false,
  "message": "이미 사용 중인 이메일입니다."
}
```

---

## POST `/auth/login`

로그인. JWT 토큰 발급.

### Request

**Body**

```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Body 예시**

```json
{
  "email": "kimsy@example.com",
  "password": "password123!"
}
```

### Response

**200 OK**

```json
{
  "success": true,
  "message": "로그인되었습니다.",
  "data": {
    "user": {
      "id": "uuid-1234",
      "email": "kimsy@example.com",
      "nickname": "10기김시연",
      "points": 1500
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**401 Unauthorized - 로그인 실패**

```json
{
  "success": false,
  "message": "이메일 또는 비밀번호가 일치하지 않습니다."
}
```

---

## POST `/auth/logout`

로그아웃. Refresh Token 무효화.

### Request

**Headers**

```
Authorization: Bearer {accessToken}

```

**Body**

```json
{
  "refreshToken": "string (required)"
}
```

### Response

**200 OK**

```json
{
  "success": true,
  "message": "로그아웃되었습니다."
}
```

---

# 🔒 JWT 토큰 정보

## Access Token

| 항목               | 값                       |
| ------------------ | ------------------------ |
| 유효기간           | 1시간                    |
| 용도               | API 인증                 |
| 저장 위치 (프론트) | 메모리 또는 localStorage |

**Payload 예시**

```json
{
  "sub": "uuid-1234",
  "email": "kimsy@example.com",
  "nickname": "10기김시연",
  "iat": 1705312800,
  "exp": 1705316400
}
```

---

# ⚠️ 공통 에러 응답

## 401 Unauthorized

인증 토큰이 없거나 만료됨.

```json
{
  "success": false,
  "message": "인증이 필요합니다.",
  "code": "UNAUTHORIZED"
}
```

## 403 Forbidden

권한 없음.

```json
{
  "success": false,
  "message": "권한이 없습니다.",
  "code": "FORBIDDEN"
}
```

## 500 Internal Server Error

서버 오류.

```json
{
  "success": false,
  "message": "서버 오류가 발생했습니다.",
  "code": "INTERNAL_ERROR"
}
```

---

# 🧪 테스트 예시 (cURL)

## 회원가입

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123!",
    "nickname": "10기테스트"
  }'

```

## 로그인

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123!"
  }'

```

# 📋 프론트엔드 연동 가이드

## 로그인 플로우

```tsx
// 1. 로그인 요청
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

const data = await response.json();

if (data.success) {
  // 2. 토큰 저장
  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);

  // 3. 소켓 연결
  const socket = io('http://localhost:3001/map', {
    auth: { token: data.data.accessToken },
  });
}
```

---

# 📝 변경 이력

| 날짜       | 버전   | 내용      |
| ---------- | ------ | --------- |
| 2025-01-15 | v1.0.0 | 최초 작성 |

---

# ❓ 문의

인증 관련 문의: **@이승준**

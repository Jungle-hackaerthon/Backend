# 📋 100원마켓 Request API 문서

> 요청(부탁) 시스템 REST API + WebSocket 명세서

---

## 📡 기본 정보

### REST API

| 항목            | 값                          |
| --------------- | --------------------------- |
| Base URL (개발) | `http://localhost:3000/api` |
| Content-Type    | `application/json`          |
| 인증 방식       | Bearer Token (JWT)          |

### WebSocket

| 항목      | 값                           |
| --------- | ---------------------------- |
| Namespace | `/map` (기존 맵 소켓에 통합) |
| 인증 방식 | `handshake.auth.token`에 JWT |

---

## 🎯 서비스 개념

```
요청(Request) = "누군가 해줬으면 하는 부탁"

예시:
- "택배실에서 물건 좀 찾아와주실 분" 100원
- "키를 두고 와서 내려와주실 분" 150원
- "편의점에서 음료수 사다 주실 분" 200원

플로우:
1. 요청자가 요청 생성 (잡상인 맵에 표시)
2. 도우미들이 응찰 (가격 제안)
3. 요청자가 마감 전 도우미 선택
4. 도우미가 부탁 수행
5. 요청자가 완료 처리 → 포인트 전송

```

---

# 📋 API 목록

## REST API

| 메서드 | 엔드포인트                         | 설명           | 인증 |
| ------ | ---------------------------------- | -------------- | ---- |
| POST   | `/requests`                        | 요청 생성      | ✅   |
| GET    | `/requests`                        | 요청 목록 조회 | ✅   |
| GET    | `/requests/:id`                    | 요청 상세 조회 | ✅   |
| DELETE | `/requests/:id`                    | 요청 취소      | ✅   |
| POST   | `/requests/:id/responses`          | 응찰하기       | ✅   |
| GET    | `/requests/:id/responses`          | 응찰 목록 조회 | ✅   |
| POST   | `/requests/:id/select/:responseId` | 도우미 선택    | ✅   |
| POST   | `/requests/:id/complete`           | 완료 처리      | ✅   |

## WebSocket 이벤트 (Map Namespace)

| 방향               | 이벤트            | 설명           |
| ------------------ | ----------------- | -------------- |
| 🔽 Server → Client | `request:created` | 새 요청 생성됨 |
| 🔽 Server → Client | `request:updated` | 요청 상태 변경 |
| 🔽 Server → Client | `request:deleted` | 요청 삭제됨    |

---

# 🔄 상태 플로우

```
┌─────────────┐     취소      ┌─────────────┐
│ IN_PROGRESS │ ───────────→ │  CANCELLED  │
│  (진행중)    │              │   (취소됨)   │
└─────────────┘              └─────────────┘
       │
       │ 완료
       ▼
┌─────────────┐
│  COMPLETED  │
│   (완료됨)   │
└─────────────┘

```

| 상태          | 설명                | 맵 표시 |
| ------------- | ------------------- | ------- |
| `in_progress` | 진행 중 (응찰 가능) | ✅ 표시 |
| `completed`   | 완료됨              | ❌ 삭제 |
| `cancelled`   | 취소됨              | ❌ 삭제 |

---

# 🌐 REST API 상세

## POST `/requests`

요청 생성. 잡상인이 맵에 표시됨.

### Request

**Headers**

```
Authorization: Bearer {accessToken}
Content-Type: application/json

```

**Body**

```json
{
  "title": "string (required)",
  "description": "string (required)",
  "proposedPrice": "number (optional, default: 100)",
  "mapId": "number (required, 1~6)",
  "xPosition": "number (required)",
  "yPosition": "number (required)"
}
```

**Body 예시**

```json
{
  "title": "택배실에서 물건 좀 찾아와주세요",
  "description": "3층 택배실에 제 이름으로 온 택배 있어요. 가져다주시면 감사!",
  "proposedPrice": 150,
  "mapId": 3,
  "xPosition": 200,
  "yPosition": 300
}
```

### Response

**201 Created**

```json
{
  "success": true,
  "message": "요청이 생성되었습니다.",
  "data": {
    "id": "request-uuid-1234",
    "requester": {
      "id": "user-uuid-1234",
      "nickname": "10기김시연"
    },
    "merchantName": "10기김시연_0",
    "title": "택배실에서 물건 좀 찾아와주세요",
    "description": "3층 택배실에 제 이름으로 온 택배 있어요.",
    "proposedPrice": 150,
    "mapId": 3,
    "xPosition": 200,
    "yPosition": 300,
    "deadline": "2025-01-15T15:10:00.000Z",
    "status": "in_progress",
    "createdAt": "2025-01-15T15:00:00.000Z"
  }
}
```

**+ Socket 브로드캐스트**

같은 맵에 있는 유저들에게 `request:created` 이벤트 전송

**400 Bad Request - 포인트 부족**

```json
{
  "success": false,
  "message": "포인트가 부족합니다. (보유: 50, 필요: 150)"
}
```

---

## GET `/requests`

요청 목록 조회. 맵ID로 필터링 가능.

### Request

**Headers**

```
Authorization: Bearer {accessToken}

```

**Query Parameters**

| 파라미터 | 타입   | 필수 | 설명             | 기본값      |
| -------- | ------ | ---- | ---------------- | ----------- |
| mapId    | number | ❌   | 맵 ID 필터 (1~6) | 전체        |
| status   | string | ❌   | 상태 필터        | in_progress |
| page     | number | ❌   | 페이지 번호      | 1           |
| limit    | number | ❌   | 페이지당 개수    | 20          |

**요청 예시**

```
GET /requests?mapId=3&status=in_progress

```

### Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "request-uuid-1234",
        "requester": {
          "id": "user-uuid-1234",
          "nickname": "10기김시연"
        },
        "merchantName": "10기김시연_0",
        "title": "택배실에서 물건 좀 찾아와주세요",
        "proposedPrice": 150,
        "mapId": 3,
        "xPosition": 200,
        "yPosition": 300,
        "deadline": "2025-01-15T15:10:00.000Z",
        "status": "in_progress",
        "responseCount": 3,
        "createdAt": "2025-01-15T15:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

## GET `/requests/:id`

요청 상세 조회. 응찰 목록 포함.

### Request

**Headers**

```
Authorization: Bearer {accessToken}

```

### Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "id": "request-uuid-1234",
    "requester": {
      "id": "user-uuid-1234",
      "nickname": "10기김시연"
    },
    "merchantName": "10기김시연_0",
    "title": "택배실에서 물건 좀 찾아와주세요",
    "description": "3층 택배실에 제 이름으로 온 택배 있어요. 가져다주시면 감사!",
    "proposedPrice": 150,
    "mapId": 3,
    "xPosition": 200,
    "yPosition": 300,
    "deadline": "2025-01-15T15:10:00.000Z",
    "status": "in_progress",
    "responses": [
      {
        "id": "response-uuid-001",
        "helper": {
          "id": "user-uuid-5678",
          "nickname": "10기박영수"
        },
        "proposedPrice": 100,
        "status": null,
        "createdAt": "2025-01-15T15:02:00.000Z"
      },
      {
        "id": "response-uuid-002",
        "helper": {
          "id": "user-uuid-9999",
          "nickname": "10기최민수"
        },
        "proposedPrice": 120,
        "status": null,
        "createdAt": "2025-01-15T15:03:00.000Z"
      }
    ],
    "selectedResponse": null,
    "createdAt": "2025-01-15T15:00:00.000Z"
  }
}
```

**404 Not Found**

```json
{
  "success": false,
  "message": "존재하지 않는 요청입니다."
}
```

---

## DELETE `/requests/:id`

요청 취소. 상태를 `cancelled`로 변경하고 맵에서 삭제.

### Request

**Headers**

```
Authorization: Bearer {accessToken}

```

### Response

**200 OK**

```json
{
  "success": true,
  "message": "요청이 취소되었습니다."
}
```

**+ Socket 브로드캐스트**

같은 맵에 있는 유저들에게 `request:deleted` 이벤트 전송

**403 Forbidden - 본인 요청 아님**

```json
{
  "success": false,
  "message": "본인의 요청만 취소할 수 있습니다."
}
```

**400 Bad Request - 이미 완료/취소됨**

```json
{
  "success": false,
  "message": "이미 완료되었거나 취소된 요청입니다."
}
```

---

## POST `/requests/:id/responses`

요청에 응찰하기. "제가 해드릴게요!"

### Request

**Headers**

```
Authorization: Bearer {accessToken}
Content-Type: application/json

```

**Body**

```json
{
  "proposedPrice": "number (optional, 제안 가격)"
}
```

**Body 예시**

```json
{
  "proposedPrice": 100
}
```

> 💡 proposedPrice를 안 보내면 요청자가 제시한 가격으로 응찰

### Response

**201 Created**

```json
{
  "success": true,
  "message": "응찰되었습니다.",
  "data": {
    "id": "response-uuid-003",
    "helper": {
      "id": "user-uuid-7777",
      "nickname": "10기이영희"
    },
    "proposedPrice": 100,
    "createdAt": "2025-01-15T15:05:00.000Z"
  }
}
```

**400 Bad Request - 본인 요청에 응찰**

```json
{
  "success": false,
  "message": "본인의 요청에는 응찰할 수 없습니다."
}
```

**400 Bad Request - 이미 응찰함**

```json
{
  "success": false,
  "message": "이미 응찰한 요청입니다."
}
```

**400 Bad Request - 마감됨**

```json
{
  "success": false,
  "message": "마감된 요청입니다."
}
```

---

## GET `/requests/:id/responses`

응찰 목록 조회.

### Request

**Headers**

```
Authorization: Bearer {accessToken}

```

### Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "responses": [
      {
        "id": "response-uuid-001",
        "helper": {
          "id": "user-uuid-5678",
          "nickname": "10기박영수"
        },
        "proposedPrice": 100,
        "status": null,
        "createdAt": "2025-01-15T15:02:00.000Z"
      },
      {
        "id": "response-uuid-002",
        "helper": {
          "id": "user-uuid-9999",
          "nickname": "10기최민수"
        },
        "proposedPrice": 120,
        "status": "selected",
        "createdAt": "2025-01-15T15:03:00.000Z"
      }
    ]
  }
}
```

---

## POST `/requests/:id/select/:responseId`

도우미 선택. 요청자만 가능.

### Request

**Headers**

```
Authorization: Bearer {accessToken}

```

### Response

**200 OK**

```json
{
  "success": true,
  "message": "도우미가 선택되었습니다.",
  "data": {
    "selectedResponse": {
      "id": "response-uuid-002",
      "helper": {
        "id": "user-uuid-9999",
        "nickname": "10기최민수"
      },
      "proposedPrice": 120
    }
  }
}
```

**403 Forbidden**

```json
{
  "success": false,
  "message": "본인의 요청만 도우미를 선택할 수 있습니다."
}
```

---

## POST `/requests/:id/complete`

요청 완료 처리. 포인트 전송됨.

### Request

**Headers**

```
Authorization: Bearer {accessToken}

```

### Response

**200 OK**

```json
{
  "success": true,
  "message": "요청이 완료되었습니다. 120 포인트가 전송되었습니다.",
  "data": {
    "request": {
      "id": "request-uuid-1234",
      "status": "completed"
    },
    "pointTransfer": {
      "from": "user-uuid-1234",
      "to": "user-uuid-9999",
      "amount": 120
    }
  }
}
```

**+ Socket 브로드캐스트**

같은 맵에 있는 유저들에게 `request:deleted` 이벤트 전송 (맵에서 제거)

**400 Bad Request - 도우미 미선택**

```json
{
  "success": false,
  "message": "먼저 도우미를 선택해주세요."
}
```

**403 Forbidden**

```json
{
  "success": false,
  "message": "본인의 요청만 완료 처리할 수 있습니다."
}
```

---

# 🔌 WebSocket 이벤트 (Map Namespace)

> 기존 /map 네임스페이스에 통합

## 🔽 Server → Client 이벤트

### `request:created`

새 요청이 생성되었을 때. 해당 맵에 있는 유저들에게 브로드캐스트.

**Payload**

```tsx
{
  id: string,
  requester: {
    id: string,
    nickname: string
  },
  merchantName: string,      // "10기김시연_0"
  title: string,
  proposedPrice: number,
  mapId: number,
  xPosition: number,
  yPosition: number,
  deadline: string,          // ISO 8601
  status: "in_progress",
  createdAt: string
}

```

**Payload 예시**

```tsx
{
  id: "request-uuid-1234",
  requester: {
    id: "user-uuid-1234",
    nickname: "10기김시연"
  },
  merchantName: "10기김시연_0",
  title: "택배실에서 물건 좀 찾아와주세요",
  proposedPrice: 150,
  mapId: 3,
  xPosition: 200,
  yPosition: 300,
  deadline: "2025-01-15T15:10:00.000Z",
  status: "in_progress",
  createdAt: "2025-01-15T15:00:00.000Z"
}

```

**사용 예시**

```tsx
mapSocket.on('request:created', (request) => {
  // 현재 맵이면 잡상인 추가
  if (currentMapId === request.mapId) {
    addMerchantToMap(request);
  }
});
```

---

### `request:updated`

요청 상태가 변경되었을 때.

**Payload**

```tsx
{
  id: string,
  status: "in_progress" | "completed" | "cancelled",
  // 변경된 필드들
}

```

---

### `request:deleted`

요청이 삭제(취소/완료)되었을 때. 맵에서 잡상인 제거.

**Payload**

```tsx
{
  id: string,
  mapId: number
}

```

**사용 예시**

```tsx
mapSocket.on('request:deleted', (data) => {
  if (currentMapId === data.mapId) {
    removeMerchantFromMap(data.id);
  }
});
```

---

# 🔄 전체 플로우

```
┌─────────────────────────────────────────────────────────────────┐
│  1. 요청 생성                                                    │
│     POST /requests                                              │
│     → DB 저장                                                   │
│     → 포인트 홀드 (차감)                                         │
│     → Socket: request:created (해당 맵 브로드캐스트)              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. 도우미들 응찰                                                │
│     POST /requests/:id/responses                                │
│     → 여러 명 응찰 가능                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. 요청자가 도우미 선택                                          │
│     POST /requests/:id/select/:responseId                       │
│     → 마감 전까지 가격/사람 보고 선택                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. 완료 처리                                                    │
│     POST /requests/:id/complete                                 │
│     → 상태: completed                                           │
│     → 포인트 전송 (요청자 → 도우미)                               │
│     → Socket: request:deleted (맵에서 제거)                      │
└─────────────────────────────────────────────────────────────────┘

```

---

# 💡 프론트엔드 연동 가이드

## 맵 입장 시 요청 목록 로드

```tsx
const enterMap = async (mapId: number) => {
  // 1. 해당 맵의 요청 목록 조회
  const response = await fetch(
    `/api/requests?mapId=${mapId}&status=in_progress`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const { data } = await response.json();

  // 2. 맵에 잡상인들 표시
  data.requests.forEach((request) => {
    addMerchantToMap(request);
  });

  // 3. 실시간 이벤트 리스닝
  mapSocket.on('request:created', (req) => {
    if (req.mapId === mapId) addMerchantToMap(req);
  });

  mapSocket.on('request:deleted', (data) => {
    if (data.mapId === mapId) removeMerchantFromMap(data.id);
  });
};
```

## 요청 생성

```tsx
const createRequest = async (data: CreateRequestDto) => {
  const response = await fetch('/api/requests', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  // 생성 후 소켓으로 다른 유저들에게 자동 브로드캐스트됨
};
```

---

# 🧪 테스트 예시 (cURL)

## 요청 생성

```bash
curl -X POST http://localhost:3000/api/requests \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "택배 좀 찾아와주세요",
    "description": "3층 택배실이요",
    "proposedPrice": 150,
    "mapId": 3,
    "xPosition": 200,
    "yPosition": 300
  }'

```

## 요청 목록 조회

```bash
curl -X GET "http://localhost:3000/api/requests?mapId=3" \
  -H "Authorization: Bearer {token}"

```

## 응찰하기

```bash
curl -X POST http://localhost:3000/api/requests/{requestId}/responses \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"proposedPrice": 100}'

```

## 도우미 선택

```bash
curl -X POST http://localhost:3000/api/requests/{requestId}/select/{responseId} \
  -H "Authorization: Bearer {token}"

```

## 완료 처리

```bash
curl -X POST http://localhost:3000/api/requests/{requestId}/complete \
  -H "Authorization: Bearer {token}"

```

---

# 📝 타입 정의 (TypeScript)

```tsx
// types/request.ts

export type RequestStatus = 'in_progress' | 'completed' | 'cancelled';

export interface RequestUser {
  id: string;
  nickname: string;
}

export interface Request {
  id: string;
  requester: RequestUser;
  merchantName: string;
  title: string;
  description: string;
  proposedPrice: number;
  mapId: number;
  xPosition: number;
  yPosition: number;
  deadline: string;
  status: RequestStatus;
  responseCount?: number;
  createdAt: string;
}

export interface RequestResponse {
  id: string;
  helper: RequestUser;
  proposedPrice: number;
  status: string | null;
  createdAt: string;
}

export interface RequestDetail extends Request {
  responses: RequestResponse[];
  selectedResponse: RequestResponse | null;
}

// DTOs
export interface CreateRequestDto {
  title: string;
  description: string;
  proposedPrice?: number;
  mapId: number;
  xPosition: number;
  yPosition: number;
}

export interface CreateResponseDto {
  proposedPrice?: number;
}
```

---

# ⚠️ 에러 응답

## 400 Bad Request

```json
{
  "success": false,
  "message": "에러 메시지"
}
```

## 401 Unauthorized

```json
{
  "success": false,
  "message": "인증이 필요합니다."
}
```

## 403 Forbidden

```json
{
  "success": false,
  "message": "권한이 없습니다."
}
```

## 404 Not Found

```json
{
  "success": false,
  "message": "존재하지 않는 요청입니다."
}
```

---

# 📋 변경 이력

| 날짜       | 버전   | 내용      |
| ---------- | ------ | --------- |
| 2025-01-15 | v1.0.0 | 최초 작성 |

---

# ❓ 문의

요청 시스템 관련 문의: **@Mr.리**

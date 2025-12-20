# 💬 100원마켓 Chat API 문서

> 채팅 관련 REST API + WebSocket 명세서

---

## 📡 기본 정보

### REST API

| 항목            | 값                          |
| --------------- | --------------------------- |
| Base URL (개발) | `http://localhost:3000/api` |
| Content-Type    | `application/json`          |
| 인증 방식       | Bearer Token (JWT)          |

### WebSocket

| 항목       | 값                           |
| ---------- | ---------------------------- |
| URL (개발) | `ws://localhost:3000/chat`   |
| 인증 방식  | `handshake.auth.token`에 JWT |

---

# 📋 API 목록

## REST API

| 메서드 | 엔드포인트                 | 설명                  | 인증 |
| ------ | -------------------------- | --------------------- | ---- |
| POST   | `/chat/rooms`              | 채팅방 조회 또는 생성 | ✅   |
| GET    | `/chat/rooms`              | 내 채팅방 목록        | ✅   |
| GET    | `/chat/rooms/:id`          | 채팅방 상세           | ✅   |
| GET    | `/chat/rooms/:id/messages` | 메시지 조회           | ✅   |
| POST   | `/chat/rooms/:id/messages` | 메시지 전송 (REST)    | ✅   |

## WebSocket 이벤트

| 방향               | 이벤트         | 설명        |
| ------------------ | -------------- | ----------- |
| 🔼 Client → Server | `chat:join`    | 채팅방 입장 |
| 🔼 Client → Server | `chat:send`    | 메시지 전송 |
| 🔼 Client → Server | `chat:leave`   | 채팅방 퇴장 |
| 🔽 Server → Client | `chat:message` | 메시지 수신 |

---

# ⚠️ 중요: 메시지 저장 정책

```
┌─────────────────────────────────────────────────────────────────┐
│  모든 메시지는 전송 방식에 관계없이 무조건 DB에 저장됩니다.        │
└─────────────────────────────────────────────────────────────────┘

Socket (chat:send)  →  DB 저장  →  상대방에게 실시간 브로드캐스트
REST API (POST)     →  DB 저장  →  상대방 접속 중이면 브로드캐스트
```

---

# 🌐 REST API 상세

## POST `/chat/rooms`

채팅방 조회 또는 생성.

- 기존 채팅방 있으면 → 기존 채팅방 반환
- 없으면 → 새로 생성 후 반환

### Request

**Headers**

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body**

```json
{
  "targetUserId": "string (required, 상대방 userId)"
}
```

**Body 예시**

```json
{
  "targetUserId": "user-uuid-5678"
}
```

### Response

**200 OK - 기존 채팅방 반환**

```json
{
  "success": true,
  "message": "기존 채팅방을 불러왔습니다.",
  "data": {
    "id": "room-uuid-1234",
    "isNew": false,
    "user1": {
      "id": "user-uuid-1234",
      "nickname": "10기김시연"
    },
    "user2": {
      "id": "user-uuid-5678",
      "nickname": "10기박영수"
    },
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

**201 Created - 새 채팅방 생성**

```json
{
  "success": true,
  "message": "채팅방이 생성되었습니다.",
  "data": {
    "id": "room-uuid-9999",
    "isNew": true,
    "user1": {
      "id": "user-uuid-1234",
      "nickname": "10기김시연"
    },
    "user2": {
      "id": "user-uuid-5678",
      "nickname": "10기박영수"
    },
    "createdAt": "2025-01-16T14:00:00.000Z"
  }
}
```

**400 Bad Request - 본인과 채팅 시도**

```json
{
  "success": false,
  "message": "본인과는 채팅할 수 없습니다."
}
```

**404 Not Found - 상대방 없음**

```json
{
  "success": false,
  "message": "존재하지 않는 사용자입니다."
}
```

### 백엔드 로직 참고

```typescript
async findOrCreateRoom(userId: string, targetUserId: string) {
  // 기존 채팅방 조회 (user1-user2 또는 user2-user1 조합)
  const existingRoom = await this.chatRoomRepository.findOne({
    where: [
      { user1: { id: userId }, user2: { id: targetUserId } },
      { user1: { id: targetUserId }, user2: { id: userId } },
    ],
  });

  if (existingRoom) {
    return { room: existingRoom, isNew: false };
  }

  // 없으면 새로 생성
  const newRoom = await this.chatRoomRepository.save({
    user1: { id: userId },
    user2: { id: targetUserId },
  });

  return { room: newRoom, isNew: true };
}
```

---

## GET `/chat/rooms`

내 채팅방 목록 조회. 최신 메시지 기준 정렬.

### Request

**Headers**

```
Authorization: Bearer {accessToken}
```

**Query Parameters**

| 파라미터 | 타입   | 필수 | 설명          | 기본값 |
| -------- | ------ | ---- | ------------- | ------ |
| page     | number | ❌   | 페이지 번호   | 1      |
| limit    | number | ❌   | 페이지당 개수 | 20     |

**요청 예시**

```
GET /chat/rooms?page=1&limit=20
```

### Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "id": "room-uuid-1234",
        "opponent": {
          "id": "user-uuid-5678",
          "nickname": "10기박영수"
        },
        "lastMessage": {
          "content": "안녕하세요!",
          "messageType": "TEXT",
          "createdAt": "2025-01-15T14:30:00.000Z"
        },
        "createdAt": "2025-01-15T10:00:00.000Z"
      },
      {
        "id": "room-uuid-5678",
        "opponent": {
          "id": "user-uuid-9999",
          "nickname": "10기최민수"
        },
        "lastMessage": null,
        "createdAt": "2025-01-14T09:00:00.000Z"
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

## GET `/chat/rooms/:id`

채팅방 상세 정보 조회.

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
    "id": "room-uuid-1234",
    "user1": {
      "id": "user-uuid-1234",
      "nickname": "10기김시연"
    },
    "user2": {
      "id": "user-uuid-5678",
      "nickname": "10기박영수"
    },
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

**403 Forbidden - 권한 없음**

```json
{
  "success": false,
  "message": "해당 채팅방에 접근 권한이 없습니다."
}
```

**404 Not Found**

```json
{
  "success": false,
  "message": "존재하지 않는 채팅방입니다."
}
```

---

## GET `/chat/rooms/:id/messages`

채팅방 메시지 조회. 최신순 정렬 (페이지네이션).

### Request

**Headers**

```
Authorization: Bearer {accessToken}
```

**Query Parameters**

| 파라미터 | 타입   | 필수 | 설명          | 기본값 |
| -------- | ------ | ---- | ------------- | ------ |
| page     | number | ❌   | 페이지 번호   | 1      |
| limit    | number | ❌   | 페이지당 개수 | 50     |

**요청 예시**

```
GET /chat/rooms/room-uuid-1234/messages?page=1&limit=50
```

### Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg-uuid-003",
        "sender": {
          "id": "user-uuid-5678",
          "nickname": "10기박영수"
        },
        "content": "네 가능합니다!",
        "messageType": "TEXT",
        "createdAt": "2025-01-15T14:32:00.000Z"
      },
      {
        "id": "msg-uuid-002",
        "sender": {
          "id": "user-uuid-1234",
          "nickname": "10기김시연"
        },
        "content": "https://s3.../image.jpg",
        "messageType": "IMAGE",
        "createdAt": "2025-01-15T14:31:00.000Z"
      },
      {
        "id": "msg-uuid-001",
        "sender": {
          "id": "user-uuid-1234",
          "nickname": "10기김시연"
        },
        "content": "안녕하세요! 거래 가능할까요?",
        "messageType": "TEXT",
        "createdAt": "2025-01-15T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 3,
      "totalPages": 1
    }
  }
}
```

**403 Forbidden**

```json
{
  "success": false,
  "message": "해당 채팅방에 접근 권한이 없습니다."
}
```

---

## POST `/chat/rooms/:id/messages`

메시지 전송 (REST API). DB에 저장 후 상대방이 채팅방에 접속 중이면 소켓으로도 전달.

### Request

**Headers**

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body**

```json
{
  "content": "string (required)",
  "messageType": "TEXT | IMAGE (optional, default: TEXT)"
}
```

**Body 예시 - 텍스트**

```json
{
  "content": "안녕하세요!",
  "messageType": "TEXT"
}
```

**Body 예시 - 이미지**

```json
{
  "content": "https://s3.../verification.jpg",
  "messageType": "IMAGE"
}
```

### Response

**201 Created**

```json
{
  "success": true,
  "data": {
    "id": "msg-uuid-004",
    "sender": {
      "id": "user-uuid-1234",
      "nickname": "10기김시연"
    },
    "content": "안녕하세요!",
    "messageType": "TEXT",
    "createdAt": "2025-01-15T14:35:00.000Z"
  }
}
```

**403 Forbidden**

```json
{
  "success": false,
  "message": "해당 채팅방에 접근 권한이 없습니다."
}
```

### 백엔드 로직 참고

```typescript
async sendMessage(roomId: string, senderId: string, dto: SendMessageDto) {
  // 1. DB에 저장 (무조건)
  const message = await this.messageRepository.save({
    room: { id: roomId },
    sender: { id: senderId },
    content: dto.content,
    messageType: dto.messageType || 'TEXT',
  });

  // 2. 상대방이 채팅방에 접속 중이면 소켓으로 전달
  this.chatGateway.sendToRoom(roomId, 'chat:message', {
    id: message.id,
    roomId,
    sender: { id: senderId, nickname: sender.nickname },
    content: message.content,
    messageType: message.messageType,
    createdAt: message.createdAt,
  });

  // 3. 상대방이 미접속이면 알림 생성 (선택)
  // await this.notificationService.create(...)

  return message;
}
```

---

# 🔌 WebSocket 상세

## 연결

```typescript
import { io } from 'socket.io-client';

const chatSocket = io('http://localhost:3000/chat', {
  auth: {
    token: localStorage.getItem('accessToken'),
  },
  transports: ['websocket'],
});

chatSocket.on('connect', () => {
  console.log('Chat socket connected');
});

chatSocket.on('connect_error', (error) => {
  console.error('Connection failed:', error.message);
});
```

---

## 🔼 Client → Server 이벤트

### `chat:join`

채팅방 입장. 메시지 실시간 수신 시작.

**Request**

```typescript
socket.emit(
  'chat:join',
  {
    roomId: 'room-uuid-1234',
  },
  (response) => {
    console.log(response);
  },
);
```

**Response (callback)**

```typescript
{
  success: true,
  message: "채팅방에 입장했습니다."
}

// 또는 에러
{
  success: false,
  message: "채팅방에 접근 권한이 없습니다."
}
```

---

### `chat:send`

메시지 전송. **DB에 저장 후** 상대방에게 `chat:message`로 실시간 전달.

**Request**

```typescript
socket.emit(
  'chat:send',
  {
    roomId: 'room-uuid-1234',
    content: '안녕하세요!',
    messageType: 'TEXT', // "TEXT" | "IMAGE"
  },
  (response) => {
    console.log(response);
  },
);
```

**Request 예시 - 이미지**

```typescript
socket.emit('chat:send', {
  roomId: 'room-uuid-1234',
  content: 'https://s3.../image.jpg',
  messageType: 'IMAGE',
});
```

**Response (callback)**

```typescript
{
  success: true,
  data: {
    id: "msg-uuid-004",
    sender: {
      id: "user-uuid-1234",
      nickname: "10기김시연"
    },
    content: "안녕하세요!",
    messageType: "TEXT",
    createdAt: "2025-01-15T14:35:00.000Z"
  }
}
```

### 백엔드 로직 참고

```typescript
@SubscribeMessage('chat:send')
async handleSend(client: Socket, payload: ChatSendPayload) {
  const userId = client.data.user.sub;

  // 1. DB에 저장 (무조건!)
  const message = await this.chatService.createMessage({
    roomId: payload.roomId,
    senderId: userId,
    content: payload.content,
    messageType: payload.messageType,
  });

  // 2. 같은 채팅방에 있는 모든 클라이언트에게 브로드캐스트
  this.server.to(`room:${payload.roomId}`).emit('chat:message', {
    id: message.id,
    roomId: payload.roomId,
    sender: {
      id: oderId,
      nickname: message.sender.nickname,
    },
    content: message.content,
    messageType: message.messageType,
    createdAt: message.createdAt,
  });

  // 3. 전송자에게 콜백 응답
  return { success: true, data: message };
}
```

---

### `chat:leave`

채팅방 퇴장. 해당 채팅방 메시지 수신 중단.

**Request**

```typescript
socket.emit('chat:leave', {
  roomId: 'room-uuid-1234',
});
```

---

## 🔽 Server → Client 이벤트

### `chat:message`

새 메시지 수신. 해당 채팅방에 `chat:join` 상태일 때만 수신.

**Payload**

```typescript
{
  id: string,
  roomId: string,
  sender: {
    id: string,
    nickname: string
  },
  content: string,
  messageType: "TEXT" | "IMAGE",
  createdAt: string  // ISO 8601
}
```

**Payload 예시**

```typescript
{
  id: "msg-uuid-005",
  roomId: "room-uuid-1234",
  sender: {
    id: "user-uuid-5678",
    nickname: "10기박영수"
  },
  content: "네 좋습니다!",
  messageType: "TEXT",
  createdAt: "2025-01-15T14:36:00.000Z"
}
```

**사용 예시**

```typescript
chatSocket.on('chat:message', (message) => {
  // 현재 보고 있는 채팅방이면 화면에 추가
  if (currentRoomId === message.roomId) {
    appendMessage(message);
    scrollToBottom();
  }
});
```

---

# 🔄 전체 흐름 정리

## 채팅방 진입 플로우

```
1. "채팅하기" 버튼 클릭
           │
           ▼
2. POST /chat/rooms { targetUserId }
           │
     ┌─────┴─────┐
     │           │
   기존 있음    없음
     │           │
     ▼           ▼
   반환        생성 후 반환
     │           │
     └─────┬─────┘
           │
           ▼
3. GET /chat/rooms/:id/messages (기존 메시지 로드)
           │
           ▼
4. socket.emit('chat:join', { roomId })  (실시간 수신 시작)
```

## 메시지 전송 플로우

```
메시지 전송
     │
     ▼
┌─────────────────┐
│  소켓 연결됨?    │
└─────────────────┘
     │
  ┌──┴──┐
  │     │
 Yes    No
  │     │
  ▼     ▼
Socket  REST API
chat:send  POST /messages
  │     │
  └──┬──┘
     │
     ▼
┌─────────────────┐
│   DB 저장       │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ 채팅방에 있는    │
│ 클라이언트에게   │
│ 브로드캐스트     │
└─────────────────┘
```

---

# 💡 프론트엔드 연동 가이드

## 채팅방 입장 + 메시지 로드

```typescript
const openChat = async (targetUserId: string) => {
  // 1. 채팅방 조회 또는 생성
  const roomRes = await fetch('/api/chat/rooms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ targetUserId }),
  });
  const { data: room } = await roomRes.json();

  // 2. 기존 메시지 로드
  const msgRes = await fetch(`/api/chat/rooms/${room.id}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { data } = await msgRes.json();
  setMessages(data.messages);

  // 3. 소켓으로 채팅방 조인 (실시간 수신 시작)
  chatSocket.emit('chat:join', { roomId: room.id }, (res) => {
    if (res.success) {
      console.log('채팅방 입장 완료');
    }
  });

  // 4. 실시간 메시지 수신
  chatSocket.on('chat:message', (message) => {
    if (message.roomId === room.id) {
      setMessages((prev) => [...prev, message]);
    }
  });
};
```

## 메시지 전송

```typescript
const sendMessage = (content: string, type: 'TEXT' | 'IMAGE' = 'TEXT') => {
  if (chatSocket.connected) {
    // 소켓으로 전송 (DB 저장 + 실시간 전달)
    chatSocket.emit(
      'chat:send',
      {
        roomId,
        content,
        messageType: type,
      },
      (res) => {
        if (res.success) {
          // 내 메시지는 chat:message 이벤트로 받아서 처리
          // 또는 여기서 직접 추가해도 됨
        }
      },
    );
  } else {
    // 소켓 끊겼으면 REST로 폴백
    fetch(`/api/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, messageType: type }),
    });
  }
};
```

## 채팅방 나가기

```typescript
// 다른 페이지로 이동 시
useEffect(() => {
  return () => {
    chatSocket.emit('chat:leave', { roomId });
    chatSocket.off('chat:message');
  };
}, [roomId]);
```

---

# 🧪 테스트 예시

## cURL - 채팅방 조회/생성

```bash
curl -X POST http://localhost:3000/api/chat/rooms \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"targetUserId": "user-uuid-5678"}'
```

## cURL - 메시지 조회

```bash
curl -X GET "http://localhost:3000/api/chat/rooms/room-uuid-1234/messages?page=1&limit=50" \
  -H "Authorization: Bearer {token}"
```

## cURL - 메시지 전송 (REST)

```bash
curl -X POST http://localhost:3000/api/chat/rooms/room-uuid-1234/messages \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"content": "안녕하세요!", "messageType": "TEXT"}'
```

## 브라우저 콘솔 - 소켓 테스트

```javascript
const socket = io('http://localhost:3000/chat', {
  auth: { token: 'YOUR_JWT_TOKEN' },
});

socket.on('connect', () => {
  console.log('✅ Connected');

  // 채팅방 입장
  socket.emit('chat:join', { roomId: 'room-uuid-1234' }, (res) => {
    console.log('Join result:', res);
  });
});

// 메시지 수신
socket.on('chat:message', (msg) => {
  console.log('📩 New message:', msg);
});

// 메시지 전송 (DB 저장됨!)
socket.emit(
  'chat:send',
  {
    roomId: 'room-uuid-1234',
    content: '테스트 메시지',
    messageType: 'TEXT',
  },
  (res) => {
    console.log('Send result:', res);
  },
);
```

---

# 📝 타입 정의 (TypeScript)

```typescript
// types/chat.ts

export type MessageType = 'TEXT' | 'IMAGE';

export interface ChatUser {
  id: string;
  nickname: string;
}

export interface ChatRoom {
  id: string;
  isNew?: boolean;
  user1: ChatUser;
  user2: ChatUser;
  createdAt: string;
}

export interface ChatRoomListItem {
  id: string;
  opponent: ChatUser;
  lastMessage: {
    content: string;
    messageType: MessageType;
    createdAt: string;
  } | null;
  createdAt: string;
}

export interface Message {
  id: string;
  roomId?: string;
  sender: ChatUser;
  content: string;
  messageType: MessageType;
  createdAt: string;
}

// Socket 이벤트 페이로드
export interface ChatJoinPayload {
  roomId: string;
}

export interface ChatSendPayload {
  roomId: string;
  content: string;
  messageType: MessageType;
}

export interface ChatLeavePayload {
  roomId: string;
}
```

---

# ⚠️ 에러 응답

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
  "message": "해당 채팅방에 접근 권한이 없습니다."
}
```

## 404 Not Found

```json
{
  "success": false,
  "message": "존재하지 않는 채팅방입니다."
}
```

---

# 📋 변경 이력

| 날짜       | 버전   | 내용                                               |
| ---------- | ------ | -------------------------------------------------- |
| 2025-01-15 | v1.0.0 | 최초 작성                                          |
| 2025-01-15 | v1.1.0 | 채팅방 findOrCreate 로직 추가, 메시지 DB 저장 명시 |

---

# ❓ 문의

채팅 관련 문의: **@채팅담당자**

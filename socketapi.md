# 🔌 100원마켓 Socket API 문서 v2

> 프론트엔드 연동을 위한 WebSocket API 명세서

---

## 📡 연결 정보

| 항목            | 값                                |
| --------------- | --------------------------------- |
| Base URL (개발) | `ws://localhost:3001`             |
| Base URL (운영) | `ws://api.100won-market.com`      |
| 프로토콜        | Socket.io v4                      |
| 인증 방식       | `handshake.auth.token`에 JWT 전달 |

### Namespaces

| Namespace       | 설명                                |
| --------------- | ----------------------------------- |
| `/map`          | 맵 이동, 유저 위치, 상인 NPC 동기화 |
| `/chat`         | 1:1 채팅, 인증 채팅                 |
| `/notification` | 실시간 알림                         |

---

## 🔐 연결 방법

### 설치

```bash
npm install socket.io-client

```

### 기본 연결

```tsx
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001/map', {
  auth: {
    token: 'your-jwt-token', // localStorage.getItem('accessToken')
  },
  transports: ['websocket'],
});

// 연결 성공
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

// 연결 에러
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error.message);
});

// 연결 해제
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
```

---

# 📍 Map Namespace (`/map`)

> 맵 내 유저 이동, 위치 동기화, 상인 NPC 실시간 업데이트

## 이벤트 요약

### 유저 이동 관련

| 방향               | 이벤트명      | 설명                |
| ------------------ | ------------- | ------------------- |
| 🔼 Client → Server | `map:join`    | 맵 입장             |
| 🔼 Client → Server | `map:move`    | 위치 이동           |
| 🔼 Client → Server | `map:leave`   | 맵 퇴장             |
| 🔽 Server → Client | `users:list`  | 현재 접속 유저 목록 |
| 🔽 Server → Client | `user:joined` | 새 유저 입장 알림   |
| 🔽 Server → Client | `user:moved`  | 유저 이동 알림      |
| 🔽 Server → Client | `user:left`   | 유저 퇴장 알림      |

### 상인 NPC 관련

| 방향               | 이벤트명           | 설명                 |
| ------------------ | ------------------ | -------------------- |
| 🔽 Server → Client | `merchant:created` | 새 상인 NPC 생성됨   |
| 🔽 Server → Client | `merchant:updated` | 상인 NPC 정보 수정됨 |
| 🔽 Server → Client | `merchant:deleted` | 상인 NPC 삭제됨      |

### 경매 관련

| 방향               | 이벤트명        | 설명         |
| ------------------ | --------------- | ------------ |
| 🔽 Server → Client | `auction:bid`   | 새 입찰 발생 |
| 🔽 Server → Client | `auction:ended` | 경매 종료    |

---

## 🔼 Client → Server 이벤트

### `map:join`

맵에 입장할 때 호출. 입장 후 `users:list`와 기존 상인 NPC 목록을 받음.

**Request**

```tsx
socket.emit(
  'map:join',
  {
    organizationId: string, // 조직 ID
    x: number, // 초기 X 좌표
    y: number, // 초기 Y 좌표
  },
  (response) => {
    console.log(response);
  },
);
```

**Request 예시**

```tsx
socket.emit('map:join', {
  organizationId: 'org-uuid-1234',
  x: 100,
  y: 200,
});
```

**Response (callback)**

```tsx
{
  success: boolean,
  message?: string
}

```

---

### `map:move`

캐릭터 이동 시 호출. 같은 맵의 다른 유저들에게 `user:moved` 이벤트로 브로드캐스트됨.

**Request**

```tsx
socket.emit('map:move', {
  x: number, // 이동한 X 좌표
  y: number, // 이동한 Y 좌표
  direction: 'up' | 'down' | 'left' | 'right', // 바라보는 방향
});
```

**Request 예시**

```tsx
socket.emit('map:move', {
  x: 150,
  y: 200,
  direction: 'right',
});
```

**⚠️ 주의사항**

- 이동할 때마다 호출하지 말고, 적절히 throttle 적용 권장 (50~100ms)
- 클라이언트에서 충돌 체크 후 유효한 좌표만 전송

---

### `map:leave`

맵에서 퇴장할 때 호출. 다른 유저들에게 `user:left` 이벤트로 브로드캐스트됨.

**Request**

```tsx
socket.emit('map:leave');
```

---

## 🔽 Server → Client 이벤트 (유저)

### `users:list`

`map:join` 성공 후 현재 맵에 접속 중인 유저 목록 수신.

**Payload**

```tsx
Array<{
  userId: string;
  nickname: string; // 예: "10기김시연"
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
}>;
```

**Payload 예시**

```tsx
[
  {
    userId: 'user-uuid-1',
    nickname: '10기김철수',
    x: 100,
    y: 200,
    direction: 'down',
  },
  {
    userId: 'user-uuid-2',
    nickname: '10기이영희',
    x: 300,
    y: 150,
    direction: 'left',
  },
];
```

**사용 예시**

```tsx
socket.on('users:list', (users) => {
  users.forEach((user) => {
    renderCharacter(user);
  });
});
```

---

### `user:joined`

새로운 유저가 맵에 입장했을 때 수신. (본인 제외)

**Payload**

```tsx
{
  userId: string,
  nickname: string,
  x: number,
  y: number,
  direction: 'up' | 'down' | 'left' | 'right'
}

```

---

### `user:moved`

다른 유저가 이동했을 때 수신.

**Payload**

```tsx
{
  userId: string,
  x: number,
  y: number,
  direction: 'up' | 'down' | 'left' | 'right'
}

```

**💡 팁: 부드러운 이동**

```tsx
socket.on('user:moved', (data) => {
  // 즉시 이동 대신 보간(interpolation) 적용
  moveCharacterSmooth(data.userId, data.x, data.y, 100); // 100ms 동안 이동
});
```

---

### `user:left`

유저가 맵에서 퇴장했을 때 수신.

**Payload**

```tsx
{
  userId: string;
}
```

---

## 🔽 Server → Client 이벤트 (상인 NPC)

### `merchant:created`

새로운 상인 NPC가 생성되었을 때 수신. 맵에 즉시 표시해야 함.

**Payload**

```tsx
{
  id: string,
  ownerId: string,              // 생성자 ID
  name: string,                 // 예: "10기김시연_0", "10기김시연_1"
  type: 'AUCTION' | 'REQUEST' | 'GIVEAWAY',
  title: string,                // 광고 제목
  description: string,
  imageUrl?: string,
  reward: number,               // 보상 포인트
  currentPrice?: number,        // 경매 현재가 (AUCTION만)
  deadline?: string,            // 마감시간 (ISO 8601)
  x: number,
  y: number,
  createdAt: string
}

```

**Payload 예시**

```tsx
{
  id: "merchant-uuid-1234",
  ownerId: "user-uuid-1",
  name: "10기김시연_0",
  type: "AUCTION",
  title: "안쓰는 키보드 팝니다",
  description: "로지텍 G512, 상태 좋음",
  imageUrl: "https://s3.../keyboard.jpg",
  reward: 0,
  currentPrice: 100,
  deadline: "2025-01-16T18:00:00.000Z",
  x: 250,
  y: 300,
  createdAt: "2025-01-15T10:00:00.000Z"
}

```

**사용 예시**

```tsx
socket.on('merchant:created', (merchant) => {
  // 맵에 NPC 즉시 추가
  addMerchantNPC(merchant);

  // 말풍선 표시
  showBubble(merchant.x, merchant.y, merchant.title);
});
```

---

### `merchant:updated`

상인 NPC 정보가 수정되었을 때 수신.

**Payload**

```tsx
{
  id: string,
  // 변경된 필드들만 포함
  title?: string,
  description?: string,
  currentPrice?: number,  // 입찰로 인한 가격 변경
  // ...
}

```

**사용 예시**

```tsx
socket.on('merchant:updated', (data) => {
  updateMerchantNPC(data.id, data);
});
```

---

### `merchant:deleted`

상인 NPC가 삭제되었을 때 수신.

**Payload**

```tsx
{
  id: string;
}
```

**사용 예시**

```tsx
socket.on('merchant:deleted', (data) => {
  removeMerchantNPC(data.id);
});
```

---

## 🔽 Server → Client 이벤트 (경매)

### `auction:bid`

경매에 새 입찰이 발생했을 때 수신. 해당 경매 상세 모달이 열려있다면 실시간 업데이트.

**Payload**

```tsx
{
  merchantId: string,
  userId: string,         // 입찰자 ID
  bidderNickname: string,   // 입찰자 닉네임
  amount: number,           // 입찰 금액
  previousPrice: number,    // 이전 최고가
  createdAt: string
}

```

**Payload 예시**

```tsx
{
  merchantId: "merchant-uuid-1234",
  userId: "user-uuid-2",
  bidderNickname: "10기박영수",
  amount: 250,
  previousPrice: 200,
  createdAt: "2025-01-15T14:30:00.000Z"
}

```

**사용 예시**

```tsx
socket.on('auction:bid', (data) => {
  // 경매 현재가 업데이트
  updateAuctionPrice(data.merchantId, data.amount);

  // 입찰 기록에 추가
  addBidHistory(data);

  // 내가 최고 입찰자였는데 갱신당했으면 알림
  if (data.previousBidderId === myUserId) {
    showAlert('입찰이 갱신되었습니다!');
  }
});
```

---

### `auction:ended`

경매가 종료되었을 때 수신.

**Payload**

```tsx
{
  merchantId: string,
  winnerId: string | null,     // 낙찰자 ID (입찰 없으면 null)
  winnerNickname: string | null,
  finalPrice: number | null,
  status: 'SOLD' | 'UNSOLD'    // 낙찰됨 / 유찰
}

```

**Payload 예시**

```tsx
// 낙찰
{
  merchantId: "merchant-uuid-1234",
  winnerId: "user-uuid-3",
  winnerNickname: "10기최민수",
  finalPrice: 350,
  status: "SOLD"
}

// 유찰 (입찰자 없음)
{
  merchantId: "merchant-uuid-5678",
  winnerId: null,
  winnerNickname: null,
  finalPrice: null,
  status: "UNSOLD"
}

```

**사용 예시**

```tsx
socket.on('auction:ended', (data) => {
  // 경매 종료 표시
  markAuctionAsEnded(data.merchantId);

  // 내가 낙찰자면 축하 모달
  if (data.winnerId === myUserId) {
    showWinModal(data);
  }
});
```

---

# 💬 Chat Namespace (`/chat`)

> 1:1 채팅 및 거래 인증 채팅
>
> ⚠️ **오프라인 지원**: 메시지는 DB에 저장되므로 상대방이 오프라인이어도 전송 가능. 상대방 접속 시 미읽은 메시지 수신.

## 이벤트 요약

| 방향               | 이벤트명       | 설명                       |
| ------------------ | -------------- | -------------------------- |
| 🔼 Client → Server | `chat:join`    | 채팅방 입장                |
| 🔼 Client → Server | `chat:send`    | 메시지 전송                |
| 🔼 Client → Server | `chat:leave`   | 채팅방 퇴장                |
| 🔼 Client → Server | `chat:typing`  | 입력 중 표시               |
| 🔼 Client → Server | `chat:read`    | 메시지 읽음 처리           |
| 🔽 Server → Client | `chat:message` | 새 메시지 수신             |
| 🔽 Server → Client | `chat:typing`  | 상대방 입력 중             |
| 🔽 Server → Client | `chat:unread`  | 접속 시 안읽은 메시지 목록 |

---

## 🔼 Client → Server 이벤트

### `chat:join`

채팅방 입장. REST API로 채팅방 생성/조회 후 roomId로 입장.

**Request**

```tsx
socket.emit(
  'chat:join',
  {
    roomId: string,
  },
  (response) => {
    console.log(response);
  },
);
```

**Response (callback)**

```tsx
{
  success: boolean,
  unreadCount: number,  // 안읽은 메시지 수
  message?: string
}

```

---

### `chat:send`

메시지 전송.

- 상대방 **온라인**: `chat:message`로 실시간 전달
- 상대방 **오프라인**: DB 저장 후 외부 알림 (이메일/슬랙)

**Request**

```tsx
socket.emit('chat:send', {
  roomId: string,
  content: string,
  imageUrl?: string  // 이미지 첨부 시 (S3 URL 등)
}, (response) => {
  // 전송 성공 여부
  console.log(response);
});

```

**Request 예시**

```tsx
// 텍스트 메시지
socket.emit(
  'chat:send',
  {
    roomId: 'room-uuid-1234',
    content: '안녕하세요! 거래 가능할까요?',
  },
  (res) => {
    if (res.success) {
      // 내 채팅창에 메시지 추가
      appendMyMessage(res.message);
    }
  },
);

// 이미지 포함 메시지 (인증 사진)
socket.emit('chat:send', {
  roomId: 'room-uuid-1234',
  content: '인증 사진입니다.',
  imageUrl: 'https://s3.../verification.jpg',
});
```

**Response (callback)**

```tsx
{
  success: boolean,
  message: {
    id: string,
    content: string,
    imageUrl?: string,
    createdAt: string
  }
}

```

---

### `chat:leave`

채팅방 퇴장.

**Request**

```tsx
socket.emit('chat:leave', {
  roomId: string,
});
```

---

### `chat:typing`

입력 중 표시.

**Request**

```tsx
socket.emit('chat:typing', {
  roomId: string,
  isTyping: boolean,
});
```

**💡 팁: Debounce 적용**

```tsx
// 입력 시작
onInputFocus() {
  socket.emit('chat:typing', { roomId, isTyping: true });
}

// 입력 멈춤 (1초 후)
onInputBlur() {
  debounce(() => {
    socket.emit('chat:typing', { roomId, isTyping: false });
  }, 1000);
}

```

---

### `chat:read`

메시지 읽음 처리. 채팅방 열 때 호출.

**Request**

```tsx
socket.emit('chat:read', {
  roomId: string,
  lastMessageId: string, // 마지막으로 읽은 메시지 ID
});
```

---

## 🔽 Server → Client 이벤트

### `chat:message`

새 메시지 수신.

**Payload**

```tsx
{
  id: string,
  roomId: string,
  senderId: string,
  senderNickname: string,
  content: string,
  imageUrl?: string,
  createdAt: string  // ISO 8601 format
}

```

**Payload 예시**

```tsx
{
  id: "msg-uuid-5678",
  roomId: "room-uuid-1234",
  senderId: "user-uuid-1",
  senderNickname: "10기김철수",
  content: "안녕하세요!",
  imageUrl: null,
  createdAt: "2025-01-15T10:30:00.000Z"
}

```

**사용 예시**

```tsx
socket.on('chat:message', (message) => {
  // 현재 열린 채팅방이면 메시지 추가
  if (currentRoomId === message.roomId) {
    appendMessage(message);
    // 읽음 처리
    socket.emit('chat:read', {
      roomId: message.roomId,
      lastMessageId: message.id,
    });
  } else {
    // 다른 채팅방이면 알림만
    showNotification(`${message.senderNickname}: ${message.content}`);
    incrementUnreadBadge(message.roomId);
  }
});
```

---

### `chat:typing`

상대방 입력 중 상태 수신.

**Payload**

```tsx
{
  roomId: string,
  userId: string,
  nickname: string,
  isTyping: boolean
}

```

---

### `chat:unread`

접속 시 안읽은 메시지가 있는 채팅방 목록. `/chat` 네임스페이스 연결 시 자동 수신.

**Payload**

```tsx
Array<{
  roomId: string;
  unreadCount: number;
  lastMessage: {
    content: string;
    createdAt: string;
  };
}>;
```

**Payload 예시**

```tsx
[
  {
    roomId: 'room-uuid-1',
    unreadCount: 3,
    lastMessage: {
      content: '내일 거래 가능하세요?',
      createdAt: '2025-01-15T09:00:00.000Z',
    },
  },
  {
    roomId: 'room-uuid-2',
    unreadCount: 1,
    lastMessage: {
      content: '감사합니다!',
      createdAt: '2025-01-14T18:30:00.000Z',
    },
  },
];
```

---

# 🔔 Notification Namespace (`/notification`)

> 실시간 알림 (입찰, 낙찰, 인증 승인 등)
>
> ⚠️ **오프라인 지원**: 오프라인 시 이메일/슬랙으로 알림 발송 (유저 설정에 따름)

## 이벤트 요약

| 방향               | 이벤트명               | 설명                     |
| ------------------ | ---------------------- | ------------------------ |
| 🔽 Server → Client | `notification`         | 실시간 알림 수신         |
| 🔽 Server → Client | `notifications:unread` | 접속 시 미확인 알림 목록 |

---

## 연결

```tsx
const notificationSocket = io('http://localhost:3001/notification', {
  auth: { token: 'your-jwt-token' },
  transports: ['websocket'],
});
```

---

## 🔽 Server → Client 이벤트

### `notification`

실시간 알림 수신.

**Payload**

```tsx
{
  id: string,
  type: NotificationType,
  title: string,
  content: string,
  relatedId?: string,  // 관련 엔티티 ID (merchantId, chatRoomId 등)
  createdAt: string
}

```

**NotificationType**

| Type                     | 설명                           | relatedId  |
| ------------------------ | ------------------------------ | ---------- |
| `BID`                    | 내 경매에 새 입찰              | merchantId |
| `OUTBID`                 | 내 입찰이 갱신됨               | merchantId |
| `AUCTION_WON`            | 경매 낙찰                      | merchantId |
| `AUCTION_ENDED`          | 내 경매 종료                   | merchantId |
| `REQUEST_ACCEPTED`       | 내 부탁이 수락됨               | merchantId |
| `VERIFICATION_SUBMITTED` | 인증이 제출됨                  | merchantId |
| `VERIFICATION_APPROVED`  | 인증 승인됨                    | merchantId |
| `VERIFICATION_REJECTED`  | 인증 거절됨                    | merchantId |
| `CHAT`                   | 새 채팅 메시지 (오프라인 전용) | chatRoomId |
| `POINT_RECEIVED`         | 포인트 획득                    | -          |

**Payload 예시**

```tsx
{
  id: "notif-uuid-1234",
  type: "BID",
  title: "새로운 입찰",
  content: "10기박영수님이 '안쓰는 키보드' 경매에 250포인트를 입찰했습니다.",
  relatedId: "merchant-uuid-5678",
  createdAt: "2025-01-15T10:30:00.000Z"
}

```

**사용 예시**

```tsx
notificationSocket.on('notification', (notification) => {
  // 토스트 알림 표시
  showToast(notification.title, notification.content);

  // 알림 카운트 증가
  incrementNotificationBadge();

  // 타입별 처리
  switch (notification.type) {
    case 'AUCTION_WON':
      showConfetti();
      showWinModal(notification.relatedId);
      break;
    case 'CHAT':
      playChatSound();
      break;
    case 'VERIFICATION_APPROVED':
      showSuccessModal('인증이 승인되었습니다!');
      refreshPoints(); // 포인트 갱신
      break;
  }
});
```

---

### `notifications:unread`

접속 시 미확인 알림 목록. 연결되면 자동으로 수신됨.

**Payload**

```tsx
Array<{
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  relatedId?: string;
  createdAt: string;
}>;
```

**사용 예시**

```tsx
notificationSocket.on('notifications:unread', (notifications) => {
  // 알림 뱃지 업데이트
  setNotificationBadge(notifications.length);

  // 알림 목록에 추가
  notifications.forEach((n) => addToNotificationList(n));
});
```

---

# 📴 오프라인 처리 로직

## 동작 방식

```
이벤트 발생 (채팅, 입찰 등)
        │
        ▼
┌───────────────────┐
│   DB에 무조건 저장  │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  유저 온라인 체크   │
└───────────────────┘
        │
   ┌────┴────┐
   │         │
   ▼         ▼
온라인      오프라인
   │         │
   ▼         ▼
Socket     5분 대기
전송         │
             ▼
        아직 오프라인?
             │
        ┌────┴────┐
        │         │
        ▼         ▼
       Yes        No
        │         │
        ▼         ▼
    외부 알림    스킵
  (이메일/슬랙)

```

## 외부 알림 발송 조건

| 조건                                     | 발송 여부 |
| ---------------------------------------- | --------- |
| 유저가 오프라인 + 5분 경과 + 아직 안읽음 | ✅ 발송   |
| 유저가 5분 내 접속함                     | ❌ 스킵   |
| 유저가 이미 읽음                         | ❌ 스킵   |
| 유저가 외부 알림 비활성화                | ❌ 스킵   |

## 유저 알림 설정

유저는 마이페이지에서 설정 가능:

```tsx
{
  notificationPreference: {
    email: boolean,         // 이메일 알림 허용
    slack: boolean,         // 슬랙 알림 허용
    slackWebhook?: string,  // 개인 슬랙 웹훅 URL
  }
}

```

---

# ⚠️ 에러 처리

## 연결 에러

```tsx
socket.on('connect_error', (error) => {
  if (error.message === 'Unauthorized') {
    // 토큰 만료 → 재로그인 또는 토큰 갱신
    refreshToken();
  }
});
```

## 이벤트 에러

```tsx
socket.on('exception', (error) => {
  console.error('Socket error:', error);
  // { status: 'error', message: '에러 메시지' }
});
```

## 재연결

```tsx
socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // 서버에서 강제 종료 → 수동 재연결
    socket.connect();
  }
  // 그 외는 자동 재연결 시도
});

socket.on('reconnect', (attemptNumber) => {
  console.log(`Reconnected after ${attemptNumber} attempts`);
  // 재연결 후 map:join 다시 호출 필요
  socket.emit('map:join', { organizationId, x: lastX, y: lastY });
});
```

---

# 🧪 테스트 방법

## 브라우저 콘솔 테스트

```jsx
// Socket.io CDN 로드 후
const socket = io('http://localhost:3001/map', {
  auth: { token: 'YOUR_JWT_TOKEN' },
});

// 연결 확인
socket.on('connect', () => {
  console.log('✅ Connected');
  socket.emit('map:join', { organizationId: 'test-org', x: 100, y: 100 });
});

// 유저 이벤트
socket.on('users:list', (users) => console.log('👥 Users:', users));
socket.on('user:joined', (user) => console.log('➡️ Joined:', user));
socket.on('user:moved', (data) => console.log('🚶 Moved:', data));
socket.on('user:left', (data) => console.log('⬅️ Left:', data));

// 상인 이벤트
socket.on('merchant:created', (m) => console.log('🏪 Created:', m));
socket.on('merchant:updated', (m) => console.log('📝 Updated:', m));
socket.on('merchant:deleted', (m) => console.log('🗑️ Deleted:', m));

// 경매 이벤트
socket.on('auction:bid', (b) => console.log('💰 Bid:', b));
socket.on('auction:ended', (a) => console.log('🔨 Ended:', a));
```

---

# 📝 타입 정의 (TypeScript)

프론트엔드에서 사용할 타입 정의:

```tsx
// types/socket.ts

// 방향
export type Direction = 'up' | 'down' | 'left' | 'right';

// 상인 타입
export type MerchantType = 'AUCTION' | 'REQUEST' | 'GIVEAWAY';

// 알림 타입
export type NotificationType =
  | 'BID'
  | 'OUTBID'
  | 'AUCTION_WON'
  | 'AUCTION_ENDED'
  | 'REQUEST_ACCEPTED'
  | 'VERIFICATION_SUBMITTED'
  | 'VERIFICATION_APPROVED'
  | 'VERIFICATION_REJECTED'
  | 'CHAT'
  | 'POINT_RECEIVED';

// 유저 위치 정보
export interface UserPosition {
  userId: string;
  nickname: string;
  x: number;
  y: number;
  direction: Direction;
}

// 상인 NPC
export interface Merchant {
  id: string;
  ownerId: string;
  name: string; // "10기김시연_0"
  type: MerchantType;
  title: string;
  description: string;
  imageUrl?: string;
  reward: number;
  currentPrice?: number;
  deadline?: string;
  x: number;
  y: number;
  createdAt: string;
}

// 입찰 정보
export interface BidInfo {
  merchantId: string;
  userId: string;
  bidderNickname: string;
  amount: number;
  previousPrice: number;
  createdAt: string;
}

// 채팅 메시지
export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderNickname: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

// 알림
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  relatedId?: string;
  createdAt: string;
}
```

---

# 📋 변경 이력

| 날짜       | 버전   | 내용                                                                                                        |
| ---------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| 2025-01-15 | v1.0.0 | 최초 작성                                                                                                   |
| 2025-01-15 | v2.0.0 | 상인 NPC 실시간 이벤트 추가, 경매 이벤트 추가, 오프라인 처리 로직 추가, 상인 이름 형식 변경 (10기김시연\_0) |

---

# ❓ 문의

소켓 관련 문의: **@백엔드담당자**

NestJS + TypeORM 기반 실시간 2D 공간 + 게시글 + 1:1 채팅 MVP 백엔드 프로젝트를 초기화해줘.

📌 프로젝트 성격

- 해커톤 1박 2일 MVP
- 실시간 아바타 이동 + 게시글 + DM 중심
- 프론트는 Canvas 기반 (게임 엔진 사용 X)
- 아직 기능 구현은 하지 말고 “구조 + 설정 + 소켓 골격”까지만

📌 기술 스택

- Node.js (LTS)
- NestJS
- TypeScript
- Socket.IO
- PostgreSQL
- TypeORM
- Docker / docker-compose
- (선택) Redis (Socket.IO adapter용)

📌 필수 패키지

- @nestjs/websockets
- @nestjs/platform-socket.io
- socket.io
- @nestjs/typeorm
- typeorm
- pg
- class-validator
- class-transformer
- dotenv
- uuid
- redisI/o adpater

📌 프로젝트 구조 (중요)
아래 구조를 정확히 만들어줘:

src/
├─ app.module.ts
├─ main.ts
├─ config/
│ ├─ env.config.ts
│ └─ socket.config.ts
├─ common/
│ ├─ constants/
│ ├─ decorators/
│ └─ utils/
├─ realtime/
│ ├─ realtime.gateway.ts // Socket.IO Gateway (join, move 등)
│ ├─ realtime.module.ts
│ └─ dto/
│ ├─ join-room.dto.ts
│ └─ move.dto.ts
├─ rooms/
│ ├─ rooms.module.ts
│ └─ rooms.service.ts
├─ posts/
│ ├─ posts.module.ts
│ ├─ posts.controller.ts
│ └─ posts.service.ts
├─ dm/
│ ├─ dm.module.ts
│ ├─ dm.gateway.ts
│ └─ dm.service.ts
└─ entities/
├─ user.entity.ts
├─ room.entity.ts
├─ post.entity.ts
├─ dm-thread.entity.ts
└─ dm-message.entity.ts

📌 Socket.IO 초기 골격

- namespace: `/realtime`
- Gateway에서 이벤트 시그니처만 선언 (구현 X)
  - join_room
  - move
  - disconnect
- Redis adapter는 주석으로만 남길 것 (실제 적용 X)

📌 TypeORM 설정

- PostgreSQL 연결 설정만 완료
- synchronize: true (해커톤용)
- 엔티티는 컬럼 최소화 + TODO 주석으로 상세 설계 위치만 남길 것

📌 환경 변수

- .env.example 생성
  - DATABASE_URL
  - PORT
  - REDIS_URL (optional)

📌 Docker

- docker-compose.yml 생성
  - app (NestJS)
  - postgres
  - (optional) redis
- 개발용 설정만 포함 (볼륨 포함)

📌 중요 규칙

- 실제 비즈니스 로직 구현 금지
- 인증/인가 구현 금지
- 테스트 코드 작성 금지
- 모든 파일에 “이후 구현 포인트”를 주석으로 명확히 남길 것

📌 목표
이 /init 결과물로 바로

- Socket 이벤트 로직 추가
- 게시글 CRUD 구현
- 프론트와 실시간 연동
  을 시작할 수 있어야 한다.

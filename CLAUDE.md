# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **hackathon backend** for "100원마켓" - a 2D spatial marketplace application where users can buy/sell products, make requests, chat, and receive points. The frontend uses Canvas (no game engine), and this backend provides REST APIs, Socket.IO for real-time features, and SSE for notifications.

**Tech Stack**: NestJS, TypeScript, Socket.IO, PostgreSQL, TypeORM, JWT Auth, Swagger, Docker

**Current State**: Core features are implemented including auth, real-time map, chat, products, requests, points, and SSE-based notifications. This is beyond MVP stage with working business logic.

## Common Commands

### Development

```bash
npm run start:dev          # Start in watch mode (most common)
npm run start:debug        # Start with debugging
npm run build              # Build for production
npm run start:prod         # Run production build
```

### Testing

```bash
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run e2e tests
npm run test:debug         # Debug tests
```

### Code Quality

```bash
npm run lint               # Run ESLint with auto-fix
npm run format             # Format code with Prettier
```

### Docker

```bash
docker-compose up -d       # Start PostgreSQL
docker-compose down        # Stop services
```

### Swagger API Docs

After starting the server, API documentation is available at:
- http://localhost:3000/docs

## Architecture

### Application Setup

- **Global prefix**: `/api` for all REST endpoints
- **CORS**: Enabled for all origins (should be restricted in production)
- **Validation**: Global ValidationPipe with transform and whitelist enabled
- **Swagger**: Auto-generated API docs at `/docs` with Bearer auth support
- **TypeORM sync**: `synchronize: true` (hackathon mode - DO NOT use in production)

### Domain-Driven Module Structure

The application follows NestJS modular architecture with domain modules under `src/domain/`:

#### **Auth Module** (`/domain/auth/`)
- JWT-based authentication (1h token expiry)
- Passport JWT strategy with guards (`JwtAuthGuard`, `WsJwtGuard`)
- Endpoints: signup, login, logout
- Initial point grant: 1000 points on signup
- bcrypt password hashing (salt rounds: 10)

#### **Map Module** (`/domain/map/`)
- Socket.IO gateway at `/map` namespace
- Real-time user position tracking and synchronization
- NPC merchant updates (create/update/delete broadcasts)
- Auction bid events and auction end notifications
- Events: `map:join`, `map:move`, `map:leave` (client → server)
- Events: `users:list`, `user:joined`, `user:moved`, `user:left` (server → client)
- Events: `merchant:created/updated/deleted`, `auction:bid/ended` (server → client)

#### **Chats Module** (`/domain/chats/`)
- Dual interface: REST API + Socket.IO gateway at `/chat` namespace
- 1:1 chat rooms with automatic room creation/retrieval
- All messages saved to DB regardless of transmission method (REST or WebSocket)
- WebSocket events: `chat:join`, `chat:send`, `chat:leave` (client → server), `chat:message` (server → client)
- REST endpoints: create/get rooms, list rooms, get/send messages

#### **Products Module** (`/domain/products/`)
- Product listings with map positioning (x, y coordinates, mapId)
- Status: AVAILABLE, RESERVED, SOLD
- Auction system with bids and deadlines
- Image URLs stored as text array

#### **Requests Module** (`/domain/requests/`)
- User request system with proposed prices
- Request responses from helpers
- Status: IN_PROGRESS, COMPLETED, CANCELED
- Map positioning for location-based requests

#### **Notifications Module** (`/domain/notifications/`)
- **SSE-based** real-time notifications (not Socket.IO)
- In-memory RxJS Subject streams per user
- Auto-formatted message parsing via `resolveNotificationMessage` utility
- Endpoints: `GET /api/notifications/stream/:userId` (SSE), `PATCH /api/notifications/:id/read`
- Stream cleanup on finalize

#### **Points Module** (`/domain/points/`)
- Point transaction tracking
- Tracks counterparty and source type (PRODUCT, AUCTION, REQUEST)
- User point balance stored in User entity

#### **Users Module** (`/domain/users/`)
- User profiles with avatars, nicknames, point balances
- Current map tracking (mapId stored as integer, non-relational)

### Shared Infrastructure

#### **Entities** (`/src/domain/*/entities/`, `/src/chats/entities/`)
- All entities extend `BaseEntity` with `id` (UUID), `createdAt`, `updatedAt`
- Entities scattered across domain modules (not centralized)
- Key entities: User, Product, AuctionBid, Request, RequestResponse, ChatRoom, Message, Notification, PointTransaction

#### **Common** (`/src/common/`)
- `base.entity.ts` - Base entity with UUID primary key and timestamps
- `decorators/user.decorator.ts` - `@UserId()` decorator extracts user ID from JWT
- `constants/notification-event-type.ts` - Notification event type constants

#### **Config** (`/src/config/`)
- `env.config.ts` - Environment configuration (PORT, DATABASE_URL, JWT secrets)
- `socket.config.ts` - Socket.IO configuration (prepared for Redis adapter, currently commented out)

### Database Schema

PostgreSQL with TypeORM. Key constraints:
- Chat rooms: `CONSTRAINT chk_chat_rooms_order CHECK (user1_id < user2_id)` ensures unique 1:1 rooms
- Point balance: `CHECK (point_balance >= 0)`
- Point transactions: `CHECK (amount > 0)`
- Foreign keys with appropriate CASCADE/SET NULL behaviors
- See `schema.sql` for complete DDL

### Socket.IO Architecture

Three separate namespaces:
1. **/map** - User positioning, NPC merchants, auction events
2. **/chat** - 1:1 messaging (with REST API fallback)
3. **/notification** - NOT used (notifications use SSE instead)

**Authentication**: All Socket.IO connections require JWT in `handshake.auth.token`

**Redis Adapter**: Prepared but commented out in code - uncomment for horizontal scaling

## Key Conventions

### Authentication Patterns

- REST endpoints: Use `@UseGuards(JwtAuthGuard)` and `@UserId()` decorator
- WebSocket handlers: Use `WsJwtGuard` for Socket.IO events
- JWT payload: `{ sub: userId, email, nickname }`

### DTO Handling

- **CRITICAL ANTI-PATTERN**: Do NOT destructure or reconstruct DTOs in controllers before passing to services
  - Bad: `service.method(dto.id, { field1: dto.field1 })`
  - Good: `service.method(dto)`
- All DTOs use `class-validator` decorators
- Global ValidationPipe applies automatic transformation and whitelist

### Response Format

Many endpoints return structured responses:
```typescript
{
  success: boolean,
  message: string,
  data: { ... }
}
```

### Code Style

- ESLint with TypeScript recommended config (see `eslint.config.mjs`)
- Disabled rules: `no-explicit-any`, `no-floating-promises`, `no-unsafe-*` rules
- Prettier with `endOfLine: 'auto'`
- Single quotes, trailing commas (Prettier default)
- Unused vars generate warnings (not errors)

## Environment Variables

Required (see `.env.example`):

```bash
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://hackerton:hackerton123@localhost:5432/hackerton
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=1h
# REDIS_URL=redis://localhost:6379  # Optional for Socket.IO scaling
```

## API Documentation

The project includes detailed API specs in markdown:
- `authapi.md` - Authentication endpoints
- `chatapi.md` - Chat REST + WebSocket API
- `mapapi.md` - Map Socket.IO events (includes merchant/auction)

These docs provide request/response examples and event payloads for frontend integration.

## Development Workflow

1. **Start database**: `docker-compose up -d`
2. **Start dev server**: `npm run start:dev`
3. **Access Swagger docs**: http://localhost:3000/docs
4. **Frontend connects to**:
   - REST API: `http://localhost:3000/api/*`
   - Socket.IO Map: `ws://localhost:3000/map`
   - Socket.IO Chat: `ws://localhost:3000/chat`
   - SSE Notifications: `GET http://localhost:3000/api/notifications/stream/:userId`

## Important Implementation Notes

### Notification System Uses SSE, Not WebSockets
- Notifications use Server-Sent Events (SSE) via `@Sse()` decorator
- In-memory RxJS Subject per user (lost on server restart - consider Redis for production)
- Frontend should use EventSource API, not Socket.IO client

### Map IDs Are Non-Relational
- `mapId` stored as INTEGER in users, products, requests
- No foreign key constraint - managed at application level
- Coordinate system: x/y positions stored as INTEGER or DOUBLE PRECISION

### Chat Room Uniqueness
- Two users always have exactly one chat room
- Database enforces ordering: `user1_id < user2_id`
- Service layer handles swapping user IDs before query

### TypeORM Synchronize Mode
- `synchronize: true` auto-syncs schema changes
- Convenient for rapid development but NEVER use in production
- Use migrations for production deployments

### Testing
- Test scaffolds exist but most are unimplemented
- Focus on manual testing via Swagger and Socket.IO clients during hackathon

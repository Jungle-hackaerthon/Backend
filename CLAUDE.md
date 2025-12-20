# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **hackathon MVP backend** (1-2 days) for a real-time 2D spatial application with posts and 1:1 chat functionality. The frontend uses Canvas (no game engine), and this backend provides REST APIs and Socket.IO for real-time features.

**Tech Stack**: NestJS, TypeScript, Socket.IO, PostgreSQL, TypeORM, Docker

## Common Commands

### Development

```bash
npm run start:dev          # Start in watch mode
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
docker-compose up -d       # Start PostgreSQL (and Redis if configured)
docker-compose down        # Stop services
```

## Architecture

### Module Structure

The application follows NestJS modular architecture with domain-driven design:

- **`realtime/`** - Socket.IO gateway for real-time avatar movement
  - Uses namespace `/realtime`
  - Handles: `join_room`, `move`, `disconnect` events
  - Redis adapter support prepared (commented out for MVP)

- **`rooms/`** - Room/space management service
  - Manages 2D spatial rooms where users interact

- **`posts/`** - REST API for posts/boards
  - CRUD operations for posts within rooms

- **`dm/`** - 1:1 chat via Socket.IO
  - Separate gateway for direct messaging
  - Manages DM threads and messages

- **`entities/`** - TypeORM entities (shared across modules)
  - `user.entity.ts` - User accounts
  - `room.entity.ts` - Spatial rooms
  - `post.entity.ts` - Posts/boards
  - `dm-thread.entity.ts` - DM conversations
  - `dm-message.entity.ts` - Individual DM messages

- **`config/`** - Configuration modules
  - `env.config.ts` - Environment variable management
  - `socket.config.ts` - Socket.IO configuration

- **`common/`** - Shared utilities
  - `constants/` - Application constants
  - `decorators/` - Custom decorators
  - `utils/` - Helper functions

### TypeORM Configuration

- **synchronize: true** - Auto-sync schema (hackathon mode, DO NOT use in production)
- Connection configured via `DATABASE_URL` environment variable
- All entities in `src/entities/` are auto-loaded

### Socket.IO Architecture

Two separate gateways:

1. **RealtimeGateway** (`/realtime` namespace) - Avatar movement, room presence
2. **DmGateway** - Direct messaging between users

Redis adapter configuration is prepared but commented out - can be enabled for horizontal scaling.

## Key Conventions

### Entity Design

- Entities are minimal for MVP
- All entities include TODO comments indicating future implementation points
- Use `class-validator` decorators for DTOs
- Use `class-transformer` for serialization

### Socket Event Patterns

- Event handlers are declared but implementation details are marked with TODOs
- DTOs in `dto/` folders validate incoming Socket.IO payloads
- Use typed event interfaces for type safety

### Code Style

- ESLint with TypeScript recommended config
- Prettier with single quotes, trailing commas
- No explicit `any` warnings (can be used sparingly)
- Floating promises generate warnings
- **ANTI-PATTERN**: Do not destructure or reconstruct DTOs in controllers before passing to services. Pass DTOs directly to service methods.
  - Bad: `service.method(dto.id, { field1: dto.field1, field2: dto.field2 })`
  - Good: `service.method(dto)`

## Environment Variables

Required variables (see `.env`):

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3000)
- `REDIS_URL` - (Optional) Redis connection for Socket.IO adapter

## Implementation Notes

### Current State (Skeleton Only)

- Project structure is complete
- Entities have basic columns
- Socket.IO gateways have event signatures
- Services/controllers are scaffolded
- **No business logic implemented yet**

### Ready for Implementation

The skeleton is designed so you can immediately add:

1. Socket.IO event handlers in gateways
2. Service methods for business logic
3. REST endpoints in controllers
4. Entity relationships and additional fields
5. Frontend integration

### What's Deliberately Excluded

- Authentication/authorization (add later if needed)
- Test implementations (scaffolds exist)
- Detailed validation rules
- Error handling middleware
- Rate limiting

## Development Workflow

1. **Start dependencies**: `docker-compose up -d`
2. **Start dev server**: `npm run start:dev`
3. **Implement features** in this order (recommended):
   - Complete entity relationships
   - Implement room service logic
   - Add Socket.IO event handlers
   - Build REST endpoints for posts
   - Add DM functionality
4. **Test with frontend** Canvas application

## Socket.IO Integration

### Realtime Gateway Events

```typescript
// join_room - User enters a spatial room
// move - User avatar position update
// disconnect - User leaves
```

### DM Gateway Events

```typescript
// (To be defined during implementation)
```

Frontend should connect to:

- `http://localhost:3000/realtime` - For avatar/room features
- Default namespace - For DM features

## Database Schema

All entities use TypeORM decorators. Current minimal schema is in `src/entities/`. Relationships and additional fields should be added as implementation progresses. Use migrations for production, but synchronize is enabled for rapid hackathon iteration.

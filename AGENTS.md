<!-- # Repository Guidelines

## Project Structure & Module Organization

- `src/` hosts the NestJS application, with `main.ts` and `app.module.ts` as entry points plus feature modules like `map/`, `rooms/`, `realtime/`, and `posts/`.
- `src/entities/` contains TypeORM entities named `*.entity.ts`.
- `src/config/` holds environment and socket configuration (for example, `env.config.ts`).
- `test/` stores E2E specs and `test/jest-e2e.json`.
- `dist/` is build output from `npm run build`.

## Build, Test, and Development Commands

- `npm run start:dev` runs the API with hot reload.
- `npm run build` compiles TypeScript to `dist/`.
- `npm run start:prod` runs the compiled server.
- `npm run lint` runs ESLint with `--fix`.
- `npm run format` formats `src/` and `test/` with Prettier.
- `npm run test` runs unit tests; `npm run test:e2e` runs E2E tests.

## Coding Style & Naming Conventions

- TypeScript, 2-space indentation (Prettier defaults).
- NestJS conventions: `*.module.ts`, `*.service.ts`, `*.controller.ts`.
- DTOs/interfaces for API payloads live under each module's `dto/` folder and use `*.dto.ts`.
- Event payload types for gateways also live in the module `dto/` folder.
- Prefer direct NestJS dependency injection over custom interface tokens unless swapping implementations.
- Avoid abbreviations in service or DTO names.
- **ANTI-PATTERN**: Do not destructure or reconstruct DTOs in controllers before passing to services. Pass DTOs directly to service methods.
  - Bad: `service.method(dto.id, { field1: dto.field1, field2: dto.field2 })`
  - Good: `service.method(dto)`

## Testing Guidelines

- Jest is configured in `package.json`; E2E uses `test/jest-e2e.json` with Supertest.
- Unit tests use `*.spec.ts` next to the source file.
- Prefer focused unit tests first, then E2E verification as needed.

## TDD Convention (NestJS)

1. Data access: tests for repositories or data services with mocked TypeORM repositories.
2. Service layer: tests for business logic using Jest mocks and clear given/when/then names.
3. Controller/E2E: tests using a `TestingModule` plus Supertest in `test/`.

## TDD Mandatory Rules

- **Critical**: this project uses Test-Driven Development for all features.
- **Do not** write implementation code before tests.
- **Do not** implement without running and seeing failing tests.
- **Do not** change tests while implementing.
- Required sequence: RED (write test) → RED (run and fail) → GREEN (minimum implementation) → GREEN (run and pass) → REFACTOR → GREEN (rerun).
- Coverage target: 80%+ (`npm run test:cov`).
- Before starting a feature, ask: "~테스트를 작성할까요?"

## TDD Automation Assets

- Feature plan template: `.codex/feature-template.md`.
- Codex prompt for analysis: `.codex/prompts/analyze-feature.md`.
- Workflow: generate a plan → write tests → implement → run `npm run test` or `npm run test:e2e`.

## Commit & Pull Request Guidelines

- Conventional Commit-style prefixes (`feat:`, `Fix:`).
- Keep commits scoped to one feature or fix.
- PRs include summary, testing commands run, and API screenshots if relevant.

## Configuration & Local Services

- `.env` supplies `DATABASE_URL` and `REDIS_URL` (see `src/config/env.config.ts`).
- Start local Postgres via `docker-compose up -d postgres` when needed. -->

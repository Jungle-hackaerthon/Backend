# Repository Guidelines

## Project Structure & Module Organization
The NestJS app lives under `src/` with `main.ts` and `app.module.ts` orchestrating feature modules such as `map/`, `rooms/`, `realtime/`, and `posts/`. Domain entities reside in `src/entities/*.entity.ts`, configuration helpers in `src/config/`, and DTO folders inside each module define API payloads. Build artifacts land in `dist/`, while integration specs sit in `test/` alongside `test/jest-e2e.json`. SQL helpers stay in `schema.sql` and `dummy.sql` for quick bootstrap.

## Build, Test, and Development Commands
- `npm run start:dev` – start the API with hot reload via Nest CLI.
- `npm run build` – compile TypeScript to `dist/` before production.
- `npm run start:prod` – serve the compiled bundle.
- `npm run lint` / `npm run format` – apply ESLint `--fix` and Prettier across `src/` and `test/`.
- `npm run test` – execute unit tests; `npm run test:e2e` hits HTTP endpoints with Supertest; `npm run test:cov` reports coverage.

## Coding Style & Naming Conventions
Code is TypeScript with 2-space indentation; run Prettier frequently to avoid churn. Follow Nest defaults for filenames (`*.module.ts`, `*.service.ts`, `*.controller.ts`). DTOs and gateway payloads belong to each module’s `dto/` directory and use the `*.dto.ts` suffix. Inject dependencies via Nest providers rather than recreating singletons, and pass DTOs straight to services without destructuring.

## Testing Guidelines
Jest drives both unit (`*.spec.ts` colocated with code) and E2E suites (`test/` plus Supertest). Practice strict TDD: write the failing test first, watch it fail, then craft the minimal feature and rerun until green. The repo targets 80%+ coverage (`npm run test:cov`). Mock TypeORM repositories at the data layer, isolate services with explicit Given/When/Then naming, and reserve E2E specs for API contracts.

## Commit & Pull Request Guidelines
Commits follow Conventional Commits (`feat:`, `fix:`, `chore:`) and should scope to a single feature or bug. Each PR needs a concise summary of behavior, linked issue reference when available, a list of test commands executed, and screenshots or API output when UI or contract changes occur. Rebase before opening the PR and ensure lint and tests are green.

## Security & Configuration Tips
Environment values live in `.env` and feed `src/config/env.config.ts` for `DATABASE_URL` and `REDIS_URL`; never commit secrets. Launch local Postgres with `docker-compose up -d postgres` before running migrations or E2E tests. Keep `dist/` out of manual edits and regenerate via `npm run build` whenever deployment artifacts are needed.

# Feature: {feature_name}

## Requirements
- {요구사항}

## Affected Files
### New Files
- [ ] `src/{module}/...`
- [ ] `test/{feature}.e2e-spec.ts`

### Modified Files
- [ ] existing file path

## TDD Steps
### Step 1: Data Access
- Test: repository/service query behavior
- Impl: entity/repository or data service updates

### Step 2: Service Layer
- Test: business rules and edge cases
- Impl: service logic and DTO mapping

### Step 3: Controller/E2E
- Test: API endpoint behavior with Supertest
- Impl: controller routes, DTO validation, module wiring

## Database Changes
- [ ] Migration script needed?

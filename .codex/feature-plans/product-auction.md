# Feature: Product Registration with Auction Linkage

## Requirements
- 상품은 모두 경매 상품으로 등록된다.
- 상품 상태는 `AVAILABLE`, `RESERVED`, `SOLD` 중 하나이며 기본값은 `AVAILABLE`이다.
- 경매 상품은 시작가(`startPrice`)와 현재가(`currentPrice`)를 저장한다.
- 경매 상품 등록 시 `currentPrice`는 `startPrice`로 초기화된다.
- 필수 입력: `sellerId`, `mapId`, `title`, `description`, `price`, `categories`, `imageUrls`.
- 경매 옵션 입력: `startPrice` (필수), `currentPrice` (자동 설정).
- 잘못된 입력은 400 오류로 응답한다.
- 상품이 등록되면 해당 `mapId`의 맵 화면에 즉시 반영된다.
- 누군가 경매 신청(입찰)을 하면 해당 맵 화면에 즉시 반영된다.

## API Expectations
- `POST /products`:
  - 경매 상품 등록.
  - body: `title`, `description`, `startPrice`, `categories`, `imageUrls`, `mapId`.
  - 응답에 생성된 상품 식별자 포함.
- `POST /products/:id/bids`:
  - 경매 신청(입찰) 등록.
  - body: `bidAmount`.
  - 응답에 입찰 식별자 포함.

## Affected Files
### New Files
- [ ] `src/domain/products/dto/create-auction-product.dto.ts`
- [ ] `src/domain/products/dto/create-auction-bid.dto.ts`
- [ ] `src/domain/products/products.controller.spec.ts`
- [ ] `src/domain/products/products.service.spec.ts`
- [ ] `test/products.e2e-spec.ts`

### Modified Files
- [ ] `src/domain/products/products.controller.ts`
- [ ] `src/domain/products/products.service.ts`
- [ ] `src/domain/products/products.module.ts`
- [ ] `src/domain/products/entities/product.entity.ts`
- [ ] `src/domain/map/map.gateway.ts`

## TDD Steps
### Step 1: Data Access
- Test: 상품 저장 시 기본값(`status`, `currentPrice`)이 올바르게 설정되는지 검증.
- Impl: Product 저장 로직 추가.

### Step 2: Service Layer
- Test: 경매 상품 등록 시 필수값 검증과 매핑 확인.
- Impl: 서비스 메서드 `createAuctionProduct` 구현.

### Step 2.5: Map Realtime Update
- Test: 상품 등록/입찰 시 `MapGateway` 이벤트 전송.
- Impl: 서비스에서 `MapGateway` 또는 전용 이벤트 브로드캐스터 호출.

### Step 3: Controller/E2E
- Test: `POST /products` 응답 및 상태 코드 검증.
- Impl: 컨트롤러 라우팅, DTO validation, 모듈 wiring.
### Step 3.5: Controller/E2E (Bids)
- Test: `POST /products/:id/bids` 응답 및 맵 이벤트 전송 확인.
- Impl: 입찰 엔드포인트와 이벤트 브로드캐스트 연결.

## Database Changes
- [ ] Migration script needed? (새 컬럼 추가 여부 확인)

## Open Questions
- 경매 상품의 `price`는 사용하지 않는가? (현재 엔티티에 존재)
- 판매자 식별자는 인증 컨텍스트에서 가져오는가, 요청 body로 받는가?
- 맵 실시간 이벤트의 payload 포맷은 무엇인가? (ex: `map:product:created`, `map:bid:created`)

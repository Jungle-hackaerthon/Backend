DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS point_transactions;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS chat_rooms;
DROP TABLE IF EXISTS request_responses;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS auction_bids;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255)   NOT NULL UNIQUE,
    nickname      VARCHAR(50)    NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    avatar_url    VARCHAR(500)   NOT NULL DEFAULT 'default-avatar.png',
    point_balance INTEGER        NOT NULL DEFAULT 0,
    current_map   INTEGER,                           -- 현재 맵 ID (관계형 아님)
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CHECK (point_balance >= 0)
);

CREATE TABLE products (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    map_id       INTEGER      NOT NULL,              -- 맵 ID (관계형 아님)
    x_position   INTEGER,                            -- X 좌표
    y_position   INTEGER,                            -- Y 좌표
    title        VARCHAR(255) NOT NULL,
    description  TEXT         NOT NULL,
    image_urls   TEXT[]       NOT NULL DEFAULT '{}', -- 이미지 URL 리스트
    status       VARCHAR(20)  NOT NULL DEFAULT 'AVAILABLE',
    -- ENUM(AVAILABLE, RESERVED, SOLD)
    start_price   INTEGER,                           -- 경매 시작가 (옵션)
    deadline     TIMESTAMPTZ,                        -- 마감 시간
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


CREATE TABLE auction_bids (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    bidder_id  UUID         NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    bid_amount INTEGER      NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE requests (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id  UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title         VARCHAR(255) NOT NULL,
    description   TEXT         NOT NULL,
    proposed_price INTEGER     DEFAULT 0,
    deadline      TIMESTAMPTZ,
    status        VARCHAR(20), -- ENUM(IN_PROGRESS, COMPLETED, CANCELED)
    x_position    DOUBLE PRECISION,                   -- X 좌표
    y_position    DOUBLE PRECISION,                   -- Y 좌표
    map_id        INTEGER,                            -- 맵 ID
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE request_responses (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id    UUID         NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    helper_id     UUID         NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    proposed_price INTEGER,
    status        VARCHAR(20), -- ENUM(PENDING, IN_PROGRESS, CANCELED 등 자유롭게 사용)
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE TABLE chat_rooms (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- 두 유저 쌍은 항상 한 채팅방만
    CONSTRAINT chk_chat_rooms_order CHECK (user1_id < user2_id),
    CONSTRAINT uq_chat_rooms_users  UNIQUE (user1_id, user2_id)
);

CREATE TABLE messages (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id   UUID         REFERENCES users(id)      ON DELETE SET NULL, -- Preserve messages when user is deleted, set sender to null
    room_id     UUID         NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    content     TEXT         NOT NULL,
    message_type VARCHAR(20) NOT NULL DEFAULT 'TEXT', -- ENUM(TEXT, IMAGE)
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


CREATE TABLE point_transactions (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    counterparty_id UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount         INTEGER      NOT NULL,        -- + 적립 / - 차감
    source_type    VARCHAR(30)  NOT NULL,        -- ENUM(PRODUCT, AUCTION, REQUEST)
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    CHECK (amount > 0)
);

CREATE TABLE notifications (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title             VARCHAR(255) NOT NULL,
    message           TEXT         NOT NULL,
    notification_type VARCHAR(30)  NOT NULL,      -- ENUM
    is_read           BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


CREATE INDEX idx_products_seller  ON products(seller_id);
CREATE INDEX idx_products_status  ON products(status);
CREATE INDEX idx_messages_room_created
    ON messages(room_id, created_at DESC);

CREATE INDEX idx_point_transactions_user
    ON point_transactions(user_id);

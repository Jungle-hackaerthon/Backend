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
    x_position    DOUBLE PRECISION,
    y_position    DOUBLE PRECISION,
    is_online     BOOLEAN        NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ
    CHECK (point_balance >= 0);
);

CREATE TABLE products (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title        VARCHAR(255) NOT NULL,
    description  TEXT         NOT NULL,
    price        INTEGER      NOT NULL,              -- 고정가(즉시 구매가)
    image_urls   TEXT[]       NOT NULL DEFAULT '{}', -- 이미지 URL 리스트
    categories   TEXT[]       NOT NULL DEFAULT '{}',
    status       VARCHAR(20)  NOT NULL DEFAULT 'AVAILABLE', 
    -- ENUM(AVAILABLE, RESERVED, SOLD)
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ,

    current_price INTEGER,    -- 경매 현재가 (옵션)
    start_price   INTEGER     -- 경매 시작가 (옵션)
    CHECK (price > 0);
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
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ
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
    sender_id   UUID         NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
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
    is_sent_email     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


CREATE INDEX idx_products_seller  ON products(seller_id);
CREATE INDEX idx_products_status  ON products(status);
CREATE INDEX idx_messages_room_created
    ON messages(room_id, created_at DESC);

CREATE INDEX idx_point_transactions_user
    ON point_transactions(user_id);

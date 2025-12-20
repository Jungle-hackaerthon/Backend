
-- =====================================================
-- 샘플 데이터 (테스트용)
-- =====================================================

-- 테스트 유저
INSERT INTO users (email, nickname, password_hash, point_balance, x_position, y_position) VALUES 
('test1@example.com', '판매왕김씨', 'hashed_password_1', 50000, 100, 200),
('test2@example.com', '구매마스터', 'hashed_password_2', 30000, 300, 400),
('test3@example.com', '경매러버', 'hashed_password_3', 80000, 500, 100);

-- 테스트 상품
INSERT INTO products (seller_id, title, description, price, images, category) VALUES 
(1, '아이폰 15 Pro', '거의 새것 같은 아이폰 15 Pro 판매합니다', 800000, '["uploads/iphone1.jpg", "uploads/iphone2.jpg"]', 'electronics'),
(1, '나이키 에어맥스', 'US 9 사이즈 나이키 운동화', 120000, '["uploads/shoes1.jpg"]', 'fashion'),
(2, '맥북 프로 M3', '2024년 구입한 맥북프로', 1500000, '["uploads/macbook1.jpg", "uploads/macbook2.jpg"]', 'electronics');

-- 테스트 경매
INSERT INTO auctions (seller_id, title, description, start_price, current_price, start_time, end_time) VALUES 
(3, '한정판 스니커즈 경매', '레어 아이템 스니커즈 경매입니다', 100000, 100000, NOW(), NOW() + INTERVAL '2 days');

-- 테스트 부탁
INSERT INTO requests (requester_id, title, description, category, proposed_price) VALUES 
(2, '수학 과외 선생님 구해요', '고3 수학 과외 도와주실 분', 'tutoring', 50000),
(1, '강남역 커피 배달 부탁', '스타벅스 아메리카노 2잔 배달 부탁드려요', 'delivery', 10000);

-- =====================================================
-- 주요 쿼리 예시 (참고용)
-- =====================================================

/*
-- 사용자별 판매 중인 상품 조회
SELECT p.*, u.nickname as seller_name 
FROM products p 
JOIN users u ON p.seller_id = u.id 
WHERE p.seller_id = 1 AND p.status = 'available';

-- 진행 중인 경매 목록
SELECT a.*, u.nickname as seller_name,
       (SELECT COUNT(*) FROM auction_bids WHERE auction_id = a.id) as bid_count
FROM auctions a
JOIN users u ON a.seller_id = u.id
WHERE a.status = 'active' AND a.end_time > NOW()
ORDER BY a.end_time ASC;

-- 사용자별 포인트 잔액 및 최근 거래 내역
SELECT u.point_balance,
       (SELECT SUM(amount) FROM point_transactions WHERE user_id = u.id AND created_at >= NOW() - INTERVAL '30 days') as recent_transactions
FROM users u WHERE u.id = 1;

-- 채팅방 목록 (최근 메시지와 함께)
SELECT cr.*, 
       CASE WHEN cr.user1_id = 1 THEN u2.nickname ELSE u1.nickname END as other_user_name,
       cr.last_message,
       cr.last_message_at
FROM chat_rooms cr
JOIN users u1 ON cr.user1_id = u1.id
JOIN users u2 ON cr.user2_id = u2.id
WHERE cr.user1_id = 1 OR cr.user2_id = 1
ORDER BY cr.last_message_at DESC;
*/
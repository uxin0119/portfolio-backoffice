-- 주문↔회원 연결 (마이페이지 '내 주문'용). 게스트 주문은 NULL.
ALTER TABLE orders ADD COLUMN member_id BIGINT;
CREATE INDEX ix_orders_member_id ON orders (member_id);

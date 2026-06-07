-- 회원 연락처/주소 + 주문 배송 스냅샷 (주문·배송용).
-- 기존 행 호환을 위해 전부 nullable. 주소는 한국 표준(우편번호+기본+상세).

ALTER TABLE member ADD COLUMN email          VARCHAR(255);
ALTER TABLE member ADD COLUMN phone          VARCHAR(30);
ALTER TABLE member ADD COLUMN postcode       VARCHAR(10);
ALTER TABLE member ADD COLUMN address        VARCHAR(255);
ALTER TABLE member ADD COLUMN address_detail VARCHAR(255);

-- 이메일 중복 방지(있을 때만). NULL 다수는 허용.
CREATE UNIQUE INDEX ux_member_email ON member (email) WHERE email IS NOT NULL;

-- 주문 배송 스냅샷: 체크아웃 시점의 수령인/주소를 고정 보관(회원 주소 변경과 무관).
ALTER TABLE orders ADD COLUMN recipient_name      VARCHAR(50);
ALTER TABLE orders ADD COLUMN recipient_phone     VARCHAR(30);
ALTER TABLE orders ADD COLUMN ship_postcode       VARCHAR(10);
ALTER TABLE orders ADD COLUMN ship_address        VARCHAR(255);
ALTER TABLE orders ADD COLUMN ship_address_detail VARCHAR(255);

-- 회원 역할 4단계: SUPER_ADMIN / ADMIN / SELLER / BUYER. 기본 BUYER.
ALTER TABLE member ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'BUYER';

-- 우회/데모 운영자 계정을 슈퍼관리자로 승격.
UPDATE member SET role = 'SUPER_ADMIN' WHERE login_id = 'test';

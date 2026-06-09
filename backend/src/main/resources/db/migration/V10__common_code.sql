-- 공통코드: 앱 전반의 상태/구분값을 한 곳에서 관리(코드명은 한글).
CREATE TABLE common_code (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    group_code VARCHAR(50)  NOT NULL,
    code       VARCHAR(50)  NOT NULL,
    name       VARCHAR(100) NOT NULL,
    sort_order INT          NOT NULL DEFAULT 0,
    active     BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT ux_common_code UNIQUE (group_code, code)
);

INSERT INTO common_code (group_code, code, name, sort_order) VALUES
  ('ORDER_STATUS',   'ACCEPTED',    '접수',     1),
  ('ORDER_STATUS',   'SHIPPED',     '배송중',   2),
  ('ORDER_STATUS',   'DONE',        '완료',     3),
  ('ORDER_STATUS',   'CANCELLED',   '취소',     4),
  ('PRODUCT_STATUS', 'ACTIVE',      '판매중',   1),
  ('PRODUCT_STATUS', 'INACTIVE',    '판매중지', 2),
  ('CUSTOMER_GRADE', '일반',        '일반',     1),
  ('CUSTOMER_GRADE', '우수',        '우수',     2),
  ('CUSTOMER_GRADE', 'VIP',         'VIP',      3),
  ('MEMBER_ROLE',    'SUPER_ADMIN', '슈퍼관리자', 1),
  ('MEMBER_ROLE',    'ADMIN',       '관리자',   2),
  ('MEMBER_ROLE',    'SELLER',      '판매자',   3),
  ('MEMBER_ROLE',    'BUYER',       '구매자',   4),
  ('INVENTORY_TYPE', 'IN',          '입고',     1),
  ('INVENTORY_TYPE', 'OUT',         '출고',     2);

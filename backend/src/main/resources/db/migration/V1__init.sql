-- portfolio-backoffice v1 — B2C 소매 셀러 백오피스 초기 스키마
-- 표(reserved word 회피): app_user, orders. 금액은 정수(원), 시간은 UTC timestamptz.

-- 단일 운영자
CREATE TABLE app_user (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    login_id      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    name          VARCHAR(50)  NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 상품 (도매로 떼온 재고)
CREATE TABLE product (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sku          VARCHAR(50)  NOT NULL UNIQUE,
    name         VARCHAR(100) NOT NULL,
    category     VARCHAR(50),
    base_price   INTEGER      NOT NULL CHECK (base_price >= 0),
    stock_qty    INTEGER      NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
    safety_stock INTEGER      NOT NULL DEFAULT 0 CHECK (safety_stock >= 0),
    status       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 고객 (일반 소비자/회원). grade는 단순 멤버십 라벨
CREATE TABLE customer (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name       VARCHAR(50) NOT NULL,
    grade      VARCHAR(20) NOT NULL DEFAULT '일반' CHECK (grade IN ('일반','우수','VIP')),
    contact    VARCHAR(50),
    status     VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 주문
CREATE TABLE orders (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_no     VARCHAR(30)  NOT NULL UNIQUE,
    customer_id  BIGINT       NOT NULL REFERENCES customer(id),
    status       VARCHAR(20)  NOT NULL DEFAULT 'ACCEPTED'
                   CHECK (status IN ('ACCEPTED','SHIPPED','DONE','CANCELLED')),
    order_date   DATE         NOT NULL DEFAULT CURRENT_DATE,
    total_amount INTEGER      NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status   ON orders(status);

-- 주문 항목 (unit_price = 상품 기준가 스냅샷)
CREATE TABLE order_item (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id    BIGINT  NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  BIGINT  NOT NULL REFERENCES product(id),
    qty         INTEGER NOT NULL CHECK (qty > 0),
    unit_price  INTEGER NOT NULL CHECK (unit_price >= 0),
    line_amount INTEGER NOT NULL CHECK (line_amount >= 0)
);
CREATE INDEX idx_order_item_order   ON order_item(order_id);
CREATE INDEX idx_order_item_product ON order_item(product_id);

-- 재고 입출고 이력 (★ 주문↔재고 자동연동의 원장)
CREATE TABLE inventory_tx (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id   BIGINT      NOT NULL REFERENCES product(id),
    type         VARCHAR(3)  NOT NULL CHECK (type IN ('IN','OUT')),
    qty          INTEGER     NOT NULL CHECK (qty > 0),
    ref_order_id BIGINT      REFERENCES orders(id),
    memo         VARCHAR(200),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_inventory_tx_product ON inventory_tx(product_id);
CREATE INDEX idx_inventory_tx_ref     ON inventory_tx(ref_order_id);

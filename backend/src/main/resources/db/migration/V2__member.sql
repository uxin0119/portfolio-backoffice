-- 회원(소비자/운영자 계정) 테이블 — 회원가입/로그인용
CREATE TABLE member (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    login_id      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    name          VARCHAR(50)  NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

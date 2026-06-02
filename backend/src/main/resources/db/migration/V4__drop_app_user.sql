-- app_user는 미사용(고아) 테이블 — 인증은 member 테이블로 구현됨. 중복/모호함 정리 위해 제거.
DROP TABLE IF EXISTS app_user;

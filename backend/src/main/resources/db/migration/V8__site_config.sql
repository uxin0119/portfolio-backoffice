-- 사이트 전역 설정(key-value). 푸터 문구 등 운영자가 코드 수정/재배포 없이 관리.
CREATE TABLE site_config (
    config_key   VARCHAR(100) PRIMARY KEY,
    config_value TEXT
);

INSERT INTO site_config (config_key, config_value) VALUES
  ('footer.notice',    '이 사이트는 포트폴리오용 데모입니다. 실제 판매·결제가 이루어지지 않습니다.'),
  ('footer.email',     'uxin0119@naver.com'),
  ('footer.copyright', '© 2026 생활잡화 스토어 — Portfolio by 유신');

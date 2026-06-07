-- 상품 해시태그 (콤마 구분). 카테고리와 별개로 다중 키워드 탐색용.
ALTER TABLE product ADD COLUMN tags VARCHAR(500);

-- 기존 상품 시드: 카테고리를 기본 태그로, 이름에서 라이프스타일 키워드 추출해 추가.
-- concat_ws는 NULL 인자를 건너뛰므로 tags가 NULL이어도 안전.
UPDATE product SET tags = category WHERE category IS NOT NULL AND category <> '';

UPDATE product SET tags = concat_ws(',', tags, '친환경')  WHERE name LIKE '%친환경%';
UPDATE product SET tags = concat_ws(',', tags, '대용량')  WHERE name LIKE '%대용량%';
UPDATE product SET tags = concat_ws(',', tags, '프리미엄') WHERE name LIKE '%프리미엄%' OR name LIKE '%고급%';
UPDATE product SET tags = concat_ws(',', tags, '1인가구')  WHERE name LIKE '%컴팩트%' OR name LIKE '%미니%' OR name LIKE '%휴대%';
UPDATE product SET tags = concat_ws(',', tags, '스마트')  WHERE name LIKE '%스마트%';
UPDATE product SET tags = concat_ws(',', tags, '다용도')  WHERE name LIKE '%다용도%';

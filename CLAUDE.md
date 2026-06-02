# CLAUDE.md — portfolio-backoffice

> 소규모 **B2C 소매 셀러**(1인~소수)가 도매로 떼온 상품을 일반 소비자(회원)에게 판매하는 업무를 처리하는 웹 관리자 백오피스.
> 포트폴리오 자산 (크몽 외주 어필용 — 신규 전문가의 실력 직접 증명). 가상 도메인이라 NDA 안전.
> 사양 원본: Notion `📐 spec: portfolio-backoffice v1` (2026-06-01 확정, 도메인은 B2C로 조정).
>
> 패키지(폴더): `backend` (공유 API) · `backoffice` (관리자) · `frontoffice` (소비자)
> (Gradle 아티팩트는 `portfolio-backoffice-backend`)

## 시그니처

★ **주문 ↔ 재고 자동 연동** — 발주 상태를 `SHIPPED`로 전이하면 각 주문 항목에 대해
`inventory_tx(OUT)` 자동 생성 + `product.stock_qty` 차감, 안전재고 미만 시 부족 플래그.
상태 롤백(`SHIPPED → ACCEPTED`) 시 역연산. **단일 트랜잭션으로 원자성 보장.**
단순 CRUD가 아니라 상태 워크플로우 + 재고 정합성을 보여주는 게 핵심 차별점.

## v1 스코프

- **포함**: 단일 운영자 인증 · 대시보드 · 상품 관리 · 거래처 관리 · 주문(발주) 관리 + 재고 자동연동 · 재고 관리
- **제외(→v2)**: 차등단가 · 정산 · 결제 연동 · PDF 인보이스 · CSV 임포트 · 멀티테넌트 · 네이티브 모바일 앱 · 실시간 알림
- 원칙: **1~2주 안에 배포 가능한 범위만.** 미완성 공개는 마이너스 시그널.

## UI 원칙 — 모바일 반응형 필수 (프로젝트 표준)

- **모든 화면은 모바일 반응형으로 작업한다.** 데스크톱 전용 화면을 만들지 않는다.
- 모바일 우선(mobile-first)으로 작성: 기본 스타일 = 모바일, `sm/md/lg/xl`로 확장.
- 테이블처럼 좁은 화면에서 깨지기 쉬운 요소는 가로 스크롤 또는 카드형 대체 레이아웃 제공.
- 사이드바는 모바일에서 드로어, 데스크톱에서 고정(이미 `AppShell` 적용).
- 새 컴포넌트/화면 추가 시 **모바일(≈375px)·태블릿·데스크톱 폭을 항상 확인**한다.

## 스택

| 레이어 | 기술 |
|--------|------|
| 백엔드 | Spring Boot 4.0 (Initializr 기본) · Java 23 (설치된 JDK 직접 사용) · QueryDSL · PostgreSQL · Flyway · Lombok |
| 프론트 | Next.js · TypeScript · Tailwind CSS |
| 인증 | 자체 Spring Security, 단일 운영자 (JWT 또는 세션) |
| DB | Supabase (managed PostgreSQL, **신규 전용 프로젝트** — 생활비계산기와 분리) |
| 배포 | 프론트 Vercel · 백엔드 Railway |
| 리포 | 모노레포 단일 GitHub repo (`/backend`, `/backoffice`, `/frontoffice`) |

## 구조

```
portfolio-backoffice/
├── backend/          Spring Boot (Java 23, Gradle) — 공유 API (포트 8080)
├── backoffice/       Next.js — 백오피스(관리자) UI (포트 3000)
├── frontoffice/      Next.js — 프론트오피스(소비자) 스토어프론트 (포트 3001)
├── _archive/         이전 예약관리 SaaS 설계 (폐기, 참고용 보관)
└── CLAUDE.md
```

- **백엔드 1개를 backoffice·frontoffice가 공유**한다. CORS: localhost:3000·3001 허용.
- 프론트오피스 스코프(러프): 카탈로그 + 장바구니(localStorage) + 주문(체크아웃 시 customer+order 생성). 기존 `/api` 재사용.
- 디자인 토큰·`lib/cn`·`lib/api`·`ui/*`는 두 프론트가 동일 패턴 공유(현재는 복사). 추후 공통 패키지로 추출 가능.

## 데이터 모델 (8테이블 → v1은 차등단가/정산 제외하여 6)

- `user` (단일 운영자) · `product` (sku, base_price, stock_qty, safety_stock)
- `customer` (소비자/회원 — name, grade 일반/우수/VIP 멤버십 라벨, contact)
- `order` (order_no, customer_id, status, order_date, total_amount)
- `order_item` (order_id, product_id, qty, unit_price=기준가, line_amount)
- `inventory_tx` (product_id, type IN/OUT, qty, ref_order_id, memo)

상태머신: order.status `ACCEPTED → SHIPPED → DONE` (+ `CANCELLED`).

## 컨벤션

- DB UTC 저장 / UI KST 표시. 금액은 정수(원). 시간은 `OffsetDateTime`.
- 백엔드 패키지: 도메인 단위(`product`, `customer`, `order`, `inventory`) 슬라이스.
- 재고 연동 로직은 반드시 서비스 트랜잭션 안에서. 부분 성공 금지.
- 시드 스크립트로 가상 상품/거래처/주문 생성 (스크린샷·데모용).

## 작업 순서 (Notion 스펙 §6)

1. 리포 + 모노레포 + CLAUDE.md  ← **현재**
2. DB 스키마 마이그레이션 + 시드
3. 백엔드: product → customer → order/order_item → inventory_tx → **주문↔재고 연동(공들이기)**
4. 프론트: 레이아웃/네비 → 상품 → 거래처 → 주문(워크플로우+재고연동 화면) → 재고 → 대시보드
5. 배포 (Vercel + Railway) + README(스크린샷·기능·스택)
6. 스크린샷 → 크몽 포트폴리오 등록

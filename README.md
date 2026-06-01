# portfolio-backoffice

> 소규모 **B2C 소매 셀러**가 도매로 떼온 상품을 일반 소비자(회원)에게 판매하는 업무를 처리하는 웹 관리자 백오피스.
> 시그니처는 **주문 ↔ 재고 자동 연동** — 주문 발송 시 재고가 트랜잭션으로 자동 차감/복원됩니다.

## 링크

- **Live Demo**: `<TBD>`
- **설계 원본**: Notion `📐 spec: portfolio-backoffice v1`

## 차별점

1. **주문↔재고 자동연동** — 발주 상태 전이(`ACCEPTED→SHIPPED→DONE`)에 재고 입출고가 원자적으로 묶임. 롤백 시 역연산.
2. **안전재고 경고** — 차감 후 `stock_qty < safety_stock`이면 대시보드/목록에 부족 플래그.
3. **단일 트랜잭션 정합성** — 부분 성공 없는 재고 처리.

## 스택

- Backend: Spring Boot 3.x · Java 21 · QueryDSL · PostgreSQL
- Frontend: Next.js · TypeScript · Tailwind CSS
- Infra: Supabase(DB) · Vercel(FE) · Railway(BE)

## 구조

```
backend/    Spring Boot
frontend/   Next.js
```

## 라이선스

MIT © 2026 uxin

# 디자인 시스템 — portfolio-backoffice frontend

순수 Tailwind v4 커스텀 (컴포넌트 라이브러리 미사용). 라이트/다크 토글 지원.

## 토큰 (CSS 변수 → Tailwind 유틸)
`globals.css`에서 `:root`(light) / `.dark`(dark) 한 쌍으로 정의하고 `@theme inline`로 유틸에 매핑.

| 의미 | 유틸 | Light | Dark |
|---|---|---|---|
| 페이지 배경 | `bg-canvas` | `#f7f8fa` | `#0b0e14` |
| 카드/사이드바 | `bg-surface` | `#ffffff` | `#131722` |
| hover/보조면 | `bg-surface-2` | `#f1f5f9` | `#1a2030` |
| 본문 | `text-fg` | `#0f172a` | `#e6e8eb` |
| 보조 텍스트 | `text-subtle` | `#64748b` | `#94a3b8` |
| 경계선 | `border-line` | `#e2e8f0` | `#1f2733` |
| 주 액션 | `bg-primary` `text-primary-fg` | indigo `#4f46e5` | `#6366f1` |
| 액션 약 | `bg-primary-weak` | `#eef2ff` | `#1e1b4b` |

## 상태색 (시그니처: 주문/재고)
`StatusBadge`(`components/ui/badge.tsx`)로 통일. `bg-st-*-bg text-st-*` 쌍.

| 상태 | 라벨 | 색 |
|---|---|---|
| `ACCEPTED` | 접수 | 파랑 |
| `SHIPPED` | 발송 | 보라 |
| `DONE` | 완료 | 초록 |
| `CANCELLED` | 취소 | 회색 |
| `LOW_STOCK` | 재고부족 | 빨강 |

## 타이포 / 간격
- 폰트: **Pretendard Variable** (CDN, `--font-sans`), 숫자 `tabular-nums`
- 8px 그리드, 카드 `rounded-xl border border-line bg-surface shadow-sm`

## 다크 모드
- 전략: 클래스 기반 (`<html class="dark">`), `@custom-variant dark`
- FOUC 방지: `layout.tsx` head의 인라인 스크립트가 페인트 전 `localStorage.theme` 적용
- 토글: `components/theme-toggle.tsx` (localStorage 저장)

## 컴포넌트 인벤토리
- `ui/button.tsx` — variant: primary/secondary/ghost/danger, size: sm/md
- `ui/card.tsx` — Card / CardHeader / CardBody
- `ui/badge.tsx` — StatusBadge
- `icons.tsx` — 의존성 없는 인라인 SVG 아이콘
- `app-shell.tsx` — 사이드바(접이식, 모바일 드로어) + 탑바(테마토글·운영자)
- `lib/nav.ts` — 네비 정의, `lib/cn.ts` — className 병합

## 앞으로 추가할 컴포넌트
Input / Select / Table(정렬·페이지네이션) / Modal / Toast / Tabs / 차트(Recharts).

## 화면 IA (스펙 6화면)
로그인 · 대시보드(현재 데모) · 상품 · 거래처 · 주문(상태 워크플로우) · 재고(입출고 이력)

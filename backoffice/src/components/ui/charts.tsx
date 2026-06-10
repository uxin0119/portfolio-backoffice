"use client";

import { useMemo, useRef, useState } from "react";

/**
 * 의존성 없는 순수 SVG 차트 모음 (커스텀 셀렉트·토스트와 같은 철학).
 * 색은 테마 CSS 변수(var(--primary), var(--st-*))를 사용해 다크모드 자동 대응.
 */

// 카테고리 팔레트 — 라이트/다크 양쪽에서 무난한 고정 색
const PALETTE = [
  "#6366f1", "#8b5cf6", "#3b82f6", "#10b981",
  "#f59e0b", "#f43f5e", "#14b8a6", "#94a3b8",
];

const fmt = (n: number) => "₩" + n.toLocaleString("ko-KR");

// ───────────────────────── 1. 매출 영역 차트 ─────────────────────────
export type DailyPoint = { date: string; revenue: number; orders: number };

export function RevenueAreaChart({ data }: { data: DailyPoint[] }) {
  const W = 640, H = 200, PX = 8, PY = 14;
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const max = Math.max(1, ...data.map((d) => d.revenue));
  const x = (i: number) => PX + (i * (W - PX * 2)) / Math.max(1, data.length - 1);
  const y = (v: number) => H - PY - (v / max) * (H - PY * 2);

  // 부드러운 곡선(Catmull-Rom → Bezier 근사)
  const path = useMemo(() => {
    if (data.length < 2) return "";
    const pts = data.map((d, i) => [x(i), y(d.revenue)] as const);
    let p = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[Math.max(0, i - 1)];
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      const [x3, y3] = pts[Math.min(pts.length - 1, i + 2)];
      const c1x = x1 + (x2 - x0) / 6, c1y = y1 + (y2 - y0) / 6;
      const c2x = x2 - (x3 - x1) / 6, c2y = y2 - (y3 - y1) / 6;
      p += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;
    }
    return p;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current!.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - PX) / (W - PX * 2)) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  }

  const h = hover != null ? data[hover] : null;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* 가이드라인 */}
        {[0.25, 0.5, 0.75].map((r) => (
          <line key={r} x1={PX} x2={W - PX} y1={H - PY - r * (H - PY * 2)} y2={H - PY - r * (H - PY * 2)}
            stroke="var(--line)" strokeDasharray="3 5" strokeWidth="1" />
        ))}
        {path && (
          <>
            <path d={`${path} L ${x(data.length - 1)} ${H - PY} L ${x(0)} ${H - PY} Z`} fill="url(#rev-grad)" />
            <path d={path} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}
        {h && hover != null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={PY} y2={H - PY} stroke="var(--subtle)" strokeWidth="1" strokeDasharray="2 3" />
            <circle cx={x(hover)} cy={y(h.revenue)} r="4.5" fill="var(--primary)" stroke="var(--surface)" strokeWidth="2" />
          </>
        )}
      </svg>
      {h && hover != null && (
        <div
          className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs shadow-md"
          style={{ left: `${(x(hover) / W) * 100}%` }}
        >
          <p className="text-subtle">{h.date.slice(5).replace("-", "/")}</p>
          <p className="font-semibold text-fg">{fmt(h.revenue)}</p>
          <p className="text-subtle">{h.orders}건</p>
        </div>
      )}
    </div>
  );
}

// ───────────────────────── 2. 카테고리 도넛 ─────────────────────────
export type CategorySlice = { category: string; amount: number };

export function CategoryDonut({ data }: { data: CategorySlice[] }) {
  const total = data.reduce((s, d) => s + d.amount, 0);
  const R = 70, CX = 90, CY = 90, SW = 26;
  const C = 2 * Math.PI * R;
  let acc = 0;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 180 180" className="h-40 w-40 shrink-0">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--surface-2)" strokeWidth={SW} />
        {data.map((d, i) => {
          const frac = total ? d.amount / total : 0;
          const dash = `${frac * C} ${C}`;
          const offset = -acc * C;
          acc += frac;
          return (
            <circle key={d.category} cx={CX} cy={CY} r={R} fill="none"
              stroke={PALETTE[i % PALETTE.length]} strokeWidth={SW}
              strokeDasharray={dash} strokeDashoffset={offset}
              transform={`rotate(-90 ${CX} ${CY})`} strokeLinecap="butt" />
          );
        })}
        <text x={CX} y={CY - 6} textAnchor="middle" className="fill-[var(--subtle)]" fontSize="11">총 매출</text>
        <text x={CX} y={CY + 14} textAnchor="middle" className="fill-[var(--fg)]" fontSize="15" fontWeight="700">
          {total >= 10000000 ? `${(total / 10000000).toFixed(1)}천만` : `${Math.round(total / 10000)}만`}
        </text>
      </svg>
      <ul className="min-w-0 flex-1 space-y-1.5 text-sm">
        {data.slice(0, 6).map((d, i) => (
          <li key={d.category} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
            <span className="truncate text-fg">{d.category}</span>
            <span className="ml-auto tabular-nums text-subtle">{total ? Math.round((d.amount / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ───────────────────────── 3. 주문 히트맵 (요일×시간) ─────────────────────────
export type HeatCell = { dow: number; hour: number; count: number };

const DOW = ["월", "화", "수", "목", "금", "토", "일"];

export function OrderHeatmap({ data }: { data: HeatCell[] }) {
  const map = new Map(data.map((c) => [`${c.dow}:${c.hour}`, c.count]));
  const max = Math.max(1, ...data.map((c) => c.count));
  const CELL = 18, GAP = 3, LX = 26, TY = 16;
  const W = LX + 24 * (CELL + GAP), H = TY + 7 * (CELL + GAP);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0, 6, 12, 18, 23].map((hh) => (
        <text key={hh} x={LX + hh * (CELL + GAP) + CELL / 2} y={11} textAnchor="middle" fontSize="9.5" className="fill-[var(--subtle)]">
          {hh}시
        </text>
      ))}
      {DOW.map((d, r) => (
        <text key={d} x={LX - 8} y={TY + r * (CELL + GAP) + CELL / 2 + 3.5} textAnchor="end" fontSize="10" className="fill-[var(--subtle)]">
          {d}
        </text>
      ))}
      {Array.from({ length: 7 }, (_, r) =>
        Array.from({ length: 24 }, (_, c) => {
          const v = map.get(`${r}:${c}`) ?? 0;
          return (
            <rect key={`${r}-${c}`}
              x={LX + c * (CELL + GAP)} y={TY + r * (CELL + GAP)}
              width={CELL} height={CELL} rx={4}
              fill={v ? "var(--primary)" : "var(--surface-2)"}
              fillOpacity={v ? 0.25 + 0.75 * (v / max) : 1}
            >
              <title>{`${DOW[r]} ${c}시 — ${v}건`}</title>
            </rect>
          );
        }),
      )}
    </svg>
  );
}

// ───────────────────────── 4. 주문 상태 스택바 ─────────────────────────
export type StatusCount = { status: string; count: number };

const STATUS_COLOR: Record<string, string> = {
  ACCEPTED: "var(--st-accepted)",
  SHIPPED: "var(--st-shipped)",
  DONE: "var(--st-done)",
  CANCELLED: "var(--st-cancelled)",
};
const STATUS_ORDER = ["ACCEPTED", "SHIPPED", "DONE", "CANCELLED"];

export function StatusStackBar({ data, label }: { data: StatusCount[]; label: (code: string) => string }) {
  const sorted = [...data].sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
  const total = sorted.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-3">
      <div className="flex h-5 w-full overflow-hidden rounded-full bg-surface-2">
        {sorted.map((d) => (
          <div key={d.status}
            className="h-full transition-all"
            style={{ width: `${total ? (d.count / total) * 100 : 0}%`, background: STATUS_COLOR[d.status] ?? "var(--subtle)" }}
            title={`${label(d.status)} ${d.count}건`}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {sorted.map((d) => (
          <li key={d.status} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLOR[d.status] ?? "var(--subtle)" }} />
            <span className="text-subtle">{label(d.status)}</span>
            <span className="font-semibold tabular-nums text-fg">{d.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ───────────────────────── 5. 재고 건강도 게이지 ─────────────────────────
export type StockHealth = { name: string; sku: string; stockQty: number; safetyStock: number };

export function StockGauges({ data }: { data: StockHealth[] }) {
  return (
    <ul className="space-y-3">
      {data.map((s) => {
        const ratio = Math.min(1, s.stockQty / Math.max(1, s.safetyStock));
        const danger = ratio < 0.5;
        return (
          <li key={s.sku}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
              <span className="truncate text-fg">{s.name}</span>
              <span className="shrink-0 tabular-nums text-subtle">
                <b className={danger ? "text-st-danger" : "text-fg"}>{s.stockQty}</b> / 안전 {s.safetyStock}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.max(3, ratio * 100)}%`, background: danger ? "var(--st-danger)" : "var(--st-shipped)" }}
              />
            </div>
          </li>
        );
      })}
      {data.length === 0 && <p className="py-6 text-center text-sm text-subtle">부족 재고가 없습니다 🎉</p>}
    </ul>
  );
}

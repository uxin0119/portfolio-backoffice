"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Column<T> = {
  key: string;
  header: string;
  align?: "left" | "right";
  render?: (row: T) => ReactNode;
  /** 제공 시 헤더 클릭 정렬 가능 */
  sortValue?: (row: T) => string | number;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  empty?: string;
};

/** 데스크톱=테이블, 모바일=카드뷰로 자동 전환되는 반응형 데이터 테이블. */
export function DataTable<T>({ columns, data, rowKey, onRowClick, empty = "데이터가 없습니다" }: Props<T>) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);

  const sorted = (() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return data;
    return [...data].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return -1 * sort.dir;
      if (av > bv) return 1 * sort.dir;
      return 0;
    });
  })();

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));

  const cell = (col: Column<T>, row: T): ReactNode =>
    col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "");

  if (data.length === 0) {
    return <div className="px-5 py-10 text-center text-sm text-subtle">{empty}</div>;
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-subtle">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-5 py-2.5 font-medium",
                    c.align === "right" && "text-right",
                    c.sortValue && "cursor-pointer select-none hover:text-fg",
                  )}
                  onClick={() => c.sortValue && toggleSort(c.key)}
                >
                  {c.header}
                  {sort?.key === c.key && (sort.dir === 1 ? " ▲" : " ▼")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={rowKey(row)}
                className={cn(
                  "border-b border-line last:border-0 hover:bg-surface-2",
                  onRowClick && "cursor-pointer",
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-5 py-3 text-fg", c.align === "right" && "text-right tabular-nums")}>
                    {cell(c, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: 카드뷰 */}
      <div className="divide-y divide-line sm:hidden">
        {sorted.map((row) => (
          <div
            key={rowKey(row)}
            className={cn("space-y-1.5 px-5 py-3", onRowClick && "cursor-pointer")}
            onClick={() => onRowClick?.(row)}
          >
            {columns.map((c) => (
              <div key={c.key} className="flex items-center justify-between gap-3">
                <span className="text-xs text-subtle">{c.header}</span>
                <span className="text-sm text-fg">{cell(c, row)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

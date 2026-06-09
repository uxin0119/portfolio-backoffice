"use client";

import { Children, isValidElement, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Opt = { value: string; label: ReactNode; disabled?: boolean };

function extractOptions(children: ReactNode): Opt[] {
  const out: Opt[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === "option") {
      const p = child.props as { value?: string | number; children?: ReactNode; disabled?: boolean };
      out.push({ value: String(p.value ?? ""), label: p.children, disabled: p.disabled });
    }
  });
  return out;
}

/**
 * 네이티브 <select> 대체 커스텀 드롭다운. 기존 API 호환(value, onChange(e.target.value), <option> children).
 * 팝오버는 fixed로 띄워 테이블/모달의 overflow 클리핑을 피한다.
 */
export function Select({
  value,
  onChange,
  className,
  disabled,
  children,
}: {
  value?: string | number;
  onChange?: (e: { target: { value: string } }) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  children?: ReactNode;
}) {
  const opts = extractOptions(children);
  const cur = String(value ?? "");
  const selected = opts.find((o) => o.value === cur) ?? opts[0];

  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  function toggle() {
    if (disabled) return;
    if (open) { setOpen(false); return; }
    const r = btnRef.current!.getBoundingClientRect();
    setRect({ top: r.bottom + 4, left: r.left, width: r.width });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (popRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onMove = () => setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={toggle}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 text-left text-sm text-fg",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50",
          className,
        )}
      >
        <span className="truncate">{selected?.label ?? ""}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0 text-subtle">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && rect && (
        <div
          ref={popRef}
          style={{ position: "fixed", top: rect.top, left: rect.left, width: rect.width }}
          className="z-[80] max-h-60 overflow-auto rounded-lg border border-line bg-surface py-1 shadow-lg"
        >
          {opts.map((o) => (
            <button
              key={o.value}
              type="button"
              disabled={o.disabled}
              onClick={() => { onChange?.({ target: { value: o.value } }); setOpen(false); }}
              className={cn(
                "flex w-full items-center px-3 py-1.5 text-left text-sm hover:bg-surface-2 disabled:opacity-40",
                o.value === cur ? "bg-surface-2 font-medium text-fg" : "text-fg",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

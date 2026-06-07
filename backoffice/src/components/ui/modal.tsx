"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** 간단한 모달 다이얼로그 — 배경 클릭/Esc로 닫힘, 본문 스크롤 잠금. */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className={cn("w-full max-w-lg rounded-xl border border-line bg-surface shadow-lg", className)}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h3 className="text-sm font-semibold text-fg">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="rounded-lg px-2 py-1 text-subtle hover:bg-surface-2 hover:text-fg"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

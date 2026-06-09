"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

// ───────────────────────── Toast (alert 대체) ─────────────────────────
type ToastItem = { id: number; msg: string; kind: "info" | "error" };
let toastListeners: Array<(t: ToastItem) => void> = [];
let toastSeq = 0;

/** 어디서든 호출 가능한 토스트. 실패/오류 문구는 자동으로 에러 스타일. */
export function toast(msg: string, kind?: "info" | "error") {
  const k = kind ?? (/(실패|오류|없습니다|않|불가|초과)/.test(msg) ? "error" : "info");
  const t: ToastItem = { id: ++toastSeq, msg, kind: k };
  toastListeners.forEach((l) => l(t));
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => {
    const l = (t: ToastItem) => {
      setItems((xs) => [...xs, t]);
      setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== t.id)), 3200);
    };
    toastListeners.push(l);
    // 네이티브 alert를 토스트로 대체(기존 alert() 호출부 그대로 동작).
    const origAlert = window.alert;
    window.alert = (msg?: unknown) => toast(String(msg ?? ""));
    return () => {
      toastListeners = toastListeners.filter((x) => x !== l);
      window.alert = origAlert;
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex flex-col items-end gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto max-w-sm rounded-lg border px-4 py-2.5 text-sm shadow-lg",
            t.kind === "error"
              ? "border-st-danger/30 bg-st-danger-bg text-st-danger"
              : "border-line bg-surface text-fg",
          )}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ───────────────────────── Confirm (confirm 대체) ─────────────────────────
type ConfirmState = { msg: string; resolve: (v: boolean) => void } | null;
let confirmListener: ((s: ConfirmState) => void) | null = null;

/** await confirm("…") → 사용자가 확인/취소. 호스트 미마운트 시 네이티브 폴백. */
export function confirm(msg: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!confirmListener) {
      resolve(typeof window !== "undefined" ? window.confirm(msg) : false);
      return;
    }
    confirmListener({ msg, resolve });
  });
}

export function ConfirmHost() {
  const [state, setState] = useState<ConfirmState>(null);
  useEffect(() => {
    confirmListener = setState;
    return () => { confirmListener = null; };
  }, []);

  if (!state) return null;
  const done = (v: boolean) => { state.resolve(v); setState(null); };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/40 p-4" onClick={() => done(false)}>
      <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm text-fg">{state.msg}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => done(false)}>취소</Button>
          <Button onClick={() => done(true)}>확인</Button>
        </div>
      </div>
    </div>
  );
}

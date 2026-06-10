"use client";

import { useEffect, useState } from "react";

/** 무료 서버 콜드스타트 동안 표시되는 안내 배너 (api()가 쏘는 api-warming 이벤트 구독). */
export function WakeBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const on = (e: Event) => setShow((e as CustomEvent<boolean>).detail);
    window.addEventListener("api-warming", on);
    return () => window.removeEventListener("api-warming", on);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[85] flex items-center justify-center gap-2 bg-primary px-4 py-2 text-sm text-primary-fg shadow-md">
      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-fg/40 border-t-primary-fg" />
      무료 서버를 깨우는 중입니다… 최대 1분 정도 걸릴 수 있어요. 잠시만 기다려 주세요.
    </div>
  );
}

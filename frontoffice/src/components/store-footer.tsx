"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// config(/api/config) 미응답 시에도 항상 보이도록 기본값 폴백(시드와 동일).
const DEFAULTS: Record<string, string> = {
  "footer.notice": "이 사이트는 포트폴리오용 데모입니다. 실제 판매·결제가 이루어지지 않습니다.",
  "footer.email": "uxin0119@naver.com",
  "footer.copyright": "© 2026 생활잡화 스토어 — Portfolio by 유신",
};

export function StoreFooter() {
  const [cfg, setCfg] = useState<Record<string, string>>(DEFAULTS);

  useEffect(() => {
    api<Record<string, string>>("/api/config")
      .then((c) => setCfg({ ...DEFAULTS, ...c }))
      .catch(() => {});
  }, []);

  const email = cfg["footer.email"];

  return (
    <footer className="mt-12 border-t border-line bg-surface-2/40">
      <div className="mx-auto max-w-5xl space-y-1.5 px-4 py-8 text-sm text-subtle">
        <p className="font-semibold text-fg">생활잡화 스토어</p>
        <p>{cfg["footer.notice"]}</p>
        {email && (
          <p>
            문의:{" "}
            <a href={`mailto:${email}`} className="text-primary hover:underline">{email}</a>
          </p>
        )}
        <p className="pt-2 text-xs">{cfg["footer.copyright"]}</p>
      </div>
    </footer>
  );
}

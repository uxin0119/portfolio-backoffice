"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// 프론트오피스 푸터와 동일한 site_config(/api/config) 사용. 미응답 시 기본값 폴백.
const DEFAULTS: Record<string, string> = {
  "footer.notice": "이 사이트는 포트폴리오용 데모입니다. 실제 판매·결제가 이루어지지 않습니다.",
  "footer.email": "uxin0119@naver.com",
  "footer.copyright": "© 2026 생활잡화 스토어 — Portfolio by 유신",
};

export function AdminFooter() {
  const [cfg, setCfg] = useState<Record<string, string>>(DEFAULTS);

  useEffect(() => {
    api<Record<string, string>>("/api/config")
      .then((c) => setCfg({ ...DEFAULTS, ...c }))
      .catch(() => {});
  }, []);

  const email = cfg["footer.email"];

  return (
    <footer className="border-t border-line px-4 py-6 text-xs text-subtle lg:px-6">
      <p>{cfg["footer.notice"]}</p>
      {email && (
        <p className="mt-0.5">
          문의:{" "}
          <a href={`mailto:${email}`} className="text-primary hover:underline">{email}</a>
        </p>
      )}
      <p className="mt-1">{cfg["footer.copyright"]}</p>
    </footer>
  );
}

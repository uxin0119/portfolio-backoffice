"use client";

// 백오피스 로그인 — /api/auth/login 연동(우회계정 test/1). 실패해도 데모 진입은 막지 않음.
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const m = await api<{ token: string; name: string; role?: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ loginId, password }),
      });
      if (m.role === "BUYER") {
        alert("백오피스 접근 권한이 없습니다. (구매자 계정)");
        setBusy(false);
        return;
      }
      try {
        localStorage.setItem("bo_auth", JSON.stringify(m));
      } catch {}
      router.push("/");
    } catch (err) {
      alert("로그인 실패: " + err);
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* 브랜드 패널 (로렘입숨 placeholder) */}
      <div className="relative hidden flex-col justify-between bg-primary p-10 text-primary-fg lg:flex">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/20 text-sm font-bold">B</span>
          <span className="font-semibold">포트폴리오 백오피스</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold leading-snug">
            매일 쓰는 실무 관리 시스템
          </h2>
          <p className="mt-3 max-w-sm text-sm text-primary-fg/80">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 상품·거래처·주문·재고를
            한 화면에서. (브랜딩 카피 placeholder)
          </p>
        </div>
        <p className="text-xs text-primary-fg/60">© 2026 portfolio-backoffice</p>
      </div>

      {/* 로그인 폼 */}
      <div className="flex flex-col">
        <div className="flex justify-end p-4">
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <form onSubmit={submit} className="w-full max-w-sm space-y-5">
            <div>
              <h1 className="text-xl font-bold text-fg">로그인</h1>
              <p className="mt-1 text-sm text-subtle">운영자 계정으로 로그인하세요</p>
            </div>
            <Field label="아이디">
              <Input value={loginId} onChange={(e) => setLoginId(e.target.value)} placeholder="admin" autoFocus />
            </Field>
            <Field label="비밀번호">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </Field>
            <Button type="submit" className="w-full" disabled={busy}>{busy ? "확인 중…" : "로그인"}</Button>
            <p className="text-center text-xs text-subtle">
              우회 계정 — 아이디 <b>test</b> / 비밀번호 <b>1</b>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

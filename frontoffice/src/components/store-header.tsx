"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { IconOrder } from "@/components/icons";

// 백오피스(관리자)는 별도 배포라 외부 링크. NEXT_PUBLIC_BACKOFFICE_URL로 override 가능.
const BACKOFFICE_URL =
  process.env.NEXT_PUBLIC_BACKOFFICE_URL ?? "https://portfolio-backoffice-pi.vercel.app";

export function StoreHeader() {
  const { count } = useCart();
  const { member, logout } = useAuth();
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-fg">S</span>
          <span className="text-sm font-semibold text-fg">생활잡화 스토어</span>
        </Link>
        <nav className="ml-2 hidden items-center gap-1 text-sm sm:flex">
          <Link href="/products" className="rounded-lg px-2 py-1 text-subtle hover:bg-surface-2 hover:text-fg">상품</Link>
          <a href={BACKOFFICE_URL} target="_blank" rel="noreferrer" className="rounded-lg px-2 py-1 text-subtle hover:bg-surface-2 hover:text-fg">🛠 백오피스</a>
        </nav>
        <div className="flex-1" />
        <ThemeToggle />

        {member ? (
          <div className="flex items-center gap-1 text-sm">
            <Link href="/mypage" className="rounded-lg px-2 py-1 font-medium text-fg hover:bg-surface-2">{member.name}님</Link>
            <button type="button" onClick={logout} className="rounded-lg px-2 py-1 text-subtle hover:bg-surface-2 hover:text-fg">로그아웃</button>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-sm">
            <Link href="/login" className="rounded-lg px-2 py-1 text-subtle hover:bg-surface-2 hover:text-fg">로그인</Link>
            <Link href="/signup" className="rounded-lg px-2 py-1 text-subtle hover:bg-surface-2 hover:text-fg">회원가입</Link>
          </div>
        )}

        <Link href="/cart" className="relative inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-fg hover:bg-surface-2">
          <IconOrder className="h-[18px] w-[18px]" />
          <span className="hidden sm:inline">장바구니</span>
          {count > 0 && (
            <span className="ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-fg">{count}</span>
          )}
        </Link>
      </div>
    </header>
  );
}

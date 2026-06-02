"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { IconLogout, IconMenu } from "@/components/icons";

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    try {
      localStorage.removeItem("bo_auth");
    } catch {}
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-60 shrink-0 border-r border-line bg-surface",
          "flex flex-col transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-line px-5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-fg text-sm font-bold">
            B
          </span>
          <span className="text-sm font-semibold text-fg">백오피스</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV.map(({ href, label, Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary-weak text-primary"
                    : "text-subtle hover:bg-surface-2 hover:text-fg",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line p-3">
          <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-subtle transition-colors hover:bg-surface-2 hover:text-fg">
            <IconLogout className="h-[18px] w-[18px]" />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-surface/80 px-4 backdrop-blur lg:px-6">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 px-0 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="메뉴 열기"
          >
            <IconMenu />
          </Button>
          <div className="flex-1" />
          <ThemeToggle />
          <div className="flex items-center gap-2 pl-1">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-fg">
              운영
            </span>
            <span className="hidden text-sm text-subtle sm:block">운영자</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

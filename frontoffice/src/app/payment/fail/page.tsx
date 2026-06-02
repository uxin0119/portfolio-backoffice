"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function FailInner() {
  const sp = useSearchParams();
  const message = sp.get("message") ?? "결제가 취소되었거나 실패했습니다.";
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-st-danger-bg text-2xl text-st-danger">!</div>
      <h1 className="text-xl font-bold text-fg">결제 실패</h1>
      <p className="mt-2 text-sm text-subtle">{message}</p>
      <Link href="/cart" className="mt-6 inline-block"><Button variant="secondary">장바구니로 돌아가기</Button></Link>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-subtle">로딩…</div>}>
      <FailInner />
    </Suspense>
  );
}

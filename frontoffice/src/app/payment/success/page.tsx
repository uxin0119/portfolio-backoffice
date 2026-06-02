"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { buttonClass } from "@/components/ui/button";

function SuccessInner() {
  const sp = useSearchParams();
  const { clear } = useCart();
  const [state, setState] = useState<"loading" | "ok" | "fail">("loading");
  const [msg, setMsg] = useState("");
  const orderId = sp.get("orderId");

  useEffect(() => {
    const paymentKey = sp.get("paymentKey") ?? "demo";
    const amount = Number(sp.get("amount") ?? 0);
    api<{ status: string; message?: string }>("/api/payments/confirm", {
      method: "POST",
      body: JSON.stringify({ paymentKey, orderId, amount }),
    })
      .then((r) => {
        setState("ok");
        setMsg(r.message ?? r.status);
        clear(); // 결제 확정 후 장바구니 비움 (실패 시 장바구니 유지)
      })
      .catch((e) => {
        setState("fail");
        setMsg(String(e));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp, orderId]);

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      {state === "loading" && <p className="text-subtle">결제 확인 중…</p>}
      {state === "ok" && (
        <>
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-st-done-bg text-2xl text-st-done">✓</div>
          <h1 className="text-xl font-bold text-fg">결제가 완료되었습니다</h1>
          <p className="mt-2 text-sm text-subtle">주문번호 {orderId}</p>
          <p className="mt-1 text-xs text-subtle">{msg}</p>
        </>
      )}
      {state === "fail" && (
        <>
          <h1 className="text-xl font-bold text-st-danger">결제 확인 실패</h1>
          <p className="mt-2 text-sm text-subtle">{msg}</p>
        </>
      )}
      <Link href="/" className={buttonClass("secondary", "md", "mt-6")}>계속 쇼핑하기</Link>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-subtle">로딩…</div>}>
      <SuccessInner />
    </Suspense>
  );
}

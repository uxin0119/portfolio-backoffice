"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { api, won } from "@/lib/api";
import { TOSS_CLIENT_KEY } from "@/lib/toss";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

type CreatedOrder = { id: number; orderNo: string; totalAmount: number };

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total } = useCart();
  const { member } = useAuth();
  const [name, setName] = useState(member?.name ?? "");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);

  function validate() {
    if (items.length === 0) return false;
    if (!name.trim()) {
      alert("주문자 이름을 입력하세요.");
      return false;
    }
    return true;
  }

  async function createOrder(): Promise<CreatedOrder> {
    const customer = await api<{ id: number }>("/api/customers", {
      method: "POST",
      body: JSON.stringify({ name, grade: "일반", contact: contact || null }),
    });
    return api<CreatedOrder>("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        customerId: customer.id,
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
      }),
    });
  }

  // 토스페이먼츠 결제창
  async function payToss() {
    if (!validate()) return;
    setBusy(true);
    try {
      const order = await createOrder();
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: ANONYMOUS });
      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: order.totalAmount },
        orderId: order.orderNo,
        orderName: items[0].name + (items.length > 1 ? ` 외 ${items.length - 1}건` : ""),
        successUrl: window.location.origin + "/payment/success",
        failUrl: window.location.origin + "/payment/fail",
      });
    } catch (err) {
      alert("결제 시작 실패: " + err);
      setBusy(false);
    }
  }

  // 데모 간편결제(토스 키 없이도 흐름 완료)
  async function payDemo() {
    if (!validate()) return;
    setBusy(true);
    try {
      const order = await createOrder();
      router.push(
        `/payment/success?orderId=${encodeURIComponent(order.orderNo)}&amount=${order.totalAmount}&paymentKey=demo`,
      );
    } catch (err) {
      alert("주문 실패: " + err);
      setBusy(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-6">
        <h1 className="mb-5 text-xl font-bold text-fg">주문/결제</h1>
        <Card>
          <CardBody className="py-12 text-center text-subtle">
            장바구니가 비어 있습니다. <Link href="/" className="text-primary">상품 보러가기</Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="mb-5 text-xl font-bold text-fg">주문/결제</h1>
      <div className="space-y-4">
        <Card>
          <CardHeader title="주문자 정보" />
          <CardBody className="space-y-3">
            <Field label="이름"><Input value={name} onChange={(e) => setName(e.target.value)} required /></Field>
            <Field label="연락처"><Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="010-0000-0000" /></Field>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="주문 상품" />
          <CardBody className="space-y-2">
            {items.map((it) => (
              <div key={it.productId} className="flex justify-between text-sm">
                <span className="text-fg">{it.name} × {it.qty}</span>
                <span className="tabular-nums text-fg">{won(it.price * it.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-line pt-2 font-semibold">
              <span className="text-fg">합계</span>
              <span className="tabular-nums text-fg">{won(total)}</span>
            </div>
          </CardBody>
        </Card>
        <Button className="w-full" disabled={busy} onClick={payToss}>
          {busy ? "처리 중…" : "토스페이먼츠로 결제"}
        </Button>
        <Button variant="secondary" className="w-full" disabled={busy} onClick={payDemo}>
          데모 간편결제 (토스 키 없이)
        </Button>
        <p className="text-center text-xs text-subtle">
          토스 결제는 본인 test client key가 필요합니다(미설정 시 데모 간편결제 이용).
        </p>
      </div>
    </div>
  );
}

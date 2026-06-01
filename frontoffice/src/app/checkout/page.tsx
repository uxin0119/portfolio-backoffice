"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { api, won } from "@/lib/api";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setBusy(true);
    try {
      const customer = await api<{ id: number }>("/api/customers", {
        method: "POST",
        body: JSON.stringify({ name, grade: "일반", contact: contact || null }),
      });
      const order = await api<{ orderNo: string }>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customerId: customer.id,
          items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        }),
      });
      setOrderNo(order.orderNo);
      clear();
    } catch (err) {
      alert("주문 실패: " + err);
    } finally {
      setBusy(false);
    }
  }

  if (orderNo) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-st-done-bg text-2xl text-st-done">
          ✓
        </div>
        <h1 className="text-xl font-bold text-fg">주문이 완료되었습니다</h1>
        <p className="mt-2 text-sm text-subtle">주문번호</p>
        <p className="text-lg font-semibold text-fg">{orderNo}</p>
        <Link href="/" className="mt-6 inline-block">
          <Button variant="secondary">계속 쇼핑하기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="mb-5 text-xl font-bold text-fg">주문/결제</h1>
      {items.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center text-subtle">
            장바구니가 비어 있습니다.{" "}
            <Link href="/" className="text-primary">상품 보러가기</Link>
          </CardBody>
        </Card>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Card>
            <CardHeader title="주문자 정보" />
            <CardBody className="space-y-3">
              <Field label="이름">
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </Field>
              <Field label="연락처">
                <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="010-0000-0000" />
              </Field>
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
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "처리 중…" : "주문 완료"}
          </Button>
        </form>
      )}
    </div>
  );
}

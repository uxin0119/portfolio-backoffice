"use client";

import { useEffect, useState } from "react";
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
  const [ship, setShip] = useState({
    recipientName: "",
    recipientPhone: "",
    postcode: "",
    address: "",
    addressDetail: "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof ship) => (e: { target: { value: string } }) =>
    setShip((s) => ({ ...s, [k]: e.target.value }));

  // 로그인 회원이면 저장된 연락처/주소로 배송지 자동 채움(비어 있는 칸만)
  useEffect(() => {
    if (!member) return;
    setShip((s) => ({
      recipientName: s.recipientName || member.name || "",
      recipientPhone: s.recipientPhone || member.phone || "",
      postcode: s.postcode || member.postcode || "",
      address: s.address || member.address || "",
      addressDetail: s.addressDetail || member.addressDetail || "",
    }));
  }, [member]);

  function validate() {
    if (items.length === 0) return false;
    if (!ship.recipientName.trim()) {
      alert("받는 분 이름을 입력하세요.");
      return false;
    }
    if (!ship.address.trim()) {
      alert("배송 주소를 입력하세요.");
      return false;
    }
    return true;
  }

  async function createOrder(): Promise<CreatedOrder> {
    const customer = await api<{ id: number }>("/api/customers", {
      method: "POST",
      body: JSON.stringify({ name: ship.recipientName, grade: "일반", contact: ship.recipientPhone || null }),
    });
    return api<CreatedOrder>("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        customerId: customer.id,
        memberId: member?.id ?? null,
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        recipientName: ship.recipientName,
        recipientPhone: ship.recipientPhone || null,
        postcode: ship.postcode || null,
        address: ship.address || null,
        addressDetail: ship.addressDetail || null,
      }),
    });
  }

  // 토스페이먼츠 결제창 (API 개별 연동)
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
        customerName: ship.recipientName,
      });
    } catch (err) {
      alert("결제 시작 실패: " + err);
      setBusy(false);
    }
  }

  // 데모 간편결제 (토스 키 없이도 흐름 완료)
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
          <CardHeader title="배송 정보" />
          <CardBody className="space-y-3">
            {member && (
              <p className="text-xs text-subtle">회원 정보로 자동 입력했어요. 필요하면 수정하세요.</p>
            )}
            <Field label="받는 분"><Input value={ship.recipientName} onChange={set("recipientName")} required /></Field>
            <Field label="연락처"><Input value={ship.recipientPhone} onChange={set("recipientPhone")} placeholder="010-0000-0000" /></Field>
            <Field label="우편번호"><Input value={ship.postcode} onChange={set("postcode")} placeholder="06234" /></Field>
            <Field label="기본주소"><Input value={ship.address} onChange={set("address")} placeholder="서울시 강남구 …" required /></Field>
            <Field label="상세주소"><Input value={ship.addressDetail} onChange={set("addressDetail")} placeholder="동/호수 등" /></Field>
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
          토스 결제창(API 개별 연동) 방식. 미설정 시 데모 간편결제 이용.
        </p>
      </div>
    </div>
  );
}

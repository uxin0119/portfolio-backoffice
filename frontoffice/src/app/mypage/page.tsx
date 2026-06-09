"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/roles";
import { useCodes } from "@/lib/codes";
import { api, won } from "@/lib/api";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

type OrderItem = {
  id: number;
  productName: string;
  qty: number;
  unitPrice: number;
  lineAmount: number;
};
type MyOrder = {
  id: number;
  orderNo: string;
  status: string;
  orderDate: string;
  totalAmount: number;
  items: OrderItem[];
  recipientName?: string | null;
  recipientPhone?: string | null;
  shipPostcode?: string | null;
  shipAddress?: string | null;
  shipAddressDetail?: string | null;
};

const STATUS: Record<string, { label: string; cls: string }> = {
  ACCEPTED: { label: "접수", cls: "text-primary" },
  SHIPPED: { label: "배송중", cls: "text-amber-600 dark:text-amber-400" },
  DONE: { label: "완료", cls: "text-emerald-600 dark:text-emerald-400" },
  CANCELLED: { label: "취소", cls: "text-subtle" },
};

function ProfileTab() {
  const { member, update } = useAuth();
  const [form, setForm] = useState({ email: "", phone: "", postcode: "", address: "", addressDetail: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (!member) return;
    setForm({
      email: member.email ?? "",
      phone: member.phone ?? "",
      postcode: member.postcode ?? "",
      address: member.address ?? "",
      addressDetail: member.addressDetail ?? "",
    });
  }, [member]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await update(form);
      alert("저장되었습니다.");
    } catch (err) {
      alert("저장 실패: " + err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader title="내 정보" />
      <CardBody>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="아이디"><Input value={member?.loginId ?? ""} disabled /></Field>
            <Field label="이름"><Input value={member?.name ?? ""} disabled /></Field>
          </div>
          <Field label="이메일"><Input type="email" value={form.email} onChange={set("email")} placeholder="hong@example.com" /></Field>
          <Field label="전화번호"><Input value={form.phone} onChange={set("phone")} placeholder="010-0000-0000" /></Field>
          <Field label="우편번호"><Input value={form.postcode} onChange={set("postcode")} placeholder="06234" /></Field>
          <Field label="기본주소"><Input value={form.address} onChange={set("address")} placeholder="서울시 강남구 …" /></Field>
          <Field label="상세주소"><Input value={form.addressDetail} onChange={set("addressDetail")} placeholder="동/호수 등" /></Field>
          <div className="flex justify-end">
            <Button type="submit" disabled={busy}>{busy ? "저장 중…" : "저장"}</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

function OrdersTab() {
  const { member } = useAuth();
  const { label: codeLabel } = useCodes();
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!member) return;
    try {
      setOrders(await api<MyOrder[]>(`/api/orders/my?memberId=${member.id}`));
      setErr(null);
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoaded(true);
    }
  }, [member]);
  useEffect(() => {
    load();
  }, [load]);

  if (err) {
    return <Card><CardBody className="text-sm text-st-danger">주문을 불러오지 못했습니다.</CardBody></Card>;
  }
  if (loaded && orders.length === 0) {
    return (
      <Card>
        <CardBody className="py-12 text-center text-subtle">
          주문 내역이 없습니다. <Link href="/products" className="text-primary">상품 보러가기</Link>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((o) => {
        const st = STATUS[o.status] ?? { label: o.status, cls: "text-subtle" };
        const addr = [o.shipPostcode ? `(${o.shipPostcode})` : "", o.shipAddress ?? "", o.shipAddressDetail ?? ""]
          .filter(Boolean)
          .join(" ");
        return (
          <Card key={o.id}>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-fg">{o.orderNo}</p>
                  <p className="text-xs text-subtle">{o.orderDate}</p>
                </div>
                <span className={`text-sm font-semibold ${st.cls}`}>{codeLabel("ORDER_STATUS", o.status, st.label)}</span>
              </div>

              <div className="space-y-1 border-t border-line pt-2">
                {o.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-sm">
                    <span className="text-fg">{it.productName} × {it.qty}</span>
                    <span className="tabular-nums text-subtle">{won(it.lineAmount)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between border-t border-line pt-2 text-sm font-semibold">
                <span className="text-fg">합계</span>
                <span className="tabular-nums text-fg">{won(o.totalAmount)}</span>
              </div>

              {(o.recipientName || addr) && (
                <p className="border-t border-line pt-2 text-xs text-subtle">
                  배송: {o.recipientName ?? "-"} {o.recipientPhone ? `· ${o.recipientPhone}` : ""}<br />
                  {addr || "-"}
                </p>
              )}
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}

export default function MyPage() {
  const { member } = useAuth();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<"profile" | "orders">("profile");

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!member) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="mb-4 text-subtle">로그인이 필요합니다.</p>
        <Link href="/login" className="text-primary">로그인하러 가기</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-5 flex items-center gap-2">
        <h1 className="text-xl font-bold text-fg">마이페이지</h1>
        {member.role && (
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-subtle">
            {ROLE_LABEL[member.role] ?? member.role}
          </span>
        )}
      </div>
      <p className="-mt-3 mb-5 text-sm text-subtle">{member.name}님, 반가워요</p>

      <div className="mb-5 inline-flex rounded-lg border border-line p-1 text-sm">
        <button
          type="button"
          onClick={() => setTab("profile")}
          className={`rounded-md px-4 py-1.5 font-medium ${tab === "profile" ? "bg-primary text-primary-fg" : "text-subtle hover:text-fg"}`}
        >
          내 정보
        </button>
        <button
          type="button"
          onClick={() => setTab("orders")}
          className={`rounded-md px-4 py-1.5 font-medium ${tab === "orders" ? "bg-primary text-primary-fg" : "text-subtle hover:text-fg"}`}
        >
          주문 내역
        </button>
      </div>

      {tab === "profile" ? <ProfileTab /> : <OrdersTab />}
    </div>
  );
}

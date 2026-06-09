"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, type StatusKey } from "@/components/ui/badge";
import { Field, Select, Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { api, won } from "@/lib/api";
import { useCodes } from "@/lib/codes";

type Order = {
  id: number;
  orderNo: string;
  customerName: string;
  status: StatusKey;
  orderDate: string;
  totalAmount: number;
  itemCount: number;
};
type Customer = { id: number; name: string };
type Product = { id: number; name: string; basePrice: number };
type Line = { productId: string; qty: string };

const STATUSES: StatusKey[] = ["ACCEPTED", "SHIPPED", "DONE", "CANCELLED"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState<Line[]>([{ productId: "", qty: "1" }]);
  const { label, options } = useCodes();

  const statusOptions = options("ORDER_STATUS").length
    ? options("ORDER_STATUS").map((c) => ({ value: c.code, text: c.name }))
    : STATUSES.map((s) => ({ value: s, text: label("ORDER_STATUS", s, s) }));

  async function load() {
    try {
      const [o, c, p] = await Promise.all([
        api<Order[]>("/api/orders"),
        api<Customer[]>("/api/customers"),
        api<Product[]>("/api/products"),
      ]);
      setOrders(o);
      setCustomers(c);
      setProducts(p);
      setErr(null);
    } catch (e) {
      setErr(String(e));
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    const items = lines
      .filter((l) => l.productId && Number(l.qty) > 0)
      .map((l) => ({ productId: Number(l.productId), qty: Number(l.qty) }));
    if (!customerId || items.length === 0) {
      alert("거래처와 상품을 선택하세요.");
      return;
    }
    setBusy(true);
    try {
      await api("/api/orders", {
        method: "POST",
        body: JSON.stringify({ customerId: Number(customerId), items }),
      });
      setCustomerId("");
      setLines([{ productId: "", qty: "1" }]);
      setOpen(false);
      load();
    } catch (e) {
      alert("주문 등록 실패: " + e);
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(id: number, status: string) {
    try {
      await api(`/api/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      load();
    } catch (e) {
      alert("상태 변경 실패(재고 부족 등): " + e);
    }
  }

  function setLine(i: number, k: keyof Line, v: string) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
  }

  return (
    <AppShell>
      <PageHeader
        title="주문"
        desc="발주 등록 · 상태 워크플로우(발송 시 재고 자동 차감)"
        action={<Button onClick={() => setOpen(true)}>+ 주문 등록</Button>}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="주문 등록" className="max-w-xl">
        <form onSubmit={create} className="space-y-3">
          <Field label="거래처" className="max-w-xs">
            <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
              <option value="">거래처 선택</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>

          <div className="space-y-2">
            {lines.map((l, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_120px_auto]">
                <Select value={l.productId} onChange={(e) => setLine(i, "productId", e.target.value)}>
                  <option value="">상품 선택</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({won(p.basePrice)})</option>
                  ))}
                </Select>
                <Input type="number" min={1} value={l.qty} onChange={(e) => setLine(i, "qty", e.target.value)} placeholder="수량" />
                <Button type="button" variant="ghost" size="sm"
                  onClick={() => setLines((ls) => ls.filter((_, idx) => idx !== i))}
                  disabled={lines.length === 1}>삭제</Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm"
              onClick={() => setLines((ls) => [...ls, { productId: "", qty: "1" }])}>+ 항목 추가</Button>
          </div>

          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={busy}>취소</Button>
            <Button type="submit" disabled={busy}>{busy ? "등록 중…" : "+ 주문 등록"}</Button>
          </div>
        </form>
      </Modal>

      {err && (
        <Card className="mb-4 border-st-danger/40">
          <CardBody className="text-sm text-st-danger">
            목록을 불러오지 못했습니다. 백엔드(8080) 확인.
            <span className="block text-xs text-subtle">{err}</span>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title={`주문 목록 (${orders.length})`} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-subtle">
                <th className="px-5 py-2.5 font-medium">주문번호</th>
                <th className="px-5 py-2.5 font-medium">고객</th>
                <th className="px-5 py-2.5 text-right font-medium">금액</th>
                <th className="px-5 py-2.5 text-right font-medium">항목</th>
                <th className="px-5 py-2.5 font-medium">상태</th>
                <th className="px-5 py-2.5 font-medium">상태 변경</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-line last:border-0 hover:bg-surface-2">
                  <td className="px-5 py-3 font-medium">
                    <Link href={`/orders/${o.id}`} className="text-primary hover:underline">{o.orderNo}</Link>
                  </td>
                  <td className="px-5 py-3 text-fg">{o.customerName}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-fg">{won(o.totalAmount)}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-subtle">{o.itemCount}</td>
                  <td className="px-5 py-3"><StatusBadge status={o.status} label={label("ORDER_STATUS", o.status)} /></td>
                  <td className="px-5 py-3">
                    <Select className="h-8 w-28" value={o.status}
                      onChange={(e) => changeStatus(o.id, e.target.value)}>
                      {statusOptions.map((s) => (<option key={s.value} value={s.value}>{s.text}</option>))}
                    </Select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-subtle">주문이 없습니다</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, type StatusKey } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import { api, won } from "@/lib/api";

type Item = {
  id: number;
  productId: number;
  productName: string;
  qty: number;
  unitPrice: number;
  lineAmount: number;
};
type OrderDetail = {
  id: number;
  orderNo: string;
  customerId: number;
  customerName: string;
  status: StatusKey;
  orderDate: string;
  totalAmount: number;
  items: Item[];
};

const STATUSES: StatusKey[] = ["ACCEPTED", "SHIPPED", "DONE", "CANCELLED"];

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setOrder(await api<OrderDetail>(`/api/orders/${id}`));
      setErr(null);
    } catch (e) {
      setErr(String(e));
    }
  }
  useEffect(() => {
    if (id) load();
  }, [id]);

  async function changeStatus(status: string) {
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

  return (
    <AppShell>
      <PageHeader
        title={order ? `주문 ${order.orderNo}` : "주문 상세"}
        desc="주문 항목 및 상태"
        action={
          <Link href="/orders">
            <Button variant="secondary" size="sm">← 목록으로</Button>
          </Link>
        }
      />

      {err && (
        <Card className="mb-4 border-st-danger/40">
          <CardBody className="text-sm text-st-danger">
            주문을 불러오지 못했습니다. 백엔드(8080) 확인.
            <span className="block text-xs text-subtle">{err}</span>
          </CardBody>
        </Card>
      )}

      {order && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="주문 항목" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-subtle">
                    <th className="px-5 py-2.5 font-medium">상품</th>
                    <th className="px-5 py-2.5 text-right font-medium">단가</th>
                    <th className="px-5 py-2.5 text-right font-medium">수량</th>
                    <th className="px-5 py-2.5 text-right font-medium">금액</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((it) => (
                    <tr key={it.id} className="border-b border-line last:border-0">
                      <td className="px-5 py-3 text-fg">{it.productName}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-subtle">{won(it.unitPrice)}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-fg">{it.qty}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-fg">{won(it.lineAmount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="px-5 py-3 text-right font-semibold text-fg">합계</td>
                    <td className="px-5 py-3 text-right text-base font-bold tabular-nums text-fg">{won(order.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader title="주문 정보" />
            <CardBody className="space-y-3 text-sm">
              <Row label="주문번호" value={order.orderNo} />
              <Row label="고객" value={order.customerName} />
              <Row label="주문일" value={order.orderDate} />
              <div className="flex items-center justify-between">
                <span className="text-subtle">상태</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="space-y-1 pt-2">
                <span className="text-xs font-medium text-subtle">상태 변경 (발송 시 재고 자동 차감)</span>
                <Select value={order.status} onChange={(e) => changeStatus(e.target.value)}>
                  {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
                </Select>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-subtle">{label}</span>
      <span className="font-medium text-fg">{value}</span>
    </div>
  );
}

"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/ui/table";
import { api } from "@/lib/api";

type Tx = {
  id: number;
  productName: string;
  type: "IN" | "OUT";
  qty: number;
  refOrderId?: number;
  memo?: string;
  createdAt?: string;
};
type Product = { id: number; name: string };

const EMPTY = { productId: "", type: "IN", qty: "", memo: "" };

export default function InventoryPage() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });

  async function load() {
    try {
      const [t, p] = await Promise.all([
        api<Tx[]>("/api/inventory"),
        api<Product[]>("/api/products"),
      ]);
      setTxs(t);
      setProducts(p);
      setErr(null);
    } catch (e) {
      setErr(String(e));
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function adjust(e: FormEvent) {
    e.preventDefault();
    if (!form.productId || Number(form.qty) <= 0) {
      alert("상품과 수량을 입력하세요.");
      return;
    }
    try {
      await api("/api/inventory/adjust", {
        method: "POST",
        body: JSON.stringify({
          productId: Number(form.productId),
          type: form.type,
          qty: Number(form.qty),
          memo: form.memo || null,
        }),
      });
      setForm({ ...EMPTY });
      load();
    } catch (e) {
      alert("입출고 실패(재고 부족 등): " + e);
    }
  }

  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const fmt = (s?: string) => (s ? s.replace("T", " ").slice(0, 16) : "-");

  const columns: Column<Tx>[] = [
    { key: "createdAt", header: "일시", sortValue: (t) => t.createdAt ?? "", render: (t) => <span className="tabular-nums text-subtle">{fmt(t.createdAt)}</span> },
    { key: "productName", header: "상품", sortValue: (t) => t.productName },
    { key: "type", header: "유형", render: (t) => <span className={t.type === "IN" ? "text-st-done" : "text-st-shipped"}>{t.type === "IN" ? "입고" : "출고"}</span> },
    { key: "qty", header: "수량", align: "right", sortValue: (t) => t.qty },
    { key: "refOrderId", header: "참조주문", render: (t) => <span className="text-subtle">{t.refOrderId ?? "-"}</span> },
    { key: "memo", header: "메모", render: (t) => <span className="text-subtle">{t.memo ?? "-"}</span> },
  ];

  return (
    <AppShell>
      <PageHeader title="재고" desc="입출고 등록 및 이력" />

      <Card className="mb-4">
        <CardHeader title="입출고 등록" />
        <CardBody>
          <form onSubmit={adjust} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="상품">
              <Select value={form.productId} onChange={set("productId")} required>
                <option value="">상품 선택</option>
                {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </Select>
            </Field>
            <Field label="유형">
              <Select value={form.type} onChange={set("type")}>
                <option value="IN">입고(IN)</option>
                <option value="OUT">출고(OUT)</option>
              </Select>
            </Field>
            <Field label="수량"><Input type="number" min={1} value={form.qty} onChange={set("qty")} /></Field>
            <Field label="메모"><Input value={form.memo} onChange={set("memo")} /></Field>
            <div className="sm:col-span-2 lg:col-span-4"><Button type="submit">+ 등록</Button></div>
          </form>
        </CardBody>
      </Card>

      {err && (
        <Card className="mb-4 border-st-danger/40">
          <CardBody className="text-sm text-st-danger">
            목록을 불러오지 못했습니다. 백엔드(8080) 확인.
            <span className="block text-xs text-subtle">{err}</span>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title={`입출고 이력 (${txs.length})`} />
        <DataTable columns={columns} data={txs} rowKey={(t) => t.id} empty="이력이 없습니다" />
      </Card>
    </AppShell>
  );
}

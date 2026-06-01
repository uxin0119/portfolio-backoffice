"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
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
            <div className="sm:col-span-2 lg:col-span-4">
              <Button type="submit">+ 등록</Button>
            </div>
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-subtle">
                <th className="px-5 py-2.5 font-medium">일시</th>
                <th className="px-5 py-2.5 font-medium">상품</th>
                <th className="px-5 py-2.5 font-medium">유형</th>
                <th className="px-5 py-2.5 text-right font-medium">수량</th>
                <th className="px-5 py-2.5 font-medium">참조주문</th>
                <th className="px-5 py-2.5 font-medium">메모</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t.id} className="border-b border-line last:border-0 hover:bg-surface-2">
                  <td className="px-5 py-3 tabular-nums text-subtle">{fmt(t.createdAt)}</td>
                  <td className="px-5 py-3 text-fg">{t.productName}</td>
                  <td className="px-5 py-3">
                    <span className={t.type === "IN" ? "text-st-done" : "text-st-shipped"}>
                      {t.type === "IN" ? "입고" : "출고"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-fg">{t.qty}</td>
                  <td className="px-5 py-3 text-subtle">{t.refOrderId ?? "-"}</td>
                  <td className="px-5 py-3 text-subtle">{t.memo ?? "-"}</td>
                </tr>
              ))}
              {txs.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-subtle">이력이 없습니다</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

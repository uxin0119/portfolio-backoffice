"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Field, Input } from "@/components/ui/input";
import { api, won } from "@/lib/api";

type Product = {
  id: number;
  sku: string;
  name: string;
  category?: string;
  basePrice: number;
  stockQty: number;
  safetyStock: number;
  status: string;
  lowStock: boolean;
};

const EMPTY = { sku: "", name: "", category: "", basePrice: "", stockQty: "", safetyStock: "" };

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });

  async function load() {
    try {
      setItems(await api<Product[]>("/api/products"));
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
    try {
      await api("/api/products", {
        method: "POST",
        body: JSON.stringify({
          sku: form.sku,
          name: form.name,
          category: form.category || null,
          basePrice: Number(form.basePrice || 0),
          stockQty: Number(form.stockQty || 0),
          safetyStock: Number(form.safetyStock || 0),
        }),
      });
      setForm({ ...EMPTY });
      load();
    } catch (e) {
      alert("등록 실패: " + e);
    }
  }

  async function remove(id: number) {
    if (!confirm("삭제할까요?")) return;
    await api(`/api/products/${id}`, { method: "DELETE" });
    load();
  }

  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <AppShell>
      <PageHeader title="상품" desc="재고 상품 목록 및 등록" />

      <Card className="mb-4">
        <CardHeader title="상품 등록" />
        <CardBody>
          <form onSubmit={create} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="SKU"><Input value={form.sku} onChange={set("sku")} required /></Field>
            <Field label="상품명"><Input value={form.name} onChange={set("name")} required /></Field>
            <Field label="카테고리"><Input value={form.category} onChange={set("category")} /></Field>
            <Field label="기준가(원)"><Input type="number" value={form.basePrice} onChange={set("basePrice")} /></Field>
            <Field label="재고수량"><Input type="number" value={form.stockQty} onChange={set("stockQty")} /></Field>
            <Field label="안전재고"><Input type="number" value={form.safetyStock} onChange={set("safetyStock")} /></Field>
            <div className="sm:col-span-2 lg:col-span-3">
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
        <CardHeader title={`상품 목록 (${items.length})`} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-subtle">
                <th className="px-5 py-2.5 font-medium">SKU</th>
                <th className="px-5 py-2.5 font-medium">상품명</th>
                <th className="px-5 py-2.5 font-medium">카테고리</th>
                <th className="px-5 py-2.5 text-right font-medium">기준가</th>
                <th className="px-5 py-2.5 text-right font-medium">재고 / 안전</th>
                <th className="px-5 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0 hover:bg-surface-2">
                  <td className="px-5 py-3 font-medium text-fg">{p.sku}</td>
                  <td className="px-5 py-3 text-fg">{p.name}</td>
                  <td className="px-5 py-3 text-subtle">{p.category ?? "-"}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-fg">{won(p.basePrice)}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="inline-flex items-center gap-2">
                      <span className="tabular-nums text-fg">{p.stockQty} / {p.safetyStock}</span>
                      {p.lowStock && <StatusBadge status="LOW_STOCK" />}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => remove(p.id)}>삭제</Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-subtle">상품이 없습니다</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

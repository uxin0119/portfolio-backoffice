"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Field, Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/ui/table";
import { api, won } from "@/lib/api";
import { productImageUrl } from "@/lib/img";

type Product = {
  id: number;
  sku: string;
  name: string;
  category?: string;
  basePrice: number;
  stockQty: number;
  safetyStock: number;
  status: string;
  imageUrl?: string;
  lowStock: boolean;
};

const EMPTY = { sku: "", name: "", category: "", basePrice: "", stockQty: "", safetyStock: "" };

// 폼을 분리 → 키 입력이 큰 목록(DataTable)을 리렌더하지 않음
function ProductForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({ ...EMPTY });
  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

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
      onCreated();
    } catch (e) {
      alert("등록 실패: " + e);
    }
  }

  return (
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
          <div className="sm:col-span-2 lg:col-span-3"><Button type="submit">+ 등록</Button></div>
        </form>
      </CardBody>
    </Card>
  );
}

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await api<Product[]>("/api/products"));
      setErr(null);
    } catch (e) {
      setErr(String(e));
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function remove(id: number) {
    if (!confirm("삭제할까요?")) return;
    await api(`/api/products/${id}`, { method: "DELETE" });
    load();
  }

  const columns: Column<Product>[] = [
    {
      key: "image", header: "",
      render: (p) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.imageUrl || productImageUrl(p.name, p.id)}
          alt={p.name}
          loading="lazy"
          className="h-9 w-9 rounded-md bg-surface-2 object-cover"
        />
      ),
    },
    { key: "sku", header: "SKU", sortValue: (p) => p.sku, render: (p) => <span className="font-medium text-fg">{p.sku}</span> },
    { key: "name", header: "상품명", sortValue: (p) => p.name },
    { key: "category", header: "카테고리", render: (p) => <span className="text-subtle">{p.category ?? "-"}</span> },
    { key: "basePrice", header: "기준가", align: "right", sortValue: (p) => p.basePrice, render: (p) => won(p.basePrice) },
    {
      key: "stock", header: "재고/안전", align: "right", sortValue: (p) => p.stockQty,
      render: (p) => (
        <span className="inline-flex items-center justify-end gap-2">
          <span className="tabular-nums">{p.stockQty} / {p.safetyStock}</span>
          {p.lowStock && <StatusBadge status="LOW_STOCK" />}
        </span>
      ),
    },
    { key: "actions", header: "", align: "right", render: (p) => <Button variant="ghost" size="sm" onClick={() => remove(p.id)}>삭제</Button> },
  ];

  return (
    <AppShell>
      <PageHeader title="상품" desc="재고 상품 목록 및 등록" />

      <ProductForm onCreated={load} />

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
        <DataTable columns={columns} data={items} rowKey={(p) => p.id} empty="상품이 없습니다" />
      </Card>
    </AppShell>
  );
}

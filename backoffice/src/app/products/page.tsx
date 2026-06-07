"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Field, Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
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
  tags?: string;
};

const EMPTY = { sku: "", name: "", category: "", tags: "", basePrice: "", stockQty: "", safetyStock: "" };

function ProductForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ ...EMPTY });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function create(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/products", {
        method: "POST",
        body: JSON.stringify({
          sku: form.sku,
          name: form.name,
          category: form.category || null,
          tags: form.tags || null,
          basePrice: Number(form.basePrice || 0),
          stockQty: Number(form.stockQty || 0),
          safetyStock: Number(form.safetyStock || 0),
        }),
      });
      setForm({ ...EMPTY });
      onCreated();
    } catch (e) {
      alert("등록 실패: " + e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={create} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label="SKU"><Input value={form.sku} onChange={set("sku")} required autoFocus /></Field>
      <Field label="상품명"><Input value={form.name} onChange={set("name")} required /></Field>
      <Field label="카테고리"><Input value={form.category} onChange={set("category")} /></Field>
      <Field label="태그(쉼표 구분)"><Input value={form.tags} onChange={set("tags")} placeholder="친환경,1인가구" /></Field>
      <Field label="기준가(원)"><Input type="number" value={form.basePrice} onChange={set("basePrice")} /></Field>
      <Field label="재고수량"><Input type="number" value={form.stockQty} onChange={set("stockQty")} /></Field>
      <Field label="안전재고"><Input type="number" value={form.safetyStock} onChange={set("safetyStock")} /></Field>
      <div className="mt-1 flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>취소</Button>
        <Button type="submit" disabled={busy}>{busy ? "등록 중…" : "+ 등록"}</Button>
      </div>
    </form>
  );
}

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

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
    { key: "tags", header: "태그", render: (p) => <span className="text-xs text-subtle">{p.tags ? p.tags.split(",").map((t) => "#" + t.trim()).join(" ") : "-"}</span> },
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
      <PageHeader
        title="상품"
        desc="재고 상품 목록 및 등록"
        action={<Button onClick={() => setOpen(true)}>+ 상품 등록</Button>}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="상품 등록">
        <ProductForm
          onCreated={() => {
            setOpen(false);
            load();
          }}
          onCancel={() => setOpen(false)}
        />
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
        <CardHeader title={`상품 목록 (${items.length})`} />
        <DataTable columns={columns} data={items} rowKey={(p) => p.id} empty="상품이 없습니다" />
      </Card>
    </AppShell>
  );
}

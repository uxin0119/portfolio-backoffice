"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { confirm } from "@/components/ui/feedback";
import { api } from "@/lib/api";

type Customer = {
  id: number;
  name: string;
  grade: string;
  contact?: string;
  status: string;
};

const EMPTY = { name: "", grade: "일반", contact: "" };

function CustomerForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ ...EMPTY });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function create(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/customers", {
        method: "POST",
        body: JSON.stringify({ name: form.name, grade: form.grade, contact: form.contact || null }),
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
      <Field label="이름"><Input value={form.name} onChange={set("name")} required autoFocus /></Field>
      <Field label="등급">
        <Select value={form.grade} onChange={set("grade")}>
          <option value="일반">일반</option>
          <option value="우수">우수</option>
          <option value="VIP">VIP</option>
        </Select>
      </Field>
      <Field label="연락처"><Input value={form.contact} onChange={set("contact")} placeholder="010-0000-0000" /></Field>
      <div className="mt-1 flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>취소</Button>
        <Button type="submit" disabled={busy}>{busy ? "등록 중…" : "+ 등록"}</Button>
      </div>
    </form>
  );
}

export default function CustomersPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await api<Customer[]>("/api/customers"));
      setErr(null);
    } catch (e) {
      setErr(String(e));
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function remove(id: number) {
    if (!(await confirm("삭제할까요?"))) return;
    await api(`/api/customers/${id}`, { method: "DELETE" });
    load();
  }

  const columns: Column<Customer>[] = [
    { key: "name", header: "이름", sortValue: (c) => c.name, render: (c) => <span className="font-medium text-fg">{c.name}</span> },
    { key: "grade", header: "등급", sortValue: (c) => c.grade },
    { key: "contact", header: "연락처", render: (c) => <span className="text-subtle">{c.contact ?? "-"}</span> },
    { key: "status", header: "상태", render: (c) => <span className="text-subtle">{c.status}</span> },
    { key: "actions", header: "", align: "right", render: (c) => <Button variant="ghost" size="sm" onClick={() => remove(c.id)}>삭제</Button> },
  ];

  return (
    <AppShell>
      <PageHeader
        title="거래처"
        desc="고객(소비자/회원) 목록 및 등록"
        action={<Button onClick={() => setOpen(true)}>+ 거래처 등록</Button>}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="거래처 등록">
        <CustomerForm
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
        <CardHeader title={`거래처 목록 (${items.length})`} />
        <DataTable columns={columns} data={items} rowKey={(c) => c.id} empty="거래처가 없습니다" />
      </Card>
    </AppShell>
  );
}

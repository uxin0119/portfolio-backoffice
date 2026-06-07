"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/ui/table";
import { api } from "@/lib/api";

type Member = {
  id: number;
  loginId: string;
  name: string;
  createdAt?: string;
  email?: string | null;
  phone?: string | null;
  postcode?: string | null;
  address?: string | null;
  addressDetail?: string | null;
};

const EMPTY = {
  loginId: "",
  password: "",
  name: "",
  email: "",
  phone: "",
  postcode: "",
  address: "",
  addressDetail: "",
};

function MemberForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({ ...EMPTY });
  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function create(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ ...EMPTY });
      onCreated();
    } catch (e) {
      alert("회원 등록 실패: " + e);
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader title="회원 등록" />
      <CardBody>
        <form onSubmit={create} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="아이디"><Input value={form.loginId} onChange={set("loginId")} required /></Field>
          <Field label="이름"><Input value={form.name} onChange={set("name")} /></Field>
          <Field label="비밀번호"><Input type="password" value={form.password} onChange={set("password")} required /></Field>
          <Field label="이메일"><Input type="email" value={form.email} onChange={set("email")} /></Field>
          <Field label="전화번호"><Input value={form.phone} onChange={set("phone")} placeholder="010-0000-0000" /></Field>
          <Field label="우편번호"><Input value={form.postcode} onChange={set("postcode")} /></Field>
          <Field label="기본주소"><Input value={form.address} onChange={set("address")} /></Field>
          <Field label="상세주소"><Input value={form.addressDetail} onChange={set("addressDetail")} /></Field>
          <div className="sm:col-span-3"><Button type="submit">+ 등록</Button></div>
        </form>
      </CardBody>
    </Card>
  );
}

export default function MembersPage() {
  const [items, setItems] = useState<Member[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await api<Member[]>("/api/members"));
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
    await api(`/api/members/${id}`, { method: "DELETE" });
    load();
  }

  const fullAddress = (m: Member) =>
    [m.postcode ? `(${m.postcode})` : "", m.address ?? "", m.addressDetail ?? ""]
      .filter(Boolean)
      .join(" ")
      .trim();

  const columns: Column<Member>[] = [
    { key: "id", header: "ID", align: "right", sortValue: (m) => m.id },
    { key: "loginId", header: "아이디", sortValue: (m) => m.loginId, render: (m) => <span className="font-medium text-fg">{m.loginId}</span> },
    { key: "name", header: "이름", sortValue: (m) => m.name },
    { key: "email", header: "이메일", render: (m) => <span className="text-subtle">{m.email || "-"}</span> },
    { key: "phone", header: "전화번호", render: (m) => <span className="text-subtle tabular-nums">{m.phone || "-"}</span> },
    { key: "address", header: "주소", render: (m) => <span className="text-subtle">{fullAddress(m) || "-"}</span> },
    { key: "createdAt", header: "가입일", render: (m) => <span className="text-subtle">{m.createdAt?.slice(0, 10) ?? "-"}</span> },
    { key: "actions", header: "", align: "right", render: (m) => <Button variant="ghost" size="sm" onClick={() => remove(m.id)}>삭제</Button> },
  ];

  return (
    <AppShell>
      <PageHeader title="회원" desc="가입 회원 목록 및 등록" />

      <MemberForm onCreated={load} />

      {err && (
        <Card className="mb-4 border-st-danger/40">
          <CardBody className="text-sm text-st-danger">
            목록을 불러오지 못했습니다. 백엔드(8080) 확인.
            <span className="block text-xs text-subtle">{err}</span>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title={`회원 목록 (${items.length})`} />
        <DataTable columns={columns} data={items} rowKey={(m) => m.id} empty="회원이 없습니다" />
      </Card>
    </AppShell>
  );
}

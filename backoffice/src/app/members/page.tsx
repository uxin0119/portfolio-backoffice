"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/ui/table";
import { api } from "@/lib/api";

type Member = { id: number; loginId: string; name: string; createdAt?: string };

const EMPTY = { loginId: "", password: "", name: "" };

export default function MembersPage() {
  const [items, setItems] = useState<Member[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });

  async function load() {
    try {
      setItems(await api<Member[]>("/api/members"));
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
      await api("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ loginId: form.loginId, password: form.password, name: form.name }),
      });
      setForm({ ...EMPTY });
      load();
    } catch (e) {
      alert("회원 등록 실패: " + e);
    }
  }

  async function remove(id: number) {
    if (!confirm("삭제할까요?")) return;
    await api(`/api/members/${id}`, { method: "DELETE" });
    load();
  }

  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const columns: Column<Member>[] = [
    { key: "id", header: "ID", align: "right", sortValue: (m) => m.id },
    { key: "loginId", header: "아이디", sortValue: (m) => m.loginId, render: (m) => <span className="font-medium text-fg">{m.loginId}</span> },
    { key: "name", header: "이름", sortValue: (m) => m.name },
    { key: "createdAt", header: "가입일", render: (m) => <span className="text-subtle">{m.createdAt?.slice(0, 10) ?? "-"}</span> },
    { key: "actions", header: "", align: "right", render: (m) => <Button variant="ghost" size="sm" onClick={() => remove(m.id)}>삭제</Button> },
  ];

  return (
    <AppShell>
      <PageHeader title="회원" desc="가입 회원 목록 및 등록" />

      <Card className="mb-4">
        <CardHeader title="회원 등록" />
        <CardBody>
          <form onSubmit={create} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="아이디"><Input value={form.loginId} onChange={set("loginId")} required /></Field>
            <Field label="이름"><Input value={form.name} onChange={set("name")} /></Field>
            <Field label="비밀번호"><Input type="password" value={form.password} onChange={set("password")} required /></Field>
            <div className="sm:col-span-3"><Button type="submit">+ 등록</Button></div>
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
        <CardHeader title={`회원 목록 (${items.length})`} />
        <DataTable columns={columns} data={items} rowKey={(m) => m.id} empty="회원이 없습니다" />
      </Card>
    </AppShell>
  );
}

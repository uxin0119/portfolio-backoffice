"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api";

type Code = {
  id: number;
  groupCode: string;
  code: string;
  name: string;
  sortOrder: number;
  active: boolean;
};

const GROUP_LABEL: Record<string, string> = {
  ORDER_STATUS: "주문상태",
  PRODUCT_STATUS: "상품상태",
  CUSTOMER_GRADE: "거래처등급",
  MEMBER_ROLE: "회원역할",
  INVENTORY_TYPE: "입출고유형",
};
const glabel = (g: string) => GROUP_LABEL[g] ?? g;

function CodeForm({
  initialGroup,
  editing,
  onSaved,
  onCancel,
}: {
  initialGroup: string;
  editing: Code | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const isEdit = !!editing;
  const [form, setForm] = useState({
    groupCode: editing?.groupCode ?? initialGroup ?? "",
    code: editing?.code ?? "",
    name: editing?.name ?? "",
    sortOrder: String(editing?.sortOrder ?? 0),
    active: editing ? (editing.active ? "Y" : "N") : "Y",
  });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (isEdit) {
        await api(`/api/codes/${editing!.id}`, {
          method: "PUT",
          body: JSON.stringify({ name: form.name, sortOrder: Number(form.sortOrder || 0), active: form.active === "Y" }),
        });
      } else {
        await api("/api/codes", {
          method: "POST",
          body: JSON.stringify({
            groupCode: form.groupCode,
            code: form.code,
            name: form.name,
            sortOrder: Number(form.sortOrder || 0),
            active: form.active === "Y",
          }),
        });
      }
      onSaved();
    } catch (err) {
      alert("저장 실패: " + err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label="그룹코드">
        <Input value={isEdit ? form.groupCode : form.groupCode} onChange={set("groupCode")} disabled={isEdit} placeholder="ORDER_STATUS" required />
      </Field>
      <Field label="코드">
        <Input value={form.code} onChange={set("code")} disabled={isEdit} placeholder="ACCEPTED" required />
      </Field>
      <Field label="코드명(한글)"><Input value={form.name} onChange={set("name")} placeholder="접수" required autoFocus /></Field>
      <Field label="정렬"><Input type="number" value={form.sortOrder} onChange={set("sortOrder")} /></Field>
      <Field label="활성">
        <Select value={form.active} onChange={set("active")}>
          <option value="Y">활성</option>
          <option value="N">비활성</option>
        </Select>
      </Field>
      <div className="mt-1 flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>취소</Button>
        <Button type="submit" disabled={busy}>{busy ? "저장 중…" : isEdit ? "저장" : "+ 등록"}</Button>
      </div>
    </form>
  );
}

export default function CodesPage() {
  const [items, setItems] = useState<Code[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [group, setGroup] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Code | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await api<Code[]>("/api/codes"));
      setErr(null);
    } catch (e) {
      setErr(String(e));
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const groups = useMemo(() => Array.from(new Set(items.map((c) => c.groupCode))), [items]);
  useEffect(() => {
    if (!group && groups.length) setGroup(groups[0]);
  }, [groups, group]);

  const filtered = items.filter((c) => !group || c.groupCode === group);

  async function remove(c: Code) {
    if (!confirm(`'${c.name}'(${c.code}) 삭제할까요?`)) return;
    await api(`/api/codes/${c.id}`, { method: "DELETE" });
    load();
  }

  const columns: Column<Code>[] = [
    { key: "code", header: "코드", sortValue: (c) => c.code, render: (c) => <span className="font-medium text-fg">{c.code}</span> },
    { key: "name", header: "코드명", sortValue: (c) => c.name, render: (c) => <span className="text-fg">{c.name}</span> },
    { key: "sortOrder", header: "정렬", align: "right", sortValue: (c) => c.sortOrder },
    { key: "active", header: "활성", render: (c) => <span className={c.active ? "text-st-done" : "text-subtle"}>{c.active ? "활성" : "비활성"}</span> },
    {
      key: "actions", header: "", align: "right",
      render: (c) => (
        <span className="inline-flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => { setEditing(c); setOpen(true); }}>수정</Button>
          <Button variant="ghost" size="sm" onClick={() => remove(c)}>삭제</Button>
        </span>
      ),
    },
  ];

  return (
    <AppShell>
      <PageHeader
        title="공통코드"
        desc="상태·구분값을 한 곳에서 관리 (코드명 한글)"
        action={<Button onClick={() => { setEditing(null); setOpen(true); }}>+ 코드 등록</Button>}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "코드 수정" : "코드 등록"}>
        <CodeForm
          initialGroup={group}
          editing={editing}
          onSaved={() => { setOpen(false); load(); }}
          onCancel={() => setOpen(false)}
        />
      </Modal>

      {err && (
        <Card className="mb-4 border-st-danger/40">
          <CardBody className="text-sm text-st-danger">
            공통코드를 불러오지 못했습니다.
            <span className="block text-xs text-subtle">{err}</span>
          </CardBody>
        </Card>
      )}

      <div className="mb-4 max-w-xs">
        <Select value={group} onChange={(e) => setGroup(e.target.value)}>
          {groups.map((g) => (<option key={g} value={g}>{glabel(g)} ({g})</option>))}
        </Select>
      </div>

      <Card>
        <CardHeader title={`${glabel(group)} (${filtered.length})`} />
        <DataTable columns={columns} data={filtered} rowKey={(c) => c.id} empty="코드가 없습니다" />
      </Card>
    </AppShell>
  );
}

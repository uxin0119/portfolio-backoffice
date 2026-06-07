"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { api } from "@/lib/api";

const FIELDS = [
  { key: "footer.notice", label: "푸터 안내문" },
  { key: "footer.email", label: "문의 이메일" },
  { key: "footer.copyright", label: "카피라이트" },
];

export default function SettingsPage() {
  const [cfg, setCfg] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<Record<string, string>>("/api/config").then(setCfg).catch((e) => setErr(String(e)));
  }, []);

  const set = (k: string) => (e: { target: { value: string } }) =>
    setCfg((c) => ({ ...c, [k]: e.target.value }));

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      setCfg(await api<Record<string, string>>("/api/config", { method: "PUT", body: JSON.stringify(cfg) }));
      alert("저장되었습니다. (프론트오피스 푸터에 반영)");
    } catch (e) {
      alert("저장 실패: " + e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <PageHeader title="설정" desc="사이트 전역 설정 — 프론트오피스 푸터 문구 등" />

      {err && (
        <Card className="mb-4 border-st-danger/40">
          <CardBody className="text-sm text-st-danger">
            설정을 불러오지 못했습니다.
            <span className="block text-xs text-subtle">{err}</span>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="푸터" />
        <CardBody>
          <form onSubmit={save} className="space-y-4">
            {FIELDS.map((f) => (
              <Field key={f.key} label={f.label}>
                <Input value={cfg[f.key] ?? ""} onChange={set(f.key)} />
              </Field>
            ))}
            <div className="flex justify-end">
              <Button type="submit" disabled={busy}>{busy ? "저장 중…" : "저장"}</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </AppShell>
  );
}

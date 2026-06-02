"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await login(loginId, password);
      router.push("/");
    } catch (err) {
      alert("로그인 실패: " + err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <Card>
        <CardHeader title="로그인" />
        <CardBody>
          <form onSubmit={submit} className="space-y-4">
            <Field label="아이디"><Input value={loginId} onChange={(e) => setLoginId(e.target.value)} required autoFocus /></Field>
            <Field label="비밀번호"><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
            <Button type="submit" className="w-full" disabled={busy}>{busy ? "처리 중…" : "로그인"}</Button>
            <p className="text-center text-xs text-subtle">우회 계정 — 아이디 <b>test</b> / 비밀번호 <b>1</b></p>
            <p className="text-center text-sm text-subtle">
              계정이 없으신가요? <Link href="/signup" className="text-primary">회원가입</Link>
            </p>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

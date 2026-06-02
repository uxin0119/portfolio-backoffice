"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await signup(loginId, password, name);
      router.push("/");
    } catch (err) {
      alert("회원가입 실패: " + err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <Card>
        <CardHeader title="회원가입" />
        <CardBody>
          <form onSubmit={submit} className="space-y-4">
            <Field label="아이디"><Input value={loginId} onChange={(e) => setLoginId(e.target.value)} required autoFocus /></Field>
            <Field label="이름"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" /></Field>
            <Field label="비밀번호"><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
            <Button type="submit" className="w-full" disabled={busy}>{busy ? "처리 중…" : "가입하기"}</Button>
            <p className="text-center text-sm text-subtle">
              이미 계정이 있으신가요? <Link href="/login" className="text-primary">로그인</Link>
            </p>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

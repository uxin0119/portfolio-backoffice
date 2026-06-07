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
  const [form, setForm] = useState({
    loginId: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    postcode: "",
    address: "",
    addressDetail: "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await signup(form);
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
            <Field label="아이디"><Input value={form.loginId} onChange={set("loginId")} required autoFocus /></Field>
            <Field label="이름"><Input value={form.name} onChange={set("name")} placeholder="홍길동" /></Field>
            <Field label="비밀번호"><Input type="password" value={form.password} onChange={set("password")} required /></Field>

            <div className="border-t border-line pt-4">
              <p className="mb-3 text-sm font-medium text-fg">주문·배송 정보 <span className="text-subtle">(선택)</span></p>
              <div className="space-y-4">
                <Field label="이메일"><Input type="email" value={form.email} onChange={set("email")} placeholder="hong@example.com" /></Field>
                <Field label="전화번호"><Input value={form.phone} onChange={set("phone")} placeholder="010-0000-0000" /></Field>
                <Field label="우편번호"><Input value={form.postcode} onChange={set("postcode")} placeholder="06234" /></Field>
                <Field label="기본주소"><Input value={form.address} onChange={set("address")} placeholder="서울시 강남구 …" /></Field>
                <Field label="상세주소"><Input value={form.addressDetail} onChange={set("addressDetail")} placeholder="동/호수 등" /></Field>
              </div>
            </div>

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

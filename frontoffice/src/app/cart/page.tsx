"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { won } from "@/lib/api";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const { items, setQty, remove, total } = useCart();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-5 text-xl font-bold text-fg">장바구니</h1>

      {items.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center text-subtle">
            장바구니가 비어 있습니다.{" "}
            <Link href="/" className="text-primary">상품 보러가기</Link>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <Card key={it.productId}>
              <CardBody className="flex items-center gap-3">
                <div className="h-14 w-14 shrink-0 rounded-lg bg-surface-2" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-fg">{it.name}</p>
                  <p className="text-sm tabular-nums text-subtle">{won(it.price)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="secondary" size="sm" className="h-8 w-8 px-0"
                    onClick={() => setQty(it.productId, it.qty - 1)}>−</Button>
                  <span className="w-8 text-center text-sm tabular-nums">{it.qty}</span>
                  <Button variant="secondary" size="sm" className="h-8 w-8 px-0"
                    onClick={() => setQty(it.productId, it.qty + 1)}>+</Button>
                </div>
                <p className="hidden w-24 text-right text-sm font-semibold tabular-nums text-fg sm:block">
                  {won(it.price * it.qty)}
                </p>
                <Button variant="ghost" size="sm" onClick={() => remove(it.productId)}>삭제</Button>
              </CardBody>
            </Card>
          ))}

          <div className="flex items-center justify-between border-t border-line pt-4">
            <span className="text-sm text-subtle">합계</span>
            <span className="text-lg font-bold tabular-nums text-fg">{won(total)}</span>
          </div>
          <Link href="/checkout" className="block">
            <Button className="w-full">주문하기</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

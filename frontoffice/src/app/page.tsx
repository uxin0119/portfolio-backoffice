"use client";

import { useEffect, useState } from "react";
import { api, won } from "@/lib/api";
import { productImageUrl } from "@/lib/img";
import { useCart } from "@/lib/cart";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Product = {
  id: number;
  name: string;
  category?: string;
  basePrice: number;
  stockQty: number;
  status: string;
  imageUrl?: string;
};

export default function Catalog() {
  const [items, setItems] = useState<Product[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const { add } = useCart();

  useEffect(() => {
    api<Product[]>("/api/products")
      .then((ps) => setItems(ps.filter((p) => p.status === "ACTIVE")))
      .catch((e) => setErr(String(e)));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-1 text-xl font-bold text-fg">상품 둘러보기</h1>
      <p className="mb-5 text-sm text-subtle">마음에 드는 상품을 장바구니에 담아보세요</p>

      {err && (
        <p className="mb-4 text-sm text-st-danger">
          상품을 불러오지 못했습니다. 백엔드(8080) 실행 여부를 확인하세요.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => {
          const sold = p.stockQty <= 0;
          return (
            <Card key={p.id} className="flex flex-col overflow-hidden">
              <div className="aspect-square overflow-hidden bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl || productImageUrl(p.name, p.id)}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <CardBody className="flex flex-1 flex-col gap-2">
                <div className="flex-1">
                  <p className="text-xs text-subtle">{p.category ?? ""}</p>
                  <p className="line-clamp-2 text-sm font-medium text-fg">{p.name}</p>
                  <p className="mt-1 font-bold tabular-nums text-fg">{won(p.basePrice)}</p>
                </div>
                <Button
                  size="sm"
                  disabled={sold}
                  onClick={() =>
                    add({
                      productId: p.id,
                      name: p.name,
                      price: p.basePrice,
                      imageUrl: p.imageUrl || productImageUrl(p.name, p.id),
                    })
                  }
                >
                  {sold ? "품절" : "담기"}
                </Button>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {items.length === 0 && !err && (
        <p className="py-12 text-center text-subtle">상품이 없습니다</p>
      )}
    </div>
  );
}

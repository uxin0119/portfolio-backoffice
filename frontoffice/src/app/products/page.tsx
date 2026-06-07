"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ProductCard, type Product } from "@/components/product-card";

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [err, setErr] = useState<string | null>(null);

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
          상품을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>

      {items.length === 0 && !err && (
        <p className="py-12 text-center text-subtle">상품이 없습니다</p>
      )}
    </div>
  );
}

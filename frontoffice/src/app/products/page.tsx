"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { ProductCard, splitTags, type Product } from "@/components/product-card";

function chipClass(active: boolean) {
  return [
    "rounded-full border px-3 py-1 text-sm transition-colors",
    active
      ? "border-primary bg-primary text-primary-fg"
      : "border-line text-subtle hover:bg-surface-2 hover:text-fg",
  ].join(" ");
}

function ProductsInner() {
  const sp = useSearchParams();
  const category = sp.get("category") ?? "";
  const tag = sp.get("tag") ?? "";

  const [items, setItems] = useState<Product[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<Product[]>("/api/products")
      .then((ps) => setItems(ps.filter((p) => p.status === "ACTIVE")))
      .catch((e) => setErr(String(e)));
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(items.map((p) => p.category).filter(Boolean))) as string[],
    [items],
  );

  const filtered = items.filter((p) => {
    if (category && p.category !== category) return false;
    if (tag && !splitTags(p.tags).includes(tag)) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-1 text-xl font-bold text-fg">상품 둘러보기</h1>
      <p className="mb-4 text-sm text-subtle">카테고리·해시태그로 원하는 상품을 빠르게 찾아보세요</p>

      {/* 카테고리 칩 */}
      <div className="mb-3 flex flex-wrap gap-2">
        <Link href="/products" className={chipClass(!category && !tag)}>전체</Link>
        {categories.map((c) => (
          <Link key={c} href={`/products?category=${encodeURIComponent(c)}`} className={chipClass(category === c)}>
            {c}
          </Link>
        ))}
      </div>

      {/* 활성 해시태그 표시 */}
      {tag && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <span className="rounded-full bg-primary px-3 py-1 font-medium text-primary-fg">#{tag}</span>
          <Link href="/products" className="text-subtle hover:text-fg">✕ 필터 해제</Link>
        </div>
      )}

      {err && (
        <p className="mb-4 text-sm text-st-danger">상품을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>

      {filtered.length === 0 && !err && (
        <p className="py-12 text-center text-subtle">해당 조건의 상품이 없습니다</p>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsInner />
    </Suspense>
  );
}

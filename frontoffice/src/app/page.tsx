"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { buttonClass } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { ProductCard, type Product } from "@/components/product-card";

const PROMOS = [
  { emoji: "🎁", title: "신규가입 10% 쿠폰", desc: "지금 가입하고 첫 주문 할인받기" },
  { emoji: "🚚", title: "3만원 이상 무료배송", desc: "생활잡화 한 번에 채우기" },
  { emoji: "🔥", title: "이번 주 베스트 특가", desc: "인기 상품을 더 저렴하게" },
];

export default function Home() {
  const { member } = useAuth();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    api<Product[]>("/api/products")
      .then((ps) => {
        const active = ps.filter((p) => p.status === "ACTIVE");
        setFeatured(active.slice(0, 4));
        setCategories(Array.from(new Set(active.map((p) => p.category).filter(Boolean))) as string[]);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-6">
      {/* 히어로(광고영역) */}
      <section className="overflow-hidden rounded-2xl bg-primary px-6 py-12 text-primary-fg sm:px-10 sm:py-16">
        <p className="text-sm font-medium opacity-80">생활잡화 스토어</p>
        <h1 className="mt-2 max-w-xl text-2xl font-bold leading-snug sm:text-4xl">
          매일 쓰는 생활잡화,<br />가볍게 채우세요
        </h1>
        <p className="mt-3 max-w-md text-sm opacity-90 sm:text-base">
          주방·청소·욕실·반려까지. 필요한 잡화를 한 곳에서 합리적인 가격으로.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/products" className={buttonClass("secondary", "md", "!text-fg")}>
            상품 둘러보기
          </Link>
          {!member && (
            <Link href="/signup" className={buttonClass("ghost", "md", "!text-primary-fg hover:!bg-white/15")}>
              회원가입하고 쿠폰받기
            </Link>
          )}
        </div>
      </section>

      {/* 프로모션 배너 */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PROMOS.map((b) => (
          <Card key={b.title}>
            <CardBody className="flex items-start gap-3">
              <span className="text-2xl">{b.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-fg">{b.title}</p>
                <p className="mt-0.5 text-xs text-subtle">{b.desc}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </section>

      {/* 카테고리별 둘러보기 */}
      {categories.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-fg">카테고리별 둘러보기</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c}
                href={`/products?category=${encodeURIComponent(c)}`}
                className="rounded-full border border-line px-4 py-1.5 text-sm text-fg hover:border-primary hover:text-primary"
              >
                {c}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 추천 상품 미리보기 */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold text-fg">추천 상품</h2>
            <p className="text-sm text-subtle">지금 인기 있는 잡화를 골라봤어요</p>
          </div>
          <Link href="/products" className="text-sm font-medium text-primary hover:underline">
            전체 상품 보기 →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { won } from "@/lib/api";
import { productImageUrl } from "@/lib/img";
import { useCart } from "@/lib/cart";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type Product = {
  id: number;
  name: string;
  category?: string;
  tags?: string;
  basePrice: number;
  stockQty: number;
  status: string;
  imageUrl?: string;
};

export function splitTags(tags?: string): string[] {
  return (tags ?? "").split(",").map((t) => t.trim()).filter(Boolean);
}

/** 상품 카드 — 메인(추천) / 상품목록 페이지에서 공용. */
export function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const sold = p.stockQty <= 0;
  const img = p.imageUrl || productImageUrl(p.name, p.id);

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="aspect-square overflow-hidden bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
      </div>
      <CardBody className="flex flex-1 flex-col gap-2">
        <div className="flex-1">
          <p className="text-xs text-subtle">{p.category ?? ""}</p>
          <p className="line-clamp-2 text-sm font-medium text-fg">{p.name}</p>
          <p className="mt-1 font-bold tabular-nums text-fg">{won(p.basePrice)}</p>
          {splitTags(p.tags).length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5">
              {splitTags(p.tags).slice(0, 3).map((t) => (
                <Link
                  key={t}
                  href={`/products?tag=${encodeURIComponent(t)}`}
                  className="text-xs text-primary hover:underline"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}
        </div>
        <Button
          size="sm"
          disabled={sold}
          onClick={() => add({ productId: p.id, name: p.name, price: p.basePrice, imageUrl: img })}
        >
          {sold ? "품절" : "담기"}
        </Button>
      </CardBody>
    </Card>
  );
}

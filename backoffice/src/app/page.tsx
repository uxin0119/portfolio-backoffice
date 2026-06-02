"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge, type StatusKey } from "@/components/ui/badge";
import { api, won } from "@/lib/api";

type Dashboard = {
  kpi: {
    todayOrders: number;
    monthRevenue: number;
    lowStockCount: number;
    activeCustomers: number;
  };
  recentOrders: {
    id: number;
    orderNo: string;
    customerName: string;
    status: StatusKey;
    totalAmount: number;
  }[];
  lowStock: {
    id: number;
    name: string;
    sku: string;
    stockQty: number;
    safetyStock: number;
  }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<Dashboard>("/api/dashboard")
      .then(setData)
      .catch((e) => setErr(String(e)));
  }, []);

  const kpis = [
    { label: "오늘 주문", value: data ? `${data.kpi.todayOrders}` : "–", sub: "건" },
    { label: "이번 달 매출", value: data ? won(data.kpi.monthRevenue) : "–", sub: "" },
    { label: "재고 부족 상품", value: data ? `${data.kpi.lowStockCount}` : "–", sub: "종" },
    { label: "활성 거래처", value: data ? `${data.kpi.activeCustomers}` : "–", sub: "곳" },
  ];

  return (
    <AppShell>
      <PageHeader title="대시보드" desc="오늘의 운영 현황 요약" />

      {err && (
        <Card className="mb-4 border-st-danger/40">
          <CardBody className="text-sm text-st-danger">
            데이터를 불러오지 못했습니다. 백엔드(8080) 실행 여부를 확인하세요.
            <span className="block text-xs text-subtle">{err}</span>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardBody>
              <p className="text-sm text-subtle">{k.label}</p>
              <p className="mt-2 text-2xl font-bold text-fg">
                {k.value}
                {k.sub && (
                  <span className="ml-1 text-sm font-normal text-subtle">{k.sub}</span>
                )}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="최근 주문" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-subtle">
                  <th className="px-5 py-2.5 font-medium">주문번호</th>
                  <th className="px-5 py-2.5 font-medium">고객</th>
                  <th className="px-5 py-2.5 text-right font-medium">금액</th>
                  <th className="px-5 py-2.5 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-line last:border-0 hover:bg-surface-2">
                    <td className="px-5 py-3 font-medium text-fg">{o.orderNo}</td>
                    <td className="px-5 py-3 text-fg">{o.customerName}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-fg">{won(o.totalAmount)}</td>
                    <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
                {data && data.recentOrders.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-subtle">주문이 없습니다</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="재고 부족" action={<StatusBadge status="LOW_STOCK" />} />
          <CardBody className="space-y-3">
            {data?.lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-fg">{p.name}</p>
                  <p className="text-xs text-subtle">{p.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-st-danger tabular-nums">{p.stockQty}</p>
                  <p className="text-xs text-subtle tabular-nums">안전 {p.safetyStock}</p>
                </div>
              </div>
            ))}
            {data && data.lowStock.length === 0 && (
              <p className="py-6 text-center text-sm text-subtle">부족 상품 없음</p>
            )}
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}

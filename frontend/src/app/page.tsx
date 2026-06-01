import { AppShell } from "@/components/app-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge, type StatusKey } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const KPIS = [
  { label: "오늘 주문", value: "12", sub: "건" },
  { label: "이번 달 매출", value: "₩4,820,000", sub: "" },
  { label: "재고 부족 상품", value: "3", sub: "종" },
  { label: "활성 거래처", value: "48", sub: "곳" },
];

const RECENT: { no: string; customer: string; amount: string; status: StatusKey }[] =
  [
    { no: "ORD-240601-007", customer: "김민수", amount: "₩128,000", status: "ACCEPTED" },
    { no: "ORD-240601-006", customer: "이서연", amount: "₩54,000", status: "SHIPPED" },
    { no: "ORD-240601-005", customer: "박지훈", amount: "₩312,000", status: "DONE" },
    { no: "ORD-240601-004", customer: "최유진", amount: "₩47,500", status: "CANCELLED" },
    { no: "ORD-240601-003", customer: "정하늘", amount: "₩89,000", status: "SHIPPED" },
  ];

const LOW_STOCK = [
  { name: "친환경 수세미 3입", sku: "SKU-1042", qty: 4, safety: 20 },
  { name: "스테인리스 빨대 세트", sku: "SKU-2210", qty: 7, safety: 15 },
  { name: "면 행주 10매", sku: "SKU-0087", qty: 2, safety: 30 },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-fg">대시보드</h1>
          <p className="mt-0.5 text-sm text-subtle">오늘의 운영 현황 요약</p>
        </div>
        <Button>+ 주문 등록</Button>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((k) => (
          <Card key={k.label}>
            <CardBody>
              <p className="text-sm text-subtle">{k.label}</p>
              <p className="mt-2 text-2xl font-bold text-fg">
                {k.value}
                {k.sub && (
                  <span className="ml-1 text-sm font-normal text-subtle">
                    {k.sub}
                  </span>
                )}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* 최근 주문 + 재고 부족 */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="최근 주문"
            action={
              <Button variant="ghost" size="sm">
                전체 보기
              </Button>
            }
          />
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
                {RECENT.map((r) => (
                  <tr
                    key={r.no}
                    className="border-b border-line last:border-0 hover:bg-surface-2"
                  >
                    <td className="px-5 py-3 font-medium text-fg">{r.no}</td>
                    <td className="px-5 py-3 text-fg">{r.customer}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-fg">
                      {r.amount}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="재고 부족" action={<StatusBadge status="LOW_STOCK" />} />
          <CardBody className="space-y-3">
            {LOW_STOCK.map((p) => (
              <div
                key={p.sku}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-fg">
                    {p.name}
                  </p>
                  <p className="text-xs text-subtle">{p.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-st-danger tabular-nums">
                    {p.qty}
                  </p>
                  <p className="text-xs text-subtle tabular-nums">
                    안전 {p.safety}
                  </p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}

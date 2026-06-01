import { cn } from "@/lib/cn";

/** 주문 상태 + 재고부족 등 시그니처 상태색 매핑 */
export type StatusKey =
  | "ACCEPTED"
  | "SHIPPED"
  | "DONE"
  | "CANCELLED"
  | "LOW_STOCK";

const STATUS: Record<StatusKey, { label: string; cls: string }> = {
  ACCEPTED: { label: "접수", cls: "bg-st-accepted-bg text-st-accepted" },
  SHIPPED: { label: "발송", cls: "bg-st-shipped-bg text-st-shipped" },
  DONE: { label: "완료", cls: "bg-st-done-bg text-st-done" },
  CANCELLED: { label: "취소", cls: "bg-st-cancelled-bg text-st-cancelled" },
  LOW_STOCK: { label: "재고부족", cls: "bg-st-danger-bg text-st-danger" },
};

export function StatusBadge({ status }: { status: StatusKey }) {
  const s = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        s.cls,
      )}
    >
      {s.label}
    </span>
  );
}

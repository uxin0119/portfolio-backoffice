import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DataTable, type Column } from "./table";
import { StatusBadge, type StatusKey } from "./badge";

type Order = { id: number; orderNo: string; customer: string; amount: number; status: StatusKey };

const data: Order[] = [
  { id: 1, orderNo: "ORD-260601-001", customer: "김민수", amount: 128000, status: "ACCEPTED" },
  { id: 2, orderNo: "ORD-260601-002", customer: "이서연", amount: 54000, status: "SHIPPED" },
  { id: 3, orderNo: "ORD-260601-003", customer: "박지훈", amount: 312000, status: "DONE" },
];

const columns: Column<Order>[] = [
  { key: "orderNo", header: "주문번호", sortValue: (r) => r.orderNo },
  { key: "customer", header: "고객", sortValue: (r) => r.customer },
  { key: "amount", header: "금액", align: "right", sortValue: (r) => r.amount, render: (r) => "₩" + r.amount.toLocaleString() },
  { key: "status", header: "상태", render: (r) => <StatusBadge status={r.status} /> },
];

const meta = {
  title: "UI/DataTable",
  component: DataTable,
  parameters: { layout: "padded" },
} satisfies Meta<typeof DataTable>;

export default meta;

export const Basic: StoryObj = {
  render: () => <DataTable columns={columns} data={data} rowKey={(r) => (r as Order).id} />,
};

export const Empty: StoryObj = {
  render: () => <DataTable columns={columns} data={[]} rowKey={(r) => (r as Order).id} empty="주문이 없습니다" />,
};

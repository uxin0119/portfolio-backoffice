import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card, CardBody, CardHeader } from "./card";

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OrderSummary: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader title="주문 상품" />
      <CardBody className="space-y-2 text-sm">
        <div className="flex justify-between text-fg"><span>면 행주 10매 × 2</span><span className="tabular-nums">₩13,000</span></div>
        <div className="flex justify-between border-t border-line pt-2 font-semibold text-fg"><span>합계</span><span className="tabular-nums">₩13,000</span></div>
      </CardBody>
    </Card>
  ),
};

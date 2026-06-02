import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card, CardBody, CardHeader } from "./card";
import { Button } from "./button";

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Card className="w-80">
      <CardBody>
        <p className="text-sm text-subtle">이번 달 매출</p>
        <p className="mt-2 text-2xl font-bold text-fg">₩4,820,000</p>
      </CardBody>
    </Card>
  ),
};

export const WithHeader: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader
        title="최근 주문"
        action={
          <Button variant="ghost" size="sm">
            전체 보기
          </Button>
        }
      />
      <CardBody className="space-y-2 text-sm text-fg">
        <div className="flex justify-between">
          <span>ORD-240601-007</span>
          <span className="tabular-nums">₩128,000</span>
        </div>
        <div className="flex justify-between">
          <span>ORD-240601-006</span>
          <span className="tabular-nums">₩54,000</span>
        </div>
      </CardBody>
    </Card>
  ),
};

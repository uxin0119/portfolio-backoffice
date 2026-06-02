import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatusBadge, type StatusKey } from "./badge";

const meta = {
  title: "UI/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["ACCEPTED", "SHIPPED", "DONE", "CANCELLED", "LOW_STOCK"],
    },
  },
  args: { status: "ACCEPTED" },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Accepted: Story = { args: { status: "ACCEPTED" } };

const ALL: StatusKey[] = [
  "ACCEPTED",
  "SHIPPED",
  "DONE",
  "CANCELLED",
  "LOW_STOCK",
];

export const Gallery: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {ALL.map((s) => (
        <StatusBadge key={s} status={s} />
      ))}
    </div>
  ),
};

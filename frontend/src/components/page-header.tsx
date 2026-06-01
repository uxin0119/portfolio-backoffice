import type { ReactNode } from "react";

export function PageHeader({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-fg">{title}</h1>
        {desc && <p className="mt-0.5 text-sm text-subtle">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

/** Compact KPI card used across Orders, Tables, and the Dashboard. */
export function StatCard({ label, value, sub, icon, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 flex flex-col gap-1 relative overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        {icon && <span className="text-primary shrink-0">{icon}</span>}
      </div>
      <span className="text-2xl font-bold tracking-tight">{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

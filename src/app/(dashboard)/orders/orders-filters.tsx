"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  status: string;
  days: number;
  statusOptions: { value: string; label: string; count: number }[];
  dayOptions: { d: number; label: string }[];
};

export function OrdersFilters({ status, days, statusOptions, dayOptions }: Props) {
  const router = useRouter();
  const go = (s: string, d: number) =>
    router.push(`/orders?status=${s}&days=${d}`);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={status} onValueChange={(v) => go(v ?? "active", days)}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label} ({o.count})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={String(days)} onValueChange={(v) => go(status, Number(v ?? 1))}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {dayOptions.map((d) => (
            <SelectItem key={d.d} value={String(d.d)}>
              {d.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

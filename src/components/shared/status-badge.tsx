import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Props = {
  status: string;
  className?: string;
};

/**
 * Color-coded order status pill, consistent across dashboard, KDS and customer
 * surfaces. Colors and labels are driven by ORDER_STATUS_COLORS / _LABELS.
 */
export function StatusBadge({ status, className }: Props) {
  return (
    <Badge
      className={cn(
        ORDER_STATUS_COLORS[status] ?? "bg-muted text-muted-foreground",
        "border-0 text-xs font-semibold rounded-full",
        className
      )}
    >
      {ORDER_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

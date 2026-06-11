import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Action = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type Props = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: Action;
  /** Wrap in a bordered card surface. */
  card?: boolean;
  /** Smaller padding/icon for inline lists. */
  compact?: boolean;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  card,
  compact,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-8 px-4" : "py-16 px-4",
        card && "rounded-2xl border bg-card",
        className
      )}
    >
      <div
        className={cn(
          "rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4",
          compact ? "w-12 h-12" : "w-16 h-16"
        )}
      >
        {icon}
      </div>
      <h3 className={cn("font-semibold mb-1", compact ? "text-base" : "text-lg")}>
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {description}
        </p>
      )}
      {action &&
        (action.href ? (
          <Link href={action.href}>
            <Button size="lg">{action.label}</Button>
          </Link>
        ) : (
          <Button size="lg" onClick={action.onClick}>
            {action.label}
          </Button>
        ))}
    </div>
  );
}

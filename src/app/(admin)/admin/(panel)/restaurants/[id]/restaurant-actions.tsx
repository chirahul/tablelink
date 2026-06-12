"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setRestaurantActive } from "@/app/(admin)/actions";

export function RestaurantActions({
  id,
  name,
  isActive,
}: {
  id: string;
  name: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !isActive;
    if (!next && !confirm(`Suspend "${name}"? Their menu will go offline immediately.`)) {
      return;
    }
    startTransition(async () => {
      const res = await setRestaurantActive(id, next);
      if (res.success) toast.success(res.message ?? "Updated");
      else toast.error(res.error);
    });
  }

  return (
    <Button
      variant={isActive ? "outline" : "default"}
      size="sm"
      disabled={isPending}
      onClick={toggle}
      className="gap-1.5"
    >
      {isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
      {isPending ? "Saving…" : isActive ? "Suspend" : "Activate"}
    </Button>
  );
}

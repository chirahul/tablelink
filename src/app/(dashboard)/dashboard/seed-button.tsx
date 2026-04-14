"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { seedSampleData } from "../actions";

export function SeedButton() {
  const [isPending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const result = await seedSampleData();
      if (result.success) {
        toast.success(result.message || "Sample data added!");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button onClick={onClick} disabled={isPending} variant="outline">
      {isPending ? "Adding sample data..." : "Load sample menu (demo)"}
    </Button>
  );
}

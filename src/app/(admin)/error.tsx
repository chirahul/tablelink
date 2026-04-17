"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Admin error
        </h1>
        <p className="text-muted-foreground mb-6">
          Something went wrong loading this admin page.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}

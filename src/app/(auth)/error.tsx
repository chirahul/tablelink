"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center max-w-sm">
        <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Please try again or go back to the home page.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} size="sm">
            Try again
          </Button>
          <Link href="/">
            <Button variant="outline" size="sm">
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

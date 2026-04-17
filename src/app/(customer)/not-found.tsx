import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CustomerNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl font-bold tracking-tighter mb-4 text-muted-foreground/30">
          404
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2">
          Menu not found
        </h1>
        <p className="text-muted-foreground mb-6">
          This restaurant doesn&apos;t exist or is no longer available.
        </p>
        <Link href="/">
          <Button>Go to TableLink</Button>
        </Link>
      </div>
    </div>
  );
}

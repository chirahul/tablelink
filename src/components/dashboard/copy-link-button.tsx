"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyLinkButton({ url }: { url: string }) {
  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={async () => {
        try {
          if (navigator.share) {
            await navigator.share({ url });
          } else {
            await navigator.clipboard.writeText(url);
            toast.success("Menu link copied");
          }
        } catch {
          /* user cancelled share — ignore */
        }
      }}
    >
      <Share2 className="w-4 h-4" />
      Share
    </Button>
  );
}

"use client";

import { Plus } from "lucide-react";
import type { MenuItem } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { VegIndicator } from "./veg-indicator";

type Props = {
  item: MenuItem;
  onClick: () => void;
};

export function MenuItemCard({ item, onClick }: Props) {
  const unavailable = !item.is_available;

  return (
    <button
      onClick={onClick}
      disabled={unavailable}
      className={`w-full text-left p-4 rounded-2xl border bg-card hover:border-foreground/20 hover:shadow-md active:scale-[0.99] transition-all duration-200 flex gap-4 ${
        unavailable ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <VegIndicator isVeg={item.is_veg} />
          <h3 className="font-semibold truncate">{item.name}</h3>
        </div>
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2.5 leading-relaxed">
            {item.description}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold">{formatCurrency(item.price)}</span>
          {item.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] rounded-full">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt={item.name}
          className="w-24 h-24 object-cover rounded-xl shrink-0 shadow-sm"
        />
      ) : (
        <div className="w-24 h-24 bg-muted rounded-xl shrink-0 flex items-center justify-center">
          <Plus className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
    </button>
  );
}

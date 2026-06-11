"use client";

import { useEffect, useRef, useState } from "react";
import {
  Volume2,
  VolumeX,
  LayoutGrid,
  Table as TableIcon,
  Maximize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import { useKitchenOrders } from "@/hooks/use-kitchen-orders";
import { KitchenBoard } from "./kitchen-board";
import { KitchenTable } from "./kitchen-table";
import type { KitchenOrder } from "./order-ticket";

type Props = {
  restaurantId: string;
  initialOrders: KitchenOrder[];
};

type View = "board" | "table";
const VIEW_KEY = "tablelynk-kitchen-view";

export function KitchenView({ restaurantId, initialOrders }: Props) {
  const { orders, activeOrders, oldest, handleLocalUpdate, ordersByStatus, sound } =
    useKitchenOrders(restaurantId, initialOrders);

  const [view, setView] = useState<View>("table");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Restore saved view + track fullscreen state.
  useEffect(() => {
    const saved = localStorage.getItem(VIEW_KEY);
    if (saved === "board" || saved === "table") setView(saved);
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  function changeView(v: View) {
    setView(v);
    localStorage.setItem(VIEW_KEY, v);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen?.();
    }
  }

  const seg = (active: boolean) =>
    cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground"
    );

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar (excluded from the fullscreen element below) */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Kitchen Display</h1>
          <span className="text-sm text-muted-foreground">
            {activeOrders.length} active
            {oldest && (
              <>
                {" · oldest "}
                <span className="font-medium text-foreground">
                  {formatRelativeTime(oldest.created_at)}
                </span>
              </>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border p-0.5">
            <button onClick={() => changeView("table")} className={seg(view === "table")}>
              <TableIcon className="w-3.5 h-3.5" /> Table
            </button>
            <button onClick={() => changeView("board")} className={seg(view === "board")}>
              <LayoutGrid className="w-3.5 h-3.5" /> Board
            </button>
          </div>
          <Button
            variant={sound.enabled ? "default" : "outline"}
            size="sm"
            onClick={sound.enabled ? sound.play : sound.enable}
            aria-label={sound.enabled ? "Test sound" : "Enable sound"}
          >
            {sound.enabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen} className="gap-1">
            <Maximize className="w-4 h-4" /> Fullscreen
          </Button>
        </div>
      </div>

      {/* Fullscreen target — only this shows on the kitchen TV */}
      <div
        ref={containerRef}
        data-fullscreen={isFullscreen}
        className="flex-1 min-h-0 flex flex-col bg-background data-[fullscreen=true]:kds-tv data-[fullscreen=true]:p-6 data-[fullscreen=true]:overflow-auto"
      >
        {view === "board" ? (
          <KitchenBoard ordersByStatus={ordersByStatus} onLocalUpdate={handleLocalUpdate} />
        ) : (
          <KitchenTable orders={orders} onLocalUpdate={handleLocalUpdate} />
        )}
      </div>
    </div>
  );
}
